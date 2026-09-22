import { Bot, Compass, Globe, Mic, BarChart3, Target, ShieldCheck, Zap } from "lucide-react";

const CAPABILITIES = [
  { label: "Autonomous AI Tutor", desc: "Step-by-step interactive answers", icon: Bot, tag: "24/7 AI" },
  { label: "Adaptive Skill Radar", desc: "Custom-tailored learning roadmaps", icon: Compass, tag: "Personalized" },
  { label: "22+ Vernacular Languages", desc: "Native language translation", icon: Globe, tag: "Global & Regional" },
  { label: "Voice Learning Engine", desc: "Hands-free speech & TTS interaction", icon: Mic, tag: "Voice Ready" },
  { label: "Practice Vault", desc: "AI-generated practice quizzes", icon: Zap, tag: "Gamified" },
  { label: "Shareable Skill Badges", desc: "Exportable mastery certificates", icon: Target, tag: "Verified" }
];

export function CapabilityStrip() {
  return (
    <section className="py-10 bg-slate-900 text-white border-y border-slate-800 font-sans shadow-md">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              Core Platform Features
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Designed for High-Speed Learning & Maximum Retention
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/80 transition-all hover:bg-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-blue-300 bg-blue-950/80 border border-blue-800 px-1.5 py-0.5 rounded-full">
                    {cap.tag}
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-100">{cap.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight mt-1">{cap.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
