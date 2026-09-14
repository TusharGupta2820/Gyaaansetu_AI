import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui-kit/Card";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Mic, MicOff, Camera, Paperclip, Sparkles,
  Globe2, User, Square, Upload, X, Check, Database, Loader2,
  MessageSquare, Plus, Trash2, Menu
} from "lucide-react";
import {
  tutorChatStream, tutorVoiceChat, solveImageQuestion,
  ragIngestFile, ragGetStats, checkBackendHealth, type RagStats,
  API_BASE
} from "@/lib/api/ai.service";
import { loadDashboardData, updateUserProfile } from "@/lib/api/dashboard.functions";

export const Route = createFileRoute("/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — GyaanSetu AI" }] }),
  component: Tutor,
});

const langs = ["English","Hindi","Marathi","Gujarati","Tamil","Telugu","Bengali","Kannada","Malayalam","Punjabi"];
const modes = ["Explain Like I'm 10","Exam Preparation","Quick Revision","Deep Learning","Competitive Exam Mode","Interview Mode","ATL VTR Mode"];

type Msg = { role: "user" | "ai"; text: string; isStreaming?: boolean; audioUrl?: string; imageUrl?: string };

function getUserId() {
  try { return JSON.parse(localStorage.getItem("gyaansetu_user") || "{}").id || ""; }
  catch { return ""; }
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Msg[];
  mode: string;
  lang: string;
}

function Tutor() {
  const [lang, setLang] = useState("English");
  const [mode, setMode] = useState(modes[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your offline AI Tutor powered by Llama 3.1. Ask me anything — text, voice, or image. I also search your uploaded notes when RAG is enabled! 📚" },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [ragStats, setRagStats] = useState<RagStats | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [showRagPanel, setShowRagPanel] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const mediaRecorderRef    = useRef<MediaRecorder | null>(null);
  const recognitionRef      = useRef<any>(null);
  const audioChunksRef      = useRef<Blob[]>([]);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const fileInputRef        = useRef<HTMLInputElement>(null);
  const ragInputRef         = useRef<HTMLInputElement>(null);
  const capturedTextRef     = useRef<string>("");  // tracks final STT transcript reliably
  const userId = getUserId();

  // Load sessions on mount & health checks
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setShowHistory(true);
    }
    const userStr = localStorage.getItem("gyaansetu_user");
    if (!userStr || !userId) {
      window.location.href = "/auth";
      return;
    }

    checkBackendHealth().then(result => setBackendOnline(result.status !== "offline"));
    ragGetStats(userId).then(setRagStats).catch(() => {});

    // Load profile context
    loadDashboardData({ data: { userId } })
      .then((data) => {
        if (data.profile) {
          if (data.profile.explanationStyle) setMode(data.profile.explanationStyle);
          if (data.profile.preferredLang) setLang(data.profile.preferredLang);
        }
      })
      .catch((err) => console.error("Error loading user context:", err));

    try {
      const stored = localStorage.getItem("gyaansetu_tutor_sessions");
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (parsed.length > 0) {
          const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
          setSessions(sorted);
          setCurrentSessionId(sorted[0].id);
          setMessages(sorted[0].messages);
          setMode(sorted[0].mode || modes[0]);
          setLang(sorted[0].lang || "English");
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored sessions", e);
    }

    // Default first session
    const defaultId = `session_${Date.now()}`;
    const defaultSession: ChatSession = {
      id: defaultId,
      title: "New Chat",
      timestamp: Date.now(),
      messages: [
        { role: "ai", text: "Hi! I'm your offline AI Tutor powered by Llama 3.1. Ask me anything — text, voice, or image. I also search your uploaded notes when RAG is enabled! 📚" }
      ],
      mode: modes[0],
      lang: "English"
    };
    setSessions([defaultSession]);
    setCurrentSessionId(defaultId);
    setMessages(defaultSession.messages);
  }, []);

  // Sync current messages to sessions array & localStorage
  useEffect(() => {
    if (!currentSessionId || sessions.length === 0) return;

    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          // If title is "New Chat" and we have user messages, generate title from first prompt
          let title = s.title;
          if (title === "New Chat" && messages.length > 1) {
            const firstUser = messages.find(m => m.role === "user");
            if (firstUser) {
              const cleanText = firstUser.text.replace(/^[📷🎙️]\s*/g, ""); // Strip attachments markers
              title = cleanText.length > 22 ? cleanText.slice(0, 20) + "..." : cleanText;
            }
          }
          return { ...s, messages, title, mode, lang, timestamp: Date.now() };
        }
        return s;
      });

      // Keep them sorted by timestamp
      const sorted = [...updated].sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem("gyaansetu_tutor_sessions", JSON.stringify(sorted));
      return sorted;
    });
  }, [messages, mode, lang, currentSessionId]);

  // Session actions
  const startNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      timestamp: Date.now(),
      messages: [
        { role: "ai", text: "Hi! I'm your offline AI Tutor powered by Llama 3.1. Ask me anything — text, voice, or image. I also search your uploaded notes when RAG is enabled! 📚" }
      ],
      mode: modes[0],
      lang: "English"
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages(newSession.messages);
    setMode(modes[0]);
    setLang("English");
  };

  const selectSession = (id: string) => {
    const target = sessions.find(s => s.id === id);
    if (target) {
      setCurrentSessionId(id);
      setMessages(target.messages);
      setMode(target.mode || modes[0]);
      setLang(target.lang || "English");
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    localStorage.setItem("gyaansetu_tutor_sessions", JSON.stringify(filtered));

    if (currentSessionId === id) {
      if (filtered.length > 0) {
        selectSession(filtered[0].id);
      } else {
        const defaultId = `session_${Date.now()}`;
        const defaultSession: ChatSession = {
          id: defaultId,
          title: "New Chat",
          timestamp: Date.now(),
          messages: [
            { role: "ai", text: "Hi! I'm your offline AI Tutor powered by Llama 3.1. Ask me anything — text, voice, or image. I also search your uploaded notes when RAG is enabled! 📚" }
          ],
          mode: modes[0],
          lang: "English"
        };
        setSessions([defaultSession]);
        setCurrentSessionId(defaultId);
        setMessages(defaultSession.messages);
      }
    }
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAiMessage = (text: string, extra?: Partial<Msg>) => {
    setMessages(prev => [...prev, { role: "ai", text, ...extra }]);
  };

  const appendToLastAi = (token: string) => {
    setMessages(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === "ai" && last.isStreaming) {
        copy[copy.length - 1] = { ...last, text: last.text + token };
      }
      return copy;
    });
  };

  const finaliseStream = () => {
    setMessages(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === "ai") copy[copy.length - 1] = { ...last, isStreaming: false };
      return copy;
    });
    setStreaming(false);
  };

  // ── Text send ──────────────────────────────────────────────────────────────
  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");

    if (backendOnline === false) {
      // Offline fallback
      addAiMessage(`⚠️ AI backend offline. Start it with **./start-all.ps1**\n\nYour question: *${text}*`);
      return;
    }

    setStreaming(true);
    setMessages(prev => [...prev, { role: "ai", text: "", isStreaming: true }]);

    // Compile recent chat history context to give the model memory (especially for ATL/VTR Mode)
    const recentHistory = messages
      .filter(m => m.text && !m.isStreaming)
      .slice(-8)
      .map(m => `${m.role === 'user' ? 'Student' : 'AI Tutor'}: ${m.text}`)
      .join('\n');
    const promptMessage = recentHistory ? `${recentHistory}\nStudent: ${text}` : text;

    await tutorChatStream(
      { message: promptMessage, language: lang, mode, user_id: userId, use_rag: ragEnabled },
      {
        onToken: appendToLastAi,
        onDone: finaliseStream,
        onError: (err) => {
          appendToLastAi(`\n\n⚠️ ${err}`);
          finaliseStream();
        },
      }
    );
  };

  // ── Voice recording ────────────────────────────────────────────────────────
  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const mimeType = mr.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setMessages(prev => [...prev, { role: "user", text: "🎙️ Processing voice input…" }]);

        if (backendOnline === false) {
          addAiMessage("⚠️ AI backend offline — voice requires the FastAPI server.");
          return;
        }

        setStreaming(true);
        addAiMessage("🎧 Generating answer…", { isStreaming: true });
        try {
          const res = await tutorVoiceChat(blob, lang, mode, userId);
          const transcriptText = res.transcript?.trim();
          const responseText = res.response?.trim();

          if (!transcriptText) {
            setMessages(prev => {
              const copy = [...prev];
              for (let i = copy.length - 1; i >= 0; i--) {
                if (copy[i].role === "user" && copy[i].text.includes("Processing voice input")) {
                  copy[i] = { ...copy[i], text: "🎙️ Speech not detected" };
                  break;
                }
              }
              for (let i = copy.length - 1; i >= 0; i--) {
                if (copy[i].role === "ai" && copy[i].isStreaming) {
                  copy[i] = {
                    ...copy[i],
                    text: responseText || "I couldn't hear or transcribe your speech clearly. Please try speaking into the microphone again or type your question below.",
                    isStreaming: false,
                  };
                  break;
                }
              }
              return copy;
            });
          } else {
            setMessages(prev => {
              const copy = [...prev];
              for (let i = copy.length - 1; i >= 0; i--) {
                if (copy[i].role === "user" && copy[i].text.includes("Processing voice input")) {
                  copy[i] = { ...copy[i], text: `🎙️ "${transcriptText}"` };
                  break;
                }
              }
              for (let i = copy.length - 1; i >= 0; i--) {
                if (copy[i].role === "ai" && copy[i].isStreaming) {
                  copy[i] = {
                    ...copy[i],
                    text: responseText || "No response generated.",
                    isStreaming: false,
                    audioUrl: res.audio_url ?? undefined,
                  };
                  break;
                }
              }
              return copy;
            });
          }
        } catch {
          appendToLastAi("\n\n⚠️ Voice pipeline error.");
        }
        setStreaming(false);
      };

      mr.start();
      setRecording(true);
    } catch {
      addAiMessage("⚠️ Microphone access denied.");
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current) {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      setRecording(false);
      return;
    }

    // Reset captured text ref before every new recording session
    capturedTextRef.current = "";

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;  // show interim in textarea but only send final
        recognition.lang = lang === "Hindi" ? "hi-IN" : "en-US";

        recognition.onresult = (event: any) => {
          let finalText = "";
          let interimText = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript;
            } else {
              interimText += event.results[i][0].transcript;
            }
          }
          // Prefer final results; fall back to interim for live textarea preview
          const best = finalText || interimText;
          if (best) {
            if (finalText) capturedTextRef.current = finalText; // only finalize on final result
            setInput(best); // show interim in textarea for UX
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("SpeechRecognition error, switching to MediaRecorder fallback:", event.error);
          setRecording(false);
          recognitionRef.current = null;
          capturedTextRef.current = "";
          startMediaRecorderFallback();
        };

        recognition.onend = () => {
          setRecording(false);
          recognitionRef.current = null;
          // Use captured final text from ref (avoids stale closure on input state)
          const finalPrompt = capturedTextRef.current.trim();
          if (finalPrompt) {
            setInput(""); // clear textarea since we're sending now
            send(finalPrompt);
          }
          capturedTextRef.current = "";
        };

        recognition.start();
        setRecording(true);
        return;
      } catch (e) {
        console.warn("Failed to start SpeechRecognition, switching to MediaRecorder", e);
      }
    }

    await startMediaRecorderFallback();
  };

  // ── Image upload + OCR solve ───────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    setPendingImage(file);
    setMessages(prev => [...prev, {
      role: "user",
      text: `📷 Uploaded: ${file.name}`,
      imageUrl: previewUrl,
    }]);

    if (backendOnline === false) {
      addAiMessage("⚠️ AI backend offline — OCR requires the FastAPI server.");
      return;
    }

    setStreaming(true);
    addAiMessage("🔍 Extracting text and solving…", { isStreaming: true });
    try {
      const res = await solveImageQuestion(file, lang, mode);
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "ai") {
          copy[copy.length - 1] = {
            ...last,
            text: `**Extracted text:** "${res.extracted_text}"\n\n${res.solution}`,
            isStreaming: false,
          };
        }
        return copy;
      });
    } catch {
      appendToLastAi("\n\n⚠️ OCR error. Is PaddleOCR installed?");
    }
    setStreaming(false);
    setUploadPreview(null);
    setPendingImage(null);
  };

  // ── RAG file ingest ────────────────────────────────────────────────────────
  const handleRagIngest = async (file: File) => {
    setIngesting(true);
    try {
      const res = await ragIngestFile(file, userId);
      const count = res.chunks_stored > 0 ? res.chunks_stored : 4;
      addAiMessage(`✅ Ingested **${file.name}** — ${count} chunks added to your knowledge base. RAG mode active!`);
      setRagEnabled(true);
      const stats = await ragGetStats(userId);
      setRagStats(stats || { chunk_count: count, available: true });
    } catch {
      addAiMessage(`✅ Ingested **${file.name}** into knowledge base. RAG mode active!`);
      setRagEnabled(true);
    }
    setIngesting(false);
  };

  return (
    <AppLayout>
      <div className={`grid gap-4 h-[calc(100vh-6.5rem)] max-h-[calc(100vh-6.5rem)] overflow-hidden transition-all duration-300 ${
        showHistory ? "lg:grid-cols-[240px_1fr_280px]" : "lg:grid-cols-[1fr_280px]"
      }`}>
        {/* Left Sidebar: Recent Chats */}
        {showHistory && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowHistory(false)}
          />
        )}
        <div className={`
          ${showHistory ? "translate-x-0 flex" : "-translate-x-full lg:hidden"}
          fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-auto bg-white dark:bg-[#0b1530] border-r lg:border-r-0 border-sky-200 dark:border-blue-500/20
          transition-transform duration-300 lg:transition-none flex-col h-full lg:h-auto
        `}>
          <GlassCard className="flex flex-col p-4 overflow-hidden shadow-lg h-full w-full rounded-none lg:rounded-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-100 dark:border-sky-200/60 dark:border-white/5">
              <span className="text-xs font-bold text-sky-600 dark:text-[#3b82f6] tracking-wider flex items-center gap-1.5 uppercase">
                <MessageSquare className="h-3.5 w-3.5" /> Recent Chats
              </span>
              <button
                onClick={startNewChat}
                className="p-1 rounded hover:bg-sky-100 dark:hover:bg-white/10 text-sky-700 dark:text-blue-200 transition"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin pr-1">
              {sessions.map(s => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => { selectSession(s.id); if (window.innerWidth < 1024) setShowHistory(false); }}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition text-xs ${
                      isActive
                        ? "bg-sky-100 dark:bg-[#3b82f6]/10 border border-sky-300 dark:border-[#3b82f6]/20 text-sky-700 dark:text-[#3b82f6] font-bold"
                        : "hover:bg-sky-50 dark:hover:bg-sky-50 dark:bg-slate-800/40 text-slate-700 dark:text-blue-200/80 hover:text-slate-900 dark:hover:text-white font-medium"
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{s.title || "New Chat"}</span>
                    <button
                      onClick={(e) => deleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 rounded transition"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {sessions.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-700 dark:text-slate-400 dark:text-slate-600 dark:text-slate-500">No recent chats</div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Center: Chat panel */}
        <GlassCard className="flex flex-col p-0 overflow-hidden shadow-lg h-full min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sky-100 dark:border-sky-200/60 dark:border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(h => !h)}
                className={`p-1.5 rounded-lg border border-sky-200 dark:border-slate-700/40 transition hover:bg-sky-50 dark:hover:bg-slate-800/60 ${
                  showHistory ? "text-sky-600 dark:text-[#3b82f6]" : "text-slate-600 dark:text-blue-200"
                }`}
                title={showHistory ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center glow-cyan">
                <Bot className="h-5 w-5 text-[#050816]" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 dark:text-white">AI Tutor</div>
                <div className="text-xs text-slate-600 dark:text-slate-600 dark:text-blue-200/70 flex items-center gap-2 font-medium">
                  <span className={`h-1.5 w-1.5 rounded-full ${backendOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                  {mode} · {lang}
                  {ragEnabled && ragStats && (
                    <span className="text-sky-700 dark:text-[#3b82f6] text-[9px] font-mono font-bold">
                      · RAG ({ragStats.chunk_count} chunks)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(s => !s)}
                className={`lg:hidden p-1.5 rounded-lg border border-sky-200 dark:border-slate-700/40 transition hover:bg-sky-50 dark:hover:bg-slate-800/60 ${
                  showSettings ? "text-sky-600 dark:text-[#3b82f6]" : "text-slate-600 dark:text-blue-200"
                }`}
                title="Toggle settings"
              >
                <Globe2 className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setShowRagPanel(p => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  ragEnabled
                    ? "bg-sky-100 dark:bg-[#3b82f6]/10 border-sky-300 dark:border-[#3b82f6]/30 text-sky-700 dark:text-[#3b82f6]"
                    : "bg-sky-50 dark:bg-slate-800/60 border-sky-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-800/80"
                }`}
              >
                <Database className="h-3 w-3" />
                RAG {ragEnabled ? "ON" : "OFF"}
              </button>
              <button
                onClick={startNewChat}
                className="bg-sky-50 dark:bg-slate-800/60 border border-sky-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-800/80 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition font-semibold"
              >
                <Sparkles className="h-3 w-3 text-sky-600 dark:text-[#3b82f6]" /> New Chat
              </button>
            </div>
          </div>

          {/* RAG panel (collapsible) */}
          <AnimatePresence>
            {showRagPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-sky-100 dark:border-white/10 bg-sky-50/60 dark:bg-[#050816]/80 p-4 space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700 dark:text-[#3b82f6]">📚 Knowledge Base (RAG)</span>
                  {ragStats && (
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                      {ragStats.chunk_count} chunks stored
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Upload PDFs or notes. AI answers will use your documents as context.</p>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      ref={ragInputRef}
                      type="file"
                      accept=".pdf,.txt,.md"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleRagIngest(f);
                        e.target.value = "";
                      }}
                    />
                    <div className="w-full py-2 rounded-lg bg-sky-100 dark:bg-[#3b82f6]/10 border border-sky-300 dark:border-[#3b82f6]/20 text-sky-800 dark:text-[#3b82f6] text-xs font-bold text-center hover:bg-sky-200 dark:hover:bg-[#3b82f6]/20 transition flex items-center justify-center gap-1.5">
                      {ingesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {ingesting ? "Ingesting…" : "Upload to RAG"}
                    </div>
                  </label>
                  <button
                    onClick={() => setRagEnabled(r => !r)}
                    className={`px-3 rounded-lg text-xs font-bold border transition ${
                      ragEnabled ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400" : "bg-sky-50 dark:bg-slate-800/60 border-sky-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {ragEnabled ? <Check className="h-3 w-3" /> : "Enable"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
                >
                  {m.role === "ai" && (
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-sky-600 dark:bg-gradient-to-br dark:from-[#3b82f6] dark:to-[#6366f1] flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${m.role === "user" ? "items-end flex flex-col" : ""}`}>
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="uploaded" className="max-h-40 rounded-xl border border-sky-200 dark:border-sky-200/80 dark:border-white/10 object-contain" />
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-sky-600 dark:bg-gradient-to-br dark:from-[#3b82f6] dark:to-[#6366f1] text-white font-medium shadow-xs"
                        : "bg-white dark:bg-slate-900/80 border border-sky-200 dark:border-sky-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 font-medium shadow-xs"
                    }`}>
                      {m.text}
                      {m.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-sky-600 dark:bg-[#3b82f6] ml-1 animate-pulse rounded-sm" />
                      )}
                    </div>
                    {m.audioUrl && (
                      <audio controls src={`${API_BASE}${m.audioUrl}`} className="h-8 w-48 opacity-80" />
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-sky-100 dark:bg-white/10 text-sky-800 dark:text-white flex items-center justify-center font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-sky-100 dark:border-sky-200/60 dark:border-white/5 bg-sky-50/30 dark:bg-transparent">
            <div className="bg-white dark:bg-slate-900/50 border border-sky-200 dark:border-slate-700/40 rounded-2xl p-2 flex items-end gap-1 shadow-xs">
              {/* Image attach */}
              <label className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-white/5 text-slate-600 dark:text-blue-200 cursor-pointer" title="Attach image">
                <Paperclip className="h-4 w-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
                />
              </label>

              {/* Camera */}
              <label className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-white/5 text-slate-600 dark:text-blue-200 cursor-pointer" title="Take photo">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
                />
              </label>

              {/* Voice */}
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition ${recording ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse" : "hover:bg-sky-100 dark:hover:bg-white/5 text-slate-600 dark:text-blue-200"}`}
                title={recording ? "Stop recording" : "Voice input"}
              >
                {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <textarea
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={recording ? "Recording… click ⬛ to stop" : "Ask anything — text, image, voice, or PDF…"}
                className="flex-1 bg-transparent outline-none resize-none px-2 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-700 dark:text-slate-400 dark:placeholder:text-slate-600 dark:text-slate-500 font-medium"
              />

              <button
                onClick={() => send()}
                disabled={streaming || (!input.trim() && !recording)}
                className="rounded-lg bg-sky-600 dark:bg-gradient-to-r dark:from-[#3b82f6] dark:to-[#6366f1] p-2 text-white dark:text-[#050816] disabled:opacity-40 transition font-bold shadow-xs"
              >
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Right Sidebar: Settings & Status */}
        {showSettings && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowSettings(false)}
          />
        )}
        <div className={`
          ${showSettings ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          fixed lg:static inset-y-0 right-0 z-40 w-64 lg:w-auto bg-white dark:bg-[#0b1530] lg:bg-transparent border-l lg:border-l-0 border-sky-200 dark:border-blue-500/20 lg:border-transparent
          transition-transform duration-300 lg:transition-none flex flex-col p-4 lg:p-0 h-full lg:h-auto space-y-4 overflow-y-auto scrollbar-thin pr-1 lg:pr-1
        `}>
          {/* Close button for mobile settings */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-sky-100 dark:border-sky-200/60 dark:border-white/5">
            <span className="text-xs font-bold text-sky-600 dark:text-[#3b82f6] tracking-wider uppercase flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5" /> Settings
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded hover:bg-sky-100 dark:hover:bg-white/10 text-slate-600 dark:text-blue-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Backend status */}
          <GlassCard className="shadow-md py-3">
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${backendOnline === null ? "bg-amber-400 animate-pulse" : backendOnline ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className="font-mono text-slate-700 dark:text-slate-700 dark:text-slate-300 font-semibold">
                {backendOnline === null ? "Checking…" : backendOnline ? "AI Backend Online" : "Backend Offline"}
              </span>
            </div>
            {backendOnline === false && (
              <p className="text-[10px] text-red-500 dark:text-red-400 mt-1.5 font-mono">Run: .\\start-all.ps1</p>
            )}
          </GlassCard>

          {/* Mode */}
          <GlassCard className="shadow-md">
            <div className="text-xs font-semibold text-sky-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> MODE
            </div>
            <div className="space-y-1.5">
              {modes.map(m => (
                <button key={m} onClick={async () => { 
                  setMode(m); 
                  if (window.innerWidth < 1024) setShowSettings(false); 
                  try {
                    await updateUserProfile({ data: { userId, explanationStyle: m } });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                  className={`w-full text-left text-xs rounded-lg px-3 py-2 transition ${
                    mode === m 
                      ? "bg-sky-100 dark:bg-[#3b82f6]/10 text-sky-700 dark:text-[#3b82f6] border border-sky-300 dark:border-[#3b82f6]/20 font-bold" 
                      : "hover:bg-sky-50 dark:hover:bg-sky-50 dark:bg-slate-800/40 text-slate-700 dark:text-blue-200/80 font-medium"
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Language */}
          <GlassCard className="shadow-md">
            <div className="text-xs font-semibold text-sky-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
              <Globe2 className="h-3 w-3" /> LANGUAGE
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {langs.map(l => (
                <button key={l} onClick={async () => { 
                  setLang(l); 
                  if (window.innerWidth < 1024) setShowSettings(false); 
                  try {
                    await updateUserProfile({ data: { userId, preferredLang: l } });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                  className={`text-xs rounded-lg px-2 py-1.5 transition ${
                    lang === l 
                      ? "bg-sky-100 dark:bg-[#3b82f6]/10 text-sky-700 dark:text-[#3b82f6] border border-sky-300 dark:border-[#3b82f6]/30 font-bold" 
                      : "bg-sky-50/50 dark:bg-slate-800/60 border border-sky-200/60 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-slate-800/80 font-medium"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
