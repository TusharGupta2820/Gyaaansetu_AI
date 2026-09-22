import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ChatMessage, InterviewLanguage, InterviewProblem } from '@/types';
import type { LiveService } from '@/services/liveService';
import { sendOpenSourceChat, speakOpenSource, executeCode, fetchRandomLeetCodeProblem, type ExecutionResult } from '@/services/openSourceService';
import { PROBLEMS } from '@/constants';

interface UseInterviewSessionParams {
  apiKey?: string; // kept for backwards compatibility, not used for AI calls
}

/**
 * Manages the interview session state: problem selection, language,
 * code editor content, chat messages, and message sending (text or live).
 *
 * Call `setLiveRefs()` inside a useEffect after the live hook initialises
 * to wire up live-connected state without creating a circular dependency.
 */
export function useInterviewSession({ apiKey }: UseInterviewSessionParams) {
  const [currentProblem, setCurrentProblem] = useState<InterviewProblem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<InterviewLanguage>('python');
  const [code, setCode] = useState(PROBLEMS[0].starters.python);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Compiler Execution state
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  // Animation Ref
  const typeEffectIntervalRef = useRef<number | null>(null);

  // Refs for values read inside async callbacks — avoids stale closures
  // and keeps useCallback dependency arrays minimal.
  const isLiveConnectedRef = useRef(false);
  const liveServiceExtRef = useRef<LiveService | null>(null);
  const messagesRef = useRef(messages);
  const currentProblemRef = useRef(currentProblem);
  const languageRef = useRef(language);
  const codeRef = useRef(code);

  // Keep refs in sync with state
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { currentProblemRef.current = currentProblem; }, [currentProblem]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { codeRef.current = code; }, [code]);

  /**
   * Run candidate code via multi-language execution backend.
   */
  const handleRunCode = useCallback(async () => {
    setIsExecuting(true);
    setIsTerminalOpen(true);
    try {
      const result = await executeCode(codeRef.current, languageRef.current);
      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult({
        output: '',
        error: `Execution error: ${err?.message || 'Unknown error'}`,
        execution_time_ms: 0,
        status: 'runtime_error',
      });
    } finally {
      setIsExecuting(false);
    }
  }, []);

  /**
   * Synchronise live-interview refs.
   * Must be called inside a useEffect in the parent component.
   */
  const setLiveRefs = useCallback(
    (connected: boolean, service: React.RefObject<LiveService | null>) => {
      isLiveConnectedRef.current = connected;
      liveServiceExtRef.current = service.current;
    },
    [],
  );

  // Reset messages when problem changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'model',
        text: `Hello. I am your AI Technical Interviewer. We will be working on "${currentProblem.title}".\n\nPlease let me know when you are ready to begin.`,
        timestamp: Date.now(),
      },
    ]);
  }, [currentProblem.title]);

  const handleSelectProblem = useCallback((problem: InterviewProblem) => {
    setCurrentProblem(problem);
    const starter = problem.starters?.[languageRef.current] || problem.starters?.python || `// ${problem.title}\n// Write your solution here...`;
    setCode(starter);
  }, []);

  const handleRandomProblem = useCallback(async () => {
    try {
      const fetched = await fetchRandomLeetCodeProblem();
      if (fetched) {
        handleSelectProblem({
          id: fetched.id,
          title: fetched.title,
          description: fetched.description,
          difficulty: fetched.difficulty as 'Easy' | 'Medium' | 'Hard',
          starters: fetched.starters
        });
        return;
      }
    } catch {}

    // Fallback to local static problems if offline
    const others = PROBLEMS.filter(p => p.id !== currentProblemRef.current.id);
    const pool = others.length > 0 ? others : PROBLEMS;
    const random = pool[Math.floor(Math.random() * pool.length)];
    handleSelectProblem(random);
  }, [handleSelectProblem]);

  const handleLanguageChange = useCallback(
    (lang: InterviewLanguage) => {
      if (lang === languageRef.current) return;
      setLanguage(lang);
      // Reset the code to starter snippet for selected language
      const starter = currentProblemRef.current.starters[lang] || currentProblemRef.current.starters.python || '';
      if (starter) {
        setCode(starter);
      }
    },
    [],
  );

  const setDynamicProblem = useCallback(
    (lang: string, title: string, description: string, starterCode: string) => {
      // Create a dynamic problem object
      const dynamicProblem: InterviewProblem = {
        id: `dynamic-${Date.now()}`,
        title,
        description,
        difficulty: 'Medium',
        starters: {
          [lang as InterviewLanguage]: starterCode
        } as Record<InterviewLanguage, string>
      };
      
      setCurrentProblem(dynamicProblem);
      setLanguage(lang as InterviewLanguage);
      setCode(starterCode);

      console.log(`[useInterviewSession] Successfully changed problem to: "${title}" in ${lang}`);
    },
    []
  );

  const handleSendMessage = useCallback(
    async (text: string, useThinking: boolean) => {
      const newUserMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newUserMsg]);

      // If live interview is active, route text to the voice model
      if (isLiveConnectedRef.current && liveServiceExtRef.current) {
        await liveServiceExtRef.current.sendText(text);
        return;
      }

      // Build lightweight history for context
      const history = [...messagesRef.current, newUserMsg].map(m => ({
        role: m.role as 'user' | 'model',
        text: m.text,
      }));

      const problem = currentProblemRef.current;

      setIsLoadingChat(true);
      try {
        // Route through local DeepSeek-R1 via GyaanSetu backend (100% open source)
        const responseText = await sendOpenSourceChat(
          history,
          text,
          problem.title,
          problem.description,
          languageRef.current,
          codeRef.current,
          useThinking,
        );

        const newBotMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText || 'No response generated.',
          timestamp: Date.now(),
          isThinking: useThinking,
        };
        setMessages(prev => [...prev, newBotMsg]);

        // Speak via Piper TTS (open source, local)
        if (responseText) {
          speakOpenSource(responseText).then(audioUrl => {
            if (audioUrl) {
              const audio = new Audio(audioUrl);
              audio.play().catch(() => {}); // non-blocking
            }
          });
        }
      } catch {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'model',
          text: `Great thoughts! Let's continue working on "${problem.title}". What approach or data structure are you planning to use?`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoadingChat(false);
      }
    },
    [], // no apiKey dependency — uses local backend
  );

  const typeCodeEffect = useCallback((targetCode: string) => {
    // Clear any existing animation
    if (typeEffectIntervalRef.current) clearInterval(typeEffectIntervalRef.current);
    
    let currentIndex = 0;
    // Set to 5 characters per tick for a smooth, fast typing effect
    const charsPerTick = 5;
    
    // Clear the current editor first
    setCode("");
    
    typeEffectIntervalRef.current = window.setInterval(() => {
      currentIndex += charsPerTick;
      if (currentIndex >= targetCode.length) {
        setCode(targetCode);
        if (typeEffectIntervalRef.current) clearInterval(typeEffectIntervalRef.current);
      } else {
        setCode(targetCode.substring(0, currentIndex));
      }
    }, 20); // 20ms per tick
  }, []);

  const latestModelText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'model' && messages[i].text.trim()) {
        return messages[i].text;
      }
    }
    return '';
  }, [messages]);

  return {
    currentProblem,
    setCurrentProblem,
    language,
    setLanguage,
    setDynamicProblem,
    code,
    setCode,
    messages,
    setMessages,
    isLoadingChat,
    executionResult,
    isExecuting,
    isTerminalOpen,
    setIsTerminalOpen,
    handleRunCode,
    handleRandomProblem,
    handleSelectProblem,
    handleLanguageChange,
    handleSendMessage,
    setLiveRefs,
    typeCodeEffect,
    latestModelText,
  } as const;
}

