import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  subtitle: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardLayout({ subtitle, headerExtra, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm tracking-tight text-slate-900">GateFlow</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{subtitle}</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {headerExtra}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
