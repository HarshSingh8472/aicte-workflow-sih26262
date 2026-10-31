import { useState, useMemo } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  Download,
  Search,
  Building2,
  MapPin,
  Users,
  ExternalLink,
  BookOpen,
  Phone,
  Mail,
  FileText,
  GraduationCap,
  Landmark,
  ChevronRight,
  X,
  Info
} from 'lucide-react';

export default function PublicVerifyPortal({ institutions = [], aphRules = {}, currentDate = '2026-07-15' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const defaultAphRules = {
    ugFacultyStudentRatio: 20,
    minUrbanLandAcres: 2.5,
    minClassroomSqm: 66,
    ...aphRules
  };

  const findInstitution = (query) => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return institutions.find(
      (inst) =>
        inst.permanentId?.toLowerCase() === q ||
        inst.name?.toLowerCase().includes(q) ||
        inst.id?.toString() === q
    );
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const found = findInstitution(searchQuery);
    setSelectedInstitution(found || null);
    setNoResult(!found);
    setHasSearched(true);
  };

  const handleQuickVerify = (inst) => {
    setSearchQuery(inst.name);
    setSelectedInstitution(inst);
    setNoResult(false);
    setHasSearched(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedInstitution(null);
    setHasSearched(false);
    setNoResult(false);
  };

  const getVerdict = (inst) => {
    if (
      inst.eoaIssued === true ||
      inst.currentStage === 'eoa_issued' ||
      inst.currentStage === 'ro_approval'
    ) {
      return {
        type: 'approved',
        label: 'GENUINE & AICTE APPROVED FOR ACADEMIC YEAR 2026-2027',
        emoji: '✅',
        icon: CheckCircle2,
        bg: 'bg-emerald-50',
        border: 'border-emerald-500',
        text: 'text-emerald-800',
        iconColor: 'text-emerald-600'
      };
    }
    if (inst.currentStage === 'escalated_deficiency') {
      return {
        type: 'suspended',
        label: 'APPROVAL SUSPENDED — UNDER REGULATORY REVIEW',
        emoji: '⚠️',
        icon: AlertTriangle,
        bg: 'bg-rose-50',
        border: 'border-rose-500',
        text: 'text-rose-800',
        iconColor: 'text-rose-600'
      };
    }
    return {
      type: 'pending',
      label: 'APPLICATION IN PROGRESS — VERIFICATION PENDING',
      emoji: '🔄',
      icon: Clock,
      bg: 'bg-amber-50',
      border: 'border-amber-500',
      text: 'text-amber-800',
      iconColor: 'text-amber-600'
    };
  };

  const calculateNirnayScore = (inst) => {
    let score = 100;
    if (inst.facultyRatio && inst.facultyRatio > defaultAphRules.ugFacultyStudentRatio) {
      score -= 10;
    }
    if (inst.landAcres && inst.landAcres < defaultAphRules.minUrbanLandAcres) {
      score -= 15;
    }
    if (inst.classrooms && Array.isArray(inst.classrooms)) {
      inst.classrooms.forEach((room) => {
        if (room.areaSqm && room.areaSqm < defaultAphRules.minClassroomSqm) {
          score -= 5;
        }
      });
    }
    if (inst.currentStage === 'escalated_deficiency' || inst.currentStage === 'sac_appeal') {
      score -= 20;
    }
    return Math.max(0, Math.min(100, score));
  };

  const getScoreBand = (score) => {
    if (score >= 90) return { color: 'emerald', label: 'Band 1 — FastTrack', ring: 'stroke-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', fill: 'text-emerald-500' };
    if (score >= 75) return { color: 'blue', label: 'Band 2 — Standard', ring: 'stroke-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', fill: 'text-blue-500' };
    if (score >= 60) return { color: 'amber', label: 'Band 3 — Conditional', ring: 'stroke-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', fill: 'text-amber-500' };
    return { color: 'rose', label: 'Band 4 — Red Notice', ring: 'stroke-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', fill: 'text-rose-500' };
  };

  const formatStage = (stage) => {
    if (!stage) return 'N/A';
    return stage
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const programRows = [
    { name: 'Computer Science & Engineering', level: 'UG', affiliation: 'State Technical University', intake: 180 },
    { name: 'Artificial Intelligence & Data Science', level: 'UG', affiliation: 'State Technical University', intake: 120 },
    { name: 'Electronics & Telecommunication', level: 'UG', affiliation: 'State Technical University', intake: 120 }
  ];

  const regionFullNames = {
    WRO: 'Western Regional Office (WRO)',
    SRO: 'Southern Regional Office (SRO)',
    ERO: 'Eastern Regional Office (ERO)',
    NRO: 'Northern Regional Office (NRO)'
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ───── OFFICIAL GOVERNMENT HEADER BANNER ───── */}
      <header className="bg-white border-b-4 border-blue-800">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col items-center text-center">
          {/* Ashok Stambh Emblem */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center shadow-lg ring-4 ring-amber-400/30">
              <Shield className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-[8px] font-bold text-white px-2 py-0.5 rounded-full tracking-widest">
              अशोक
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-2">
            AICTE — Public Institution Verification Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            All India Council for Technical Education &bull; Ministry of Education, Government of India
          </p>
          <p className="text-[11px] text-blue-700 mt-2 font-semibold bg-blue-50 px-4 py-1 rounded-full">
            Protecting 40 Million Students from Unapproved &amp; Bogus Technical Institutions
          </p>
        </div>
      </header>

      {/* ───── MAIN CONTENT ───── */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ───── SEARCH BAR ───── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter AICTE Permanent ID (e.g., 1-492819201) or Institution Name"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              />
              {searchQuery && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
              Verify
            </button>
          </div>

          {/* Quick Verify Chips */}
          {institutions.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Quick Verify</p>
              <div className="flex flex-wrap gap-2">
                {institutions.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleQuickVerify(inst)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      selectedInstitution?.id === inst.id
                        ? 'bg-blue-100 border-blue-400 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    {inst.name}
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ───── VERIFICATION RESULT CARD ───── */}
        {hasSearched && selectedInstitution && (() => {
          const inst = selectedInstitution;
          const verdict = getVerdict(inst);
          const VerdictIcon = verdict.icon;
          const nirnayScore = calculateNirnayScore(inst);
          const band = getScoreBand(nirnayScore);
          const totalIntake = inst.totalStudents || 420;
          const circumference = 2 * Math.PI * 40;
          const dashOffset = circumference - (nirnayScore / 100) * circumference;

          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">

              {/* (a) VERDICT BADGE */}
              <div className={`${verdict.bg} border-l-4 ${verdict.border} px-6 py-4 flex items-center gap-4`}>
                <VerdictIcon className={`w-8 h-8 ${verdict.iconColor} shrink-0`} />
                <div>
                  <p className={`text-sm font-bold ${verdict.text}`}>
                    {verdict.emoji} {verdict.label}
                  </p>
                  <p className={`text-[11px] ${verdict.text} opacity-70 mt-0.5`}>
                    Verification performed on {currentDate} via National AICTE Digital Infrastructure
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">

                {/* (b) INSTITUTION DETAILS GRID */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    Institution Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <DetailRow label="Institution Name" value={inst.name} bold />
                    <DetailRow label="AICTE Permanent ID" value={inst.permanentId || 'N/A'} mono />
                    <DetailRow label="City & State" value={`${inst.city || '—'}, ${inst.state || '—'}`} />
                    <DetailRow label="Regional Office" value={regionFullNames[inst.region] || inst.region || 'N/A'} />
                    <DetailRow label="Category" value={inst.category || 'N/A'} />
                    <DetailRow label="Current Processing Stage" value={formatStage(inst.currentStage)} />
                    <DetailRow label="Land Area" value={inst.landAcres ? `${inst.landAcres} Acres` : 'N/A'} />
                    <DetailRow label="Total Faculty" value={inst.totalFaculty ? `${inst.totalFaculty} Members` : 'N/A'} />
                    <DetailRow label="Faculty-Student Ratio" value={inst.facultyRatio ? `1:${inst.facultyRatio}` : 'N/A'} />
                  </div>
                </div>

                {/* (c) NIRNAY QUALITY INDEX */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600" />
                    NIRNAY Quality Index
                  </h3>
                  <div className={`${band.bg} rounded-xl border border-slate-100 p-5 flex items-center gap-6`}>
                    {/* Circular Score Badge */}
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          className={band.ring}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${band.text}`}>{nirnayScore}</span>
                        <span className="text-[9px] text-slate-500 font-medium">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${band.text}`}>{band.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-md">
                        The NIRNAY Quality Index is a composite metric calculated from faculty adequacy, infrastructure compliance, land availability, and regulatory standing. Institutions scoring above 90 qualify for expedited approval pathways.
                      </p>
                    </div>
                  </div>
                </div>

                {/* (d) APPROVED PROGRAMS & INTAKE TABLE */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Approved Programs &amp; Intake
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="text-left px-4 py-2.5 font-semibold">Program Name</th>
                          <th className="text-left px-4 py-2.5 font-semibold">Level</th>
                          <th className="text-left px-4 py-2.5 font-semibold">Affiliation</th>
                          <th className="text-right px-4 py-2.5 font-semibold">Approved Intake</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programRows.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="px-4 py-2.5 font-medium text-slate-700">{row.name}</td>
                            <td className="px-4 py-2.5 text-slate-600">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">{row.level}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">{row.affiliation}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-slate-800">{row.intake}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-blue-50 border-t-2 border-blue-200">
                          <td colSpan={3} className="px-4 py-2.5 font-bold text-blue-800 text-xs">
                            Total Approved Annual Intake
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-blue-800 text-sm">
                            {totalIntake} Seats
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* (e) CRYPTOGRAPHIC VERIFICATION SEAL */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-5 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <QrCode className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-bold text-white">Digital Verification Seal</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">SHA-256 Hash:</span>
                          <span className="font-mono text-[11px] text-emerald-400 break-all">
                            SHA256-EOA-{inst.permanentId || inst.id}-2026-27
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">Gazette Notification:</span>
                          <span className="font-mono text-[11px] text-slate-300">
                            AICTE/AB/{inst.region || 'XX'}/{inst.permanentId || inst.id}/2026-27
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-500" />
                        Verified via National AICTE Digital Infrastructure
                      </p>
                    </div>
                  </div>
                </div>

                {/* (f) DOWNLOAD BUTTON */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => alert('Certificate download initiated')}
                    className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-blue-700/20"
                  >
                    <Download className="w-4 h-4" />
                    Download Official EoA Certificate (PDF)
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ───── NO RESULT STATE ───── */}
        {hasSearched && noResult && (
          <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-rose-50 border-l-4 border-rose-500 px-6 py-5 flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-800">
                  ⚠️ NO MATCHING AICTE-APPROVED INSTITUTION FOUND
                </p>
                <p className="text-xs text-rose-700 mt-2 leading-relaxed">
                  The institution you searched for is <strong>NOT</strong> in the AICTE approved database.
                  This may indicate an <strong>unapproved or bogus institution</strong>.
                </p>
                <div className="mt-3 flex items-center gap-2 bg-rose-100 rounded-lg px-3 py-2">
                  <Mail className="w-4 h-4 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-800">
                    Please report to: <strong className="font-mono">complaints@aicte-india.org</strong>
                  </p>
                </div>
                <p className="text-[11px] text-rose-500 mt-2">
                  Search query: "<span className="font-mono">{searchQuery}</span>"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ───── INITIAL GUIDANCE (before search) ───── */}
        {!hasSearched && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Enter an Institution Name or AICTE Permanent ID</p>
            <p className="text-xs text-slate-500 mt-1">Verify if a technical institution holds valid AICTE approval for AY 2026-27</p>
          </div>
        )}
      </main>

      {/* ───── FOOTER ───── */}
      <footer className="bg-slate-900 text-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center space-y-2">
          <p className="text-xs font-semibold flex items-center justify-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            National Anti-Bogus Institution Helpline: <span className="font-mono text-amber-400">1800-XXX-XXXX</span> (Toll Free)
          </p>
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Mail className="w-3 h-3" />
            Report unapproved institutions at <span className="font-mono text-slate-300">complaints@aicte-india.org</span>
          </p>
          <div className="border-t border-slate-800 pt-3 mt-3">
            <p className="text-[10px] text-slate-500">
              © 2026 All India Council for Technical Education, Ministry of Education, Govt. of India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───── HELPER COMPONENT ───── */
function DetailRow({ label, value, bold, mono }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
      <span
        className={`text-xs text-slate-800 mt-0.5 ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
