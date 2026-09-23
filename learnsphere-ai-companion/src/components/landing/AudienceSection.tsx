import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Users, Building2, CheckCircle2 } from "lucide-react";

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Build stronger foundations, prepare for exams, and develop skills for your future.",
    highlights: ["Personalised exam preparation", "Step-by-step concept explanations", "Interactive practice & instant feedback"]
  },
  {
    icon: Briefcase,
    title: "Professionals",
    description: "Build relevant skills and stay ahead in a changing job market.",
    highlights: ["Career roadmap gap analysis", "Targeted industry project recommendations", "Flexible self-paced learning"]
  },
  {
    icon: Users,
    title: "Educators",
    description: "Understand learner progress and spend more time on meaningful mentorship.",
    highlights: ["Cohort progress analytics", "Automated drill generation", "Deep insight into student struggle points"]
  },
  {
    icon: Building2,
    title: "Institutions",
    description: "Bring personalised AI learning to your entire student ecosystem.",
    highlights: ["Scale individualized learning", "Offline & low-bandwidth deployment", "Custom curriculum integration"]
  }
];

export function AudienceSection() {
  return (
    <section id="audiences" className="py-24 bg-slate-50 border-b border-slate-200/80 font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <Users className="w-4 h-4" />
            <span>Solutions for Everyone</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Designed for <br className="hidden sm:inline" />
            <span className="text-blue-600">every learner & educator.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Whether you are preparing for your first tech role, upskilling in your career, or mentoring an entire university cohort.
          </p>
        </motion.div>

        {/* 4 Audience Cards - Navy Cards on Light BG */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {AUDIENCES.map((aud, i) => {
            const Icon = aud.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-sky-400 transition-all cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-sky-900 border border-sky-700 text-sky-300 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">{aud.title}</h3>
                  <p className="text-sm text-sky-200 leading-relaxed font-normal">{aud.description}</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-sky-900/60 text-xs sm:text-sm text-sky-100 font-medium">
                  {aud.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
