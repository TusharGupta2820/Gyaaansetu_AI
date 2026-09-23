import { Compass, Globe, Zap, Target, ShieldCheck, Heart } from "lucide-react";

const PRINCIPLES = [
  {
    title: "Personalised",
    desc: "Designed around your unique goals, background knowledge, and individual learning pace.",
    icon: Compass
  },
  {
    title: "Accessible",
    desc: "Runs smoothly on consumer hardware and low-bandwidth connections without requiring expensive cloud GPUs.",
    icon: ShieldCheck
  },
  {
    title: "Multilingual",
    desc: "Explains complex technical and scientific concepts across 10+ regional languages.",
    icon: Globe
  },
  {
    title: "Adaptive",
    desc: "Continuously recalibrates your learning path based on your real practice performance.",
    icon: Zap
  },
  {
    title: "Outcome-Focused",
    desc: "Directly bridges daily study modules to real-world career capabilities and portfolio projects.",
    icon: Target
  }
];

export function BrandPrinciplesSection() {
  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>Product Principles</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Built around <span className="text-blue-600">the learner.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Our engineering decisions are guided by five core principles to ensure learning remains human, adaptive, and practical.
          </p>
        </div>

        {/* 5 Principles Grid - Navy Cards on Light BG */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {PRINCIPLES.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-6 lg:p-8 space-y-4 hover:shadow-xl hover:border-sky-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-sky-900 text-sky-300 flex items-center justify-center border border-sky-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-sky-200 font-normal leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
