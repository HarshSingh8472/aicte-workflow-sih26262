import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  CheckCircle2, 
  RotateCcw, 
  BookOpen, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function RuleConfigModal({
  isOpen,
  onClose,
  currentRules,
  onSaveRules
}) {
  const [formData, setFormData] = useState({ ...currentRules });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleResetDefaults = () => {
    setFormData({
      minClassroomSqm: 66,
      minLabSqm: 66,
      ugFacultyStudentRatio: 15,
      pgFacultyStudentRatio: 12,
      minUrbanLandAcres: 2.5,
      scrutinySlaDays: 7,
      evcScheduleSlaDays: 5,
      evcCompleteSlaDays: 15,
      advanceExpiryAlertDays: 30
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveRules(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Live APH Handbook Rule & SLA Configurator
              </h3>
              <p className="text-xs text-slate-500">
                AICTE Approval Process Handbook (APH 2026-27 Policy Editor)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Modifying these handbook thresholds will instantly recalculate compliance scores, faculty ratios, and classroom pass/fail verdicts across all 6 registered colleges in real-time.
            </p>
          </div>

          {/* Section 1: Physical Infrastructure */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              1. Physical Infrastructure Dimensions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Classroom (sq.m):
                </label>
                <input
                  type="number"
                  min="40"
                  max="120"
                  value={formData.minClassroomSqm}
                  onChange={(e) => handleChange('minClassroomSqm', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">Default: 66 sq.m</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Laboratory (sq.m):
                </label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={formData.minLabSqm}
                  onChange={(e) => handleChange('minLabSqm', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">Default: 66 sq.m</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Urban Land (Acres):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={formData.minUrbanLandAcres}
                  onChange={(e) => handleChange('minUrbanLandAcres', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">Default: 2.5 Acres</span>
              </div>
            </div>
          </div>

          {/* Section 2: Faculty Ratios */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              2. Faculty-Student Cadre Ratios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UG Faculty Ratio (1:N):
                </label>
                <input
                  type="number"
                  min="10"
                  max="30"
                  value={formData.ugFacultyStudentRatio}
                  onChange={(e) => handleChange('ugFacultyStudentRatio', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">Default: 1:15 (Engineering UG)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  PG Faculty Ratio (1:N):
                </label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={formData.pgFacultyStudentRatio}
                  onChange={(e) => handleChange('pgFacultyStudentRatio', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">Default: 1:12 (M.Tech / MBA)</span>
              </div>
            </div>
          </div>

          {/* Section 3: SLA Days & Expiry Sentinel */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              3. SLA Deadlines & Expiry Alert Window:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scrutiny SLA (Days):
                </label>
                <input
                  type="number"
                  min="3"
                  max="21"
                  value={formData.scrutinySlaDays}
                  onChange={(e) => handleChange('scrutinySlaDays', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Default: 7 Days</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  EVC Schedule SLA:
                </label>
                <input
                  type="number"
                  min="2"
                  max="14"
                  value={formData.evcScheduleSlaDays}
                  onChange={(e) => handleChange('evcScheduleSlaDays', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Default: 5 Days</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  EVC Complete SLA:
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={formData.evcCompleteSlaDays || 15}
                  onChange={(e) => handleChange('evcCompleteSlaDays', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Default: 15 Days</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expiry Alert (Days):
                </label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  value={formData.advanceExpiryAlertDays}
                  onChange={(e) => handleChange('advanceExpiryAlertDays', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
                <span className="text-[10px] text-slate-500">Default: 30 Days</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Standard APH Norms</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                {savedSuccess ? 'Saved & Evaluated!' : 'Save & Re-evaluate All Colleges'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
