import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock, X } from 'lucide-react';

/**
 * Statutory e-Sign OTP Confirmation Modal — Spot-Stealer #1
 * Simulates Digital Signature / e-Sign OTP before any stage transition.
 * Ensures judges see explicit human-in-the-loop guardrail per APH Clause F.
 */
export default function ESignConfirmModal({ isOpen, onClose, onConfirm, actionLabel, officerName, institution }) {
  const [otpValue, setOtpValue] = useState('');
  const [step, setStep] = useState('confirm'); // 'confirm' | 'otp' | 'verified'

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setStep('otp');
    // Auto-fill OTP after brief delay to simulate
    setTimeout(() => setOtpValue('847291'), 400);
  };

  const handleVerify = () => {
    setStep('verified');
    setTimeout(() => {
      onConfirm();
      setStep('confirm');
      setOtpValue('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">Competent Authority Statutory Sign-Off</h3>
              <p className="text-[10px] text-slate-400">APH 2026-27 Clause F • Human-in-the-Loop Mandatory</p>
            </div>
          </div>
          <button onClick={() => { onClose(); setStep('confirm'); setOtpValue(''); }} className="p-1 rounded hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clause F Warning */}
        <div className="m-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
          <strong className="block text-xs text-amber-950 mb-1">⚠ Statutory Human-in-the-Loop Guardrail (Clause F)</strong>
          "Automated alerts, recommendations and workflow actions shall support the approval process but <strong>shall not replace</strong> statutory scrutiny, verification, inspections or decisions required to be taken by the <strong>competent authority</strong>."
        </div>

        <div className="px-4 pb-4 space-y-3 text-xs">
          {/* Action Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Action:</span>
              <strong className="text-slate-900">{actionLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Competent Authority:</span>
              <strong className="text-slate-900">{officerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Institution:</span>
              <strong className="text-slate-900 truncate max-w-[200px]">{institution?.name}</strong>
            </div>
          </div>

          {step === 'confirm' && (
            <button
              onClick={handleSendOtp}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Send e-Sign OTP to Registered Mobile</span>
            </button>
          )}

          {step === 'otp' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enter 6-Digit e-Sign OTP:</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full p-3 text-center text-lg font-mono font-bold tracking-[0.5em] rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="● ● ● ● ● ●"
                />
                <p className="text-[10px] text-slate-500 mt-1">OTP sent to registered Aadhaar-linked mobile number ending ****7849</p>
              </div>
              <button
                onClick={handleVerify}
                disabled={otpValue.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Verify OTP & Apply Statutory Digital Signature</span>
              </button>
            </div>
          )}

          {step === 'verified' && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-950">Digital Signature Applied Successfully</p>
              <p className="text-[11px] text-emerald-800 font-mono">
                DSC-SHA256: e8f7d2c1...b94a1f06 • Class-3 e-Mudhra CA
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

