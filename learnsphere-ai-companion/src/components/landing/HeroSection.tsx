import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, Volume2, Globe, CheckCircle2, ChevronRight, BookOpen
} from "lucide-react";

const HERO_PROMPTS = [
  {
    id: "recursion",
    label: "Explain recursion simply",
    question: "Explain recursion like I'm a beginner.",
    answer: "Think of recursion like standing between two parallel mirrors. You see an infinite sequence of smaller versions of yourself. In code, a recursive function calls itself to solve a small piece of the problem, until it reaches a base condition (the mirror edge) and stops.",
    suggestedNext: "Can you show a simple Python factorial example?",
    language: "English"
  },
  {
    id: "hindi-photo",
    label: "Photosynthesis in Hindi",
    question: "प्रकाश संश्लेषण (Photosynthesis) को सरल हिंदी में समझाएं।",
    answer: "प्रकाश संश्लेषण वह प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, जल और कार्बन डाइऑक्साइड का उपयोग करके अपना भोजन (ग्लूकोज) बनाते हैं और ऑक्सीजन गैस छोड़ते हैं। यह प्रक्रिया पौधों की पत्तियों में मौजूद क्लोरोफिल द्वारा संचालित होती है।",
    suggestedNext: "पौधे रात में क्या करते हैं?",
    language: "हिन्दी (Hindi)"
  },
  {
    id: "career-roadmap",
    label: "Full Stack Roadmap",
    question: "What should I study to become a Full Stack Developer in 2026?",
    answer: "Start with HTML/CSS & TypeScript fundamentals, followed by React & modern UI frameworks. Next, master API design, SQL database architecture, and authentication. Finally, learn production deployment and system design principles.",
    suggestedNext: "How does GyaanSetu-AI track my skill progress?",
    language: "English"
  }
];

export function HeroSection() {
  const [activePrompt, setActivePrompt] = useState(HERO_PROMPTS[0]);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
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
    }, 18);

    return () => clearInterval(interval);
  }, [activePrompt]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[1800px] h-96 pointer-events-none opacity-40 blur-3xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-400/20" />
        <div className="absolute top-12 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-400/15" />
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 space-y-7 text-left">
            
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>GyaanSetu-AI</span>
              <span className="text-blue-300">•</span>
              <span className="text-slate-600 font-medium">Bridging Knowledge Through Personalised Learning</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.12]"
            >
              Learning that <br className="hidden sm:inline" />
              <span className="text-blue-600">adapts to you.</span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-base sm:text-xl leading-relaxed max-w-2xl font-normal"
            >
              GyaanSetu-AI brings personalised learning, intelligent tutoring, adaptive learning paths, and career guidance into one powerful learning ecosystem.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#product-pillars"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base px-8 py-4 rounded-2xl transition-all shadow-sm"
              >
                Explore GyaanSetu-AI
              </a>
            </motion.div>

            {/* Capability Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-slate-200/60 text-xs sm:text-sm font-medium text-slate-500 flex flex-wrap items-center gap-3"
            >
              <span className="text-slate-800 font-semibold">Personalised Learning</span>
              <span>•</span>
              <span className="text-slate-800 font-semibold">AI Tutor</span>
              <span>•</span>
              <span className="text-slate-800 font-semibold">Multilingual</span>
              <span>•</span>
              <span className="text-slate-800 font-semibold">Voice Learning</span>
              <span>•</span>
              <span className="text-slate-800 font-semibold">Career Guidance</span>
            </motion.div>
          </div>

          {/* Right Column: Expanded Hero AI Tutor Workspace */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden text-slate-800">
              
              {/* Header Bar */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    GS
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-tight">GyaanSetu-AI Tutor</div>
                    <div className="text-[11px] text-blue-300 font-medium">Adaptive Assistant • Active</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isVoiceActive ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isVoiceActive ? "Voice On" : "Voice Off"}
                  </button>

                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              {/* Quick Prompt Switcher */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2.5 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Try Prompt:</span>
                {HERO_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePrompt(p)}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                      activePrompt.id === p.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Canvas */}
              <div className="p-6 space-y-5 min-h-[320px] max-h-[380px] overflow-y-auto font-sans text-sm">
                
                {/* User Message */}
                <div className="flex items-start justify-end gap-3">
                  <div className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[85%] font-medium shadow-sm leading-relaxed">
                    {activePrompt.question}
                  </div>
                </div>

                {/* AI Tutor Response */}
                <div className="flex items-start gap-3.5 pt-1">
                  <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4.5 h-4.5" />
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl rounded-tl-none max-w-[90%] space-y-3.5">
                    <div className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                      {displayText}
                      {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />}
                    </div>

                    {!isTyping && (
                      <div className="pt-3.5 border-t border-slate-200/60 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Suggested Follow-up:</span>
                        </div>
                        <button
                          onClick={() => {
                            setActivePrompt({
                              id: "followup",
                              label: "Follow-up",
                              question: activePrompt.suggestedNext,
                              answer: "GyaanSetu-AI creates an active Skill Radar mapping your concept mastery levels. Every practice exercise automatically refines your recommended next topic.",
                              suggestedNext: "How do I start my personalized plan?",
                              language: "English"
                            });
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors text-left"
                        >
                          "{activePrompt.suggestedNext}" <ChevronRight className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Progress & Status */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Personalised Concept Breakdown</span>
                </div>
                <div className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Level: Beginner Friendly
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
