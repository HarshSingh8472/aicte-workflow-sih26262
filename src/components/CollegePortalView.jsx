import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Award, 
  CreditCard, 
  ShieldAlert, 
  Layers, 
  FileCheck2,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import WorkflowPipeline from './WorkflowPipeline';
import NirnayScoreCard from './NirnayScoreCard';
import { evaluateClassrooms, evaluateFacultyRatio, evaluateLand } from '../services/ruleEngine';

export default function CollegePortalView({
  institutions = [],
  undertakings = [],
  aphRules,
  currentDate,
  onCreateApplication,
  onOpenUndertakingProofModal,
  onOpenDocumentRenewModal,
  onViewAudit,
  onRectifyDeficiency,
  onViewEoa
}) {
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id);
  const [wizardOpen, setWizardOpen] = useState(false);

  // New Application Wizard Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Bharat Institute of Emerging Technologies, Bengaluru',
    category: 'New Institution Setup + Emerging Courses',
    region: 'SRO',
    city: 'Bengaluru',
    state: 'Karnataka',
    programType: 'UG Engineering & Tech',
    landAcres: 2.8,
    totalStudents: 480,
    totalFaculty: 34,
    classroomsCount: 8,
    classroomSizeSqm: 68,
    labsCount: 4,
    labSizeSqm: 72
  });

  const selectedInst = institutions.find(i => i.id === selectedInstId) || institutions[0];

  // Associated undertakings and documents for selected institution
  const collegeUndertakings = undertakings.filter(u => u.institutionId === selectedInst?.id);
  const collegeDocs = selectedInst?.documents || [];
  const expiredDocs = collegeDocs.filter(d => d.status === 'expired');
  const approachingDocs = collegeDocs.filter(d => d.status === 'approaching_expiry');

  // Preview evaluations for wizard form
  const mockInstForEval = {
    totalStudents: formData.totalStudents,
    totalFaculty: formData.totalFaculty,
    landAcres: formData.landAcres,
    programType: formData.programType,
    classrooms: [
      { type: 'Classroom', carpetAreaSqm: formData.classroomSizeSqm },
      { type: 'Laboratory', carpetAreaSqm: formData.labSizeSqm }
    ]
  };

  const previewClassroom = evaluateClassrooms(mockInstForEval, aphRules);
  const previewFaculty = evaluateFacultyRatio(mockInstForEval, aphRules);
  const previewLand = evaluateLand(mockInstForEval, aphRules);

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    const classrooms = [];
    for (let i = 1; i <= formData.classroomsCount; i++) {
      classrooms.push({
        roomNo: `CR-${100 + i}`,
        carpetAreaSqm: Number(formData.classroomSizeSqm),
        type: 'Classroom',
        floor: i <= 4 ? 'Ground' : '1st Floor'
      });
    }
    for (let i = 1; i <= formData.labsCount; i++) {
      classrooms.push({
        roomNo: `LAB-${i}`,
        carpetAreaSqm: Number(formData.labSizeSqm),
        type: 'Computer / AI Lab',
        floor: '2nd Floor'
      });
    }

    await onCreateApplication({
      ...formData,
      classrooms
    });
    setWizardOpen(false);
    setWizardStep(1);
  };

  return (
    <div className="space-y-6">
      {/* College Portal Compact Context Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-sans">
                  College Administration & EoA Portal
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Institutional Self-Service
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                AICTE Approval Lifecycle, Undertakings Proofs & Statutory Compliance Monitoring
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* College Perspective Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Institution:</span>
              <select
                value={selectedInst?.id}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px] truncate"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* "+ Submit New AICTE Application" Wizard Button */}
            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Application</span>
            </button>
          </div>
        </div>

        {/* Selected Institution Live Metric Strip */}
        {selectedInst && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Institution & ID</span>
              <span className="font-bold text-white text-xs truncate block">{selectedInst.name}</span>
              <span className="font-mono text-amber-300 text-[11px] font-semibold">{selectedInst.permanentId}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Region & Campus Area</span>
              <span className="font-semibold text-slate-200">{selectedInst.region} • {selectedInst.landType || 'Urban'}</span>
              <span className="text-[11px] text-emerald-400 block font-medium">{selectedInst.landAcres} Acres Continuous Plot</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Faculty-Student Cadre</span>
              <span className={`font-mono font-bold text-xs ${selectedInst.facultyRatio <= aphRules.ugFacultyStudentRatio ? 'text-emerald-400' : 'text-rose-400'}`}>
                1:{selectedInst.facultyRatio} (Norm: 1:{aphRules.ugFacultyStudentRatio})
              </span>
              <span className="text-[11px] text-slate-400 block">{selectedInst.totalFaculty} Faculty / {selectedInst.totalStudents} Students</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Regulatory Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                {selectedInst.eoaIssued ? 'EoA Officially Granted' : selectedInst.status}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {selectedInst.eoaIssued ? 'Academic Year 2026-2027' : `SLA: ${selectedInst.slaDaysRemaining}d remaining`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* NIRNAY Institutional Regulatory Yield Scorecard */}
      {selectedInst && (
        <NirnayScoreCard 
          institution={selectedInst} 
          rules={aphRules} 
          currentDate={currentDate} 
        />
      )}

      {/* Real-Time Application Progress Pipeline */}
      {selectedInst && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-800">Active AICTE Workflow Pipeline & SLA Tracker:</span>
            <button
              onClick={() => onViewAudit(selectedInst)}
              className="text-blue-600 hover:underline font-medium"
            >
              View Cryptographic SHA-256 Audit Trail
            </button>
          </div>
          <WorkflowPipeline institution={selectedInst} />
        </div>
      )}

      {/* ACTION BANNER: RECTIFY DEFICIENCY & RE-SUBMIT (Spot-Stealer #5) */}
      {selectedInst && (selectedInst.currentStage === 'escalated_deficiency' || selectedInst.currentStage === 'sac_appeal') && (
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-indigo-950">
                  Deficiency Observation — Return for Rectification Window Open
                </h4>
                <p className="text-xs text-indigo-800">
                  AICTE allows institutions to rectify identified deficiencies and re-submit corrected documents before final SAC/SHC hearing
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-200 text-indigo-900 border border-indigo-300">
              Rectification Window
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-200/80 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">Identified deficiencies can be rectified by uploading corrected documents:</div>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
              <li>Corrected architect blueprints with Municipal Corporation re-stamp</li>
              <li>Updated faculty roster with new appointment letters</li>
              <li>GST invoice proofs for additional hardware procurement</li>
              <li>Renewed statutory NOC certificates</li>
            </ul>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Status: <strong className="text-indigo-800">{selectedInst.currentStage === 'escalated_deficiency' ? 'Deficiency Confirmed — Rectification Allowed' : 'Under SAC Review — Rectification Allowed'}</strong>
              </span>
              <button
                onClick={() => onRectifyDeficiency && onRectifyDeficiency(selectedInst)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Rectify Deficiency & Re-Submit to Scrutiny</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION BANNER 1: TIME-BOUND UNDERTAKING (If Present) */}
      {collegeUndertakings.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500 text-white rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Conditional Approval Undertaking Active (Strict Deadline)
                </h4>
                <p className="text-xs text-amber-800">
                  Deficiency remedy mandated under Chapter II Clause 2.7 of APH
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
              {collegeUndertakings[0].daysLeft} Days Remaining
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">{collegeUndertakings[0].ruleDeficiency}</div>
            <p className="text-slate-600 italic">"{collegeUndertakings[0].undertakingText}"</p>
            
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <span className="text-[11px] text-slate-500">
                Current Status: <strong className="text-amber-800">{collegeUndertakings[0].status}</strong>
              </span>

              {collegeUndertakings[0].status === 'Pending Proof' && (
                <button
                  onClick={() => onOpenUndertakingProofModal(collegeUndertakings[0])}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Compliance Proof (Tax Bills & Geo-Photos)</span>
                </button>
              )}

              {collegeUndertakings[0].status === 'Evidence Uploaded' && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Proof Uploaded (Under Officer Verification)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTION BANNER 2: STATUTORY DOCUMENT EXPIRY NOTICES (If Expired/Approaching) */}
      {(expiredDocs.length > 0 || approachingDocs.length > 0) && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-600 text-white rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-rose-950">
                  Critical Statutory Compliance & Renewal Alert
                </h4>
                <p className="text-xs text-rose-800">
                  Mandatory government certificates expired or approaching expiry date
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
              Action Mandatory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {expiredDocs.map(doc => (
              <div key={doc.id} className="p-3 bg-white rounded-xl border border-rose-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900 block">{doc.title}</span>
                  <span className="text-[11px] text-slate-500">Expired: {doc.expiryDate} (#{doc.docNumber})</span>
                </div>
                <button
                  onClick={() => onOpenDocumentRenewModal(selectedInst, doc)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                >
                  Upload Renewal
                </button>
              </div>
            ))}

            {approachingDocs.map(doc => (
              <div key={doc.id} className="p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">{doc.title}</span>
                  <span className="text-[11px] text-slate-500">Matures in {doc.daysRemaining} days ({doc.expiryDate})</span>
                </div>
                <button
                  onClick={() => onOpenDocumentRenewModal(selectedInst, doc)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px]"
                >
                  Revalidate Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Stamped Document Vault & Instructional Infrastructure Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): Submitted Statutory Document Repository */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Statutory Government Approvals & Certificates Repository
              </h3>
              <p className="text-xs text-slate-500">Land lease, Fire safety NOC, structural stability, and joint FDRs
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200">🔐 DigiLocker API</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">🏦 PFMS Bank API</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-800 border border-orange-200">🔥 Fire NOC Registry</span>
              </div></p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {collegeDocs.map((doc, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  doc.status === 'expired' 
                    ? 'bg-rose-50/70 border-rose-200' 
                    : doc.status === 'approaching_expiry'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{doc.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.status === 'expired' 
                        ? 'bg-rose-600 text-white' 
                        : doc.status === 'approaching_expiry'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {doc.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cert #: <span className="font-mono text-slate-700">{doc.docNumber}</span> • Expiry:{' '}
                    <span className="font-semibold text-slate-800">{doc.expiryDate}</span>
                  </p>
                  <p className="text-[10px] text-slate-600 italic mt-0.5">{doc.remarks}</p>
                </div>

                <button
                  onClick={() => onOpenDocumentRenewModal(selectedInst, doc)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-medium shrink-0"
                >
                  Renew / Upload
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Classroom & Facility Specs Overview */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Instructional Area & Faculty Compliance
            </h3>
            <p className="text-xs text-slate-500">Live preview against AICTE 2026-27 APH standards</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Classrooms & Laboratories</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedInst.classrooms?.length || 0} Instructional Spaces
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Min {aphRules.minClassroomSqm} m² Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Enrolled Students vs Faculty</span>
                <span className="font-bold text-slate-900 text-sm">
                  1:{selectedInst.facultyRatio} Ratio
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                selectedInst.facultyRatio <= aphRules.ugFacultyStudentRatio ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                APH Norm: 1:{aphRules.ugFacultyStudentRatio}
              </span>
            </div>

            {selectedInst.eoaIssued && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <Award className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-sm">Official EoA Issued!</h4>
                <p className="text-[11px] text-emerald-800">
                  Approval granted for Academic Year 2026-2027.
                </p>
                <button
                  onClick={() => onViewEoa(selectedInst)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Download / Print Digital Certificate
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* NEW APPLICATION WIZARD MODAL */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600">
                  Step {wizardStep} of 3
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  AICTE New Approval Application Wizard (APH 2026-27)
                </h3>
              </div>
              <button 
                onClick={() => setWizardOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWizardSubmit} className="space-y-4 text-xs">
              {/* STEP 1: Institution & Category */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Institution Legal Name:</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Application Category:</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="New Institution Setup + Emerging Courses">New Technical Institution</option>
                        <option value="Extension of Approval (EoA Renewal)">EoA Renewal (Path 1: Only Scrutiny)</option>
                        <option value="Increase in Intake + Additional Engineering Courses">Increase Intake (Path 2: Scrutiny + EVC)</option>
                        <option value="Change of Site / Infrastructure Verification">Change of Site (Path 3: Only EVC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">AICTE Regional Office:</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WRO">WRO (Western Regional Office - Mumbai/Pune)</option>
                        <option value="SRO">SRO (Southern Regional Office - Chennai/Bengaluru)</option>
                        <option value="ERO">ERO (Eastern Regional Office - Kolkata)</option>
                        <option value="NRO">NRO (Northern Regional Office - Kanpur/Lucknow)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 text-[11px]">
                    <strong>Auto-Assigned AICTE Workflow Path:</strong>{' '}
                    {formData.category.includes('Extension of Approval') ? 'Path 1: Only Scrutiny' : formData.category.includes('Change of Site') ? 'Path 3: Only EVC' : 'Path 2: Scrutiny + EVC'}
                  </div>
                </div>
              )}

              {/* STEP 2: Physical Infrastructure & Faculty */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Continuous Land (Acres):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.landAcres}
                        onChange={(e) => setFormData({ ...formData, landAcres: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Total Enrolled Students:</label>
                      <input
                        type="number"
                        value={formData.totalStudents}
                        onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Total Faculty Count:</label>
                      <input
                        type="number"
                        value={formData.totalFaculty}
                        onChange={(e) => setFormData({ ...formData, totalFaculty: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Classroom Carpet Area (sq.m):</label>
                      <input
                        type="number"
                        value={formData.classroomSizeSqm}
                        onChange={(e) => setFormData({ ...formData, classroomSizeSqm: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                      <span className="text-[10px] text-slate-500">AICTE Handbook Norm: Min {aphRules.minClassroomSqm} sq.m</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Lab Carpet Area (sq.m):</label>
                      <input
                        type="number"
                        value={formData.labSizeSqm}
                        onChange={(e) => setFormData({ ...formData, labSizeSqm: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                      <span className="text-[10px] text-slate-500">AICTE Handbook Norm: Min {aphRules.minLabSqm} sq.m</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Live Pre-Submission Rule Evaluation */}
              {wizardStep === 3 && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs mb-1">
                      Pre-Submission Live APH 2026-27 Rule Check:
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Our automated engine checks your inputs against current AICTE handbook regulations before submission.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      previewClassroom.pass ? 'bg-emerald-50 text-emerald-950 border-emerald-200' : 'bg-rose-50 text-rose-950 border-rose-200'
                    }`}>
                      <span>Classroom Carpet Area ({formData.classroomSizeSqm} sq.m vs {aphRules.minClassroomSqm} sq.m):</span>
                      <strong className="font-bold">{previewClassroom.pass ? 'PASSED' : 'DEFICIENT'}</strong>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      previewFaculty.pass ? 'bg-emerald-50 text-emerald-950 border-emerald-200' : 'bg-rose-50 text-rose-950 border-rose-200'
                    }`}>
                      <span>Faculty Ratio ({previewFaculty.ratioString} vs {previewFaculty.targetString}):</span>
                      <strong className="font-bold">{previewFaculty.pass ? 'PASSED' : 'DEFICIENT'}</strong>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      previewLand.pass ? 'bg-emerald-50 text-emerald-950 border-emerald-200' : 'bg-rose-50 text-rose-950 border-rose-200'
                    }`}>
                      <span>Continuous Land ({formData.landAcres} Acres vs {aphRules.minUrbanLandAcres} Acres):</span>
                      <strong className="font-bold">{previewLand.pass ? 'PASSED' : 'DEFICIENT'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Back
                  </button>
                ) : <div />}

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Submit AICTE Application & Route Workflow
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
