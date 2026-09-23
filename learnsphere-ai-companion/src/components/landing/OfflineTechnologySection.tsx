import { useState } from "react";
import { Cpu, HardDrive, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const OFFLINE_DEMOS = [
  {
    id: "physics",
    title: "Quantum Physics in Hindi (Local Llama 3.1)",
    query: "Explain quantum superposition using a simple Hindi analogy.",
    model: "llama3.1:8b (Offline)",
    response: `क्वांटम सुपरपोजिशन का सरल उदाहरण:\nमान लीजिए आपके पास एक सिक्का है। जब सिक्का हवा में घूमता है, तब वह न पूरी तरह Heads है और न Tails—वह दोनों अवस्थाओं के मिश्रण (superposition) में है। केवल रुकने पर उसकी एक निश्चित स्थिति बनती है। क्वांटम कण भी मापने से पहले एक साथ कई अवस्थाओं में रहते हैं।`
  },
  {
    id: "ocr",
    title: "Diagram Text Extraction (PaddleOCR)",
    query: "Extract formulas and text from handwritten physics diagram notes.",
    model: "PaddleOCR + Faster-Whisper",
    response: `Extracted Handwritten Content:\n1. Circuit Type: RC Series Network\n2. Formula: V(t) = V_0 * (1 - e^(-t / RC))\n3. Time Constant τ = R * C (Time to reach 63.2% charge)`
  },
  {
    id: "rag",
    title: "Local PDF Search & RAG (ChromaDB)",
    query: "Query textbook PDF stored in local vector database.",
    model: "MiniLM-L6-v2 + ChromaDB",
    response: `Matched Document Page 142:\n"Newton's Third Law states that for every action, there is an equal and opposite reaction."\nSimilarity Score: 0.94 (Local Vector Match)`
  }
];

export function OfflineTechnologySection() {
  const [selectedDemo, setSelectedDemo] = useState(OFFLINE_DEMOS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(selectedDemo.response);

  const runDemo = (demo: typeof OFFLINE_DEMOS[0]) => {
    setSelectedDemo(demo);
    setIsRunning(true);
    setOutput("");

    setTimeout(() => {
      setOutput(demo.response);
      setIsRunning(false);
    }, 600);
  };

  return (
    <section id="offline-technology" className="py-24 bg-[#0b1530] text-white border-b border-blue-900/50 font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs sm:text-sm font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Local Neural Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
            Learning should not depend on <br className="hidden sm:inline" />
            <span className="text-sky-400">perfect connectivity.</span>
          </h2>
          <p className="text-sky-200 text-base sm:text-lg leading-relaxed font-normal">
            GyaanSetu-AI runs neural AI models locally using consumer hardware—ensuring fast, accessible, and private learning anywhere.
          </p>
        </motion.div>

        {/* Local Architecture Grid - Pure White Cards on Dark BG */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Local LLM Inference", desc: "Runs Llama 3.1 & DeepSeek models locally via Ollama daemon", tech: "Ollama Daemon" },
            { title: "Offline Voice STT", desc: "Instant speech-to-text recognition without external APIs", tech: "Faster-Whisper" },
            { title: "Offline Voice TTS", desc: "Natural local speech synthesis directly on your device", tech: "Piper TTS" },
            { title: "Local Vector RAG", desc: "Private note embeddings stored locally in ChromaDB", tech: "ChromaDB + MiniLM" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-sky-200 p-6 rounded-2xl space-y-3 shadow-md hover:shadow-lg transition-all"
            >
              <div className="text-[11px] font-mono font-bold text-sky-900 bg-sky-100 border border-sky-300 px-3 py-1 rounded-full w-fit">
                {item.tech}
              </div>
              <h4 className="font-display font-bold text-lg text-sky-950">{item.title}</h4>
              <p className="text-xs sm:text-sm text-sky-800 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Interactive Local Inference Sandbox - Pure White Card on Dark BG */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto bg-white border border-sky-200 text-sky-950 rounded-3xl p-8 lg:p-10 space-y-6 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-200 pb-5">
            <div className="flex items-center gap-2.5 text-sm font-bold text-sky-950">
              <HardDrive className="w-5 h-5 text-sky-600" />
              <span>Offline Inference Playground</span>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-300 font-bold">
              Local Status: Connected (100% Offline)
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Buttons */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono text-sky-900 uppercase font-extrabold px-1">
                Select Model Query:
              </div>
              {OFFLINE_DEMOS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => runDemo(demo)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedDemo.id === demo.id
                      ? "bg-sky-600 border-sky-600 text-white shadow-md"
                      : "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100"
                  }`}
                >
                  <div className="font-bold">{demo.title}</div>
                  <div className={`text-xs font-mono mt-1 ${selectedDemo.id === demo.id ? "text-sky-100" : "text-sky-700"}`}>
                    Engine: {demo.model}
                  </div>
                </button>
              ))}
            </div>

            {/* Right Output Window */}
            <div className="lg:col-span-7 bg-sky-50 border border-sky-200 rounded-2xl p-6 space-y-4 font-mono text-xs sm:text-sm">
              <div className="flex justify-between items-center text-xs text-sky-800 font-bold border-b border-sky-200 pb-3">
                <span>Model: {selectedDemo.model}</span>
                <span>Latency: 18ms</span>
              </div>

              {isRunning ? (
                <div className="flex items-center gap-2 text-sky-700 py-10 justify-center font-sans font-semibold">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Computing local inference...</span>
                </div>
              ) : (
                <div className="text-sky-950 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                  {output}
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
