import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, Award, Clock, Target, Calendar, Download, RefreshCw, Sparkles, X, ChevronRight, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — GyaanSetu AI" }] }),
  component: PerformanceDashboard,
});

const PERFORMANCE_DATA = [
  { day: "Mon", accuracy: 78, focus: 80, time: 2.5 },
  { day: "Tue", accuracy: 82, focus: 85, time: 3.2 },
  { day: "Wed", accuracy: 80, focus: 78, time: 4.1 },
  { day: "Thu", accuracy: 88, focus: 92, time: 3.5 },
  { day: "Fri", accuracy: 85, focus: 88, time: 2.8 },
  { day: "Sat", accuracy: 91, focus: 94, time: 5.0 },
  { day: "Sun", accuracy: 94, focus: 95, time: 4.5 }
];

function PerformanceDashboard() {
  const [activeMetric, setActiveMetric] = useState<"accuracy" | "focus" | "time">("accuracy");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    showToast("Compiling performance report PDF...");
    setTimeout(() => {
      showToast("Report PDF downloaded successfully!");
    }, 1500);
  };

  return (
    <AppLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl border border-[#3b82f6]/30 shadow-2xl bg-[#0d1322] text-xs text-white font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Performance Analytics"
        subtitle="Track cognitive focus cycles, test accuracy metrics, and visual learning rate indices."
        icon={TrendingUp}
      />

      {/* Top Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <GradientCard className="overflow-hidden relative bg-[#0b1530] border border-blue-500/20 text-white shadow-lg p-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 rounded-full px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3 w-3 text-[#3b82f6]" />
                Cognitive Growth Engine
              </div>
              <h1 className="mt-3 text-2xl font-display font-bold text-white">Your Weekly Learning Output</h1>
              <p className="mt-2 text-blue-200/60 max-w-xl text-xs leading-relaxed">
                Analysis of study sessions shows an 8% increase in long-term memory retrieval accuracy compared to last week.
              </p>
            </div>
            <div>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] px-5 py-3.5 text-xs font-bold text-[#050816] glow-cyan hover:scale-[1.02] transition"
              >
                <Download className="h-4 w-4" /> Export Report (PDF)
              </button>
            </div>
          </div>
        </GradientCard>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveMetric("accuracy")}
          className={`p-5 rounded-3xl shadow-md text-left transition hover:scale-[1.02] border text-white ${
            activeMetric === "accuracy" ? "bg-[#0b1530] border-[#3b82f6]/40" : "bg-[#0b1530]/50 border-blue-500/10"
          }`}
        >
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Test Accuracy</div>
          <div className="text-xl font-extrabold text-white mt-1.5 leading-none">88%</div>
          <div className="text-[9px] text-[#3b82f6] mt-2 font-mono">Select to view graph</div>
        </button>

        <button
          onClick={() => setActiveMetric("focus")}
          className={`p-5 rounded-3xl shadow-md text-left transition hover:scale-[1.02] border text-white ${
            activeMetric === "focus" ? "bg-[#0b1530] border-[#6366f1]/40" : "bg-[#0b1530]/50 border-blue-500/10"
          }`}
        >
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Focus Health</div>
          <div className="text-xl font-extrabold text-white mt-1.5 leading-none">92/100</div>
          <div className="text-[9px] text-[#6366f1] mt-2 font-mono">Select to view graph</div>
        </button>

        <button
          onClick={() => setActiveMetric("time")}
          className={`p-5 rounded-3xl shadow-md text-left transition hover:scale-[1.02] border text-white ${
            activeMetric === "time" ? "bg-[#0b1530] border-emerald-500/40" : "bg-[#0b1530]/50 border-blue-500/10"
          }`}
        >
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Study Duration</div>
          <div className="text-xl font-extrabold text-white mt-1.5 leading-none">28.3 hrs</div>
          <div className="text-[9px] text-emerald-400 mt-2 font-mono">Select to view graph</div>
        </button>

        <div className="bg-[#0b1530] border border-blue-500/20 p-5 rounded-3xl shadow-md text-left text-white">
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Global Ranking</div>
          <div className="text-xl font-extrabold text-white mt-1.5 leading-none">#284</div>
          <div className="text-[9px] text-amber-500 mt-2 font-mono">Top 2% of platform</div>
        </div>
      </div>

      {/* Main Charts & Side panel */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Left: Recharts graph */}
        <div className="lg:col-span-8">
          <GradientCard className="bg-[#0b1530] border border-blue-500/20 text-white shadow-lg p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <div>
                <span className="text-xs font-mono text-[#3b82f6] tracking-wider uppercase font-bold">
                  {activeMetric.toUpperCase()} Trend Analysis
                </span>
                <span className="text-[9px] font-mono text-slate-400 ml-3">Interval: Last 7 Days</span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-[280px] w-full bg-black/25 rounded-2xl border border-white/5 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b1530", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                    itemStyle={{ color: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={activeMetric === "accuracy" ? "#3b82f6" : activeMetric === "focus" ? "#6366f1" : "#10b981"}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#0d1322" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>
        </div>

        {/* Right: Growth Insights */}
        <div className="lg:col-span-4">
          <GlassCard className="bg-[#0b1530] border border-blue-500/20 text-white shadow-lg p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
                <Target className="h-4.5 w-4.5 text-[#3b82f6]" /> Performance Metrics
              </h3>
              <p className="text-[11px] text-blue-200/60 leading-relaxed">
                Subjective evaluations verify core competencies:
              </p>

              <div className="space-y-3">
                {[
                  { title: "Calculus Limits", score: 85, color: "bg-[#3b82f6]" },
                  { title: "React Hooks Lifecycle", score: 92, color: "bg-[#6366f1]" },
                  { title: "System Design Patterns", score: 74, color: "bg-emerald-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span>{item.title}</span>
                      <span className="text-[#3b82f6] font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-[#3b82f6]/5 border border-[#3b82f6]/10 p-3 rounded-xl text-[10px] text-slate-300 leading-relaxed font-mono">
              Asha suggests focusing on System Design review logs before executing upcoming coding trials.
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
