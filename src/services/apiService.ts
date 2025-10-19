import axios from 'axios';
import { Application } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE || '/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
});

export interface ApiApplication {
  _id: string;
  name: string;
  vendor: string;
  version?: string;
  category?: string;
  addedDate: string;
  createdAt: string;
  updatedAt: string;
}

// Convert MongoDB application to frontend format
const convertToFrontendApp = (apiApp: ApiApplication): Application => ({
  id: apiApp._id,
  name: apiApp.name,
  vendor: apiApp.vendor,
  version: apiApp.version,
  category: apiApp.category,
  addedDate: apiApp.addedDate,
});

let tokenProvider: null | (() => Promise<string | null>) = null;

export function setAuthTokenProvider(fn: () => Promise<string | null>) {
  tokenProvider = fn;
}

api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore; request will proceed unauthenticated
    }
  }
  return config;
});

// Convert frontend application to API format
const convertToApiApp = (app: Omit<Application, 'id' | 'addedDate'>) => ({
  name: app.name,
  vendor: app.vendor,
  version: app.version,
  category: app.category,
});

export const applicationApi = {
  // Get all applications
  async getAll(): Promise<Application[]> {
    const res = await api.get('/applications');
    // Handle both direct array response and wrapped response
    const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
    return data.map(convertToFrontendApp);
  },

  // Get single application
  async getById(id: string): Promise<Application> {
    const res = await api.get<ApiApplication>(`/applications/${id}`);
    return convertToFrontendApp(res.data);
  },

  // Create new application
  async create(app: Omit<Application, 'id' | 'addedDate'>, userId: string): Promise<Application> {
    const x = convertToApiApp(app);
    (x as any).userId = userId;
    console.log('📡 apiService.ts: Creating application with data:', x);
    const res = await api.post<ApiApplication>('/applications', x);
    return convertToFrontendApp(res.data);
  },

  // Bulk create applications
  async bulkCreate(apps: Omit<Application, 'id' | 'addedDate'>[]): Promise<Application[]> {
    const res = await api.post('/applications/bulk', apps.map(convertToApiApp));
    // Handle both direct array response and wrapped response
    const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
    return data.map(convertToFrontendApp);
  },

  // Update application
  async update(id: string, app: Partial<Omit<Application, 'id' | 'addedDate'>>): Promise<Application> {
    const res = await api.put<ApiApplication>(`/applications/${id}`, app);
    return convertToFrontendApp(res.data);
  },

  // Delete application
  async delete(id: string): Promise<void> {
    await api.delete(`/applications?id=${id}`);
  },

  // Delete all applications
  async deleteAll(): Promise<void> {
    await api.delete('/applications/all');
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string } | string> {
    const res = await api.get('/health');
    // Some backends return JSON, others plain text—support both.
    return typeof res.data === 'string' ? res.data : (res.data as { status: string; message: string });
  },
};