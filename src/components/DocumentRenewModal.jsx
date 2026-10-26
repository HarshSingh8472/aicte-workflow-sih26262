import React, { useState } from 'react';
import { 
  UploadCloud, 
  X, 
  FileCheck2, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function DocumentRenewModal({
  isOpen,
  onClose,
  institution = null,
  document = null,
  onRenewSubmit
}) {
  if (!isOpen || !document) return null;

  const [docNumber, setDocNumber] = useState(
    `${document.docNumber}-REN-2026`
  );
  const [issueDate, setIssueDate] = useState('2026-10-26');
  const [expiryDate, setExpiryDate] = useState('2027-10-25');
  const [remarks, setRemarks] = useState(
    'Revalidation certificate issued by competent authority uploaded.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onRenewSubmit(institution.id, document.id, {
      docNumber,
      issueDate,
      expiryDate,
      remarks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <UploadCloud className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Upload Statutory Document Renewal
              </h3>
              <p className="text-[11px] text-slate-500">
                {institution?.name} • {document.type}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Current Document Title:</span>
            <span className="font-bold text-slate-800 text-xs">{document.title}</span>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
              Previous Expiry: {document.expiryDate} ({document.status.toUpperCase()})
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Renewed Certificate / FDR Number:
            </label>
            <input
              type="text"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Issue Date:
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Expiry / Maturity Date:
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Issuing Authority Remarks:
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Upload Renewal & Clear Red Flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
