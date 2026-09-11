import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isSent, timer]);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const res = await sendPasswordResetEmail(email);
    setLoading(false);

    if (res.success) {
      setIsSent(true);
      setTimer(60);
      setCanResend(false);
    } else {
      setErrorMsg(res.error || 'Failed to send reset email. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrorMsg('');
    setLoading(true);
    const res = await sendPasswordResetEmail(email);
    setLoading(false);

    if (res.success) {
      setTimer(60);
      setCanResend(false);
    } else {
      setErrorMsg(res.error || 'Failed to resend email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#6B1518] text-white p-8 sm:p-10 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-1.5">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Security
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {isSent ? 'Check Your Inbox' : 'Forgot Password?'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {isSent
                ? `We sent a secure password reset link to ${email}.`
                : 'Enter your registered email address to receive a secure password reset link.'}
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isSent ? (
            <form onSubmit={handleSendResetLink} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email (e.g. name@example.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Sending Reset Link...' : 'SEND RESET LINK'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-center pt-3 border-t border-gray-100">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-[#6B1518] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                  Password Reset Link Sent!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                  We have dispatched a private password reset link to{' '}
                  <span className="font-bold text-gray-900">{email}</span>. Click the link in your email to choose a new password.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADEDF] text-xs text-gray-600 text-left space-y-1.5">
                <p className="font-bold text-gray-800 flex items-center gap-1.5">
                  <span>💡 Tip:</span>
                </p>
                <p>• If you don't see the email within 1-2 minutes, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</p>
                <p>• The reset link remains valid for 1 hour for your account security.</p>
              </div>

              {/* Resend Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className={`font-bold inline-flex items-center gap-1.5 ${
                    canResend
                      ? 'text-[#6B1518] hover:underline cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{canResend ? 'Resend Reset Email' : `Resend in ${timer}s`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-gray-500 hover:text-gray-900 font-bold"
                >
                  Use a different email
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-[#6B1518] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D3923A]" /> 100% Encrypted & Safe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
