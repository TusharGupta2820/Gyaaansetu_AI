import { ShieldCheck, Award, Lock, FileCheck, Zap, Globe2 } from "lucide-react";

const TRUST_BADGES = [
  {
    icon: Lock,
    title: "Enterprise Data Encryption",
    desc: "100% Private & End-to-End Encrypted",
    tag: "Security First"
  },
  {
    icon: Zap,
    title: "99.99% Uptime SLA",
    desc: "Ultra-Fast Real-Time AI Inference Engine",
    tag: "High Reliability"
  },
  {
    icon: Award,
    title: "Curriculum Aligned",
    desc: "Computer Science, STEM & Business Roadmaps",
    tag: "Industry Ready"
  },
  {
    icon: ShieldCheck,
    title: "Verified Skill Badges",
    desc: "Shareable Credentials for Resumes & LinkedIn",
    tag: "Certifications"
  },
  {
    icon: FileCheck,
    title: "Full Accessibility",
    desc: "Screen Reader & Voice Assistant Enabled",
    tag: "Inclusive UI"
  },
  {
    icon: Globe2,
    title: "Any Device, Anywhere",
    desc: "Low-Bandwidth Sync for Mobile & Web",
    tag: "Seamless Access"
  }
];

export function TrustBadgesSection() {
  return (
    <section className="py-12 bg-slate-50 text-slate-900 border-b border-slate-200/80 font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
              Enterprise Security & Quality Standards
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-1">
              Built For Trust, Privacy & Scale
            </h3>
          </div>
          <div className="text-xs text-slate-600 font-medium max-w-md">
            GyaanSetu-AI combines state-of-the-art neural models with enterprise-grade data privacy and industry-aligned skill roadmaps.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {TRUST_BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-white border border-slate-200 hover:border-blue-500 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {b.tag}
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{b.title}</div>
                  <div className="text-[11px] text-slate-600 font-normal mt-1 leading-snug">{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
