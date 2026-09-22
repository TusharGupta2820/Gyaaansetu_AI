import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, Volume2, Globe, CheckCircle2, ChevronRight, BookOpen,
  GraduationCap, Users, WifiOff, Award, Sparkles, Zap, Shield, Target
} from "lucide-react";

const HERO_PROMPTS = [
  {
    id: "recursion",
    label: "Explain recursion simply",
    question: "Explain recursion like I'm a beginner preparing for coding interviews.",
    answer: "Think of recursion like standing between two parallel mirrors—you see an infinite sequence of smaller versions of yourself. In code, a recursive function calls itself to solve a smaller piece of the problem, until it hits a base condition and stops.",
    suggestedNext: "Show a quick Python factorial example",
    language: "English"
  },
  {
    id: "hindi-photo",
    label: "Photosynthesis in Hindi",
    question: "प्रकाश संश्लेषण (Photosynthesis) को सरल हिंदी में समझाएं।",
    answer: "प्रकाश संश्लेषण वह प्रक्रिया है जिसमें हरे पौधे सूर्य के प्रकाश, जल और कार्बन डाइऑक्साइड का उपयोग करके भोजन (ग्लूकोज) तैयार करते हैं और ऑक्सीजन छोड़ते हैं। यह प्रक्रिया क्लोरोफिल में होती है।",
    suggestedNext: "पौधे रात में श्वसन प्रक्रिया कैसे करते हैं?",
    language: "हिन्दी (Hindi)"
  },
  {
    id: "career-roadmap",
    label: "Full-Stack AI Roadmap 2026",
    question: "What core skills should I learn to become a Full-Stack AI Engineer?",
    answer: "Focus on 4 core pillars: 1) TypeScript & React UI Frameworks, 2) Python FastAPI & Async Services, 3) Vector Databases & LLM Prompting, and 4) System Design & Cloud Deployment.",
    suggestedNext: "How does GyaanSetu track my skill mastery?",
    language: "English"
  }
];

export function HeroSection() {
  const [activePrompt, setActivePrompt] = useState(HERO_PROMPTS[0]);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    let index = 0;
    setIsTyping(true);
    setDisplayText("");

    const interval = setInterval(() => {
      if (index < activePrompt.answer.length) {
        setDisplayText(prev => prev + activePrompt.answer.charAt(index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [activePrompt]);

  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-gradient-to-b from-blue-50/40 via-white to-slate-50 text-slate-900 overflow-hidden font-sans border-b border-slate-200/80">
      
      {/* Full Cover Hero Background Logo Image (Bold & High Opacity) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center">
        <img
          src="/Gyaansetu AI logo.png"
          alt="GyaanSetu AI Background Cover"
          className="w-full h-full object-contain object-center opacity-85 filter contrast-125 brightness-95"
        />
        {/* Subtle translucent mask allowing the bold logo to pop while ensuring text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/40 to-transparent backdrop-blur-[0.5px]" />
      </div>

      {/* Soft Background Accent Glows */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-96 pointer-events-none opacity-20 blur-3xl z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-400/30" />
        <div className="absolute top-12 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-300/20" />
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* Main Hero Split Layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: SaaS Value Proposition & CTAs (Glass Container for 100% Readability) */}
          <div className="lg:col-span-6 space-y-7 text-left bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
            
            {/* SaaS Eyebrow Pill with Logo */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs"
            >
              <img
                src="/Gyaansetu AI logo.png"
                alt="GyaanSetu AI Logo"
                className="w-5 h-5 object-contain rounded-md bg-white p-0.5 border border-blue-200"
              />
              <span>Next-Gen Personalised AI Learning</span>
              <span className="text-blue-300">•</span>
              <span className="text-slate-600 font-medium">Loved by 100,000+ Students</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.12]"
            >
              Learning that <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                adapts to your brain.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal"
            >
              GyaanSetu-AI brings 1-on-1 intelligent tutoring, step-by-step adaptive roadmaps, 22+ regional languages, and real-time skill analytics together into one seamless learning experience.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-base px-8 py-4 rounded-2xl transition-all shadow-xs"
              >
                Explore Features
              </a>
            </motion.div>

            {/* Capability Badges Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-slate-200/80 text-xs font-semibold text-slate-600 flex flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-1.5 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>24/7 AI Tutor</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>22+ Languages</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No Credit Card Required</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Interactive AI Tutor Workspace */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden text-slate-800 font-sans">
              
              {/* Interactive Window Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src="/Gyaansetu AI logo.png"
                    alt="GyaanSetu AI"
                    className="h-9 w-9 object-contain rounded-xl bg-white p-0.5 shadow-sm border border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-bold leading-tight flex items-center gap-2">
                      <span>GyaanSetu AI Companion</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-300 font-medium">Personalized Tutor • Ready</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                      isVoiceActive
                        ? "bg-blue-600 text-white border-blue-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isVoiceActive ? "Voice On" : "Voice Off"}
                  </button>
                </div>
              </div>

              {/* Sample Prompts Ticker */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80 flex items-center gap-2.5 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 font-mono">
                  Try Prompt:
                </span>
                {HERO_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePrompt(p)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      activePrompt.id === p.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Canvas Output */}
              <div className="p-6 space-y-5 min-h-[320px] max-h-[380px] overflow-y-auto font-sans text-sm bg-slate-50/50">
                
                {/* User Prompt */}
                <div className="flex items-start justify-end gap-3">
                  <div className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[85%] font-medium shadow-sm leading-relaxed">
                    {activePrompt.question}
                  </div>
                </div>

                {/* AI Assistant Answer */}
                <div className="flex items-start gap-3.5 pt-1">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none max-w-[90%] space-y-3.5 shadow-sm">
                    <div className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                      {displayText}
                      {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />}
                    </div>

                    {!isTyping && (
                      <div className="pt-3.5 border-t border-slate-100 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Suggested Next Topic:</span>
                        </div>
                        <button
                          onClick={() => {
                            setActivePrompt({
                              id: "followup",
                              label: "Follow-up",
                              question: activePrompt.suggestedNext,
                              answer: "GyaanSetu-AI builds a real-time Skill Radar mapping your concept mastery. Practice exercises automatically adapt to strengthen weak areas.",
                              suggestedNext: "How do I start my personalized learning plan?",
                              language: "English"
                            });
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors text-left cursor-pointer"
                        >
                          "{activePrompt.suggestedNext}" <ChevronRight className="w-4 h-4 shrink-0 text-blue-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Status Footer */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Concept Breakdown</span>
                </div>
                <div className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Level: Beginner Friendly
                </div>
              </div>

            </div>
          </motion.div>

        </div>

        {/* Feature Cards Grid (4 Portals) */}
        <div id="features" className="mt-20 pt-12 border-t border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
              Everything You Need To Master Any Topic
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-1">
              Engineered For Modern Learners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* AI Tutor */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-blue-500 transition-all space-y-4 shadow-sm hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personalized AI Tutor</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Ask any question, get step-by-step breakdowns, and receive instant practice exercises tailored to your pace.
                </p>
              </div>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors pt-2"
              >
                <span>Try AI Tutor</span> <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Educator Suite */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-blue-500 transition-all space-y-4 shadow-sm hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">For Educators & Teams</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Automate lesson plans, track cohort skill gaps, and generate automated diagnostic assessments.
                </p>
              </div>
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors pt-2"
              >
                <span>Educator Features</span> <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Multilingual & Offline */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-blue-500 transition-all space-y-4 shadow-sm hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">22+ Regional Languages</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Learn in Hindi, Bengali, Tamil, Telugu, Marathi, and more with real-time voice translation.
                </p>
              </div>
              <a
                href="#offline-technology"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors pt-2"
              >
                <span>Multilingual Support</span> <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Skill Badges */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-blue-500 transition-all space-y-4 shadow-sm hover:shadow-xl group">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Career Skill Analytics</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Map your progress against top industry job roles and export verified skill radar reports.
                </p>
              </div>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors pt-2"
              >
                <span>Skill Guidance</span> <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
