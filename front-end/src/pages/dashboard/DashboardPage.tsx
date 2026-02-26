import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, QrCode, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const roleBadgeColor: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    GUARD: 'bg-blue-100 text-blue-700',
    STUDENT: 'bg-green-100 text-green-700',
    FACULTY: 'bg-amber-100 text-amber-700',
    STAFF: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none tracking-tight text-slate-900">GateFlow</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
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

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's your campus access overview.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User size={15} className="text-slate-500" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Name</span>
                <span className="text-xs font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Email</span>
                <span className="text-xs font-medium text-slate-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Role</span>
                <Badge className={`text-[10px] ${roleBadgeColor[user.role] ?? 'bg-slate-100 text-slate-700'}`}>
                  {user.role}
                </Badge>
              </div>
              {user.contactNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Contact</span>
                  <span className="text-xs font-medium text-slate-900">{user.contactNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <Badge className={`text-[10px] ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode size={15} className="text-slate-500" />
                Your QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <QRCodeSVG
                  value={user.qrToken}
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Present this QR code at the campus gate for quick entry/exit.
              </p>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={15} className="text-slate-500" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Member since</span>
                <span className="text-xs font-medium text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">QR Token</span>
                <span className="text-xs font-mono text-slate-500 truncate max-w-[120px]">
                  {user.qrToken.slice(0, 8)}…
                </span>
              </div>
              <div className="h-px bg-slate-100 my-1" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your QR code is unique and linked to your account. Do not share it with others.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
