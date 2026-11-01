import React from 'react';
import { CheckCircle2, Wifi, Shield } from 'lucide-react';

/**
 * API Integration Status Pills — Spot-Stealer #4
 * Shows small colored pills next to data sections indicating verified government API sources.
 */

const INTEGRATIONS = {
  land: {
    label: 'ISRO Bhuvan / State BhuNaksha GIS API',
    icon: '🛰️',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  digilocker: {
    label: 'DigiLocker API',
    icon: '🔐',
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  pfms: {
    label: 'PFMS / CBS Bank Guarantee API',
    icon: '🏦',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  faculty: {
    label: 'AICTE Faculty ID + PAN/Aadhaar Deduplication',
    icon: '👤',
    color: 'bg-violet-50 text-violet-800 border-violet-200'
  },
  fire: {
    label: 'State Fire Services NOC Registry',
    icon: '🔥',
    color: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  municipal: {
    label: 'Municipal Corporation Blueprint Registry',
    icon: '🏛️',
    color: 'bg-slate-50 text-slate-800 border-slate-200'
  }
};

export function ApiPill({ type, compact = false }) {
  const config = INTEGRATIONS[type];
  if (!config) return null;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${config.color}`}>
        <Wifi className="w-2.5 h-2.5" />
        <span>Connected</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.color}`}>
      <span>{config.icon}</span>
      <span>Connected: {config.label}</span>
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
    </span>
  );
}

/**
 * Renders a row of API integration status badges for a given section.
 */
export function ApiIntegrationStrip({ types = [], className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Shield className="w-3 h-3 text-slate-400" />
      <span className="text-[10px] font-semibold text-slate-500 mr-0.5">Verified via:</span>
      {types.map(type => (
        <ApiPill key={type} type={type} />
      ))}
    </div>
  );
}

export default ApiIntegrationStrip;

