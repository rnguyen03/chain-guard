import type { VercelRequest, VercelResponse } from '@vercel/node';

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

// Allow prod + any chainguardia preview on Vercel + local dev
function isAllowedOrigin(origin = '') {
  if (!origin) return false;
  if (origin === 'http://localhost:5173') return true;
  if (origin === 'https://chainguardia.vercel.app') return true;
  // preview branches: https://chainguardia-<branch>-<hash>.vercel.app
  if (/^https:\/\/chainguardia(-[\w-]+)?\.vercel\.app$/.test(origin)) return true;
  return false;
}

function setCors(res: VercelResponse, origin?: string) {
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function toIsoMidnight(d: Date) {
  // NVD accepts ISO8601 with ms + Z; midnight is fine for start/end boundaries
  const z = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  return z.toISOString(); // e.g., 2025-10-04T00:00:00.000Z
}

type Severity = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
const severityRank: Record<Severity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin ?? '';
  if (req.method === 'OPTIONS') {
    setCors(res, origin);
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    setCors(res, origin);
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // -------- Input params (server-enforced defaults) --------
    const {
      keywordSearch = '',
      resultsPerPage = '20',
      // filter newer data by default (e.g., last 180 days)
      sinceDays = '180',
      // published | lastModified
      dateField = 'published',
      // LOW | MEDIUM | HIGH | CRITICAL  (we’ll filter post-fetch)
      severityMin = 'LOW',
      // true to exclude CVEs with vulnStatus === "Rejected"
      excludeRejected = 'true',
      startIndex = '0', // allow paging if you want to add a "Load more"
    } = req.query as Record<string, string>;

    const sinceDaysNum = Math.max(0, Number(sinceDays) || 180);
    const cutoff = new Date(Date.now() - sinceDaysNum * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams();
    params.set('resultsPerPage', String(resultsPerPage));
    params.set('startIndex', String(startIndex));

    if (keywordSearch.trim()) params.set('keywordSearch', keywordSearch.trim());

    // Choose which date field to filter on at the API level
    const endIso = toIsoMidnight(new Date()); // now (00:00Z today)
    const startIso = toIsoMidnight(cutoff);

    if (dateField === 'lastModified') {
      params.set('lastModStartDate', startIso);
      params.set('lastModEndDate', endIso);
    } else {
      params.set('pubStartDate', startIso);
      params.set('pubEndDate', endIso);
    }

    // -------- Fetch NVD (server-to-server) --------
    const upstream = await fetch(`${NVD_API_BASE}?${params.toString()}`, {
      // If you add an API key later, include it here:
      // headers: { apiKey: process.env.NVD_API_KEY! },
      // help prevent any intermediate caching surprises:
      cache: 'no-store',
    });

    setCors(res, origin);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      res.status(upstream.status).json({
        error: 'NVD upstream error',
        status: upstream.status,
        body: text,
        hint: 'Check NVD availability / parameters',
      });
      return;
    }

    const raw = await upstream.json();

    const vulns = Array.isArray(raw?.vulnerabilities) ? raw.vulnerabilities : [];

    // -------- Server-side filtering: severity, rejected, trimming fields --------
    const minRank = (severityRank[(severityMin.toUpperCase() as Severity)] ?? 1);

    const filtered = vulns
      .map((v: any) => v?.cve)
      .filter(Boolean)
      .filter((cve: any) => {
        // reject rejected
        if (excludeRejected === 'true' && String(cve?.vulnStatus || '').toLowerCase() === 'rejected') {
          return false;
        }
        // severity filter (fallback to LOW if missing)
        const sev = (cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ||
                     cve?.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity ||
                     'LOW') as Severity;
        return (severityRank[sev] ?? 1) >= minRank;
      })
      // return only the fields your UI needs
      .map((cve: any) => {
        const desc = cve?.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available';
        const cvss =
          cve?.metrics?.cvssMetricV31?.[0]?.cvssData ||
          cve?.metrics?.cvssMetricV30?.[0]?.cvssData ||
          null;

        const refs = Array.isArray(cve?.references) ? cve.references.map((r: any) => r.url).filter(Boolean) : [];

        return {
          id: cve?.id,
          published: cve?.published,
          lastModified: cve?.lastModified,
          vulnStatus: cve?.vulnStatus,           // "Analyzed", "Modified", "Rejected", etc.
          description: desc,
          cvss: cvss ? {
            baseScore: cvss.baseScore,
            baseSeverity: cvss.baseSeverity,
            vectorString: cvss.vectorString,
          } : null,
          references: refs,
        };
      });

    // Caching (edge) – safe for public data
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=300'); // 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');

    res.status(200).json({
      total: filtered.length,
      dateFilter: { field: dateField, sinceDays: sinceDaysNum, startIso: startIso, endIso: endIso },
      severityMin: severityMin.toUpperCase(),
      excludeRejected: excludeRejected === 'true',
      items: filtered,
    });
  } catch (err: any) {
    // Robust error surface (no silent reloads)
    setCors(res, req.headers.origin as string | undefined);
    res.status(500).json({
      error: 'Unhandled error in /api/nvd',
      message: err?.message ?? String(err),
      stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
    });
  }
}
