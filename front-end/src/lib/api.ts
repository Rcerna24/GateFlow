import axios from 'axios';
import type {
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  VisitorPassPayload,
  VisitorPass,
  User,
  EntryLog,
  Incident,
  CreateIncidentPayload,
  SOSBroadcast,
  AnalyticsOverview,
  AdminEntryLog,
  AdminIncident,
  CreateSOSPayload,
  CreateEntryLogPayload,
  QrLookupResult,
  ResolveIncidentPayload,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gateflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gateflow_token');
      localStorage.removeItem('gateflow_user');
      // Only redirect if not already on a public page
      const publicPaths = ['/login', '/signup', '/visitor-pass', '/forgot-password', '/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (data: { firstName?: string; lastName?: string; contactNumber?: string }) =>
    api.patch<User>('/auth/profile', data).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<{ message: string; resetToken?: string; resetLink?: string }>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, newPassword }).then((r) => r.data),
};

// ─── Visitor Passes ──────────────────────────────────────

export const visitorPassApi = {
  create: (data: VisitorPassPayload) =>
    api.post<VisitorPass>('/visitor-passes', data).then((r) => r.data),

  findAll: () =>
    api.get<VisitorPass[]>('/visitor-passes').then((r) => r.data),

  findOne: (id: string) =>
    api.get<VisitorPass>(`/visitor-passes/${id}`).then((r) => r.data),

  approve: (id: string) =>
    api.patch<VisitorPass>(`/visitor-passes/${id}/approve`).then((r) => r.data),

  reject: (id: string) =>
    api.patch<VisitorPass>(`/visitor-passes/${id}/reject`).then((r) => r.data),
};

// ─── Entry Logs ──────────────────────────────────────────

export const entryLogsApi = {
  getMyEntries: () =>
    api.get<EntryLog[]>('/entry-logs/me').then((r) => r.data),

  /** Guard: scan QR to create entry/exit */
  scan: (data: CreateEntryLogPayload) =>
    api.post<EntryLog>('/entry-logs/scan', data).then((r) => r.data),

  /** Guard: look up user by QR token */
  lookupQr: (qrToken: string) =>
    api.get<QrLookupResult>(`/entry-logs/lookup/${qrToken}`).then((r) => r.data),

  /** Guard: get all recent logs */
  getRecent: () =>
    api.get<EntryLog[]>('/entry-logs/recent').then((r) => r.data),
};

// ─── Incidents ───────────────────────────────────────────

export const incidentsApi = {
  create: (data: CreateIncidentPayload) =>
    api.post<Incident>('/incidents', data).then((r) => r.data),

  getMyIncidents: () =>
    api.get<Incident[]>('/incidents/me').then((r) => r.data),

  /** Guard/Admin: get all incidents */
  getAll: () =>
    api.get<Incident[]>('/incidents').then((r) => r.data),

  /** Guard/Admin: resolve an incident */
  resolve: (id: string, data: ResolveIncidentPayload) =>
    api.patch<Incident>(`/incidents/${id}/resolve`, data).then((r) => r.data),
};

// ─── SOS Broadcasts ──────────────────────────────────────

export const sosApi = {
  getActive: () =>
    api.get<SOSBroadcast[]>('/sos/active').then((r) => r.data),

  getAll: () =>
    api.get<SOSBroadcast[]>('/sos').then((r) => r.data),

  /** Guard/Admin: trigger a new SOS broadcast */
  create: (data: CreateSOSPayload) =>
    api.post<SOSBroadcast>('/sos', data).then((r) => r.data),

  /** Guard/Admin: close an SOS broadcast */
  close: (id: string) =>
    api.patch<SOSBroadcast>(`/sos/${id}/close`).then((r) => r.data),
};

// ─── Admin ───────────────────────────────────────────────

export const analyticsApi = {
  getOverview: () =>
    api.get<AnalyticsOverview>('/analytics/overview').then((r) => r.data),
};

export const adminUsersApi = {
  getAll: () =>
    api.get<User[]>('/users').then((r) => r.data),

  toggleActive: (id: string) =>
    api.patch<User>(`/users/${id}/toggle-active`).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/users/${id}`).then((r) => r.data),
};

export const adminEntryLogsApi = {
  getAll: (take = 50) =>
    api.get<AdminEntryLog[]>(`/entry-logs?take=${take}`).then((r) => r.data),
};

export const adminIncidentsApi = {
  getAll: () =>
    api.get<AdminIncident[]>('/incidents').then((r) => r.data),

  resolve: (id: string, actionTaken: string) =>
    api.patch<AdminIncident>(`/incidents/${id}/resolve`, { actionTaken }).then((r) => r.data),
};

export default api;
