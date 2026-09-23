import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Home, Sparkles, Play, Square, Volume2, ShieldAlert, 
  Settings, Award, RefreshCw, X, Users, BarChart2, BellOff, Info, Check, VolumeX,
  Mic, Paperclip, FileUp, FileText, ChevronRight, CloudRain, Coffee, Trees, Radio, Headphones,
  Laptop, GraduationCap, UserCheck
} from "lucide-react";
import { generateFocusSession } from "@/lib/api/ai.service";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Room — GyaanSetu AI" }] }),
  component: FocusDashboard,
});

const SOUNDSCAPES = [
  { id: "rain", name: "Rain Storm", icon: CloudRain },
  { id: "cafe", name: "Paris Café", icon: Coffee },
  { id: "forest", name: "Summer Forest", icon: Trees },
  { id: "space", name: "Deep Space", icon: Radio },
  { id: "lofi", name: "LoFi Chill Beats", icon: Headphones }
];

const STUDY_MATES = [
  { name: "Aarav Sharma", status: "Focusing (14m left)", icon: Laptop },
  { name: "Dr. Elena Vaneva", status: "Focusing (3m left)", icon: GraduationCap },
  { name: "Mark Thompson", status: "Break (5m)", icon: UserCheck }
];

function FocusDashboard() {
  // Mode Tab State
  const [activeTab, setActiveTab] = useState<"study" | "interview">("study");
  const [botUrl, setBotUrl] = useState("https://gyaaansetu-ai-interviewbot.vercel.app/");
  const [showPortSettings, setShowPortSettings] = useState(false);

  // Timer States
  const [activeDuration, setActiveDuration] = useState(1500); // 25 min default
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Soundscape States
  const [activeSound, setActiveSound] = useState<string | null>(null);
  
  // Customization & Panel States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [shieldActive, setShieldActive] = useState(true);
  
  // Statistics States
  const [todayFocus, setTodayFocus] = useState(168); // 2h 48m = 168 mins

  // Custom AI focus schedule
  const [focusTitle, setFocusTitle] = useState("Deep Work Mode");
  const [focusTasks, setFocusTasks] = useState<string[]>([
    "Review core concepts of your topic",
    "Identify weak sub-topics or formulas",
    "Run a quick self-test or active recall session"
  ]);

  // AI Input Hub States
  const [hubMode, setHubMode] = useState<"none" | "voice" | "upload" | "text">("none");
  const [recording, setRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [submittingHub, setSubmittingHub] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(6);
  const [distractionsCount, setDistractionsCount] = useState(47);

  // Toast State
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);

  const showToast = (message: string, icon: any) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 4000);
  };

  // Timer Tick Logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            setTodayFocus(t => t + Math.floor(activeDuration / 60));
            setSessionsCount(s => s + 1);
            showToast("Congratulations! Focus Session Completed! +1 Session", Award);
            return activeDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, activeDuration]);

  // Adjust duration selectors
  const handleDurationChange = (mins: number) => {
    const secs = mins * 60;
    setActiveDuration(secs);
    setSecondsLeft(secs);
    setTimerActive(false);
    showToast(`Timer duration set to ${mins} minutes.`, Settings);
  };

  const handleToggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
      showToast("Focus session paused.", Play);
    } else {
      setTimerActive(true);
      showToast("Focus session started. Notifications muted.", BellOff);
    }
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setSecondsLeft(activeDuration);
    showToast("Timer reset.", RefreshCw);
  };

  // Format Helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return ((activeDuration - secondsLeft) / activeDuration) * 100;
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
            className="fixed top-20 right-6 z-50 px-5 py-4 rounded-2xl border border-sky-300 shadow-2xl flex items-center gap-3 bg-white text-sky-950 max-w-sm"
          >
            <div className="h-8 w-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
              <toast.icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-xs font-bold text-sky-950">{toast.message}</div>
            <button onClick={() => setToast(null)} className="text-sky-400 hover:text-sky-700 transition ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader 
        title="Focus Room" 
        subtitle="A futuristic deep-work environment with Pomodoro, ambient sounds, and productivity analytics." 
        icon={Home} 
      />

      {/* Futuristic Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-sky-200">
        <div className="flex gap-2 bg-sky-100/90 p-1.5 rounded-2xl border border-sky-300 shadow-xs">
          <button
            onClick={() => setActiveTab("study")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-display transition-all ${
              activeTab === "study"
                ? "bg-sky-600 text-white shadow-md border border-sky-500 font-extrabold"
                : "text-sky-900 hover:text-sky-950 hover:bg-sky-200/80 font-bold"
            }`}
          >
            Study Space & Pomodoro
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-display transition-all flex items-center gap-2 ${
              activeTab === "interview"
                ? "bg-sky-600 text-white shadow-md border border-sky-500 font-extrabold"
                : "text-sky-900 hover:text-sky-950 hover:bg-sky-200/80 font-bold"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-200" />
            DevInterview AI Workspace
          </button>
        </div>

        {activeTab === "interview" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPortSettings(!showPortSettings)}
              className="text-xs text-sky-900 hover:text-sky-950 font-bold transition flex items-center gap-1.5 bg-white border border-sky-300 px-3 py-1.5 rounded-xl shadow-xs"
            >
              <Settings className="h-4 w-4 text-sky-600" />
              Configure Connection
            </button>
          </div>
        )}
      </div>

      {showPortSettings && activeTab === "interview" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl border border-sky-300 bg-sky-50 text-sky-950 max-w-md shadow-md"
        >
          <h4 className="text-xs font-bold text-sky-950 mb-2">DevInterview Bot Connection Address</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={botUrl}
              onChange={(e) => setBotUrl(e.target.value)}
              className="bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs font-mono text-sky-950 focus:outline-none focus:border-sky-500 flex-1"
              placeholder="https://gyaaansetu-ai-interviewbot.vercel.app/"
            />
            <button
              onClick={() => {
                setShowPortSettings(false);
                showToast(`Switched target connection to ${botUrl}`, Check);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl px-4 py-2 text-xs font-extrabold transition"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "study" ? (
        <>
        {/* AI Focus Assistant Panel */}
        <GlassCard className="mb-6 shadow-md bg-white border border-sky-200 p-5 rounded-2xl">
          <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-sky-600" />
              <span className="font-display font-extrabold text-sm text-sky-950">AI Focus Assistant</span>
            </div>
            <span className="text-[10px] font-mono text-sky-700 font-bold uppercase tracking-wider">Upload Study PDFs or Dictate Tasks</span>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {/* Voice option */}
            <button
              onClick={() => {
                setHubMode(hubMode === "voice" ? "none" : "voice");
                setVoiceText("");
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left cursor-pointer ${
                hubMode === "voice" ? "bg-sky-600 border-sky-600 text-white font-extrabold shadow-sm" : "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100 font-bold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mic className={`h-4 w-4 ${hubMode === "voice" ? "text-white" : "text-sky-600"}`} />
                <span className="text-xs">Voice Task Input</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Document option */}
            <button
              onClick={() => {
                setHubMode(hubMode === "upload" ? "none" : "upload");
                setSelectedFile(null);
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left cursor-pointer ${
                hubMode === "upload" ? "bg-sky-600 border-sky-600 text-white font-extrabold shadow-sm" : "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100 font-bold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Paperclip className={`h-4 w-4 ${hubMode === "upload" ? "text-white" : "text-sky-600"}`} />
                <span className="text-xs">Upload Study PDF</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Text option */}
            <button
              onClick={() => {
                setHubMode(hubMode === "text" ? "none" : "text");
                setPastedText("");
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left cursor-pointer ${
                hubMode === "text" ? "bg-sky-600 border-sky-600 text-white font-extrabold shadow-sm" : "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100 font-bold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={`h-4 w-4 ${hubMode === "text" ? "text-white" : "text-sky-600"}`} />
                <span className="text-xs">Paste Study Notes</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Conditional Input Areas */}
          <AnimatePresence>
            {hubMode === "voice" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono font-bold text-sky-800">Microphone Input</span>
                  {recording && <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />}
                </div>
                {recording ? (
                  <div className="flex items-center justify-center gap-1.5 py-4">
                    {[1,2,3,4,5].map(i => (
                      <motion.span key={i} animate={{ height: [6, 20, 6] }} transition={{ duration: 0.5 + i*0.1, repeat: Infinity }} className="w-1 bg-red-500 rounded-full" />
                    ))}
                  </div>
                ) : voiceText ? (
                  <p className="text-xs text-sky-950 font-bold leading-relaxed font-mono bg-white p-3 rounded-xl border border-sky-200">"{voiceText}"</p>
                ) : (
                  <p className="text-xs text-sky-700 italic font-medium">Click Start Recording to dictate focus targets...</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (recording) {
                        setRecording(false);
                        setVoiceText("Study session target: Complete 3 modules on React Hydration optimization.");
                        showToast("Voice goals transcribed!", Mic);
                      } else {
                        setRecording(true);
                        setVoiceText("");
                        setTimeout(() => {
                          setRecording(false);
                          setVoiceText("Study session target: Complete 3 modules on React Hydration optimization.");
                          showToast("Voice goals transcribed!", Mic);
                        }, 2500);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {recording ? "Stop Dictation" : "Start Recording"}
                  </button>
                  {voiceText && (
                    <button
                      onClick={async () => {
                        setSubmittingHub(true);
                        try {
                          const result = await generateFocusSession(voiceText);
                          setFocusTitle(result.title || "Voice Session");
                          if (result.duration) handleDurationChange(result.duration);
                          if (result.soundscape) setActiveSound(result.soundscape);
                          if (result.subtasks) setFocusTasks(result.subtasks);
                          showToast("Focus session updated with voice goals! Ready.", Award);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSubmittingHub(false);
                          setHubMode("none");
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition ml-auto cursor-pointer shadow-xs"
                    >
                      {submittingHub ? "Syncing..." : "Submit to AI"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {hubMode === "upload" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-4">
                <div className="border-2 border-dashed border-sky-300 bg-white rounded-2xl p-6 flex flex-col items-center justify-center hover:border-sky-500 transition cursor-pointer"
                  onClick={() => {
                    setSelectedFile("study_guide_networks.pdf");
                    showToast("Uploaded study_guide_networks.pdf", FileUp);
                  }}
                >
                  <FileUp className="h-8 w-8 text-sky-600 mb-2" />
                  {selectedFile ? (
                    <span className="text-xs text-sky-950 font-mono font-extrabold">{selectedFile}</span>
                  ) : (
                    <span className="text-xs text-sky-700 font-medium text-center">Drag and drop textbook PDF here, or click to upload</span>
                  )}
                </div>
                {selectedFile && (
                  <button
                    onClick={async () => {
                      setSubmittingHub(true);
                      try {
                        const result = await generateFocusSession(`A syllabus/notes guide named ${selectedFile || 'study_guide_networks.pdf'} containing textbook topics to study during the focus session.`);
                        setFocusTitle(result.title || "PDF Guide Session");
                        if (result.duration) handleDurationChange(result.duration);
                        if (result.soundscape) setActiveSound(result.soundscape);
                        if (result.subtasks) setFocusTasks(result.subtasks);
                        showToast("Study guide summarized! Focus block optimized.", Award);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSubmittingHub(false);
                        setHubMode("none");
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
                  >
                    {submittingHub ? "Analyzing text..." : "Summarize & Start Focus"}
                  </button>
                )}
              </motion.div>
            )}

            {hubMode === "text" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your custom notes or exam question outline here..."
                  className="w-full h-24 bg-white border border-sky-300 rounded-xl p-3 text-xs text-sky-950 placeholder:text-sky-400 focus:outline-none focus:border-sky-500 font-mono"
                />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (!pastedText) return;
                      setSubmittingHub(true);
                      try {
                        const result = await generateFocusSession(pastedText);
                        setFocusTitle(result.title || "Custom Study Session");
                        if (result.duration) handleDurationChange(result.duration);
                        if (result.soundscape) setActiveSound(result.soundscape);
                        if (result.subtasks) setFocusTasks(result.subtasks);
                        showToast("Focus session outlines created!", Award);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSubmittingHub(false);
                        setHubMode("none");
                      }
                    }}
                    disabled={!pastedText}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {submittingHub ? "Analyzing..." : "Sync Outline"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Main layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* Left Column: Pomodoro Circular Progress clock */}
        <div className="lg:col-span-7 flex flex-col">
          <GlassCard className="flex-1 flex flex-col justify-between items-center relative overflow-hidden p-6 min-h-[420px] bg-white border border-sky-200 shadow-md">
            
            {/* Top Bar inside Timer */}
            <div className="flex justify-between items-center w-full z-10">
              <div>
                <div className="text-[11px] font-mono text-sky-700 uppercase font-bold tracking-wider">Pomodoro Cycle</div>
                <div className="text-base font-extrabold text-sky-950 mt-0.5">{focusTitle}</div>
              </div>
              <div className="flex gap-1.5">
                {[25, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleDurationChange(m)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      activeDuration === m * 60 
                        ? "bg-sky-600 text-white shadow-xs" 
                        : "bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-900"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Progress & Digital clock */}
            <div className="my-6 relative flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div className={`absolute h-56 w-56 rounded-full border border-sky-200 transition-all duration-700 ${
                timerActive ? "shadow-[0_0_40px_rgba(14,165,233,0.25)] border-sky-400 animate-pulse" : ""
              }`} />
              
              {/* SVG Circle Progress */}
              <svg className="h-52 w-52 transform -rotate-90">
                <circle
                  cx="104"
                  cy="104"
                  r="94"
                  className="stroke-sky-100 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="104"
                  cy="104"
                  r="94"
                  className="stroke-sky-500 fill-none"
                  strokeWidth="8"
                  strokeDasharray="590"
                  strokeDashoffset={590 - (590 * getProgressPercentage()) / 100}
                  transition={{ ease: "linear" }}
                />
              </svg>

              {/* Digital Time display overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-mono font-extrabold text-sky-950 tracking-widest leading-none">
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-[10px] font-mono text-sky-600 font-bold uppercase tracking-widest mt-2">
                  {timerActive ? "Focusing..." : "Paused"}
                </div>
              </div>
            </div>

            {/* AI Focus Tasks Checklist */}
            <div className="w-full max-w-md bg-sky-50 p-4 rounded-2xl border border-sky-200 z-10 mb-6 text-left">
              <div className="text-[11px] text-sky-800 font-mono uppercase font-bold mb-2.5 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-sky-600" /> Focus Tasks Checklist
              </div>
              <div className="space-y-2">
                {focusTasks.map((task, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-sky-900 font-medium">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside Timer */}
            <div className="flex gap-3 w-full max-w-md z-10">
              <button
                onClick={handleToggleTimer}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition hover:scale-[1.02] cursor-pointer shadow-md ${
                  timerActive 
                    ? "bg-amber-500 text-white" 
                    : "bg-sky-600 hover:bg-sky-500 text-white"
                }`}
              >
                {timerActive ? <VolumeX className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                {timerActive ? "Pause Focus" : "Start Focus Session"}
              </button>
              <button
                onClick={handleResetTimer}
                className="bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-950 px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </button>
            </div>

          </GlassCard>
        </div>

        {/* Right Column: Audio Mixers & Online social study */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Soundscapes Control Box */}
          <GlassCard className="flex-1 p-6 flex flex-col justify-between bg-white border border-sky-200 shadow-md rounded-2xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-display font-extrabold text-base text-sky-950">Ambient Soundscapes</h3>
                {activeSound && (
                  <button 
                    onClick={() => { setActiveSound(null); showToast("Ambient soundscapes muted.", Volume2); }}
                    className="text-[10px] text-red-600 font-bold border border-red-200 bg-red-50 rounded px-2 py-0.5 hover:bg-red-100 transition cursor-pointer"
                  >
                    Mute
                  </button>
                )}
              </div>
              <p className="text-xs text-sky-700 font-medium mb-4">Layer ambient sounds to anchor your attention</p>
              
              <div className="grid grid-cols-2 gap-2.5">
                {SOUNDSCAPES.map((snd) => (
                  <button
                    key={snd.id}
                    onClick={() => { setActiveSound(snd.id); showToast(`Ambient sound layer set to ${snd.name}`, Volume2); }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      activeSound === snd.id 
                        ? "bg-sky-600 border-sky-600 text-white font-extrabold shadow-xs"
                        : "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100 font-bold"
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${activeSound === snd.id ? "bg-white/20 text-white" : "bg-sky-100 text-sky-600"}`}>
                      <snd.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs">{snd.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Audio Wave Visualizer */}
            {activeSound && (
              <div className="mt-4 flex items-center justify-center gap-1.5 h-7 bg-sky-50 rounded-xl border border-sky-200 px-3">
                <span className="text-[10px] font-mono text-sky-700 font-bold mr-1 uppercase">Playing:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ height: [6, 16, 6] }}
                    transition={{ duration: 0.8 + i*0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-sky-600 rounded-full"
                  />
                ))}
              </div>
            )}
          </GlassCard>

          {/* Social Study Partners (Crisp White/Sky-50 cards with Skyblue theme) */}
          <GlassCard className="p-6 bg-white border border-sky-200 shadow-md rounded-2xl">
            <h3 className="font-display font-extrabold text-base text-sky-950 mb-1 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-sky-600" /> Virtual Study Room
            </h3>
            <p className="text-xs text-sky-700 font-medium mb-4">Silent focus groups synced live on GyaanSetu</p>
            
            <div className="space-y-2.5">
              {STUDY_MATES.map((sm, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-sky-50/90 border border-sky-200 hover:bg-sky-100/80 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                      <sm.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-sky-950 leading-tight">{sm.name}</div>
                      <div className="text-[10px] text-sky-700 mt-0.5 font-mono font-medium">{sm.status}</div>
                    </div>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${sm.status.includes("Focus") ? "bg-emerald-500 animate-ping" : "bg-amber-400"}`} />
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>

      {/* Grid of 4 Interactive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm hover:border-sky-300 transition">
          <div className="text-[10px] text-sky-700 font-mono font-bold uppercase tracking-wider">Today's Focus</div>
          <div className="text-2xl font-extrabold text-sky-950 mt-1 leading-none">
            {Math.floor(todayFocus / 60)}h {todayFocus % 60}m
          </div>
          <div className="text-[10px] text-sky-800 mt-2 font-medium">Aggregated active minutes</div>
        </div>
        <button 
          onClick={() => { setActiveModal("sessions"); showToast("Opening focus sessions log...", Info); }}
          className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm hover:border-sky-400 transition text-left cursor-pointer hover:scale-[1.01]"
        >
          <div className="text-[10px] text-sky-700 font-mono font-bold uppercase tracking-wider">Sessions</div>
          <div className="text-2xl font-extrabold text-sky-950 mt-1 leading-none">{sessionsCount}</div>
          <div className="text-[10px] text-sky-600 mt-2 font-bold underline">Click to view log</div>
        </button>
        <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm hover:border-sky-300 transition">
          <div className="text-[10px] text-sky-700 font-mono font-bold uppercase tracking-wider">Avg Focus Score</div>
          <div className="text-2xl font-extrabold text-sky-950 mt-1 leading-none">92</div>
          <div className="text-[10px] text-sky-800 mt-2 font-medium">Attention stability rating</div>
        </div>
        <button 
          onClick={() => { setActiveModal("shield"); showToast("Opening distraction alert logs...", Info); }}
          className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm hover:border-sky-400 transition text-left cursor-pointer hover:scale-[1.01]"
        >
          <div className="text-[10px] text-sky-700 font-mono font-bold uppercase tracking-wider">Distractions Blocked</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1 leading-none">{distractionsCount}</div>
          <div className="text-[10px] text-sky-800 mt-2 font-bold underline">Click to view alerts</div>
        </button>
      </div>

      {/* Grid of Features with interactive hooks */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: "timer", title: "Pomodoro Timer", desc: "Customizable work/break cycles with smooth circular progress and gentle audio cues.", tag: "Interactive" },
          { id: "ambient", title: "Ambient Soundscapes", desc: "Rain, café, forest, deep space — 24 layered ambient tracks for any mood.", tag: "Mixer Ready" },
          { id: "lofi", title: "LoFi Music", desc: "Curated chill beats library that adapts tempo to your typing rhythm." },
          { id: "analytics", title: "Focus Analytics", desc: "Heatmaps of your most productive hours and weekly attention trends." },
          { id: "shield", title: "Distraction Shield", desc: "Auto-mutes notifications and blocks distracting tabs during focus blocks." },
          { id: "social", title: "Virtual Study Room", desc: "Join silent rooms with friends — synchronized timers and presence indicators." }
        ].map((it, i) => (
          <motion.div
            key={it.title}
            whileHover={{ y: -3 }}
            onClick={() => {
              if (it.id === "ambient") {
                showToast("Toggle ambient soundscapes above to mix!", Info);
              } else {
                setActiveModal(it.id);
                showToast(`Opening ${it.title} control panel...`, Sparkles);
              }
            }}
            className="cursor-pointer"
          >
            <GlassCard className="h-full bg-white border border-sky-200 hover:border-sky-400 shadow-sm transition p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="h-8.5 w-8.5 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 font-extrabold text-xs">
                  {String(i + 1).padStart(2, "0")}
                </div>
                {it.tag && (
                  <span className="text-[9px] font-mono bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full text-sky-800 font-bold">{it.tag}</span>
                )}
              </div>
              <h3 className="font-display font-extrabold text-sm text-sky-950 mb-1">{it.title}</h3>
              <p className="text-xs text-sky-800 font-medium leading-relaxed">{it.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      </>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <GlassCard className="shadow-xl p-6 bg-white border border-sky-200 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-200 mb-6 z-10 relative">
              <div>
                <h3 className="font-display font-extrabold text-lg text-sky-950 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-600" />
                  DevInterview AI Companion
                </h3>
                <p className="text-xs text-sky-800 font-medium mt-1">
                  A local 3D VRM-driven coding interviewer bot, powered by DeepSeek-R1 (~82.6% HumanEval Accuracy) and local offline voice synthesis.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Target: {botUrl}
                </span>
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1 shadow-xs"
                >
                  Open in New Tab
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Iframing the Bot */}
            <div className="w-full rounded-2xl overflow-hidden border border-sky-300 bg-sky-50 shadow-inner relative z-10">
              <iframe
                src={botUrl}
                title="DevInterview Bot"
                className="w-full h-[680px] border-none"
                allow="microphone; camera; display-capture"
              />
            </div>

            {/* Launch Instructions Helper */}
            <div className="mt-6 p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-2 z-10 relative">
              <h4 className="text-xs font-extrabold text-sky-950 flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-600" />
                How to start the DevInterview Bot locally?
              </h4>
              <p className="text-xs text-sky-800 font-medium leading-relaxed">
                Since DevInterview.AI runs completely offline with 0 cloud dependencies, it connects to your GyaanSetu local backend. To run:
              </p>
              <ol className="list-decimal list-inside text-xs text-sky-900 font-medium space-y-1.5 pl-1">
                <li>Open a terminal in the folder: <code className="bg-white border border-sky-300 text-sky-950 px-2 py-0.5 rounded font-mono text-[11px]">D:\Gyaansetu-AI\devinterviewbot</code></li>
                <li>Install dependencies (if not already done): <code className="bg-white border border-sky-300 text-sky-950 px-2 py-0.5 rounded font-mono text-[11px]">npm install</code></li>
                <li>Verify your local GyaanSetu backend is running on port <code className="bg-white border border-sky-300 text-sky-950 px-2 py-0.5 rounded font-mono text-[11px]">8000</code></li>
                <li>Run the development server: <code className="bg-white border border-sky-300 text-sky-950 px-2 py-0.5 rounded font-mono text-[11px]">npm run dev</code></li>
              </ol>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Pop-up Modals for interactive logs */}
      <AnimatePresence>
        
        {/* Sessions Log Modal */}
        {activeModal === "sessions" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-sky-300 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-200 mb-4">
                <h4 className="font-display font-extrabold text-sm text-sky-950 flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-sky-600" />
                  Focus Sessions Completed Today
                </h4>
                <button onClick={() => setActiveModal(null)} className="text-sky-400 hover:text-sky-700 transition cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {[
                  { time: "09:00 AM", duration: "25 min", status: "Focus Completed" },
                  { time: "10:15 AM", duration: "25 min", status: "Focus Completed" },
                  { time: "11:30 AM", duration: "25 min", status: "Focus Completed" },
                  { time: "01:00 PM", duration: "45 min", status: "Focus Completed" },
                  { time: "03:45 PM", duration: "25 min", status: "Focus Completed" },
                  { time: "05:00 PM", duration: "25 min", status: "Focus Completed" }
                ].map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-sky-950">{s.time}</div>
                      <div className="text-[10px] text-sky-700 mt-0.5">{s.duration} duration</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full mt-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-extrabold text-white transition cursor-pointer"
              >
                Close Log
              </button>
            </motion.div>
          </div>
        )}

        {/* Shield Logs Modal */}
        {(activeModal === "shield" || activeModal === "analytics") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-sky-300 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-200 mb-4">
                <h4 className="font-display font-extrabold text-sm text-sky-950 flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                  {activeModal === "shield" ? "Shield Alert: Distractions Blocked" : "Focus Analytics Heatmap"}
                </h4>
                <button onClick={() => setActiveModal(null)} className="text-sky-400 hover:text-sky-700 transition cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {activeModal === "shield" ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                    <span className="text-sky-900 font-bold">Auto-Dim Shield:</span>
                    <button 
                      onClick={() => { setShieldActive(!shieldActive); showToast(`Distraction Shield toggled.`, ShieldAlert); }}
                      className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer ${
                        shieldActive ? "bg-sky-600 text-white" : "bg-sky-200 text-sky-900"
                      }`}
                    >
                      {shieldActive ? "ACTIVE" : "MUTED"}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {[
                      { source: "youtube.com (Tab block)", count: "12 times" },
                      { source: "facebook.com (Tab block)", count: "6 times" },
                      { source: "Slack desktop alerts", count: "29 notifications muted" }
                    ].map((d, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-950">{d.source}</span>
                        <span className="text-[10px] font-mono text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs text-sky-900 font-medium">
                  <p>Weekly attention consistency heatmap (Mon-Sun):</p>
                  <div className="grid grid-cols-7 gap-1.5 p-3 rounded-2xl bg-sky-50 border border-sky-200">
                    {[
                      { day: "M", v: 3 }, { day: "T", v: 4 }, { day: "W", v: 2 }, 
                      { day: "T", v: 5 }, { day: "F", v: 4 }, { day: "S", v: 5 }, { day: "S", v: 3 }
                    ].map((d, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold font-mono text-[10px] ${
                          d.v === 5 ? "bg-sky-600 text-white shadow-xs" :
                          d.v === 4 ? "bg-sky-400 text-white" :
                          d.v === 3 ? "bg-sky-200 text-sky-950" :
                          "bg-sky-100 text-sky-700"
                        }`}>
                          {d.v * 20}%
                        </div>
                        <span className="text-[9px] text-sky-700 mt-1 font-bold">{d.day}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] leading-relaxed italic text-sky-700 font-mono font-medium">
                    *Peak productivity registered on Thursday around 10:30 AM (92% focus stability).
                  </p>
                </div>
              )}

              <button
                onClick={() => setActiveModal(null)}
                className="w-full mt-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-extrabold text-white transition cursor-pointer"
              >
                Close Panel
              </button>
            </motion.div>
          </div>
        )}

        {/* Social room or LoFi details */}
        {(activeModal === "social" || activeModal === "lofi" || activeModal === "timer") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-sky-300 p-6 rounded-3xl shadow-2xl relative overflow-hidden text-sky-950"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-200 mb-4">
                <h4 className="font-display font-extrabold text-sm text-sky-950 flex items-center gap-2">
                  <Info className="h-4.5 w-4.5 text-sky-600" />
                  {activeModal === "social" && "Virtual Study Room Info"}
                  {activeModal === "lofi" && "LoFi Beats Mixer"}
                  {activeModal === "timer" && "Customizable Cycle Settings"}
                </h4>
                <button onClick={() => setActiveModal(null)} className="text-sky-400 hover:text-sky-700 transition cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {activeModal === "social" && (
                <div className="space-y-3 text-xs leading-relaxed text-sky-900 font-medium">
                  <p>Study Rooms allow synchronized group timers. You are currently connected to <b>Asia-South Focus Cell</b>.</p>
                  <p>Study partners currently in the cell are listed on your sound card mixer. If you completed a Pomodoro interval, you will all earn +20 Group XP points.</p>
                </div>
              )}

              {activeModal === "lofi" && (
                <div className="space-y-3.5 text-xs text-sky-900 font-medium">
                  <p>Curated Chill beats matching your keyboard typing speed:</p>
                  <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between"><span>Current Tempo:</span> <span className="text-sky-600 font-bold">78 BPM</span></div>
                    <div className="flex justify-between"><span>Active Track:</span> <span className="text-sky-950 font-bold">Midnight Coffee Coding</span></div>
                  </div>
                  <button 
                    onClick={() => { setActiveModal(null); showToast("Playing Midnight Coffee Coding...", Volume2); }}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-extrabold text-white transition shadow-sm cursor-pointer"
                  >
                    Play Chill Beats
                  </button>
                </div>
              )}

              {activeModal === "timer" && (
                <div className="space-y-3 text-xs leading-relaxed text-sky-900 font-medium">
                  <p>Configure custom work/break intervals:</p>
                  <div className="space-y-2.5 bg-sky-50 p-3 rounded-xl border border-sky-200">
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Work Interval Duration:</span>
                      <span className="font-bold text-sky-600">{Math.floor(activeDuration / 60)} minutes</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Rest Interval Duration:</span>
                      <span className="font-bold text-emerald-600">5 minutes</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveModal(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-extrabold text-white transition cursor-pointer"
              >
                Close Panel
              </button>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </AppLayout>
  );
}
