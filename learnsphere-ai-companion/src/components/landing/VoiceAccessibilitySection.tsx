import { motion } from "framer-motion";
import { Mic, Volume2, Accessibility, CheckCircle2 } from "lucide-react";

export function VoiceAccessibilitySection() {
  return (
    <section className="py-24 bg-white border-b border-slate-200/80 font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-4"
        >
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
        </motion.div>

        {/* 4 Step Voice Flow - Navy Cards on White BG */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {[
            { step: "01", label: "Speak", desc: "Ask questions using your natural voice", icon: Mic },
            { step: "02", label: "Understand", desc: "Whisper STT converts speech to structured prompt", icon: Accessibility },
            { step: "03", label: "Learn", desc: "AI generates personalized audio & text response", icon: Volume2 },
            { step: "04", label: "Practice", desc: "Respond via voice to verify your understanding", icon: CheckCircle2 }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-[#0b1530] text-white border border-sky-400/30 p-6 rounded-2xl space-y-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">STEP {item.step}</span>
                  <Icon className="w-5 h-5 text-sky-300" />
                </div>
                <h4 className="font-display font-bold text-lg text-white">{item.label}</h4>
                <p className="text-xs sm:text-sm text-sky-200 font-normal leading-snug">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
