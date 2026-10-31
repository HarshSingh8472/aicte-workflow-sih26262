import React, { useState } from 'react';
import { Layers, Activity, AlertTriangle, CheckCircle2, Clock, Filter, Eye } from 'lucide-react';

export default function PendencyMatrix({
  institutions = [],
  selectedRegion,
  selectedStage,
  onCellSelect
}) {
  const [viewMode, setViewMode] = useState('count'); // 'count' | 'sla'

  const regions = [
    { id: 'WRO', label: 'WRO (Mumbai / Pune)', short: 'WRO' },
    { id: 'SRO', label: 'SRO (Chennai / Hyd)', short: 'SRO' },
    { id: 'ERO', label: 'ERO (Kolkata / East)', short: 'ERO' },
    { id: 'NRO', label: 'NRO (Kanpur / North)', short: 'NRO' }
  ];

  const stages = [
    { id: 'scrutiny_queue', label: 'Stage 1: Desk Scrutiny', short: 'Scrutiny' },
    { id: 'evc_queue', label: 'Stage 2: EVC Inspection', short: 'EVC Visit' },
    { id: 'sac_appeal', label: 'Stage 3: SAC Appeals', short: 'SAC Appeal' },
    { id: 'ro_approval', label: 'Stage 4: Regional Sign-off', short: 'RO Sign-off' }
  ];

  // Map other stages to one of the 4 columns for clean telemetry
  const normalizeStage = (st) => {
    if (st === 'conditional_undertaking') return 'evc_queue';
    if (st === 'escalated_deficiency') return 'scrutiny_queue';
    if (st === 'eoa_issued') return 'ro_approval';
    return st;
  };

  const getCellData = (regionId, stageId) => {
    const matched = institutions.filter(i => {
      const matchRegion = i.region === regionId;
      const matchStage = normalizeStage(i.currentStage) === stageId;
      return matchRegion && matchStage;
    });

    const overdueCount = matched.filter(i => (i.slaDaysRemaining ?? 0) < 0).length;
    const avgSla = matched.length > 0 
      ? (matched.reduce((acc, i) => acc + (i.slaDaysRemaining ?? 0), 0) / matched.length).toFixed(1)
      : null;

    return {
      count: matched.length,
      overdueCount,
      avgSla,
      items: matched
    };
  };

  return (
    <div className="bg-slate-900/90 text-white rounded-2xl border border-slate-800 p-4 shadow-gov space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Regional Pendency Radar & Stage Velocity Matrix</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                Live Bureau Telemetry
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Cross-jurisdiction bottleneck radar. Click any cell to isolate files.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
            <button
              onClick={() => setViewMode('count')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                viewMode === 'count' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Dossiers
            </button>
            <button
              onClick={() => setViewMode('sla')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                viewMode === 'sla' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              SLA Risk Aging
            </button>
          </div>

          {(selectedRegion !== 'ALL' || selectedStage !== 'ALL') && (
            <button
              onClick={() => onCellSelect('ALL', 'ALL')}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Grid Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400">
              <th className="py-2 px-3 font-semibold text-slate-500 w-32">Regional Office</th>
              {stages.map(st => (
                <th key={st.id} className="py-2 px-3 font-semibold text-center">
                  {st.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {regions.map(reg => (
              <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-300 text-xs">
                  <span className="font-mono text-amber-400 mr-1.5">{reg.short}</span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">({reg.label.split('(')[1]}</span>
                </td>

                {stages.map(st => {
                  const cell = getCellData(reg.id, st.id);
                  const isSelected = selectedRegion === reg.id && selectedStage === st.id;
                  const hasOverdue = cell.overdueCount > 0;
                  const hasItems = cell.count > 0;

                  return (
                    <td 
                      key={st.id} 
                      onClick={() => hasItems && onCellSelect(reg.id, st.id)}
                      className="py-2 px-2 text-center"
                    >
                      <button
                        disabled={!hasItems}
                        className={`w-full py-2 px-2 rounded-xl border text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-blue-600 border-white text-white shadow-lg ring-2 ring-blue-400'
                            : !hasItems
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-default'
                            : hasOverdue
                            ? 'bg-rose-950/60 border-rose-600/50 text-rose-300 hover:bg-rose-900/60 cursor-pointer shadow-xs'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700 cursor-pointer'
                        }`}
                      >
                        {viewMode === 'count' ? (
                          <>
                            <span className="font-extrabold text-sm font-mono">
                              {cell.count}
                            </span>
                            <span className="text-[10px] opacity-75">
                              {hasOverdue ? (
                                <span className="text-rose-400 font-bold">{cell.overdueCount} Overdue</span>
                              ) : (
                                'On Track'
                              )}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className={`font-mono font-bold text-xs ${
                              cell.avgSla && Number(cell.avgSla) < 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {cell.avgSla !== null ? `${cell.avgSla}d` : '-'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {hasOverdue ? 'Breached' : 'Avg Time'}
                            </span>
                          </>
                        )}
                      </button>
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

