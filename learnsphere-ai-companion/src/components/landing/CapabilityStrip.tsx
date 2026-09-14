import { Bot, Compass, Globe, Mic, BarChart3, Target } from "lucide-react";

const CAPABILITIES = [
  { label: "AI Tutor", desc: "Real-time concept explanations", icon: Bot },
  { label: "Personalised Paths", desc: "Adaptive step-by-step roadmaps", icon: Compass },
  { label: "Multilingual Learning", desc: "10+ regional & global languages", icon: Globe },
  { label: "Voice Learning", desc: "Interactive speech & TTS", icon: Mic },
  { label: "Skill Analytics", desc: "Real-time mastery radar", icon: BarChart3 },
  { label: "Career Guidance", desc: "Skill gap to job alignment", icon: Target }
];

export function CapabilityStrip() {
  return (
    <section className="py-12 bg-slate-900 text-white border-y border-slate-800">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-100">{cap.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">{cap.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
