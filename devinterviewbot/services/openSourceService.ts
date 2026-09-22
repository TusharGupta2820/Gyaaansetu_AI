/// <reference types="vite/client" />
/**
 * GyaanSetu AI — Open Source Interview Service
 * Routes ALL AI calls through the local FastAPI backend (Ollama).
 *
 * Stack (100% open source, runs locally on Ollama):
 *   Chat/Reasoning → deepseek-r1 via Ollama   (~82% HumanEval coding accuracy)
 *   STT            → Whisper (openai/whisper)  (~96% WER accuracy)
 *   TTS            → Piper TTS                 (fast, expressive, local)
 *
 * No Gemini API key needed. No cloud calls made.
 */

export function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

/**
 * Detects if the user requested a specific Indian regional language.
 * Checks for keywords or Unicode ranges corresponding to: Hindi, Marathi, Tamil, Telugu, Bengali.
 */
function detectLanguage(text: string, currentLang: string = "English"): string {
  const normalized = text.toLowerCase();
  
  if (normalized.includes("hindi") || normalized.includes("हिंदी") || /[\u0900-\u097F]/.test(text)) {
    return "Hindi";
  }
  if (normalized.includes("marathi") || normalized.includes("मराठी")) {
    return "Marathi";
  }
  if (normalized.includes("tamil") || normalized.includes("தமிழ்") || /[\u0B80-\u0BFF]/.test(text)) {
    return "Tamil";
  }
  if (normalized.includes("telugu") || normalized.includes("తెలుగు") || /[\u0C00-\u0C7F]/.test(text)) {
    return "Telugu";
  }
  if (normalized.includes("bengali") || normalized.includes("বাংলা") || /[\u0980-\u09FF]/.test(text)) {
    return "Bengali";
  }
  
  return currentLang;
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  "Hindi": "हिंदी में जवाब दें। (Answer in Hindi language only) ",
  "Marathi": "मराठीत उत्तर द्या। (Answer in Marathi language only) ",
  "Tamil": "தமிழில் பதில் சொல்லுங்கள். (Answer in Tamil language only) ",
  "Telugu": "తెలుగులో సమాధానं చెప్పండి. (Answer in Telugu language only) ",
  "Bengali": "বাংলায় উত্তর দিন। (Answer in Bengali language only) ",
  "English": ""
};

/**
 * Fallback AI Interviewer response generator if Ollama or backend is slow/offline.
 */
function generateFallbackInterviewerResponse(
  userMessage: string,
  problemTitle: string,
  language: string,
  currentCode: string
): string {
  const msg = userMessage.toLowerCase().trim();
  
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("ready")) {
    return `Hello! Great to have you here. We are solving "${problemTitle}" in ${language.toUpperCase()}.\n\nTo start off, could you briefly walk me through your initial thoughts or brute force approach before we write the optimal code?`;
  }
  
  if (msg.includes("hash") || msg.includes("map") || msg.includes("dictionary")) {
    return `Excellent intuition! Using a hash map is a great way to achieve O(N) time complexity for "${problemTitle}". How would you handle duplicate values or indexing in your implementation?`;
  }

  if (msg.includes("pointer") || msg.includes("two pointer") || msg.includes("sliding")) {
    return `Good strategy. Using pointers works very efficiently here. What is the space complexity of this approach compared to a hash map?`;
  }

  if (msg.includes("test") || msg.includes("run") || msg.includes("output")) {
    return `Feel free to hit the **Run Code** button at any time to compile and execute your ${language} solution! Let me know when you'd like me to review your time complexity.`;
  }

  if (currentCode.trim().length > 40) {
    return `I see you've drafted some ${language} code for "${problemTitle}". Have you considered potential edge cases, such as empty inputs or negative values? Walk me through how your logic executes.`;
  }

  return `Thanks for sharing your thoughts on "${problemTitle}". How do you evaluate the overall time and space complexity of your current ${language} approach?`;
}

/**
 * Send a text message to the local DeepSeek-R1 / Llama3.1 interview assistant.
 * Routes through /tutor/chat/simple on the FastAPI backend (Ollama).
 */
export async function sendOpenSourceChat(
  history: ChatTurn[],
  userMessage: string,
  problemTitle: string,
  problemDescription: string,
  language: string,
  currentCode: string,
  useThinking: boolean = false,
): Promise<string> {
  // Format conversation history as a plain string context
  const historyText = history
    .slice(-6) // last 3 turns to save tokens
    .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.text}`)
    .join("\n");

  const fullPrompt = historyText
    ? `${historyText}\nCandidate: ${userMessage}`
    : `Candidate: ${userMessage}`;

  const detectedLanguage = detectLanguage(fullPrompt, "English");
  const langPrompt = LANGUAGE_INSTRUCTIONS[detectedLanguage] || "";

  // Build a rich context prompt for the coding interviewer
  const systemContext = `${langPrompt}You are a professional AI coding interviewer.
The candidate is working on: "${problemTitle}"
Problem: ${problemDescription}
Language: ${language}
Current Code:
\`\`\`${language}
${currentCode.slice(0, 3000)}
\`\`\`

Guide them with hints, ask clarifying questions, evaluate their approach.
Keep responses concise (2-4 sentences). Be encouraging but rigorous.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout limit

    const res = await fetch(`${getApiBase()}/tutor/chat/simple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message: fullPrompt,
        system: systemContext,
        task: useThinking ? "code" : "tutor", // "code" = deepseek-r1 (reasoning), "tutor" = llama3.1 (fast, offline)
        mode: "Interview Mode",
        language: detectedLanguage,
        user_id: "devinterview-session",
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return generateFallbackInterviewerResponse(userMessage, problemTitle, language, currentCode);
    }

    const data = await res.json();
    return data.response || data.text || generateFallbackInterviewerResponse(userMessage, problemTitle, language, currentCode);
  } catch {
    return generateFallbackInterviewerResponse(userMessage, problemTitle, language, currentCode);
  }
}

export interface ExecutionResult {
  output: string;
  error: string;
  execution_time_ms: number;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout';
}

/**
 * Execute code in selected language via browser runner or FastAPI compiler endpoint.
 */
export async function executeCode(
  code: string,
  language: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const normLang = language.toLowerCase().trim();

  // Instant Client-Side Execution for JavaScript & TypeScript
  if (normLang === "javascript" || normLang === "typescript") {
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
        error: (...args: any[]) => logs.push("[Error] " + args.map(a => String(a)).join(" ")),
        warn: (...args: any[]) => logs.push("[Warn] " + args.map(a => String(a)).join(" ")),
        info: (...args: any[]) => logs.push(args.map(a => String(a)).join(" ")),
      };

      const startTime = performance.now();
      let execCode = code;
      if (normLang === "typescript") {
        execCode = code.replace(/:\s*(number|string|boolean|any|void|number\[\]|string\[\]|object)/g, "");
      }

      const runFn = new Function("console", execCode);
      runFn(customConsole);
      const duration = Math.round(performance.now() - startTime);

      return {
        output: logs.join("\n") || "Code executed cleanly. (Add console.log() to view output values).",
        error: "",
        execution_time_ms: duration,
        status: "success",
      };
    } catch (jsErr: any) {
      return {
        output: "",
        error: `JavaScript Runtime Error:\n${jsErr?.message || String(jsErr)}`,
        execution_time_ms: 0,
        status: "runtime_error",
      };
    }
  }

  // Backend Compiler Runner for Python, C++, Java, C#, Go, Rust, SQL, C
  try {
    const res = await fetch(`${getApiBase()}/interview/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, stdin }),
    });

    if (!res.ok) {
      return {
        output: "",
        error: `Execution server returned status ${res.status}`,
        execution_time_ms: 0,
        status: "runtime_error",
      };
    }

    return await res.json();
  } catch (err: any) {
    return {
      output: "",
      error: `Could not reach execution backend: ${err?.message || "Network error"}. Make sure backend is running on port 8000.`,
      execution_time_ms: 0,
      status: "runtime_error",
    };
  }
}

/**
 * Use Piper TTS via the backend to speak text locally.
 * Returns an audio URL or null if TTS is unavailable.
 */
export async function speakOpenSource(text: string): Promise<string | null> {
  try {
    const detectedLanguage = detectLanguage(text, "English");
    const res = await fetch(`${getApiBase()}/tutor/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.slice(0, 500),
        language: detectedLanguage
      }), // Piper works best with short segments
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.audio_url ? `${getApiBase()}${data.audio_url}` : null;
  } catch {
    return null;
  }
}

/** Check if the local backend (Ollama + Piper) is reachable. */
export async function isOpenSourceBackendReady(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/health/status`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch a random problem from the 1000+ LeetCode backend catalog.
 */
export async function fetchRandomLeetCodeProblem(
  difficulty?: string,
  category?: string
) {
  try {
    const params = new URLSearchParams();
    if (difficulty) params.append("difficulty", difficulty);
    if (category) params.append("category", category);

    const res = await fetch(`${getApiBase()}/interview/problem/random?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch a list of practice problems with optional search and category filters.
 */
export async function fetchLeetCodeProblemList(
  search?: string,
  category?: string,
  difficulty?: string
) {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);

    const res = await fetch(`${getApiBase()}/interview/problem/list?${params.toString()}`);
    if (!res.ok) return { total: 0, categories: ["All"], problems: [] };
    return await res.json();
  } catch {
    return { total: 0, categories: ["All"], problems: [] };
  }
}

/**
 * Generate a brand new custom coding problem using AI on demand.
 */
export async function generateAiLeetCodeProblem(
  topic: string,
  difficulty: string = "Medium"
) {
  try {
    const res = await fetch(`${getApiBase()}/interview/problem/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


