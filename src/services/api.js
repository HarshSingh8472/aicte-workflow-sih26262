import seedData from '../data/aicte_seed.json';
import { generateSha256Hash, evaluateDocuments } from './ruleEngine';

const STORAGE_KEY = 'aicte_sih26262_db_v1';
const API_BASE = '/api';

// Helper to initialize local storage from seed if missing or corrupted
function getLocalStorageData() {
  if (typeof window === 'undefined') return seedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return JSON.parse(JSON.stringify(seedData));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading from localStorage, using seed:', e);
    return JSON.parse(JSON.stringify(seedData));
  }
}

function saveLocalStorageData(data) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }
}

// Check if Express backend is available with a quick timeout
let backendAvailable = null;
async function isBackendReachable() {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    backendAvailable = res.ok;
    return backendAvailable;
  } catch (err) {
    backendAvailable = false;
    return false;
  }
}

export const aicteApi = {
  /**
   * Fetch complete system state (Rules, Institutions, Undertakings, Alerts, Audit Logs)
   */
  async getState() {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        const res = await fetch(`${API_BASE}/state`);
        if (res.ok) {
          const json = await res.json();
          // Keep localStorage in sync for instant offline resilience
          saveLocalStorageData(json);
          return json;
        }
      }
    } catch (e) {
      // Backend unavailable, fallback to localStorage
    }
    return getLocalStorageData();
  },

  /**
   * Update APH Rules Configuration (Real-time recalculation)
   */
  async updateRules(newRules) {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        const res = await fetch(`${API_BASE}/rules`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRules)
        });
        if (res.ok) return await res.json();
      }
    } catch (e) {}

    // Fallback Local Storage
    const data = getLocalStorageData();
    data.aphRulesConfig = { ...data.aphRulesConfig, ...newRules };

    // Append Audit Log
    const hash = await generateSha256Hash(`APH_RULES_UPDATED-${JSON.stringify(newRules)}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: 'SYSTEM-WIDE',
      collegeName: 'All AICTE Registered Technical Institutions',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: 'AICTE Bureau / Regional Officer',
      user: 'Member Secretary AICTE (Admin Command)',
      action: 'APH_RULES_MODIFIED',
      remarks: `Updated Handbook Rules: Classroom/Lab Sqm=${data.aphRulesConfig.minClassroomSqm}, UG Ratio=1:${data.aphRulesConfig.ugFacultyStudentRatio}`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Simulate advancing system time by +N days (Advances SLA timers & Expiry Scans)
   */
  async simulateDays(days = 7) {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        const res = await fetch(`${API_BASE}/simulate-days`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days })
        });
        if (res.ok) return await res.json();
      }
    } catch (e) {}

    // Fallback Local Storage Simulation
    const data = getLocalStorageData();
    data.systemState.simulatedDaysAdded = (data.systemState.simulatedDaysAdded || 0) + days;

    const current = new Date(data.systemState.currentDate || '2026-10-26');
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    data.systemState.currentDate = newDateStr;

    // 1. Recalculate SLA timers for active queues
    data.institutions.forEach(inst => {
      if (inst.slaDaysRemaining !== undefined) {
        inst.slaDaysRemaining = Math.max(-10, Number((inst.slaDaysRemaining - days).toFixed(1)));
        if (inst.slaDaysRemaining <= 0) {
          inst.statusTone = 'rose';
          if (inst.currentStage === 'scrutiny_queue' || inst.currentStage === 'evc_queue') {
            inst.status = `${inst.status} (SLA Overdue)`;
          }
        } else if (inst.slaDaysRemaining <= 2) {
          inst.statusTone = 'amber';
        }
      }

      // 2. Scan documents for expiry
      const docEval = evaluateDocuments(inst, newDateStr, data.aphRulesConfig.advanceExpiryAlertDays);
      inst.documents = docEval.scannedDocs.map(d => ({
        ...d,
        status: d.computedStatus
      }));

      // Auto-escalate if documents expired
      if (docEval.hasExpired && inst.currentStage !== 'escalated_deficiency') {
        inst.status = 'Non-Compliant / Escalated (Red)';
        inst.statusTone = 'rose';
      }
    });

    // 3. Recalculate undertakings countdown
    data.undertakings.forEach(ut => {
      if (ut.status === 'Pending Proof' || ut.status === 'Evidence Uploaded') {
        ut.daysLeft = Math.max(-10, ut.daysLeft - days);
        if (ut.daysLeft < 0) {
          ut.status = 'Overdue - Auto-Escalated';
        }
      }
    });

    // 4. Generate Live Alerts based on new simulated date
    const newAlerts = [];
    data.institutions.forEach(inst => {
      (inst.documents || []).forEach(doc => {
        if (doc.status === 'expired') {
          newAlerts.push({
            id: `ALT-SIM-${Date.now()}-${Math.floor(Math.random() * 999)}`,
            tier: 3,
            tierTitle: 'Tier 3: Senior Officer Auto-Escalation',
            severity: 'critical',
            collegeId: inst.id,
            collegeName: inst.name,
            message: `CRITICAL: ${doc.title} (${doc.docNumber}) has expired as of ${newDateStr}. Auto-escalated to RO.`,
            timestamp: `${newDateStr} 09:00 IST`,
            actionRequired: 'Issue Statutory Show-Cause & Restrict Portal Admissions',
            escalatedTo: 'Regional Officer & Vigilance Bureau',
            read: false
          });
        } else if (doc.status === 'approaching_expiry' && doc.daysRemaining <= 15) {
          newAlerts.push({
            id: `ALT-SIM-${Date.now()}-${Math.floor(Math.random() * 999)}`,
            tier: 2,
            tierTitle: 'Tier 2: Overdue SLA Warning',
            severity: 'warning',
            collegeId: inst.id,
            collegeName: inst.name,
            message: `URGENT WARNING: ${doc.title} expires in ${doc.daysRemaining} days. Renewal required immediately.`,
            timestamp: `${newDateStr} 10:30 IST`,
            actionRequired: 'Upload Revalidated Certificate',
            escalatedTo: 'College Principal & RO Scrutiny Officer',
            read: false
          });
        }
      });

      if (inst.slaDaysRemaining < 0 && (inst.currentStage === 'scrutiny_queue' || inst.currentStage === 'evc_queue')) {
        newAlerts.push({
          id: `ALT-SLA-${Date.now()}-${Math.floor(Math.random() * 999)}`,
          tier: 2,
          tierTitle: 'Tier 2: Overdue SLA Warning',
          severity: 'warning',
          collegeId: inst.id,
          collegeName: inst.name,
          message: `Official SLA breached by ${Math.abs(inst.slaDaysRemaining)} days in ${inst.currentStage}.`,
          timestamp: `${newDateStr} 11:15 IST`,
          actionRequired: 'Desk Officer must clear pending review immediately',
          escalatedTo: 'Committee Convener',
          read: false
        });
      }
    });

    data.alerts = [...newAlerts, ...data.alerts].slice(0, 30);

    // Append Audit Trail
    const hash = await generateSha256Hash(`TIME_SIMULATION_+${days}_DAYS-${newDateStr}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: 'SYSTEM-WIDE',
      collegeName: 'All AICTE Registered Technical Institutions',
      timestamp: `${newDateStr} 12:00:00 IST`,
      role: 'AICTE System Engine',
      user: 'Automated SLA Sentinel & Time Simulator',
      action: 'SYSTEM_DATE_ADVANCED',
      remarks: `Advanced system calendar by +${days} days. Scanned 4 statutory certificate types across all institutions. Triggered ${newAlerts.length} new automated compliance alerts.`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Transition an institution's workflow stage
   */
  async transitionStage(institutionId, newStage, payload = {}) {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        const res = await fetch(`${API_BASE}/applications/${institutionId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newStage, payload })
        });
        if (res.ok) return await res.json();
      }
    } catch (e) {}

    // Fallback Local Storage
    const data = getLocalStorageData();
    const inst = data.institutions.find(i => i.id === institutionId);
    if (!inst) throw new Error('Institution not found');

    const previousStage = inst.currentStage;
    inst.currentStage = newStage;
    inst.stageUpdatedDate = data.systemState.currentDate || new Date().toISOString().split('T')[0];

    let actionLabel = 'STAGE_TRANSITION';
    let remarks = payload.remarks || `Workflow transitioned from ${previousStage} to ${newStage}`;

    if (newStage === 'evc_queue') {
      inst.status = 'In EVC Inspection Queue';
      inst.statusTone = 'blue';
      inst.slaDaysRemaining = data.aphRulesConfig.evcScheduleSlaDays || 5;
      actionLabel = 'SCRUTINY_STAGE_APPROVED_ROUTED_EVC';
      remarks = payload.remarks || 'Stage 1 Desk Scrutiny Passed. 5-day EVC scheduling SLA timer initiated.';
      inst.scrutinyEvaluation = {
        verified: true,
        officer: payload.officer || 'Scrutiny Committee Desk',
        date: inst.stageUpdatedDate,
        decision: 'Stage 1 Cleared -> Routed to Stage 2 EVC',
        notes: payload.notes || 'All stamped certificates and blueprint metrics verified.'
      };
      if (!inst.evcInspection) {
        inst.evcInspection = {
          scheduledDate: '2026-11-02',
          inspector: payload.inspector || 'National EVC Panel Assigned',
          status: 'Scheduled',
          videoUploaded: true,
          videoUrl: 'https://aicte-india.org/streams/evc-sample.mp4',
          checkpoints: [
            { time: '02:15', label: 'Geo-Tagged Main Gate & GPS Boundary', status: 'verified' },
            { time: '09:30', label: 'Classrooms 101-108 Physical Laser Measurement', status: 'pending' },
            { time: '17:45', label: 'Computer Lab Stock Register & Original Tax Bills', status: 'pending' },
            { time: '25:10', label: 'Central Library Stamping & Bandwidth Meter', status: 'pending' }
          ],
          claimedPcs: 180,
          actualPcs: 180,
          claimedFloors: 3,
          actualFloors: 3,
          claimedFacultyPresent: 45,
          actualFacultyPresent: 45
        };
      }
    } else if (newStage === 'ro_approval') {
      inst.status = 'Awaiting Final Regional Officer Digital Sign-off';
      inst.statusTone = 'green';
      inst.slaDaysRemaining = 3;
      actionLabel = 'EVC_INSPECTION_CLEARED_ROUTED_RO';
      remarks = payload.remarks || 'Ground inspection and continuous video walkthrough cleared with zero deficiencies. Forwarded for EoA issuance.';
      if (inst.evcInspection) {
        inst.evcInspection.status = 'Cleared';
      }
    } else if (newStage === 'conditional_undertaking') {
      inst.status = 'Conditional Approval (Undertaking Active)';
      inst.statusTone = 'amber';
      inst.slaDaysRemaining = payload.undertakingDays || 14;
      actionLabel = 'EVC_CONDITIONAL_APPROVAL_GRANTED';
      remarks = payload.remarks || `Granted conditional approval with ${payload.undertakingDays || 14}-day undertaking.`;
      
      const newUt = {
        id: `UT-${Date.now().toString().slice(-4)}`,
        institutionId: inst.id,
        collegeName: inst.name,
        permanentId: inst.permanentId,
        category: payload.deficiencyCategory || 'Equipment / Faculty Shortfall',
        ruleDeficiency: payload.undertakingReason || 'Minor physical shortage recorded during EVC visit.',
        undertakingText: payload.undertakingText || 'Institution promises to rectify shortfall and upload tax invoices with geo-tagged images within deadline.',
        issuedDate: inst.stageUpdatedDate,
        deadlineDate: new Date(Date.now() + (payload.undertakingDays || 14) * 86400000).toISOString().split('T')[0],
        daysLeft: payload.undertakingDays || 14,
        status: 'Pending Proof',
        proofUploaded: false,
        proofDetails: null,
        verifiedByOfficer: null
      };
      data.undertakings.unshift(newUt);
    } else if (newStage === 'sac_appeal') {
      inst.status = 'Deficiency Flagged - Under SAC Appeal';
      inst.statusTone = 'rose';
      inst.slaDaysRemaining = 7;
      actionLabel = 'APPLICATION_ROUTED_TO_SAC_APPEAL';
      remarks = payload.remarks || 'Deficiency observation flagged by inspection committee. College filed appeal under Chapter II APH.';
      inst.appealDetails = {
        filedDate: inst.stageUpdatedDate,
        appellant: payload.appellant || `${inst.name} Trust`,
        grounds: payload.grounds || 'Correction submitted with rectified evidence.',
        hearingScheduledDate: '2026-11-04',
        appellateBench: "Hon'ble Appellate Hearing Committee (SAC/SHC)",
        status: 'Hearing Scheduled'
      };
    } else if (newStage === 'eoa_issued') {
      inst.status = 'Extension of Approval (EoA) Granted';
      inst.statusTone = 'green';
      inst.slaDaysRemaining = 0;
      inst.eoaIssued = true;
      actionLabel = 'EOA_OFFICIALLY_ISSUED';
      remarks = `AICTE Digital Extension of Approval Certificate officially granted for Academic Year 2026-2027 with QR code verification.`;
      inst.eoaDetails = {
        eoaNumber: `AICTE/EOA/${inst.region}/${inst.permanentId}/2026-27`,
        issueDate: inst.stageUpdatedDate,
        validUntil: '2027-06-30',
        authorizedSignatory: 'Dr. Ramesh Kumar, Regional Officer & Member Secretary',
        qrData: `https://facilities.aicte-india.org/eoa-verify?id=${inst.permanentId}&session=2026-2027`,
        approvedIntake: inst.totalStudents || 420
      };
    }

    const hash = await generateSha256Hash(`${actionLabel}-${inst.permanentId}-${Date.now()}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: inst.id,
      collegeName: inst.name,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: payload.role || 'AICTE Officer',
      user: payload.user || 'Authorized Officer',
      action: actionLabel,
      remarks,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Submit a New AICTE Application (College Portal Wizard)
   */
  async createApplication(formData) {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        const res = await fetch(`${API_BASE}/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) return await res.json();
      }
    } catch (e) {}

    // Fallback Local Storage
    const data = getLocalStorageData();
    const newId = `INST-${(data.institutions.length + 1).toString().padStart(3, '0')}`;
    const permId = `1-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const today = data.systemState.currentDate || new Date().toISOString().split('T')[0];

    // Determine workflow path based on category
    let assignedPath = 'path-2';
    let pathTitle = 'Scrutiny + EVC';
    let currentStage = 'scrutiny_queue';

    if (formData.category?.includes('Extension of Approval') || formData.category?.includes('Annual Compliance')) {
      assignedPath = 'path-1';
      pathTitle = 'Only Scrutiny';
      currentStage = 'scrutiny_queue';
    } else if (formData.category?.includes('Change of Site') || formData.category?.includes('Closure')) {
      assignedPath = 'path-3';
      pathTitle = 'Only EVC';
      currentStage = 'evc_queue';
    }

    const newInst = {
      id: newId,
      permanentId: permId,
      name: formData.name,
      region: formData.region || 'WRO',
      city: formData.city || 'Mumbai',
      state: formData.state || 'Maharashtra',
      category: formData.category,
      assignedPath,
      pathTitle,
      currentStage,
      status: 'Submitted - In Verification Queue',
      statusTone: 'blue',
      slaDaysRemaining: 7,
      submittedDate: today,
      stageUpdatedDate: today,
      landAcres: Number(formData.landAcres || 2.8),
      landType: 'Urban',
      totalStudents: Number(formData.totalStudents || 600),
      totalFaculty: Number(formData.totalFaculty || 42),
      programType: formData.programType || 'UG Engineering & Tech',
      facultyRatio: Number(((Number(formData.totalStudents || 600)) / (Number(formData.totalFaculty || 42))).toFixed(1)),
      cadreRatio: '1:2:6',
      principalQualified: true,
      classrooms: formData.classrooms || [
        { roomNo: 'CR-101', carpetAreaSqm: 68, type: 'Classroom', floor: 'Ground' },
        { roomNo: 'CR-102', carpetAreaSqm: 68, type: 'Classroom', floor: 'Ground' },
        { roomNo: 'LAB-101', carpetAreaSqm: 72, type: 'Computer Lab', floor: '1st Floor' }
      ],
      documents: [
        {
          id: `DOC-${newId}-LAND`,
          title: 'Registered Land Deed & Revenue Clearance',
          docNumber: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: '2023-01-01',
          expiryDate: '2053-01-01',
          type: 'Land Lease',
          status: 'valid',
          verified: false,
          verifiedBy: null,
          remarks: 'Self-declaration uploaded'
        },
        {
          id: `DOC-${newId}-FIRE`,
          title: 'Fire Safety NOC Certificate',
          docNumber: `FIRE-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: today,
          expiryDate: '2027-10-25',
          type: 'Fire NOC',
          status: 'valid',
          verified: false,
          verifiedBy: null,
          remarks: 'Valid provisional NOC'
        },
        {
          id: `DOC-${newId}-STAB`,
          title: 'Building Structural Stability Certificate',
          docNumber: `STAB-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: today,
          expiryDate: '2031-10-25',
          type: 'Stability',
          status: 'valid',
          verified: false,
          verifiedBy: null,
          remarks: 'Registered civil engineer sign-off'
        },
        {
          id: `DOC-${newId}-FDR`,
          title: 'Joint AICTE Security Fixed Deposit',
          docNumber: `FDR-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: today,
          expiryDate: '2034-10-25',
          amountInr: '1,50,00,000',
          bankName: 'Nationalised Bank',
          type: 'Bank FDR',
          status: 'valid',
          verified: false,
          verifiedBy: null,
          remarks: 'Lien marked to Member Secretary'
        }
      ],
      scrutinyEvaluation: null,
      eoaIssued: false,
      eoaDetails: null
    };

    data.institutions.unshift(newInst);

    const hash = await generateSha256Hash(`NEW_APP_SUBMITTED-${permId}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: newId,
      collegeName: formData.name,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: 'Institution / College Admin',
      user: 'College Principal / Registrar',
      action: 'NEW_APPLICATION_SUBMITTED',
      remarks: `Submitted new AICTE approval application under category "${formData.category}". Assigned path: ${pathTitle}.`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Upload Undertaking Compliance Proof
   */
  async uploadUndertakingProof(undertakingId, proofData) {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        const res = await fetch(`${API_BASE}/undertakings/${undertakingId}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proofData)
        });
        if (res.ok) return await res.json();
      }
    } catch (e) {}

    const data = getLocalStorageData();
    const ut = data.undertakings.find(u => u.id === undertakingId);
    if (!ut) throw new Error('Undertaking not found');

    ut.status = 'Evidence Uploaded';
    ut.proofUploaded = true;
    ut.proofDetails = {
      invoiceNumber: proofData.invoiceNumber || 'GST-INV-2026-99182',
      vendorName: proofData.vendorName || 'Dell Technologies India Pvt Ltd',
      amountInr: proofData.amountInr || '₹18,45,000',
      geoPhotoCount: proofData.photoCount || 6,
      submittedDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      comments: proofData.comments || '30 Desktop PCs received and installed in Lab 2 with physical asset tagging.'
    };

    const hash = await generateSha256Hash(`UNDERTAKING_PROOF_UPLOADED-${undertakingId}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: ut.institutionId,
      collegeName: ut.collegeName,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: 'Institution / College Admin',
      user: 'College Registrar',
      action: 'UNDERTAKING_PROOF_UPLOADED',
      remarks: `Uploaded GST Tax Invoices and Geo-Tagged photo proofs for ${ut.category}.`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Verify Undertaking Evidence and Mark Compliant
   */
  async verifyUndertaking(undertakingId, officerName = 'Regional Officer') {
    const data = getLocalStorageData();
    const ut = data.undertakings.find(u => u.id === undertakingId);
    if (!ut) throw new Error('Undertaking not found');

    ut.status = 'Verified & Closed';
    ut.verifiedByOfficer = officerName;

    const inst = data.institutions.find(i => i.id === ut.institutionId);
    if (inst) {
      inst.currentStage = 'ro_approval';
      inst.status = 'Awaiting Final Regional Officer Digital Sign-off';
      inst.statusTone = 'green';
      inst.slaDaysRemaining = 3;
    }

    const hash = await generateSha256Hash(`UNDERTAKING_VERIFIED-${undertakingId}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: ut.institutionId,
      collegeName: ut.collegeName,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: 'AICTE Bureau / Regional Officer',
      user: officerName,
      action: 'UNDERTAKING_VERIFIED_CLOSED',
      remarks: `Verified original GST tax invoices and serial numbers. Conditional undertaking marked compliant. Moved to final EoA issuance.`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Renew or Revalidate an expired or expiring statutory document
   */
  async renewDocument(institutionId, docId, renewalData) {
    const data = getLocalStorageData();
    const inst = data.institutions.find(i => i.id === institutionId);
    if (!inst) throw new Error('Institution not found');

    const doc = inst.documents.find(d => d.id === docId);
    if (!doc) throw new Error('Document not found');

    doc.issueDate = renewalData.issueDate || data.systemState.currentDate || '2026-10-26';
    doc.expiryDate = renewalData.expiryDate || '2027-10-25';
    doc.docNumber = renewalData.docNumber || `${doc.docNumber}-REN-2026`;
    doc.status = 'valid';
    doc.verified = false;
    doc.remarks = `Renewal uploaded: ${renewalData.remarks || 'Awaiting officer re-verification'}`;

    // Clear escalated red status if no other docs expired
    const docEval = evaluateDocuments(inst, data.systemState.currentDate, data.aphRulesConfig.advanceExpiryAlertDays);
    if (!docEval.hasExpired && inst.currentStage === 'escalated_deficiency') {
      inst.currentStage = 'scrutiny_queue';
      inst.status = 'Under Scrutiny Re-evaluation';
      inst.statusTone = 'blue';
      inst.slaDaysRemaining = 5;
    }

    const hash = await generateSha256Hash(`DOC_RENEWED-${docId}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: inst.id,
      collegeName: inst.name,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: 'Institution / College Admin',
      user: 'College Registrar',
      action: 'STATUTORY_DOCUMENT_RENEWED',
      remarks: `Submitted renewal certificate for ${doc.title} (#${doc.docNumber}). New Expiry: ${doc.expiryDate}.`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Officer verifies renewed document
   */
  async verifyDocumentRenewal(institutionId, docId, officerName = 'Dr. R. K. Shinde (WRO)') {
    const data = getLocalStorageData();
    const inst = data.institutions.find(i => i.id === institutionId);
    if (!inst) return data;
    const doc = inst.documents.find(d => d.id === docId);
    if (!doc) return data;

    doc.verified = true;
    doc.verifiedBy = officerName;
    doc.status = 'valid';

    const hash = await generateSha256Hash(`DOC_VERIFIED-${docId}`);
    data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      institutionId: inst.id,
      collegeName: inst.name,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      role: 'Scrutiny Committee Officer',
      user: officerName,
      action: 'DOCUMENT_RENEWAL_VERIFIED',
      remarks: `Statutory certificate ${doc.title} (#${doc.docNumber}) verified against government issuer database. Marked compliant.`,
      hash
    });

    saveLocalStorageData(data);
    return data;
  },

  /**
   * Reset database back to seed state
   */
  async resetDatabase() {
    try {
      const isLive = await isBackendReachable();
      if (isLive) {
        await fetch(`${API_BASE}/reset`, { method: 'POST' });
      }
    } catch (e) {}

    const fresh = JSON.parse(JSON.stringify(seedData));
    saveLocalStorageData(fresh);
    return fresh;
  }
};
