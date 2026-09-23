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
    <section className="py-10 bg-[#0b1530] text-white border-y border-blue-900/50 font-sans shadow-lg">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-blue-900/50">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-mono font-extrabold text-sky-300 uppercase tracking-widest">
              Core Platform Features
            </span>
          </div>
          <div className="text-xs text-sky-200 font-semibold">
            Designed for High-Speed Learning & Maximum Retention
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-sky-200 hover:border-sky-400 transition-all shadow-md hover:shadow-lg group"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-sky-900 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-full">
                    {cap.tag}
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-sky-950 group-hover:text-sky-700 transition-colors">{cap.label}</div>
                  <div className="text-[11px] text-sky-800 font-medium leading-tight mt-1">{cap.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
