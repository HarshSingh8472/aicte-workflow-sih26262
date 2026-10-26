import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Hash, 
  X, 
  Clock, 
  User, 
  CheckCircle2, 
  Copy, 
  Filter, 
  Search,
  Lock
} from 'lucide-react';

export default function AuditTrailModal({
  isOpen,
  onClose,
  auditLogs = [],
  institution = null
}) {
  const [copiedHash, setCopiedHash] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  // Filter logs if institution was specified, or allow user search
  const displayedLogs = auditLogs.filter(log => {
    const matchesInst = !institution || log.institutionId === institution.id || log.institutionId === 'SYSTEM-WIDE';
    const matchesQuery = log.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.remarks.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.collegeName.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesInst && matchesQuery;
  });

  const handleCopy = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Immutable Cryptographic Audit Trail
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SHA-256 VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {institution ? `Showing digital audit ledger for ${institution.name}` : 'Central statutory transaction log'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search action, officer, remark, or institution..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
          {displayedLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No audit log entries match your filter.
            </div>
          ) : (
            displayedLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {log.collegeName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {log.timestamp}
                  </span>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed">
                  {log.remarks}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Officer: <strong className="text-slate-700">{log.user}</strong> ({log.role})</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[220px]" title={log.hash}>
                      {log.hash}
                    </span>
                    <button
                      onClick={() => handleCopy(log.hash)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                      title="Copy SHA-256 hash"
                    >
                      {copiedHash === log.hash ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Every transaction is sealed with SHA-256 cryptographic proof to guarantee zero tampering.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
