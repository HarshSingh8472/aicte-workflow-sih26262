import React, { useState } from 'react';
import { 
  Clock, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Image, 
  Receipt, 
  ShieldCheck 
} from 'lucide-react';

export default function UndertakingsModal({
  isOpen,
  onClose,
  undertakings = [],
  activeUndertaking = null,
  role = 'college', // 'college' | 'regional' | 'evc'
  onUploadProof,
  onVerifyUndertaking
}) {
  const [selectedUt, setSelectedUt] = useState(activeUndertaking || undertakings[0]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Proof Form State
  const [invoiceNumber, setInvoiceNumber] = useState('GST-INV-2026-44109');
  const [vendorName, setVendorName] = useState('HP India Sales Pvt Ltd');
  const [amountInr, setAmountInr] = useState('₹18,50,000');
  const [comments, setComments] = useState('30 Core i7 desktop computer terminals installed in CAD/CAM Lab with asset barcode tags.');

  if (!isOpen) return null;

  const current = selectedUt || activeUndertaking || undertakings[0];

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!current) return;
    await onUploadProof(current.id, {
      invoiceNumber,
      vendorName,
      amountInr,
      photoCount: 6,
      comments
    });
    setIsUploading(false);
  };

  const handleVerify = async () => {
    if (!current) return;
    await onVerifyUndertaking(current.id, 'Dr. Ramesh Kumar (Regional Officer)');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Time-Bound Undertakings & Compliance Sentinel
              </h3>
              <p className="text-xs text-slate-500">
                Tracking statutory conditional undertakings under AICTE APH Chapter II
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {/* Undertakings Selector if multiple */}
          {undertakings.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {undertakings.map(u => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUt(u); setIsUploading(false); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                    current?.id === u.id ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {u.collegeName.split(',')[0]} ({u.daysLeft}d left)
                </button>
              ))}
            </div>
          )}

          {current ? (
            <div className="space-y-4">
              {/* Undertaking Details Box */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Undertaking ID: {current.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{current.collegeName}</h4>
                    <span className="font-mono text-[11px] text-slate-500">Permanent ID: {current.permanentId}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    current.status === 'Verified & Closed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : current.status === 'Evidence Uploaded'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {current.status} ({current.daysLeft}d left)
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-800">{current.ruleDeficiency}</div>
                  <p className="text-slate-600 italic">"{current.undertakingText}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Issued Date: <strong>{current.issuedDate}</strong></span>
                    <span>Deadline Date: <strong className="text-rose-600">{current.deadlineDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Upload Proof View */}
              {isUploading ? (
                <form onSubmit={handleProofSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      Upload Purchase Tax Invoices & Geotagged Proofs
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="text-slate-500 hover:text-slate-800 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">GST Tax Invoice Number:</label>
                      <input
                        type="text"
                        required
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Commercial Hardware Vendor:</label>
                      <input
                        type="text"
                        required
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Total Invoice Value (INR):</label>
                      <input
                        type="text"
                        value={amountInr}
                        onChange={(e) => setAmountInr(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Geo-Tagged Images Uploaded:</label>
                      <div className="p-2 bg-white rounded-lg border border-slate-300 text-slate-500 text-[11px] flex items-center gap-1">
                        <Image className="w-3.5 h-3.5 text-blue-500" />
                        <span>6 Geotagged Classroom & Lab Photos (Verified)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Registrar Compliance Attestation:</label>
                    <textarea
                      rows={2}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs text-xs"
                  >
                    Submit Proof & Cryptographically Sign Undertaking
                  </button>
                </form>
              ) : current.proofUploaded ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Compliance Proof Document Dossier
                    </span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      VERIFIED ATTACHMENT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                    <div>Invoice #: <strong>{current.proofDetails?.invoiceNumber}</strong></div>
                    <div>Vendor: <strong>{current.proofDetails?.vendorName}</strong></div>
                    <div>Amount: <strong>{current.proofDetails?.amountInr}</strong></div>
                    <div>Submission: <strong>{current.proofDetails?.submittedDate}</strong></div>
                  </div>
                  <p className="text-[11px] text-emerald-800 italic mt-1 bg-white/80 p-2 rounded-lg border border-emerald-200">
                    "{current.proofDetails?.comments}"
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-700">No Compliance Proof Uploaded Yet</p>
                  <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                    College must upload original GST tax invoices with computer serial numbers before the {current.daysLeft}-day deadline expires.
                  </p>
                  <button
                    onClick={() => setIsUploading(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                  >
                    Upload GST Bills & Geo-Photos Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No active undertakings in the system.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 text-[11px]">
            {current?.verifiedByOfficer ? (
              <span>Verified by: <strong className="text-emerald-700">{current.verifiedByOfficer}</strong></span>
            ) : (
              <span>Under Regional Office Supervision</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {current?.status === 'Evidence Uploaded' && (
              <button
                onClick={handleVerify}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Evidence & Mark Compliant</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
