import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Users,
  Activity,
  AlertTriangle,
  MapPin,
  Radio,
  CheckCircle2,
  XCircle,
  Send,
  ClipboardList,
  BarChart3,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  Clock,
  CalendarDays,
  Megaphone,
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  analyticsApi,
  adminUsersApi,
  adminEntryLogsApi,
  adminIncidentsApi,
  visitorPassApi,
  sosApi,
} from '@/lib/api';
import type {
  User as UserType,
  AnalyticsOverview,
  AdminEntryLog,
  AdminIncident,
  VisitorPass,
  SOSBroadcast,
  EmergencyType,
} from '@/types';

/* ─── Style maps ──────────────────────────────────────── */
const severityTone: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-100',
  HIGH: 'bg-orange-50 text-orange-700 border border-orange-100',
  CRITICAL: 'bg-red-50 text-red-700 border border-red-100',
};

const statusTone: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
};

const roleTone: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
  GUARD: 'bg-blue-50 text-blue-700 border border-blue-200',
  STUDENT: 'bg-slate-50 text-slate-700 border border-slate-200',
  FACULTY: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  STAFF: 'bg-teal-50 text-teal-700 border border-teal-200',
};

const visitorStatusTone: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-600',
};

/* ─── Tab type ────────────────────────────────────────── */
type Tab = 'overview' | 'users' | 'logs' | 'incidents' | 'visitors' | 'sos';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* ─── Active tab ─────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  /* ─── Data state ─────────────────────────────────────── */
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [entryLogs, setEntryLogs] = useState<AdminEntryLog[]>([]);
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [visitors, setVisitors] = useState<VisitorPass[]>([]);
  const [sosBroadcasts, setSosBroadcasts] = useState<SOSBroadcast[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ─── Filters ────────────────────────────────────────── */
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [incidentStatusFilter, setIncidentStatusFilter] = useState<string>('ALL');

  /* ─── Resolve incident state ─────────────────────────── */
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [actionTaken, setActionTaken] = useState('');

  /* ─── SOS form ───────────────────────────────────────── */
  const [sosType, setSosType] = useState<EmergencyType>('SECURITY_THREAT');
  const [sosMessage, setSosMessage] = useState('');
  const [creatingSos, setCreatingSos] = useState(false);
  const [showSosForm, setShowSosForm] = useState(false);

  /* ─── Collapsible sections ───────────────────────────── */
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stats: true,
    recentActivity: true,
  });

  const toggleSection = (key: string) =>
    setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  /* ─── Data fetch ─────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, usersRes, logsRes, incRes, vpRes, sosRes] = await Promise.all([
        analyticsApi.getOverview(),
        adminUsersApi.getAll(),
        adminEntryLogsApi.getAll(100),
        adminIncidentsApi.getAll(),
        visitorPassApi.findAll(),
        sosApi.getAll(),
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes ?? []);
      setEntryLogs(logsRes ?? []);
      setIncidents(incRes ?? []);
      setVisitors(vpRes ?? []);
      setSosBroadcasts(sosRes ?? []);
    } catch {
      setError('Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Helpers ────────────────────────────────────────── */
  const handleLogout = () => { logout(); navigate('/login'); };
  const clearMessages = () => { setError(null); setSuccess(null); };

  /* ─── User management ───────────────────────────────── */
  const handleToggleActive = async (id: string) => {
    clearMessages();
    try {
      const updated = await adminUsersApi.toggleActive(id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSuccess(`User ${updated.isActive ? 'activated' : 'deactivated'} successfully.`);
    } catch {
      setError('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    clearMessages();
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await adminUsersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess('User deleted successfully.');
    } catch {
      setError('Failed to delete user.');
    }
  };

  /* ─── Incident resolve ──────────────────────────────── */
  const handleResolve = async (id: string) => {
    if (!actionTaken.trim()) return;
    clearMessages();
    try {
      const updated = await adminIncidentsApi.resolve(id, actionTaken.trim());
      setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setResolvingId(null);
      setActionTaken('');
      setSuccess('Incident resolved.');
    } catch {
      setError('Failed to resolve incident.');
    }
  };

  /* ─── Visitor approve / reject ──────────────────────── */
  const handleApproveVisitor = async (id: string) => {
    clearMessages();
    try {
      const updated = await visitorPassApi.approve(id);
      setVisitors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setSuccess('Visitor pass approved.');
    } catch {
      setError('Failed to approve visitor pass.');
    }
  };

  const handleRejectVisitor = async (id: string) => {
    clearMessages();
    try {
      const updated = await visitorPassApi.reject(id);
      setVisitors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setSuccess('Visitor pass rejected.');
    } catch {
      setError('Failed to reject visitor pass.');
    }
  };

  /* ─── SOS management ────────────────────────────────── */
  const handleCreateSos = async () => {
    if (!sosMessage.trim()) return;
    clearMessages();
    setCreatingSos(true);
    try {
      const created = await sosApi.create({ type: sosType, message: sosMessage.trim() });
      setSosBroadcasts((prev) => [created, ...prev]);
      setSosMessage('');
      setShowSosForm(false);
      setSuccess('SOS broadcast created.');
      if (analytics) setAnalytics({ ...analytics, activeSos: analytics.activeSos + 1 });
    } catch {
      setError('Failed to create SOS broadcast.');
    } finally {
      setCreatingSos(false);
    }
  };

  const handleCloseSos = async (id: string) => {
    clearMessages();
    try {
      const updated = await sosApi.close(id);
      setSosBroadcasts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSuccess('SOS broadcast deactivated.');
      if (analytics) setAnalytics({ ...analytics, activeSos: Math.max(0, analytics.activeSos - 1) });
    } catch {
      setError('Failed to close SOS broadcast.');
    }
  };

  /* ─── Filtered data ─────────────────────────────────── */
  const filteredUsers = useMemo(() => {
    let result = users;
    if (userRoleFilter !== 'ALL') result = result.filter((u) => u.role === userRoleFilter);
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    return result;
  }, [users, userRoleFilter, userSearch]);

  const filteredIncidents = useMemo(() => {
    if (incidentStatusFilter === 'ALL') return incidents;
    return incidents.filter((i) => i.status === incidentStatusFilter);
  }, [incidents, incidentStatusFilter]);

  const activeSosList = useMemo(() => sosBroadcasts.filter((s) => s.isActive), [sosBroadcasts]);
  const pendingVisitorsList = useMemo(() => visitors.filter((v) => v.status === 'PENDING'), [visitors]);

  /* ─── tabs config ────────────────────────────────────── */
  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { key: 'users', label: 'Users', icon: <Users size={15} />, count: users.length },
    { key: 'logs', label: 'Entry Logs', icon: <Activity size={15} />, count: entryLogs.length },
    {
      key: 'incidents',
      label: 'Incidents',
      icon: <AlertTriangle size={15} />,
      count: incidents.filter((i) => i.status === 'PENDING').length,
    },
    {
      key: 'visitors',
      label: 'Visitors',
      icon: <Eye size={15} />,
      count: pendingVisitorsList.length,
    },
    {
      key: 'sos',
      label: 'SOS',
      icon: <Radio size={15} />,
      count: activeSosList.length,
    },
  ];

  /* ─── Loading / empty ────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-none">GateFlow</h1>
              <p className="text-[11px] text-slate-500">Admin Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeSosList.length > 0 && (
              <Badge className="bg-red-600 text-white animate-pulse text-xs gap-1">
                <Radio size={12} />
                {activeSosList.length} Active SOS
              </Badge>
            )}
            <span className="text-xs text-slate-500 hidden sm:inline">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-xs text-slate-600">
              <LogOut size={14} />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* ── Alerts ───────────────────────────────────── */}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2 flex items-center gap-2">
            <CheckCircle2 size={14} /> {success}
          </div>
        )}

        {/* ── Tab navigation ──────────────────────────── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); clearMessages(); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* ── OVERVIEW TAB ──────────────────────────────── */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-5">
            {/* Stats cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <StatCard icon={<Users size={16} className="text-blue-600" />} label="Total Users" value={analytics.totalUsers} bg="bg-blue-50" />
              <StatCard icon={<Activity size={16} className="text-emerald-600" />} label="Entries Today" value={analytics.entriesToday} bg="bg-emerald-50" />
              <StatCard icon={<AlertTriangle size={16} className="text-amber-600" />} label="Pending Incidents" value={analytics.pendingIncidents} bg="bg-amber-50" />
              <StatCard icon={<Radio size={16} className="text-red-600" />} label="Active SOS" value={analytics.activeSos} bg="bg-red-50" />
              <StatCard icon={<Eye size={16} className="text-indigo-600" />} label="Pending Visitors" value={analytics.pendingVisitors} bg="bg-indigo-50" />
              <StatCard icon={<CheckCircle2 size={16} className="text-emerald-600" />} label="Resolved Incidents" value={analytics.resolvedIncidents} bg="bg-emerald-50" />
              <StatCard icon={<ClipboardList size={16} className="text-slate-600" />} label="Total Entry Logs" value={analytics.totalEntryLogs} bg="bg-slate-100" />
              <StatCard icon={<UserCheck size={16} className="text-teal-600" />} label="Approved Visitors" value={analytics.approvedVisitors} bg="bg-teal-50" />
            </div>

            {/* User breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users size={15} className="text-blue-600" />
                  User Breakdown by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                  {[
                    { label: 'Students', value: analytics.totalStudents, color: 'bg-slate-600' },
                    { label: 'Faculty', value: analytics.totalFaculty, color: 'bg-indigo-600' },
                    { label: 'Staff', value: analytics.totalStaff, color: 'bg-teal-600' },
                    { label: 'Guards', value: analytics.totalGuards, color: 'bg-blue-600' },
                    { label: 'Total', value: analytics.totalUsers, color: 'bg-slate-900' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className={`text-xl font-bold text-slate-900`}>{item.value}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent activity snapshot */}
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('recentActivity')}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock size={15} className="text-slate-500" />
                    Recent Activity
                  </span>
                  {expandedSections.recentActivity ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.recentActivity && (
                <CardContent className="space-y-2 text-sm">
                  {entryLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={log.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {log.type}
                        </Badge>
                        <span className="text-slate-700">
                          {log.user?.firstName} {log.user?.lastName}
                        </span>
                        <Badge className={roleTone[log.user?.role ?? 'STUDENT']} variant="outline">
                          {log.user?.role}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                  {entryLogs.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No entry logs yet.</p>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ── USERS TAB ─────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <select
                className="text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="STAFF">Staff</option>
                <option value="GUARD">Guard</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* User list */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Role</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Joined</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-medium text-slate-800">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{u.email}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className={roleTone[u.role]}>{u.role}</Badge>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant="secondary" className={u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-2.5 text-right space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs gap-1 ${u.isActive ? 'text-amber-700 border-amber-200 hover:bg-amber-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                              onClick={() => handleToggleActive(u.id)}
                            >
                              {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            {u.role !== 'ADMIN' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1 text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 size={13} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No users found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ── ENTRY LOGS TAB ────────────────────────────── */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'logs' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity size={15} className="text-emerald-600" />
                All Entry Logs
                <Badge variant="outline" className="ml-auto text-[10px]">{entryLogs.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Person</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Role</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Location</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Scanned By</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entryLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5">
                          <Badge variant="secondary" className={log.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {log.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-slate-800">
                          {log.user?.firstName} {log.user?.lastName}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={roleTone[log.user?.role ?? 'STUDENT']}>{log.user?.role}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {log.location}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {log.guard?.firstName} {log.guard?.lastName}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {new Date(log.timestamp).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {entryLogs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No entry logs recorded yet.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ── INCIDENTS TAB ─────────────────────────────── */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-3">
              <select
                className="text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={incidentStatusFilter}
                onChange={(e) => setIncidentStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredIncidents.map((incident) => (
                <Card key={incident.id}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">{incident.title}</h3>
                          <Badge variant="secondary" className={severityTone[incident.severity]}>{incident.severity}</Badge>
                          <Badge variant="secondary" className={statusTone[incident.status]}>{incident.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">{incident.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {incident.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} />
                            {new Date(incident.createdAt).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          {incident.reportedBy && !incident.anonymous && (
                            <span>
                              By: {incident.reportedBy.firstName} {incident.reportedBy.lastName} ({incident.reportedBy.role})
                            </span>
                          )}
                          {incident.anonymous && <span className="italic">Anonymous</span>}
                        </div>
                        {incident.imageUrl && (
                          <img
                            src={incident.imageUrl}
                            alt="Incident"
                            className="mt-2 w-32 h-24 object-cover rounded-md border"
                          />
                        )}
                      </div>

                      {incident.status === 'PENDING' && (
                        <div className="flex-shrink-0">
                          {resolvingId === incident.id ? (
                            <div className="space-y-2 w-56">
                              <textarea
                                className="w-full text-xs border border-slate-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                rows={2}
                                placeholder="Action taken..."
                                value={actionTaken}
                                onChange={(e) => setActionTaken(e.target.value)}
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  onClick={() => handleResolve(incident.id)}
                                  disabled={!actionTaken.trim()}
                                >
                                  <CheckCircle2 size={12} /> Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => { setResolvingId(null); setActionTaken(''); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => setResolvingId(incident.id)}
                            >
                              <CheckCircle2 size={13} /> Resolve
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {incident.status === 'RESOLVED' && incident.actionTaken && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-md p-2 text-xs text-emerald-700">
                        <span className="font-medium">Action taken:</span> {incident.actionTaken}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filteredIncidents.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No incidents to display.</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ── VISITORS TAB ──────────────────────────────── */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'visitors' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye size={15} className="text-indigo-600" />
                Visitor Passes
                {pendingVisitorsList.length > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px]">
                    {pendingVisitorsList.length} pending
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Visitor</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Purpose</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Visiting</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Date</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v) => (
                      <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-800">{v.fullName}</div>
                          <div className="text-xs text-slate-400">{v.contactNumber}</div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{v.purpose}</td>
                        <td className="px-4 py-2.5 text-slate-600">{v.personToVisit}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {new Date(v.visitDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="secondary" className={visitorStatusTone[v.status]}>{v.status}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right space-x-1">
                          {v.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleApproveVisitor(v.id)}
                              >
                                <CheckCircle2 size={13} /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1 text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => handleRejectVisitor(v.id)}
                              >
                                <XCircle size={13} /> Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visitors.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No visitor passes submitted.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ── SOS TAB ───────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            {/* Active SOS banner */}
            {activeSosList.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                  <ShieldAlert size={16} className="animate-pulse" />
                  Active SOS Broadcasts ({activeSosList.length})
                </h3>
                {activeSosList.map((sos) => (
                  <div key={sos.id} className="flex items-center justify-between bg-white border border-red-100 rounded-md px-3 py-2">
                    <div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 text-[10px]">{sos.type.replace(/_/g, ' ')}</Badge>
                      <p className="text-sm text-slate-800 mt-0.5">{sos.message}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        By {sos.triggeredBy?.firstName} {sos.triggeredBy?.lastName} &middot;{' '}
                        {new Date(sos.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 text-red-700 border-red-300 hover:bg-red-100"
                      onClick={() => handleCloseSos(sos.id)}
                    >
                      <XCircle size={13} /> Deactivate
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Create SOS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Megaphone size={15} className="text-red-600" />
                    SOS Broadcast Management
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => setShowSosForm(!showSosForm)}
                  >
                    {showSosForm ? 'Cancel' : 'New Broadcast'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showSosForm && (
                <CardContent className="space-y-3 text-sm border-t pt-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Emergency Type</label>
                    <select
                      className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                      value={sosType}
                      onChange={(e) => setSosType(e.target.value as EmergencyType)}
                    >
                      <option value="SECURITY_THREAT">Security Threat</option>
                      <option value="FIRE">Fire</option>
                      <option value="EARTHQUAKE">Earthquake</option>
                      <option value="WEATHER_WARNING">Weather Warning</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Message</label>
                    <textarea
                      className="w-full text-sm border border-slate-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                      rows={3}
                      placeholder="Describe the emergency..."
                      value={sosMessage}
                      onChange={(e) => setSosMessage(e.target.value)}
                    />
                  </div>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white gap-2 w-full"
                    onClick={handleCreateSos}
                    disabled={creatingSos || !sosMessage.trim()}
                  >
                    <Send size={14} />
                    {creatingSos ? 'Sending...' : 'Send SOS Broadcast'}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* All SOS history */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Radio size={15} className="text-slate-500" />
                  Broadcast History
                  <Badge variant="outline" className="ml-auto text-[10px]">{sosBroadcasts.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {sosBroadcasts.map((sos) => (
                  <div
                    key={sos.id}
                    className={`flex items-center justify-between py-2 px-3 rounded-md border ${
                      sos.isActive ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={sos.isActive ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}>
                          {sos.type.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="secondary" className={sos.isActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}>
                          {sos.isActive ? 'ACTIVE' : 'CLOSED'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{sos.message}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sos.triggeredBy?.firstName} {sos.triggeredBy?.lastName} &middot;{' '}
                        {new Date(sos.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                        {sos.closedAt && (
                          <> &middot; Closed {new Date(sos.closedAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}</>
                        )}
                      </p>
                    </div>
                    {sos.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 text-red-700 border-red-300 hover:bg-red-100"
                        onClick={() => handleCloseSos(sos.id)}
                      >
                        <XCircle size={13} /> Close
                      </Button>
                    )}
                  </div>
                ))}
                {sosBroadcasts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No SOS broadcasts in the system.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Reusable stat card ───────────────────────────────── */
function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-md ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
