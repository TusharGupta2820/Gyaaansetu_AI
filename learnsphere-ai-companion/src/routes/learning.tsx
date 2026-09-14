import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { loadCourses, updateCourseProgress, saveCourse } from "@/lib/api/learning.functions";
import { generateAICourse } from "@/lib/api/ai.service";
import { 
  BookOpen, Sparkles, Play, Award, Bookmark, ArrowRight, 
  Check, RefreshCw, X, FileText, Download, Info, Zap,
  Mic, Paperclip, FileUp, ChevronRight
} from "lucide-react";

export const Route = createFileRoute("/learning")({
  head: () => ({ meta: [{ title: "Learning Path — GyaanSetu AI" }] }),
  component: LearningDashboard,
});

// Mock course database removed. Powered by SQLite backend.

function LearningDashboard() {
  const [userId, setUserId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");
  
  // Modal states
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [activeModalList, setActiveModalList] = useState<string | null>(null);

  // Resume states
  const [resuming, setResuming] = useState(false);

  // AI Input Hub States
  const [hubMode, setHubMode] = useState<"none" | "voice" | "upload" | "text">("none");
  const [recording, setRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [submittingHub, setSubmittingHub] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);

  const showToast = (message: string, icon: any) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync session and load from DB
  useEffect(() => {
    const userStr = localStorage.getItem("gyaansetu_user");
    if (!userStr) {
      window.location.href = "/auth";
      return;
    }

    let activeId = "";
    try {
      const userObj = JSON.parse(userStr);
      if (userObj.id) {
        activeId = userObj.id;
        setUserId(userObj.id);
      }
    } catch (e) {
      window.location.href = "/auth";
      return;
    }

    if (!activeId) {
      window.location.href = "/auth";
      return;
    }

    loadCourses({ data: { userId: activeId } })
      .then((data) => {
        setCourses(data);
      })
      .catch((err) => {
        console.error("Failed to load courses from DB:", err);
      });
  }, []);

  const handleResumeCourse = async () => {
    setResuming(true);
    // Find first React course to resume (either "react" or "react-user_id")
    const reactCourse = courses.find(c => c.id.startsWith("react"));
    if (!reactCourse) {
      setResuming(false);
      return;
    }
    
    try {
      await updateCourseProgress({ data: { id: reactCourse.id, progress: 88, tag: "88% done" } });
      setCourses(prev => prev.map(c => {
        if (c.id === reactCourse.id) {
          return { ...c, progress: 88, tag: "88% done" };
        }
        return c;
      }));
      showToast("Advanced React Patterns progressed to 88%! +50 XP", Award);
    } catch (err) {
      console.error("Failed to update course progress in DB:", err);
    } finally {
      setResuming(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    if (activeTab === "in-progress") return c.progress > 0 && c.progress < 100;
    if (activeTab === "completed") return c.progress === 100;
    return true;
  });

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
        title="Learning Path" 
        subtitle="Your Netflix-style learning hub — recommended, in-progress, and completed courses curated by AI." 
        icon={BookOpen} 
      />

      {/* AI Input Hub Panel */}
      <div className="mb-6 bg-white dark:bg-[#0b1530] border border-sky-200/80 dark:border-blue-500/20 text-slate-900 dark:text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-sky-200/60 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#3b82f6]" />
              <span className="font-display font-bold text-sm text-slate-900 dark:text-white">AI Course Generator</span>
            </div>
            <span className="text-[9px] font-mono text-blue-300 uppercase tracking-wider">Upload Syllabus or Dictate Topics</span>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {/* Voice option */}
            <button
              onClick={() => {
                setHubMode(hubMode === "voice" ? "none" : "voice");
                setVoiceText("");
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition text-left ${
                hubMode === "voice" ? "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-white" : "bg-sky-50 dark:bg-slate-800/40 border-sky-200 dark:border-slate-700/30 text-slate-700 dark:text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#3b82f6]" />
                <span className="text-xs font-semibold text-white">Voice Topic Input</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-blue-300" />
            </button>

            {/* Document option */}
            <button
              onClick={() => {
                setHubMode(hubMode === "upload" ? "none" : "upload");
                setSelectedFile(null);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition text-left ${
                hubMode === "upload" ? "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-white" : "bg-sky-50 dark:bg-slate-800/40 border-sky-200 dark:border-slate-700/30 text-slate-700 dark:text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-[#3b82f6]" />
                <span className="text-xs font-semibold text-white">Upload Syllabus PDF</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-blue-300" />
            </button>

            {/* Text option */}
            <button
              onClick={() => {
                setHubMode(hubMode === "text" ? "none" : "text");
                setPastedText("");
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition text-left ${
                hubMode === "text" ? "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-white" : "bg-sky-50 dark:bg-slate-800/40 border-sky-200 dark:border-slate-700/30 text-slate-700 dark:text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#3b82f6]" />
                <span className="text-xs font-semibold text-white">Paste Syllabus Outline</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-blue-300" />
            </button>
          </div>

          {/* Conditional Input Areas */}
          <AnimatePresence>
            {hubMode === "voice" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-3 bg-slate-100/90 dark:bg-[#050816] rounded-xl border border-sky-200/60 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-700 dark:text-slate-400">Microphone Input</span>
                  {recording && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
                </div>
                {recording ? (
                  <div className="flex items-center justify-center gap-1.5 py-4">
                    {[1,2,3,4,5].map(i => (
                      <motion.span key={i} animate={{ height: [6, 20, 6] }} transition={{ duration: 0.5 + i*0.1, repeat: Infinity }} className="w-0.5 bg-red-400 rounded-full" />
                    ))}
                  </div>
                ) : voiceText ? (
                  <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-mono">"{voiceText}"</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Click Start Recording to dictate your study topic...</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (recording) {
                        setRecording(false);
                        setVoiceText("Create an intensive curriculum for Quantum Superposition algorithms and quantum gates.");
                        showToast("Voice topic transcribed successfully!", Mic);
                      } else {
                        setRecording(true);
                        setVoiceText("");
                        setTimeout(() => {
                          setRecording(false);
                          setVoiceText("Create an intensive curriculum for Quantum Superposition algorithms and quantum gates.");
                          showToast("Voice topic transcribed successfully!", Mic);
                        }, 2500);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition"
                  >
                    {recording ? "Stop Dictation" : "Start Recording"}
                  </button>
                  {voiceText && (
                    <button
                      onClick={async () => {
                        setSubmittingHub(true);
                        try {
                          const generated = await generateAICourse(voiceText);
                          const payload = {
                            userId,
                            title: generated.title || "Quantum Algorithms",
                            desc: generated.desc || "Learn quantum gates, superposition math, and Shor's algorithms.",
                            tag: generated.tag || "Custom",
                            progress: 0,
                            hours: generated.hours || "18 hours total",
                            syllabus: generated.syllabus || ["Vector Spaces & qubits", "Hadamard & Pauli Gates"],
                          };
                          const saved = await saveCourse({ data: payload });
                          setCourses(prev => [saved, ...prev]);
                          showToast(`${saved.title} custom course generated!`, Zap);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSubmittingHub(false);
                          setHubMode("none");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-[#3b82f6] text-[#050816] text-xs font-bold hover:scale-105 transition ml-auto"
                    >
                      {submittingHub ? "Generating..." : "Generate Course"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {hubMode === "upload" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-slate-100/90 dark:bg-[#050816] rounded-xl border border-sky-200/60 dark:border-white/5 space-y-4">
                <div className="border border-dashed border-sky-200/80 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#3b82f6]/40 transition cursor-pointer bg-slate-900/40"
                  onClick={() => {
                    setSelectedFile("syllabus_advanced_math.pdf");
                    showToast("Uploaded syllabus_advanced_math.pdf", FileUp);
                  }}
                >
                  <FileUp className="h-8 w-8 text-[#3b82f6] mb-2" />
                  {selectedFile ? (
                    <span className="text-xs text-slate-900 dark:text-white font-mono font-bold">{selectedFile}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground text-center">Drag and drop syllabus here, or click to upload PDF/Doc</span>
                  )}
                </div>
                {selectedFile && (
                  <button
                    onClick={async () => {
                      setSubmittingHub(true);
                      try {
                        const generated = await generateAICourse(`A syllabus file named ${selectedFile || 'syllabus_advanced_math.pdf'} containing engineering mathematical topics like laplace transforms, residues, and fourier integrals.`);
                        const payload = {
                          userId,
                          title: generated.title || "Advanced Engineering Math",
                          desc: generated.desc || "Differential equations, Laplace transforms, and complex variable mapping.",
                          tag: generated.tag || "Custom",
                          progress: 0,
                          hours: generated.hours || "22 hours total",
                          syllabus: generated.syllabus || ["Fourier Series integrals", "Laplace transforms"],
                        };
                        const saved = await saveCourse({ data: payload });
                        setCourses(prev => [saved, ...prev]);
                        showToast(`AI custom course generated from ${selectedFile}!`, Zap);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSubmittingHub(false);
                        setHubMode("none");
                      }
                    }}
                    className="w-full py-2 rounded-lg bg-[#3b82f6] text-[#050816] text-xs font-bold hover:scale-[1.01] transition"
                  >
                    {submittingHub ? "Analyzing syllabus..." : "Generate Custom Course"}
                  </button>
                )}
              </motion.div>
            )}

            {hubMode === "text" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-3 bg-slate-100/90 dark:bg-[#050816] rounded-xl border border-sky-200/60 dark:border-white/5 space-y-3">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste custom study notes or topics here..."
                  className="w-full h-24 bg-black/40 border border-sky-200/80 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#3b82f6]/40 font-mono"
                />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (!pastedText) return;
                      setSubmittingHub(true);
                      try {
                        const generated = await generateAICourse(pastedText);
                        const payload = {
                          userId,
                          title: generated.title || "Custom Course",
                          desc: generated.desc || "Custom generated curriculum outline.",
                          tag: generated.tag || "Custom",
                          progress: 0,
                          hours: generated.hours || "10 hours total",
                          syllabus: generated.syllabus || ["Introduction", "Core Concepts"],
                        };
                        const saved = await saveCourse({ data: payload });
                        setCourses(prev => [saved, ...prev]);
                        showToast("AI custom course generated from pasted text outline!", Zap);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSubmittingHub(false);
                        setHubMode("none");
                      }
                    }}
                    disabled={!pastedText}
                    className="px-4 py-2 rounded-lg bg-[#3b82f6] text-[#050816] text-xs font-bold hover:scale-105 transition disabled:opacity-50"
                  >
                    {submittingHub ? "Analyzing text..." : "Generate Course"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main CTA Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <GradientCard className="overflow-hidden relative p-6 rounded-3xl shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-sky-100 dark:bg-[#3b82f6]/10 text-sky-800 dark:text-[#3b82f6] border border-sky-300 dark:border-[#3b82f6]/20 rounded-full px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3 w-3 text-sky-600 dark:text-[#3b82f6]" />
                Powered by GyaanSetu AI
              </div>
              <h1 className="mt-3 text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-white">
                Netflix-Style Learning Hub
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-600 dark:text-blue-200/60 max-w-xl text-xs leading-relaxed font-medium">
                Resume where you left off or customize nodes using offline local model recommendations. Current active course: <span className="font-bold text-slate-900 dark:text-white">Advanced React Patterns</span>.
              </p>
            </div>
            <div>
              <button 
                onClick={handleResumeCourse}
                disabled={resuming}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 dark:bg-gradient-to-r dark:from-[#3b82f6] dark:to-[#6366f1] px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-white dark:text-[#050816] hover:scale-[1.02] transition disabled:opacity-50 shadow-sm"
              >
                {resuming ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Loading Session...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white dark:fill-[#050816]" /> Resume Last Course
                  </>
                )}
              </button>
            </div>
          </div>
        </GradientCard>
      </motion.div>

      {/* 4 Interactive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { id: "progress", label: "Courses In Progress", value: "3 courses", color: "text-sky-600 dark:text-[#3b82f6]" },
          { id: "completed", label: "Completed", value: "23 courses", color: "text-emerald-600 dark:text-emerald-500" },
          { id: "certs", label: "Certificates", value: "11 credentials", color: "text-amber-600 dark:text-amber-500" },
          { id: "recommend", label: "AI Recommended", value: "18 paths", color: "text-indigo-600 dark:text-[#6366f1]" }
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => { setActiveModalList(st.id); showToast(`Opening logs for ${st.label}`, Info); }}
            className="bg-white dark:bg-[#0b1530] border border-sky-200 dark:border-blue-500/20 p-5 rounded-3xl shadow-xs dark:shadow-md text-left transition hover:scale-[1.02] group text-slate-900 dark:text-white hover:border-sky-300 dark:hover:border-[#3b82f6]/30"
          >
            <div className="text-[10px] text-sky-700 dark:text-blue-300 uppercase font-mono tracking-wider font-bold">{st.label}</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 leading-none">{st.value.split(" ")[0]}</div>
            <div className={`text-[9px] mt-2 underline ${st.color} font-bold font-mono`}>
              Click to view {st.value.split(" ")[1]}
            </div>
          </button>
        ))}
      </div>

      {/* Grid Tabs Filter */}
      <div className="flex gap-2 mb-4">
        {["all", "in-progress", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition capitalize ${
              activeTab === tab 
                ? "bg-sky-100 dark:bg-[#3b82f6]/10 text-sky-800 dark:text-[#3b82f6] border border-sky-300 dark:border-[#3b82f6]/30 font-bold" 
                : "text-slate-600 dark:text-slate-500 dark:text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Grid of Courses */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c, i) => (
          <motion.div
            key={c.id}
            whileHover={{ y: -3 }}
            onClick={() => { setSelectedCourse(c); showToast(`Details loaded for ${c.title}`, Bookmark); }}
            className="cursor-pointer"
          >
            <div className="bg-white dark:bg-[#0b1530] border border-sky-200 dark:border-blue-500/20 p-5 rounded-3xl shadow-xs dark:shadow-md hover:shadow-md transition-all h-full flex flex-col justify-between text-slate-900 dark:text-white">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-8.5 w-8.5 rounded-xl bg-sky-600 dark:bg-gradient-to-br dark:from-[#3b82f6] dark:to-[#6366f1] flex items-center justify-center text-white dark:text-[#050816] font-bold text-xs font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {c.tag && (
                    <span className="text-[9px] font-bold font-mono bg-sky-100 dark:bg-[#3b82f6]/10 px-2 py-0.5 rounded text-sky-800 dark:text-[#3b82f6] border border-sky-300 dark:border-[#3b82f6]/20">
                      {c.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1.5">{c.title}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-600 dark:text-blue-200/60 leading-relaxed font-medium">{c.desc}</p>
              </div>

              {/* Progress visual inside card */}
              <div className="mt-4 pt-3 border-t border-sky-200/60 dark:border-white/5">
                <div className="flex justify-between items-center text-[10px] text-blue-300 font-mono mb-1">
                  <span>Current Progress</span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.progress}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1] rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </div>

      {/* Pop-up Modals for interactive logs */}
      <AnimatePresence>
        
        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0d1322] border border-[#3b82f6]/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden text-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-2xl" />

              <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 dark:border-white/5 mb-4">
                <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="h-4.5 w-4.5 text-[#3b82f6]" />
                  Curriculum Details
                </h4>
                <button onClick={() => setSelectedCourse(null)} className="text-slate-700 dark:text-slate-400 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-[9px] text-blue-300 uppercase font-mono font-bold">Course Title</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedCourse.title}</div>
                </div>

                <div>
                  <div className="text-[9px] text-blue-300 uppercase font-mono font-bold">Estimated Time</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{selectedCourse.hours}</div>
                </div>

                <div>
                  <div className="text-[9px] text-blue-300 uppercase font-mono font-bold mb-1.5">Syllabus Milestones</div>
                  <div className="space-y-1.5">
                    {selectedCourse.syllabus.map((syl: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center text-[10.5px] text-slate-700 dark:text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-sky-200/60 dark:border-white/5 font-mono">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {syl}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCourse.progress < 100 ? (
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      handleResumeCourse();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-[#050816] font-bold text-xs shadow-md glow-cyan"
                  >
                    Start Study Unit
                  </button>
                ) : (
                  <div className="text-center py-2.5 bg-emerald-500/10 text-[10px] text-emerald-400 font-bold rounded-xl border border-emerald-500/20">
                    Course Fully Completed!
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Stats Lists Modal */}
        {activeModalList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0d1322] border border-[#3b82f6]/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden text-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/5 rounded-full blur-2xl" />

              <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 dark:border-white/5 mb-4">
                <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-[#6366f1]" />
                  {activeModalList === "progress" && "Active Courses"}
                  {activeModalList === "completed" && "Completed Courses"}
                  {activeModalList === "certs" && "Your Certifications"}
                  {activeModalList === "recommend" && "AI Recommended Sprints"}
                </h4>
                <button onClick={() => setActiveModalList(null)} className="text-slate-700 dark:text-slate-400 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeModalList === "progress" && (
                  courses.filter(c => c.progress > 0 && c.progress < 100).map((c) => (
                    <div key={c.id} className="p-3 bg-slate-900/40 border border-sky-200/60 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                        <div className="text-[10px] text-slate-600 dark:text-blue-200/60 mt-0.5">{c.hours} remaining</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#3b82f6]">{c.progress}% done</span>
                    </div>
                  ))
                )}

                {activeModalList === "completed" && (
                  courses.filter(c => c.progress === 100).map((c) => (
                    <div key={c.id} className="p-3 bg-slate-900/40 border border-sky-200/60 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                        Completed
                      </span>
                    </div>
                  ))
                )}

                {activeModalList === "certs" && (
                  [
                    { name: "AWS Cloud Architect Cert", code: "AWS-SAP-892" },
                    { name: "Advanced React Patterns Diploma", code: "GYAANSETU-332" },
                    { name: "Financial Literacy 101 Badge", code: "GYAANSETU-008" }
                  ].map((crt, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 border border-sky-200/60 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{crt.name}</div>
                        <div className="text-[9px] text-slate-600 dark:text-blue-200/60 font-mono mt-0.5">ID: {crt.code}</div>
                      </div>
                      <button 
                        onClick={() => showToast(`Downloading ${crt.name} PDF...`, Download)}
                        className="p-2 bg-sky-50 dark:bg-slate-800/40 border border-sky-200 dark:border-slate-700/30 rounded-xl hover:bg-slate-800/60 text-white transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}

                {activeModalList === "recommend" && (
                  [
                    { name: "Generative AI Agent orchestration", reason: "98% math match" },
                    { name: "High-Performance Rust Sockets", reason: "SysDesign follow-up" },
                    { name: "UI Design Micro-animations", reason: "Growth Edge support" }
                  ].map((rec, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 border border-sky-200/60 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{rec.name}</div>
                        <div className="text-[9px] text-[#6366f1] font-semibold mt-0.5">{rec.reason}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveModalList(null);
                          showToast("Added to study path!", Zap);
                        }}
                        className="p-1.5 bg-[#3b82f6] text-[#050816] rounded-lg hover:scale-105 transition font-bold"
                      >
                        + Add
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActiveModalList(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-900 dark:text-white transition"
              >
                Close List
              </button>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </AppLayout>
  );
}
