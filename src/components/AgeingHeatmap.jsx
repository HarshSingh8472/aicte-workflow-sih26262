import React from 'react';
import { Clock, AlertTriangle, Flame } from 'lucide-react';

/**
 * Application Ageing Matrix — Spot-Stealer #2
 * Shows how long files have been stuck at each stage across AICTE Bureaus/Regions.
 * Bands: 0–7 Days [Green], 8–15 Days [Amber], 16–30 Days [Orange], >30 Days [Red]
 */
export default function AgeingHeatmap({ institutions = [], currentDate }) {
  const today = new Date(currentDate);

  const regions = ['WRO', 'SRO', 'ERO', 'NRO'];
  const stages = ['scrutiny_queue', 'evc_queue', 'sac_appeal', 'ro_approval'];
  const stageLabels = {
    scrutiny_queue: 'Stage 1: Scrutiny',
    evc_queue: 'Stage 2: EVC',
    sac_appeal: 'Stage 3: SAC/SHC',
    ro_approval: 'RO Final Sign-Off'
  };

  const getAgeDays = (inst) => {
    const submitted = new Date(inst.stageUpdatedDate || inst.submittedDate || currentDate);
    return Math.max(0, Math.floor((today - submitted) / (1000 * 60 * 60 * 24)));
  };

  const getAgeColor = (days) => {
    if (days <= 7) return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'On Track' };
    if (days <= 15) return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Approaching SLA' };
    if (days <= 30) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'SLA Breached' };
    return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', label: 'Critical Bottleneck' };
  };

  // Build matrix data
  const matrixData = {};
  regions.forEach(region => {
    matrixData[region] = {};
    stages.forEach(stage => {
      const matching = institutions.filter(i => i.region === region && i.currentStage === stage);
      const ages = matching.map(i => getAgeDays(i));
      matrixData[region][stage] = {
        count: matching.length,
        maxAge: ages.length > 0 ? Math.max(...ages) : 0,
        avgAge: ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0,
        institutions: matching.map(i => ({ name: i.name, age: getAgeDays(i) }))
      };
    });
  });

  // Summary stats
  const allActive = institutions.filter(i => !['eoa_issued', 'rejected'].includes(i.currentStage));
  const ageBreakdown = {
    green: allActive.filter(i => getAgeDays(i) <= 7).length,
    amber: allActive.filter(i => getAgeDays(i) > 7 && getAgeDays(i) <= 15).length,
    orange: allActive.filter(i => getAgeDays(i) > 15 && getAgeDays(i) <= 30).length,
    red: allActive.filter(i => getAgeDays(i) > 30).length
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Application Ageing Matrix & Pendency Heatmap</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              SIH26262 Clause B
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time pendency ageing breakdown across all 4 AICTE Regional Offices and approval stages
          </p>
        </div>

        {/* Age Band Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
            ● 0–7d
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
            ● 8–15d
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-400/30">
            ● 16–30d
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
            ● &gt;30d
          </span>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 border-b border-slate-200 text-xs">
        <div className="p-3 text-center bg-emerald-50 border-r border-slate-200">
          <span className="text-emerald-800 font-extrabold text-lg block">{ageBreakdown.green}</span>
          <span className="text-emerald-700 font-semibold text-[10px]">On Track (≤7d)</span>
        </div>
        <div className="p-3 text-center bg-amber-50 border-r border-slate-200">
          <span className="text-amber-800 font-extrabold text-lg block">{ageBreakdown.amber}</span>
          <span className="text-amber-700 font-semibold text-[10px]">Approaching (8–15d)</span>
        </div>
        <div className="p-3 text-center bg-orange-50 border-r border-slate-200">
          <span className="text-orange-800 font-extrabold text-lg block">{ageBreakdown.orange}</span>
          <span className="text-orange-700 font-semibold text-[10px]">SLA Breached (16–30d)</span>
        </div>
        <div className="p-3 text-center bg-rose-50">
          <span className="text-rose-800 font-extrabold text-lg block">{ageBreakdown.red}</span>
          <span className="text-rose-700 font-semibold text-[10px]">Critical (&gt;30d)</span>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-bold text-slate-700">Region</th>
              {stages.map(stage => (
                <th key={stage} className="px-3 py-3 text-center font-bold text-slate-700">
                  {stageLabels[stage]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {regions.map(region => (
              <tr key={region} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                  {region}
                  <span className="block text-[10px] font-normal text-slate-500">
                    {region === 'WRO' ? 'Mumbai / Pune' : region === 'SRO' ? 'Chennai / Bengaluru' : region === 'ERO' ? 'Kolkata' : 'Kanpur / Lucknow'}
                  </span>
                </td>
                {stages.map(stage => {
                  const cell = matrixData[region][stage];
                  if (cell.count === 0) {
                    return (
                      <td key={stage} className="px-3 py-3 text-center">
                        <span className="text-slate-400 font-mono">—</span>
                      </td>
                    );
                  }
                  const color = getAgeColor(cell.maxAge);
                  return (
                    <td key={stage} className="px-3 py-3 text-center">
                      <div className={`inline-flex flex-col items-center px-3 py-2 rounded-xl ${color.bg} border ${color.border}`}>
                        <span className={`font-extrabold text-base ${color.text}`}>{cell.count}</span>
                        <span className={`text-[10px] font-semibold ${color.text} opacity-80`}>
                          {cell.maxAge}d max
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

