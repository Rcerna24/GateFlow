import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, MapPin, QrCode, Megaphone, Users, ClipboardList,
  Bell, Eye, EyeOff, Lock, Mail, UserRound, Phone, Hash,
  BookOpen, UserPlus, ChevronDown, Building, Upload, ImageIcon, FileText, X,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

const ROLES = ['Student', 'Faculty', 'Staff'] as const;
type Role = (typeof ROLES)[number];

interface FormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  role: Role | '';
  currentAddress: string;
  staysInDorm: 'yes' | 'no' | '';
  contactNumber: string;
  departmentCourse: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [idPicture, setIdPicture] = useState<File | null>(null);
  const [corFile, setCorFile] = useState<File | null>(null);
  const idPictureRef = useRef<HTMLInputElement>(null);
  const corFileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'idPicture' | 'corFile', string>>>({});

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    role: '',
    currentAddress: '',
    staysInDorm: '',
    contactNumber: '',
    departmentCourse: '',
    password: '',
    confirmPassword: '',
  });

  // Close role dropdown on outside click
  const roleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    };
    if (roleOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [roleOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error for this field
    if (errors[id as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [id]: '',
      }));
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
    setRoleOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'idPicture' | 'corFile', string>> = {};

    if (!formData.role) newErrors.role = 'Please select your role';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';
    if (!formData.staysInDorm) newErrors.staysInDorm = 'Please select if you stay in dormitory';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.departmentCourse.trim()) newErrors.departmentCourse = 'This field is required';
    if (!idPicture) newErrors.idPicture = 'ID picture is required';
    if (formData.role === 'Student' && !corFile) newErrors.corFile = 'Certificate of Registration is required';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role.toUpperCase() as 'STUDENT' | 'FACULTY' | 'STAFF',
        contactNumber: formData.contactNumber || undefined,
      });
      navigate('/dashboard');
      // Note: signup is only for STUDENT/FACULTY/STAFF so no guard/admin redirect needed
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: ApiError; status?: number }; request?: unknown; message?: string };

      // No response at all → network / server unreachable
      if (!axiosErr.response) {
        setApiError(
          axiosErr.request
            ? 'Cannot reach the server. Please make sure the backend is running and try again.'
            : `Unexpected error: ${axiosErr.message ?? 'unknown'}`,
        );
      } else {
        const { status, data } = axiosErr.response;
        const msg = data?.message;
        const joined = Array.isArray(msg) ? msg.join(', ') : msg;

        switch (status) {
          case 400:
            setApiError(joined || 'Validation failed. Please check your inputs and try again.');
            break;
          case 409:
            setApiError(joined || 'This email is already registered. Try logging in instead.');
            break;
          case 422:
            setApiError(joined || 'The server could not process your request. Check your form data.');
            break;
          case 500:
            setApiError('Internal server error. The database may be unreachable — please try again later.');
            break;
          default:
            setApiError(joined || `Registration failed (HTTP ${status}). Please try again.`);
        }
      }

      console.error('[SignupPage] Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              Join the<br />GateFlow Network.
            </h2>
            <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-xs">
              Create your account to access QR-based entry tracking, incident
              reporting, and emergency alerts — all from one place.
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
      <main className="flex-1 bg-slate-50 py-10 px-6 sm:px-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile-only brand header */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield size={15} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-[14px] text-slate-900 leading-none">GateFlow</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Smart Security System</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Fill in your details to register.
            </p>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/80 rounded-2xl overflow-hidden">
            <CardContent className="px-5 pt-6 pb-5 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection - Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Role</Label>
                  <div className="relative" ref={roleRef}>
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setRoleOpen((o) => !o)}
                      className="w-full h-9 pl-8 pr-3 text-sm text-left border border-slate-300 rounded-md bg-white flex items-center justify-between shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors hover:bg-slate-50"
                    >
                      <span className={formData.role ? 'text-slate-900' : 'text-slate-500'}>
                        {formData.role || 'Select your role'}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-slate-500 transition-transform ${roleOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {roleOpen && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-300 bg-white shadow-lg overflow-hidden">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleChange(r)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${
                              formData.role === r
                                ? 'font-medium text-slate-900 bg-slate-50'
                                : 'text-slate-700'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.role && <p className="text-[11px] text-red-500">{errors.role}</p>}
                </div>

                {/* ── Row: First Name + Last Name ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-medium text-slate-700">
                      First Name
                    </Label>
                    <div className="relative">
                      <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                    {errors.firstName && <p className="text-[11px] text-red-500">{errors.firstName}</p>}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-medium text-slate-700">
                      Last Name
                    </Label>
                    <div className="relative">
                      <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Dela Cruz"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                    {errors.lastName && <p className="text-[11px] text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                {/* ID Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="idNumber" className="text-xs font-medium text-slate-700">
                    {formData.role === 'Student' ? 'Student ID Number' : 'Faculty/Staff ID Number'}
                  </Label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="xx-x-xxxxx"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.idNumber && <p className="text-[11px] text-red-500">{errors.idNumber}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Institutional Email
                  </Label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@vsu.edu.ph"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                </div>

                {/* Current Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentAddress" className="text-xs font-medium text-slate-700">
                    Current Address
                  </Label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="currentAddress"
                      type="text"
                      placeholder="Street, City, Province, Zip Code"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.currentAddress && <p className="text-[11px] text-red-500">{errors.currentAddress}</p>}
                </div>

                {/* Staying in Dormitory - Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Are you staying in a dormitory?</Label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select
                      value={formData.staysInDorm}
                      onChange={(e) => setFormData((prev) => ({ ...prev, staysInDorm: e.target.value as 'yes' | 'no' | '' }))}
                      className="w-full h-9 pl-8 pr-3 text-sm border border-slate-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors hover:bg-slate-50 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {errors.staysInDorm && <p className="text-[11px] text-red-500">{errors.staysInDorm}</p>}
                </div>

                {/* ── Contact Number ── */}
                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber" className="text-xs font-medium text-slate-700">
                    Contact Number
                  </Label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="09XXXXXXXXX"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-[11px] text-red-500">{errors.contactNumber}</p>
                  )}
                </div>

                {/* Department / Course */}
                <div className="space-y-1.5">
                  <Label htmlFor="departmentCourse" className="text-xs font-medium text-slate-700">
                    {formData.role === 'Student' ? 'Course & Year' : 'Department / Office'}
                  </Label>
                  <div className="relative">
                    <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="departmentCourse"
                      type="text"
                      placeholder={
                        formData.role === 'Student'
                          ? 'e.g. BS Computer Science – 3rd Year'
                          : 'e.g. College of Engineering and Technology'
                      }
                      value={formData.departmentCourse}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.departmentCourse && (
                    <p className="text-[11px] text-red-500">{errors.departmentCourse}</p>
                  )}
                </div>

                {/* Divider – Uploads */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-500 font-medium">Uploads</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Upload ID Picture (all roles) */}
                {formData.role && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Upload ID Picture</Label>
                    <input
                      ref={idPictureRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setIdPicture(file);
                        if (file) setErrors((p) => ({ ...p, idPicture: '' }));
                      }}
                    />
                    {idPicture ? (
                      <div className="flex items-center gap-2 h-9 px-3 border border-slate-300 rounded-md bg-slate-50 text-sm text-slate-700">
                        <ImageIcon size={14} className="shrink-0 text-slate-500" />
                        <span className="truncate flex-1">{idPicture.name}</span>
                        <button
                          type="button"
                          onClick={() => { setIdPicture(null); if (idPictureRef.current) idPictureRef.current.value = ''; }}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => idPictureRef.current?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer"
                      >
                        <Upload size={18} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Click to upload an image</span>
                      </button>
                    )}
                    {errors.idPicture && <p className="text-[11px] text-red-500">{errors.idPicture}</p>}
                  </div>
                )}

                {/* Upload COR – Students only */}
                {formData.role === 'Student' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Upload COR (PDF)</Label>
                    <input
                      ref={corFileRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setCorFile(file);
                        if (file) setErrors((p) => ({ ...p, corFile: '' }));
                      }}
                    />
                    {corFile ? (
                      <div className="flex items-center gap-2 h-9 px-3 border border-slate-300 rounded-md bg-slate-50 text-sm text-slate-700">
                        <FileText size={14} className="shrink-0 text-slate-500" />
                        <span className="truncate flex-1">{corFile.name}</span>
                        <button
                          type="button"
                          onClick={() => { setCorFile(null); if (corFileRef.current) corFileRef.current.value = ''; }}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => corFileRef.current?.click()}
                        className="w-full h-20 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer"
                      >
                        <Upload size={18} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Click to upload a PDF</span>
                      </button>
                    )}
                    {errors.corFile && <p className="text-[11px] text-red-500">{errors.corFile}</p>}
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-500 font-medium">Security</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
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
                  {errors.password && <p className="text-[11px] text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
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
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms notice */}
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  By registering, you agree that your campus entry data may be recorded
                  and monitored in accordance with VSU security policies.
                </p>

                {/* API Error */}
                {apiError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 flex items-start gap-2">
                    <Shield size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-red-600 leading-relaxed">{apiError}</p>
                  </div>
                )}

                {/* Submit */}
                <Button type="submit" disabled={isSubmitting} className="w-full h-9 gap-2 text-sm font-medium">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {isSubmitting ? 'Creating Account…' : 'Create Account'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-5 pb-5 pt-0">
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                Already have an account?
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-slate-900 font-medium hover:underline underline-offset-2 transition-colors"
                >
                  Sign in
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
  );
};

export default SignupPage;
