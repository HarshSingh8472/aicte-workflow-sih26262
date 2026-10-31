import { useState, useRef, useEffect } from 'react';
import {
  Shield, TrendingUp, TrendingDown, Building2, Award, Clock, IndianRupee,
  FileCheck, AlertTriangle, ChevronRight, Landmark, BarChart3, Activity,
  Globe, Lock, Eye, Layers, ArrowUpRight, ArrowDownRight, Fingerprint,
  MapPin, Users, GraduationCap, Scale, Flame, Ruler, FileWarning
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const REGIONS = [
  {
    code: 'SRO', name: 'Southern Regional Office', total: 3120,
    processed: 2340, active: 580, overdue: 200, city: 'Bengaluru'
  },
  {
    code: 'WRO', name: 'Western Regional Office', total: 2840,
    processed: 2130, active: 510, overdue: 200, city: 'Mumbai'
  },
  {
    code: 'NRO', name: 'Northern Regional Office', total: 2680,
    processed: 1876, active: 548, overdue: 256, city: 'New Delhi'
  },
  {
    code: 'ERO', name: 'Eastern Regional Office', total: 1890,
    processed: 1323, active: 378, overdue: 189, city: 'Kolkata'
  },
  {
    code: 'SWRO', name: 'South-Western Regional Office', total: 710,
    processed: 568, active: 107, overdue: 35, city: 'Hyderabad'
  },
];

const DISCREPANCY_CATEGORIES = [
  { id: 'land', label: 'Land Title & Zoning', pct: 34, color: '#f43f5e', bg: 'bg-rose-500', icon: MapPin },
  { id: 'faculty', label: 'Faculty Cadre Deficit', pct: 28, color: '#f59e0b', bg: 'bg-amber-500', icon: Users },
  { id: 'fire', label: 'Fire NOC Lapsed', pct: 22, color: '#f97316', bg: 'bg-orange-500', icon: Flame },
  { id: 'carpet', label: 'Carpet Area Deficit', pct: 16, color: '#3b82f6', bg: 'bg-blue-500', icon: Ruler },
];

const VELOCITY_DATA = [
  { month: 'Apr', days: 38 },
  { month: 'May', days: 32 },
  { month: 'Jun', days: 28 },
  { month: 'Jul', days: 22 },
  { month: 'Aug', days: 18 },
  { month: 'Sep', days: 14.2 },
];

const KPI_CARDS = [
  {
    value: '11,240', label: 'Total Technical Institutions',
    sub: 'Across 36 States & 8 UTs',
    icon: Building2, color: 'indigo', trend: null
  },
  {
    value: '78.4%', label: 'First-Pass Yield',
    sub: 'Institutions Clearing Stage 1 & 2 Without SAC Intervention',
    icon: Award, color: 'emerald', trend: 'up'
  },
  {
    value: '14.2 Days', label: 'Avg Processing Velocity',
    sub: 'vs 45-Day Statutory SLA Limit — 68% Reduction',
    icon: Clock, color: 'sky', trend: 'up'
  },
  {
    value: '₹48.2 Cr', label: 'FDR Escrow Corpus',
    sub: 'Bank Guarantee Under Central AICTE Custody',
    icon: IndianRupee, color: 'amber', trend: null
  },
  {
    value: '387', label: 'EoA Certificates Issued',
    sub: 'Current Approval Cycle 2025-26',
    icon: FileCheck, color: 'violet', trend: 'up'
  },
];

// ─── COLOR MAP ────────────────────────────────────────────────────────────────

const colorMap = {
  indigo: { ring: 'ring-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20', border: 'border-indigo-500/20' },
  emerald: { ring: 'ring-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
  sky: { ring: 'ring-sky-500/30', bg: 'bg-sky-500/10', text: 'text-sky-400', iconBg: 'bg-sky-500/20', border: 'border-sky-500/20' },
  amber: { ring: 'ring-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', iconBg: 'bg-amber-500/20', border: 'border-amber-500/20' },
  violet: { ring: 'ring-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', iconBg: 'bg-violet-500/20', border: 'border-violet-500/20' },
};

// ─── HELPER: SHA-256 HASH DISPLAY ─────────────────────────────────────────────

function generateSessionHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function NationalExecutiveDashboard({
  institutions = [],
  alerts = [],
  undertakings = [],
  aphRules = {},
  currentDate = '2025-09-15',
}) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const [hoveredVelocity, setHoveredVelocity] = useState(null);
  const [sessionHash] = useState(() => generateSessionHash());

  // ─── KPI STAT CARDS ──────────────────────────────────────────────────────

  function KpiCard({ value, label, sub, icon: Icon, color, trend }) {
    const c = colorMap[color];
    return (
      <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-slate-900/80 backdrop-blur-sm p-5 flex flex-col justify-between group hover:ring-2 ${c.ring} transition-all duration-300`}>
        {/* Decorative gradient glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 ${c.bg} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

        <div className="flex items-start justify-between relative z-10">
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
          {trend === 'up' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">+12%</span>
            </div>
          )}
        </div>

        <div className="mt-4 relative z-10">
          <p className={`text-2xl font-bold tracking-tight text-white`}>{value}</p>
          <p className={`text-xs font-semibold ${c.text} mt-1`}>{label}</p>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{sub}</p>
        </div>
      </div>
    );
  }

  // ─── REGIONAL WORKLOAD BAR CHART ─────────────────────────────────────────

  function RegionalBarChart() {
    const svgRef = useRef(null);
    const maxTotal = Math.max(...REGIONS.map(r => r.total));
    const barH = 36;
    const gap = 16;
    const leftPad = 60;
    const rightPad = 30;
    const topPad = 10;
    const chartW = 600;
    const chartH = REGIONS.length * (barH + gap) + topPad;
    const barArea = chartW - leftPad - rightPad;

    function handleBarHover(e, region) {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setHoveredRegion(region);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
    }

    return (
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoveredRegion(null)}
        >
          <defs>
            <linearGradient id="processedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="activeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="overdueGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {REGIONS.map((region, i) => {
            const y = topPad + i * (barH + gap);
            const pW = (region.processed / maxTotal) * barArea;
            const aW = (region.active / maxTotal) * barArea;
            const oW = (region.overdue / maxTotal) * barArea;
            const isHovered = hoveredRegion?.code === region.code;

            return (
              <g
                key={region.code}
                onMouseMove={(e) => handleBarHover(e, region)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer"
              >
                {/* Background track */}
                <rect
                  x={leftPad} y={y} width={barArea} height={barH}
                  rx={6} fill="#1e293b" opacity={0.5}
                />

                {/* Processed segment */}
                <rect
                  x={leftPad} y={y + 2} width={pW} height={barH - 4}
                  rx={4} fill="url(#processedGrad)"
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200"
                />

                {/* Active Queue segment */}
                <rect
                  x={leftPad + pW} y={y + 2} width={aW} height={barH - 4}
                  fill="url(#activeGrad)"
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200"
                />

                {/* Overdue segment */}
                <rect
                  x={leftPad + pW + aW} y={y + 2} width={oW} height={barH - 4}
                  rx={4} fill="url(#overdueGrad)"
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200"
                />

                {/* Hover highlight ring */}
                {isHovered && (
                  <rect
                    x={leftPad - 2} y={y - 2} width={pW + aW + oW + 4} height={barH + 4}
                    rx={7} fill="none" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 2"
                  />
                )}

                {/* Region label */}
                <text
                  x={leftPad - 8} y={y + barH / 2 + 1}
                  textAnchor="end" fill="#94a3b8"
                  fontSize="11" fontWeight="600" fontFamily="monospace"
                >
                  {region.code}
                </text>

                {/* Total count at end */}
                <text
                  x={leftPad + pW + aW + oW + 8} y={y + barH / 2 + 1}
                  textAnchor="start" fill="#cbd5e1"
                  fontSize="10" fontWeight="500" fontFamily="monospace"
                  dominantBaseline="middle"
                >
                  {region.total.toLocaleString()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredRegion && (
          <div
            className="absolute z-50 pointer-events-none bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-3 min-w-[200px]"
            style={{ left: tooltipPos.x + 10, top: tooltipPos.y - 80 }}
          >
            <p className="text-xs font-bold text-white mb-0.5">{hoveredRegion.name}</p>
            <p className="text-[10px] text-slate-400 mb-2">{hoveredRegion.city} Headquarters</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-300">Processed</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">{hoveredRegion.processed.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-slate-300">Active Queue</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400">{hoveredRegion.active.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-[10px] text-slate-300">Overdue</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-400">{hoveredRegion.overdue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-400">Processed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-400">Active Queue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-rose-400" />
            <span className="text-[10px] text-slate-400">Overdue / SLA Breach</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── DISCREPANCY TREEMAP ─────────────────────────────────────────────────

  function DiscrepancyTreemap() {
    const totalW = 560;
    const totalH = 180;

    // Simple treemap: top row 34%+28%, bottom row 22%+16%
    const topRow = DISCREPANCY_CATEGORIES.slice(0, 2);
    const bottomRow = DISCREPANCY_CATEGORIES.slice(2, 4);
    const topTotal = topRow.reduce((s, c) => s + c.pct, 0);
    const botTotal = bottomRow.reduce((s, c) => s + c.pct, 0);
    const topH = totalH * (topTotal / 100);
    const botH = totalH * (botTotal / 100);
    const padding = 3;

    function buildRects() {
      const rects = [];
      // Top row
      let x = 0;
      topRow.forEach((cat) => {
        const w = totalW * (cat.pct / topTotal);
        rects.push({ ...cat, x: x + padding, y: padding, w: w - padding * 2, h: topH - padding * 2 });
        x += w;
      });
      // Bottom row
      x = 0;
      bottomRow.forEach((cat) => {
        const w = totalW * (cat.pct / botTotal);
        rects.push({ ...cat, x: x + padding, y: topH + padding, w: w - padding * 2, h: botH - padding * 2 });
        x += w;
      });
      return rects;
    }

    const rects = buildRects();

    return (
      <div>
        <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto">
          <defs>
            {DISCREPANCY_CATEGORIES.map(cat => (
              <linearGradient key={cat.id} id={`treemap-${cat.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={cat.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0.55" />
              </linearGradient>
            ))}
          </defs>

          {rects.map((r) => {
            const isSelected = selectedDiscrepancy === r.id;
            const Icon = r.icon;
            return (
              <g
                key={r.id}
                onClick={() => setSelectedDiscrepancy(selectedDiscrepancy === r.id ? null : r.id)}
                className="cursor-pointer"
              >
                <rect
                  x={r.x} y={r.y} width={r.w} height={r.h}
                  rx={10}
                  fill={`url(#treemap-${r.id})`}
                  stroke={isSelected ? '#ffffff' : 'transparent'}
                  strokeWidth={isSelected ? 2.5 : 0}
                  opacity={selectedDiscrepancy && !isSelected ? 0.35 : 1}
                  className="transition-all duration-300"
                />
                {/* Label */}
                <text
                  x={r.x + r.w / 2} y={r.y + r.h / 2 - 8}
                  textAnchor="middle" fill="white"
                  fontSize="11" fontWeight="700"
                  dominantBaseline="middle"
                >
                  {r.label}
                </text>
                {/* Percentage */}
                <text
                  x={r.x + r.w / 2} y={r.y + r.h / 2 + 12}
                  textAnchor="middle" fill="rgba(255,255,255,0.85)"
                  fontSize="20" fontWeight="800" fontFamily="monospace"
                  dominantBaseline="middle"
                >
                  {r.pct}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Category pills below treemap */}
        <div className="flex flex-wrap gap-2 mt-3">
          {DISCREPANCY_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedDiscrepancy === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedDiscrepancy(selectedDiscrepancy === cat.id ? null : cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/10 border-white/30 text-white ring-1 ring-white/20'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}: {cat.pct}%
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── PROCESSING VELOCITY TREND ───────────────────────────────────────────

  function VelocityTrend() {
    const svgW = 560;
    const svgH = 200;
    const padL = 40;
    const padR = 20;
    const padT = 20;
    const padB = 35;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const maxD = 45;
    const minD = 0;

    function xPos(i) {
      return padL + (i / (VELOCITY_DATA.length - 1)) * plotW;
    }
    function yPos(d) {
      return padT + ((maxD - d) / (maxD - minD)) * plotH;
    }

    const points = VELOCITY_DATA.map((d, i) => `${xPos(i)},${yPos(d.days)}`).join(' ');
    const areaPoints =
      `${xPos(0)},${padT + plotH} ` +
      VELOCITY_DATA.map((d, i) => `${xPos(i)},${yPos(d.days)}`).join(' ') +
      ` ${xPos(VELOCITY_DATA.length - 1)},${padT + plotH}`;

    // SLA line at 45 days
    const slaY = yPos(45);

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 15, 30, 45].map(d => (
            <g key={d}>
              <line
                x1={padL} y1={yPos(d)} x2={svgW - padR} y2={yPos(d)}
                stroke="#334155" strokeWidth={0.5} strokeDasharray={d === 45 ? '6 3' : '2 4'}
              />
              <text
                x={padL - 6} y={yPos(d) + 1}
                textAnchor="end" fill="#64748b"
                fontSize="9" fontFamily="monospace" dominantBaseline="middle"
              >
                {d}d
              </text>
            </g>
          ))}

          {/* SLA Label */}
          <text
            x={svgW - padR - 2} y={slaY - 6}
            textAnchor="end" fill="#f43f5e"
            fontSize="8" fontWeight="600" fontFamily="monospace"
          >
            45-DAY SLA LIMIT
          </text>
          <line
            x1={padL} y1={slaY} x2={svgW - padR} y2={slaY}
            stroke="#f43f5e" strokeWidth={1} strokeDasharray="6 3" opacity={0.6}
          />

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#areaFill)" />

          {/* Line */}
          <polyline
            points={points}
            fill="none" stroke="url(#lineGrad)" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data points */}
          {VELOCITY_DATA.map((d, i) => (
            <g
              key={d.month}
              onMouseEnter={() => setHoveredVelocity(i)}
              onMouseLeave={() => setHoveredVelocity(null)}
              className="cursor-pointer"
            >
              {/* Hover ring */}
              {hoveredVelocity === i && (
                <circle
                  cx={xPos(i)} cy={yPos(d.days)}
                  r={12} fill="#06b6d4" opacity={0.15}
                />
              )}
              {/* Outer ring */}
              <circle
                cx={xPos(i)} cy={yPos(d.days)}
                r={hoveredVelocity === i ? 6 : 4}
                fill="#0f172a" stroke="#22d3ee" strokeWidth={2}
                className="transition-all duration-200"
              />
              {/* Inner dot */}
              <circle cx={xPos(i)} cy={yPos(d.days)} r={2} fill="#22d3ee" />

              {/* Value label on hover */}
              {hoveredVelocity === i && (
                <>
                  <rect
                    x={xPos(i) - 22} y={yPos(d.days) - 28}
                    width={44} height={18} rx={6}
                    fill="#0f172a" stroke="#22d3ee" strokeWidth={1}
                  />
                  <text
                    x={xPos(i)} y={yPos(d.days) - 16}
                    textAnchor="middle" fill="#22d3ee"
                    fontSize="10" fontWeight="700" fontFamily="monospace"
                    dominantBaseline="middle"
                  >
                    {d.days}d
                  </text>
                </>
              )}

              {/* X-axis label */}
              <text
                x={xPos(i)} y={svgH - 8}
                textAnchor="middle" fill="#94a3b8"
                fontSize="10" fontWeight="500"
              >
                {d.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/20">
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Ashok Stambh inspired emblem */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Landmark className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    National Executive Bureau Dashboard
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Classified — Internal Ministry Use Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ministry of Education — Unified Situational Intelligence Platform
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Eye className="w-3 h-3" />
                <span>SESSION {sessionHash.slice(0, 16).toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                REPORT GENERATED: {new Date(currentDate).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                }).toUpperCase()} IST
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                SHA-256: {sessionHash.slice(0, 32)}…
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </div>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ─── KPI STAT CARDS ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              National Key Performance Indicators
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {KPI_CARDS.map((kpi, i) => (
              <KpiCard key={i} {...kpi} />
            ))}
          </div>
        </section>

        {/* ─── MIDDLE ROW: Bar Chart + Treemap ───────────────────────── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Regional Workload Breakdown */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-200">Regional Workload Distribution</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {REGIONS.reduce((s, r) => s + r.total, 0).toLocaleString()} INSTITUTIONS
              </span>
            </div>
            <RegionalBarChart />
          </div>

          {/* Discrepancy Category Treemap */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-200">Top Discrepancy Grounds</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                REJECTION TAXONOMY
              </span>
            </div>
            <DiscrepancyTreemap />
          </div>
        </div>

        {/* ─── BOTTOM ROW: Velocity Trend + Live Alerts ──────────────── */}
        <div className="grid grid-cols-5 gap-5">

          {/* Processing Velocity Trend — wider */}
          <div className="col-span-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">Processing Velocity Trend</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> 63% FASTER
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  AVG DAYS TO EoA
                </span>
              </div>
            </div>
            <VelocityTrend />
          </div>

          {/* Active Alerts & System Status */}
          <div className="col-span-2 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">Bureau Situational Alerts</h3>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
              {/* Hardcoded executive-level alerts */}
              {[
                {
                  severity: 'critical', icon: AlertTriangle,
                  title: 'SLA Breach — ERO Cluster',
                  body: '14 institutions in West Bengal exceed 45-day processing window. Escalation to Regional Director initiated.',
                  time: '12 min ago',
                },
                {
                  severity: 'warning', icon: Scale,
                  title: 'Faculty Ratio Non-Compliance Spike',
                  body: 'NRO reports 23% increase in UG faculty-ratio deficiency flags during September intake.',
                  time: '1 hr ago',
                },
                {
                  severity: 'info', icon: FileCheck,
                  title: 'Batch EoA Release — SRO',
                  body: '42 Extension of Approval certificates digitally signed and dispatched to Tamil Nadu institutions.',
                  time: '3 hrs ago',
                },
                {
                  severity: 'warning', icon: Flame,
                  title: 'Fire NOC Cluster Expiry',
                  body: '18 institutions across Maharashtra approaching Fire NOC expiry within 30-day window.',
                  time: '5 hrs ago',
                },
                {
                  severity: 'info', icon: Fingerprint,
                  title: 'Biometric Audit Sync Complete',
                  body: 'DigiLocker cross-verification for 2,400 faculty profiles completed. 97.8% match rate.',
                  time: '8 hrs ago',
                },
              ].map((alert, i) => {
                const severityStyles = {
                  critical: 'border-rose-500/30 bg-rose-500/5',
                  warning: 'border-amber-500/30 bg-amber-500/5',
                  info: 'border-sky-500/20 bg-sky-500/5',
                };
                const severityBadge = {
                  critical: 'bg-rose-500/20 text-rose-400',
                  warning: 'bg-amber-500/20 text-amber-400',
                  info: 'bg-sky-500/20 text-sky-400',
                };
                const Icon = alert.icon;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${severityStyles[alert.severity]} transition-all duration-200 hover:bg-slate-800/40`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${severityBadge[alert.severity]}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-200 truncate">{alert.title}</p>
                          <span className={`ml-2 flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${severityBadge[alert.severity]}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{alert.body}</p>
                        <p className="text-[9px] text-slate-600 mt-1 font-mono">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status footer */}
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">All Systems Operational</span>
              </div>
              <span className="text-[9px] text-slate-600 font-mono">UPTIME 99.97%</span>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-800/50 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Landmark className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">
                  All India Council for Technical Education — Bureau of Approval & Compliance
                </p>
                <p className="text-[9px] text-slate-600">
                  Nelson Mandela Marg, Vasant Kunj, New Delhi — 110070
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-600 font-mono">
                DOCUMENT INTEGRITY: SHA-256:{sessionHash.slice(0, 48)}
              </p>
              <p className="text-[9px] text-slate-700 mt-0.5">
                This dashboard is classified under Section 8(1)(a) of the RTI Act, 2005
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
