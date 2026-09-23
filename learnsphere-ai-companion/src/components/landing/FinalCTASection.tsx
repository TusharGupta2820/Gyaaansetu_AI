import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCTASection() {
  return (
    <section className="py-24 bg-white px-6 md:px-12 lg:px-16 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1800px] mx-auto bg-[#0b1530] text-white rounded-3xl p-10 sm:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl border border-sky-400/30"
      >
        
        {/* Background Radial Accent */}
        <div className="absolute inset-0 bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>GyaanSetu-AI Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
            Build your path. <br />
            <span className="text-sky-400">We'll help you bridge the gap.</span>
          </h2>

          <p className="text-sky-200 text-base sm:text-xl leading-relaxed font-normal max-w-2xl mx-auto">
            Start learning with an AI experience designed around your goals, your pace, and the way you learn.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="inline-flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Learning Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#product-pillars"
            className="inline-flex items-center gap-2.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 font-semibold text-base px-8 py-4 rounded-2xl transition-all"
          >
            Explore GyaanSetu-AI
          </a>
        </div>

      </motion.div>
    </section>
  );
}
