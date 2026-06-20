import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Sparkles, Bot, Zap, ArrowRight, Play, Cpu, Volume2, Image,
  BookOpen, Terminal, CheckCircle2, ChevronRight, GraduationCap,
  HardDrive, Smile, Swords, Radar, Target, Trophy, Clock, User
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GyaanSetu AI | Bridging Knowledge Through Personalized Learning" },
      { name: "description", content: "Access personalized learning, offline tutoring, and neural intelligence with GyaanSetu AI." }
    ]
  }),
  component: LandingPage,
});

// Mock Interactive Simulator Questions (matching offline theme)
const SIMULATOR_TEMPLATES = [
  {
    id: "physics",
    label: "Explain Quantum Physics in Hindi",
    icon: GraduationCap,
    language: "Hindi / Multilingual",
    query: "Explain quantum superposition using a Hindi analogy.",
    response: `**GyaanSetu AI (Local Gemma-2B):**
यहाँ एक सरल उदाहरण है:
मान लीजिए आपके पास एक सिक्का है। जब वह मेज पर रखा होता है, तो वह 'Heads' या 'Tails' दिखाता है। 

लेकिन जब आप सिक्के को हवा में घुमाते हैं, तो वह घूमता हुआ सिक्का किस अवस्था में है? वह एक ही समय में Heads भी है और Tails भी! जब तक वह घूम रहा है, वह दोनों अवस्थाओं के मिश्रण (superposition) में है। 

क्वांटम सुपरपोजिशन (Quantum Superposition) भी ऐसा ही है। सूक्ष्म कण एक ही समय में कई अवस्थाओं में हो सकते हैं, जब तक कि हम उन्हें मापते या देखते नहीं हैं।`
  },
  {
    id: "diagram",
    label: "Analyze Circuit Diagram",
    icon: Image,
    language: "Vision / OCR",
    query: "Identify circuit components and solve the formula V(t) = V_0 * (1 - e^(-t / RC)).",
    response: `**GyaanSetu AI (Local Vision Model):**
मैंने आरेख का विश्लेषण किया है:

* **घटक (Components):** DC वोल्टेज स्रोत (V), स्विच (S), श्रृंखला में जुड़ा अवरोधक (R) और संधारित्र (C)। यह एक RC Series Circuit है।
* **व्याख्या:** यह सूत्र संधारित्र के चार्ज होने की प्रक्रिया को दर्शाता है। यहाँ 'RC' सर्किट का टाइम कॉन्स्टेंट है, जो चार्ज होने की दर तय करता है।`
  },
  {
    id: "voice",
    label: "Offline Voice Summary",
    icon: Volume2,
    language: "Voice / Speech-to-Text",
    query: "[Voice Input]: Photosynthesis is the process where plants convert light energy to chemical energy...",
    response: `**GyaanSetu AI (Speech Summarizer):**
Voice summary generated:

**Topic:** Photosynthesis
1. **Light Absorption:** Chlorophyll absorbs solar energy.
2. **Chemical Reaction:** Carbon Dioxide + Water are synthesized.
3. **End Products:** Glucose (food) and Oxygen (released).`
  }
];

function LandingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(SIMULATOR_TEMPLATES[0]);
  const [loading, setLoading] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [currentProgress, setCurrentProgress] = useState(0);

  const runSimulation = (template: typeof SIMULATOR_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setLoading(true);
    setCurrentProgress(0);
    setTerminalOutput("");
  };

  useEffect(() => {
    if (!loading) return;

    const steps = [
      { progress: 15, text: "gyaansetu@local:~$ ollama run gemma:2b" },
      { progress: 40, text: "loading local model weights (2.7GB)..." },
      { progress: 70, text: "model successfully loaded in local vRAM" },
      { progress: 100, text: selectedTemplate.response }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setCurrentProgress(step.progress);
        setTerminalOutput(prev => prev + (prev ? "\n" : "") + step.text);
        currentStep++;
      } else {
        setLoading(false);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [loading, selectedTemplate]);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans selection:bg-blue-500/20 selection:text-[#0b1530] overflow-x-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[550px] h-[550px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#8b5cf6]/5 blur-[130px]" />
      </div>

      {/* Full-width logo watermark touching both side corners and fully visible */}
      <div className="absolute inset-0 top-16 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center opacity-[0.22]">
        <img
          src="/Gyaansetu AI logo.png"
          alt=""
          className="w-full min-w-[100vw] h-full min-h-[90vh] object-cover scale-105"
        />
      </div>

      {/* Top Header Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <nav className="flex justify-between items-center px-4 sm:px-6 md:px-16 lg:px-24 py-4 max-w-full w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img
              src="/Gyaansetu AI logo.png"
              alt="GyaanSetu AI"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl bg-white p-0.5 shadow-sm border border-slate-100"
            />
            <div>
              <div className="font-display font-extrabold text-sm sm:text-lg tracking-tight leading-none text-[#0b1530]">GyaanSetu AI</div>
              <div className="hidden sm:block text-[9px] text-slate-500 mt-0.5 tracking-wider font-mono uppercase">Neural Education Ecosystem</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#" className="text-blue-600 transition-colors">Home</a>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#offline-demo" className="text-slate-600 hover:text-slate-900 transition-colors">AI Tutor</a>
            <a href="#mastery" className="text-slate-600 hover:text-slate-900 transition-colors">Solutions</a>
            <a href="#impact" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/auth"
              search={{ mode: "login" }}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5 sm:px-3 sm:py-2"
            >
              Login
            </Link>
            <Link 
              to="/auth"
              search={{ mode: "register" }}
              className="relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-28 pb-12 px-6 md:px-16 lg:px-24 max-w-full w-full mx-auto z-10 grid lg:grid-cols-12 gap-12 items-center content-center overflow-visible">
        {/* Left Content */}
        <div className="lg:col-span-7 text-left space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-full px-4 py-1.5 text-xs text-blue-600 font-semibold uppercase tracking-wider font-mono"
          >
            <Zap className="h-3.5 w-3.5 fill-blue-500 stroke-blue-500" /> Next-Gen Education Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#0b1530] leading-[1.15]"
          >
            Learn Without <span className="text-blue-600">Limits</span>.<br />
            Powered by AI.<br />
            Personalized <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">for You</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-800 text-sm md:text-base font-semibold leading-relaxed max-w-xl"
          >
            Experience the future of personalized learning. GyaanSetu AI crafts adaptive paths, provides real-time tutoring, and accelerates your career growth through neural intelligence.
          </motion.p>

          {/* Bullet Points */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md pt-2"
          >
            {[
              "Personalized Learning",
              "AI-Powered Tutoring",
              "10+ Languages",
              "Career Guidance",
              "Smart Analytics"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 shrink-0 stroke-[2.5]" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link 
              to="/auth"
              search={{ mode: "register" }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_4px_25px_rgba(37,99,235,0.4)] hover:scale-[1.02]"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <a 
              href="#offline-demo"
              className="bg-white border border-slate-200 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              Watch Demo <Play className="h-4 w-4 fill-slate-700 stroke-slate-700" />
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 pt-4"
          >
            <div className="flex -space-x-2.5">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
              ].map((src, i) => (
                <img key={i} src={src} className="h-7 w-7 rounded-full border border-white object-cover" alt="Student avatar" />
              ))}
            </div>
            <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest font-mono">
              <span className="text-blue-700 font-black">10,000+</span> AI Assisted Learners
            </div>
          </motion.div>
        </div>

        {/* Right Preview Graphic */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm p-6 bg-[#0b1530] border border-blue-500/20 rounded-[32px] shadow-2xl relative text-white"
          >
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              AI Powered
            </div>
            
            {/* Mock Dashboard Widget */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-500/10">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  Gyaansetu Active
                </div>
                <span className="text-[9px] font-mono text-blue-300/70">VRAM: 2.1GB</span>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-blue-300/70">Knowledge Mastery</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white font-display">84%</div>
                  <div className="h-2 w-24 bg-blue-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[84%]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-blue-950/40 border border-blue-500/10 p-3 rounded-xl">
                  <div className="text-[9px] text-blue-300/60">Study Hours</div>
                  <div className="text-base font-bold text-white font-display mt-0.5">126h</div>
                </div>
                <div className="bg-blue-950/40 border border-blue-500/10 p-3 rounded-xl">
                  <div className="text-[9px] text-blue-300/60">Active Skill Radar</div>
                  <div className="text-base font-bold text-white font-display mt-0.5">12</div>
                </div>
              </div>

              <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-500/10 text-[10px] font-mono text-blue-200/50 italic">
                "Neural visualizer of your domain progress..."
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Engineered for Excellence Section */}
      <section id="features" className="py-24 bg-white border-t border-slate-200/80 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0b1530]">
              Engineered for <span className="text-blue-600">Excellence</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Our ecosystem integrates advanced neural model-sets to provide a holistic learning experience that evolves with your unique cognitive profile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Tutor",
                desc: "24/7 personal assistant that understands your learning gaps and fills them in real-time with master-class explanations.",
                icon: Bot
              },
              {
                title: "Learning Path",
                desc: "Dynamic curriculums that shift based on your progress and focus.",
                icon: BookOpen
              },
              {
                title: "Career Guidance",
                desc: "Align your learning with real-world industry demands and skill gaps.",
                icon: Target
              },
              {
                title: "Voice Notes",
                desc: "Convert spoken ideas into structured study materials automatically.",
                icon: Volume2
              },
              {
                title: "Performance Analytics",
                desc: "Deep-dive into your cognitive load, retention rates, and focus levels with interactive data visualizations.",
                icon: Radar
              },
              {
                title: "Wellness Assistant",
                desc: "AI-monitored focus timers and burnout prevention strategies.",
                icon: Smile
              },
              {
                title: "Study Wars",
                desc: "Gamified competitive learning modules with global leaderboards.",
                icon: Swords
              },
              {
                title: "Skill Radar",
                desc: "Visual mapping of your core competencies against market standards.",
                icon: Trophy
              }
            ].map((feat, i) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={i}
                className="bg-[#0b1530] border border-blue-500/20 p-6 rounded-2xl flex flex-col justify-between hover:shadow-xl hover:border-blue-400/40 transition-all text-white"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-blue-200/60 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="offline-demo" className="py-20 bg-slate-50 border-y border-slate-200/80 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0b1530]">
              Offline Inference Simulator
            </h2>
            <p className="text-slate-600 mt-3 text-sm md:text-base">
              Try a live mock query to see GyaanSetu AI generate offline responses on low-powered consumer hardware.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Query Templates */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              {SIMULATOR_TEMPLATES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedTemplate.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => runSimulation(item)}
                    className={`text-left p-4 rounded-xl transition-all flex items-start gap-4 ${
                      isSelected 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                        : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className="text-[10px] opacity-70 mt-1 font-mono">{item.language}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Terminal Window */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 bg-[#080e1d] flex flex-col shadow-xl relative min-h-[350px]">
                <div className="bg-[#0f172a] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <HardDrive className="h-3 w-3" /> CLIENT: OFFLINE INF
                  </div>
                </div>

                <div className="flex-1 p-5 font-mono text-[11px] overflow-y-auto space-y-3">
                  <div className="text-blue-400/80">gyaansetu-system: active</div>
                  
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white">
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-t-transparent border-blue-400 rounded-full" />
                        Inference computing...
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300"
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {terminalOutput && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-pre-wrap leading-relaxed text-slate-300 bg-white/5 p-4 rounded-lg border border-white/5"
                      >
                        {terminalOutput}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Path to Mastery Section */}
      <section id="mastery" className="py-24 bg-white px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0b1530]">
              Your Path to <span className="text-blue-600">Mastery</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              A seamless 5-step evolution to unlock your full cognitive potential.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: "Profile Creation", desc: "Interact with our AI agent to benchmark your capabilities.", icon: User },
              { title: "Learning Style", desc: "AI assesses your cognitive style throughout the first few tests.", icon: Smile },
              { title: "Evolving Plan", desc: "Get a daily evolving roadmap generated specifically for your goals.", icon: BookOpen },
              { title: "AI Assistance", desc: "Query our AI for real-time tips and dynamic revisions.", icon: Bot },
              { title: "Exponential Growth", desc: "Measure and continue improvement with weekly skill radar updates.", icon: Target }
            ].map((step, i) => (
              <div key={i} className="bg-[#0b1530] border border-blue-500/20 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-xl hover:border-blue-400/40 transition-all text-white">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">{step.title}</h4>
                  <p className="text-[11px] text-blue-200/60 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats section */}
      <section id="impact" className="py-16 bg-slate-50 border-y border-slate-200/80 px-6 md:px-12 text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-8">
          {[
            { value: "10k+", label: "Courses" },
            { value: "500k+", label: "Learning Hours" },
            { value: "25+", label: "Languages Supported" },
            { value: "95%", label: "Improvement Rate" },
            { value: "100+", label: "AI Tutors" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl md:text-4xl font-display font-black text-blue-600">{stat.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0b1530]">
              Trusted by Learning Communities
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Aarav Sharma",
                role: "Computer Science Student",
                quote: "GyaanSetu AI didn't just teach me coding; it understood how I learn. The AI tutor felt like having a senior engineer sitting right next to me 24/7.",
                src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
              },
              {
                name: "Dr. Elena Vaneva",
                role: "Senior Educator",
                quote: "The insights I get into my students' progress are unprecedented. It allows me to focus on mentorship while the AI handles the repetitive drills.",
                src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
              },
              {
                name: "Mark Thompson",
                role: "Parent",
                quote: "My son's confidence has skyrocketed. The personalized wellness assistant helps him manage study stress effectively. Truly game-changing.",
                src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120"
              }
            ].map((test, i) => (
              <div key={i} className="bg-[#0b1530] border border-blue-500/20 p-6 rounded-2xl flex flex-col justify-between relative hover:shadow-xl hover:border-blue-400/40 transition-all text-white">
                <div className="text-sm text-blue-100/90 leading-relaxed italic">"{test.quote}"</div>
                
                <div className="flex items-center gap-3 mt-6 border-t border-blue-500/10 pt-4">
                  <img src={test.src} alt={test.name} className="h-10 w-10 rounded-full object-cover border border-blue-500/20" />
                  <div>
                    <div className="text-xs font-bold text-white">{test.name}</div>
                    <div className="text-[10px] text-blue-300/60">{test.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-[#0b1530] to-[#07101f] rounded-[36px] p-10 md:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-blue-500/10 blur-[80px] pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white max-w-xl mx-auto leading-tight">
            Start Your AI Learning Journey Today
          </h2>
          <p className="text-blue-200/70 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            Join thousands of students and professionals who are redefining their potential with GyaanSetu AI.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-xs font-bold text-[#0b1530] hover:bg-slate-100 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
            <button
              className="bg-white/10 hover:bg-white/15 border border-white/10 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-xs font-bold transition-all text-white"
            >
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-16 px-6 md:px-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/Gyaansetu AI logo.png"
                alt="GyaanSetu AI"
                className="h-9 w-9 object-contain rounded-lg bg-white p-0.5 shadow-sm border border-slate-100"
              />
              <span className="font-display font-bold text-sm text-[#0b1530]">GyaanSetu AI</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Empowering learners through neural intelligence. The bridge between potential and mastery.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-[#0b1530] uppercase text-[10px] tracking-wider font-mono">Product</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#" className="hover:text-blue-600 transition-colors">AI Tutor</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Learning Path</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Solutions</a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-[#0b1530] uppercase text-[10px] tracking-wider font-mono">Company</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Careers</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Blog</a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-[#0b1530] uppercase text-[10px] tracking-wider font-mono">Resources</div>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Community</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support Center</a>
              <a href="#" className="hover:text-blue-600 transition-colors">API Access</a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-slate-200 text-[10px]">
          <div>
            © 2026 GyaanSetu AI. Bridging Knowledge. Through Personalized Learning.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
