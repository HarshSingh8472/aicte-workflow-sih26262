import React, { useState } from 'react';
import { 
  Scale, 
  Gavel, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Stamp,
  Building,
  UploadCloud
} from 'lucide-react';
import WorkflowPipeline from './WorkflowPipeline';
import ESignConfirmModal from './ESignConfirmModal';

export default function SacAppealView({
  institutions = [],
  onGrantAppeal,
  onDismissAppeal,
  onViewAudit
}) {
  // Filter for institutions in SAC Appeal stage or Path-4
  const appealColleges = institutions.filter(
    i => i.currentStage === 'sac_appeal' || i.assignedPath === 'path-4'
  );

  const [selectedId, setSelectedId] = useState(
    appealColleges.find(c => c.currentStage === 'sac_appeal')?.id || appealColleges[0]?.id || institutions[0]?.id
  );

  const selectedInst = institutions.find(i => i.id === selectedId) || institutions[0];

  const [benchVerdict, setBenchVerdict] = useState('');
  const [eSignOpen, setESignOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [benchMembers] = useState([
    "Hon'ble Justice (Retd.) P. N. Verma (Former Judge, High Court)",
    "Prof. (Dr.) S. C. Sahasrabudhe (Former Director, IIT / AICTE Senior Fellow)",
    "Regional Officer (Ex-Officio Member Secretary)"
  ]);

  const appealData = selectedInst?.appealDetails || {
    filedDate: '2026-10-18',
    appellant: `${selectedInst?.name || 'Institution'} Management Trust`,
    grounds: 'Physical deficiencies rectified post-EVC. Additional faculty appointed with Aadhaar validation.',
    hearingScheduledDate: '2026-10-30',
    appellateBench: "Hon'ble Standing Appellate Committee",
    status: 'Hearing Scheduled'
  };

  const deficiencyReasons = selectedInst?.evcInspection?.deficiencyReasons || [
    "Instructional carpet area in 2 classrooms below 66 sq.m minimum APH norm.",
    "Faculty to student ratio at 1:19.0 exceeding 1:15 limit.",
    "Upper floor construction incomplete during initial inspection visit."
  ];

  return (
    <div className="space-y-5">
      {/* Module Compact Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-sans">
                  Stage 3: SAC / SHC Standing Appellate Bench
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Quasi-Judicial Forum
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Institutional Grievance Hearings against Scrutiny / EVC Deficiencies (APH Chapter II)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Appeal Case:</span>
            <select
              value={selectedInst?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-[220px] truncate"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Institution Live Metric Strip */}
        {selectedInst && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs items-center">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Appellant Institution</span>
              <span className="font-bold text-white text-xs truncate block">{selectedInst.name}</span>
              <span className="font-mono text-amber-300 text-[11px] font-semibold">{selectedInst.permanentId}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Filing Date & Docket</span>
              <span className="font-semibold text-slate-200 text-xs block">{appealData.filedDate}</span>
              <span className="text-[11px] text-slate-400 block">Docket: SAC-2026-{selectedInst.permanentId ? selectedInst.permanentId.slice(-4) : '0000'}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Bench Hearing Status</span>
              <span className="font-semibold text-amber-300 text-xs block">{appealData.status}</span>
              <span className="text-[11px] text-slate-400 block">Hon'ble High Court Retd. Bench</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Appellate SLA Timer</span>
              <span className="font-mono text-emerald-400 font-bold text-xs block">
                {selectedInst.slaDaysRemaining !== undefined ? `${selectedInst.slaDaysRemaining} Days Left` : 'Active'}
              </span>
              <span className="text-[11px] text-slate-400 block">Mandatory 10d Order Window</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Pipeline */}
      {selectedInst && <WorkflowPipeline institution={selectedInst} />}

      {/* Clause F — Statutory Human-in-the-Loop Disclaimer */}
      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-xs text-amber-950">APH Clause F — Quasi-Judicial Forum:</strong>{' '}
          All appellate bench orders constitute <strong>statutory decisions by the competent judicial authority</strong>. Digital signature and bench seal are mandatory before order enforcement.
        </div>
      </div>

      {/* Grid: Grounds for Appeal vs Appellate Bench Judgment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (6 cols): Appeal Dossier & Rectified Evidence */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Appeal Memorandum & EVC Deficiency Dossier
            </h3>
            <p className="text-xs text-slate-500">Formal grievance petition submitted by College Management</p>
          </div>

          {/* Original Deficiencies Flagged */}
          <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Deficiencies Recorded by Inspection Team:
            </span>
            <ul className="space-y-1.5 text-xs text-rose-900 list-disc list-inside">
              {deficiencyReasons.map((reason, idx) => (
                <li key={idx} className="leading-relaxed">{reason}</li>
              ))}
            </ul>
          </div>

          {/* Appellant Submission & Grounds */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2 text-xs">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-amber-700" />
              Grounds of Appeal Raised by Appellant:
            </span>
            <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-amber-200/60">
              "{appealData.grounds}"
            </p>
          </div>

          {/* Rectified Proof Documents */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Rectified Compliance Proofs Uploaded:</span>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Civil Contractor Completion Certificate</span>
                  <span className="text-[11px] text-slate-500">3rd floor electrification & plastering completed with geo-photos</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">8 New Assistant Professor Appointment Deeds</span>
                  <span className="text-[11px] text-slate-500">Ph.D / M.Tech qualification verified; joins effective Oct 2026</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Quasi-Judicial Appellate Bench Proceedings */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-600" />
                Appellate Hearing Bench & Quasi-Judicial Order
              </h3>
              <p className="text-xs text-slate-500">Bench members review rectified evidence in open hearing</p>
            </div>

            {/* Bench Members */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                Constituted Appellate Bench:
              </span>
              {benchMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{member}</span>
                </div>
              ))}
            </div>

            {/* Hearing Notes Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Hon'ble Appellate Bench Formal Order & Ratio Decidendi:
              </label>
              <textarea
                value={benchVerdict}
                onChange={(e) => setBenchVerdict(e.target.value)}
                placeholder="Enter formal bench judgment (e.g. Having examined the documentary evidence and certified contractor completion certificate, the Bench finds the deficiency remediated. Appeal is Allowed with direction for Regional Officer to issue EoA)..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bench Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => { setPendingAction('grant'); setESignOpen(true); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                title="Grant appeal, overturn deficiency rejection, and route to Regional Officer for final EoA"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bench Recommendation: Grant Appeal — e-Sign Required</span>
              </button>

              <button
                onClick={() => { setPendingAction('dismiss'); setESignOpen(true); }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
                title="Dismiss appeal and confirm rejection of approval for academic year 2026-27"
              >
                <XCircle className="w-4 h-4" />
                <span>Bench Order: Dismiss — e-Sign Required</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Bench decision generates legally binding digital order</span>
              <button 
                onClick={() => onViewAudit(selectedInst)} 
                className="text-amber-700 hover:underline font-medium"
              >
                View Appellate Audit Trail
              </button>
            </div>
          </div>
        </div>

      </div>
      {/* Statutory e-Sign OTP Confirmation Modal */}
      <ESignConfirmModal
        isOpen={eSignOpen}
        onClose={() => setESignOpen(false)}
        onConfirm={() => {
          if (pendingAction === 'grant') onGrantAppeal(selectedInst, benchVerdict);
          if (pendingAction === 'dismiss') onDismissAppeal(selectedInst, benchVerdict);
          setPendingAction(null);
        }}
        actionLabel={pendingAction === 'grant' ? 'Grant Appeal — Issue Formal Bench Order' : 'Dismiss Appeal — Confirm Rejection Order'}
        officerName="Hon'ble SAC Appellate Bench (Retd. High Court Justice)"
        institution={selectedInst}
      />
    </div>
  );
}
