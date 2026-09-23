import { motion } from "framer-motion";
import { BarChart3, HeartPulse, Clock } from "lucide-react";

export function AnalyticsWellnessSection() {
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
            <HeartPulse className="w-4 h-4" />
            <span>Sustainable Learning</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Build sustainable <br className="hidden sm:inline" />
            <span className="text-blue-600">learning habits.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Learning effectively requires consistent focus and healthy study habits—not late-night cramming.
          </p>
        </motion.div>

        {/* 3 Productivity & Wellness Cards - Navy Cards on White BG */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8"
        >
          
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-8 space-y-5 shadow-lg cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-sky-900 text-sky-300 border border-sky-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-white">Focus Rooms & Pomodoro</h3>
            <p className="text-sm text-sky-200 leading-relaxed">
              Integrated focus timers with structured 25-minute study sprints and 5-minute restorative breaks.
            </p>
            <div className="p-4 bg-sky-950 border border-sky-800 rounded-2xl text-xs sm:text-sm font-semibold text-sky-200 flex justify-between">
              <span>Today's Sessions:</span>
              <span className="text-sky-400 font-bold">4 Completed (100 mins)</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-8 space-y-5 shadow-lg cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-sky-900 text-sky-300 border border-sky-700 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white">Focus Health Index</h3>
            <p className="text-sm text-sky-200 leading-relaxed">
              Monitors study intensity trends to prevent burnout and recommend optimal rest intervals.
            </p>
            <div className="p-4 bg-sky-950 border border-sky-800 rounded-2xl text-xs sm:text-sm font-semibold text-sky-200 flex justify-between">
              <span>Wellness Score:</span>
              <span className="text-emerald-400 font-bold">92 / 100 (Optimal)</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-8 space-y-5 shadow-lg cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-sky-900 text-sky-300 border border-sky-700 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-white">Retention & Progress Analytics</h3>
            <p className="text-sm text-sky-200 leading-relaxed">
              Track how effectively your memory retains concepts over time through spaced repetition reviews.
            </p>
            <div className="p-4 bg-sky-950 border border-sky-800 rounded-2xl text-xs sm:text-sm font-semibold text-sky-200 flex justify-between">
              <span>Long-Term Retention:</span>
              <span className="text-sky-400 font-bold">89% Average</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
