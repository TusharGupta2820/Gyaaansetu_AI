import { useState, useRef, useCallback, useEffect } from 'react';
import { offlineInterviewService } from '../services/offlineInterviewService';
import type { CodeEditorHandle } from '@/components/CodeEditor';
import type { AvatarInterviewerHandle } from '@/components/AvatarInterviewer';
import type { ChatMessage, InterviewLanguage, InterviewProblem } from '@/types';

interface UseLiveInterviewParams {
  apiKey?: string; // Kept for API signature compatibility, unused
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
 * Manages the local offline interview session (Whisper STT -> DeepSeek R1 -> Piper TTS).
 */
export function useLiveInterview({
  currentProblem,
  language,
  setMessages,
}: UseLiveInterviewParams) {
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isConnectingLive, setIsConnectingLive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [speechLevel, setSpeechLevel] = useState(0);
  const [subtitles, setSubtitles] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [sessionTokens] = useState({ prompt: 0, candidates: 0, total: 0 }); // Unused for offline, kept to avoid breaking UI
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  // Refs for audio capturing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inputStreamRef = useRef<MediaStream | null>(null);

  // Refs for audio playing and metering
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const speechLevelRafRef = useRef<number | null>(null);
  const volumeMeterRafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Refs for current values to avoid stale closures
  const currentProblemRef = useRef(currentProblem);
  const languageRef = useRef(language);

  useEffect(() => { currentProblemRef.current = currentProblem; }, [currentProblem]);
  useEffect(() => { languageRef.current = language; }, [language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (speechLevelRafRef.current) {
        cancelAnimationFrame(speechLevelRafRef.current);
      }
      if (volumeMeterRafRef.current) {
        cancelAnimationFrame(volumeMeterRafRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (inputStreamRef.current) {
        inputStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Real-time microphone volume metering for visualizer
  const startVolumeMetering = useCallback((stream: MediaStream) => {
    try {
      if (volumeMeterRafRef.current) {
        cancelAnimationFrame(volumeMeterRafRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
          setVolume(0);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 128); // scale to 0-1
        setVolume(normalized);
        volumeMeterRafRef.current = requestAnimationFrame(checkVolume);
      };

      volumeMeterRafRef.current = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('Error starting volume metering:', e);
    }
  }, []);

  // Helper to start recording user audio
  const startRecording = useCallback(async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop microphone tracks
        stream.getTracks().forEach(track => track.stop());
        inputStreamRef.current = null;

        if (audioChunksRef.current.length === 0) {
          setAgentState('listening');
          setIsMicMuted(false);
          startRecording();
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        setAgentState('thinking');
        setSubtitles('Evaluating answer...');

        try {
          const response = await offlineInterviewService.sendAnswer(audioBlob);

          // Add user response to chat
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'user',
              text: response.transcript || '[Voice Response]',
              timestamp: Date.now()
            }
          ]);

          // Add interviewer feedback & next question to chat
          const feedbackText = response.feedback ? `${response.feedback} ` : '';
          const fullResponse = `${feedbackText}${response.next_question}`.trim();
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'model',
              text: fullResponse,
              timestamp: Date.now()
            }
          ]);

          // Update subtitles
          setSubtitles(response.next_question);

          // Play response speech
          if (response.audioUrl) {
            playAudio(response.audioUrl);
          } else {
            // Fallback if TTS audio is not generated
            setAgentState('listening');
            setIsMicMuted(false);
            startRecording();
          }
        } catch (error) {
          console.error('Offline respond error:', error);
          setSubtitles('⚠️ Local AI error. Make sure backend and Ollama are active.');
          setAgentState('idle');
          setIsMicMuted(true);
        }
      };

      mediaRecorder.start();
      setIsMicMuted(false);
      setAgentState('listening');
      startVolumeMetering(stream);
    } catch (e) {
      console.error('Microphone error:', e);
      setSubtitles('⚠️ Microphone access denied.');
      setAgentState('idle');
      setIsMicMuted(true);
    }
  }, [setMessages, startVolumeMetering]);

  // Helper to play synthesized AI tutor audio and animate lips
  const playAudio = useCallback((url: string) => {
    // Clear any playing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (speechLevelRafRef.current) {
      cancelAnimationFrame(speechLevelRafRef.current);
      speechLevelRafRef.current = null;
    }

    const audio = new Audio(url);
    audioElementRef.current = audio;
    setAgentState('speaking');

    const animateSpeech = () => {
      if (!audioElementRef.current || audioElementRef.current.paused || audioElementRef.current.ended) {
        setSpeechLevel(0);
        return;
      }
      // Modulate speechLevel between 0.15 and 0.65 to animate lips
      setSpeechLevel(Math.random() * 0.5 + 0.15);
      speechLevelRafRef.current = requestAnimationFrame(animateSpeech);
    };

    audio.onplay = () => {
      speechLevelRafRef.current = requestAnimationFrame(animateSpeech);
    };

    audio.onended = () => {
      setSpeechLevel(0);
      if (speechLevelRafRef.current) {
        cancelAnimationFrame(speechLevelRafRef.current);
        speechLevelRafRef.current = null;
      }
      audioElementRef.current = null;
      
      // AI finished speaking, start listening for candidate answer
      setAgentState('listening');
      setIsMicMuted(false);
      startRecording();
    };

    audio.onerror = () => {
      setSpeechLevel(0);
      audioElementRef.current = null;
      setAgentState('listening');
      setIsMicMuted(false);
      startRecording();
    };

    audio.play().catch(err => {
      console.warn('Autoplay blocked or audio playback error:', err);
      setSpeechLevel(0);
      audioElementRef.current = null;
      setAgentState('listening');
      setIsMicMuted(false);
      startRecording();
    });
  }, [startRecording]);

  const handleConnectLive = useCallback(async () => {
    const problem = currentProblemRef.current;
    const langName = languageRef.current;

    setIsConnectingLive(true);
    try {
      const session = await offlineInterviewService.startSession(
        problem.title,
        'demo-user-aarav',
        langName === 'cpp' ? 'C++' : langName === 'python' ? 'Python' : 'JavaScript'
      );

      setIsLiveConnected(true);
      setSubtitles(session.currentQuestion);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: session.currentQuestion,
          timestamp: Date.now()
        }
      ]);

      if (session.audioUrl) {
        playAudio(session.audioUrl);
      } else {
        // Fallback
        setAgentState('listening');
        setIsMicMuted(false);
        startRecording();
      }
    } catch (e) {
      console.error('Failed to start local session:', e);
      setSubtitles('⚠️ Error connecting to GyaanSetu local backend.');
    } finally {
      setIsConnectingLive(false);
    }
  }, [playAudio, startRecording, setMessages]);

  const handleDisconnectLive = useCallback(async () => {
    // Stop playing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (speechLevelRafRef.current) {
      cancelAnimationFrame(speechLevelRafRef.current);
      speechLevelRafRef.current = null;
    }

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = null; // Prevent triggers
      mediaRecorderRef.current.stop();
    }
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach(track => track.stop());
      inputStreamRef.current = null;
    }

    // Stop volume metering
    if (volumeMeterRafRef.current) {
      cancelAnimationFrame(volumeMeterRafRef.current);
      volumeMeterRafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setSubtitles('Interview ended. Generating score report...');
    setAgentState('thinking');

    try {
      const report = await offlineInterviewService.endSession();

      const reportMessage = `
🎓 **Interview Completed! Local AI Evaluation Report:**

*   **Overall Score**: ${report.overallScore}/100
*   **Technical Score**: ${report.technicalScore}/100
*   **Communication Score**: ${report.communicationScore}/100
*   **Confidence Score**: ${report.confidenceScore}/100
*   **Verdict**: **${report.verdict}**

📝 **Summary**:
${report.summary}

⭐ **Strengths**:
${report.strengths && report.strengths.length > 0 ? report.strengths.map(s => `\n* ${s}`).join('') : '\n* Demonstrated logical approach'}

💡 **Improvement Areas**:
${report.improvementAreas && report.improvementAreas.length > 0 ? report.improvementAreas.map(a => `\n* ${a}`).join('') : '\n* Dive deeper into algorithmic complexity'}
      `;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: reportMessage,
          timestamp: Date.now()
        }
      ]);
    } catch (e) {
      console.error('Failed to end local session:', e);
    }

    setIsLiveConnected(false);
    setVolume(0);
    setSpeechLevel(0);
    setIsMicMuted(true);
    setAgentState('idle');
  }, [setMessages]);

  const toggleMic = useCallback(() => {
    // Mute = Finish speaking and submit answer
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsMicMuted(true);
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraEnabled(prev => !prev);
  }, []);

  // Mock ref for UI binding compatibility
  const liveServiceRef = useRef<any>(null);

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
