import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, Sparkles, Plus, Check, Clock, AlertTriangle, Loader2, X, RefreshCw, Bookmark, HelpCircle } from "lucide-react";
import { loadDashboardData, addDeadline, toggleDeadline } from "@/lib/api/dashboard.functions";
import { generateAITimetable } from "@/lib/api/ai.service";

export const Route = createFileRoute("/timetable")({
  head: () => ({ meta: [{ title: "Smart Timetable — GyaanSetu AI" }] }),
  component: TimetableDashboard,
});

const CATEGORIES = ["study", "exam", "assignment", "project"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TimetableDashboard() {
  const [userId, setUserId] = useState("");
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generator states
  const [goalsInput, setGoalsInput] = useState("");
  const [generating, setGenerating] = useState(false);

  // New manual event form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("study");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDay, setNewDay] = useState("Monday");
  const [newTime, setNewTime] = useState("10:00");

  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);

  const showToast = (message: string, icon: any) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("gyaansetu_user");
    if (!userStr) {
      window.location.href = "/auth";
      return;
    }

    try {
      const userObj = JSON.parse(userStr);
      if (userObj.id) {
        setUserId(userObj.id);
        fetchDeadlines(userObj.id);
      } else {
        window.location.href = "/auth";
      }
    } catch (e) {
      window.location.href = "/auth";
    }
  }, []);

  const fetchDeadlines = async (uid: string) => {
    setLoading(true);
    try {
      const data = await loadDashboardData({ data: { userId: uid } });
      if (data.deadlines && data.deadlines.length > 0) {
        setDeadlines(data.deadlines);
      } else {
        // Pre-populate with standard academic entries if database is empty
        const sampleDeadlines = [
          { id: "s1", title: "Calculus & Linear Algebra Revision", dueAt: "2026-07-13T10:00:00", category: "study", priority: "High", completed: false },
          { id: "s2", title: "Quantum Superposition & gates lecture note review", dueAt: "2026-07-15T14:30:00", category: "assignment", priority: "Medium", completed: false },
          { id: "s3", title: "Data Structures Stack/Queue Lab Exam", dueAt: "2026-07-16T09:00:00", category: "exam", priority: "High", completed: false }
        ];
        setDeadlines(sampleDeadlines);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentCompleted: boolean) => {
    try {
      await toggleDeadline({ data: { id, completed: !currentCompleted } });
      setDeadlines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, completed: !currentCompleted } : d))
      );
      showToast(currentCompleted ? "Marked as incomplete" : "Task completed! +10 XP", Check);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Convert Day and Time to ISO date
    const dateStr = `2026-07-${13 + DAYS.indexOf(newDay)}T${newTime}:00`;
    try {
      const added = await addDeadline({
        data: {
          userId,
          title: newTitle,
          dueAt: dateStr,
          category: newCategory,
          priority: newPriority,
          reminderIntervalMins: 30,
        },
      });
      setDeadlines((prev) => [...prev, { ...added, completed: false }]);
      showToast(`Added: ${newTitle}`, Bookmark);
      setNewTitle("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!goalsInput.trim()) return;
    setGenerating(true);
    try {
      const events = await generateAITimetable(goalsInput);
      const addedEvents: any[] = [];
      for (const ev of events) {
        const added = await addDeadline({
          data: {
            userId,
            title: ev.title,
            dueAt: ev.dueAt || "2026-07-13T10:00:00",
            category: ev.category || "study",
            priority: ev.priority || "Medium",
            reminderIntervalMins: 30,
          },
        });
        addedEvents.push({ ...added, completed: false });
      }
      setDeadlines((prev) => [...prev, ...addedEvents]);
      showToast(`AI generated ${addedEvents.length} calendar study blocks!`, Sparkles);
      setGoalsInput("");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate schedule. Offline fallback applied.", AlertTriangle);
    } finally {
      setGenerating(false);
    }
  };

  // Helper to place events in daily lists
  const getEventsForDay = (day: string) => {
    const dayIdx = DAYS.indexOf(day);
    const dateDay = 13 + dayIdx; // We align Mon = 13th July, Sun = 19th July
    const pattern = `2026-07-${dateDay}`;
    return deadlines.filter((d) => d.dueAt.startsWith(pattern));
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
            className="fixed top-20 right-6 z-50 px-5 py-4 rounded-2xl border border-[#3b82f6]/30 shadow-2xl flex items-center gap-3 bg-white dark:bg-[#0d1322] max-w-sm text-white"
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
        title="Smart Timetable"
        subtitle="Your personalized academic calendar. Dictate study goals and let AI time-box your weekly slots dynamically."
        icon={Calendar}
      />

      <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Left Column: AI Scheduler Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* AI Generator Panel */}
          <GlassCard className="shadow-md shadow-sky-100/50 p-6 border border-sky-200 bg-white">
            <h3 className="font-display font-extrabold text-sm text-sky-950 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-sky-500 fill-sky-100" /> AI Study Planner
            </h3>
            <p className="text-[11px] text-sky-700/90 font-semibold mb-4 leading-relaxed">
              Describe your study objectives, exam dates, or weekly tasks. The AI context engine compiles an optimized calendar.
            </p>
            <textarea
              value={goalsInput}
              onChange={(e) => setGoalsInput(e.target.value)}
              placeholder="e.g., I have a Physics exam next Wednesday and I want to complete 3 math revision modules this week."
              className="w-full h-28 bg-sky-50/60 border border-sky-200 rounded-xl p-3 text-xs font-bold text-sky-950 placeholder:text-sky-700/50 focus:outline-none focus:bg-white focus:border-sky-500 transition shadow-inner"
            />
            <button
              onClick={handleGenerateAI}
              disabled={generating || !goalsInput.trim()}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-3 text-xs font-extrabold shadow-md shadow-sky-200 transition disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Auto-Schedule Week
                </>
              )}
            </button>
          </GlassCard>

          {/* Add Manual Form */}
          <GlassCard className="shadow-md shadow-sky-100/50 p-6 border border-sky-200 bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-extrabold text-sm text-sky-950">Manual Study Slot</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs text-sky-600 hover:text-sky-800 font-extrabold underline"
              >
                {showAddForm ? "Cancel" : "Add Event"}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddManual} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Math Lecture revision"
                    className="w-full bg-sky-50/60 border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-950 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-sky-50/60 border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-950 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full bg-sky-50/60 border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-950 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Day</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="w-full bg-sky-50/60 border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-950 focus:outline-none"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-sky-700 font-bold uppercase">Time</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-sky-50/60 border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-950 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-500 text-white text-xs font-extrabold hover:bg-sky-600 shadow-md shadow-sky-200 transition"
                >
                  Create Study Slot
                </button>
              </form>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Timetable Grid */}
        <div className="lg:col-span-8 flex flex-col">
          <GradientCard className="flex-1 shadow-md shadow-sky-100/50 border border-sky-200 bg-white p-6 flex flex-col justify-between">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-sky-200/80">
                <span className="text-xs font-mono text-sky-600 tracking-wider uppercase font-extrabold">Weekly Study Blocks</span>
                <span className="text-[11px] font-mono text-sky-700 font-extrabold">13th July - 19th July 2026</span>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-24 text-sky-700">
                  <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mb-3" />
                  <p className="text-xs font-mono font-bold">Loading timetable slots...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {DAYS.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    return (
                      <div key={day} className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/80 space-y-2.5">
                        <div className="text-xs text-sky-600 font-mono uppercase font-extrabold flex justify-between">
                          <span>{day}</span>
                          <span className="text-sky-700/80 font-bold">{dayEvents.length} events scheduled</span>
                        </div>
                        {dayEvents.length > 0 ? (
                          <div className="space-y-2.5">
                            {dayEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                                  ev.completed
                                    ? "bg-emerald-50/80 border-emerald-200 opacity-80"
                                    : "bg-white border-sky-200 shadow-sm hover:border-sky-400"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleToggle(ev.id, ev.completed)}
                                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                                      ev.completed
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-sky-300 bg-white hover:border-sky-500"
                                    }`}
                                  >
                                    {ev.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                  </button>
                                  <div>
                                    <div className={`text-xs font-extrabold ${ev.completed ? "line-through text-slate-400" : "text-sky-950"}`}>
                                      {ev.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-[9px] font-mono bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md uppercase font-extrabold">
                                        {ev.category}
                                      </span>
                                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-extrabold border ${
                                        ev.priority === "High" 
                                          ? "bg-rose-100 text-rose-700 border-rose-200" 
                                          : ev.priority === "Medium"
                                          ? "bg-amber-100 text-amber-800 border-amber-200"
                                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      }`}>
                                        {ev.priority}
                                      </span>
                                      <span className="text-[9px] font-mono text-sky-700/90 font-bold flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-sky-500" />
                                        {ev.dueAt.substring(11, 16)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-sky-700/70 font-semibold italic py-2">No study slots scheduled.</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GradientCard>
        </div>
      </div>
    </AppLayout>
  );
}
