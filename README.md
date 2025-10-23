# ChainGuard 🛡️

> **Real-time supply chain security monitoring with AI-powered vulnerability intelligence**

## Overview

ChainGuard is a security dashboard that helps organizations proactively monitor their software inventory and identify vulnerabilities in real-time. The platform aggregates security data from multiple authoritative sources and uses AI to provide actionable insights, helping security teams respond to threats before they can be exploited.

Built in 36 hours during Hack the Valley X, ChainGuard addresses a critical gap in enterprise security: **continuous monitoring of third-party tools**. Even whitelisted applications can become attack vectors when vulnerabilities are discovered post-approval—and most organizations lack the infrastructure to detect these threats in real-time.

## The Problem

Modern organizations rely on dozens of third-party applications—Slack, Figma, Notion, browser extensions, and more. While these tools boost productivity, they also create a expanding attack surface. The challenge isn't just adoption; it's **continuous risk management**:

- **Whitelists don't update themselves**: A plugin that was safe last month might be compromised today
- **Startups lack monitoring resources**: Smaller teams can't track every app manually
- **Alert fatigue is real**: Security teams need contextualized, prioritized intelligence—not raw CVE dumps
- **Time-to-response is critical**: The window between vulnerability disclosure and exploitation is shrinking

During development, we consulted with a cybersecurity expert who confirmed this is one of the fastest-growing problems in the industry—with no reliable automated solution currently available.

**ChainGuard doesn't just detect attacks; it predicts them.**

## Key Features

### 🔍 Multi-Source Threat Intelligence
- Aggregates vulnerability data from **NIST NVD**, **CISA KEV**, and **GitHub Security Advisories**
- Real-time CVE monitoring with automatic inventory matching
- CVSS-based severity scoring (CRITICAL, HIGH, MEDIUM, LOW)

### 🤖 AI-Powered Analysis
- **Google Gemini AI** integration for intelligent vulnerability interpretation
- Transforms complex CVE data into clear, actionable summaries
- Technical impact assessments with confidence intervals
- Prioritized remediation recommendations ranked by likelihood and severity
- Non-technical explanations for cross-functional stakeholder communication

### 📊 Application Inventory Management
- Track software applications across your organization
- CSV bulk import for rapid onboarding
- Version tracking and categorization
- MongoDB persistence with user isolation

### 🔐 Enterprise Security
- **Auth0** authentication and authorization
- User-specific data isolation
- Secure API endpoints with JWT validation
- OAuth2 bearer token middleware

### � Real-Time Dashboard
- Live vulnerability statistics and trends
- Color-coded severity indicators
- Status tracking (Active, Acknowledged, Mitigated)
- Responsive design for desktop and mobile

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Lucide Icons

**Backend:**
- Vercel Serverless Functions
- MongoDB + Mongoose
- Auth0 (authentication)
- Google Gemini AI

**APIs & Services:**
- NIST NVD API 2.0
- CISA Known Exploited Vulnerabilities
- GitHub Security Advisories
- Google Generative AI API

**DevOps:**
- Vercel (deployment)
- Concurrent dev/server workflow
- TypeScript strict mode

## Quick Start

```bash
# Clone repository
git clone https://github.com/rnguyen03/chain-guard.git
cd chain-guard

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
# - MongoDB connection string
# - Auth0 credentials
# - Google Gemini API key

# Run Development Server (frontend + backend):
npm run dev      # Frontend (Vite)
vercel dev --port 3000   # Backend (Vercel Serverless)
```

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React     │─────▶│    Vercel        │─────▶│   MongoDB   │
│  Frontend   │      │ Serverless API   │      │  Database   │
└─────────────┘      └──────────────────┘      └─────────────┘
                            │
                            ├─────▶ NIST NVD API
                            ├─────▶ CISA KEV API  
                            ├─────▶ GitHub API
                            └─────▶ Google Gemini AI
```

## Project Structure

```
chain-guard/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API client services
│   └── types/             # TypeScript definitions
├── api/                   # Vercel Serverless Functions
│   ├── applications.ts   # Application CRUD endpoints
│   ├── vulnerabilities.ts # Vulnerability endpoints
│   └── security-feed.ts  # Security feed analysis
├── server/                # Shared backend utilities
│   ├── config/           # Database configuration
│   ├── models/           # Mongoose schemas
│   └── middleware/       # Auth middleware
└── public/               # Static assets
```

## Core Functionality

1. **Application Inventory**: Organizations add their software applications (manually or via CSV bulk import)
2. **Continuous Threat Monitoring**: Backend constantly pulls new intelligence from CVE databases, NIST advisories, and security feeds
3. **Intelligent Matching**: Automatically correlates published vulnerabilities with your application stack
4. **AI-Powered Risk Analysis**: Google Gemini evaluates technical impact, business context, and provides confidence scores
5. **Real-Time Alerts**: Security teams receive instant notifications when threats affect their tools
6. **Remediation Tracking**: Teams acknowledge alerts and track mitigation progress through resolution

**The key differentiator**: ChainGuard combines real-time data aggregation with AI reasoning to transform raw threat intelligence into digestible, actionable insights that even non-technical stakeholders can understand.

## Use Cases

- **Enterprise Security Teams**: Monitor organization-wide application vulnerabilities
- **DevSecOps**: Integrate security into CI/CD pipelines
- **Compliance**: Track and report on vulnerability remediation SLAs
- **Vendor Risk Management**: Monitor third-party software security

## Development Highlights

- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Serverless Architecture**: Edge-optimized Vercel Functions for instant scalability
- **Security First**: Auth0 integration, JWT validation, secure API design
- **Modern Stack**: React 18, Vercel Serverless, MongoDB 6, latest APIs
- **AI Integration**: Practical application of LLMs for contextual security analysis
- **Production Ready**: Zero-config deployment, environment configuration, error handling
- **Built in 36 hours**: Rapid prototyping with production-quality code architecture

## Technical Challenges Solved

**Serverless Integration**: Architected backend routes to work seamlessly with Vercel's serverless environment, handling API routing, authentication middleware, and deployment configurations.

**Multi-Source Data Aggregation**: Built robust pipelines to continuously fetch and normalize threat intelligence from disparate sources (NVD, CISA KEV, GitHub Advisories) with different schemas and rate limits.

**AI Context Engineering**: Designed prompts and data structures to help Gemini AI accurately interpret CVE technical data and generate actionable summaries with confidence intervals.

**Real-Time State Management**: Implemented efficient data flow between serverless backend, MongoDB persistence, and React frontend to ensure live updates without polling overhead.

---

**Built by Ryan Nguyen, Grayson Mongru & Shahmeer Shahid**  
*Hack the Valley X @ University of Toronto Scarborough*