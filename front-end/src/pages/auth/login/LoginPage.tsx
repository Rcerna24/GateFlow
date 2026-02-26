import React, { useState } from 'react';
import {
  Shield, MapPin, QrCode, Megaphone, Users, ClipboardList,
  Eye, Lock, Mail, LogIn, Bell, EyeOff, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiError } from '@/types';

const features = [
  {
    icon: <QrCode size={17} />,
    label: 'QR Code Scanning',
    desc: 'Seamless ingress & egress tracking',
  },
  {
    icon: <Megaphone size={17} />,
    label: 'SOS Broadcast',
    desc: 'Instant campus-wide emergency alerts',
  },
  {
    icon: <Users size={17} />,
    label: 'Role-Based Access',
    desc: 'Permissions tailored per role',
  },
  {
    icon: <ClipboardList size={17} />,
    label: 'Entry Audit Logs',
    desc: 'Exportable, filterable activity trail',
  },
  {
    icon: <Bell size={17} />,
    label: 'Incident Reporting',
    desc: 'Structured reporting with status tracking',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: ApiError } };
      const msg = axiosErr.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex">
        {/* ── Left brand panel ─────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-105 xl:w-115 shrink-0 bg-[#0d1117] text-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/3" />
            <div className="absolute -bottom-15 -right-15 w-64 h-64 rounded-full bg-white/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/1.5" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield size={21} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[15px] leading-none tracking-tight">GateFlow</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
                    Smart Security System
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="border-white/15 text-white/50 text-[11px] gap-1.5 mt-1"
              >
                <MapPin size={10} />
                Main Campus – Visayas State University
              </Badge>
            </div>

            {/* Hero copy */}
            <div className="mt-14">
              <h2 className="text-3xl font-bold leading-tight tracking-tight">
                Secure. Smart.<br />Campus Access.
              </h2>
              <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-xs">
                GateFlow: A centralized platform for campus entry monitoring, incident management,
                visitor control, and emergency operations.
              </p>
            </div>

            {/* Feature list */}
            <div className="mt-10 space-y-5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0 mt-0.5 text-white/70">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white/90">{f.label}</p>
                    <p className="text-[12px] text-white/35 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-10 flex items-center justify-between">
              <p className="text-[11px] text-white/25">© 2026 GateFlow Security</p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Badge
                  variant="outline"
                  className="border-white/15 text-white/35 text-[10px] py-0.5"
                >
                  v1.0.0
                </Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center bg-slate-50 py-10 px-6 sm:px-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile-only brand header */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Shield size={15} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-[14px] text-slate-900 leading-none">GateFlow</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Campus Portal</p>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-1">
                Sign in to your account to continue
              </p>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/80 rounded-2xl overflow-hidden">
              <CardContent className="px-5 pt-6 pb-5 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@vsu.edu.ph"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                            }}
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                        {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                            Password
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
                              >
                                Forgot password?
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Contact GateFlow Support for password recovery
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                            }}
                            className="pl-8 pr-9 h-9 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[11px] text-red-500">{errors.password}</p>}
                      </div>

                      {/* API Error */}
                      {apiError && (
                        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                          <p className="text-[12px] text-red-600">{apiError}</p>
                        </div>
                      )}

                      {/* Sign in button */}
                      <Button type="submit" disabled={isSubmitting} className="w-full h-9 gap-2 text-sm font-medium">
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                        {isSubmitting ? 'Signing In…' : 'Sign In'}
                      </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 px-5 pb-5 pt-0">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-slate-900 font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  Are you a visitor?
                  <button
                    type="button"
                    onClick={() => navigate('/visitor-pass')}
                    className="text-slate-900 font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    Apply for a Visitor Pass
                  </button>
                </div>
                <p className="text-[11px] text-center text-slate-500 w-full">
                  © 2026 GateFlow · Smart Security System
                </p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default LoginPage;
