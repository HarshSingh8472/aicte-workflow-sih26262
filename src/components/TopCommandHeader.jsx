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
  Sparkles
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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const roles = [
    {
      id: 'college',
      name: 'College Admin',
      label: '1. College Portal',
      icon: Building2,
      badge: 'Institution View',
      color: 'hover:bg-blue-800'
    },
    {
      id: 'scrutiny',
      name: 'Stage 1: Scrutiny Officer',
      label: '2. Desk Scrutiny',
      icon: FileCheck2,
      badge: 'Desk Verification',
      color: 'hover:bg-indigo-800'
    },
    {
      id: 'evc',
      name: 'Stage 2: EVC Inspector',
      label: '3. EVC Inspection',
      icon: Eye,
      badge: 'Ground & Video',
      color: 'hover:bg-emerald-800'
    },
    {
      id: 'sac',
      name: 'Stage 3: SAC Appellate',
      label: '4. SAC Appeals',
      icon: Scale,
      badge: 'Quasi-Judicial',
      color: 'hover:bg-amber-800'
    },
    {
      id: 'regional',
      name: 'Regional / Bureau Officer',
      label: '5. Regional Command',
      icon: ShieldCheck,
      badge: 'Command Center',
      color: 'hover:bg-purple-800'
    }
  ];

  const handleSimulate = async () => {
    setSimulating(true);
    await onSimulateDays(7);
    setTimeout(() => setSimulating(false), 400);
  };

  return (
    <header className="sticky top-0 z-50 shadow-gov border-b border-slate-800 glass-header text-white">
      {/* Top AICTE Gov Banner */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Smart India Hackathon • SIH26262
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            All India Council for Technical Education (Ministry of Education, Govt. of India)
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Simulated System Date: <strong className="text-white">{currentDate}</strong>
            {simulatedDaysAdded > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] border border-blue-700/50">
                +{simulatedDaysAdded}d
              </span>
            )}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Hybrid Engine Active
          </span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: AICTE Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex items-center justify-center shadow-lg border border-blue-400/30 ring-1 ring-white/10 shrink-0">
            <span className="font-extrabold text-amber-400 tracking-wider text-xs">AICTE</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
                AICTE Samanvay
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                APH 2026-27
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Integrated Approval & Compliance Sentinel Portal
            </p>
          </div>
        </div>

        {/* Center: 5-Role Switcher */}
        <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex flex-wrap items-center gap-1">
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`Switch perspective to ${r.name}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Simulation & Admin Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Simulate +7 Days Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md transition-all active:scale-95 ${
              simulating ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Advance system date by 7 days to trigger SLA countdowns and expiry warnings"
          >
            <CalendarPlus className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            <span>+7 Days (SLA Scan)</span>
          </button>

          {/* Rule Configurator Button */}
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Configure APH Handbook rules (Classroom 66 sq.m, Faculty 1:15 ratio, etc.)"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>APH Rules</span>
          </button>

          {/* Alerts Center Button */}
          <button
            onClick={onOpenAlerts}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Open 3-Tier Alert & Auto-Escalation Center"
          >
            <Bell className={`w-3.5 h-3.5 ${tier3AlertCount > 0 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <span>Alerts</span>
            {unreadAlertCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                tier3AlertCount > 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              title="Export compliance data"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 text-xs z-50">
                <button
                  onClick={() => { onExportData('csv'); setExportMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => { onExportData('json'); setExportMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Download JSON
                </button>
              </div>
            )}
          </div>

          {/* Reset DB Button */}
          <button
            onClick={onResetDb}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Reset database to original SIH seed state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
