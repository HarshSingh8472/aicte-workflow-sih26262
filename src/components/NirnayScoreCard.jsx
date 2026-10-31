import React, { useState } from 'react';
import { ShieldCheck, Award, AlertTriangle, XCircle, Info, ChevronRight, X, Sparkles } from 'lucide-react';
import { calculateNirnayIndex } from '../services/ruleEngine';

export default function NirnayScoreCard({ institution, rules, currentDate, compact = false }) {
  const [modalOpen, setModalOpen] = useState(false);
  const nirnay = calculateNirnayIndex(institution, rules, currentDate);

  const toneConfig = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'bg-emerald-500 text-slate-950',
      bar: 'bg-emerald-500',
      ring: 'ring-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      badge: 'bg-blue-500 text-white',
      bar: 'bg-blue-500',
      ring: 'ring-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badge: 'bg-amber-500 text-slate-950',
      bar: 'bg-amber-500',
      ring: 'ring-amber-500/20'
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badge: 'bg-rose-500 text-white',
      bar: 'bg-rose-500',
      ring: 'ring-rose-500/20'
    }
  };

  const currentTone = toneConfig[nirnay.bandTone] || toneConfig.blue;

  if (compact) {
    return (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all hover:scale-105 ${currentTone.bg}`}
          title="Click to view NIRNAY Index Audit Telemetry"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span className="font-mono">{nirnay.score}/100</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-white/10">
            {nirnay.bandGrade}
          </span>
        </button>

        {modalOpen && renderModal()}
      </>
    );
  }

  function renderModal() {
    return (
      <div 
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 text-slate-900"
        onClick={() => setModalOpen(false)}
      >
        <div 
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  NIRNAY Index Telemetry & Audit
                </h3>
                <p className="text-[11px] text-slate-500">
                  National Institutional Regulatory Norms & Auditing Yield
                </p>
              </div>
            </div>
            <button 
              onClick={() => setModalOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Evaluated Score
            </span>
            <div className="flex items-baseline justify-center gap-1 font-sans">
              <span className="text-4xl font-extrabold text-slate-900 font-mono">{nirnay.score}</span>
              <span className="text-slate-400 font-semibold text-lg">/100</span>
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${currentTone.badge}`}>
                Grade {nirnay.bandGrade}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800">{nirnay.band}</p>
            <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
              "{nirnay.entitlement}"
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
              Regulatory Dimensions Weightage:
            </span>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">1. Structural & Instructional Space (Classrooms, Labs, Land)</span>
                <strong className="text-slate-900">{nirnay.breakdown.spaceScore} / 30</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(nirnay.breakdown.spaceScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">2. Academic Human Capital (Faculty Ratio & Cadre)</span>
                <strong className="text-slate-900">{nirnay.breakdown.humanCapitalScore} / 30</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(nirnay.breakdown.humanCapitalScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">3. Statutory & Financial Security (Fire NOC, FDR, Stability)</span>
                <strong className="text-slate-900">{nirnay.breakdown.statutoryScore} / 25</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(nirnay.breakdown.statutoryScore / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">4. Procedural Governance & SLA Compliance</span>
                <strong className="text-slate-900">{nirnay.breakdown.governanceScore} / 15</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(nirnay.breakdown.governanceScore / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl border ${currentTone.bg} flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono border ${currentTone.bg} shadow-inner`}>
          <span className="text-base font-black leading-none">{nirnay.score}</span>
          <span className="text-[9px] uppercase font-bold tracking-tighter opacity-70">/100</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">NIRNAY Regulatory Index</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${currentTone.badge}`}>
              Grade {nirnay.bandGrade}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{nirnay.band}</p>
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 text-[11px] font-bold border border-slate-200/80 shadow-2xs transition-all flex items-center gap-1 shrink-0"
      >
        <span>Telemetry</span>
        <ChevronRight className="w-3 h-3" />
      </button>

      {modalOpen && renderModal()}
    </div>
  );
}

