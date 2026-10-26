import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCheck, 
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AlertCenterDrawer({
  isOpen,
  onClose,
  alerts = [],
  onSelectCollege
}) {
  const [activeTier, setActiveTier] = useState('ALL'); // 'ALL' | 3 | 2 | 1

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (activeTier === 'ALL') return true;
    return a.tier === Number(activeTier);
  });

  const tier3Count = alerts.filter(a => a.tier === 3).length;
  const tier2Count = alerts.filter(a => a.tier === 2).length;
  const tier1Count = alerts.filter(a => a.tier === 1).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-600 text-white rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">3-Tier Notification & Sentinel Center</h3>
              <p className="text-[11px] text-slate-400">Automated AICTE Compliance & Escalation Sentinel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Tabs */}
        <div className="flex items-center justify-between p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTier('ALL')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              activeTier === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTier(3)}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTier === 3 ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Tier 3 ({tier3Count})</span>
          </button>
          <button
            onClick={() => setActiveTier(2)}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTier === 2 ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tier 2 ({tier2Count})</span>
          </button>
          <button
            onClick={() => setActiveTier(1)}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTier === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Tier 1 ({tier1Count})</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p>No active alerts in this tier.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isTier3 = alert.tier === 3;
              const isTier2 = alert.tier === 2;

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isTier3 
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950 shadow-xs' 
                      : isTier2 
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                      : 'bg-blue-50/70 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isTier3 ? 'bg-rose-600 text-white' : isTier2 ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                    }`}>
                      {alert.tierTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs">
                    {alert.collegeName}
                  </h4>
                  <p className="mt-1 leading-relaxed text-[11px] text-slate-700">
                    {alert.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1 text-[10px] text-slate-600">
                    {alert.actionRequired && (
                      <div>
                        Action: <strong className="text-slate-800">{alert.actionRequired}</strong>
                      </div>
                    )}
                    {alert.escalatedTo && (
                      <div>
                        Auto-Escalated To: <strong className="text-rose-700">{alert.escalatedTo}</strong>
                      </div>
                    )}
                  </div>

                  {alert.collegeId && (
                    <button
                      onClick={() => {
                        onSelectCollege(alert.collegeId);
                        onClose();
                      }}
                      className="mt-2.5 w-full py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[11px] flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>Jump to Institution</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Sentinel re-evaluates all timelines on every "+7 Days" simulation tick.
        </div>
      </div>
    </div>
  );
}
