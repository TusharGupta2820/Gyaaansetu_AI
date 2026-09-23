import { motion } from "framer-motion";
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
        
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
        >
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
        </motion.div>

        {/* 6 Trust Cards - Navy Cards on Light BG */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {TRUST_BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#0b1530] text-white border border-sky-400/30 hover:border-sky-400 p-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-900 text-sky-300 border border-sky-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded-full">
                    {b.tag}
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">{b.title}</div>
                  <div className="text-[11px] text-sky-200 font-normal mt-1 leading-snug">{b.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
