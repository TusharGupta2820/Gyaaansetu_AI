import { useState, useRef, useCallback, useEffect } from 'react';
import type { CodeEditorHandle } from '@/components/CodeEditor';
import type { AvatarInterviewerHandle } from '@/components/AvatarInterviewer';
import type { ChatMessage, InterviewLanguage, InterviewProblem } from '@/types';
import { generateChatMessage } from '@/services/geminiService';
import {
  SYSTEM_INSTRUCTION_INTERVIEWER,
  CODE_DEBOUNCE_MS,
} from '@/constants';

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

/**
 * Manages the interview voice session using:
 * - Web Speech API (SpeechRecognition) for mic input
 * - Gemini text chat (generateChatMessage) for AI responses
 * - Web Speech API (SpeechSynthesis) for voice output
 *
 * This approach works with all Gemini API key types (no Live WebSocket needed).
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

  // Mock ref for UI binding compatibility
  const liveServiceRef = useRef<any>(null);

  // Conversation history for multi-turn context
  const historyRef = useRef<{ role: 'user' | 'model'; text: string }[]>([]);

  // Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isConnectedRef = useRef(false);

  // Refs for latest values in callbacks
  const currentProblemRef = useRef(currentProblem);
  const languageRef = useRef(language);
  const codeRef = useRef(code);
  const apiKeyRef = useRef(apiKey);

  useEffect(() => { currentProblemRef.current = currentProblem; }, [currentProblem]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);

  // Speech synthesis animation loop
  const speechAnimRafRef = useRef<number | null>(null);

  const animateSpeechLevel = useCallback(() => {
    if (!isSpeakingRef.current) {
      setSpeechLevel(0);
      return;
    }
    setSpeechLevel(Math.random() * 0.5 + 0.15);
    speechAnimRafRef.current = requestAnimationFrame(animateSpeechLevel);
  }, []);

  // Speak text using Web Speech Synthesis
  const speak = useCallback((text: string, onDone?: () => void) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'hi-IN';

    // Pick best Hindi voice available on this device
    const voices = synth.getVoices();
    const preferred =
      voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
      voices.find(v => v.lang === 'hi-IN') ||
      voices.find(v => v.lang.startsWith('hi')) ||
      voices.find(v => v.lang.startsWith('en')); // fallback if no Hindi voice installed
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setAgentState('speaking');
      setSubtitles(text);
      speechAnimRafRef.current = requestAnimationFrame(animateSpeechLevel);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setSpeechLevel(0);
      if (speechAnimRafRef.current) {
        cancelAnimationFrame(speechAnimRafRef.current);
      }
      if (isConnectedRef.current) {
        onDone?.();
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setSpeechLevel(0);
      if (isConnectedRef.current) {
        onDone?.();
      }
    };

    synth.speak(utterance);
  }, [animateSpeechLevel]);

  // Process user speech and get AI response
  const processUserInput = useCallback(async (transcript: string) => {
    if (!isConnectedRef.current) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: transcript,
      timestamp: Date.now()
    }]);

    setAgentState('thinking');
    setSubtitles('सोच रहा हूँ...');

    try {
      const problem = currentProblemRef.current;
      const lang = languageRef.current;
      const contextPrefix = `[निर्देश: कृपया हिंदी में जवाब दें।]\n[समस्या: ${problem.title} | भाषा: ${lang}]\n[वर्तमान कोड]\n${codeRef.current.slice(0, 1000)}\n[कोड समाप्त]\n\n`;

      const response = await generateChatMessage(
        apiKeyRef.current,
        historyRef.current,
        contextPrefix + transcript,
        codeRef.current,
        false
      );

      if (!response || !isConnectedRef.current) return;

      // Update history
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', text: transcript },
        { role: 'model', text: response }
      ];
      // Keep history bounded to last 10 turns
      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }

      // Add AI message to chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      }]);

      // Speak the response, then resume listening
      speak(response, () => {
        if (isConnectedRef.current && !isListeningRef.current) {
          startListening();
        }
      });

    } catch (err) {
      console.error('[Interview] Gemini error:', err);
      setSubtitles('⚠️ AI error. Please try again.');
      setAgentState('listening');
      if (isConnectedRef.current) startListening();
    }
  }, [setMessages, speak]);

  // Start microphone listening via Web Speech API
  const startListening = useCallback(() => {
    if (!isConnectedRef.current || isListeningRef.current || isSpeakingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSubtitles('⚠️ Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Hindi speech recognition
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setAgentState('listening');
      setIsMicMuted(false);
      setSubtitles('सुन रहा हूँ...');
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

    recognition.onspeechend = () => {
      recognition.stop();
    };

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

    try {
      recognition.start();
    } catch (e) {
      console.warn('[Speech] Could not start recognition:', e);
    }
  }, [processUserInput]);

  // Code context debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLiveConnected) {
        codeRef.current = code;
      }
    }, CODE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code, isLiveConnected]);

  // Connect: greet the user, then start listening
  const handleConnectLive = useCallback(async () => {
    if (!apiKey) {
      setSubtitles('⚠️ No Gemini API key configured. Add VITE_API_KEY to your environment.');
      return;
    }

    setIsConnectingLive(true);
    isConnectedRef.current = true;
    historyRef.current = [];

    const problem = currentProblemRef.current;
    const lang = languageRef.current;

    try {
      // Generate greeting from Gemini
      const greeting = await generateChatMessage(
        apiKey,
        [],
        `कृपया हिंदी में जवाब दें। इंटरव्यू शुरू करें। अपना संक्षिप्त परिचय दें और बताएं कि हम "${problem.title}" समस्या पर ${lang} में काम करेंगे। उम्मीदवार से उनका approach पूछें। 2-3 वाक्यों में रखें।`,
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

      // Speak greeting then start listening
      speak(greeting, () => {
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

  const handleDisconnectLive = useCallback(() => {
    isConnectedRef.current = false;

    // Stop recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    isListeningRef.current = false;

    // Stop speech
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    if (speechAnimRafRef.current) {
      cancelAnimationFrame(speechAnimRafRef.current);
    }

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
      // Mute = stop listening
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      isListeningRef.current = false;
      setIsMicMuted(true);
      setAgentState('idle');
    } else {
      // Unmute = start listening
      startListening();
    }
  }, [startListening]);

  const toggleCamera = useCallback(() => {
    setIsCameraEnabled(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isConnectedRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
      window.speechSynthesis?.cancel();
      if (speechAnimRafRef.current) {
        cancelAnimationFrame(speechAnimRafRef.current);
      }
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
    toggleMic,
    toggleCamera,
    liveServiceRef,
    handleConnectLive,
    handleDisconnectLive,
  } as const;
}
