import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');
const SEED_FILE = path.join(__dirname, '../src/data/aicte_seed.json');

// Initialize database from seed if missing or empty
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
      fs.writeFileSync(DB_FILE, seedContent);
      return JSON.parse(seedContent);
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB file, re-seeding:', err);
    const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
    fs.writeFileSync(DB_FILE, seedContent);
    return JSON.parse(seedContent);
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function createSha256(data) {
  return 'SHA256-' + crypto.createHash('sha256').update(data + '-' + Date.now()).digest('hex');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'express-fullstack',
    timestamp: new Date().toISOString()
  });
});

// GET complete state
app.get('/api/state', (req, res) => {
  const db = readDb();
  res.json(db);
});

// PUT update APH rules
app.put('/api/rules', (req, res) => {
  const db = readDb();
  db.aphRulesConfig = { ...db.aphRulesConfig, ...req.body };

  const hash = createSha256(JSON.stringify(req.body));
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    institutionId: 'SYSTEM-WIDE',
    collegeName: 'All AICTE Registered Technical Institutions',
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    role: 'AICTE Bureau / Regional Officer',
    user: 'Member Secretary AICTE (Admin Command)',
    action: 'APH_RULES_MODIFIED',
    remarks: `Updated Handbook Rules via REST API: Classroom/Lab Sqm=${db.aphRulesConfig.minClassroomSqm}, UG Ratio=1:${db.aphRulesConfig.ugFacultyStudentRatio}`,
    hash
  });

  writeDb(db);
  res.json(db);
});

// POST simulate days
app.post('/api/simulate-days', (req, res) => {
  const db = readDb();
  const days = Number(req.body.days || 7);
  db.systemState.simulatedDaysAdded = (db.systemState.simulatedDaysAdded || 0) + days;

  const current = new Date(db.systemState.currentDate || '2026-10-26');
  current.setDate(current.getDate() + days);
  const newDateStr = current.toISOString().split('T')[0];
  db.systemState.currentDate = newDateStr;

  // SLA timers and document expiry
  const newAlerts = [];
  const today = new Date(newDateStr);

  db.institutions.forEach(inst => {
    if (inst.slaDaysRemaining !== undefined) {
      inst.slaDaysRemaining = Math.max(-10, Number((inst.slaDaysRemaining - days).toFixed(1)));
      if (inst.slaDaysRemaining <= 0) {
        inst.statusTone = 'rose';
      }
    }

    // Expiry check
    (inst.documents || []).forEach(doc => {
      if (doc.expiryDate) {
        const exp = new Date(doc.expiryDate);
        const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 0) {
          doc.status = 'expired';
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
        } else if (diff <= (db.aphRulesConfig.advanceExpiryAlertDays || 30)) {
          doc.status = 'approaching_expiry';
        }
      }
    });
  });

  db.alerts = [...newAlerts, ...db.alerts].slice(0, 30);

  const hash = createSha256(`TIME_SIMULATION_+${days}_DAYS-${newDateStr}`);
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    institutionId: 'SYSTEM-WIDE',
    collegeName: 'All AICTE Registered Technical Institutions',
    timestamp: `${newDateStr} 12:00:00 IST`,
    role: 'AICTE System Engine',
    user: 'Automated SLA Sentinel & Time Simulator',
    action: 'SYSTEM_DATE_ADVANCED',
    remarks: `Advanced system calendar by +${days} days via REST API. Scanned statutory documents across all institutions.`,
    hash
  });

  writeDb(db);
  res.json(db);
});

// POST transition stage
app.post('/api/applications/:id/transition', (req, res) => {
  const db = readDb();
  const inst = db.institutions.find(i => i.id === req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });

  const { newStage, payload = {} } = req.body;
  inst.currentStage = newStage;
  inst.stageUpdatedDate = db.systemState.currentDate || new Date().toISOString().split('T')[0];

  let actionLabel = 'STAGE_TRANSITION';
  let remarks = payload.remarks || `Workflow transitioned to ${newStage}`;

  if (newStage === 'evc_queue') {
    inst.status = 'In EVC Inspection Queue';
    inst.statusTone = 'blue';
    inst.slaDaysRemaining = db.aphRulesConfig.evcScheduleSlaDays || 5;
    actionLabel = 'SCRUTINY_STAGE_APPROVED_ROUTED_EVC';
  } else if (newStage === 'ro_approval') {
    inst.status = 'Awaiting Final Regional Officer Digital Sign-off';
    inst.statusTone = 'green';
    inst.slaDaysRemaining = 3;
    actionLabel = 'EVC_INSPECTION_CLEARED_ROUTED_RO';
  } else if (newStage === 'eoa_issued') {
    inst.status = 'Extension of Approval (EoA) Granted';
    inst.statusTone = 'green';
    inst.slaDaysRemaining = 0;
    inst.eoaIssued = true;
    actionLabel = 'EOA_OFFICIALLY_ISSUED';
    inst.eoaDetails = {
      eoaNumber: `AICTE/EOA/${inst.region}/${inst.permanentId}/2026-27`,
      issueDate: inst.stageUpdatedDate,
      validUntil: '2027-06-30',
      authorizedSignatory: 'Dr. Ramesh Kumar, Regional Officer & Member Secretary',
      qrData: `https://facilities.aicte-india.org/eoa-verify?id=${inst.permanentId}&session=2026-2027`,
      approvedIntake: inst.totalStudents || 420
    };
  }

  const hash = createSha256(`${actionLabel}-${inst.permanentId}`);
  db.auditLogs.unshift({
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

  writeDb(db);
  res.json(db);
});

// POST reset
app.post('/api/reset', (req, res) => {
  const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
  fs.writeFileSync(DB_FILE, seedContent);
  res.json(JSON.parse(seedContent));
});

// Serve static frontend files in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[AICTE Server] REST API running on http://localhost:${PORT}`);
});
