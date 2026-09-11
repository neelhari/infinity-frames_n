import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function LoginModal() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    authStep,
    setAuthStep,
    sendOtp,
    verifyOtp,
    loginRedirectUrl,
  } = useAuth();

  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    let interval = null;
    if (authStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, timer]);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    await sendOtp(phoneNumber);
    setLoading(false);
    setTimer(30);
    setOtpDigits(['1', '2', '3', '4']); // Autofill demo OTP for instant convenience
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-focus next input box
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await verifyOtp(enteredOtp, fullName);
    setLoading(false);

    if (res.success) {
      if (res.redirect) {
        navigate(res.redirect);
      }
    } else {
      setErrorMsg(res.error || 'Invalid OTP');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    await sendOtp(phoneNumber);
    setLoading(false);
    setTimer(30);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Myntra-style Luxury Header Banner */}
        <div className="relative bg-[#6B1518] text-white p-6 sm:p-7 overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Membership
            </span>
            <h2 className="font-serif text-2xl font-bold">
              {authStep === 'phone' ? 'Login or Signup' : 'Verify with OTP'}
            </h2>
            <p className="text-xs text-gray-200">
              {authStep === 'phone'
                ? 'Get instant order tracking, member discounts & fast checkout.'
                : `Sent 4-digit OTP to +91 ${phoneNumber}`}
            </p>
          </div>

          {/* Decorative Lotus & Pattern Overlays */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#D3923A]/15 pointer-events-none" />
          <div className="absolute right-6 top-6 opacity-20 pointer-events-none text-4xl font-serif">
            🥻
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {authStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all overflow-hidden bg-white">
                  <span className="bg-gray-50 px-3.5 py-3 text-xs font-bold text-gray-600 border-r border-gray-200 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10 digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Your Full Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harini Jupudy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-3 text-xs rounded-xl border border-gray-300 focus:border-[#6B1518] focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to {BRAND.name}'s{' '}
                <a href="/terms" className="text-[#6B1518] font-bold underline">Terms of Use</a> &{' '}
                <a href="/privacy-policy" className="text-[#6B1518] font-bold underline">Privacy Policy</a>.
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>{loading ? 'Sending OTP...' : 'CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2 text-center">
                <label className="block text-xs font-bold text-gray-700">
                  Enter 4-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-extrabold rounded-xl border-2 border-gray-300 focus:border-[#6B1518] focus:outline-none bg-gray-50"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">
                  ✓ Demo OTP <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">1234</span> auto-filled for instant login.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setAuthStep('phone')}
                  className="text-gray-500 hover:text-gray-800 font-bold"
                >
                  Change Mobile
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                  className={`font-bold ${
                    timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B1518] hover:underline'
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>{loading ? 'Verifying...' : 'VERIFY & PROCEED'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Trust badges */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> 100% Safe & Secure
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#D3923A]" /> Authentic Handloom
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
