import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function SignupPage() {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your Full Name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid Email Address');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const res = await signup(formData);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl, { replace: true });
    } else {
      setErrorMsg(res.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Full Header Banner */}
        <div className="bg-[#6B1518] text-white p-8 sm:p-10 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-1.5">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Membership
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Join Aalaya Vastra to track orders, save delivery addresses & access exclusive offers.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-100 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                <User className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name (e.g. Harini Jupudy)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Email Address (MANDATORY) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email (e.g. name@example.com)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-700 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Number (OPTIONAL) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                Mobile Number <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white overflow-hidden">
                <span className="text-xs sm:text-sm font-bold text-gray-500 mr-3 pr-3 border-r border-gray-200">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit phone number (for order updates)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-gray-500 leading-relaxed pt-1">
              By creating an account, you agree to {BRAND.name}'s{' '}
              <Link to="/terms" className="text-[#6B1518] font-bold underline">Terms of Use</Link> &{' '}
              <Link to="/privacy-policy" className="text-[#6B1518] font-bold underline">Privacy Policy</Link>.
            </div>

            {/* Create Account Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'CREATE ACCOUNT'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Link to Login */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="text-[#6B1518] font-extrabold hover:underline inline-flex items-center gap-1"
                >
                  <span>Log In here</span>
                  <span>→</span>
                </Link>
              </p>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#D3923A]" /> 100% Authentic Handloom
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
