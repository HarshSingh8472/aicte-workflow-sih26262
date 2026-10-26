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
