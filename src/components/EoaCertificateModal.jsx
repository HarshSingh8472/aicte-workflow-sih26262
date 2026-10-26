import React from 'react';
import { 
  Award, 
  Printer, 
  X, 
  QrCode, 
  CheckCircle2, 
  Building2, 
  ShieldCheck,
  Download
} from 'lucide-react';

export default function EoaCertificateModal({
  isOpen,
  onClose,
  institution = null
}) {
  if (!isOpen || !institution) return null;

  const handlePrint = () => {
    window.print();
  };

  const eoaNumber = institution.eoaDetails?.eoaNumber || `AICTE/AB/${institution.region}/${institution.permanentId}/2026-27`;
  const issueDate = institution.eoaDetails?.issueDate || '26-Oct-2026';
  const intake = institution.totalStudents || 420;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-8 space-y-6 my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        
        {/* Top Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official AICTE Extension of Approval (EoA) Digital Certificate
              </h3>
              <p className="text-xs text-slate-500">
                Government of India Statutory Grant of Approval for Academic Year 2026-2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official EoA</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL CERTIFICATE DOCUMENT */}
        <div id="eoa-certificate-print-area" className="border-4 border-slate-900 p-8 rounded-xl bg-white space-y-6 text-slate-900 font-serif">
          
          {/* Official Emblem & Header */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-sans font-extrabold text-sm tracking-wider shadow-md">
              AICTE
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight uppercase text-slate-950">
                All India Council for Technical Education
              </h2>
              <p className="text-xs text-slate-700 font-sans font-medium">
                (A Statutory Body of the Government of India, Ministry of Education)
              </p>
              <p className="text-[11px] text-slate-600 font-sans">
                Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 • Website: www.aicte-india.org
              </p>
            </div>
          </div>

          {/* Letter Meta */}
          <div className="flex flex-wrap items-center justify-between text-xs font-sans border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-500 block">F. No.</span>
              <strong className="font-mono text-slate-900">{eoaNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Date of Digital Issuance</span>
              <strong className="text-slate-900">{issueDate}</strong>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1 font-sans text-xs">
            <p className="text-slate-800">
              <strong>To:</strong> The Principal Secretary / Director of Technical Education
            </p>
            <p className="text-slate-800">
              <strong>Subject:</strong> Extension of Approval (EoA) / Grant of Approval for Academic Year 2026-2027
            </p>
            <p className="text-slate-800">
              <strong>Ref:</strong> Institutional Application ID: <strong className="font-mono">{institution.permanentId}</strong>
            </p>
          </div>

          {/* Letter Body */}
          <div className="space-y-3 font-serif text-xs leading-relaxed text-slate-900">
            <p>
              Sir / Madam,
            </p>
            <p className="text-justify">
              In terms of the provisions under the <strong>All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2026</strong> notified by the Council vide notification number F.No. AB/AICTE/REG/2026 and standards prescribed in the Approval Process Handbook 2026-27, I am directed to convey the approval to:
            </p>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg font-sans text-xs space-y-1">
              <div><strong>Name of Institution:</strong> {institution.name}</div>
              <div><strong>Permanent Institute ID:</strong> <span className="font-mono">{institution.permanentId}</span></div>
              <div><strong>Campus Location:</strong> {institution.city}, {institution.state} ({institution.region})</div>
              <div><strong>Continuous Land Verified:</strong> {institution.landAcres} Acres (Approved Urban Standard)</div>
            </div>

            <p className="text-justify">
              to conduct following courses with the intake indicated below for the Academic Year <strong>2026-2027</strong>:
            </p>

            {/* Approved Intake Table */}
            <div className="border border-slate-400 rounded-lg overflow-hidden font-sans">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <tr>
                    <th className="px-3 py-2">Program</th>
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">Affiliating Body</th>
                    <th className="px-3 py-2 text-right">Approved Intake (2026-27)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-3 py-2 font-medium">Computer Science & Engineering</td>
                    <td className="px-3 py-2">Under Graduate</td>
                    <td className="px-3 py-2">State Technical University</td>
                    <td className="px-3 py-2 font-bold text-right">180</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Artificial Intelligence & Data Science</td>
                    <td className="px-3 py-2">Under Graduate</td>
                    <td className="px-3 py-2">State Technical University</td>
                    <td className="px-3 py-2 font-bold text-right">120</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Electronics & Telecommunication Engg</td>
                    <td className="px-3 py-2">Under Graduate</td>
                    <td className="px-3 py-2">State Technical University</td>
                    <td className="px-3 py-2 font-bold text-right">120</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-400">
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-right">Total Approved Annual Intake:</td>
                    <td className="px-3 py-2 text-right font-extrabold text-blue-900">{intake} Seats</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-[11px] text-justify text-slate-700 italic">
              Note: This approval is subject to strict adherence to the norms, standards, and guidelines specified by AICTE from time to time. The institution shall ensure maintenance of student-to-faculty ratio of 1:15 and fire safety certifications at all times.
            </p>
          </div>

          {/* Signatures & QR Code */}
          <div className="pt-4 border-t-2 border-slate-900 flex flex-wrap items-end justify-between font-sans text-xs gap-4">
            {/* QR Code Verification */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-slate-900 text-white p-2 rounded-lg flex flex-col items-center justify-center font-mono text-[9px] shadow-sm">
                <QrCode className="w-12 h-12 text-white mb-1" />
                <span>AICTE-VERIFIED</span>
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-600">
                <span className="font-bold text-slate-900 block">Digital Verification QR:</span>
                <span>Scan with National AICTE App</span>
                <span className="block font-mono text-[10px] text-slate-500">Hash: SHA256-EOA-{institution.permanentId}</span>
              </div>
            </div>

            {/* Officer Signature */}
            <div className="text-right space-y-1">
              <div className="font-serif italic text-base text-slate-800">
                Dr. Ramesh Kumar, Ph.D.
              </div>
              <div className="font-bold text-slate-900 text-xs">
                Regional Officer & Member Secretary
              </div>
              <div className="text-[11px] text-slate-600">
                All India Council for Technical Education
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                [Digitally Signed using National e-Sign DSC]
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
