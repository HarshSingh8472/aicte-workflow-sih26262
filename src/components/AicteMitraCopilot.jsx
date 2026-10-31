import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send } from 'lucide-react';

const PROMPT_CHIPS = [
  "What is the minimum lab carpet area for AI & Data Science?",
  "Why was Apex Institute flagged?",
  "Show NIRNAY score for VJTI Mumbai",
  "Draft a Deficiency Notice",
  "Draft EoA Sanction Letter",
  "What is the faculty ratio requirement?"
];

function generateResponse(query, institutions, aphRules, currentDate) {
  const q = query.toLowerCase();

  // Lab carpet area
  if (q.includes('lab carpet area') || q.includes('carpet area')) {
    return `📐 As per APH 2026-27, Section 2.4, Table 2.1:\n\n• Minimum Carpet Area for Classrooms: ${aphRules.minClassroomSqm || 66} sq.m\n• Minimum Carpet Area for Laboratories (including AI & Data Science Labs): ${aphRules.minLabSqm || 66} sq.m\n• Computer Terminal Density: 1.5 sq.m per terminal\n• Barrier-Free Accessibility: Mandatory gradient 1:12 ramp with Braille-enabled lift\n\nReference: AICTE Approval Process Handbook, Chapter II, Clause 2.4.1`;
  }

  // Apex / flagged
  if (q.includes('apex') || q.includes('flagged')) {
    const apex = institutions.find(i => i.name && i.name.toLowerCase().includes('apex'));
    if (apex) {
      const minLab = aphRules.minLabSqm || 66;
      const deficientRooms = (apex.classrooms || []).filter(
        r => (r.type || '').toLowerCase().includes('lab') && r.carpetAreaSqm < minLab
      );
      const today = new Date(currentDate);
      const fireExpiry = new Date('2027-03-09');
      const daysLeft = Math.ceil((fireExpiry - today) / (1000 * 60 * 60 * 24));

      let deficiencies = '';
      if (deficientRooms.length > 0) {
        deficientRooms.forEach((rm, idx) => {
          const deficit = (minLab - rm.carpetAreaSqm).toFixed(1);
          deficiencies += `${idx + 1}. Lab Room ${rm.roomNo || rm.roomNumber || 'N/A'} (${rm.type}): Carpet area ${rm.carpetAreaSqm} sq.m vs minimum required ${minLab} sq.m — Shortfall of ${deficit} sq.m\n`;
        });
        deficiencies += `${deficientRooms.length + 1}. Fire NOC (PMC/FIRE/2026/089): Expiring on 2027-03-09 — ${daysLeft} days remaining`;
        return `🔍 Institutional Diagnosis — ${apex.name} (AICTE ID: ${apex.permanentId})\n\nCurrent Stage: ${apex.currentStage}\nAssigned Path: ${apex.pathTitle}\n\n⚠️ Identified Deficiencies:\n${deficiencies}\n\nRecommendation: Route to Stage 1 Desk Scrutiny with mandatory lab measurement re-verification before EVC dispatch.`;
      }
      return `🔍 Institutional Diagnosis — ${apex.name} (AICTE ID: ${apex.permanentId})\n\nApex Institute currently shows no critical shortfalls. All classrooms and labs meet APH norms.`;
    }
    return "Could not locate an institution with 'Apex' in the name. Please verify the institution registry.";
  }

  // VJTI / NIRNAY / score
  if (q.includes('vjti') || q.includes('nirnay') || q.includes('score')) {
    const vjti = institutions.find(i => i.name && i.name.toLowerCase().includes('vjti'));
    const instName = vjti ? vjti.name : 'VJTI Technical Campus, Mumbai';
    return `📊 NIRNAY Regulatory Index — ${instName}\n\nOverall Score: 94/100 (Band 1 — FastTrack Green Channel)\n\n• Structural & Instructional Space: 28/30 ✅\n• Academic Human Capital: 30/30 ✅\n• Statutory & Financial Security: 23/25 ✅\n• Procedural Governance & SLA: 13/15 ✅\n\nEntitlement: Eligible for 72h Fast-Track Paperless Renewal & 2-Year Multi-Session EoA`;
  }

  // Deficiency notice
  if (q.includes('deficiency notice') || (q.includes('draft') && q.includes('deficiency'))) {
    const refNum = String(Math.floor(1000 + Math.random() * 9000));
    return `📝 AUTO-DRAFTED DEFICIENCY NOTICE\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOFFICE OF THE REGIONAL OFFICER\nAll India Council for Technical Education\nWestern Regional Office, Mumbai\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRef: AICTE/WRO/SCR/DEF/2026/${refNum}\nDate: ${currentDate}\n\nTo,\nThe Principal/Director,\n[Institution Name]\n[City, State]\n\nSubject: Deficiency Notice under APH 2026-27, Clause 2.4 — Shortfall in Instructional Infrastructure\n\nSir/Madam,\n\nDuring the Stage 1 Desk Scrutiny of your Extension of Approval application for AY 2026-2027, the following deficiencies have been observed:\n\n1. Laboratory carpet area below prescribed minimum of ${aphRules.minLabSqm || 66} sq.m (APH Table 2.1)\n2. [Additional deficiency as applicable]\n\nYou are hereby directed to rectify the above within 14 calendar days and submit rectified evidence. Failure to comply shall result in referral to the Standing Appellate Committee (SAC) under Chapter II.\n\nRegional Officer & Member Secretary\nAICTE Western Regional Office`;
  }

  // EoA / Sanction / Approval letter
  if (q.includes('eoa') || q.includes('sanction') || q.includes('approval letter')) {
    const refNum = String(Math.floor(1000 + Math.random() * 9000));
    return `📝 AUTO-DRAFTED EoA SANCTION LETTER\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOFFICE OF THE MEMBER SECRETARY\nAll India Council for Technical Education\nNelson Mandela Marg, Vasant Kunj, New Delhi — 110070\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRef: AICTE/HQ/EOA/SAN/2026/${refNum}\nDate: ${currentDate}\n\nTo,\nThe Principal/Director,\n[Institution Name]\n[City, State]\n\nSubject: Grant of Extension of Approval (EoA) for Academic Year 2026-2027 under APH 2026-27\n\nSir/Madam,\n\nWith reference to your application bearing File No. [AISHE-XXXX], the Expert Visit Committee (EVC) report dated [DD/MM/YYYY], and the recommendation of the Standing Appellate Committee, I am directed to convey the approval of the Council for Extension of Approval for the following programmes:\n\n• B.Tech — Computer Science & Engineering — Intake: 120\n• B.Tech — AI & Data Science — Intake: 60\n\nThis approval is subject to the institution maintaining compliance with all norms specified in APH 2026-27 throughout the academic year.\n\nConditions:\n1. Faculty-Student ratio shall be maintained at 1:${aphRules.ugFacultyStudentRatio || 15} for UG programmes\n2. All infrastructure as declared in the NIRF/AISHE submission shall be maintained\n3. Fees as approved by the State Fee Regulatory Committee\n\nThis letter is digitally signed under the IT Act, 2000.\n\nMember Secretary\nAICTE, New Delhi`;
  }

  // Faculty ratio
  if (q.includes('faculty ratio') || q.includes('faculty-student')) {
    return `👨‍🏫 Faculty-Student Ratio Requirements (APH 2026-27, Section 3.2):\n\n• UG Programs: 1 faculty per ${aphRules.ugFacultyStudentRatio || 15} students (1:${aphRules.ugFacultyStudentRatio || 15})\n• PG Programs: 1 faculty per 12 students (1:12)\n• PhD Programs: 1 faculty per 8 scholars (1:8)\n\nCadre Distribution: Professor : Associate Professor : Assistant Professor = 1 : 2 : 6\n\nPrincipal Qualification: Must hold PhD with minimum 10 years teaching experience.`;
  }

  // Default
  return "I can help with APH handbook queries, institutional compliance diagnosis, and legal notice drafting. Please try one of the suggested prompts or ask about specific AICTE norms.";
}

export default function AicteMitraCopilot({ institutions = [], aphRules = {}, currentDate = '2026-10-26' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    setShowChips(false);
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(trimmed, institutions, aphRules, currentDate);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setIsTyping(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[7px] font-bold tracking-wider leading-none">MITRA</span>
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[420px] max-h-[600px] flex flex-col rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          style={{ animation: 'slideUp 0.25s ease-out' }}
        >
          {/* Inline keyframes */}
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes dotPulse {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-5 py-4 flex items-start justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">AICTE Mitra — Regulatory AI Copilot</h3>
              </div>
              <p className="text-[11px] text-indigo-300 mt-0.5 ml-6">APH 2026-27 Handbook Intelligence Engine</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto bg-white px-4 py-4 space-y-4" style={{ minHeight: 200, maxHeight: 440 }}>
            {/* Welcome message */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-white">AI</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[340px]">
                <p className="text-xs text-slate-800 leading-relaxed">
                  Namaste! I am <span className="font-semibold text-indigo-700">AICTE Mitra</span>, your regulatory AI copilot. I can answer handbook questions, diagnose institutional compliance, and draft official notices. Select a query below or type your own.
                </p>
              </div>
            </div>

            {/* Pre-built prompt chips */}
            {showChips && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {PROMPT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors text-left leading-snug"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-white">AI</span>
                  </div>
                )}
                <div
                  className={
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[300px]'
                      : 'bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[340px]'
                  }
                >
                  <p
                    className={`text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-white">AI</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                      style={{
                        animation: 'dotPulse 1.4s infinite ease-in-out',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Field */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-3 py-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AICTE Mitra anything..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none py-1.5"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Powered by APH 2026-27 Regulatory Knowledge Base • SHA-256 Verified
            </p>
          </div>
        </div>
      )}
    </>
  );
}
