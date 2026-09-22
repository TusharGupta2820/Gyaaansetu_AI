import { useState, useEffect } from "react";
import { Bell, ShieldCheck } from "lucide-react";

const ANNOUNCEMENTS = [
  "📢 Circular 2026/09: National Free AI Tutoring & Vernacular Voice Modules active across 28 States & UTs.",
  "📜 Official Notice: DigiLocker integration complete for instantly verifiable skill certificates & academic transcripts.",
  "🌐 Rural Education Mission: Low-Bandwidth Offline Sync Hub now active for Tier-3 & rural institutions.",
  "🔒 Security Advisory: STQC Security Audited & ISO 27001 Data Privacy Standard Compliant."
];

export function GovtTickerBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#f0f4f9] text-[#0b1530] border-b border-blue-900/10 py-2 px-4 sm:px-8 text-xs font-sans relative z-40 shadow-sm">
      <div className="w-full max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Announcement Label & Ticker Item */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1530] text-amber-300 font-bold tracking-wide uppercase text-[11px] border border-blue-900/30 shrink-0 shadow-xs">
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Official Announcements</span>
          </div>

          <div className="overflow-hidden relative h-5 flex-1 min-w-0">
            <div
              key={currentIndex}
              className="text-[#0b1530] font-semibold truncate animate-fadeIn flex items-center gap-2"
            >
              <span>{ANNOUNCEMENTS[currentIndex]}</span>
            </div>
          </div>
        </div>

        {/* Right: Govt Verification & Quick Access Tag */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Public Sector Portal</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500 font-medium">Ref: GOI-ED-AI-2026</span>
        </div>

      </div>
    </div>
  );
}
