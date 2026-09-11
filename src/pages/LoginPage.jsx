import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Email Address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your Password');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl, { replace: true });
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-16 bg-[#FAF9F6]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] text-white p-8 sm:p-10 relative overflow-hidden text-center sm:text-left border-b border-[#D4AF37]/30">
          <div className="relative z-10 space-y-2">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D4AF37] uppercase flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{BRAND.name}</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Log In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Track 3D printing orders, view saved custom gift proofs, and reorder past creations.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/15 transition-all px-4 bg-white">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email (e.g. customer@infinityframesn.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-800">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#B38029] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/15 transition-all px-4 bg-white">
                <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-hidden ml-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Switch to Register */}
          <div className="text-center pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs sm:text-sm text-gray-600">
              New to Infinity Frames N?{' '}
              <Link to="/signup" className="font-extrabold text-[#B38029] hover:underline">
                Create an Account
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe 256-Bit SSL Encrypted Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
