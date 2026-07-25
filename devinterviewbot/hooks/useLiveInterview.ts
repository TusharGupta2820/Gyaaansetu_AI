import { useState, useRef, useCallback, useEffect } from 'react';
import type { CodeEditorHandle } from '@/components/CodeEditor';
import type { AvatarInterviewerHandle } from '@/components/AvatarInterviewer';
import type { ChatMessage, InterviewLanguage, InterviewProblem } from '@/types';
import { generateChatMessage } from '@/services/geminiService';
import { CODE_DEBOUNCE_MS } from '@/constants';

interface UseLiveInterviewParams {
  apiKey: string;
  currentProblem: InterviewProblem;
  language: InterviewLanguage;
  code: string;
  editorRef: React.RefObject<CodeEditorHandle | null>;
  avatarRef: React.RefObject<AvatarInterviewerHandle | null>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onUpdateContext?: (language: string, title: string, description: string, starterCode: string) => void;
  onTypeCode?: (code: string) => void;
}

type SpeechLang = 'hi-IN' | 'en-US';

/**
 * Detects whether a transcript is Hindi or English.
 * Hindi text contains Devanagari Unicode characters (U+0900–U+097F).
 */
function detectLang(text: string): SpeechLang {
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  // If >15% of chars are Devanagari, treat as Hindi
  return hindiChars / (totalChars || 1) > 0.15 ? 'hi-IN' : 'en-US';
}

/**
 * Returns the best available synthesis voice for a given lang code.
 */
function pickVoice(lang: SpeechLang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'hi-IN') {
    return (
      voices.find(v => v.lang === 'hi-IN' && v.name.toLowerCase().includes('google')) ||
      voices.find(v => v.lang === 'hi-IN') ||
      voices.find(v => v.lang.startsWith('hi')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    );
  }
  return (
    voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('google')) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en')) ||
    null
  );
}

/**
 * Manages the interview voice session using:
 * - Web Speech API (SpeechRecognition) for mic input — auto-switches hi-IN / en-US
 * - Gemini text chat (generateChatMessage) for AI responses
 * - Web Speech API (SpeechSynthesis) for voice output — auto-switches Hindi / English voice
 *
 * Language auto-detection: detects Hindi from Devanagari characters in transcript.
 * The user can also say "Hindi mein bolo" or "speak in English" to switch.
 */
export function useLiveInterview({
  apiKey,
  currentProblem,
  language,
  code,
  setMessages,
}: UseLiveInterviewParams) {
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isConnectingLive, setIsConnectingLive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [speechLevel, setSpeechLevel] = useState(0);
  const [subtitles, setSubtitles] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [sessionTokens] = useState({ prompt: 0, candidates: 0, total: 0 });
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [currentLang, setCurrentLang] = useState<SpeechLang>('en-US');

  // Mock ref for UI compatibility (LiveService no longer used)
  const liveServiceRef = useRef<any>(null);

  // Conversation history for multi-turn Gemini context
  const historyRef = useRef<{ role: 'user' | 'model'; text: string }[]>([]);

  // Active language ref — updated on every user turn
  const currentLangRef = useRef<SpeechLang>('en-US');

  // Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isConnectedRef = useRef(false);

  // Latest-value refs for stale-closure safety
  const currentProblemRef = useRef(currentProblem);
  const languageRef = useRef(language);
  const codeRef = useRef(code);
  const apiKeyRef = useRef(apiKey);

  useEffect(() => { currentProblemRef.current = currentProblem; }, [currentProblem]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);

  // Speech level animation during TTS playback
  const speechAnimRafRef = useRef<number | null>(null);
  const animateSpeechLevel = useCallback(() => {
    if (!isSpeakingRef.current) { setSpeechLevel(0); return; }
    setSpeechLevel(Math.random() * 0.5 + 0.15);
    speechAnimRafRef.current = requestAnimationFrame(animateSpeechLevel);
  }, []);

  // ── Speak ──────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, lang: SpeechLang, onDone?: () => void) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = lang === 'hi-IN' ? 0.9 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Voices load asynchronously on some browsers — retry once after a short delay
    const assignVoice = () => {
      const voice = pickVoice(lang);
      if (voice) utterance.voice = voice;
    };
    assignVoice();
    if (!utterance.voice) {
      window.speechSynthesis.onvoiceschanged = () => { assignVoice(); };
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setAgentState('speaking');
      setSubtitles(text);
      speechAnimRafRef.current = requestAnimationFrame(animateSpeechLevel);
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setSpeechLevel(0);
      if (speechAnimRafRef.current) cancelAnimationFrame(speechAnimRafRef.current);
      if (isConnectedRef.current) onDone?.();
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setSpeechLevel(0);
      if (isConnectedRef.current) onDone?.();
    };

    synth.speak(utterance);
  }, [animateSpeechLevel]);

  // ── Start Listening ────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isConnectedRef.current || isListeningRef.current || isSpeakingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSubtitles('⚠️ Speech recognition not supported. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Use current language for recognition; user can switch mid-conversation
    recognition.lang = currentLangRef.current;

    const listeningLabel = currentLangRef.current === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...';

    recognition.onstart = () => {
      isListeningRef.current = true;
      setAgentState('listening');
      setIsMicMuted(false);
      setSubtitles(listeningLabel);
      setVolume(0.5);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      if (result.isFinal && transcript) {
        isListeningRef.current = false;
        setVolume(0);
        setIsMicMuted(true);
        recognition.stop();
        processUserInput(transcript);
      } else {
        setSubtitles(transcript);
      }
    };

    recognition.onspeechend = () => recognition.stop();

    recognition.onerror = (e: any) => {
      console.warn('[Speech] Recognition error:', e.error);
      isListeningRef.current = false;
      setVolume(0);
      setIsMicMuted(true);
      if (isConnectedRef.current && e.error !== 'aborted') {
        setTimeout(() => { if (isConnectedRef.current) startListening(); }, 1000);
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setVolume(0);
      setIsMicMuted(true);
    };

    try { recognition.start(); } catch (e) {
      console.warn('[Speech] Could not start:', e);
    }
  }, []); // processUserInput added below via ref pattern

  // ── Process User Input ─────────────────────────────────────────────────────
  const processUserInput = useCallback(async (transcript: string) => {
    if (!isConnectedRef.current) return;

    // ── Language switch detection ──────────────────────────────────────────
    const lower = transcript.toLowerCase();
    let forcedLang: SpeechLang | null = null;

    if (
      lower.includes('hindi mein bolo') || lower.includes('hindi me bolo') ||
      lower.includes('hindi mein') || lower.includes('हिंदी में') ||
      lower.includes('hindi switch') || lower.includes('switch to hindi') ||
      lower.includes('speak hindi')
    ) {
      forcedLang = 'hi-IN';
    } else if (
      lower.includes('english mein bolo') || lower.includes('speak in english') ||
      lower.includes('switch to english') || lower.includes('english me bolo') ||
      lower.includes('english switch')
    ) {
      forcedLang = 'en-US';
    }

    // Auto-detect from Devanagari script if no explicit command
    const detectedLang: SpeechLang = forcedLang ?? detectLang(transcript);

    // Update the active language
    if (detectedLang !== currentLangRef.current) {
      currentLangRef.current = detectedLang;
      setCurrentLang(detectedLang);
      console.log(`[Lang] Switched to ${detectedLang}`);
    }

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: transcript,
      timestamp: Date.now()
    }]);

    const thinkingLabel = detectedLang === 'hi-IN' ? 'सोच रहा हूँ...' : 'Thinking...';
    setAgentState('thinking');
    setSubtitles(thinkingLabel);

    try {
      const problem = currentProblemRef.current;
      const codingLang = languageRef.current;

      const langInstruction = detectedLang === 'hi-IN'
        ? 'निर्देश: कृपया अपना पूरा जवाब हिंदी में दें। तकनीकी शब्द (जैसे array, loop, function) अंग्रेज़ी में रख सकते हैं।'
        : 'Instruction: Please respond in English.';

      const contextPrefix =
        `${langInstruction}\n` +
        `[Problem: ${problem.title} | Language: ${codingLang}]\n` +
        `[Current Code]\n${codeRef.current.slice(0, 1000)}\n[End Code]\n\n`;

      const response = await generateChatMessage(
        apiKeyRef.current,
        historyRef.current,
        contextPrefix + transcript,
        codeRef.current,
        false
      );

      if (!response || !isConnectedRef.current) return;

      // Update bounded history
      historyRef.current = [
        ...historyRef.current,
        { role: 'user' as const, text: transcript },
        { role: 'model' as const, text: response }
      ].slice(-20);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      }]);

      // Speak using the detected language voice
      speak(response, detectedLang, () => {
        if (isConnectedRef.current && !isListeningRef.current) startListening();
      });

    } catch (err) {
      console.error('[Interview] Gemini error:', err);
      setSubtitles('⚠️ Error. Please try again.');
      setAgentState('listening');
      if (isConnectedRef.current) startListening();
    }
  }, [setMessages, speak, startListening]);

  // Expose processUserInput via ref so startListening closure can call it
  const processUserInputRef = useRef(processUserInput);
  useEffect(() => { processUserInputRef.current = processUserInput; }, [processUserInput]);

  // Code context debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLiveConnected) codeRef.current = code;
    }, CODE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code, isLiveConnected]);

  // ── Connect ────────────────────────────────────────────────────────────────
  const handleConnectLive = useCallback(async () => {
    if (!apiKey) {
      setSubtitles('⚠️ No Gemini API key. Add VITE_API_KEY to your environment.');
      return;
    }

    setIsConnectingLive(true);
    isConnectedRef.current = true;
    historyRef.current = [];
    currentLangRef.current = 'en-US'; // start in English
    setCurrentLang('en-US');

    const problem = currentProblemRef.current;
    const codingLang = languageRef.current;

    try {
      const greeting = await generateChatMessage(
        apiKey,
        [],
        `Start the mock interview in English. Greet the candidate, introduce yourself as an AI interviewer, and mention you'll work on "${problem.title}" in ${codingLang}. Tell them they can say "Hindi mein bolo" to switch to Hindi anytime. Ask them to describe their approach. Keep it to 2-3 sentences.`,
        '',
        false
      );

      if (!greeting || !isConnectedRef.current) return;

      historyRef.current = [{ role: 'model', text: greeting }];
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: greeting,
        timestamp: Date.now()
      }]);

      setIsLiveConnected(true);
      speak(greeting, 'en-US', () => {
        if (isConnectedRef.current) startListening();
      });

    } catch (err) {
      console.error('[Interview] Connect error:', err);
      setSubtitles('⚠️ Failed to connect. Check your API key.');
      isConnectedRef.current = false;
    } finally {
      setIsConnectingLive(false);
    }
  }, [apiKey, setMessages, speak, startListening]);

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const handleDisconnectLive = useCallback(() => {
    isConnectedRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    if (speechAnimRafRef.current) cancelAnimationFrame(speechAnimRafRef.current);

    setIsLiveConnected(false);
    setVolume(0);
    setSpeechLevel(0);
    setIsMicMuted(true);
    setAgentState('idle');
    setSubtitles('');
    historyRef.current = [];
  }, []);

  const toggleMic = useCallback(() => {
    if (isListeningRef.current) {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { /* ignore */ } }
      isListeningRef.current = false;
      setIsMicMuted(true);
      setAgentState('idle');
    } else {
      startListening();
    }
  }, [startListening]);

  const toggleCamera = useCallback(() => setIsCameraEnabled(prev => !prev), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isConnectedRef.current = false;
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* ignore */ } }
      window.speechSynthesis?.cancel();
      if (speechAnimRafRef.current) cancelAnimationFrame(speechAnimRafRef.current);
    };
  }, []);

  return {
    isLiveConnected,
    isConnectingLive,
    volume,
    speechLevel,
    subtitles,
    isMicMuted,
    isCameraEnabled,
    sessionTokens,
    agentState,
    currentLang,   // exposed so UI can show current language
    toggleMic,
    toggleCamera,
    liveServiceRef,
    handleConnectLive,
    handleDisconnectLive,
  } as const;
}
