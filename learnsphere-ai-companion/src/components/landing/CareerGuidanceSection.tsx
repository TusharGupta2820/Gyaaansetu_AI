import { Target, CheckCircle2, Clock, Circle } from "lucide-react";

export function CareerGuidanceSection() {
  return (
    <section id="career-guidance" className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <Target className="w-4 h-4" />
            <span>Career Alignment</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Turn learning into <br className="hidden sm:inline" />
            <span className="text-blue-600">opportunity.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            GyaanSetu-AI bridges the gap between what you learn today and the skills required for high-impact roles tomorrow.
          </p>
        </div>

        {/* Career Progression Flow Card - Navy Card on White BG */}
        <div className="max-w-6xl mx-auto bg-[#0b1530] text-white rounded-3xl p-8 lg:p-10 border border-sky-400/30 shadow-2xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-900/60 pb-5">
            <div>
              <div className="text-xs font-mono text-sky-400 font-semibold uppercase">Skill Gap Analyzer</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1">Target Role: AI / LLM Engineer</div>
            </div>
            <div className="bg-sky-500 text-slate-950 text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full">
              Match Score: 78%
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 text-xs sm:text-sm">
            
            {/* Step 1: Current Skills */}
            <div className="bg-sky-950/80 border border-sky-800/80 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-emerald-400 uppercase tracking-wider text-xs font-mono">
                01 — CURRENT SKILLS
              </div>
              <div className="space-y-2 font-medium">
                <div className="flex items-center gap-2.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Python Fundamentals</span>
                </div>
                <div className="flex items-center gap-2.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Machine Learning Basics</span>
                </div>
              </div>
            </div>

            {/* Step 2: Skill Gaps */}
            <div className="bg-sky-950/80 border border-sky-800/80 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">
                02 — SKILL GAPS
              </div>
              <div className="space-y-2 font-medium">
                <div className="flex items-center gap-2.5 text-sky-200">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Deep Learning (In Progress)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sky-300">
                  <Circle className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>LLM Fine-tuning & RAG</span>
                </div>
              </div>
            </div>

            {/* Step 3: Recommended Learning */}
            <div className="bg-sky-950/80 border border-sky-800/80 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-sky-400 uppercase tracking-wider text-xs font-mono">
                03 — RECOMMENDED
              </div>
              <div className="space-y-2 font-medium text-sky-200">
                <div>• Vector Databases (ChromaDB)</div>
                <div>• Retrieval-Augmented Generation</div>
                <div>• Model Evaluation</div>
              </div>
            </div>

            {/* Step 4: Outcome Project */}
            <div className="bg-sky-900/60 border border-sky-700/60 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-sky-300 uppercase tracking-wider text-xs font-mono">
                04 — PORTFOLIO PROJECT
              </div>
              <div className="text-white font-semibold leading-snug">
                Deploy Offline RAG Document Assistant
              </div>
              <div className="text-xs text-sky-200">
                Demonstrates end-to-end LLM engineering
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
