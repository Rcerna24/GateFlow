import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Shield,
  LogOut,
  ScanLine,
  Activity,
  AlertTriangle,
  MapPin,
  Radio,
  CheckCircle2,
  History,
  Info,
  Users,
  ClipboardCheck,
  Megaphone,
  XCircle,
  UserCheck,
  UserX,
  Camera,
  CameraOff,
  Send,
  ImagePlus,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  entryLogsApi,
  incidentsApi,
  sosApi,
  visitorPassApi,
} from '@/lib/api';
import type {
  EntryLog,
  Incident,
  CreateIncidentPayload,
  SOSBroadcast,
  VisitorPass,
  QrLookupResult,
  EmergencyType,
} from '@/types';

/* ─── colour helpers ───────────────────────────────────── */

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

const visitorStatusTone: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-200 text-slate-600',
};

const EMERGENCY_TYPES: EmergencyType[] = [
  'EARTHQUAKE',
  'FIRE',
  'SECURITY_THREAT',
  'WEATHER_WARNING',
  'CUSTOM',
];

/* ═══════════════════════════════════════════════════════════ */

export default function GuardDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* ─── data state ─────────────────────────────────────── */
  const [recentLogs, setRecentLogs] = useState<EntryLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeSos, setActiveSos] = useState<SOSBroadcast[]>([]);
  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ─── QR camera scanner state ────────────────────────── */
  const [cameraActive, setCameraActive] = useState(false);
  const [scanType, setScanType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [scanLocation, setScanLocation] = useState('Main Gate');
  const [lookupResult, setLookupResult] = useState<QrLookupResult | null>(null);
  const [scannedToken, setScannedToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'guard-qr-reader';

  /* ─── SOS form state ─────────────────────────────────── */
  const [sosType, setSosType] = useState<EmergencyType>('SECURITY_THREAT');
  const [sosMessage, setSosMessage] = useState('');
  const [creatingSos, setCreatingSos] = useState(false);

  /* ─── Incident resolve state ─────────────────────────── */
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [actionTaken, setActionTaken] = useState('');

  /* ─── Incident report form (guards can submit too) ───── */
  const [incidentForm, setIncidentForm] = useState<CreateIncidentPayload>({
    title: '',
    description: '',
    location: '',
    severity: 'MEDIUM',
    imageUrl: '',
  });
  const [creatingIncident, setCreatingIncident] = useState(false);
  const [incidentSuccess, setIncidentSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileRef = useRef<HTMLInputElement>(null);

  /* ─── data fetch ─────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [logsRes, incRes, sosRes, vpRes] = await Promise.all([
          entryLogsApi.getRecent(),
          incidentsApi.getAll(),
          sosApi.getActive(),
          visitorPassApi.findAll(),
        ]);
        setRecentLogs(logsRes ?? []);
        setIncidents(incRes ?? []);
        setActiveSos(sosRes ?? []);
        setVisitorPasses(vpRes ?? []);
      } catch {
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  /* ─── helpers ────────────────────────────────────────── */
  const handleLogout = () => { logout(); navigate('/login'); };

  const clearMessages = () => { setError(null); setSuccess(null); setScanFeedback(null); };

  const pendingVisitors = useMemo(
    () => visitorPasses.filter((v) => v.status === 'PENDING'),
    [visitorPasses],
  );
  const pendingIncidents = useMemo(
    () => incidents.filter((i) => i.status === 'PENDING').length,
    [incidents],
  );

  /* ─── QR Camera Scanner ─────────────────────────────── */
  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING, State 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      }
    } catch {
      // ignore stop errors
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    clearMessages();
    setLookupResult(null);
    setScannedToken('');
    setScanFeedback(null);

    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      } catch { /* ignore */ }
    }

    setCameraActive(true);

    // Small delay to ensure the container div is visible and has dimensions
    await new Promise((r) => setTimeout(r, 300));

    const scanner = new Html5Qrcode(scannerContainerId);
    scannerRef.current = scanner;

    const qrSuccessCallback = async (decodedText: string) => {
      // On successful scan, stop camera and process the QR
      try {
        await scanner.stop();
      } catch { /* ignore */ }
      setCameraActive(false);
      setScannedToken(decodedText);

      // Look up the user
      try {
        const result = await entryLogsApi.lookupQr(decodedText);
        setLookupResult(result);
        setScanFeedback({
          type: 'success',
          message: `QR recognised: ${result.firstName} ${result.lastName} (${result.role})`,
        });
      } catch {
        setLookupResult(null);
        setScanFeedback({
          type: 'error',
          message: 'Invalid or expired QR code. Access denied.',
        });
      }
    };

    const scanConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    try {
      // Try back camera first (mobile devices)
      await scanner.start(
        { facingMode: 'environment' },
        scanConfig,
        qrSuccessCallback,
        () => {},
      );
    } catch {
      // Fall back: enumerate cameras and use the first available one
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length > 0) {
          await scanner.start(
            cameras[0].id,
            scanConfig,
            qrSuccessCallback,
            () => {},
          );
        } else {
          setCameraActive(false);
          setError('No camera found on this device.');
        }
      } catch {
        setCameraActive(false);
        setError('Could not access camera. Please grant camera permissions and try again.');
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2 || state === 3) {
            scannerRef.current.stop();
          }
        } catch { /* ignore */ }
      }
    };
  }, []);

  /* ─── Record entry/exit from scanned QR ──────────────── */
  const handleRecordScan = async () => {
    if (!scannedToken.trim()) return;
    clearMessages();
    setScanning(true);
    try {
      const log = await entryLogsApi.scan({
        qrToken: scannedToken.trim(),
        type: scanType,
        location: scanLocation,
      });
      setRecentLogs((prev) => [log, ...prev]);
      setSuccess(
        `${scanType === 'ENTRY' ? 'Entry' : 'Exit'} recorded for ${log.user?.firstName} ${log.user?.lastName}.`,
      );
      setScannedToken('');
      setLookupResult(null);
      setScanFeedback(null);
    } catch {
      setError('Failed to record scan. Check QR code and try again.');
    } finally {
      setScanning(false);
    }
  };

  /* ─── Visitor pass actions ───────────────────────────── */
  const handleVisitorAction = async (id: string, action: 'approve' | 'reject') => {
    clearMessages();
    try {
      const updated =
        action === 'approve'
          ? await visitorPassApi.approve(id)
          : await visitorPassApi.reject(id);
      setVisitorPasses((prev) =>
        prev.map((vp) => (vp.id === id ? updated : vp)),
      );
      setSuccess(`Visitor pass ${action === 'approve' ? 'approved' : 'rejected'}.`);
    } catch {
      setError(`Failed to ${action} visitor pass.`);
    }
  };

  /* ─── Resolve incident ───────────────────────────────── */
  const handleResolve = async (id: string) => {
    clearMessages();
    try {
      const updated = await incidentsApi.resolve(id, {
        actionTaken: actionTaken.trim() || undefined,
      });
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? updated : inc)),
      );
      setResolvingId(null);
      setActionTaken('');
      setSuccess('Incident marked as resolved.');
    } catch {
      setError('Failed to resolve incident.');
    }
  };

  /* ─── SOS broadcast ─────────────────────────────────── */
  const handleTriggerSos = async () => {
    if (!sosMessage.trim()) { setError('SOS message is required.'); return; }
    clearMessages();
    setCreatingSos(true);
    try {
      const created = await sosApi.create({ type: sosType, message: sosMessage.trim() });
      setActiveSos((prev) => [created, ...prev]);
      setSosMessage('');
      setSuccess('SOS broadcast sent campus-wide.');
    } catch {
      setError('Failed to send SOS broadcast.');
    } finally {
      setCreatingSos(false);
    }
  };

  const handleCloseSos = async (id: string) => {
    clearMessages();
    try {
      await sosApi.close(id);
      setActiveSos((prev) => prev.filter((s) => s.id !== id));
      setSuccess('SOS broadcast deactivated.');
    } catch {
      setError('Failed to close SOS broadcast.');
    }
  };

  /* ─── Incident reporting (guards can submit incidents) ─ */
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
    if (cameraFileRef.current) cameraFileRef.current.value = '';
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.title || !incidentForm.description || !incidentForm.location) {
      setError('Please complete title, description, and location.');
      return;
    }
    setCreatingIncident(true);
    clearMessages();
    setIncidentSuccess(null);
    try {
      const created = await incidentsApi.create({
        ...incidentForm,
        imageUrl: incidentForm.imageUrl?.trim() || undefined,
      });
      setIncidents((prev) => [created, ...prev]);
      setIncidentForm({ title: '', description: '', location: '', severity: 'MEDIUM', imageUrl: '' });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraFileRef.current) cameraFileRef.current.value = '';
      setIncidentSuccess('Incident submitted successfully.');
    } catch {
      setError('Could not submit incident. Please try again.');
    } finally {
      setCreatingIncident(false);
    }
  };

  /* ─── render ─────────────────────────────────────────── */
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm tracking-tight text-slate-900">GateFlow</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Guard Dashboard</p>
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

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        {/* ── Welcome ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-slate-400">
              Guard Station / Dashboard
            </p>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Welcome back, {user.firstName}.
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gate access scanning, visitor management, incident response &amp; SOS controls.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-slate-400" />
            Data refreshes automatically.
          </div>
        </div>

        {/* ── Active SOS Banner ────────────────────────── */}
        {activeSos.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                <AlertTriangle size={16} /> Active Emergencies
              </CardTitle>
              <Badge className="bg-red-600 text-white text-[10px]">BROADCAST</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-red-900">
              {activeSos.map((sos) => (
                <div
                  key={sos.id}
                  className="flex items-center justify-between border border-red-100 rounded-md p-3 bg-white/60"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-red-700">
                      <Radio size={14} /> {sos.type.replace(/_/g, ' ')}
                    </div>
                    <p className="font-semibold">{sos.message}</p>
                    <p className="text-xs text-red-700">
                      Triggered by {sos.triggeredBy?.firstName} {sos.triggeredBy?.lastName} ·{' '}
                      {new Date(sos.createdAt).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-100 gap-1.5 text-xs"
                    onClick={() => handleCloseSos(sos.id)}
                  >
                    <XCircle size={14} />
                    Deactivate
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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

        {/* ── Quick Stats ──────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center">
                <ScanLine size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Scans Today</p>
                <p className="text-lg font-bold text-slate-900">{recentLogs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-amber-50 flex items-center justify-center">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Open Incidents</p>
                <p className="text-lg font-bold text-amber-700">{pendingIncidents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-violet-50 flex items-center justify-center">
                <Users size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Pending Visitors</p>
                <p className="text-lg font-bold text-violet-700">{pendingVisitors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-red-50 flex items-center justify-center">
                <Megaphone size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Active SOS</p>
                <p className="text-lg font-bold text-red-700">{activeSos.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 1: QR Camera Scanner + Recent Logs ───── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* QR Camera Scanner */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ScanLine size={15} className="text-blue-600" />
                QR Gate Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Camera viewport */}
              <div className="relative rounded-lg overflow-hidden bg-slate-900 min-h-[300px] flex items-center justify-center">
                <div id={scannerContainerId} className="w-full min-h-[300px]" />
                {!cameraActive && !scannedToken && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
                    <Camera size={40} className="text-white/40" />
                    <p className="text-sm text-white/50">Camera is inactive</p>
                  </div>
                )}
              </div>

              {/* Camera control buttons */}
              <div className="flex gap-2">
                {!cameraActive ? (
                  <Button
                    className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={startCamera}
                  >
                    <Camera size={14} />
                    Start Scanner
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-2"
                    variant="outline"
                    onClick={stopCamera}
                  >
                    <CameraOff size={14} />
                    Stop Scanner
                  </Button>
                )}
              </div>

              {/* Scan feedback */}
              {scanFeedback && (
                <div
                  className={`rounded-md p-3 text-sm flex items-center gap-2 ${
                    scanFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {scanFeedback.type === 'success' ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {scanFeedback.message}
                </div>
              )}

              {/* Lookup result */}
              {lookupResult && (
                <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3 space-y-1">
                  <p className="font-semibold text-slate-900">
                    {lookupResult.firstName} {lookupResult.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{lookupResult.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[10px] bg-indigo-100 text-indigo-700">
                      {lookupResult.role}
                    </Badge>
                    <Badge
                      className={`text-[10px] ${lookupResult.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {lookupResult.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Type + Location + Record button */}
              {scannedToken && lookupResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Type</label>
                      <select
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        value={scanType}
                        onChange={(e) => setScanType(e.target.value as 'ENTRY' | 'EXIT')}
                      >
                        <option value="ENTRY">Entry (Ingress)</option>
                        <option value="EXIT">Exit (Egress)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Location</label>
                      <input
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        value={scanLocation}
                        onChange={(e) => setScanLocation(e.target.value)}
                        placeholder="Main Gate"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={handleRecordScan}
                    disabled={scanning || !scannedToken.trim()}
                  >
                    <ScanLine size={14} />
                    {scanning ? 'Recording…' : `Record ${scanType === 'ENTRY' ? 'Entry' : 'Exit'}`}
                  </Button>
                </>
              )}

              {/* Allow re-scanning */}
              {scannedToken && !cameraActive && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-xs"
                  onClick={() => {
                    setScannedToken('');
                    setLookupResult(null);
                    setScanFeedback(null);
                    startCamera();
                  }}
                >
                  <Camera size={14} />
                  Scan Next QR Code
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Entry Logs */}
          <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <History size={15} className="text-slate-500" />
                Recent Entry Logs
              </CardTitle>
              <Badge className="text-[10px] bg-slate-100 text-slate-700">Last 50</Badge>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-slate-500 py-3">Loading…</p>
              ) : recentLogs.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">No entry logs yet.</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] ${log.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}
                        >
                          {log.type}
                        </Badge>
                        <span className="font-medium text-slate-900 truncate">
                          {log.user?.firstName} {log.user?.lastName}
                        </span>
                        <Badge className="text-[9px] bg-slate-100 text-slate-500">
                          {log.user?.role}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {log.location} ·{' '}
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Row 2: Visitor Passes + SOS Control ──────── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Visitor Pass Management */}
          <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardCheck size={15} className="text-violet-600" />
                Visitor Passes
              </CardTitle>
              <Badge className="text-[10px] bg-slate-100 text-slate-700">
                {pendingVisitors.length} pending
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-slate-500 py-3">Loading…</p>
              ) : visitorPasses.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">No visitor pass requests.</p>
              ) : (
                visitorPasses.map((vp) => (
                  <div key={vp.id} className="py-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{vp.fullName}</p>
                        <p className="text-xs text-slate-500">
                          Purpose: {vp.purpose} · Visiting: {vp.personToVisit}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(vp.visitDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          ·{' '}
                          {new Date(vp.timeWindowStart).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          –{' '}
                          {new Date(vp.timeWindowEnd).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge
                        className={`text-[10px] ${visitorStatusTone[vp.status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {vp.status}
                      </Badge>
                    </div>
                    {vp.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleVisitorAction(vp.id, 'approve')}
                        >
                          <UserCheck size={13} />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleVisitorAction(vp.id, 'reject')}
                        >
                          <UserX size={13} />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* SOS Broadcast Control */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Megaphone size={15} className="text-red-600" />
                SOS Broadcast Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Emergency Type</label>
                  <select
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    value={sosType}
                    onChange={(e) => setSosType(e.target.value as EmergencyType)}
                  >
                    {EMERGENCY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-600">Message</label>
                <textarea
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Describe the emergency…"
                  value={sosMessage}
                  onChange={(e) => setSosMessage(e.target.value)}
                />
              </div>
              <Button
                className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleTriggerSos}
                disabled={creatingSos || !sosMessage.trim()}
              >
                <Megaphone size={14} />
                {creatingSos ? 'Broadcasting…' : 'Trigger SOS Broadcast'}
              </Button>
              <p className="text-[11px] text-slate-400 text-center">
                This will immediately notify all campus users.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 3: Incident Reporting + Active Visitors ─ */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Submit Incident (guard can report too per spec) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600" />
                Report an Incident
              </CardTitle>
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
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Photo Evidence (optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={cameraFileRef}
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
                      onClick={() => cameraFileRef.current?.click()}
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
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[12px] text-slate-500">
                    Submissions are tracked under your guard account.
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

          {/* Active Visitors */}
          <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users size={15} className="text-indigo-600" />
                Active Visitors Today
              </CardTitle>
              <Badge className="text-[10px] bg-slate-100 text-slate-700">
                {visitorPasses.filter((v) => v.status === 'APPROVED').length} approved
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-slate-500 py-3">Loading…</p>
              ) : visitorPasses.filter((v) => v.status === 'APPROVED').length === 0 ? (
                <p className="text-sm text-slate-500 py-3">No active visitors today.</p>
              ) : (
                visitorPasses
                  .filter((v) => v.status === 'APPROVED')
                  .map((vp) => (
                    <div key={vp.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{vp.fullName}</p>
                          <p className="text-xs text-slate-500">
                            Visiting: {vp.personToVisit} · {vp.purpose}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(vp.timeWindowStart).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            –{' '}
                            {new Date(vp.timeWindowEnd).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700">
                          APPROVED
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Row 4: All Incidents ─────────────────────── */}
        <Card>
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={15} className="text-slate-500" />
              All Incident Reports
            </CardTitle>
            <Badge className="text-[10px] bg-slate-100 text-slate-700">Newest first</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {loading ? (
              <p className="text-sm text-slate-500 py-3">Loading incidents…</p>
            ) : incidents.length === 0 ? (
              <p className="text-sm text-slate-500 py-3">No incidents reported yet.</p>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="py-3 grid grid-cols-1 md:grid-cols-6 gap-3 text-sm items-start"
                >
                  <div className="md:col-span-2">
                    <p className="font-semibold text-slate-900">{inc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {inc.description}
                    </p>
                    {!inc.anonymous && inc.reportedBy && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        by {inc.reportedBy.firstName} {inc.reportedBy.lastName} ({inc.reportedBy.role})
                      </p>
                    )}
                    {inc.anonymous && (
                      <p className="text-[11px] text-violet-500 mt-0.5">Anonymous report</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] ${severityTone[inc.severity] ?? 'bg-slate-100 text-slate-700'}`}
                    >
                      {inc.severity}
                    </Badge>
                    <Badge
                      className={`text-[10px] ${statusTone[inc.status] ?? 'bg-slate-100 text-slate-700'}`}
                    >
                      {inc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    {inc.location}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(inc.createdAt).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div>
                    {inc.status === 'PENDING' ? (
                      resolvingId === inc.id ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            placeholder="Action taken (optional)"
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                          />
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              className="text-xs gap-1 flex-1"
                              onClick={() => handleResolve(inc.id)}
                            >
                              <CheckCircle2 size={12} />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                setResolvingId(null);
                                setActionTaken('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => setResolvingId(inc.id)}
                        >
                          <CheckCircle2 size={13} />
                          Resolve
                        </Button>
                      )
                    ) : (
                      <span className="text-xs text-emerald-600">
                        {inc.actionTaken ? `✓ ${inc.actionTaken}` : '✓ Resolved'}
                      </span>
                    )}
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
