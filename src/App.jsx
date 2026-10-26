import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { aicteApi } from './services/api';
import TopCommandHeader from './components/TopCommandHeader';
import CollegePortalView from './components/CollegePortalView';
import ScrutinyWorkbench from './components/ScrutinyWorkbench';
import EvcWorkbench from './components/EvcWorkbench';
import SacAppealView from './components/SacAppealView';
import RegionalCommand from './components/RegionalCommand';
import DocumentVaultView from './components/DocumentVaultView';
import AlertCenterDrawer from './components/AlertCenterDrawer';
import AuditTrailModal from './components/AuditTrailModal';
import RuleConfigModal from './components/RuleConfigModal';
import UndertakingsModal from './components/UndertakingsModal';
import DocumentRenewModal from './components/DocumentRenewModal';
import EoaCertificateModal from './components/EoaCertificateModal';
import { 
  Building2, 
  FileCheck2, 
  Eye, 
  Scale, 
  ShieldCheck, 
  Landmark, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('college'); // 'college' | 'scrutiny' | 'evc' | 'sac' | 'regional' | 'vault'
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditInst, setAuditInst] = useState(null);
  const [undertakingsModalOpen, setUndertakingsModalOpen] = useState(false);
  const [activeUndertaking, setActiveUndertaking] = useState(null);
  const [renewDocModalOpen, setRenewDocModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState({ inst: null, doc: null });
  const [eoaModalOpen, setEoaModalOpen] = useState(false);
  const [eoaInst, setEoaInst] = useState(null);

  // Toast Helper
  const showToast = (title, message, tone = 'blue') => {
    setToastMessage({ title, message, tone });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load initial data
  const loadState = async () => {
    try {
      const state = await aicteApi.getState();
      setData(state);
    } catch (e) {
      console.error('Failed to load state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Handlers
  const handleSimulateDays = async (days = 7) => {
    const updated = await aicteApi.simulateDays(days);
    setData(updated);
    showToast(
      `SLA & Expiry Sentinel Advanced +${days} Days`,
      `New system date: ${updated.systemState.currentDate}. Recalculated all institutional deadlines and document validity.`,
      'amber'
    );
  };

  const handleSaveRules = async (newRules) => {
    const updated = await aicteApi.updateRules(newRules);
    setData(updated);
    showToast(
      'APH Handbook Rules Updated',
      'All 6 registered colleges re-evaluated in real time against revised handbook criteria.',
      'emerald'
    );
  };

  const handleApproveScrutiny = async (inst, notes) => {
    // If Path 1, goes to ro_approval; If Path 2, goes to evc_queue
    const nextStage = inst.assignedPath === 'path-1' ? 'ro_approval' : 'evc_queue';
    const updated = await aicteApi.transitionStage(inst.id, nextStage, {
      role: 'Scrutiny Committee Officer',
      user: 'Dr. R. K. Shinde (WRO Scrutiny)',
      notes: notes || 'All stamped certificates, municipal floor plans, and faculty credentials verified compliant.',
      remarks: `Stage 1 Desk Scrutiny Approved. Routed to ${nextStage === 'ro_approval' ? 'Regional Officer' : 'Stage 2 EVC Queue'}.`
    });
    setData(updated);
    showToast(
      'Stage 1 Desk Scrutiny Approved',
      `${inst.name} forwarded to ${nextStage === 'ro_approval' ? 'Regional Officer' : 'Stage 2 EVC Inspection Queue'}. 5-day scheduling SLA timer active.`,
      'indigo'
    );
  };

  const handleRaiseDeficiency = async (inst, notes) => {
    const updated = await aicteApi.transitionStage(inst.id, 'sac_appeal', {
      role: 'Scrutiny Committee Officer',
      user: 'Dr. R. K. Shinde (WRO Scrutiny)',
      remarks: notes || 'Deficiency observed in certificate metrics. Routed to SAC appellate hearing.',
      grounds: notes || 'Discrepancy observed in documentation; institution notified to present rectified evidence before SAC bench.'
    });
    setData(updated);
    showToast(
      'Deficiency Flagged',
      `${inst.name} deficiency registered. Appeal dossier forwarded to Standing Appellate Committee (SAC).`,
      'rose'
    );
  };

  const handleClearEvc = async (inst, groundData) => {
    const updated = await aicteApi.transitionStage(inst.id, 'ro_approval', {
      role: 'EVC Inspector',
      user: 'National EVC Inspection Panelist',
      remarks: groundData.remarks || `Physical inspection and 30-min continuous walkthrough verified. Found ${groundData.actualPcs} PCs, ${groundData.actualFloors} floors, and ${groundData.actualFaculty} present faculty.`
    });
    setData(updated);
    showToast(
      'Stage 2 EVC Inspection Cleared',
      `${inst.name} passed ground reality verification. Forwarded to Regional Officer for final EoA grant.`,
      'emerald'
    );
  };

  const handleOpenUndertakingModal = (inst, shortage, remarks) => {
    handleGrantConditionalUndertaking(inst, shortage, remarks);
  };

  const handleGrantConditionalUndertaking = async (inst, shortage = 30, remarks = '') => {
    const updated = await aicteApi.transitionStage(inst.id, 'conditional_undertaking', {
      role: 'EVC Inspector',
      user: 'Prof. B. C. Ganguly (ERO Panelist)',
      undertakingDays: 14,
      deficiencyCategory: 'Hardware / Infrastructure Shortfall',
      undertakingReason: `Recorded physical shortfall of ${shortage} computers during EVC ground visit.`,
      undertakingText: `The institution undertakes to install ${shortage} additional commercial computers and upload original GST tax invoices with geotagged proofs within 14 days.`,
      remarks: remarks || `Granted 14-day conditional undertaking UT-001 for ${shortage} computer terminals.`
    });
    setData(updated);
    showToast(
      'Conditional Approval Granted',
      `${inst.name} granted 14-day time-bound undertaking. College must upload original tax bills before deadline.`,
      'amber'
    );
  };

  const handleRejectEvc = async (inst, remarks) => {
    const updated = await aicteApi.transitionStage(inst.id, 'sac_appeal', {
      role: 'EVC Inspector',
      user: 'National EVC Panelist',
      remarks: remarks || 'Physical ground verification revealed major structural deficiency. Routed to SAC appeal queue.'
    });
    setData(updated);
    showToast(
      'EVC Inspection Flagged Deficiency',
      `${inst.name} ground reality failed inspection. College notified to appear before SAC Appellate Bench.`,
      'rose'
    );
  };

  const handleGrantAppeal = async (inst, benchVerdict) => {
    const updated = await aicteApi.transitionStage(inst.id, 'ro_approval', {
      role: 'Stage 3: SAC Appellate Bench',
      user: "Hon'ble Retd. High Court Justice & AICTE Senior Fellow",
      remarks: benchVerdict || 'Hon\'ble SAC Bench examined rectified evidence and contractor completion deed. Appeal Allowed with direction to grant EoA.'
    });
    setData(updated);
    showToast(
      'SAC Appeal Allowed',
      `Appellate bench set aside rejection for ${inst.name}. Forwarded to Regional Officer for digital EoA certificate.`,
      'emerald'
    );
  };

  const handleDismissAppeal = async (inst, benchVerdict) => {
    const updated = await aicteApi.transitionStage(inst.id, 'escalated_deficiency', {
      role: 'Stage 3: SAC Appellate Bench',
      user: "Hon'ble Retd. High Court Justice & AICTE Senior Fellow",
      remarks: benchVerdict || 'Hon\'ble SAC Bench dismissed appeal. Deficiencies remain unrectified. Recommended for zero intake in 2026-27.'
    });
    setData(updated);
    showToast(
      'SAC Appeal Dismissed',
      `Appellate bench confirmed rejection for ${inst.name}. Show-cause order issued.`,
      'rose'
    );
  };

  const handleIssueEoa = async (inst) => {
    const updated = await aicteApi.transitionStage(inst.id, 'eoa_issued', {
      role: 'AICTE Bureau / Regional Officer',
      user: 'Dr. Ramesh Kumar, Regional Officer & Member Secretary',
      remarks: 'Extension of Approval officially granted for Academic Year 2026-2027 with QR code verification.'
    });
    setData(updated);
    setEoaInst(updated.institutions.find(i => i.id === inst.id));
    setEoaModalOpen(true);

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    showToast(
      'Official EoA Certificate Issued!',
      `Extension of Approval (Academic Year 2026-2027) generated for ${inst.name}. QR verification code active.`,
      'emerald'
    );
  };

  const handleCreateApplication = async (formData) => {
    const updated = await aicteApi.createApplication(formData);
    setData(updated);
    showToast(
      'New AICTE Application Submitted',
      `Dossier registered for ${formData.name}. Permanent AICTE ID generated and routed to Scrutiny Desk.`,
      'blue'
    );
  };

  const handleUploadProof = async (utId, proofData) => {
    const updated = await aicteApi.uploadUndertakingProof(utId, proofData);
    setData(updated);
    showToast(
      'Compliance Proof Uploaded',
      'GST tax invoices and geotagged lab photos submitted. Pending Regional Officer verification.',
      'emerald'
    );
  };

  const handleVerifyUndertaking = async (utId, officerName) => {
    const updated = await aicteApi.verifyUndertaking(utId, officerName);
    setData(updated);
    setUndertakingsModalOpen(false);
    showToast(
      'Undertaking Verified & Closed',
      'Hardware GST invoices validated. Institution moved to final Regional Officer EoA sign-off.',
      'emerald'
    );
  };

  const handleRenewDocument = async (instId, docId, renewalData) => {
    const updated = await aicteApi.renewDocument(instId, docId, renewalData);
    setData(updated);
    showToast(
      'Renewal Document Uploaded',
      'Statutory certificate renewed. Critical red flag cleared.',
      'indigo'
    );
  };

  const handleVerifyDocument = async (instId, docId) => {
    const updated = await aicteApi.verifyDocumentRenewal(instId, docId);
    setData(updated);
    showToast(
      'Certificate Verified',
      'Officer verified statutory certificate against government authority database.',
      'emerald'
    );
  };

  const handleResetDb = async () => {
    if (window.confirm('Reset database to initial SIH seed dataset? All live modifications will be reset.')) {
      const reset = await aicteApi.resetDatabase();
      setData(reset);
      showToast('Database Reset', 'System re-seeded with original 6 Indian engineering colleges and APH rules.', 'blue');
    }
  };

  const handleExportData = (format) => {
    if (!data) return;
    const blob = new Blob(
      [format === 'json' ? JSON.stringify(data, null, 2) : generateCsvReport(data.institutions)],
      { type: format === 'json' ? 'application/json' : 'text/csv' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_SIH26262_Compliance_Report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export Completed', `Compliance report downloaded as ${format.toUpperCase()}.`, 'blue');
  };

  const generateCsvReport = (colleges) => {
    const header = 'ID,PermanentID,InstitutionName,Region,Category,Path,CurrentStage,Status,SLA_Days\n';
    const rows = colleges.map(c => 
      `"${c.id}","${c.permanentId}","${c.name}","${c.region}","${c.category}","${c.pathTitle}","${c.currentStage}","${c.status}",${c.slaDaysRemaining}`
    ).join('\n');
    return header + rows;
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center animate-pulse text-amber-400 font-extrabold text-lg">
          AICTE
        </div>
        <p className="font-semibold text-slate-300 text-sm">
          Initializing AICTE Workflow Sentinel (SIH26262)...
        </p>
      </div>
    );
  }

  const unreadAlerts = data.alerts.filter(a => !a.read).length;
  const tier3Alerts = data.alerts.filter(a => a.tier === 3).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sticky GovTech Command Header */}
      <TopCommandHeader
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        currentDate={data.systemState.currentDate}
        simulatedDaysAdded={data.systemState.simulatedDaysAdded}
        onSimulateDays={handleSimulateDays}
        onOpenRules={() => setRulesModalOpen(true)}
        onOpenAlerts={() => setAlertsDrawerOpen(true)}
        onResetDb={handleResetDb}
        onExportData={handleExportData}
        unreadAlertCount={unreadAlerts}
        tier3AlertCount={tier3Alerts}
      />

      {/* Toast Alert Pop-up */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in slide-in-from-bottom duration-250">
          <div className={`p-1.5 rounded-lg shrink-0 ${
            toastMessage.tone === 'emerald' ? 'bg-emerald-600 text-white' : toastMessage.tone === 'rose' ? 'bg-rose-600 text-white' : toastMessage.tone === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-white">{toastMessage.title}</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{toastMessage.message}</p>
          </div>
        </div>
      )}

      {/* Main Body View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* ROLE 1: College Admin */}
        {activeRole === 'college' && (
          <CollegePortalView
            institutions={data.institutions}
            undertakings={data.undertakings}
            aphRules={data.aphRulesConfig}
            currentDate={data.systemState.currentDate}
            onCreateApplication={handleCreateApplication}
            onOpenUndertakingProofModal={(ut) => {
              setActiveUndertaking(ut);
              setUndertakingsModalOpen(true);
            }}
            onOpenDocumentRenewModal={(inst, doc) => {
              setRenewTarget({ inst, doc });
              setRenewDocModalOpen(true);
            }}
            onViewAudit={(inst) => {
              setAuditInst(inst);
              setAuditModalOpen(true);
            }}
            onViewEoa={(inst) => {
              setEoaInst(inst);
              setEoaModalOpen(true);
            }}
          />
        )}

        {/* ROLE 2: Stage 1 Desk Scrutiny Committee Officer */}
        {activeRole === 'scrutiny' && (
          <ScrutinyWorkbench
            institutions={data.institutions}
            aphRules={data.aphRulesConfig}
            currentDate={data.systemState.currentDate}
            onApproveScrutiny={handleApproveScrutiny}
            onRaiseDeficiency={handleRaiseDeficiency}
            onViewAudit={(inst) => {
              setAuditInst(inst);
              setAuditModalOpen(true);
            }}
          />
        )}

        {/* ROLE 3: Stage 2 EVC Ground & Video Inspection */}
        {activeRole === 'evc' && (
          <EvcWorkbench
            institutions={data.institutions}
            onClearEvc={handleClearEvc}
            onOpenUndertakingModal={handleOpenUndertakingModal}
            onRejectEvc={handleRejectEvc}
            onViewAudit={(inst) => {
              setAuditInst(inst);
              setAuditModalOpen(true);
            }}
          />
        )}

        {/* ROLE 4: Stage 3 Standing Appellate Committee (SAC) */}
        {activeRole === 'sac' && (
          <SacAppealView
            institutions={data.institutions}
            onGrantAppeal={handleGrantAppeal}
            onDismissAppeal={handleDismissAppeal}
            onViewAudit={(inst) => {
              setAuditInst(inst);
              setAuditModalOpen(true);
            }}
          />
        )}

        {/* ROLE 5: Regional Directorate / Bureau Command Center */}
        {activeRole === 'regional' && (
          <RegionalCommand
            institutions={data.institutions}
            alerts={data.alerts}
            undertakings={data.undertakings}
            onIssueEoa={handleIssueEoa}
            onViewAudit={(inst) => {
              setAuditInst(inst);
              setAuditModalOpen(true);
            }}
            onOpenVault={() => setActiveRole('vault')}
            onOpenUndertakings={() => setUndertakingsModalOpen(true)}
            onSelectInstitution={(instId) => {}}
          />
        )}

        {/* STATUTORY DOCUMENT EXPIRY VAULT VIEW */}
        {activeRole === 'vault' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveRole('regional')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                &larr; Back to Regional Command
              </button>
            </div>
            <DocumentVaultView
              institutions={data.institutions}
              currentDate={data.systemState.currentDate}
              onOpenRenewModal={(inst, doc) => {
                setRenewTarget({ inst, doc });
                setRenewDocModalOpen(true);
              }}
              onVerifyDocument={handleVerifyDocument}
            />
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <RuleConfigModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        currentRules={data.aphRulesConfig}
        onSaveRules={handleSaveRules}
      />

      <AlertCenterDrawer
        isOpen={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        alerts={data.alerts}
        onSelectCollege={(collegeId) => {
          // Switch to appropriate role to inspect
          setActiveRole('regional');
        }}
      />

      <AuditTrailModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        auditLogs={data.auditLogs}
        institution={auditInst}
      />

      <UndertakingsModal
        isOpen={undertakingsModalOpen}
        onClose={() => setUndertakingsModalOpen(false)}
        undertakings={data.undertakings}
        activeUndertaking={activeUndertaking}
        role={activeRole}
        onUploadProof={handleUploadProof}
        onVerifyUndertaking={handleVerifyUndertaking}
      />

      <DocumentRenewModal
        isOpen={renewDocModalOpen}
        onClose={() => setRenewDocModalOpen(false)}
        institution={renewTarget.inst}
        document={renewTarget.doc}
        onRenewSubmit={handleRenewDocument}
      />

      <EoaCertificateModal
        isOpen={eoaModalOpen}
        onClose={() => setEoaModalOpen(false)}
        institution={eoaInst}
      />

      {/* Government Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">
              All India Council for Technical Education (AICTE) • Smart India Hackathon SIH26262
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Integrated Approval Workflow Automation, Compliance Sentinel and Multi-Stage Quasi-Judicial Governance Architecture
            </p>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Hybrid Full-Stack Engine • SHA-256 Cryptographic Audit Logs • Version 1.0.4
          </div>
        </div>
      </footer>
    </div>
  );
}
