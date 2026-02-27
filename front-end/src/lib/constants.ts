import type { Severity, IncidentStatus, EmergencyType } from '@/types';

// ─── Badge color maps ────────────────────────────────────

export const severityTone: Record<Severity, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-100',
  HIGH: 'bg-orange-50 text-orange-700 border border-orange-100',
  CRITICAL: 'bg-red-50 text-red-700 border border-red-100',
};

export const statusTone: Record<IncidentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
};

export const roleTone: Record<string, string> = {
  ADMIN: 'bg-violet-50 text-violet-700 border border-violet-200',
  GUARD: 'bg-sky-50 text-sky-700 border border-sky-200',
  STUDENT: 'bg-green-50 text-green-700 border border-green-200',
  FACULTY: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  STAFF: 'bg-teal-50 text-teal-700 border border-teal-200',
};

export const visitorStatusTone: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
  EXPIRED: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export const emergencyTypeTone: Record<EmergencyType, string> = {
  EARTHQUAKE: 'bg-orange-50 text-orange-700 border border-orange-200',
  FIRE: 'bg-red-50 text-red-700 border border-red-200',
  SECURITY_THREAT: 'bg-violet-50 text-violet-700 border border-violet-200',
  WEATHER_WARNING: 'bg-sky-50 text-sky-700 border border-sky-200',
  CUSTOM: 'bg-slate-100 text-slate-700 border border-slate-200',
};

// ─── Date formatting ─────────────────────────────────────

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Auth features list (shared by Login + Signup) ───────

export const authFeatures = [
  {
    label: 'QR Code Scanning',
    desc: 'Seamless ingress & egress tracking',
  },
  {
    label: 'SOS Broadcast',
    desc: 'Instant campus-wide emergency alerts',
  },
  {
    label: 'Role-Based Access',
    desc: 'Permissions tailored per role',
  },
  {
    label: 'Entry Audit Logs',
    desc: 'Exportable, filterable activity trail',
  },
  {
    label: 'Incident Reporting',
    desc: 'Structured reporting with status tracking',
  },
];

// ─── Error parsing utility ───────────────────────────────

export function parseApiError(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string | string[]; statusCode?: number }; status?: number };
    request?: unknown;
    message?: string;
  };

  if (!axiosErr.response) {
    return axiosErr.request
      ? 'Cannot reach the server. Please make sure the backend is running and try again.'
      : `Unexpected error: ${axiosErr.message ?? 'unknown'}`;
  }

  const { status, data } = axiosErr.response;
  const msg = data?.message;
  const joined = Array.isArray(msg) ? msg.join(', ') : msg;

  switch (status) {
    case 401:
      return joined || 'Invalid email or password.';
    case 403:
      return joined || 'You do not have permission to perform this action.';
    case 400:
      return joined || 'Validation failed. Please check your inputs.';
    case 500:
      return 'Internal server error. The database may be unreachable — please try again later.';
    default:
      return joined || `Request failed (HTTP ${status}). Please try again.`;
  }
}
