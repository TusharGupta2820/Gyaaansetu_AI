import { ShieldAlert, Sparkles } from "lucide-react";

export function ProblemStorySection() {
  return (
    <section className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <span>The GyaanSetu Story</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Learning shouldn't be <br className="hidden sm:inline" />
            <span className="text-blue-600">one-size-fits-all.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Every learner starts from a different background, learns at a different pace, and requires explanations tailored to their unique way of thinking.
          </p>
        </div>

        {/* Story Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Traditional One-Size-Fits-All */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-12 space-y-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">Traditional One-Size Learning</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Delivers identical lectures and rigid static curricula to thousands of students at once—regardless of prior knowledge, pace, or individual learning gaps.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200 text-xs sm:text-sm font-medium text-slate-600">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>Fixed rigid timelines with no room for concept review</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>Generic explanations that cause student frustration</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>No connection between course topics and individual career goals</span>
              </div>
            </div>
          </div>

          {/* GyaanSetu-AI Adaptive Bridge */}
          <div className="bg-blue-950 text-white border border-blue-900 rounded-3xl p-8 lg:p-12 space-y-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">GyaanSetu-AI Adaptive Experience</h3>
              <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed font-normal">
                Continuously learns about your pace, identifies specific concept gaps, and crafts a personal bridge between your current understanding and your ultimate goals.
              </p>
            </div>

            {/* The Setu (Bridge) Evolution Line */}
            <div className="space-y-4 pt-6 border-t border-blue-800/80 relative z-10">
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider font-mono">
                The GyaanSetu Connection:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs sm:text-sm font-semibold">
                <div className="bg-blue-900/60 border border-blue-700/60 py-3 px-2 rounded-2xl text-blue-100">
                  Knowledge
                </div>
                <div className="bg-blue-900/60 border border-blue-700/60 py-3 px-2 rounded-2xl text-blue-100">
                  Understanding
                </div>
                <div className="bg-blue-900/60 border border-blue-700/60 py-3 px-2 rounded-2xl text-blue-100">
                  Skills
                </div>
                <div className="bg-blue-600 text-white py-3 px-2 rounded-2xl font-bold shadow-sm">
                  Opportunity
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
