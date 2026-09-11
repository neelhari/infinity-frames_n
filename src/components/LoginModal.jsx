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
    setOtpDigits(['1', '2', '3', '4']);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

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
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer font-bold"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Luxury Header Banner */}
        <div className="relative bg-gradient-to-r from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] text-white p-6 sm:p-7 overflow-hidden border-b border-[#D4AF37]/30">
          <div className="relative z-10 space-y-1.5">
            <span className="text-[10px] tracking-widest font-extrabold text-[#D4AF37] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>{BRAND.name} Member Portal</span>
            </span>
            <h2 className="font-serif text-2xl font-bold text-white">
              {authStep === 'phone' ? 'Log In / Register' : 'Verify with OTP'}
            </h2>
            <p className="text-xs text-gray-300">
              {authStep === 'phone'
                ? 'Save your 3D gift designs, track printing status & quick checkout.'
                : `Sent 4-digit OTP to +91 ${phoneNumber}`}
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />
        </div>

        {/* Modal Form Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {authStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all overflow-hidden bg-white">
                  <span className="bg-gray-50 px-3.5 py-3 text-xs font-bold text-gray-600 border-r border-gray-200 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-3 text-xs font-semibold text-gray-900 focus:outline-hidden"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name (Optional for new members)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Varma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-3 text-xs rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div className="text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to {BRAND.name}'s{' '}
                <a href="/terms" className="text-[#B38029] font-bold underline">Terms</a> &{' '}
                <a href="/privacy-policy" className="text-[#B38029] font-bold underline">Photo Privacy Policy</a>.
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 disabled:opacity-50 text-gray-950 font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Sending OTP...' : 'CONTINUE WITH OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-600">
                  Enter the 4-digit code sent to <strong>+91 {phoneNumber}</strong>
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-extrabold rounded-xl border-2 border-gray-300 focus:border-[#D4AF37] focus:outline-hidden bg-gray-50"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center text-xs">
                <span className="text-gray-500">Didn't receive code? </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                  className={`font-bold ${
                    timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#B38029] hover:underline'
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Verifying...' : 'VERIFY & PROCEED'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthStep('phone')}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline"
                >
                  Edit phone number
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted Customer Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
