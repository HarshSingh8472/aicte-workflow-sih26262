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
  ArrowRight,
  Send,
  MessageSquare,
  Smartphone,
  Mail,
  Check
} from 'lucide-react';

export default function AlertCenterDrawer({
  isOpen,
  onClose,
  alerts = [],
  onSelectCollege
}) {
  const [drawerMode, setDrawerMode] = useState('alerts'); // 'alerts' | 'outbox'
  const [outboxChannel, setOutboxChannel] = useState('whatsapp'); // 'whatsapp' | 'sms' | 'email'
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
              <h3 className="font-bold text-sm">Sentinel & Dispatch Command</h3>
              <p className="text-[11px] text-slate-400">Automated 3-Tier Alerts & Multi-Channel Outbox</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Alerts vs Outbox */}
        <div className="flex bg-slate-900 p-1 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setDrawerMode('alerts')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              drawerMode === 'alerts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>3-Tier Sentinel ({alerts.length})</span>
          </button>
          <button
            onClick={() => setDrawerMode('outbox')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              drawerMode === 'outbox' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Samanvay Sandesh (Outbox)</span>
          </button>
        </div>

        {drawerMode === 'alerts' && (
          <>
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
          </>
        )}

        {/* SAMANVAY SANDESH OUTBOX (Multi-Channel Gov Dispatch) */}
        {drawerMode === 'outbox' && (
          <div className="flex-1 overflow-y-auto flex flex-col text-xs bg-slate-50">
            {/* Channel Tabs */}
            <div className="p-2 bg-white border-b border-slate-200 flex items-center gap-1.5">
              <button
                onClick={() => setOutboxChannel('whatsapp')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  outboxChannel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setOutboxChannel('sms')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  outboxChannel === 'sms' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>NIC SMS</span>
              </button>
              <button
                onClick={() => setOutboxChannel('email')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  outboxChannel === 'email' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>e-Samvaad</span>
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Autonomous dispatch connected to National Gateway. Messages trigger automatically on SLA breach.</span>
              </div>

              {/* WHATSAPP VIEW */}
              {outboxChannel === 'whatsapp' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#DCF8C6] border border-[#C2E8A6] rounded-2xl rounded-tl-xs shadow-xs text-slate-900 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-600">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        AICTE India Verified Bot
                      </span>
                      <span>Today 10:15 AM • Read</span>
                    </div>
                    <p className="font-semibold text-xs text-slate-900">
                      🚨 URGENT: Statutory Fire NOC Expired Notice
                    </p>
                    <p className="text-[11px] text-slate-800 leading-relaxed">
                      Dear Principal, <strong>Deccan College of Pharmacy & Tech (1-774829102)</strong>. Your Municipal Fire Safety NOC expired 5 days ago. Under AICTE APH Chapter II Clause 2.4, student admissions will be locked in 48 hours unless renewal is uploaded.
                    </p>
                    <div className="pt-1 border-t border-emerald-200/80 flex items-center justify-between text-[10px] text-blue-700 font-bold">
                      <span>aicte-samanvay.gov.in/renew-noc</span>
                      <span>DELIVERED ✓✓</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#DCF8C6] border border-[#C2E8A6] rounded-2xl rounded-tl-xs shadow-xs text-slate-900 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-600">
                      <span className="font-bold text-emerald-800">AICTE India Verified Bot</span>
                      <span>Yesterday • Delivered</span>
                    </div>
                    <p className="font-semibold text-xs text-slate-900">
                      ⏳ Stage 2 EVC Ground Inspection Reminder
                    </p>
                    <p className="text-[11px] text-slate-800 leading-relaxed">
                      To Registrar, <strong>Kaveri College of Technology</strong>: EVC Panel scheduled inspection visit on 2026-10-28. Ensure 30-min continuous geocoded video stream is ready.
                    </p>
                  </div>
                </div>
              )}

              {/* SMS VIEW */}
              {outboxChannel === 'sms' && (
                <div className="space-y-3 font-mono">
                  <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                      <span className="font-bold text-blue-800">GOV-AICTE</span>
                      <span>SENT: 10:15 AM</span>
                    </div>
                    <p className="text-slate-800 text-[11px]">
                      [AICTE-ALERT]: Fire NOC lapsed for Deccan College #1-774829102. Action required immediately to avoid portal restriction. - Member Secretary AICTE
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                      <span className="font-bold text-blue-800">GOV-AICTE</span>
                      <span>SENT: 09:30 AM</span>
                    </div>
                    <p className="text-slate-800 text-[11px]">
                      [AICTE-SLA]: Stage 2 EVC Queue timer has 36 hours remaining for Kaveri College (SRO). Inspector report due.
                    </p>
                  </div>
                </div>
              )}

              {/* EMAIL VIEW */}
              {outboxChannel === 'email' && (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="border-b border-slate-100 pb-1.5 text-[11px] text-slate-600 space-y-0.5">
                      <div><strong>From:</strong> regulatory.sentinel@aicte-india.org</div>
                      <div><strong>To:</strong> principal@vjti.ac.in, ro.wro@aicte-india.org</div>
                      <div><strong>Subject:</strong> Extension of Approval (EoA) 2026-27 Recommended</div>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      This is to confirm that VJTI Technical Campus has satisfied all mandatory APH 2026-27 scrutiny checkpoints with NIRNAY Index of 98/100 (Band 1 Green-Channel). Final digital certificate ready for issuance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Sentinel re-evaluates all timelines on every "+7 Days" simulation tick.
        </div>
      </div>
    </div>
  );
}
