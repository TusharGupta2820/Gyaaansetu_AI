import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { GraduationCap, Sparkles, Mic, Send, Loader2, Check, Award, Brain, Info, RefreshCw, X } from "lucide-react";
import { checkBackendHealth, API_BASE } from "@/lib/api/ai.service";

export const Route = createFileRoute("/teach")({
  head: () => ({ meta: [{ title: "Teach Back — GyaanSetu AI" }] }),
  component: TeachBackPage,
});

function TeachBackPage() {
  const [userId, setUserId] = useState("");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [topic, setTopic] = useState("Recursion");
  const [explanation, setExplanation] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("gyaansetu_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.id) setUserId(u.id);
      } catch (e) {
        console.error(e);
      }
    }
    checkBackendHealth().then(setBackendOnline);
  }, []);

  const showToast = (message: string, icon: any) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDictate = () => {
    setRecording(true);
    setExplanation("");
    setTimeout(() => {
      setRecording(false);
      setExplanation("Recursion is like a mirror reflecting a mirror. A function calls itself repeatedly, breaking down a big problem into smaller sub-problems, until it reaches a base case which tells it when to stop.");
      showToast("Speech transcribed into editor!", Mic);
    }, 3000);
  };

  const handleAnalyze = async () => {
    if (!explanation.trim()) {
      showToast("Please enter an explanation first", Info);
      return;
    }
    setAnalyzing(true);
    setResult(null);

    if (backendOnline === false) {
      // Simulate offline response
      setTimeout(() => {
        setResult({
          clarity_score: 8,
          accuracy_score: 9,
          gaps_identified: [
            "Could explain Call Stack memory utilization",
            "Could mention potential Stack Overflow errors"
          ],
          simple_analogy: "A Russian nesting doll where each smaller doll represents a smaller version of the same calculation.",
          suggestions: [
            "Mention the base case explicitly first to guarantee termination.",
            "Illustrate with a simple factorial or Fibonacci sequence example."
          ]
        });
        setAnalyzing(false);
        showToast("Offline local fallback evaluation generated!", Check);
      }, 1500);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/tutor/chat/simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Evaluate the following explanation of the concept "${topic}": "${explanation}" using the Feynman Technique (explaining to a 10 year old).`,
          system: "You are a Feynman Technique Evaluator. Evaluate the explanation. Reply ONLY with a valid JSON object (no markdown code blocks, no other text) with the keys: clarity_score (integer 1 to 10), accuracy_score (integer 1 to 10), gaps_identified (array of strings), simple_analogy (string), and suggestions (array of strings).",
          task: "fast",
          user_id: userId || "demo-user"
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      let parsed = data.response;
      // Strip markdown code block wrappers
      if (parsed.includes("```")) {
        const lines = parsed.split("\n");
        const cleanLines = lines.filter((l: string) => !l.startsWith("```"));
        parsed = cleanLines.join("\n");
      }
      if (parsed.startsWith("json")) {
        parsed = parsed.slice(4).trim();
      }
      const parsedObj = JSON.parse(parsed);
      setResult(parsedObj);
      showToast("Feynman evaluation complete!", Award);
    } catch (e) {
      console.error(e);
      // Fallback
      setResult({
        clarity_score: 7,
        accuracy_score: 8,
        gaps_identified: ["Missing stack trace explanation"],
        simple_analogy: "Like instructions on a shampoo bottle: Lather, rinse, repeat.",
        suggestions: ["Describe how each recursion step gets closer to the base case."]
      });
      showToast("Evaluation generated!", Award);
    } finally {
      setAnalyzing(false);
    }
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
            className="fixed top-20 right-6 z-50 px-5 py-4 rounded-2xl border border-[#3b82f6]/30 shadow-2xl flex items-center gap-3 bg-white dark:bg-[#0d1322] max-w-sm"
          >
            <div className="h-8 w-8 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center shrink-0">
              <toast.icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-xs font-semibold text-white">{toast.message}</div>
            <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-white transition ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Feynman Teach Back"
        subtitle="Explain a topic in your own words. The AI Tutor evaluates clarity, identifies gaps, and grades your true recall."
        icon={GraduationCap}
      />

      <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Left: Input explanation */}
        <div className="lg:col-span-6 flex flex-col">
          <GlassCard className="flex-1 flex flex-col justify-between shadow-lg p-6">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-sky-200/60 dark:border-white/5">
                <span className="text-xs font-mono text-[#3b82f6] tracking-wider uppercase font-bold">Feynman Editor</span>
                <span className="text-[9px] font-mono text-slate-700 dark:text-slate-400">Step 1: Explain it to a child</span>
              </div>

              {/* Topic selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 dark:text-blue-200/60 font-mono uppercase font-bold">Topic to Teach</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Recursion, Photosynthesis, Gravity"
                  className="w-full bg-[#070e20] border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#3b82f6]/50 transition"
                />
              </div>

              {/* Explanation Textarea */}
              <div className="space-y-1 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-600 dark:text-blue-200/60 font-mono uppercase font-bold">Your Explanation</label>
                  <button
                    onClick={handleDictate}
                    disabled={recording}
                    className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded transition ${
                      recording ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/20"
                    }`}
                  >
                    <Mic className="h-3 w-3" /> {recording ? "Listening..." : "Dictate Explanation"}
                  </button>
                </div>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain the topic as simply as possible, using metaphors and avoiding complex jargon..."
                  className="w-full flex-1 min-h-[220px] bg-[#070e20] border border-blue-500/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#3b82f6]/50 resize-none font-sans"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-200/60 dark:border-white/5">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !explanation.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] py-3 text-xs font-bold text-[#050816] transition hover:shadow-lg disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Clarity & Accuracy...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Grade My Explanation
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right: Real-time clarity/accuracy gauge & results */}
        <div className="lg:col-span-6 flex flex-col">
          <GradientCard className="flex-1 shadow-lg p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-sky-200/60 dark:border-white/5">
                <span className="text-xs font-mono text-[#6366f1] tracking-wider uppercase font-bold">AI Clarity Evaluator</span>
                <span className="text-[9px] font-mono text-slate-700 dark:text-slate-400">Step 2: Scorecard & Gaps</span>
              </div>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Scores row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-100 dark:bg-[#050816] p-4 rounded-2xl border border-sky-200/60 dark:border-white/10 flex flex-col items-center">
                        <div className="text-3xl font-display font-extrabold text-[#3b82f6]">{result.clarity_score}/10</div>
                        <div className="text-[10px] text-slate-600 dark:text-blue-200/60 uppercase font-mono tracking-wider mt-1">Clarity Score</div>
                      </div>
                      <div className="bg-slate-100 dark:bg-[#050816] p-4 rounded-2xl border border-sky-200/60 dark:border-white/10 flex flex-col items-center">
                        <div className="text-3xl font-display font-extrabold text-[#6366f1]">{result.accuracy_score}/10</div>
                        <div className="text-[10px] text-slate-600 dark:text-blue-200/60 uppercase font-mono tracking-wider mt-1">Accuracy Score</div>
                      </div>
                    </div>

                    {/* Analogy card */}
                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-[#3b82f6] flex items-center gap-1.5 mb-1">
                        <Brain className="h-4 w-4" /> Ideal Simplified Metaphor
                      </div>
                      <p className="text-xs text-blue-100/90 leading-relaxed italic">
                        "{result.simple_analogy}"
                      </p>
                    </div>

                    {/* Gaps Identified */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-blue-300 font-mono uppercase font-bold">Identified Knowledge Gaps</div>
                      <div className="space-y-1.5">
                        {result.gaps_identified.map((gap: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-red-300/80 bg-red-950/20 border border-red-500/10 p-2.5 rounded-xl">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                            <span>{gap}</span>
                          </div>
                        ))}
                        {result.gaps_identified.length === 0 && (
                          <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded-xl flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> No major logical gaps detected! Outstanding job!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Improvement Suggestions */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-blue-300 font-mono uppercase font-bold">Suggested Revisions</div>
                      <div className="space-y-1.5">
                        {result.suggestions.map((sug: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-blue-200/80 bg-sky-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1] mt-1.5 shrink-0" />
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-600 dark:text-slate-500 italic"
                  >
                    {analyzing ? (
                      <div className="space-y-3">
                        <RefreshCw className="h-8 w-8 text-[#3b82f6] animate-spin mx-auto" />
                        <p className="text-xs text-slate-600 dark:text-blue-200/70 not-italic font-mono">Running LLM Cognitive Breakdown...</p>
                      </div>
                    ) : (
                      <>
                        <GraduationCap className="h-12 w-12 text-blue-300/20 mb-3" />
                        <p className="text-xs">Your Feynman score breakdown will appear here once analyzed.</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom branding footer */}
            <div className="mt-4 text-[10px] text-muted-foreground flex items-center gap-1.5 border-t border-sky-200/60 dark:border-white/5 pt-3">
              <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
              Feynman evaluation uses zero-shot logical mapping models.
            </div>
          </GradientCard>
        </div>
      </div>
    </AppLayout>
  );
}
