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
          <GlassCard className="shadow-md shadow-sky-100/50 border border-sky-200 bg-white p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-sm text-sky-950 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-sky-500 fill-sky-100" /> AI Diagram Creator
              </h3>
              <p className="text-[11px] text-sky-700/90 font-semibold leading-relaxed">
                Enter any textbook topic, system, or programming algorithm, select a layout style, and generate an interactive concept roadmap.
              </p>

              <div>
                <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Concept / Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React Hydration Cycle, Blockchain consensus, Photosynthesis, or Binary Search Tree"
                  className="w-full h-28 mt-1 bg-sky-50/60 border border-sky-200 rounded-xl p-3 text-xs font-bold text-sky-950 placeholder:text-sky-700/50 focus:outline-none focus:bg-white focus:border-sky-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Layout Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full mt-1 bg-sky-50/60 border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-950 focus:outline-none focus:border-sky-500"
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
              className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-3 text-xs font-extrabold shadow-md shadow-sky-200 transition disabled:opacity-50"
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
          <GradientCard className="shadow-md shadow-sky-100/50 border border-sky-200 bg-white p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-sky-200/80 mb-4">
              <div>
                <span className="text-xs font-mono text-sky-600 tracking-wider uppercase font-extrabold">Interactive Graph Canvas</span>
                <span className="text-[11px] font-mono text-sky-700 font-bold ml-3">Style: {style}</span>
              </div>
              <button 
                onClick={() => showToast("Exporting high-resolution PNG graph...")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 text-xs font-extrabold shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5 text-sky-500" /> Export SVG
              </button>
            </div>

            {/* SVG Visual Canvas */}
            <div className="relative flex-1 bg-sky-50/50 border border-sky-200/80 rounded-2xl min-h-[380px] overflow-hidden flex items-center justify-center shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-sky-700 font-bold">
                  <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mb-3" />
                  <p className="text-xs font-mono">Synthesizing network topology...</p>
                </div>
              ) : (
                <svg className="absolute inset-0 h-full w-full">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="1" />
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
                        stroke="#0284c7"
                        strokeWidth="2"
                        strokeOpacity="0.6"
                        strokeDasharray="4,4"
                      />
                    );
                  })}

                  {/* Render Nodes */}
                  {positionedNodes.map((node) => (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      {/* Glow ring */}
                      <circle r="36" fill="none" stroke={node.color} strokeWidth="2" strokeOpacity="0.4" className="animate-pulse" />
                      {/* Inner circle */}
                      <circle r="30" fill="white" stroke={node.color} strokeWidth="2.5" className="shadow-md" />
                      {/* Node Label Text */}
                      <foreignObject x="-60" y="-18" width="120" height="40">
                        <div className="text-[9px] font-sans font-extrabold text-sky-950 text-center flex items-center justify-center h-full px-1.5 overflow-hidden leading-snug">
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
