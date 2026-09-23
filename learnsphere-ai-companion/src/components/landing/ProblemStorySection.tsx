import { motion } from "framer-motion";
import { ShieldAlert, Sparkles, Zap } from "lucide-react";

export function ProblemStorySection() {
  return (
    <section className="py-20 bg-white text-slate-900 border-b border-slate-200/80 font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Why GyaanSetu AI?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Stop struggling with boring static lectures. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learn faster with 1-on-1 AI tutoring.
            </span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal max-w-3xl mx-auto">
            Traditional learning treats everyone identically with long videos and rigid schedules. GyaanSetu-AI crafts a personalized bridge tailored to your exact pace and goals.
          </p>
        </motion.div>

        {/* Story Comparison Grid - Navy Cards on White BG */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch"
        >
          
          {/* Legacy Traditional System - Navy Blue Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-8 lg:p-12 space-y-8 flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-5">
              <div className="h-12 w-12 rounded-2xl bg-amber-950/80 text-amber-300 flex items-center justify-center border border-amber-800 shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">The Traditional Way</span>
                <h3 className="text-2xl font-display font-bold text-white mt-1">One-Size-Fits-All Lectures</h3>
              </div>
              <p className="text-sky-200 text-sm sm:text-base leading-relaxed">
                Passive 2-hour video lectures with no instant feedback, rigid timelines, and zero support when you get stuck on a concept.
              </p>
            </div>

            <div className="space-y-3.5 pt-6 border-t border-sky-900/60 text-xs sm:text-sm font-semibold text-sky-100">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>No instant answers when you have a question</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>Language barriers causing frustration</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>No alignment between coursework and real tech jobs</span>
              </div>
            </div>
          </motion.div>

          {/* GyaanSetu-AI Modern Platform - Navy Blue Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#081026] text-white border border-sky-400/40 rounded-3xl p-8 lg:p-12 space-y-8 flex flex-col justify-between shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">The GyaanSetu AI Way</span>
                <h3 className="text-2xl font-display font-bold text-white mt-1">Adaptive 1-on-1 AI Tutor Companion</h3>
              </div>
              <p className="text-sky-200 text-sm sm:text-base leading-relaxed font-normal">
                Identifies your exact conceptual gaps, breaks down complex topics step-by-step in 22+ languages, and adapts practice exercises in real time.
              </p>
            </div>

            {/* Setu Evolution Line */}
            <div className="space-y-4 pt-6 border-t border-sky-900/80 relative z-10">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Your Accelerated Path To Mastery:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs sm:text-sm font-semibold">
                <div className="bg-sky-950 border border-sky-800 py-3 px-2 rounded-xl text-sky-200">
                  1. Diagnose
                </div>
                <div className="bg-sky-950 border border-sky-800 py-3 px-2 rounded-xl text-sky-200">
                  2. Learn 1-on-1
                </div>
                <div className="bg-sky-950 border border-sky-800 py-3 px-2 rounded-xl text-sky-200">
                  3. Practice
                </div>
                <div className="bg-sky-500 text-slate-950 py-3 px-2 rounded-xl font-extrabold shadow-md">
                  4. Master
                </div>
              </div>
            </div>

          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
