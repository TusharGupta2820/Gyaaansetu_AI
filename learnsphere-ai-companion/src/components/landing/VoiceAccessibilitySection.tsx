import { Mic, Volume2, Accessibility, CheckCircle2 } from "lucide-react";

export function VoiceAccessibilitySection() {
  return (
    <section className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <Mic className="w-4 h-4" />
            <span>Voice & Inclusive Design</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Learn naturally through <br className="hidden sm:inline" />
            <span className="text-blue-600">voice & accessible design.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Speak your questions aloud, listen to natural audio explanations, and learn comfortably on any device.
          </p>
        </div>

        {/* 4 Step Voice Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { step: "01", label: "Speak", desc: "Ask questions using your natural voice", icon: Mic },
            { step: "02", label: "Understand", desc: "Whisper STT converts speech to structured prompt", icon: Accessibility },
            { step: "03", label: "Learn", desc: "AI generates personalized audio & text response", icon: Volume2 },
            { step: "04", label: "Practice", desc: "Respond via voice to verify your understanding", icon: CheckCircle2 }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600">STEP {item.step}</span>
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <h4 className="font-display font-bold text-lg text-slate-900">{item.label}</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-snug">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
