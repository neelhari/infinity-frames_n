import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BRAND } from '../config/brand';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setLoading(false);
      setSuccess(true);
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
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Set a new secure password for your Infinity Frames N account.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-emerald-900">Password Updated Successfully!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  You can now log in using your new password.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block bg-[#1A1A1A] text-[#D4AF37] text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                Proceed to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/15 transition-all px-4 bg-white">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3.5 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
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

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/15 transition-all px-4 bg-white">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-3.5 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
