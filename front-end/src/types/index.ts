export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'GUARD' | 'STUDENT' | 'FACULTY' | 'STAFF';
  contactNumber: string | null;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'FACULTY' | 'STAFF';
  contactNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VisitorPassPayload {
  fullName: string;
  contactNumber: string;
  purpose: string;
  personToVisit: string;
  visitDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  email?: string;
  address?: string;
}

export interface VisitorPass {
  id: string;
  fullName: string;
  contactNumber: string;
  purpose: string;
  personToVisit: string;
  visitDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  qrToken: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  approvedById: string | null;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface EntryLog {
  id: string;
  userId: string;
  type: 'ENTRY' | 'EXIT';
  location: string;
  guardId: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  guard?: {
    firstName: string;
    lastName: string;
  };
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'PENDING' | 'RESOLVED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: Severity;
  status: IncidentStatus;
  reportedById: string;
  anonymous: boolean;
  actionTaken: string | null;
  imageUrl: string | null;
  createdAt: string;
  resolvedAt: string | null;
  reportedBy?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  location: string;
  severity: Severity;
  imageUrl?: string;
  anonymous?: boolean;
}

export type EmergencyType = 'EARTHQUAKE' | 'FIRE' | 'SECURITY_THREAT' | 'WEATHER_WARNING' | 'CUSTOM';

export interface SOSBroadcast {
  id: string;
  type: EmergencyType;
  message: string;
  triggeredById: string;
  isActive: boolean;
  createdAt: string;
  closedAt: string | null;
  triggeredBy?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

// ─── Guard-specific payloads ─────────────────────────────

export interface CreateEntryLogPayload {
  qrToken: string;
  type: 'ENTRY' | 'EXIT';
  location: string;
}

export interface QrLookupResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  qrToken: string;
}

export interface CreateSOSPayload {
  type: EmergencyType;
  message: string;
}

export interface ResolveIncidentPayload {
  actionTaken?: string;
}
