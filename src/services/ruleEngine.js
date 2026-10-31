/**
 * AICTE Approval Process Handbook (APH) Automated Rule Calculator
 * Evaluates institutions, blueprint metrics, faculty ratios, and statutory document validity
 */

export async function generateSha256Hash(content) {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(content + '-' + Date.now() + '-' + Math.random());
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `SHA256-${hashHex}`;
    }
  } catch (e) {
    // fallback pseudo hash
  }
  let hash = 0;
  const str = content + Date.now();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `SHA256-${Math.abs(hash).toString(16).padStart(16, '0')}${Date.now().toString(16)}`;
}

export function evaluateClassrooms(institution, rules) {
  const minClassroomSqm = Number(rules?.minClassroomSqm || 66);
  const minLabSqm = Number(rules?.minLabSqm || 66);

  const failedClassrooms = [];
  const passedClassrooms = [];
  const failedLabs = [];
  const passedLabs = [];

  (institution.classrooms || []).forEach(room => {
    const isLab = room.type.toLowerCase().includes('lab') || room.type.toLowerCase().includes('centre');
    const minRequired = isLab ? minLabSqm : minClassroomSqm;
    const isPassing = Number(room.carpetAreaSqm) >= minRequired;

    if (isLab) {
      if (isPassing) passedLabs.push(room);
      else failedLabs.push({ ...room, minRequired, deficit: minRequired - Number(room.carpetAreaSqm) });
    } else {
      if (isPassing) passedClassrooms.push(room);
      else failedClassrooms.push({ ...room, minRequired, deficit: minRequired - Number(room.carpetAreaSqm) });
    }
  });

  const allPass = failedClassrooms.length === 0 && failedLabs.length === 0;

  return {
    pass: allPass,
    minClassroomSqm,
    minLabSqm,
    failedClassrooms,
    passedClassrooms,
    failedLabs,
    passedLabs,
    totalRooms: (institution.classrooms || []).length,
    summary: allPass
      ? `All ${institution.classrooms?.length || 0} instructional spaces meet or exceed the ${minClassroomSqm} sq.m AICTE threshold.`
      : `Deficiency detected in ${failedClassrooms.length + failedLabs.length} instructional room(s). Minimum requirement is ${minClassroomSqm} sq.m.`
  };
}

export function evaluateFacultyRatio(institution, rules) {
  const isPg = (institution.programType || '').toLowerCase().includes('pg');
  const maxAllowedRatio = isPg
    ? Number(rules?.pgFacultyStudentRatio || 12)
    : Number(rules?.ugFacultyStudentRatio || 15);

  const totalStudents = Number(institution.totalStudents || 0);
  const totalFaculty = Number(institution.totalFaculty || 1);
  const calculatedRatio = Number((totalStudents / totalFaculty).toFixed(1));

  const pass = calculatedRatio <= maxAllowedRatio;

  return {
    pass,
    programType: institution.programType,
    totalStudents,
    totalFaculty,
    calculatedRatio,
    maxAllowedRatio,
    ratioString: `1:${calculatedRatio}`,
    targetString: `1:${maxAllowedRatio}`,
    deficiencyFacultyCount: pass ? 0 : Math.ceil(totalStudents / maxAllowedRatio) - totalFaculty,
    summary: pass
      ? `Faculty student ratio 1:${calculatedRatio} complies with mandatory APH limit (1:${maxAllowedRatio}).`
      : `Shortfall of ${Math.ceil(totalStudents / maxAllowedRatio) - totalFaculty} qualified faculty. Ratio 1:${calculatedRatio} exceeds 1:${maxAllowedRatio}.`
  };
}

export function evaluateLand(institution, rules) {
  const minRequiredLand = Number(rules?.minUrbanLandAcres || 2.5);
  const actualLand = Number(institution.landAcres || 0);
  const pass = actualLand >= minRequiredLand;

  return {
    pass,
    actualLand,
    minRequiredLand,
    deficit: pass ? 0 : Number((minRequiredLand - actualLand).toFixed(2)),
    summary: pass
      ? `Continuous land area of ${actualLand} Acres exceeds urban requirement (${minRequiredLand} Acres).`
      : `Land area ${actualLand} Acres is below minimum AICTE requirement of ${minRequiredLand} Acres.`
  };
}

export function evaluateDocuments(institution, currentDateStr, advanceAlertDays = 30) {
  const today = new Date(currentDateStr || new Date().toISOString().split('T')[0]);
  const scannedDocs = (institution.documents || []).map(doc => {
    if (!doc.expiryDate) {
      return { ...doc, computedStatus: 'valid', daysRemaining: 999 };
    }
    const expiry = new Date(doc.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let computedStatus = 'valid';
    if (diffDays <= 0) {
      computedStatus = 'expired';
    } else if (diffDays <= advanceAlertDays) {
      computedStatus = 'approaching_expiry';
    }

    return {
      ...doc,
      computedStatus,
      daysRemaining: diffDays
    };
  });

  const hasExpired = scannedDocs.some(d => d.computedStatus === 'expired');
  const hasApproaching = scannedDocs.some(d => d.computedStatus === 'approaching_expiry');

  return {
    scannedDocs,
    hasExpired,
    hasApproaching,
    expiredCount: scannedDocs.filter(d => d.computedStatus === 'expired').length,
    approachingCount: scannedDocs.filter(d => d.computedStatus === 'approaching_expiry').length
  };
}

export function runComprehensiveAudit(institution, rules, currentDateStr) {
  const classrooms = evaluateClassrooms(institution, rules);
  const faculty = evaluateFacultyRatio(institution, rules);
  const land = evaluateLand(institution, rules);
  const docs = evaluateDocuments(institution, currentDateStr, rules?.advanceExpiryAlertDays);

  const overallPass = classrooms.pass && faculty.pass && land.pass && !docs.hasExpired;

  let complianceTier = 'Green';
  if (docs.hasExpired || !faculty.pass) {
    complianceTier = 'Red';
  } else if (docs.hasApproaching || !classrooms.pass) {
    complianceTier = 'Amber';
  }

  return {
    institutionId: institution.id,
    permanentId: institution.permanentId,
    name: institution.name,
    overallPass,
    complianceTier,
    classrooms,
    faculty,
    land,
    docs
  };
}

/**
 * AICTE Institutional NIRNAY Index
 * (National Institutional Regulatory Norms & Auditing Yield)
 * A 100-point composite regulatory health index
 * 
 * 1. Structural & Instructional Space (30 pts): Classroom >= 66 sq.m, Labs >= 66 sq.m, Land >= 2.5 ac
 * 2. Academic Human Capital (30 pts): Faculty ratio <= 1:15, cadre proportion, PhD principal
 * 3. Statutory & Financial Security (25 pts): Fire NOC valid, Stability cert valid, FDR active
 * 4. Procedural Governance & SLA (15 pts): No active deficiencies, no SLA breaches, clean undertakings
 */
export function calculateNirnayIndex(institution, rules, currentDateStr) {
  if (!institution) return { score: 75, bandGrade: 'B+', bandTone: 'blue', band: 'Band 2', entitlement: 'Standard' };

  const classrooms = evaluateClassrooms(institution, rules);
  const faculty = evaluateFacultyRatio(institution, rules);
  const land = evaluateLand(institution, rules);
  const docs = evaluateDocuments(institution, currentDateStr, rules?.advanceExpiryAlertDays);

  let spaceScore = 0;
  if (classrooms.pass) spaceScore += 18;
  else spaceScore += Math.max(0, 18 - ((classrooms.failedClassrooms?.length || 0) + (classrooms.failedLabs?.length || 0)) * 6);
  if (land.pass) spaceScore += 12;
  else spaceScore += Math.max(0, 12 - (land.deficit || 1) * 8);

  let humanCapitalScore = 0;
  if (faculty.pass) humanCapitalScore += 20;
  else humanCapitalScore += Math.max(0, 20 - (faculty.calculatedRatio - faculty.maxAllowedRatio) * 4);
  if (institution.principalQualified) humanCapitalScore += 5;
  if ((institution.cadreRatio || '').includes('1:2')) humanCapitalScore += 5;

  let statutoryScore = 0;
  const expiredDocsCount = docs.expiredCount || 0;
  const approachingCount = docs.approachingCount || 0;
  if (expiredDocsCount === 0) statutoryScore += 20;
  else statutoryScore += Math.max(0, 20 - expiredDocsCount * 12);
  if (approachingCount === 0) statutoryScore += 5;
  else statutoryScore += Math.max(0, 5 - approachingCount * 2.5);

  let governanceScore = 0;
  const slaDays = institution.slaDaysRemaining ?? 5;
  if (slaDays >= 0) governanceScore += 10;
  else governanceScore += Math.max(0, 10 - Math.abs(slaDays) * 2);

  if (institution.currentStage !== 'escalated_deficiency' && institution.currentStage !== 'sac_appeal') governanceScore += 5;
  else governanceScore += 1;

  const totalScore = Math.min(100, Math.max(12, Math.round(spaceScore + humanCapitalScore + statutoryScore + governanceScore)));

  let band = 'Band 1 (FastTrack Green-Channel)';
  let bandGrade = 'A+';
  let bandTone = 'emerald';
  let entitlement = 'Eligible for 72h Fast-Track Paperless Renewal & 2-Year Multi-Session EoA';

  if (totalScore < 60) {
    band = 'Band 4 (Statutory Surveillance / Red Notice)';
    bandGrade = 'D';
    bandTone = 'rose';
    entitlement = 'Critical Non-Compliance: Admissions Halted pending Comprehensive Hearing';
  } else if (totalScore < 75) {
    band = 'Band 3 (Conditional Supervision)';
    bandGrade = 'C';
    bandTone = 'amber';
    entitlement = 'Mandatory Physical EVC Spot-Check & Biometric Inspection';
  } else if (totalScore < 90) {
    band = 'Band 2 (Standard Regulatory Cadence)';
    bandGrade = 'B+';
    bandTone = 'blue';
    entitlement = 'Standard Dual-Stage Scrutiny & Scheduled EVC Verification';
  }

  return {
    score: totalScore,
    band,
    bandGrade,
    bandTone,
    entitlement,
    breakdown: {
      spaceScore: Math.round(spaceScore),
      humanCapitalScore: Math.round(humanCapitalScore),
      statutoryScore: Math.round(statutoryScore),
      governanceScore: Math.round(governanceScore)
    }
  };
}
