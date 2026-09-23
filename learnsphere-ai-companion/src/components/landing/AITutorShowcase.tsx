import { motion } from "framer-motion";
import { useState } from "react";
import { Bot, Volume2, Globe, Sparkles } from "lucide-react";

const TUTOR_PRESETS = [
  {
    id: "explain-simpler",
    name: "Explain Simpler",
    prompt: "Can you explain binary search trees in even simpler terms?",
    response: "Think of a binary search tree like an organized family tree. Every number on the left is smaller, and every number on the right is bigger. When searching for a number, you just compare and choose left or right—cutting the remaining work in half at every step!"
  },
  {
    id: "give-example",
    name: "Give an Example",
    prompt: "Show a real-world example of asynchronous programming.",
    response: "Imagine ordering food at a restaurant counter. After ordering, you get a buzzer and sit down (asynchronous task). You don't stand frozen at the counter waiting for the chef to cook; you continue chatting or reading until your buzzer rings!"
  },
  {
    id: "create-quiz",
    name: "Create a Quiz",
    prompt: "Generate a quick 2-question quiz on HTTP status codes.",
    response: "1. What does HTTP Status Code 404 signify? (A: Not Found)\n2. What status code series represents server-side errors? (A: 5xx series like 500, 502, 503)"
  },
  {
    id: "summarise",
    name: "Summarise",
    prompt: "Summarise the main steps of Git Version Control.",
    response: "1. Working Directory (edit code)\n2. Staging Area (`git add`)\n3. Local Repository (`git commit`)\n4. Remote Cloud Repository (`git push`)"
  }
];

export function AITutorShowcase() {
  const [activePreset, setActivePreset] = useState(TUTOR_PRESETS[0]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  return (
    <section id="ai-tutor" className="py-24 bg-white border-b border-slate-200/80 font-sans">
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
            <Bot className="w-4 h-4" />
            <span>AI Tutor Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Meet your personal <br className="hidden sm:inline" />
            <span className="text-blue-600">AI learning companion.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Ask questions naturally. Get explanations at your exact level. Learn in the language that works for you.
          </p>
        </motion.div>

        {/* Expanded Interactive Sandbox Card - Navy Blue Card on White BG */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto bg-[#0b1530] text-white rounded-3xl border border-sky-400/30 shadow-2xl overflow-hidden"
        >
          
          {/* Top Control Toolbar */}
          <div className="bg-[#081026] p-5 border-b border-sky-900/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-500 flex items-center justify-center font-extrabold text-slate-950 text-xs sm:text-sm">
                GS
              </div>
              <div>
                <div className="text-sm font-bold text-white">GyaanSetu-AI Tutor Interface</div>
                <div className="text-xs text-sky-300 font-medium">Offline & Fast Local Inference</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Picker */}
              <div className="flex items-center gap-2 bg-sky-950 px-3.5 py-2 rounded-xl border border-sky-800 text-xs sm:text-sm">
                <Globe className="w-4 h-4 text-sky-400" />
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent text-sky-200 font-medium outline-none cursor-pointer"
                >
                  <option value="English" className="bg-[#0b1530] text-white">English</option>
                  <option value="Hindi" className="bg-[#0b1530] text-white">हिन्दी (Hindi)</option>
                  <option value="Marathi" className="bg-[#0b1530] text-white">मराठी (Marathi)</option>
                  <option value="Bengali" className="bg-[#0b1530] text-white">বাংলা (Bengali)</option>
                </select>
              </div>

              {/* Audio Reader Toggle */}
              <button
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isAudioPlaying
                    ? "bg-sky-500 border-sky-400 text-slate-950"
                    : "bg-sky-950 border-sky-800 text-sky-200 hover:bg-sky-900"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAudioPlaying ? "Listening..." : "Voice TTS"}</span>
              </button>
            </div>
          </div>

          {/* Action Modifier Presets */}
          <div className="bg-sky-950/60 p-4 border-b border-sky-900/60 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-sky-400 px-2 uppercase tracking-wider shrink-0 font-mono">Actions:</span>
            {TUTOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset)}
                className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activePreset.id === preset.id
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "bg-sky-900/60 border border-sky-700/60 text-sky-200 hover:bg-sky-800"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Content Sandbox Body */}
          <div className="p-8 space-y-6 min-h-[300px]">
            
            {/* User Input Prompt */}
            <div className="bg-sky-950 border border-sky-800/80 p-5 rounded-2xl space-y-1.5">
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Active Prompt Request:
              </div>
              <div className="text-base font-semibold text-white">
                "{activePreset.prompt}"
              </div>
            </div>

            {/* AI Explanation Stream Output */}
            <div className="bg-[#081026] border border-sky-900/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-sky-300 border-b border-sky-900/80 pb-3">
                <span className="text-sky-400 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> GyaanSetu-AI Response ({selectedLang})
                </span>
                <span className="text-emerald-400 font-mono font-bold">Status: Stream Complete</span>
              </div>

              <p className="text-sky-100 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {activePreset.response}
              </p>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}
