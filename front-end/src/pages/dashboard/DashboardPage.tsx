import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  LogOut,
  QrCode,
  User,
  Activity,
  AlertTriangle,
  MapPin,
  Radio,
  Send,
  CheckCircle2,
  History,
  Info,
  Camera,
  ImagePlus,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { entryLogsApi, incidentsApi, sosApi } from '@/lib/api';
import type { EntryLog, Incident, CreateIncidentPayload, SOSBroadcast } from '@/types';

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

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<EntryLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeSos, setActiveSos] = useState<SOSBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [incidentForm, setIncidentForm] = useState<CreateIncidentPayload>({
    title: '',
    description: '',
    location: '',
    severity: 'MEDIUM',
    imageUrl: '',
    anonymous: false,
  });
  const [creatingIncident, setCreatingIncident] = useState(false);
  const [incidentSuccess, setIncidentSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [entryRes, incidentRes, sosRes] = await Promise.all([
          entryLogsApi.getMyEntries(),
          incidentsApi.getMyIncidents(),
          sosApi.getActive(),
        ]);
        setEntries(entryRes ?? []);
        setIncidents(incidentRes ?? []);
        setActiveSos(sosRes ?? []);
      } catch (err) {
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleIncidentChange = (field: keyof CreateIncidentPayload, value: string) => {
    setIncidentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setIncidentForm((prev) => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setIncidentForm((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.title || !incidentForm.description || !incidentForm.location) {
      setError('Please complete title, description, and location.');
      return;
    }
    setCreatingIncident(true);
    setError(null);
    setIncidentSuccess(null);
    try {
      const created = await incidentsApi.create({
        ...incidentForm,
        imageUrl: incidentForm.imageUrl?.trim() || undefined,
      });
      setIncidents((prev) => [created, ...prev]);
      setIncidentForm({ title: '', description: '', location: '', severity: 'MEDIUM', imageUrl: '', anonymous: false });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      setIncidentSuccess('Incident submitted. We will notify you when it is updated.');
    } catch (err) {
      setError('Could not submit incident. Please try again.');
    } finally {
      setCreatingIncident(false);
    }
  };

  const lastEntry = useMemo(() => entries[0], [entries]);
  const openIncidents = useMemo(() => incidents.filter((i) => i.status === 'PENDING').length, [incidents]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm tracking-tight text-slate-900">GateFlow</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Student Dashboard</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
              <LogOut size={13} />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-7 space-y-6">
        {/* Welcome + breadcrumb-ish label */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-slate-400">Portal / Dashboard</p>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Welcome back, {user.firstName}.</h1>
            <p className="text-sm text-slate-500 mt-1">Your campus access, safety, and incident tools in one place.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-slate-400" />
            Data refreshes automatically.
          </div>
        </div>

        {/* SOS Banner */}
        {activeSos.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                <AlertTriangle size={16} /> Active Emergency
              </CardTitle>
              <Badge className="bg-red-600 text-white text-[10px]">BROADCAST</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-red-900">
              {activeSos.map((sos) => (
                <div key={sos.id} className="flex flex-col gap-1 border border-red-100 rounded-md p-3 bg-white/60">
                  <div className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-red-700">
                    <Radio size={14} /> {sos.type.replace('_', ' ')}
                  </div>
                  <p className="font-semibold">{sos.message}</p>
                  <p className="text-xs text-red-700">
                    Triggered by {sos.triggeredBy?.firstName} {sos.triggeredBy?.lastName} · {new Date(sos.createdAt).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {error}
          </div>
        )}

        {/* Top grid: QR, status, profile */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode size={15} className="text-slate-500" />
                Your QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <QRCodeSVG value={user.qrToken} size={150} level="H" includeMargin={false} />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Present this QR code at campus gates for ingress/egress.
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity size={15} className="text-slate-500" />
                Quick Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last scan</span>
                <span className="font-medium text-slate-900">
                  {lastEntry
                    ? `${lastEntry.type === 'ENTRY' ? 'Entry' : 'Exit'} · ${new Date(lastEntry.timestamp).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : 'No scans yet'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Recent entries logged</span>
                <span className="font-semibold text-slate-900">{entries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Open incidents</span>
                <span className="font-semibold text-amber-700">{openIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account status</span>
                <Badge className={`text-[10px] ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User size={15} className="text-slate-500" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role</span>
                <Badge className="text-[10px] bg-green-100 text-green-700">{user.role}</Badge>
              </div>
              {user.contactNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contact</span>
                  <span className="font-medium text-slate-900">{user.contactNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Member since</span>
                <span className="font-medium text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">QR Token</span>
                <span className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]">{user.qrToken}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entry history + incident form */}
        <div className="grid gap-5 lg:grid-cols-2 mt-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <History size={15} className="text-slate-500" />
                Recent Entry History
              </CardTitle>
              <Badge className="text-[10px] bg-slate-100 text-slate-700">Last 20</Badge>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {loading ? (
                <p className="text-sm text-slate-500 py-3">Loading entries…</p>
              ) : entries.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">No entry scans recorded yet.</p>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${entry.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                          {entry.type === 'ENTRY' ? 'Entry' : 'Exit'}
                        </Badge>
                        <span className="text-slate-900 font-medium truncate">{entry.location}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.timestamp).toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 text-right min-w-[120px]">
                      Guard: {entry.guard?.firstName} {entry.guard?.lastName}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600" />
                Report an Incident
              </CardTitle>
              <Badge className={`text-[10px] ${incidentForm.anonymous ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'}`}>
                {incidentForm.anonymous ? 'Anonymous mode' : 'Tracked to your account'}
              </Badge>
            </CardHeader>
            <CardContent>
              <form className="space-y-3 text-sm" onSubmit={submitIncident}>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Title</label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    value={incidentForm.title}
                    onChange={(e) => handleIncidentChange('title', e.target.value)}
                    placeholder="Short summary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Description</label>
                  <textarea
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    value={incidentForm.description}
                    onChange={(e) => handleIncidentChange('description', e.target.value)}
                    placeholder="What happened?"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <input
                      className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      value={incidentForm.location}
                      onChange={(e) => handleIncidentChange('location', e.target.value)}
                      placeholder="e.g., Main Gate, Library"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600">Severity</label>
                    <select
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      value={incidentForm.severity}
                      onChange={(e) => handleIncidentChange('severity', e.target.value)}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Photo Evidence (optional)</label>
                  <div className="flex items-center gap-2">
                    {/* Hidden file inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera size={14} />
                      Camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus size={14} />
                      Upload
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-auto rounded-md border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
                  <input
                    type="checkbox"
                    id="anonymous-toggle"
                    checked={incidentForm.anonymous ?? false}
                    onChange={(e) => setIncidentForm((prev) => ({ ...prev, anonymous: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <label htmlFor="anonymous-toggle" className="text-slate-700 text-sm cursor-pointer select-none">
                    Report anonymously
                  </label>
                  <span className="text-[11px] text-slate-400 ml-auto">Your identity will be hidden from admins</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-slate-500">
                    {incidentForm.anonymous
                      ? 'This report will not show your name.'
                      : 'Submissions are tracked under your account.'}
                  </div>
                  <Button type="submit" size="sm" className="gap-2" disabled={creatingIncident}>
                    <Send size={14} />
                    {creatingIncident ? 'Submitting…' : 'Submit'}
                  </Button>
                </div>
                {incidentSuccess && (
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                    <CheckCircle2 size={14} className="inline mr-1" /> {incidentSuccess}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Incident list */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle size={15} className="text-slate-500" />
              My Incident Reports
            </CardTitle>
            <Badge className="text-[10px] bg-slate-100 text-slate-700">Newest first</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {loading ? (
              <p className="text-sm text-slate-500 py-3">Loading incidents…</p>
            ) : incidents.length === 0 ? (
              <p className="text-sm text-slate-500 py-3">You have not reported any incidents yet.</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="py-3 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                  <div className="md:col-span-2">
                    <p className="font-semibold text-slate-900">{incident.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{incident.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] ${severityTone[incident.severity] ?? 'bg-slate-100 text-slate-700'}`}>
                      {incident.severity}
                    </Badge>
                    <Badge className={`text-[10px] ${statusTone[incident.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    {incident.location}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(incident.createdAt).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
