import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Circle, 
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';

export function getWorkflowSteps(pathId, currentStage) {
  // Define standard steps for each AICTE path
  switch (pathId) {
    case 'path-1':
      return [
        { id: 'submitted', label: '1. Submitted', desc: 'Online Form & Fees' },
        { id: 'scrutiny_queue', label: '2. Desk Scrutiny', desc: 'Stamped Certificates & APH' },
        { id: 'ro_approval', label: '3. Regional Officer', desc: 'Bureau Digital Review' },
        { id: 'eoa_issued', label: '4. EoA Issued', desc: 'Official AICTE Grant' }
      ];
    case 'path-2':
      return [
        { id: 'submitted', label: '1. Submitted', desc: 'Online Portal' },
        { id: 'scrutiny_queue', label: '2. Desk Scrutiny', desc: 'Blueprint Verification' },
        { id: 'evc_queue', label: '3. EVC Inspection', desc: 'Ground & 30-min Video' },
        { id: 'ro_approval', label: '4. Regional Officer', desc: 'Final Verification' },
        { id: 'eoa_issued', label: '5. EoA Issued', desc: 'Digital Certificate' }
      ];
    case 'path-3':
      return [
        { id: 'submitted', label: '1. Submitted', desc: 'Site Change / Verify' },
        { id: 'evc_queue', label: '2. Direct EVC Queue', desc: 'Physical Site Visit' },
        { id: 'conditional_undertaking', label: '3. Undertaking Monitor', desc: 'Time-Bound Evidence' },
        { id: 'ro_approval', label: '4. Regional Officer', desc: 'Verification & Sign-off' },
        { id: 'eoa_issued', label: '5. EoA Issued', desc: 'Digital Certificate' }
      ];
    case 'path-4':
      return [
        { id: 'submitted', label: '1. Submitted', desc: 'New Setup Dossier' },
        { id: 'evc_queue', label: '2. Inspection', desc: 'Deficiency Noted' },
        { id: 'sac_appeal', label: '3. SAC/SHC Appeal', desc: 'Quasi-Judicial Bench' },
        { id: 'ro_approval', label: '4. Final Verdict', desc: 'Bench Order Execution' },
        { id: 'eoa_issued', label: '5. EoA Issued', desc: 'Digital Certificate' }
      ];
    default:
      return [
        { id: 'submitted', label: '1. Submitted', desc: 'Application' },
        { id: 'scrutiny_queue', label: '2. Scrutiny', desc: 'Verification' },
        { id: 'ro_approval', label: '3. RO Approval', desc: 'Final Sign-off' },
        { id: 'eoa_issued', label: '4. EoA Issued', desc: 'Certificate' }
      ];
  }
}

export default function WorkflowPipeline({ 
  institution, 
  compact = false,
  onStepClick = null 
}) {
  if (!institution) return null;

  const steps = getWorkflowSteps(institution.assignedPath, institution.currentStage);
  const currentStage = institution.currentStage;

  // Determine stage index
  const stageOrderMap = {
    'submitted': 0,
    'scrutiny_queue': 1,
    'evc_queue': institution.assignedPath === 'path-3' ? 1 : 2,
    'conditional_undertaking': 2,
    'sac_appeal': 2,
    'escalated_deficiency': 1,
    'ro_approval': institution.assignedPath === 'path-1' ? 2 : (institution.assignedPath === 'path-4' ? 3 : (institution.assignedPath === 'path-3' ? 3 : 3)),
    'eoa_issued': 10
  };

  const currentIdx = stageOrderMap[currentStage] ?? 1;

  return (
    <div className={`w-full ${compact ? 'py-1' : 'p-4 bg-white rounded-xl border border-slate-200 shadow-sm'}`}>
      {!compact && (
        <div className="flex flex-wrap items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Assigned Workflow Path:</span>
            <span className="px-2 py-0.5 rounded font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200">
              {institution.pathTitle || institution.assignedPath}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {institution.slaDaysRemaining !== undefined && (
              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                institution.slaDaysRemaining <= 0
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : institution.slaDaysRemaining <= 2
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {institution.slaDaysRemaining <= 0 
                  ? `SLA Breached (${Math.abs(institution.slaDaysRemaining)}d Overdue)`
                  : `SLA Timer: ${institution.slaDaysRemaining}d remaining`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 -z-0" />
        
        {steps.map((step, idx) => {
          const isCompleted = institution.eoaIssued || idx < currentIdx;
          const isCurrent = !institution.eoaIssued && idx === currentIdx;
          const isPending = !institution.eoaIssued && idx > currentIdx;

          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center flex-1 cursor-pointer group"
              onClick={() => onStepClick && onStepClick(step.id)}
            >
              {/* Step Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isCompleted 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50' 
                  : isCurrent
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse'
                  : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                )}
              </div>

              {/* Labels */}
              <div className="text-center mt-2 px-1">
                <p className={`text-xs font-semibold leading-tight ${
                  isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step.label}
                </p>
                {!compact && (
                  <p className="text-[10px] text-slate-500 hidden md:block mt-0.5 font-normal">
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
