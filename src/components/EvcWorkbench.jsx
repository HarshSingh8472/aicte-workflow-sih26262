import React, { useState } from 'react';
import { 
  Eye, 
  Video, 
  Clock, 
  MapPin, 
  Laptop, 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Calendar, 
  Play, 
  Pause, 
  ShieldCheck, 
  Sliders,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Ban,
  RefreshCw,
  Lock,
  UserCheck,
  Compass,
  Award,
  Shield
} from 'lucide-react';
import WorkflowPipeline from './WorkflowPipeline';
import NirnayScoreCard from './NirnayScoreCard';
import GisSatelliteMapView from './GisSatelliteMapView';
import ESignConfirmModal from './ESignConfirmModal';
import { ApiIntegrationStrip } from './ApiIntegrationPills';

export default function EvcWorkbench({
  institutions = [],
  rules,
  currentDate,
  onClearEvc,
  onOpenUndertakingModal,
  onRejectEvc,
  onViewAudit
}) {
  const [activeTab, setActiveTab] = useState('reality'); // 'reality' | 'queue' | 'allocation' | 'gis'
  const [feedMode, setFeedMode] = useState('video'); // 'video' | 'satellite'
  
  // Filter for EVC queue colleges
  const evcColleges = institutions.filter(
    i => i.currentStage === 'evc_queue' || i.assignedPath === 'path-2' || i.assignedPath === 'path-3' || i.assignedPath === 'path-4'
  );

  const [selectedId, setSelectedId] = useState(
    evcColleges.find(c => c.currentStage === 'evc_queue')?.id || evcColleges[0]?.id || institutions[0]?.id
  );

  const selectedInst = institutions.find(i => i.id === selectedId) || institutions[0];

  // Anti-Bias Allocation State
  const [inspectorOverride, setInspectorOverride] = useState({});
  const [isAllocating, setIsAllocating] = useState(false);

  const nationalInspectors = [
    {
      id: 'INS-01',
      name: 'Prof. A. S. Ramaswamy',
      designation: 'Senior Professor & Dean (Infrastructure)',
      institution: 'IIT Madras',
      state: 'Tamil Nadu',
      region: 'SRO',
      specialization: 'Civil & Municipal Safety, High-Rise Labs',
      experience: '22 Yrs',
      pastInspected: 48,
      integrityScore: 99.8
    },
    {
      id: 'INS-02',
      name: 'Dr. Neha Mukherjee',
      designation: 'Professor & Head, Dept of CSE',
      institution: 'IIT Kharagpur',
      state: 'West Bengal',
      region: 'ERO',
      specialization: 'AI Compute Clusters, Bandwidth & CAD Labs',
      experience: '18 Yrs',
      pastInspected: 34,
      integrityScore: 99.2
    },
    {
      id: 'INS-03',
      name: 'Dr. Harvinder Singh',
      designation: 'Chair Professor (Structural Dynamics)',
      institution: 'IIT Roorkee',
      state: 'Uttarakhand',
      region: 'NRO',
      specialization: 'Seismic Stability & Fire NOC Forensics',
      experience: '24 Yrs',
      pastInspected: 56,
      integrityScore: 99.6
    },
    {
      id: 'INS-04',
      name: 'Prof. Rajeshwari Patil',
      designation: 'Professor of Mechanical Engineering',
      institution: 'COEP Technological University, Pune',
      state: 'Maharashtra',
      region: 'WRO',
      specialization: 'Workshop Facilities & Industrial Centers',
      experience: '19 Yrs',
      pastInspected: 41,
      integrityScore: 98.9
    },
    {
      id: 'INS-05',
      name: 'Dr. Vikramaditya Sen',
      designation: 'Professor & Dean Academic Affairs',
      institution: 'VJTI, Mumbai',
      state: 'Maharashtra',
      region: 'WRO',
      specialization: 'Curriculum & Faculty Cadre Verification',
      experience: '21 Yrs',
      pastInspected: 39,
      integrityScore: 99.1
    },
    {
      id: 'INS-06',
      name: 'Dr. C. K. Sundaram',
      designation: 'Professor of Electronics & Communication',
      institution: 'IISc Bengaluru',
      state: 'Karnataka',
      region: 'SWRO',
      specialization: 'IoT Laboratories & Cleanroom Facilities',
      experience: '20 Yrs',
      pastInspected: 52,
      integrityScore: 99.7
    }
  ];

  // Pick default valid out-of-state inspector if none assigned
  const getActiveInspector = () => {
    if (selectedInst && inspectorOverride[selectedInst.id]) {
      return inspectorOverride[selectedInst.id];
    }
    if (selectedInst?.evcInspection?.inspector) {
      return selectedInst.evcInspection.inspector;
    }
    // Find first out-of-state inspector
    const valid = nationalInspectors.find(ins => ins.state.toLowerCase() !== (selectedInst?.state || '').toLowerCase());
    return `${valid?.name} (${valid?.institution}, ${valid?.region})`;
  };

  const activeInspectorName = getActiveInspector();

  const handleAutoAllocate = () => {
    setIsAllocating(true);
    setTimeout(() => {
      // Find candidate in different state AND different region
      const eligible = nationalInspectors.filter(
        ins => ins.state.toLowerCase() !== (selectedInst?.state || '').toLowerCase()
      );
      const crossZone = eligible.filter(ins => ins.region !== selectedInst?.region);
      const chosen = crossZone.length > 0 ? crossZone[0] : eligible[0];
      if (chosen && selectedInst) {
        setInspectorOverride(prev => ({
          ...prev,
          [selectedInst.id]: `${chosen.name} (${chosen.institution}, ${chosen.region})`
        }));
      }
      setIsAllocating(false);
    }, 600);
  };

  // Video Inspection Simulation State
  const [activeCheckpoint, setActiveCheckpoint] = useState('02:15');
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkpointStatus, setCheckpointStatus] = useState({
    '02:15': true,
    '09:30': true,
    '17:45': false,
    '25:10': false
  });

  // Physical Verification Inputs State
  const [actualPcs, setActualPcs] = useState(
    selectedInst?.evcInspection?.actualPcs || selectedInst?.evcInspection?.claimedPcs || 180
  );
  const [actualFloors, setActualFloors] = useState(
    selectedInst?.evcInspection?.actualFloors || 3
  );
  const [actualFaculty, setActualFaculty] = useState(
    selectedInst?.evcInspection?.actualFacultyPresent || selectedInst?.totalFaculty || 45
  );
  const [gstInvoiceChecked, setGstInvoiceChecked] = useState(true);
  const [inspectorRemarks, setInspectorRemarks] = useState('');
  const [eSignOpen, setESignOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const checkpoints = [
    {
      time: '02:15',
      label: 'Geo-Tagged Main Gate & GPS Boundary',
      desc: 'GPS: 19.0222° N, 72.8561° E. Continuous perimeter wall and clear signboards verified.',
      cameraView: 'Drone Satellite Flyover & Entrance Gate'
    },
    {
      time: '09:30',
      label: 'Classrooms 101-108 Physical Laser Measurement',
      desc: 'Laser distance meter recorded 68.2 sq.m and 70.1 sq.m carpet area (Min 66 sq.m verified).',
      cameraView: 'Continuous Walkthrough: Academic Block Ground Floor'
    },
    {
      time: '17:45',
      label: 'Computer Lab Stock Register & Original Tax Bills',
      desc: 'Stock register physical count compared against commercial GST tax invoices and serial numbers.',
      cameraView: 'CAD/CAM Lab & Server Room Rack'
    },
    {
      time: '25:10',
      label: 'Central Library Stamping & Bandwidth Meter',
      desc: 'Checking 100 Mbps leased line speed test meter and AICTE mandated e-journals subscription.',
      cameraView: 'Digital Library & Reading Hall'
    }
  ];

  const claimedPcs = selectedInst?.evcInspection?.claimedPcs || 200;
  const claimedFloors = selectedInst?.evcInspection?.claimedFloors || 3;
  const claimedFaculty = selectedInst?.totalFaculty || 45;

  const pcShortage = Math.max(0, claimedPcs - actualPcs);

  return (
    <div className="space-y-5">
      {/* Module Compact Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-sans">
                  Stage 2: EVC Ground Inspection Workbench
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  APH Clause 2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ground Reality Verification: Geotagged Continuous Video Walkthrough & Spatial GIS Cadastral Check
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Institution:</span>
            <select
              value={selectedInst?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[220px] truncate"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* EVC Sub-Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('reality')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'reality' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Ground Reality
            </button>
            <button
              onClick={() => setActiveTab('gis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'gis' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>ISRO Bhuvan GIS Map</span>
            </button>
            <button
              onClick={() => setActiveTab('allocation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'allocation' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Anti-Bias Allocation</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'queue' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Inspection Queue ({evcColleges.length})
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Inspector:</span>
            <span className="font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              {activeInspectorName ? activeInspectorName.split(' ')[0] + ' ' + (activeInspectorName.split(' ')[1] || '') : 'Assigned'}
            </span>
          </div>
        </div>

        {/* Selected Institution Live Metric Strip */}
        {selectedInst && (
          <div className="border-t border-slate-800/80 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs items-center">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Institution & ID</span>
              <span className="font-bold text-white text-xs truncate block">{selectedInst.name}</span>
              <span className="font-mono text-amber-300 text-[11px] font-semibold">{selectedInst.permanentId}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Location & Region</span>
              <span className="font-semibold text-slate-200 text-xs truncate block">{selectedInst.city}, {selectedInst.state}</span>
              <span className="text-[11px] text-slate-400 block">{selectedInst.region} Regional Jurisdiction</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">EVC Completion SLA</span>
              <span className="font-mono text-amber-400 font-bold text-xs">
                {selectedInst.slaDaysRemaining !== undefined ? `${selectedInst.slaDaysRemaining} Days Left` : 'Active'}
              </span>
              <span className="text-[11px] text-slate-400 block">Statutory 15d SLA Window</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] mb-1">NIRNAY Compliance Index</span>
              <NirnayScoreCard institution={selectedInst} rules={rules} currentDate={currentDate} compact={true} />
            </div>
          </div>
        )}
      </div>

      {/* Progress Pipeline */}
      {selectedInst && <WorkflowPipeline institution={selectedInst} />}

      

      {/* TAB A: EVC QUEUE & SLA SCHEDULER */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">EVC Inspection Queue & 15-Day Completion Tracker</h3>
              <p className="text-xs text-slate-500">Scheduled visits, assigned senior panelists, and approaching deadlines</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {evcColleges.length} Active in EVC Pipeline
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {evcColleges.map((inst) => (
              <div 
                key={inst.id} 
                onClick={() => { setSelectedId(inst.id); setActiveTab('reality'); }}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                  inst.id === selectedInst?.id ? 'bg-emerald-50/40' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inst.name}</span>
                    <span className="font-mono text-xs text-slate-500">({inst.permanentId})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {inst.region}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Category: <strong className="text-slate-700">{inst.category}</strong> • Path: <span className="font-mono">{inst.pathTitle}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Inspection Date</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {inst.evcInspection?.scheduledDate || '2026-10-28'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">SLA Remaining</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      inst.slaDaysRemaining <= 1 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {inst.slaDaysRemaining}d Left
                    </span>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs">
                    Inspect Reality
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: SURAKSHA-CHAKRA ANTI-BIAS INSPECTOR ALLOCATION ENGINE */}
      {activeTab === 'allocation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Suraksha-Chakra Anti-Bias Algorithmic Inspector Allocation
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Out-of-State Expert Verified</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ No Past Institution Conflict</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Domain Match: Engineering</span>
                </div>
                
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  APH 2026-27 Clause 4.2
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                State Firewall strictly blocks any inspector whose home institution or residence is in <span className="text-amber-300 font-semibold">{selectedInst?.state || 'the applicant state'}</span>. Guarantees cross-zone blinded inspection to eliminate regional bias, extortion, or local collusion.
              </p>
            </div>

            <button
              onClick={handleAutoAllocate}
              disabled={isAllocating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAllocating ? 'animate-spin' : ''}`} />
              <span>{isAllocating ? 'Running Matrix Hash...' : 'Auto-Allocate Cross-Zone Panel'}</span>
            </button>
          </div>

          {/* Active Assignment Status Card */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-950 text-sm">Active Confirmed EVC Chair:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  {activeInspectorName}
                </span>
              </div>
              <p className="text-emerald-900/90 text-[11px]">
                Target: <strong>{selectedInst?.name}</strong> ({selectedInst?.city}, {selectedInst?.state} - {selectedInst?.region}) • Status: <strong>Zero Home-State Conflict Certified</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800/80 bg-white/70 px-3 py-1.5 rounded-lg border border-emerald-200 self-start md:self-auto">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>SEAL: EVC-HASH-SEC-99214-BLINDED</span>
            </div>
          </div>

          {/* National Inspector Pool Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">National Expert Panelists & Integrity Matrix</h4>
                <p className="text-xs text-slate-500">Live evaluation against candidate home state, zone separation, and institutional conflict rules</p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Pool Size: {nationalInspectors.length} Senior Experts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nationalInspectors.map((ins) => {
                const isHomeStateConflict = ins.state.toLowerCase() === (selectedInst?.state || '').toLowerCase();
                const isCrossZone = ins.region !== selectedInst?.region;
                const isAssigned = activeInspectorName.includes(ins.name);

                return (
                  <div
                    key={ins.id}
                    className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                      isHomeStateConflict
                        ? 'bg-rose-50/50 border-rose-200 opacity-80'
                        : isAssigned
                        ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{ins.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">({ins.id})</span>
                          </div>
                          <p className="text-slate-600 font-medium">{ins.designation}</p>
                          <p className="text-slate-500 text-[11px] font-semibold">{ins.institution} • {ins.state} ({ins.region})</p>
                        </div>

                        {/* Status Badge */}
                        {isHomeStateConflict ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                            <Ban className="w-3 h-3" /> FIREWALL BLOCKED
                          </span>
                        ) : isAssigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE CHAIR
                          </span>
                        ) : isCrossZone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 shrink-0">
                            <Compass className="w-3 h-3" /> CROSS-ZONE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                            ELIGIBLE
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Specialization:</span>
                          <strong className="text-slate-800">{ins.specialization}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Track Record & Score:</span>
                          <span>{ins.experience} ({ins.pastInspected} audits) • <strong className="text-emerald-700">{ins.integrityScore}% Integrity</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Conflict Explanation or Assign Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {isHomeStateConflict ? (
                        <p className="text-[11px] text-rose-700 font-medium">
                          Strictly Blocked: Resides in {ins.state} (same state as applicant).
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Zero Conflict: {ins.state} &rarr; {selectedInst?.state} (Cross-State Neutral)
                        </p>
                      )}

                      {!isHomeStateConflict && !isAssigned && (
                        <button
                          onClick={() => {
                            if (selectedInst) {
                              setInspectorOverride(prev => ({
                                ...prev,
                                [selectedInst.id]: `${ins.name} (${ins.institution}, ${ins.region})`
                              }));
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all shrink-0"
                        >
                          Assign Chair
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: SPATIAL GIS SATELLITE SURVEY */}
      {activeTab === 'gis' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ISRO Bhuvan Spatial Intelligence
                </span>
                <span className="text-xs text-slate-500 font-mono">Revenue Parcel Cadastral Survey #412/A</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Spatial AI & ISRO Bhuvan Cadastral Survey Verification — {selectedInst?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Satellite boundary geofencing, real-time GPS survey coordinates, and continuous land buffer bisection verification.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Registered Continuous Area</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono">{selectedInst?.landAcres} Acres</span>
            </div>
          </div>
          <GisSatelliteMapView institution={selectedInst} />
        </div>
      )}

      {/* TAB B: SIDE-BY-SIDE GROUND REALITY WORKBENCH */}
      {activeTab === 'reality' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column (6 cols): 30-Minute Continuous Video Walkthrough Verifier */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-600" />
                    30-Minute Continuous Campus Walkthrough Verifier
                  </h3>
                  <p className="text-xs text-slate-500">Mandatory unedited geolocated continuous video stream</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      onClick={() => setFeedMode('video')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        feedMode === 'video' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Walkthrough Video
                    </button>
                    <button
                      onClick={() => setFeedMode('satellite')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        feedMode === 'satellite' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Bhuvan Satellite GIS
                    </button>
                  </div>
                  <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    HD 1080P
                  </span>
                </div>
              </div>

              {feedMode === 'satellite' ? (
                <div className="rounded-2xl overflow-hidden border border-slate-800">
                  <GisSatelliteMapView institution={selectedInst} compact={true} />
                </div>
              ) : (
                /* Simulated Video Player Screen */
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col justify-between p-4 shadow-inner border border-slate-800">
                  {/* Video HUD Overlay */}
                  <div className="flex items-center justify-between text-xs text-slate-200 z-10">
                    <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>REC • 00:{activeCheckpoint}:45 / 00:30:00</span>
                    </div>
                    <div className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 text-[11px] text-amber-300 font-mono">
                      GPS: 19.0222° N, 72.8561° E
                    </div>
                  </div>

                  {/* Center Screen Visual */}
                  <div className="text-center z-10">
                    <p className="text-sm font-bold text-white drop-shadow-md">
                      {checkpoints.find(c => c.time === activeCheckpoint)?.cameraView}
                    </p>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto drop-shadow-sm">
                      {checkpoints.find(c => c.time === activeCheckpoint)?.desc}
                    </p>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="space-y-2 z-10">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: activeCheckpoint === '02:15' ? '10%' : activeCheckpoint === '09:30' ? '35%' : activeCheckpoint === '17:45' ? '60%' : '85%' 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center gap-1.5 text-white hover:text-emerald-400 font-semibold"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause Feed' : 'Play Live Feed'}</span>
                      </button>
                      <span className="font-mono text-[11px] text-slate-300">
                        Checkpoint: {activeCheckpoint}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clickable Timestamp Checkpoints */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800 block">Clickable Key Inspection Checkpoints:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {checkpoints.map(cp => {
                    const isSelected = activeCheckpoint === cp.time;
                    return (
                      <button
                        key={cp.time}
                        onClick={() => setActiveCheckpoint(cp.time)}
                        className={`text-left p-2.5 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="font-mono text-emerald-700">{cp.time}</span>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                            Jump
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-800 mt-1 leading-tight">{cp.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Biometric Hash Verification:</span>
              <strong className="font-mono text-emerald-700">BIO-VERIFIED-PASS-99182</strong>
            </div>
          </div>

          {/* Right Column (6 cols): Ground Reality Physical Comparison & Verification Inputs */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    Physical Ground Comparison vs Stage 1 Claim
                  </h3>
                  <p className="text-xs text-slate-500">Compare approved blueprint specs against physical field count</p>
                </div>
              </div>

              {/* Physical Metric 1: Computers / Workstations */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-600" />
                    Commercial Working PC Terminals:
                  </span>
                  <span className="font-mono text-slate-500">
                    Stage 1 Claim: <strong>{claimedPcs} PCs</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max={claimedPcs + 20}
                    value={actualPcs}
                    onChange={(e) => setActualPcs(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <div className="w-24 text-right">
                    <span className={`text-base font-extrabold font-mono ${
                      pcShortage > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {actualPcs} PCs
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={gstInvoiceChecked}
                      onChange={(e) => setGstInvoiceChecked(e.target.checked)}
                      className="rounded text-emerald-600 w-3.5 h-3.5"
                    />
                    <span>Original GST Tax Invoices Verified (Not mere POs)</span>
                  </label>

                  {pcShortage > 0 && (
                    <span className="text-rose-600 font-bold">
                      Shortage: {pcShortage} PCs
                    </span>
                  )}
                </div>
              </div>

              {/* Physical Metric 2: Completed Floors */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Physically Finished & Functional Floors:
                  </span>
                  <span className="font-mono text-slate-500">
                    Blueprint Claim: <strong>{claimedFloors} Floors</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={actualFloors}
                    onChange={(e) => setActualFloors(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <div className="w-24 text-right">
                    <span className={`text-base font-extrabold font-mono ${
                      actualFloors < claimedFloors ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {actualFloors} Floors
                    </span>
                  </div>
                </div>

                {actualFloors < claimedFloors && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    Deficiency: Upper floors under construction with bare brickwork and unplastered walls!
                  </p>
                )}
              </div>

              {/* Physical Metric 3: Present Faculty */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Biometrically Present Qualified Faculty:
                  </span>
                  <span className="font-mono text-slate-500">
                    Roster Claim: <strong>{claimedFaculty} Faculty</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max={claimedFaculty + 5}
                    value={actualFaculty}
                    onChange={(e) => setActualFaculty(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <div className="w-24 text-right">
                    <span className={`text-base font-extrabold font-mono ${
                      actualFaculty < claimedFaculty ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {actualFaculty} Present
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks Box */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">EVC Team Final Ground Assessment:</label>
                <textarea
                  value={inspectorRemarks}
                  onChange={(e) => setInspectorRemarks(e.target.value)}
                  placeholder="Enter EVC ground verification findings (e.g. Campus visit completed. Found minor shortage of 30 PCs in CAD lab; recommended 14-day conditional undertaking)..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/80 mb-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Statutory Guardrail (APH Clause F): Panelist e-Sign OTP required for all ground findings.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Clear EVC */}
                <button
                  onClick={() => { setPendingAction('clear'); setESignOpen(true); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                  title="Forward directly to Regional Officer for final EoA sign-off"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recommend: Clear EVC</span>
                </button>

                {/* 2. Grant Conditional Undertaking */}
                <button
                  onClick={() => { setPendingAction('undertaking'); setESignOpen(true); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-400/20 transition-all"
                  title="Grant conditional recommendation requiring college to fulfill shortfalls within strict deadline"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-900" />
                  <span>Conditional Undertaking</span>
                </button>

                {/* 3. Reject / Route SAC */}
                <button
                  onClick={() => { setPendingAction('reject'); setESignOpen(true); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
                  title="Reject and route to Standing Appellate Committee (SAC) queue"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Recommend: Reject</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Cryptographically signs EVC Report with SHA-256 seal</span>
                <button 
                  onClick={() => onViewAudit(selectedInst)} 
                  className="text-emerald-700 hover:underline font-medium"
                >
                  View Inspection Audit Logs
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
      {/* Statutory e-Sign OTP Confirmation Modal */}
      <ESignConfirmModal
        isOpen={eSignOpen}
        onClose={() => setESignOpen(false)}
        onConfirm={() => {
          if (pendingAction === 'clear') onClearEvc(selectedInst, { actualPcs, actualFloors, actualFaculty, remarks: inspectorRemarks });
          if (pendingAction === 'undertaking') onOpenUndertakingModal(selectedInst, pcShortage, inspectorRemarks);
          if (pendingAction === 'reject') onRejectEvc(selectedInst, inspectorRemarks);
          setPendingAction(null);
        }}
        actionLabel={pendingAction === 'clear' ? 'Clear EVC Ground Inspection' : pendingAction === 'undertaking' ? 'Grant Conditional Undertaking' : 'Reject & Route to SAC Appeal'}
        officerName="National EVC Inspection Panelist"
        institution={selectedInst}
      />
    </div>
  );
}
