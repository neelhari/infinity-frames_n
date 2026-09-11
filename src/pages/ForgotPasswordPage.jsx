import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BRAND } from '../config/brand';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setLoading(false);
      setSubmitted(true);
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
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Enter your registered email and we'll send you an instant link to recover access to your customized gift orders.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-emerald-900">Recovery Link Sent!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  We have dispatched a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block bg-[#1A1A1A] text-[#D4AF37] text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/15 transition-all px-4 bg-white">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending Recovery Email...' : 'Send Password Reset Link'}</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#B38029]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
