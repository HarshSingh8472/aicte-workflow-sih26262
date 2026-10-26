import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  UploadCloud, 
  FileText, 
  Filter, 
  Search, 
  Clock, 
  Building2, 
  Landmark 
} from 'lucide-react';

export default function DocumentVaultView({
  institutions = [],
  currentDate,
  onOpenRenewModal,
  onVerifyDocument
}) {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'EXPIRED' | 'APPROACHING' | 'VALID'
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all documents across institutions
  const allDocs = [];
  institutions.forEach(inst => {
    (inst.documents || []).forEach(doc => {
      allDocs.push({
        ...doc,
        institutionId: inst.id,
        institutionName: inst.name,
        permanentId: inst.permanentId,
        region: inst.region
      });
    });
  });

  const filteredDocs = allDocs.filter(d => {
    const matchesTab = filterTab === 'ALL' ||
      (filterTab === 'EXPIRED' && d.status === 'expired') ||
      (filterTab === 'APPROACHING' && d.status === 'approaching_expiry') ||
      (filterTab === 'VALID' && d.status === 'valid');

    const matchesType = docTypeFilter === 'ALL' || d.type === docTypeFilter;

    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.docNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesType && matchesSearch;
  });

  const expiredCount = allDocs.filter(d => d.status === 'expired').length;
  const approachingCount = allDocs.filter(d => d.status === 'approaching_expiry').length;
  const validCount = allDocs.filter(d => d.status === 'valid').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-gov">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Statutory Expiry Sentinel
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Real-Time Document Lifecycle Vault
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Landmark className="w-6 h-6 text-indigo-400" />
              Lease, Fire NOC & Bank FDR Expiry Vault
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Automated compliance vault monitoring expiration dates for registered land lease deeds, municipal fire safety NOCs, structural stability certifications, and joint AICTE Fixed Deposit Receipts (FDRs).
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Expired</span>
              <span className="text-xl font-extrabold text-rose-400">{expiredCount}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">&lt;30d Approaching</span>
              <span className="text-xl font-extrabold text-amber-400">{approachingCount}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Valid Certified</span>
              <span className="text-xl font-extrabold text-emerald-400">{validCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Validity Status Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg font-medium text-slate-700">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterTab === 'ALL' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              All Documents ({allDocs.length})
            </button>
            <button
              onClick={() => setFilterTab('EXPIRED')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterTab === 'EXPIRED' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Expired ({expiredCount})
            </button>
            <button
              onClick={() => setFilterTab('APPROACHING')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterTab === 'APPROACHING' ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              &lt;30 Days ({approachingCount})
            </button>
            <button
              onClick={() => setFilterTab('VALID')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterTab === 'VALID' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Valid ({validCount})
            </button>
          </div>

          {/* Doc Type Selector */}
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="ALL">All Document Types</option>
            <option value="Land Lease">Land Lease Deeds</option>
            <option value="Fire NOC">Fire Safety NOCs</option>
            <option value="Stability">Structural Stability</option>
            <option value="Bank FDR">Bank Fixed Deposits (FDR)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college, title, cert #..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Document Title & Number</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Validity Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc, idx) => {
                const isExpired = doc.status === 'expired';
                const isApproaching = doc.status === 'approaching_expiry';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        #{doc.docNumber}
                        {doc.amountInr && (
                          <span className="ml-2 font-bold text-blue-700">₹{doc.amountInr}</span>
                        )}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{doc.institutionName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {doc.permanentId} ({doc.region})
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {doc.type}
                      </span>
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 py-3.5 text-slate-600">
                      {doc.issueDate}
                    </td>

                    {/* Expiry Date */}
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {doc.expiryDate}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isExpired
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isApproaching
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isExpired ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Expired (Auto-Escalated)
                          </>
                        ) : isApproaching ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" /> Expires &lt;30d
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid Certified
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenRenewModal(institutions.find(i => i.id === doc.institutionId), doc)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200"
                        title="Upload renewed certificate or revalidated FDR"
                      >
                        Upload Renewal
                      </button>

                      {!doc.verified && (
                        <button
                          onClick={() => onVerifyDocument(doc.institutionId, doc.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          title="Officer verification against issuing authority database"
                        >
                          Verify
                        </button>
                      )}
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
