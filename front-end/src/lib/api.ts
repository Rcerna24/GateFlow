import axios from 'axios';
import type {
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  VisitorPassPayload,
  VisitorPass,
  User,
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

export default api;
