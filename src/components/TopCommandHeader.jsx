import React, { useState } from 'react';
import { 
  Building2, 
  FileCheck2, 
  Eye, 
  Scale, 
  ShieldCheck, 
  CalendarPlus, 
  Sliders, 
  Bell, 
  Download, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
  Shield
} from 'lucide-react';

export default function TopCommandHeader({
  activeRole,
  onRoleChange,
  currentDate,
  simulatedDaysAdded,
  onSimulateDays,
  onOpenRules,
  onOpenAlerts,
  onResetDb,
  onExportData,
  unreadAlertCount = 0,
  tier3AlertCount = 0,
  activeInstitutionCount = 6
}) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // 5 Internal Officer Workflow Stages
  const workflowRoles = [
    {
      id: 'college',
      name: 'College Admin',
      label: 'College Portal',
      icon: Building2,
      badge: 'Institution'
    },
    {
      id: 'scrutiny',
      name: 'Stage 1: Scrutiny Officer',
      label: '1. Scrutiny Desk',
      icon: FileCheck2,
      badge: 'Desk Check'
    },
    {
      id: 'evc',
      name: 'Stage 2: EVC Inspector',
      label: '2. EVC Visit',
      icon: Eye,
      badge: 'Ground & GIS'
    },
    {
      id: 'sac',
      name: 'Stage 3: SAC Appellate',
      label: '3. SAC Appeals',
      icon: Scale,
      badge: 'Appeals'
    },
    {
      id: 'regional',
      name: 'Regional / Bureau Officer',
      label: '4. Regional Command',
      icon: ShieldCheck,
      badge: 'Bureau'
    }
  ];

  const handleSimulate = async () => {
    setSimulating(true);
    await onSimulateDays(7);
    setTimeout(() => setSimulating(false), 400);
  };

  return (
    <header className="sticky top-0 z-50 shadow-gov border-b border-slate-800 glass-header text-white">
      {/* ─── TIER 1: SLIM GOVERNMENT RIBBON (26px) ─── */}
      <div className="bg-slate-950/95 px-4 py-1 border-b border-slate-800/80 text-[11px] flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Smart India Hackathon • SIH26262
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            All India Council for Technical Education (Ministry of Education, Govt. of India)
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline text-slate-400">System Date:</span>
            <strong className="text-white">{currentDate}</strong>
            {simulatedDaysAdded > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 text-[10px] border border-blue-700/50">
                +{simulatedDaysAdded}d
              </span>
            )}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Hybrid Engine
          </span>
        </div>
      </div>

      {/* ─── TIER 2: STRICT SINGLE-ROW COMMAND BAR (54px) ─── */}
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: AICTE Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex items-center justify-center shadow-md border border-blue-400/30 text-amber-400 font-extrabold text-[11px] tracking-wider shrink-0">
            AICTE
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-sans">
                AICTE Samanvay
              </h1>
              <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                APH 2026-27
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block leading-none mt-0.5">
              Approval Workflow & Compliance Sentinel
            </p>
          </div>
        </div>

        {/* Center: 5-Stage Workflow Roles (STRICT SINGLE ROW) */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
          {workflowRoles.map(r => {
            const Icon = r.icon;
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`Switch perspective to ${r.name}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Citizen /verify + Demo Controls + Alerts (SINGLE ROW) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Distinct Citizen /verify Pill (External Citizen Portal) */}
          <button
            onClick={() => onRoleChange('verify')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
              activeRole === 'verify'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/50'
            }`}
            title="Citizen Portal: Public Anti-Bogus & EoA Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Citizen</span>
            <span>/verify</span>
          </button>

          {/* Compact +7 Days SLA Simulator Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all active:scale-95 whitespace-nowrap ${
              simulating ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Advance system date by 7 days to trigger SLA countdowns and statutory expiry alerts"
          >
            <CalendarPlus className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>+7d SLA</span>
          </button>

          {/* Alerts Bell Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Open 3-Tier Alert Sentinel (4 Active Alerts across Tiers 1-3)"
          >
            <Bell className={`w-3.5 h-3.5 ${tier3AlertCount > 0 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            {unreadAlertCount > 0 && (
              <span className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                tier3AlertCount > 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Unified Demo Tools Popover (Rules, Export, Reset DB) */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Admin & Evaluator Tools"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline text-xs">Tools</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {toolsOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1 text-xs z-50 divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 block">
                    Handbook Rules
                  </span>
                  <button
                    onClick={() => { onOpenRules(); setToolsOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-left font-medium"
                  >
                    <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Configure APH Rules</span>
                  </button>
                </div>

                <div className="p-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 block">
                    Data Export
                  </span>
                  <button
                    onClick={() => { onExportData('csv'); setToolsOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Download CSV Report</span>
                  </button>
                  <button
                    onClick={() => { onExportData('json'); setToolsOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Download JSON Dossier</span>
                  </button>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => { onResetDb(); setToolsOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/60 text-rose-300 text-left font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Reset to Seed Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
