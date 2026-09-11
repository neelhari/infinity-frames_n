import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { BRAND } from '../config/brand';

export default function AdminLogin() {
  const { session, signIn } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    const redirectTo = location.state?.from?.pathname || '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(cleanEmail, cleanPassword);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Sign in failed. Check your email and password.');
      return;
    }
    navigate(location.state?.from?.pathname || '/admin', { replace: true });
  };

  const handleQuickFill = async () => {
    setEmail('admin@aalayavastra.com');
    setPassword('admin123');
    setError('');
    setSubmitting(true);
    const result = await signIn('admin@aalayavastra.com', 'admin123');
    setSubmitting(false);

    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.message || 'Sign in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-xl p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#6B1518] text-[#D3923A] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
            {BRAND.name?.slice(0, 2)?.toUpperCase() || 'AV'}
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#6B1518]">Admin Sign In</h1>
          <p className="text-[11px] text-gray-500">{BRAND.name} Store CMS — Authorized access only</p>
        </div>

        {/* 1-Click Quick Fill Button */}
        <button
          type="button"
          onClick={handleQuickFill}
          className="w-full bg-[#FAF5EE] hover:bg-[#F3EAE0] border border-[#D3923A]/50 text-[#6B1518] py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#D3923A]" />
          <span>1-Click Master Admin Login</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aalayavastra.com"
                className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoCapitalize="none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{submitting ? 'Signing In...' : 'Sign In as Admin'}</span>
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Master login: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-700">admin@aalayavastra.com</code> / <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-700">admin123</code>
        </p>
      </div>
    </div>
  );
}
