import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Mic, Sparkles, RefreshCw, Volume2, Square, X,
  FileAudio, FileText, Save, Trash2, ChevronDown, ChevronUp, Clock, Eye, EyeOff, Play, Pause, AlertTriangle
} from "lucide-react";
import { API_BASE } from "@/lib/api/ai.service";

export const Route = createFileRoute("/voice")({
  head: () => ({ meta: [{ title: "Voice Notes Studio — GyaanSetu AI" }] }),
  component: VoiceNotesPage,
});

// ─── Types ───────────────────────────────────────────────────────────────────
interface VoiceNote {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  language: string;
  confidence: number;
  duration: number;
  createdAt: string;
  audioDataUrl?: string; // base64 stored audio
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "gyaansetu_voice_notes";

function loadNotes(): VoiceNote[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function persistNotes(notes: VoiceNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Mini Audio Player ────────────────────────────────────────────────────────
function AudioPlayer({ dataUrl }: { dataUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 mt-2 bg-sky-100/60 border border-sky-200 rounded-xl px-3 py-2">
      <audio
        ref={audioRef}
        src={dataUrl}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
      />
      <button
        onClick={toggle}
        className="h-8 w-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-sm transition flex-shrink-0"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>
      <div className="flex-1 h-1.5 bg-sky-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-sky-700 flex-shrink-0">
        {playing ? "Playing…" : "Play Audio"}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function VoiceNotesPage() {
  const [language, setLanguage] = useState("English");
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [savedNotes, setSavedNotes] = useState<VoiceNote[]>(loadNotes);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const [noteTitleInput, setNoteTitleInput] = useState("");

  // ── Refs (fix stale closure bug) ──────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);
  const mimeTypeRef = useRef("audio/webm");

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Start Recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      mimeTypeRef.current = mimeType;

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      durationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setCurrentAudioBlob(blob);
        submitAudio(blob, durationRef.current);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setDuration(0);
      setResult(null);
      setCurrentAudioBlob(null);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration((prev) => prev + 1);
      }, 1000);

      showToast("🎙 Microphone recording active!", "info");
    } catch (err) {
      console.error("Mic access denied:", err);
      showToast("Microphone permission required. Please allow access.", "error");
    }
  };

  // ── Stop Recording ─────────────────────────────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      setProcessing(true);
      mediaRecorderRef.current.stop(); // triggers onstop → submitAudio
    }
  };

  // ── Submit to backend with retry ───────────────────────────────────────────
  const submitAudio = async (blob: Blob, dur: number, retries = 3) => {
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("language", language);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (attempt > 1) {
          showToast(`Retrying... (attempt ${attempt}/${retries})`, "info");
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
        const res = await fetch(`${API_BASE}/tutor/transcribe`, { method: "POST", body: formData });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResult({ ...data, duration: dur });
        showToast("✅ Transcription complete! Save your note below.", "success");
        setProcessing(false);
        return;
      } catch (err: any) {
        console.error(`Transcription attempt ${attempt} failed:`, err);
        if (attempt < retries) continue; // retry
        // All retries exhausted — show backend-offline state (not fake fallback)
        setResult({
          transcript: null, // null = backend offline, not a real transcript
          summary: null,
          language: language,
          confidence: 0,
          duration: dur,
          backendOffline: true,
          _blob: blob, // keep blob for retry
        });
        showToast("⚠️ Backend unreachable. Start the backend and click Retry.", "error");
      }
    }
    setProcessing(false);
  };

  // ── Retry transcription ─────────────────────────────────────────────────────
  const handleRetry = () => {
    if (result?._blob) {
      setResult(null);
      setProcessing(true);
      submitAudio(result._blob, result.duration);
    }
  };


  // ── Sample Note ────────────────────────────────────────────────────────────
  const handleUseSample = () => {
    setProcessing(true);
    setResult(null);
    setCurrentAudioBlob(null);
    setTimeout(() => {
      setResult({
        transcript: "In today's lecture on quantum superposition, we explore how subatomic particles like electrons can exist in multiple spin states simultaneously. This behaves fundamentally differently from classical bits which can only store 0 or 1. Superposition mathematically breaks down into linear state combinations.",
        summary: "### Lecture Summary\nThis lecture introduces the core principles of Quantum Superposition.\n\n### Key Concepts\n- **Classical Bit**: Binary storage (0 or 1).\n- **Qubit**: Can exist in superposition (0 and 1 simultaneously).\n- **Linear Combination**: The mathematical description of superposition.",
        language: "en", confidence: 0.98, duration: 45,
      });
      setNoteTitleInput("Quantum Superposition Lecture");
      setProcessing(false);
      showToast("Sample transcription loaded!", "success");
    }, 1500);
  };

  // ── Save Note → clear result ───────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!result) return;
    let audioDataUrl: string | undefined;
    if (currentAudioBlob) {
      try { audioDataUrl = await blobToDataUrl(currentAudioBlob); }
      catch { /* audio too large or unsupported — skip */ }
    }
    const note: VoiceNote = {
      id: Date.now().toString(),
      title: noteTitleInput.trim() || `Voice Note — ${new Date().toLocaleDateString()}`,
      transcript: result.transcript,
      summary: result.summary,
      language: result.language || language,
      confidence: result.confidence || 1,
      duration: result.duration || duration,
      createdAt: new Date().toISOString(),
      audioDataUrl,
    };
    const updated = [note, ...savedNotes];
    setSavedNotes(updated);
    persistNotes(updated);
    // ✅ Clear result + title after save
    setResult(null);
    setCurrentAudioBlob(null);
    setNoteTitleInput("");
    setShowTranscript(true);
    showToast(`✅ Note "${note.title}" saved!`, "success");
  };

  // ── Delete Note ────────────────────────────────────────────────────────────
  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    persistNotes(updated);
    if (expandedNote === id) setExpandedNote(null);
    showToast("Note deleted.", "info");
  };

  return (
    <AppLayout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-5 py-3.5 rounded-2xl border shadow-xl flex items-center gap-3 max-w-sm text-xs font-extrabold ${
              toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700"
              : toast.type === "info" ? "bg-sky-50 border-sky-200 text-sky-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Voice Notes Studio"
        subtitle="Record your voice, dictate study notes, or record lectures. Whisper transcribes and Ollama structures key concepts."
        icon={Mic}
      />

      <div className="grid lg:grid-cols-12 gap-6 items-start mb-6">

        {/* ── LEFT: Recording Console + Saved Notes ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <GlassCard className="shadow-md shadow-sky-100/50 border border-sky-200 bg-white p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-sky-200/80">
                <span className="text-xs font-mono text-sky-600 tracking-wider uppercase font-extrabold">Recording Console</span>
                <span className="text-[11px] font-mono text-sky-700 font-bold">Whisper Local STT</span>
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="text-[10px] text-sky-700 font-mono uppercase font-extrabold">Transcription Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={recording}
                  className="w-full bg-sky-50/60 border border-sky-200 rounded-xl px-3 py-2 text-xs font-extrabold text-sky-950 outline-none focus:bg-white focus:border-sky-500 transition disabled:opacity-50"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                </select>
              </div>

              {/* Waveform */}
              <div className="h-32 bg-sky-50/50 rounded-2xl border border-sky-200/80 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {recording ? (
                  <>
                    <div className="flex items-end gap-1 h-12">
                      {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 48, 8] }}
                          transition={{ duration: 0.4 + i * 0.07, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1.5 bg-sky-500 rounded-full"
                          style={{ height: 8 }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-mono text-sky-600 font-extrabold">
                        {formatTime(duration)} — Recording
                      </span>
                    </div>
                  </>
                ) : processing ? (
                  <div className="text-center space-y-2">
                    <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mx-auto" />
                    <span className="text-xs text-sky-700 font-mono font-bold block">Processing audio…</span>
                  </div>
                ) : (
                  <div className="text-center space-y-1.5 p-4">
                    <FileAudio className="h-8 w-8 text-sky-400 mx-auto" />
                    <span className="text-xs text-sky-700/90 block font-mono font-bold">Microphone Idle</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 mt-4 pt-4 border-t border-sky-200/80">
              {recording ? (
                <button
                  onClick={stopRecording}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 py-3 text-xs font-extrabold text-white shadow-md shadow-rose-200 transition"
                >
                  <Square className="h-4 w-4" /> Stop Recording & Transcribe
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={processing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 py-3 text-xs font-extrabold text-white shadow-md shadow-sky-200 transition disabled:opacity-50"
                >
                  <Mic className="h-4 w-4" /> Start Live Recording
                </button>
              )}
              <button
                onClick={handleUseSample}
                disabled={recording || processing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-50 border border-sky-200 py-2.5 text-xs text-sky-700 font-extrabold hover:bg-sky-100 shadow-sm transition disabled:opacity-50"
              >
                <Volume2 className="h-4 w-4 text-sky-500" /> Use Sample Lecture Note
              </button>
            </div>
          </GlassCard>

          {/* ── Saved Notes List ── */}
          {savedNotes.length > 0 && (
            <GlassCard className="shadow-md shadow-sky-100/50 border border-sky-200 bg-white p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-mono text-sky-600 tracking-wider uppercase font-extrabold flex items-center gap-1.5">
                  <Save className="h-4 w-4" /> Saved Notes ({savedNotes.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {savedNotes.map((note) => (
                  <div key={note.id} className="border border-sky-200 rounded-2xl overflow-hidden bg-sky-50/30">
                    {/* Accordion header — NOT a button to avoid nesting */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                      onKeyDown={(e) => e.key === "Enter" && setExpandedNote(expandedNote === note.id ? null : note.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-sky-100/60 transition cursor-pointer select-none"
                    >
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-xs font-extrabold text-sky-950 truncate">{note.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-sky-700/70">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-sky-600 bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatTime(note.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {/* Delete — uses a plain div styled as button to avoid nested button issue */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteNote(e, note.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleDeleteNote(e as any, note.id); }}}
                          className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </div>
                        {expandedNote === note.id
                          ? <ChevronUp className="h-4 w-4 text-sky-500" />
                          : <ChevronDown className="h-4 w-4 text-sky-500" />
                        }
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedNote === note.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-sky-200"
                        >
                          <div className="p-4 space-y-3">
                            {/* Audio player if available */}
                            {note.audioDataUrl && (
                              <AudioPlayer dataUrl={note.audioDataUrl} />
                            )}
                            <div>
                              <div className="text-[10px] font-mono text-sky-600 font-extrabold uppercase mb-1 flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" /> Transcript
                              </div>
                              <p className="text-xs text-sky-950 font-bold leading-relaxed">"{note.transcript}"</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono text-sky-600 font-extrabold uppercase mb-1 flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" /> AI Summary
                              </div>
                              <p className="text-xs text-sky-950 font-semibold leading-relaxed whitespace-pre-line">{note.summary}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* ── RIGHT: Transcription Result ── */}
        <div className="lg:col-span-7 flex flex-col">
          <GradientCard className="shadow-md shadow-sky-100/50 border border-sky-200 bg-white p-6 flex flex-col min-h-[520px]">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-sky-200/80 mb-4">
              <span className="text-xs font-mono text-sky-600 tracking-wider uppercase font-extrabold">
                Transcription Result
              </span>
              <div className="flex items-center gap-2">
                {result && (
                  <button
                    onClick={() => setShowTranscript((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-extrabold text-sky-700 hover:bg-sky-100 shadow-sm transition"
                  >
                    {showTranscript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showTranscript ? "Hide Transcript" : "Show Transcript"}
                  </button>
                )}
                <span className="text-[11px] font-mono text-sky-700 font-bold">Step 2: AI Summary</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {result?.backendOffline ? (
                /* ── Backend Offline State ── */
                <motion.div
                  key="offline"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-4"
                >
                  <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-rose-700 mb-1">Backend Server Offline</p>
                    <p className="text-xs text-rose-600/80 font-semibold max-w-xs leading-relaxed">
                      Could not connect to the GyaanSetu AI backend at <code className="bg-rose-100 px-1 rounded">localhost:8000</code>.
                      Your audio is saved — start the backend and click Retry.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-md shadow-sky-200 transition"
                    >
                      <RefreshCw className="h-4 w-4" /> Retry Transcription
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold hover:bg-sky-100 transition"
                    >
                      <X className="h-3.5 w-3.5" /> Dismiss
                    </button>
                  </div>
                  <p className="text-[10px] text-sky-600/60 font-semibold">
                    Start backend: run <code className="bg-sky-50 border border-sky-200 px-1 rounded">.\start-all.ps1 -BackendOnly</code>
                  </p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col flex-1 gap-4"
                >
                  {/* Save bar */}
                  <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-2xl p-3">
                    <input
                      type="text"
                      value={noteTitleInput}
                      onChange={(e) => setNoteTitleInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
                      placeholder="Note title (optional)…"
                      className="flex-1 bg-white border border-sky-200 rounded-xl px-3 py-2 text-xs font-bold text-sky-950 placeholder:text-sky-400 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleSaveNote}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-sm shadow-sky-200 transition"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Note
                    </button>
                  </div>

                  {/* Audio player for current recording */}
                  {currentAudioBlob && (
                    <AudioPlayer dataUrl={URL.createObjectURL(currentAudioBlob)} />
                  )}

                  {/* Language mismatch warning */}
                  {result.lang_mismatch && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-extrabold text-amber-800 mb-0.5">Language Mismatch Detected</div>
                        <div className="text-xs font-semibold text-amber-700 leading-relaxed">
                          You selected <strong>{result.selected_language}</strong> but your recording was detected as <strong>English</strong>.
                          To get {result.selected_language} transcription, please speak in {result.selected_language} (e.g. Hindi = speak in हिंदी).
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Transcript (toggle) */}
                  <AnimatePresence>
                    {showTranscript && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/80">
                          <div className="text-xs text-sky-600 font-mono uppercase font-extrabold mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-sky-500" /> Transcribed Speech ({result.selected_language || "Default"})
                            </span>
                            {result.original_transcript && result.original_transcript !== result.transcript && (
                              <span className="text-[10px] bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded-full font-sans font-bold">
                                AI Tutor Translated
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-sky-950 font-bold leading-relaxed max-h-32 overflow-y-auto">
                            "{result.transcript}"
                          </p>
                          {result.original_transcript && result.original_transcript !== result.transcript && (
                            <p className="text-[11px] text-sky-700/80 font-medium italic mt-1.5 border-t border-sky-200/60 pt-1.5">
                              Original Spoken: "{result.original_transcript}"
                            </p>
                          )}
                          <div className="mt-2 text-[10px] font-mono text-sky-600 font-bold flex items-center gap-3">
                            <span>Confidence: {Math.round((result.confidence || 1) * 100)}%</span>
                            <span>Duration: {formatTime(result.duration || 0)}</span>
                            {result.language && (
                              <span className="bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded-md">
                                Detected: {result.language === "hi" ? "हिंदी" : result.language === "mr" ? "मराठी" : result.language === "ta" ? "Tamil" : result.language === "te" ? "Telugu" : result.language?.toUpperCase() ?? ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Summary */}
                  <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/80 flex-1 overflow-y-auto">
                    <div className="text-xs text-sky-600 font-mono uppercase font-extrabold mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-sky-500 fill-sky-100" /> AI Key Points & Summary
                    </div>
                    <div className="text-xs text-sky-950 font-bold leading-relaxed whitespace-pre-line">
                      {result.summary}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-16"
                >
                  {processing ? (
                    <div className="space-y-3">
                      <RefreshCw className="h-10 w-10 text-sky-500 animate-spin mx-auto" />
                      <p className="text-xs text-sky-700 font-mono font-extrabold">
                        Running Whisper STT + AI Summary…
                      </p>
                      <p className="text-[10px] text-sky-600/80 font-semibold">This may take a few seconds</p>
                    </div>
                  ) : (
                    <>
                      <Mic className="h-16 w-16 text-sky-200 mb-4" />
                      <p className="text-sm font-extrabold text-sky-700/80 max-w-xs leading-relaxed">
                        Your transcript & AI summary will appear here once audio is recorded.
                      </p>
                      <p className="text-[11px] text-sky-500/70 mt-2 font-semibold">
                        Click "Start Live Recording" or use a sample
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 text-xs font-extrabold text-sky-700/90 flex items-center gap-1.5 border-t border-sky-200/80 pt-3 flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-sky-500 fill-sky-100" />
              Offline Faster-Whisper local engine active. Notes & audio stored in browser.
            </div>
          </GradientCard>
        </div>
      </div>
    </AppLayout>
  );
}
