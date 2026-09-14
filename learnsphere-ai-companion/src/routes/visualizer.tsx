import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Network, Sparkles, RefreshCw, X, Download, HelpCircle, GitPullRequest, Settings, Eye } from "lucide-react";
import { generateAIDiagram } from "@/lib/api/ai.service";

export const Route = createFileRoute("/visualizer")({
  head: () => ({ meta: [{ title: "Concept Visualizer — GyaanSetu AI" }] }),
  component: VisualizerDashboard,
});

const LAYOUT_STYLES = ["Flowchart", "Mind Map", "System Architecture", "Concept Tree"];

function VisualizerDashboard() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Mind Map");
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState<{
    nodes: Array<{ id: string; label: string; color: string }>;
    links: Array<{ source: string; target: string }>;
  }>({
    nodes: [
      { id: "1", label: "Quantum Superposition", color: "#3b82f6" },
      { id: "2", label: "Qubit Base State |0⟩ & |1⟩", color: "#6366f1" },
      { id: "3", label: "Bloch Sphere Representation", color: "#6366f1" },
      { id: "4", label: "Hadamard Gate Application", color: "#10b981" },
      { id: "5", label: "Measurement Collapse", color: "#f43f5e" }
    ],
    links: [
      { source: "1", sourceName: "1", target: "2", targetName: "2" },
      { source: "1", sourceName: "1", target: "3", targetName: "3" },
      { source: "2", sourceName: "2", target: "4", targetName: "4" },
      { source: "3", sourceName: "3", target: "4", targetName: "4" },
      { source: "4", sourceName: "4", target: "5", targetName: "5" }
    ]
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateAIDiagram(topic, style);
      if (data.nodes && data.nodes.length > 0) {
        setGraph(data);
        showToast("Concept map visualizer updated!");
      }
    } catch (err) {
      console.error(err);
      showToast("Generation failed. Using offline fallback layout.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-calculate positions based on style
  const getPositionedNodes = () => {
    const nodes = graph.nodes;
    if (style === "Mind Map") {
      return nodes.map((node, index) => {
        if (index === 0) return { ...node, x: 250, y: 190 };
        const angle = ((index - 1) / (nodes.length - 1)) * 2 * Math.PI;
        const radius = 110;
        return {
          ...node,
          x: 250 + radius * Math.cos(angle),
          y: 190 + radius * Math.sin(angle)
        };
      });
    } else if (style === "Concept Tree") {
      return nodes.map((node, index) => {
        if (index === 0) return { ...node, x: 250, y: 60 };
        const count = nodes.length - 1;
        const step = 420 / (count + 1);
        return {
          ...node,
          x: step * index + 40,
          y: 220
        };
      });
    } else if (style === "System Architecture") {
      return nodes.map((node, index) => {
        const isTop = index < nodes.length / 2;
        const colIndex = isTop ? index : index - Math.floor(nodes.length / 2);
        const rowCount = isTop ? Math.floor(nodes.length / 2) : nodes.length - Math.floor(nodes.length / 2);
        const step = 420 / (rowCount + 1);
        return {
          ...node,
          x: step * (colIndex + 1) + 40,
          y: isTop ? 80 : 260
        };
      });
    } else {
      // Flowchart
      const step = 280 / (nodes.length || 1);
      return nodes.map((node, index) => ({
        ...node,
        x: 250,
        y: 40 + step * index
      }));
    }
  };

  const positionedNodes = getPositionedNodes();

  return (
    <AppLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl border border-[#3b82f6]/30 shadow-2xl bg-white dark:bg-[#0d1322] text-xs text-slate-900 dark:text-white font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Concept Visualizer"
        subtitle="Transform complex textbook paragraphs and logic gates into stunning interactive knowledge graphs."
        icon={Network}
      />

      <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Left Control Panel */}
        <div className="lg:col-span-4">
          <GlassCard className="shadow-lg p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-[#3b82f6]" /> AI Diagram Creator
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-blue-200/60 leading-relaxed">
                Enter any textbook topic, system, or programming algorithm, select a layout style, and generate an interactive concept roadmap.
              </p>

              <div>
                <label className="text-[9px] font-mono text-slate-700 dark:text-slate-400 uppercase">Concept / Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React Hydration Cycle, Blockchain consensus, Photosynthesis, or Binary Search Tree"
                  className="w-full h-24 mt-1 bg-black/40 border border-sky-200/80 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#3b82f6]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-slate-700 dark:text-slate-400 uppercase">Layout Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full mt-1 bg-slate-100/90 dark:bg-[#050816] border border-sky-200/80 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#3b82f6]/40"
                >
                  {LAYOUT_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] py-3 text-xs font-bold text-[#050816] transition hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Visualizing...
                </>
              ) : (
                <>
                  <GitPullRequest className="h-4 w-4" /> Render Graph
                </>
              )}
            </button>
          </GlassCard>
        </div>

        {/* Right Interactive Canvas */}
        <div className="lg:col-span-8">
          <GradientCard className="shadow-lg p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-sky-200/60 dark:border-white/5 mb-4">
              <div>
                <span className="text-xs font-mono text-[#3b82f6] tracking-wider uppercase font-bold">Interactive Graph Canvas</span>
                <span className="text-[9px] font-mono text-slate-700 dark:text-slate-400 ml-3">Style: {style}</span>
              </div>
              <button 
                onClick={() => showToast("Exporting high-resolution PNG graph...")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-sky-200/80 dark:border-white/10 text-[10px] font-mono hover:bg-white/10 transition"
              >
                <Download className="h-3.5 w-3.5" /> Export SVG
              </button>
            </div>

            {/* SVG Visual Canvas */}
            <div className="relative flex-1 bg-black/40 border border-sky-200/60 dark:border-white/5 rounded-2xl min-h-[380px] overflow-hidden flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-slate-600 dark:text-slate-500">
                  <RefreshCw className="h-8 w-8 text-[#3b82f6] animate-spin mb-3" />
                  <p className="text-xs font-mono">Synthesizing network topology...</p>
                </div>
              ) : (
                <svg className="absolute inset-0 h-full w-full">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Render Links */}
                  {graph.links.map((link, idx) => {
                    const sourceNode = positionedNodes.find((n) => n.id === link.source);
                    const targetNode = positionedNodes.find((n) => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;
                    return (
                      <line
                        key={idx}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        strokeDasharray="4,4"
                      />
                    );
                  })}

                  {/* Render Nodes */}
                  {positionedNodes.map((node) => (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      {/* Glow ring */}
                      <circle r="36" fill="none" stroke={node.color} strokeWidth="1.5" strokeOpacity="0.3" className="animate-pulse" />
                      {/* Inner circle */}
                      <circle r="30" fill="#0d1322" stroke={node.color} strokeWidth="2" />
                      {/* Node Label Text */}
                      <foreignObject x="-60" y="-18" width="120" height="40">
                        <div className="text-[8px] font-mono font-bold text-slate-200 text-center flex items-center justify-center h-full px-1.5 overflow-hidden leading-tight">
                          {node.label}
                        </div>
                      </foreignObject>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </GradientCard>
        </div>
      </div>
    </AppLayout>
  );
}
