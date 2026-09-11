import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#6B1518] text-white p-8 sm:p-10 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-1.5">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Log In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Access your order history, delivery addresses, and seamless express checkout.
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

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email (e.g. harini@aalayavastra.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
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
                  className="text-xs sm:text-sm text-[#6B1518] font-bold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Log In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>{loading ? 'Logging In...' : 'LOG IN'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Sign Up / Create Account Prompt */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600">
                Don't have an account yet?{' '}
                <Link
                  to={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="text-[#6B1518] font-extrabold hover:underline inline-flex items-center gap-1"
                >
                  <span>Create an Account</span>
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
