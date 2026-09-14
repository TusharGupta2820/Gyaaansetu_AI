import { LayoutDashboard, Zap } from "lucide-react";

export function DashboardPreviewSection() {
  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <LayoutDashboard className="w-4 h-4" />
            <span>Product Ecosystem Preview</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Your dashboard shouldn't just show data. <br className="hidden sm:inline" />
            <span className="text-blue-600">It should tell you what to do next.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            GyaanSetu-AI analyzes your activity to pinpoint weak concepts, highlight mastery, and guide your next study session.
          </p>
        </div>

        {/* Realistic Dashboard Card Mockup */}
        <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-2xl space-y-8">
          
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                GS
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Student Intelligence Command Center</div>
                <div className="text-xs text-slate-500 font-medium">Demo Data View • Updated Real-time</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
              <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Streak: 7 Days
              </span>
            </div>
          </div>

          {/* Metric Widgets Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-slate-500">Knowledge Mastery</div>
              <div className="text-3xl font-bold text-slate-900 font-display">84%</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-600 h-full w-[84%]" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-slate-500">Weekly Study Hours</div>
              <div className="text-3xl font-bold text-slate-900 font-display">14.5h</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">+2.1h vs last week</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-slate-500">Active Skill Radar</div>
              <div className="text-3xl font-bold text-slate-900 font-display">12 Skills</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">4 Skills Mastered</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-slate-500">Focus Health Index</div>
              <div className="text-3xl font-bold text-slate-900 font-display">92/100</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Optimal Balance</div>
            </div>
          </div>

          {/* Actionable Guidance Card */}
          <div className="bg-blue-50 border border-blue-200/80 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wider font-mono">
                  RECOMMENDED NEXT ACTION:
                </div>
                <div className="text-base font-semibold text-slate-900">
                  Review "Recursion & Async Callbacks" (Identified Weak Area)
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  A quick 10-minute quiz will boost your concept mastery from 72% to 85%.
                </div>
              </div>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors whitespace-nowrap">
              Start Recommended Quiz
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
