import React, { useState } from 'react';
import {
  Shield, MapPin, QrCode, Megaphone, Users, ClipboardList,
  Bell, Mail, UserRound, Phone, FileText, Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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

interface VisitorFormData {
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  personToVisit: string;
  purposeOfVisit: string;
}

const VisitorPassPage: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Partial<VisitorFormData>>({});

  const [formData, setFormData] = useState<VisitorFormData>({
    fullName: '',
    email: '',
    contactNumber: '',
    address: '',
    personToVisit: '',
    purposeOfVisit: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (errors[id as keyof VisitorFormData]) {
      setErrors((prev) => ({
        ...prev,
        [id]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VisitorFormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.personToVisit.trim()) newErrors.personToVisit = 'Person to visit is required';
    if (!formData.purposeOfVisit.trim()) newErrors.purposeOfVisit = 'Purpose of visit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/login', { state: { message: 'Visitor pass application submitted!' } });
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
              Visiting the<br />Campus?
            </h2>
            <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-xs">
              Apply for a visitor pass to gain authorized access to the campus.
              Your pass will be reviewed and approved by security personnel.
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for a Visitor Pass</h1>
            <p className="text-slate-500 text-sm mt-1">
              Fill in your details to request campus access
            </p>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/80 rounded-2xl overflow-hidden">
            <CardContent className="px-5 pt-6 pb-5 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan dela Cruz"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-red-500">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                </div>

                {/* Contact Number */}
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
                  {errors.contactNumber && <p className="text-[11px] text-red-500">{errors.contactNumber}</p>}
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-medium text-slate-700">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Street, City, Province, Zip Code"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.address && <p className="text-[11px] text-red-500">{errors.address}</p>}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-500 font-medium">Visit Details</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Person to Visit */}
                <div className="space-y-1.5">
                  <Label htmlFor="personToVisit" className="text-xs font-medium text-slate-700">
                    Person to Visit
                  </Label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="personToVisit"
                      type="text"
                      placeholder="Name of person to visit"
                      value={formData.personToVisit}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.personToVisit && <p className="text-[11px] text-red-500">{errors.personToVisit}</p>}
                </div>

                {/* Purpose of Visit */}
                <div className="space-y-1.5">
                  <Label htmlFor="purposeOfVisit" className="text-xs font-medium text-slate-700">
                    Purpose of Visit
                  </Label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <Input
                      id="purposeOfVisit"
                      type="text"
                      placeholder="e.g. Meeting, Consultation, Delivery"
                      value={formData.purposeOfVisit}
                      onChange={handleInputChange}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  {errors.purposeOfVisit && <p className="text-[11px] text-red-500">{errors.purposeOfVisit}</p>}
                </div>

                {/* Notice */}
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  By submitting, you agree that your visit data may be recorded
                  and monitored in accordance with VSU campus security policies.
                </p>

                {/* Submit */}
                <Button type="submit" className="w-full h-9 gap-2 text-sm font-medium">
                  <Send size={14} />
                  Submit Visitor Pass Application
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

export default VisitorPassPage;
