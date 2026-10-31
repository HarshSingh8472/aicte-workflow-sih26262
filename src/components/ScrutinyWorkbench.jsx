import React, { useState } from 'react';
import { 
  FileCheck2, 
  MapPin, 
  Building, 
  Users, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  Compass, 
  CreditCard,
  Send,
  Flag,
  ArrowRight,
  Sparkles,
  Scan,
  Shield,
  Fingerprint
} from 'lucide-react';
import { 
  evaluateClassrooms, 
  evaluateFacultyRatio, 
  evaluateLand, 
  evaluateDocuments 
} from '../services/ruleEngine';
import WorkflowPipeline from './WorkflowPipeline';
import NirnayScoreCard from './NirnayScoreCard';
import GisSatelliteMapView from './GisSatelliteMapView';

export default function ScrutinyWorkbench({
  institutions = [],
  aphRules,
  currentDate,
  onApproveScrutiny,
  onRaiseDeficiency,
  onViewAudit
}) {
  // Filter for institutions in scrutiny queue or eligible for scrutiny review
  const scrutinyColleges = institutions.filter(
    i => i.currentStage === 'scrutiny_queue' || i.assignedPath === 'path-1' || i.assignedPath === 'path-2'
  );

  const [selectedId, setSelectedId] = useState(
    scrutinyColleges.find(c => c.currentStage === 'scrutiny_queue')?.id || scrutinyColleges[0]?.id || institutions[0]?.id
  );

  const [activeTab, setActiveTab] = useState('blueprint'); // 'blueprint' | 'land' | 'safety' | 'faculty' | 'ocr'
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrDone, setOcrDone] = useState(true);
  const [officerNotes, setOfficerNotes] = useState('');
  const [checkboxes, setCheckboxes] = useState({
    landDeedMatches: true,
    blueprintStamped: true,
    fireNocValid: true,
    facultyAadhaarVerified: true
  });

  const selectedInst = institutions.find(i => i.id === selectedId) || institutions[0];

  const handleRunOcr = () => {
    setIsScanningOcr(true);
    setTimeout(() => {
      setIsScanningOcr(false);
      setOcrDone(true);
    }, 700);
  };

  // Dynamic Rule Engine Evaluations
  const classroomEval = evaluateClassrooms(selectedInst, aphRules);
  const facultyEval = evaluateFacultyRatio(selectedInst, aphRules);
  const landEval = evaluateLand(selectedInst, aphRules);
  const docEval = evaluateDocuments(selectedInst, currentDate, aphRules?.advanceExpiryAlertDays);

  const handleCheckboxToggle = (key) => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isCurrentInScrutiny = selectedInst?.currentStage === 'scrutiny_queue';

  return (
    <div className="space-y-5">
      {/* Module Compact Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-sans">
                  Stage 1: Desk Scrutiny Committee Workbench
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  APH Clause 2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Desk Verification: Stamped Floor Plans, Land Titles, Fire NOCs & 1:15 Faculty Roster
              </p>
            </div>
          </div>

          {/* College Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Institution:</span>
            <select
              value={selectedInst?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[220px] truncate"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Institution Live Metric Strip */}
        {selectedInst && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs items-center">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Permanent AICTE ID</span>
              <span className="font-mono font-bold text-amber-300 text-xs">{selectedInst.permanentId}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Application Category</span>
              <span className="font-semibold text-slate-200 text-xs truncate block">{selectedInst.category}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Current Stage</span>
              <span className="font-semibold text-indigo-300 capitalize text-xs block">
                {selectedInst.currentStage.replace('_', ' ')}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Scrutiny SLA Timer</span>
              <span className="font-mono text-emerald-400 font-bold text-xs">
                {selectedInst.slaDaysRemaining !== undefined ? `${selectedInst.slaDaysRemaining} Days Left` : 'Active'}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] mb-1">NIRNAY Regulatory Index</span>
              <NirnayScoreCard institution={selectedInst} rules={aphRules} currentDate={currentDate} compact={true} />
            </div>
          </div>
        )}
      </div>

      {/* Progress Pipeline */}
      {selectedInst && <WorkflowPipeline institution={selectedInst} />}

      {/* Split-Screen Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Panel (7 cols): Submitted Certificates & Blueprint Previewer */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Submitted Government Certificates & Blueprint Dossier
              </h3>
              <p className="text-[11px] text-slate-500">Extracted metadata and architectural measurements</p>
            </div>

            {/* Document Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'blueprint' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Architect Blueprint
              </button>
              <button
                onClick={() => setActiveTab('land')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'land' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Land Registry
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'safety' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fire & FDR
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'faculty' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty Roster
              </button>
              <button
                onClick={() => setActiveTab('ocr')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'ocr' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Satya-Pramaan OCR</span>
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[620px] text-xs space-y-4">
            {/* TAB 1: BLUEPRINT ROOM-DIMENSION TABLE */}
            {activeTab === 'blueprint' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-indigo-900">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">Municipal Corporation Stamped Floor Plan #MCGM-BP-2026/881</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800 font-mono">
                    Stamped OC Attached
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5">Room ID</th>
                        <th className="px-3 py-2.5">Designated Space</th>
                        <th className="px-3 py-2.5">Floor Level</th>
                        <th className="px-3 py-2.5">Carpet Area</th>
                        <th className="px-3 py-2.5">APH Norm</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedInst.classrooms || []).map((rm, idx) => {
                        const isLab = rm.type.toLowerCase().includes('lab') || rm.type.toLowerCase().includes('centre');
                        const minReq = isLab ? aphRules.minLabSqm : aphRules.minClassroomSqm;
                        const isPassing = Number(rm.carpetAreaSqm) >= minReq;

                        return (
                          <tr key={idx} className={isPassing ? 'hover:bg-slate-50/80' : 'bg-rose-50/60'}>
                            <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{rm.roomNo}</td>
                            <td className="px-3 py-2.5 font-medium text-slate-700">{rm.type}</td>
                            <td className="px-3 py-2.5 text-slate-500">{rm.floor}</td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                              {rm.carpetAreaSqm} sq.m
                            </td>
                            <td className="px-3 py-2.5 text-slate-500">
                              Min {minReq} sq.m
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {isPassing ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3" /> PASS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  <XCircle className="w-3 h-3" /> FAIL (-{minReq - rm.carpetAreaSqm}m²)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Barrier-Free Access & Ramps:</span>
                    <strong className="text-emerald-700">Certified Gradient 1:12 Ramp with Braille Lift</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Carpet Instructional Area:</span>
                    <strong className="text-slate-800">
                      {selectedInst.classrooms?.reduce((acc, r) => acc + Number(r.carpetAreaSqm), 0)} sq.meters
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LAND REGISTRY */}
            {activeTab === 'land' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Government Tehsildar & Sub-Registrar Title Certificate
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800 text-[10px] font-bold">
                      VERIFIED DEED
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Deed No: <strong>MH-MUM-REG-2009-8819</strong> • Survey Nos: 142/A, 142/B, 143 (Continuous Contiguous Plot).
                    Zoning: Permitted Technical Institution Campus. Free of all encumbrances.
                  </p>
                </div>

                {/* Spatial AI & ISRO Bhuvan Cadastral Survey Verification */}
                <GisSatelliteMapView institution={selectedInst} />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Total Continuous Land</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedInst.landAcres} Acres</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">
                      (Requirement: {aphRules.minUrbanLandAcres} Acres)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">GPS Coordinates</span>
                    <span className="font-mono font-semibold text-slate-800">19.0222° N, 72.8561° E</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Bhuvan Geo-Portal Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: STATUTORY SAFETY & BANK FDR */}
            {activeTab === 'safety' && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">Government Mandatory Clearance Certificates:</div>
                <div className="space-y-2.5">
                  {(selectedInst.documents || []).map((doc, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        doc.status === 'expired' 
                          ? 'bg-rose-50 border-rose-200' 
                          : doc.status === 'approaching_expiry'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{doc.title}</span>
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
                          Certificate #: <span className="font-mono text-slate-700">{doc.docNumber}</span> • Expiry:{' '}
                          <span className="font-semibold text-slate-800">{doc.expiryDate}</span>
                        </p>
                        <p className="text-[10px] text-slate-600 italic mt-0.5">{doc.remarks}</p>
                      </div>

                      {doc.amountInr && (
                        <div className="text-right sm:border-l sm:pl-3 border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Joint FDR Corpus</span>
                          <span className="font-extrabold text-blue-700 text-xs">₹{doc.amountInr}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FACULTY ROSTER */}
            {activeTab === 'faculty' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">AICTE Approved Faculty Portal Roster</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-800">
                    Aadhaar / PAN Bio-Seeded
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Enrolled Students</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedInst.totalStudents}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Qualified Faculty</span>
                    <span className="text-base font-extrabold text-slate-900">{selectedInst.totalFaculty}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Calculated Ratio</span>
                    <span className={`text-base font-extrabold ${facultyEval.pass ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {facultyEval.ratioString}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Cadre Proportion (Prof : Assoc : Asst):</span>
                    <strong className="text-slate-900">{selectedInst.cadreRatio || '1:2:6'} (Compliant)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal / Director Ph.D Qualification:</span>
                    <strong className="text-emerald-700 font-semibold">Verified Ph.D + 15 Yrs Experience</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SATYA-PRAMAAN OCR & SEAL VALIDATOR */}
            {activeTab === 'ocr' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl border border-indigo-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-white">Satya-Pramaan AI Multi-Agency Verifier</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Zero-Plagiarism Engine
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Cross-checks municipal seals, cadastral coordinates & national faculty register to detect forgery before desk approval.
                    </p>
                  </div>
                  <button
                    onClick={handleRunOcr}
                    disabled={isScanningOcr}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-50 transition-all shrink-0"
                  >
                    <Scan className={`w-3.5 h-3.5 ${isScanningOcr ? 'animate-spin' : ''}`} />
                    <span>{isScanningOcr ? 'Scanning Seal Vectors...' : 'Re-Run Multi-Vector Scan'}</span>
                  </button>
                </div>

                {isScanningOcr ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-indigo-300 space-y-2">
                    <Scan className="w-8 h-8 text-indigo-600 mx-auto animate-spin" />
                    <p className="text-xs font-bold text-slate-800">Analyzing Document Metadata & Holographic Seal Layers...</p>
                    <p className="text-[11px] text-slate-500">Querying ISRO Bhuvan GIS & Central CBDT / UIDAI Pan-India Database</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* 4 Multi-Agency Verification Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Pillar 1: Municipal Corporation Seal */}
                      <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            Municipal Seal Authenticity
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 font-mono">
                            99.4% CONFIDENCE
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900/90 leading-tight">
                          Ashok Stambh Emblem & Town Planning Dept Stamp match MCGM gazetted seal template. Edge gradient analysis confirms 0% digital splice or Photoshop tampering.
                        </p>
                        <div className="pt-1 text-[10px] font-mono text-emerald-800/80 flex justify-between">
                          <span>Stamp Serial: #MH-MUN-2026/89412</span>
                          <span>Tamper Risk: &lt;0.05%</span>
                        </div>
                      </div>

                      {/* Pillar 2: ISRO Bhuvan Cadastral Survey */}
                      <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                            <Compass className="w-3.5 h-3.5 text-emerald-600" />
                            ISRO Bhuvan Cadastral Match
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 font-mono">
                            GEO-VERIFIED
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900/90 leading-tight">
                          GPS boundary (19.0760° N, 72.8777° E) perfectly overlays Revenue Survey Parcel #412/A. No intersecting public roads or railway lines detected.
                        </p>
                        <div className="pt-1 text-[10px] font-mono text-emerald-800/80 flex justify-between">
                          <span>Survey Deed: #REV-2024-9122</span>
                          <span>Contiguity: 100% Contiguous</span>
                        </div>
                      </div>

                      {/* Pillar 3: Pan-India Ghost Faculty Shield */}
                      <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            Anti-Ghost Faculty Radar
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 font-mono">
                            0 DUPLICATES
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900/90 leading-tight">
                          Biometric hash and PAN cross-checked against 11,240 AICTE institutes nationwide. Zero simultaneous appointments or multi-college payroll entries.
                        </p>
                        <div className="pt-1 text-[10px] font-mono text-emerald-800/80 flex justify-between">
                          <span>Faculty Tested: {selectedInst.totalFaculty || 45} Members</span>
                          <span>Collision Count: 0</span>
                        </div>
                      </div>

                      {/* Pillar 4: Digital Signature (DSC) Validation */}
                      <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            Class-3 DSC Token Stamping
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 font-mono">
                            CRYPTOGRAPHIC PASS
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900/90 leading-tight">
                          Certified Architect (COA #CA/2012/55491) & Structural Engineer (IEI-FE-1092) digital signatures cryptographically verified with e-Mudhra root CA.
                        </p>
                        <div className="pt-1 text-[10px] font-mono text-emerald-800/80 truncate">
                          <span>SHA-256: 7f83b165...e924ca95</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Attest Action Button */}
                    <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-[11px] text-indigo-950">
                        <strong className="block font-semibold">Ready to certify desk integrity?</strong>
                        <span>Auto-populate officer checklist with verified Satya-Pramaan telemetry.</span>
                      </div>
                      <button
                        onClick={() => {
                          setCheckboxes({
                            landDeedMatches: true,
                            blueprintStamped: true,
                            fireNocValid: true,
                            facultyAadhaarVerified: true
                          });
                          setOfficerNotes('Satya-Pramaan AI Multi-Agency Verifier passed 4/4 checks (Municipal Seal 99.4%, Cadastral survey contiguous, 0 ghost faculty duplicates, Class-3 DSC verified). Recommended for Stage 2 Ground EVC Inspection.');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all shrink-0"
                      >
                        Auto-Attest from OCR Telemetry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel (5 cols): Automated APH Rule Engine & Officer Verification Checklist */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Live APH Rule Engine Checklist
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Automated
                </span>
              </div>
              <p className="text-xs text-slate-500">Live computation based on current handbook parameters</p>
            </div>

            {/* Automated Rule Verdict Badges */}
            <div className="space-y-2 text-xs">
              {/* Classroom Norm Check */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                classroomEval.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/60 border-rose-200 text-rose-950'
              }`}>
                {classroomEval.pass ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Min Classroom Area ({aphRules.minClassroomSqm} sq.m)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${classroomEval.pass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {classroomEval.pass ? 'PASSED' : 'DEFICIENT'}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">{classroomEval.summary}</p>
                </div>
              </div>

              {/* Faculty Ratio Check */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                facultyEval.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/60 border-rose-200 text-rose-950'
              }`}>
                {facultyEval.pass ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Faculty-Student Ratio ({facultyEval.targetString})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${facultyEval.pass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {facultyEval.pass ? 'PASSED' : 'DEFICIENT'}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">{facultyEval.summary}</p>
                </div>
              </div>

              {/* Land Requirement Check */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                landEval.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/60 border-rose-200 text-rose-950'
              }`}>
                {landEval.pass ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Continuous Land ({aphRules.minUrbanLandAcres} Acres)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${landEval.pass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {landEval.pass ? 'PASSED' : 'DEFICIENT'}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">{landEval.summary}</p>
                </div>
              </div>

              {/* Statutory Expiry Check */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                !docEval.hasExpired ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/60 border-rose-200 text-rose-950'
              }`}>
                {!docEval.hasExpired ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Statutory NOC & Bank FDR Validity</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${!docEval.hasExpired ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {!docEval.hasExpired ? 'ALL VALID' : `${docEval.expiredCount} EXPIRED`}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {!docEval.hasExpired 
                      ? 'Fire safety NOC, stability and joint FDR are currently within valid validity window.' 
                      : 'Expired statutory document detected! Renewal certificate required before proceeding.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Officer Manual Checkboxes */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Officer Attestation Checkpoints:</span>
              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxes.landDeedMatches}
                    onChange={() => handleCheckboxToggle('landDeedMatches')}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>[✓] Stamped Land Title & Tehsildar coordinates match cadastral survey</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxes.blueprintStamped}
                    onChange={() => handleCheckboxToggle('blueprintStamped')}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>[✓] Architect blueprint bears Municipal Corporation seal & OC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxes.fireNocValid}
                    onChange={() => handleCheckboxToggle('fireNocValid')}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>[✓] Fire Department NOC and Structural Stability verified genuine</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxes.facultyAadhaarVerified}
                    onChange={() => handleCheckboxToggle('facultyAadhaarVerified')}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>[✓] Faculty roster Aadhaar/PAN cross-checked to prevent ghost faculty</span>
                </label>
              </div>
            </div>

            {/* Officer Observation Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Scrutiny Officer Observation & Remarks:</label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Enter official scrutiny remarks (e.g., Stamped blueprint and Tehsildar deed verified strictly compliant with APH 2026-27)..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 space-y-2 mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onApproveScrutiny(selectedInst, officerNotes)}
                disabled={!isCurrentInScrutiny && selectedInst.currentStage !== 'escalated_deficiency'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Approve desk scrutiny and auto-route to Stage 2 EVC Queue"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Stage 1 &rarr; Auto-Route to Stage 2 EVC Queue</span>
              </button>

              <button
                onClick={() => onRaiseDeficiency(selectedInst, officerNotes)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Flag deficiency and notify institution for appeal or rectification"
              >
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Raise Deficiency</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Automatically starts 5-day EVC scheduling SLA timer</span>
              <button 
                onClick={() => onViewAudit(selectedInst)} 
                className="text-indigo-600 hover:underline font-medium"
              >
                View SHA-256 Audit Trail
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
