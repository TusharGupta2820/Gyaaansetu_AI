import { BarChart3, HeartPulse, Clock } from "lucide-react";

export function AnalyticsWellnessSection() {
  return (
    <section className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
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
        </div>

        {/* 3 Productivity & Wellness Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">Focus Rooms & Pomodoro</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Integrated focus timers with structured 25-minute study sprints and 5-minute restorative breaks.
            </p>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 flex justify-between">
              <span>Today's Sessions:</span>
              <span className="text-blue-600">4 Completed (100 mins)</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">Focus Health Index</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monitors study intensity trends to prevent burnout and recommend optimal rest intervals.
            </p>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 flex justify-between">
              <span>Wellness Score:</span>
              <span className="text-emerald-600">92 / 100 (Optimal)</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">Retention & Progress Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track how effectively your memory retains concepts over time through spaced repetition reviews.
            </p>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 flex justify-between">
              <span>Long-Term Retention:</span>
              <span className="text-indigo-600">89% Average</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
