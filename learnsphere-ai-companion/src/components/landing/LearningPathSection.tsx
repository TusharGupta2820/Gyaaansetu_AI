import { Compass, CheckCircle2, Circle, Clock } from "lucide-react";

const STEPS = [
  { step: "01", title: "Your Goal", desc: "Select target career or exam target" },
  { step: "02", title: "Understand Level", desc: "AI evaluates baseline knowledge" },
  { step: "03", title: "Personalise", desc: "Generate custom step-by-step roadmap" },
  { step: "04", title: "Learn", desc: "Study adaptive modules with AI Tutor" },
  { step: "05", title: "Practice", desc: "Target weak areas with quizzes" },
  { step: "06", title: "Master", desc: "Achieve skill mastery & portfolio ready" }
];

export function LearningPathSection() {
  return (
    <section id="learning-path" className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <Compass className="w-4 h-4" />
            <span>Structured Progression</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            From where you are to <br className="hidden sm:inline" />
            <span className="text-blue-600">where you want to be.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            A clear 6-step evolution that transforms your learning goals into a structured, adaptable pathway.
          </p>
        </div>

        {/* 6 Step Horizontal Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-mono font-bold text-blue-600">
                STEP {s.step}
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-900">{s.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sample Personalised Roadmap Card */}
        <div className="max-w-6xl mx-auto bg-slate-900 text-white rounded-3xl p-8 lg:p-10 border border-slate-800 shadow-2xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="text-xs font-mono text-blue-400 uppercase font-semibold">Live Personalised Roadmap</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Target: Full Stack Web Developer</h3>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
              <span className="bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full border border-slate-700">
                Current Level: Intermediate
              </span>
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold">
                Overall Progress: 64%
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-xs sm:text-sm">
            {/* This Week */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-blue-300 uppercase tracking-wider text-xs">
                THIS WEEK'S MILESTONES
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="line-through text-slate-400">React State Management</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-semibold">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>REST API & Express Routing</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 font-normal">
                  <Circle className="w-4 h-4 shrink-0" />
                  <span>PostgreSQL Database Design</span>
                </div>
              </div>
            </div>

            {/* Next Week */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-blue-300 uppercase tracking-wider text-xs">
                NEXT WEEK
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                  <Circle className="w-4 h-4 shrink-0" />
                  <span>JWT Auth & Security</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                  <Circle className="w-4 h-4 shrink-0" />
                  <span>Docker Container Basics</span>
                </div>
              </div>
            </div>

            {/* Final Target */}
            <div className="bg-blue-950 border border-blue-800 p-5 rounded-2xl space-y-3">
              <div className="font-bold text-blue-300 uppercase tracking-wider text-xs">
                CAPSTONE PROJECT
              </div>
              <div className="text-white font-semibold leading-snug">
                Production E-Commerce Platform with Stripe & AI Tutor
              </div>
              <div className="text-xs text-blue-200">
                Ready for portfolio & job applications
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
