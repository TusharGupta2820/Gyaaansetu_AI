import { Bot, Compass, CheckCircle2, Award, Target } from "lucide-react";

export function ProductPillarsSection() {
  return (
    <section id="product-pillars" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-28">
        
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <span>Product Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            One AI ecosystem for your <br className="hidden sm:inline" />
            <span className="text-blue-600">entire learning journey.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            From initial concept breakdown to career milestones, GyaanSetu-AI supports every stage of learning with intelligent, adaptive tools.
          </p>
        </div>

        {/* PILLAR 01: Understand */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs sm:text-sm font-mono font-bold text-blue-600 uppercase tracking-widest">
              01 — UNDERSTAND
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-900 leading-snug">
              AI Tutor explanations that match your exact level.
            </h3>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Stuck on a tricky concept? Ask natural questions. Your GyaanSetu-AI Tutor breaks down complex formulas, code, or theories into intuitive step-by-step analogies.
            </p>
            <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-700 font-medium">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Adjusts complexity automatically from beginner to advanced</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Supports code review, visual diagram analysis, and audio notes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Multilingual support across 10+ regional languages</span>
              </div>
            </div>
          </div>

          {/* Visual Card 01 */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>Interactive Concept Resolver</span>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full">
                  Adaptive Response
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <span className="font-semibold text-slate-900">User Query:</span> "How does a database index speed up SQL queries?"
                </div>
                <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-2xl text-slate-800 space-y-2.5">
                  <div className="font-bold text-blue-900">GyaanSetu-AI Analogy:</div>
                  <p className="leading-relaxed">
                    Think of a 500-page book. Without an index, finding a word requires reading page by page. A database index is like the book's index at the back—it points directly to the exact page number!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 font-medium">
                <span>Concept Mastery Impact: +18%</span>
                <span className="text-blue-600 font-semibold">Suggested Practice Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 02: Learn */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                  <Compass className="w-5 h-5 text-blue-400" />
                  <span>Adaptive Learning Path</span>
                </div>
                <span className="text-xs bg-slate-800 text-blue-300 font-mono px-3 py-1 rounded-full">
                  Updated Today
                </span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                {[
                  { step: "01", title: "React Component Lifecycle & State", status: "Completed", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
                  { step: "02", title: "REST API Architecture & Express", status: "In Progress", color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
                  { step: "03", title: "PostgreSQL Database Normalization", status: "Upcoming", color: "bg-slate-800 border-slate-700 text-slate-400" }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between ${item.color}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs">{item.step}</span>
                      <span className="font-semibold text-white">{item.title}</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="text-xs sm:text-sm font-mono font-bold text-blue-600 uppercase tracking-widest">
              02 — LEARN
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-900 leading-snug">
              Adaptive paths that evolve with your progress.
            </h3>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Never get lost in generic course lists. GyaanSetu-AI automatically updates your daily study path based on what you have mastered and where you need reinforcement.
            </p>
            <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-700 font-medium">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Dynamic roadmap generation based on goal targets</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Consistently recalibrates module difficulty based on practice</span>
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 03: Practice */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs sm:text-sm font-mono font-bold text-blue-600 uppercase tracking-widest">
              03 — PRACTICE
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-900 leading-snug">
              Targeted exercises that eliminate weak areas.
            </h3>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Instead of repetitive tests, practice with targeted MCQs, coding challenges, and mistake analysis designed specifically to solidify your weak concepts.
            </p>
            <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-700 font-medium">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Automatic Mistake Analyzer categorizes error patterns</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Personalised remedial quizzes to prevent recurring mistakes</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Targeted Remedial Quiz</span>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full">
                  Skill Target: High
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs sm:text-sm">
                <div className="font-semibold text-slate-900">
                  Q: Which lifecycle method or hook is used for side-effects in React?
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-blue-500 bg-blue-50 text-blue-900 font-semibold flex items-center justify-between">
                    <span>A) useEffect()</span>
                    <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-md">Correct</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600">
                    B) useState()
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 04: Grow */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Career Skill Alignment</span>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full">
                  Role Target: Full Stack Dev
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Frontend Engineering (React / TS)</span>
                    <span className="text-blue-600 font-bold">88%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[88%]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Backend & Database Systems</span>
                    <span className="text-blue-600 font-bold">74%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[74%]" />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900 font-medium">
                  Recommended Project: Build a real-time collaborative note app to bridge database sync skills.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="text-xs sm:text-sm font-mono font-bold text-blue-600 uppercase tracking-widest">
              04 — GROW
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-900 leading-snug">
              Skill analytics & career guidance for real outcomes.
            </h3>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Connect your daily study progress directly with real-world industry requirements. Identify skill gaps and receive tailored project recommendations to build a standout portfolio.
            </p>
            <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-700 font-medium">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Skill radar mapping against modern industry job roles</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Resume parsing & career roadmap suggestions</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
