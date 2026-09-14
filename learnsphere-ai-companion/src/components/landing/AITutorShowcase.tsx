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
    <section id="ai-tutor" className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
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
        </div>

        {/* Expanded Interactive Sandbox Card */}
        <div className="max-w-6xl mx-auto bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Top Control Toolbar */}
          <div className="bg-slate-950 p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                GS
              </div>
              <div>
                <div className="text-sm font-bold text-white">GyaanSetu-AI Tutor Interface</div>
                <div className="text-xs text-slate-400">Offline & Fast Local Inference</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Picker */}
              <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm">
                <Globe className="w-4 h-4 text-blue-400" />
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
                >
                  <option value="English" className="bg-slate-900 text-white">English</option>
                  <option value="Hindi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                  <option value="Marathi" className="bg-slate-900 text-white">मराठी (Marathi)</option>
                  <option value="Bengali" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
                </select>
              </div>

              {/* Audio Reader Toggle */}
              <button
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
                  isAudioPlaying
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAudioPlaying ? "Listening..." : "Voice TTS"}</span>
              </button>
            </div>
          </div>

          {/* Action Modifier Presets */}
          <div className="bg-slate-800/60 p-4 border-b border-slate-800 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider shrink-0">Actions:</span>
            {TUTOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset)}
                className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activePreset.id === preset.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Content Sandbox Body */}
          <div className="p-8 space-y-6 min-h-[300px]">
            
            {/* User Input Prompt */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-1.5">
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                Active Prompt Request:
              </div>
              <div className="text-base font-semibold text-white">
                "{activePreset.prompt}"
              </div>
            </div>

            {/* AI Explanation Stream Output */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400 border-b border-slate-800 pb-3">
                <span className="text-blue-400 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> GyaanSetu-AI Response ({selectedLang})
                </span>
                <span className="text-emerald-400 font-mono">Status: Stream Complete</span>
              </div>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {activePreset.response}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
