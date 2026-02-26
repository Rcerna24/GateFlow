import React, { useState } from 'react';
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import type { ApiError } from '@/types';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      setIsSuccess(true);
      // DEV: capture reset link for demo purposes
      if (res.resetLink) {
        setResetLink(res.resetLink);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: ApiError } };
      const msg = axiosErr.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-10 px-6 sm:px-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-[14px] text-slate-900 leading-none">GateFlow</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Smart Security System</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot your password?</h1>
          <p className="text-slate-500 text-sm mt-1">
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/80 rounded-2xl overflow-hidden">
          <CardContent className="px-5 pt-6 pb-5 space-y-4">
            {isSuccess ? (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Check your email</p>
                    <p className="text-xs text-slate-500">
                      If that email is registered, a reset link has been sent.
                    </p>
                  </div>
                </div>

                {/* DEV ONLY — shows the reset link for hackathon demo */}
                {resetLink && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 space-y-1.5">
                    <p className="text-[11px] font-medium text-amber-700">Demo Mode — Reset Link</p>
                    <button
                      type="button"
                      onClick={() => navigate(resetLink)}
                      className="text-[12px] text-amber-800 underline underline-offset-2 break-all text-left"
                    >
                      Click here to reset your password
                    </button>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full h-9 gap-2 text-sm font-medium"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                        if (error) setError('');
                      }}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {error && <p className="text-[11px] text-red-500">{error}</p>}
                </div>

                {apiError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-[12px] text-red-600">{apiError}</p>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full h-9 gap-2 text-sm font-medium">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 px-5 pb-5 pt-0">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </button>
            <p className="text-[11px] text-center text-slate-500 w-full">
              © 2026 GateFlow · Smart Security System
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
