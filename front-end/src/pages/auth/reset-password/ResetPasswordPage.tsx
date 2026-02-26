import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import type { ApiError } from '@/types';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; token?: string }>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!token) newErrors.token = 'Reset token is missing. Please use the link from your email.';
    if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: ApiError } };
      const msg = axiosErr.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || 'Reset failed. The link may have expired.');
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
          <p className="text-slate-500 text-sm mt-1">
            Choose a new password for your account.
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
                    <p className="text-sm font-semibold text-slate-900">Password reset successful</p>
                    <p className="text-xs text-slate-500">
                      Your password has been updated. You can now sign in.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full h-9 gap-2 text-sm font-medium"
                >
                  Go to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.token && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-[12px] text-red-600">{errors.token}</p>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-medium text-slate-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
                      }}
                      className="pl-8 pr-9 h-9 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-[11px] text-red-500">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                      }}
                      className="pl-8 pr-9 h-9 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] text-red-500">{errors.confirmPassword}</p>}
                </div>

                {apiError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-[12px] text-red-600">{apiError}</p>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full h-9 gap-2 text-sm font-medium">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  {isSubmitting ? 'Resetting…' : 'Reset Password'}
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

export default ResetPasswordPage;
