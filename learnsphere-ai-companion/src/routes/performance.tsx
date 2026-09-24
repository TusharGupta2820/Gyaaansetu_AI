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
      <div className="bg-sky-50/40 -m-4 sm:-m-6 p-4 sm:p-6 rounded-3xl min-h-screen">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl border border-sky-300 shadow-xl bg-white text-xs text-sky-950 font-semibold"
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
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-md shadow-sky-100/50 relative overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-sky-100/80 text-sky-700 border border-sky-200 rounded-full px-3.5 py-1 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  Cognitive Growth Engine
                </div>
                <h1 className="mt-3 text-2xl lg:text-3xl font-display font-extrabold text-sky-950">Your Weekly Learning Output</h1>
                <p className="mt-2 text-sky-700/80 max-w-xl text-xs leading-relaxed">
                  Analysis of study sessions shows an 8% increase in long-term memory retrieval accuracy compared to last week.
                </p>
              </div>
              <div>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white px-5 py-3.5 text-xs font-bold shadow-md shadow-sky-200 hover:shadow-sky-300 hover:scale-[1.02] transition"
                >
                  <Download className="h-4 w-4" /> Export Report (PDF)
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setActiveMetric("accuracy")}
            className={`p-5 rounded-3xl shadow-sm text-left transition hover:scale-[1.02] border ${
              activeMetric === "accuracy"
                ? "bg-white border-sky-400 ring-2 ring-sky-300/50 shadow-md shadow-sky-100"
                : "bg-white/80 hover:bg-white border-sky-200/80"
            }`}
          >
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Test Accuracy</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">88%</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono font-medium">Select to view graph</div>
          </button>

          <button
            onClick={() => setActiveMetric("focus")}
            className={`p-5 rounded-3xl shadow-sm text-left transition hover:scale-[1.02] border ${
              activeMetric === "focus"
                ? "bg-white border-sky-400 ring-2 ring-sky-300/50 shadow-md shadow-sky-100"
                : "bg-white/80 hover:bg-white border-sky-200/80"
            }`}
          >
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Focus Health</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">92/100</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono font-medium">Select to view graph</div>
          </button>

          <button
            onClick={() => setActiveMetric("time")}
            className={`p-5 rounded-3xl shadow-sm text-left transition hover:scale-[1.02] border ${
              activeMetric === "time"
                ? "bg-white border-sky-400 ring-2 ring-sky-300/50 shadow-md shadow-sky-100"
                : "bg-white/80 hover:bg-white border-sky-200/80"
            }`}
          >
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Study Duration</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">28.3 hrs</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono font-medium">Select to view graph</div>
          </button>

          <div className="bg-white border border-sky-200/80 p-5 rounded-3xl shadow-sm text-left">
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Global Ranking</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">#284</div>
            <div className="text-[9px] text-sky-600/90 mt-2 font-mono font-semibold bg-sky-100/70 px-2 py-0.5 rounded-full inline-block">Top 2% of platform</div>
          </div>
        </div>

        {/* Main Charts & Side panel */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
          {/* Left: Recharts graph */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-sky-200 rounded-3xl shadow-md shadow-sky-100/50 p-6 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center pb-3 border-b border-sky-100 mb-4">
                <div>
                  <span className="text-xs font-mono text-sky-700 tracking-wider uppercase font-extrabold">
                    {activeMetric.toUpperCase()} TREND ANALYSIS
                  </span>
                  <span className="text-[10px] font-mono text-sky-500 ml-3">Interval: Last 7 Days</span>
                </div>
              </div>

              {/* Recharts Container in Clean Sky Blue / White */}
              <div className="h-[280px] w-full bg-sky-50/60 rounded-2xl border border-sky-200/80 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis dataKey="day" stroke="#0284c7" tick={{ fill: "#0369a1", fontSize: 11, fontWeight: 600 }} />
                    <YAxis stroke="#0284c7" tick={{ fill: "#0369a1", fontSize: 11, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#7dd3fc",
                        color: "#0c4a6e",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15)",
                        fontWeight: 600
                      }}
                      itemStyle={{ color: "#0284c7" }}
                    />
                    <Line
                      type="monotone"
                      dataKey={activeMetric}
                      stroke="#0284c7"
                      strokeWidth={3.5}
                      dot={{ r: 5, strokeWidth: 2, fill: "#0ea5e9", stroke: "#ffffff" }}
                      activeDot={{ r: 7, fill: "#0284c7" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Growth Insights */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-sky-200 rounded-3xl shadow-md shadow-sky-100/50 p-6 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display font-extrabold text-sm text-sky-950 flex items-center gap-2">
                  <Target className="h-4.5 w-4.5 text-sky-600" /> Performance Metrics
                </h3>
                <p className="text-[11px] text-sky-700/80 leading-relaxed font-medium">
                  Subjective evaluations verify core competencies:
                </p>

                <div className="space-y-3.5">
                  {[
                    { title: "Calculus Limits", score: 85, color: "bg-sky-500" },
                    { title: "React Hooks Lifecycle", score: 92, color: "bg-sky-400" },
                    { title: "System Design Patterns", score: 74, color: "bg-sky-600" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-sky-900 font-semibold">{item.title}</span>
                        <span className="text-sky-600 font-bold">{item.score}%</span>
                      </div>
                      <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-sky-50 border border-sky-200/80 p-3.5 rounded-2xl text-[10px] text-sky-900 leading-relaxed font-mono font-medium">
                Asha suggests focusing on System Design review logs before executing upcoming coding trials.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
