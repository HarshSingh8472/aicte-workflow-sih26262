import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, ZoomIn, ZoomOut, Layers, Satellite, MapPin, Radio, Shield, Eye, EyeOff } from 'lucide-react';

// ── Campus polygon vertices (normalised 0–1000 coordinate space) ──────────
const CAMPUS_POLY = [
  { x: 420, y: 260 },
  { x: 580, y: 230 },
  { x: 680, y: 340 },
  { x: 650, y: 500 },
  { x: 500, y: 560 },
  { x: 370, y: 470 },
];

// Buffer polygon — ~100 m offset
const BUFFER_POLY = [
  { x: 390, y: 220 },
  { x: 610, y: 185 },
  { x: 725, y: 310 },
  { x: 690, y: 540 },
  { x: 500, y: 610 },
  { x: 335, y: 505 },
];

// GPS Survey markers at vertices
const SURVEY_MARKERS = [
  { ...CAMPUS_POLY[0], label: 'P1: 19.0220°N, 72.8555°E' },
  { ...CAMPUS_POLY[1], label: 'P2: 19.0225°N, 72.8570°E' },
  { ...CAMPUS_POLY[2], label: 'P3: 19.0218°N, 72.8580°E' },
  { ...CAMPUS_POLY[3], label: 'P4: 19.0210°N, 72.8575°E' },
  { ...CAMPUS_POLY[4], label: 'P5: 19.0205°N, 72.8562°E' },
  { ...CAMPUS_POLY[5], label: 'P6: 19.0212°N, 72.8548°E' },
];

const polyToString = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');

// ── Layer presets ─────────────────────────────────────────────────────────
const LAYERS = [
  { id: 'satellite', label: 'Satellite Composite', icon: Satellite, gridColor: '#1e293b', bgExtra: 'rgba(16,185,129,0.02)' },
  { id: 'cadastral', label: 'Revenue Cadastral', icon: MapPin, gridColor: '#312e81', bgExtra: 'rgba(99,102,241,0.04)' },
  { id: 'geofence', label: 'Bhuvan Geofence', icon: Radio, gridColor: '#164e63', bgExtra: 'rgba(6,182,212,0.05)' },
];

// ── Road paths (decorative curved SVG paths) ──────────────────────────────
const ROADS = [
  'M 0,180 Q 200,160 400,200 T 800,170 L 1000,190',
  'M 120,0 Q 140,250 180,500 T 200,750 L 210,1000',
  'M 750,0 Q 730,200 760,400 T 780,700 L 800,1000',
  'M 0,650 Q 250,620 500,670 T 900,640 L 1000,660',
  'M 0,420 Q 150,400 300,430 T 600,410 L 1000,440',
];

// ── Small building rectangles inside campus ───────────────────────────────
const BUILDINGS = [
  { x: 460, y: 310, w: 50, h: 35, label: 'Admin Block' },
  { x: 530, y: 360, w: 60, h: 40, label: 'Academic Wing A' },
  { x: 440, y: 400, w: 45, h: 50, label: 'Library' },
  { x: 560, y: 440, w: 55, h: 30, label: 'Lab Complex' },
  { x: 490, y: 280, w: 40, h: 25, label: 'Auditorium' },
];

export default function GisSatelliteMapView({ institution = {}, compact = false }) {
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [scale, setScale] = useState(1);
  const [showBuffer, setShowBuffer] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  const landAcres = institution.landAcres ?? 5.2;
  const landPassed = landAcres >= 2.5;

  const currentLayerCfg = LAYERS.find((l) => l.id === activeLayer) || LAYERS[0];

  // ── Canvas background render with animated scan line ───────────────────
  const drawCanvas = useCallback(
    (timestamp) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      timeRef.current = timestamp;

      // Dark background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Subtle noise texture
      const imageData = ctx.getImageData(0, 0, W, H);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const n = Math.random() * 6;
        data[i] += n;
        data[i + 1] += n;
        data[i + 2] += n + 2;
      }
      ctx.putImageData(imageData, 0, 0);

      // Animated horizontal scan line
      const scanY = (timestamp * 0.03) % H;
      const grad = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      grad.addColorStop(0, 'rgba(16,185,129,0)');
      grad.addColorStop(0.5, 'rgba(16,185,129,0.08)');
      grad.addColorStop(1, 'rgba(16,185,129,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 4, W, 8);

      // Corner vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      animFrameRef.current = requestAnimationFrame(drawCanvas);
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    animFrameRef.current = requestAnimationFrame(drawCanvas);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawCanvas]);

  // ── Lat/Lon tick labels ────────────────────────────────────────────────
  const latTicks = ['19.0230°N', '19.0225°N', '19.0220°N', '19.0215°N', '19.0210°N', '19.0205°N'];
  const lonTicks = ['72.8545°E', '72.8550°E', '72.8555°E', '72.8560°E', '72.8565°E', '72.8570°E', '72.8575°E', '72.8580°E'];

  const mapH = compact ? 360 : 520;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 2.2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${compact ? '' : ''}`}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Satellite className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">GIS SATELLITE CAMPUS VERIFICATION</h2>
            <p className="text-[10px] text-emerald-300/70 font-mono mt-0.5">
              ISRO Bhuvan Cadastral Integration • Land &amp; Boundary Compliance Engine v4.2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400">LIVE FEED</span>
        </div>
      </div>

      <div className={`flex ${compact ? 'flex-col' : 'flex-col lg:flex-row'}`}>
        {/* ── Map Area ──────────────────────────────────────────────── */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden" style={{ minHeight: mapH }}>
          {/* Canvas background */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

          {/* SVG Overlay */}
          <svg
            viewBox="0 0 1000 700"
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1, transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Pulsing animation for campus boundary */}
              <style>{`
                @keyframes pulseStroke {
                  0%, 100% { stroke-opacity: 1; stroke-width: 2.5; }
                  50% { stroke-opacity: 0.4; stroke-width: 1.5; }
                }
                @keyframes markerPulse {
                  0%, 100% { r: 4; opacity: 1; }
                  50% { r: 7; opacity: 0.3; }
                }
                @keyframes dashMove {
                  to { stroke-dashoffset: -20; }
                }
                .campus-boundary {
                  animation: pulseStroke 2.5s ease-in-out infinite;
                }
                .buffer-dash {
                  stroke-dasharray: 10 6;
                  animation: dashMove 1.5s linear infinite;
                }
                .marker-pulse {
                  animation: markerPulse 2s ease-in-out infinite;
                }
              `}</style>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowStrong">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Grid overlay ──────────────────────────────────────── */}
            <g opacity="0.3">
              {Array.from({ length: 21 }, (_, i) => (
                <line
                  key={`vg-${i}`}
                  x1={i * 50}
                  y1={0}
                  x2={i * 50}
                  y2={700}
                  stroke={currentLayerCfg.gridColor}
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 15 }, (_, i) => (
                <line
                  key={`hg-${i}`}
                  x1={0}
                  y1={i * 50}
                  x2={1000}
                  y2={i * 50}
                  stroke={currentLayerCfg.gridColor}
                  strokeWidth="0.5"
                />
              ))}
            </g>

            {/* ── Roads ─────────────────────────────────────────────── */}
            {ROADS.map((d, i) => (
              <path
                key={`road-${i}`}
                d={d}
                fill="none"
                stroke={activeLayer === 'cadastral' ? '#4338ca' : '#334155'}
                strokeWidth={i === 0 || i === 3 ? 3 : 1.5}
                opacity={0.5}
              />
            ))}

            {/* ── Buffer polygon ────────────────────────────────────── */}
            {showBuffer && (
              <g>
                <polygon
                  points={polyToString(BUFFER_POLY)}
                  fill="rgba(16,185,129,0.03)"
                  stroke="#6ee7b7"
                  strokeWidth="1.5"
                  className="buffer-dash"
                  filter="url(#glow)"
                />
                <text x={335} y={175} fill="#6ee7b7" fontSize="9" fontFamily="monospace" opacity="0.7">
                  100m Non-Bisection Safety Buffer
                </text>
              </g>
            )}

            {/* ── Campus boundary polygon ───────────────────────────── */}
            <polygon
              points={polyToString(CAMPUS_POLY)}
              fill={activeLayer === 'geofence' ? 'rgba(6,182,212,0.12)' : 'rgba(16,185,129,0.1)'}
              stroke={activeLayer === 'geofence' ? '#22d3ee' : '#34d399'}
              strokeWidth="2.5"
              className="campus-boundary"
              filter="url(#glowStrong)"
            />

            {/* Campus boundary label */}
            <text x={500} y={400} textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.9">
              Campus Boundary — Revenue Parcel #412/A
            </text>
            <text x={500} y={416} textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace" opacity="0.5">
              Geo-Fenced Perimeter • {landAcres} Acres Surveyed
            </text>

            {/* ── Buildings inside campus ───────────────────────────── */}
            {showBuildings &&
              BUILDINGS.map((b, i) => (
                <g key={`bld-${i}`}>
                  <rect
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    fill={activeLayer === 'cadastral' ? 'rgba(99,102,241,0.2)' : 'rgba(148,163,184,0.12)'}
                    stroke={activeLayer === 'cadastral' ? '#818cf8' : '#64748b'}
                    strokeWidth="0.8"
                    rx="2"
                  />
                  <text
                    x={b.x + b.w / 2}
                    y={b.y + b.h / 2 + 3}
                    textAnchor="middle"
                    fill={activeLayer === 'cadastral' ? '#a5b4fc' : '#94a3b8'}
                    fontSize="6"
                    fontFamily="monospace"
                  >
                    {b.label}
                  </text>
                </g>
              ))}

            {/* ── Survey GPS markers ────────────────────────────────── */}
            {SURVEY_MARKERS.map((m, i) => (
              <g
                key={`mk-${i}`}
                onMouseEnter={() => setHoveredMarker(i)}
                onMouseLeave={() => setHoveredMarker(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring */}
                <circle cx={m.x} cy={m.y} fill="none" stroke="#fbbf24" strokeWidth="1" className="marker-pulse" style={{ animationDelay: `${i * 0.3}s` }} r="4" />

                {/* Diamond marker */}
                <polygon
                  points={`${m.x},${m.y - 5} ${m.x + 5},${m.y} ${m.x},${m.y + 5} ${m.x - 5},${m.y}`}
                  fill="#fbbf24"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  filter="url(#glow)"
                />

                {/* Label */}
                <rect
                  x={m.x + 8}
                  y={m.y - 8}
                  width={hoveredMarker === i ? 160 : 75}
                  height="14"
                  rx="2"
                  fill="rgba(0,0,0,0.8)"
                  stroke="#fbbf24"
                  strokeWidth="0.5"
                />
                <text x={m.x + 12} y={m.y + 2} fill="#fbbf24" fontSize="7.5" fontFamily="monospace">
                  {hoveredMarker === i ? m.label : `P${i + 1}: ${(19.022 + i * 0.0003).toFixed(4)}°N`}
                </text>
              </g>
            ))}

            {/* ── Latitude ticks (left edge) ────────────────────────── */}
            {latTicks.map((t, i) => (
              <g key={`lat-${i}`}>
                <line x1={0} y1={80 + i * 100} x2={12} y2={80 + i * 100} stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
                <text x={16} y={83 + i * 100} fill="#f59e0b" fontSize="7" fontFamily="monospace" opacity="0.6">
                  {t}
                </text>
              </g>
            ))}

            {/* ── Longitude ticks (bottom edge) ─────────────────────── */}
            {lonTicks.map((t, i) => (
              <g key={`lon-${i}`}>
                <line x1={100 + i * 110} y1={688} x2={100 + i * 110} y2={700} stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
                <text x={100 + i * 110} y={684} fill="#f59e0b" fontSize="7" fontFamily="monospace" opacity="0.6" textAnchor="middle">
                  {t}
                </text>
              </g>
            ))}

            {/* ── Scale bar ─────────────────────────────────────────── */}
            <g>
              <line x1={820} y1={660} x2={960} y2={660} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={820} y1={655} x2={820} y2={665} stroke="#94a3b8" strokeWidth="1" />
              <line x1={960} y1={655} x2={960} y2={665} stroke="#94a3b8" strokeWidth="1" />
              <text x={890} y={655} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                200m
              </text>
            </g>

            {/* ── North arrow ───────────────────────────────────────── */}
            <g transform="translate(50, 50)">
              <polygon points="0,-18 5,-6 -5,-6" fill="#f59e0b" opacity="0.8" />
              <line x1={0} y1={-6} x2={0} y2={10} stroke="#94a3b8" strokeWidth="1.5" />
              <text x={0} y={-22} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                N
              </text>
            </g>
          </svg>

          {/* ── Top-right HUD overlay ───────────────────────────────── */}
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black/80 backdrop-blur-sm border border-emerald-500/30 rounded-lg px-3 py-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-300 font-bold tracking-wider">ISRO BHUVAN CADASTRAL SURVEY</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Lat: <span className="text-amber-400">19.0222° N</span> &nbsp; Lon: <span className="text-amber-400">72.8561° E</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Datum: <span className="text-slate-300">WGS 84</span> &nbsp; EPSG: <span className="text-slate-300">4326</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400">LIVE FEED ACTIVE</span>
              </div>
            </div>
          </div>

          {/* ── Institution tag (top-left) ──────────────────────────── */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-black/80 backdrop-blur-sm border border-slate-600/40 rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold text-white truncate max-w-[200px]">{institution.name || 'Institution Campus'}</p>
              <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                {institution.city || 'Mumbai'}, {institution.state || 'Maharashtra'} • {institution.region || 'WRO'}
              </p>
              <p className="text-[8px] font-mono text-slate-500 mt-0.5">
                PID: {institution.permanentId || 'AICTE-WRO-2024-0042'}
              </p>
            </div>
          </div>

          {/* ── Zoom controls ───────────────────────────────────────── */}
          <div className="absolute bottom-20 right-3 z-10 flex flex-col gap-1">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 bg-black/80 backdrop-blur-sm border border-slate-600/50 rounded-md flex items-center justify-center hover:border-emerald-500/50 hover:bg-emerald-950/50 transition-all"
            >
              <ZoomIn className="w-4 h-4 text-slate-300" />
            </button>
            <div className="text-center text-[8px] font-mono text-slate-500 py-0.5">{Math.round(scale * 100)}%</div>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 bg-black/80 backdrop-blur-sm border border-slate-600/50 rounded-md flex items-center justify-center hover:border-emerald-500/50 hover:bg-emerald-950/50 transition-all"
            >
              <ZoomOut className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* ── Layer toggles (bottom of map) ───────────────────────── */}
          <div className="absolute bottom-3 left-3 right-14 z-10 flex flex-wrap items-center gap-2">
            {LAYERS.map((layer) => {
              const Icon = layer.icon;
              const active = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold transition-all border backdrop-blur-sm ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                      : 'bg-black/60 border-slate-600/40 text-slate-400 hover:border-slate-500/60 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {layer.label}
                </button>
              );
            })}

            {/* Extra toggles */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowBuffer((b) => !b)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-mono border backdrop-blur-sm transition-all ${
                  showBuffer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-black/50 border-slate-700/40 text-slate-500'
                }`}
              >
                {showBuffer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Buffer
              </button>
              <button
                onClick={() => setShowBuildings((b) => !b)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-mono border backdrop-blur-sm transition-all ${
                  showBuildings ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-black/50 border-slate-700/40 text-slate-500'
                }`}
              >
                {showBuildings ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Structures
              </button>
            </div>
          </div>
        </div>

        {/* ── Verification Status Panel ─────────────────────────────── */}
        <div className={`${compact ? 'p-4' : 'w-full lg:w-80 p-4'} bg-slate-950 border-l border-slate-800/60`}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white tracking-wider uppercase">Land Verification Status</h3>
          </div>

          {/* Check items */}
          <div className="space-y-3 mb-5">
            {[
              { label: 'Zero Public Highway Bisection', status: 'PASSED', tone: 'emerald' },
              { label: 'Zero Railway Track Bisection', status: 'PASSED', tone: 'emerald' },
              { label: 'Contiguous Single-Plot Integrity', status: '100% COMPLIANT', tone: 'emerald' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-slate-300">{item.label}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Land area */}
          <div className={`rounded-lg px-3 py-3 mb-4 border ${landPassed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-rose-500/5 border-rose-500/15'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-mono">TOTAL LAND AREA</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  landPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {landPassed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className={`text-xl font-bold font-mono ${landPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {landAcres} <span className="text-xs text-slate-500">Acres</span>
            </p>
            <p className="text-[9px] text-slate-500 mt-1">Min 2.5 Acres Required (AICTE Norm 2024-25)</p>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${landPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min((landAcres / 10) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-slate-600 font-mono">0</span>
              <span className="text-[8px] text-amber-500/60 font-mono">2.5 min</span>
              <span className="text-[8px] text-slate-600 font-mono">10 acres</span>
            </div>
          </div>

          {/* Survey reference */}
          <div className="bg-slate-900/80 border border-slate-700/40 rounded-lg px-3 py-3 mb-4">
            <p className="text-[9px] text-slate-500 font-mono mb-1.5 uppercase tracking-wider">Survey Reference</p>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Revenue Parcel <span className="text-amber-400 font-semibold">#412/A</span>, Sub-Div B
            </p>
            <p className="text-[10px] text-slate-300 leading-relaxed">Tehsildar Mutation Record</p>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              District: <span className="text-slate-200">{institution.city || 'Mumbai'}</span>
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700/40">
              <p className="text-[8px] text-slate-500 font-mono">SHA-256 HASH (SURVEY DOC)</p>
              <p className="text-[8px] text-cyan-400/70 font-mono mt-0.5 break-all">
                a3f8e2d1c9b7...4e6f0a2d8c1b
              </p>
            </div>
          </div>

          {/* GPS coordinates summary */}
          <div className="bg-slate-900/80 border border-slate-700/40 rounded-lg px-3 py-3">
            <p className="text-[9px] text-slate-500 font-mono mb-2 uppercase tracking-wider">GPS Survey Points</p>
            <div className="space-y-1">
              {SURVEY_MARKERS.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[9px] font-mono text-amber-300/80">P{i + 1}</span>
                  <span className="text-[9px] font-mono text-slate-500">{m.label.split(': ')[1]}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-emerald-400 font-mono">All {SURVEY_MARKERS.length} vertices verified via DGPS</span>
            </div>
          </div>

          {/* Timestamp footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <p className="text-[8px] text-slate-600 font-mono text-center">
              Last Satellite Pass: {new Date().toISOString().split('T')[0]} 14:32 IST
            </p>
            <p className="text-[8px] text-slate-600 font-mono text-center mt-0.5">
              Validation Engine: AICTE-GIS-v4.2 • Resolution: 0.5m/px
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
