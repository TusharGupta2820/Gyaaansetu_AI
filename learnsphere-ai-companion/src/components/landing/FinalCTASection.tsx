import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-24 bg-white px-6 md:px-12 lg:px-16">
      <div className="w-full max-w-[1800px] mx-auto bg-slate-900 text-white rounded-3xl p-10 sm:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Background Radial Accent */}
        <div className="absolute inset-0 bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-blue-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>GyaanSetu-AI Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
            Build your path. <br />
            <span className="text-blue-400">We'll help you bridge the gap.</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-xl leading-relaxed font-normal max-w-2xl mx-auto">
            Start learning with an AI experience designed around your goals, your pace, and the way you learn.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Learning Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#product-pillars"
            className="inline-flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-base px-8 py-4 rounded-2xl transition-all"
          >
            Explore GyaanSetu-AI
          </a>
        </div>

      </div>
    </section>
  );
}
