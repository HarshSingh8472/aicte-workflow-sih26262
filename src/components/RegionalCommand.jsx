import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  FileCheck2, 
  Eye, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Award, 
  Search, 
  Filter, 
  Download, 
  QrCode, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles,
  Layers
} from 'lucide-react';
import PendencyMatrix from './PendencyMatrix';
import NirnayScoreCard from './NirnayScoreCard';
import { calculateNirnayIndex } from '../services/ruleEngine';

export default function RegionalCommand({
  institutions = [],
  alerts = [],
  undertakings = [],
  aphRules,
  currentDate,
  onIssueEoa,
  onViewAudit,
  onOpenVault,
  onOpenUndertakings,
  onSelectInstitution
}) {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const normalizeStage = (st) => {
    if (st === 'conditional_undertaking') return 'evc_queue';
    if (st === 'escalated_deficiency') return 'scrutiny_queue';
    if (st === 'eoa_issued') return 'ro_approval';
    return st;
  };

  // Filtered institutions
  const filteredColleges = institutions.filter(inst => {
    const matchesRegion = selectedRegion === 'ALL' || inst.region === selectedRegion;
    const matchesStage = selectedStage === 'ALL' || normalizeStage(inst.currentStage) === selectedStage;
    
    let matchesStatus = true;
    if (statusFilter === 'COMPLIANT') {
      matchesStatus = inst.status.includes('Compliant') || inst.eoaIssued;
    } else if (statusFilter === 'OVERDUE') {
      matchesStatus = inst.slaDaysRemaining < 0;
    } else if (statusFilter === 'RO_READY') {
      matchesStatus = inst.currentStage === 'ro_approval';
    } else if (statusFilter === 'FAST_TRACK') {
      const idx = calculateNirnayIndex(inst, aphRules, currentDate);
      matchesStatus = idx.score >= 90;
    } else if (statusFilter === 'CRITICAL_RED') {
      const idx = calculateNirnayIndex(inst, aphRules, currentDate);
      matchesStatus = idx.score < 60;
    }

    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.permanentId.includes(searchQuery) ||
      inst.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRegion && matchesStage && matchesStatus && matchesSearch;
  });

  const handleCellSelect = (reg, st) => {
    setSelectedRegion(reg);
    setSelectedStage(st);
  };

  // KPI Calculations
  const totalCount = institutions.length;
  const approvedCount = institutions.filter(i => i.eoaIssued).length;
  const roReadyCount = institutions.filter(i => i.currentStage === 'ro_approval').length;
  const overdueCount = institutions.filter(i => i.slaDaysRemaining < 0).length;
  const activeUndertakingsCount = undertakings.filter(u => u.status === 'Pending Proof' || u.status === 'Evidence Uploaded').length;

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-gov">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Central Bureau Command & Regional Directorate
              </span>
              <span className="text-slate-400 text-xs font-mono">
                AICTE Approval Monitoring & Escalation Sentinel
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              Regional Office Command Center & Statutory Analytics
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Real-time multi-regional governance dashboard monitoring technical institutions across WRO, SRO, ERO, and NRO. Instant digital sign-off and Extension of Approval (EoA) issuance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenVault}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Statutory Expiry Vault
            </button>
            <button
              onClick={onOpenUndertakings}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Undertakings Tracker ({activeUndertakingsCount})
            </button>
          </div>
        </div>

        {/* Real-Time Regional KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-xs">Total Dossiers</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{totalCount}</span>
            <span className="text-[11px] text-slate-500">Across All Regions</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-xs">Awaiting RO Sign-off</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{roReadyCount}</span>
            <span className="text-[11px] text-emerald-500/80">Cleared Inspection</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-xs">Issued EoAs 2026-27</span>
            <span className="text-2xl font-extrabold text-blue-400 mt-1 block">{approvedCount}</span>
            <span className="text-[11px] text-blue-400/80">Digital Certificates</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-xs">Overdue SLA Warnings</span>
            <span className={`text-2xl font-extrabold mt-1 block ${overdueCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {overdueCount}
            </span>
            <span className="text-[11px] text-rose-400/80">Breached Timelines</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-xs">Active Undertakings</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{activeUndertakingsCount}</span>
            <span className="text-[11px] text-amber-400/80">Conditional Relief</span>
          </div>
        </div>
      </div>

      {/* Regional Pendency Radar & Stage Velocity Matrix */}
      <PendencyMatrix 
        institutions={institutions}
        selectedRegion={selectedRegion}
        selectedStage={selectedStage}
        onCellSelect={handleCellSelect}
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Region Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg font-medium text-slate-700">
            {['ALL', 'WRO', 'SRO', 'ERO', 'NRO'].map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedRegion === region ? 'bg-white text-blue-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="RO_READY">Awaiting Final RO Sign-off</option>
            <option value="COMPLIANT">Compliant / EoA Issued</option>
            <option value="OVERDUE">SLA Overdue / Deficient</option>
            <option value="FAST_TRACK">NIRNAY FastTrack (Score &ge; 90)</option>
            <option value="CRITICAL_RED">NIRNAY High Risk (Score &lt; 60)</option>
          </select>

          {selectedStage !== 'ALL' && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1 text-[11px]">
              Stage: {selectedStage.replace('_', ' ')}
              <button onClick={() => setSelectedStage('ALL')} className="ml-1 text-slate-400 hover:text-slate-700 font-bold">&times;</button>
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college, ID, or city..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Institutions Compliance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Permanent ID</th>
                <th className="px-4 py-3">NIRNAY Regulatory Index</th>
                <th className="px-4 py-3">Category & Path</th>
                <th className="px-4 py-3">Current Stage</th>
                <th className="px-4 py-3">Compliance Status</th>
                <th className="px-4 py-3">SLA Timer</th>
                <th className="px-4 py-3 text-right">Regional Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredColleges.map((inst) => {
                const isRoReady = inst.currentStage === 'ro_approval';
                const isOverdue = inst.slaDaysRemaining < 0;

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Institution */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{inst.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{inst.city}, {inst.state}</span>
                        <span>•</span>
                        <span className="font-semibold text-blue-700">{inst.region}</span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                      {inst.permanentId}
                    </td>

                    {/* NIRNAY Regulatory Index */}
                    <td className="px-4 py-3.5">
                      <NirnayScoreCard institution={inst} rules={aphRules} currentDate={currentDate} compact={true} />
                    </td>

                    {/* Category & Path */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">{inst.category}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {inst.pathTitle}
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3.5">
                      <span className="capitalize font-semibold text-slate-800 block">
                        {inst.currentStage.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Updated {inst.stageUpdatedDate}
                      </span>
                    </td>

                    {/* Compliance Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        inst.eoaIssued
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : inst.statusTone === 'green'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : inst.statusTone === 'amber'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {inst.eoaIssued ? (
                          <>
                            <Award className="w-3.5 h-3.5" /> EoA Issued
                          </>
                        ) : (
                          inst.status
                        )}
                      </span>
                    </td>

                    {/* SLA Timer */}
                    <td className="px-4 py-3.5">
                      {inst.slaDaysRemaining !== undefined ? (
                        <span className={`font-mono text-xs font-bold ${
                          isOverdue ? 'text-rose-600' : inst.slaDaysRemaining <= 2 ? 'text-amber-600' : 'text-slate-700'
                        }`}>
                          {isOverdue ? `-${Math.abs(inst.slaDaysRemaining)}d Overdue` : `${inst.slaDaysRemaining}d Left`}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">Completed</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {isRoReady && !inst.eoaIssued && (
                        <button
                          onClick={() => onIssueEoa(inst)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1"
                          title="Grant official AICTE Extension of Approval with digital seal and QR code"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Grant EoA Approval</span>
                        </button>
                      )}

                      {inst.eoaIssued && (
                        <button
                          onClick={() => onIssueEoa(inst)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 inline-flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View EoA</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewAudit(inst)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                        title="View SHA-256 immutable audit logs"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
