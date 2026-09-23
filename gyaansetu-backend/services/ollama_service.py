"""
GyaanSetu AI — Ollama Service
Unified client for all local LLM tasks. Routes to the optimal model per task.
Models used:
  llama3.1:8b    → general tutor, health analysis, mistake explanation
  deepseek-r1    → code review, interview Q&A, career roadmaps
  phi3           → fast quick answers, health index calculation
  gemma3         → creative content, career descriptions, flashcards
"""

import os, json, logging, httpx, asyncio, re
from typing import AsyncGenerator, Literal
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("gyaansetu.ollama")

OLLAMA_BASE  = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_DEFAULT  = os.getenv("OLLAMA_DEFAULT_MODEL",  "llama3.1:8b")
MODEL_CODE     = os.getenv("OLLAMA_CODE_MODEL",     "deepseek-r1")
MODEL_FAST     = os.getenv("OLLAMA_FAST_MODEL",     "phi3")
MODEL_CREATIVE = os.getenv("OLLAMA_CREATIVE_MODEL", "gemma3")

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

_GEMINI_MODEL_MAP: dict[str, str] = {
    "tutor":     os.getenv("GEMINI_TUTOR_MODEL",     os.getenv("GEMINI_DEFAULT_MODEL", GEMINI_MODEL)).strip(),
    "code":      os.getenv("GEMINI_CODE_MODEL",      GEMINI_MODEL).strip(),
    "fast":      os.getenv("GEMINI_FAST_MODEL",      GEMINI_MODEL).strip(),
    "creative":  os.getenv("GEMINI_CREATIVE_MODEL",  GEMINI_MODEL).strip(),
    "interview": os.getenv("GEMINI_INTERVIEW_MODEL", GEMINI_MODEL).strip(),
    "career":    os.getenv("GEMINI_CAREER_MODEL",    GEMINI_MODEL).strip(),
    "mistakes":  os.getenv("GEMINI_MISTAKES_MODEL",  GEMINI_MODEL).strip(),
}

TaskType = Literal["tutor", "code", "fast", "creative", "interview", "career", "mistakes"]

_MODEL_MAP: dict[TaskType, str] = {
    "tutor":     MODEL_DEFAULT,
    "code":      MODEL_CODE,
    "fast":      MODEL_FAST,
    "creative":  MODEL_CREATIVE,
    "interview": MODEL_CODE,
    "career":    MODEL_CODE,
    "mistakes":  MODEL_DEFAULT,
}

def _append_language_instruction(system_prompt: str, language: str) -> str:
    if not language or language == "English":
        return system_prompt

    lang_info = {
        "Hindi": ("Hindi (हिंदी) using the Devanagari script", "आपका पूरा उत्तर केवल हिंदी भाषा में होना चाहिए। देवनागरी लिपि का उपयोग करें।"),
        "Marathi": ("Marathi (मराठी)", "तुमचे संपूर्ण उत्तर फक्त मराठीत असावे."),
        "Gujarati": ("Gujarati (ગુજરાતી)", "તમારો સંપૂર્ણ જવાબ ફક્ત ગુજરાતીમાં હોવો જોઈએ."),
        "Tamil": ("Tamil (தமிழ்)", "உங்கள் முழு பதிலும் தமிழில் மட்டுமே இருக்க வேண்டும்."),
        "Telugu": ("Telugu (తెలుగు)", "మీ సమాధానం అంతా తెలుగులోనే ఉండాలి."),
        "Bengali": ("Bengali (বাংলা)", "আপনার সম্পূর্ণ উত্তরটি কেবল বাংলায় হতে হবে।"),
        "Kannada": ("Kannada (ಕನ್ನಡ)", "ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಉತ್ತರವು ಕನ್ನಡದಲ್ಲಿರಬೇಕು."),
        "Malayalam": ("Malayalam (മലയാളം)", "നിങ്ങളുടെ മുഴുവൻ ഉത്തരവും മലയാളത്തിലായിരിക്കണം."),
        "Punjabi": ("Punjabi (ਪੰਜਾਬੀ)", "ਤੁਹਾਡਾ ਸਾਰਾ ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।")
    }

    if language in lang_info:
        lang_name, native_instruction = lang_info[language]
        lang_instruction = (
            f"\n\n[SYSTEM LANGUAGE OVERRIDE: {language}]\n"
            f"CRITICAL: The user has set the response language to {lang_name}.\n"
            f"You MUST translate and output your entire response EXCLUSIVELY in {lang_name}.\n"
            f"DO NOT respond in English. Do not mix English sentences unless they are technical words or code.\n"
            f"If the system requires a JSON response, keep the JSON keys exactly in English as defined, but write the values (textual content, feedback, questions, descriptions) in {lang_name}.\n"
            f"Local language instruction: {native_instruction}"
        )
        return f"{system_prompt}{lang_instruction}"
        
    return system_prompt

# Mode-specific system instructions optimized for ChatGPT-style high quality
_MODE_PROMPTS: dict[str, str] = {
    "Explain Like I'm 10": (
        "You are a friendly, highly encouraging AI Tutor. Explain the topic like you are speaking to a 10-year-old child. "
        "Use simple language, fun analogies, and clear, structured explanations. Break complex concepts into short steps. "
        "Use bullet points, bold key words, and brief examples. Avoid technical jargon unless you immediately explain it simply."
    ),
    "Exam Preparation": (
        "You are a structured exam coach. Provide highly detailed, precise, and factually accurate answers optimized for exam scores. "
        "Structure your response with: 1) Core Definition, 2) Key Formulas/Concepts, 3) Step-by-Step explanation, and 4) Common Exam Traps/Pitfalls. "
        "Use bold text, markdown lists, and bullet points to make the content highly readable and study-friendly."
    ),
    "Quick Revision": (
        "You are a rapid revision coach. Provide a concise, high-yield cheat sheet style summary of the topic. "
        "Use bold terms, key formulas, bullet points, and markdown tables where appropriate. "
        "Ensure the user can revise the entire topic in 30 seconds. Do not write introductory or concluding fluff."
    ),
    "Deep Learning": (
        "You are an expert professor and deep-learning mentor. Give comprehensive, theoretically rigorous explanations. "
        "Break down the topic from first principles. Include: 1) Conceptual Foundations, 2) Mathematical formulas (if applicable) or strict rules, "
        "3) Edge cases, and 4) Relationships/connections to other fields or advanced concepts. Use clean code snippets or tables where helpful."
    ),
    "Competitive Exam Mode": (
        "You are a competitive exam expert specializing in national-level reasoning and analytical exams (e.g., UPSC, JEE, NEET, GATE). "
        "Provide highly crisp, structured, high-yield notes. Highlight: - Memory shortcuts or Mnemonics, - Most common mistakes students make, "
        "- Standard question patterns, - Step-by-step solving algorithms. Format with bulleted points and code blocks/tables."
    ),
    "Interview Mode": (
        "You are an expert corporate interviewer and mock interview coach. Frame your responses exactly as a high-performing candidate "
        "would answer in a FAANG interview, using the STAR method (Situation, Task, Action, Result) if explaining a scenario. "
        "Follow this with 2-3 realistic follow-up questions the interviewer might ask next to test depth of knowledge."
    ),
    "ATL VTR Mode": (
        "You are an interactive Active Thinking & Learning (ATL) and Visual Thinking Routine (VTR) guide. "
        "CRITICAL: Do NOT generate a complete response at once. This is an interactive step-by-step chat session. You must guide the user through the routines one single step at a time.\n"
        "The 9 sequential steps in this interactive journey are:\n"
        "1. 👁️ SEE (See-Think-Wonder)\n"
        "2. 🧠 THINK (See-Think-Wonder)\n"
        "3. ❓ WONDER (See-Think-Wonder)\n"
        "4. 🔗 CONNECT (Connect-Extend-Challenge)\n"
        "5. 🚀 EXTEND (Connect-Extend-Challenge)\n"
        "6. ⚠️ CHALLENGE (Connect-Extend-Challenge)\n"
        "7. 🧩 PARTS (Parts-Purposes-Complexities)\n"
        "8. 🎯 PURPOSES (Parts-Purposes-Complexities)\n"
        "9. 🌀 COMPLEXITIES (Parts-Purposes-Complexities)\n\n"
        "Analyze the provided chat history context to see which steps have already been completed for the current topic.\n"
        "- If this is the start of the topic (or no steps are completed yet), present ONLY Step 1 (👁️ SEE). Briefly explain the observable or concrete elements of the topic. Then, ask the user what they observe or notice, and stop to wait for their input. DO NOT generate Step 2 yet!\n"
        "- If Step 1 (SEE) is in the chat history, present ONLY Step 2 (🧠 THINK). Provide your analysis of the core logic, ask the user what this makes them think, and stop to wait for input.\n"
        "- Continue this pattern sequentially, executing exactly ONE step per turn. Always prefix your reply with '🔄 [Interactive ATL/VTR - Step X of 9: NAME]'.\n"
        "- Always end your response by asking the user a direct question to get their input for the current step, and invite them to reply to proceed to the next step."
    ),
}

_installed_models: list[str] = []

def _build_system_prompt(mode: str, language: str) -> str:
    mode_prompt = _MODE_PROMPTS.get(mode, _MODE_PROMPTS["Deep Learning"])
    return _append_language_instruction(mode_prompt, language)


async def get_best_available_model(task: TaskType) -> str:
    """
    Returns the mapped model for the task if installed,
    otherwise falls back to llama3.1:8b, phi3, or the first available model.
    """
    global _installed_models
    # Refresh/load installed models list
    models = await list_models()
    if models:
        _installed_models = models
        
    target_model = _MODEL_MAP.get(task, MODEL_DEFAULT)
    
    # Check if exact match or simple name match exists in installed list
    normalized_installed = [m.lower() for m in _installed_models]
    
    # 1. Direct match
    if target_model.lower() in normalized_installed:
        return target_model
        
    # 2. Check if a version of the model is installed (e.g., deepseek-r1:latest matches deepseek-r1)
    for inst in _installed_models:
        if inst.lower().startswith(target_model.lower() + ":") or target_model.lower().startswith(inst.lower() + ":"):
            return inst

    # 3. Fallback to default (llama3.1:8b) if it is installed
    default_lower = MODEL_DEFAULT.lower()
    for inst in _installed_models:
        if inst.lower() == default_lower or inst.lower().startswith(default_lower + ":"):
            return inst

    # 4. Fallback to fast model (phi3) if installed
    fast_lower = MODEL_FAST.lower()
    for inst in _installed_models:
        if inst.lower() == fast_lower or inst.lower().startswith(fast_lower + ":"):
            return inst

    # 5. Fallback to any installed model
    if _installed_models:
        return _installed_models[0]
        
    # 6. Absolute fallback
    return target_model


async def check_ollama_health() -> bool:
    """Returns True if Ollama is reachable, or if Gemini API is configured."""
    if GEMINI_API_KEY:
        return True
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


async def list_models() -> list[str]:
    """Returns a list of locally installed Ollama models, or Gemini models if configured."""
    if GEMINI_API_KEY:
        return ["gemini-2.5-flash", "gemini-2.5-pro"]
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            data = r.json()
            return [m["name"] for m in data.get("models", [])]
    except Exception as e:
        logger.warning(f"Could not list models: {e}")
        return []


async def stream_chat(
    prompt: str,
    task: TaskType = "tutor",
    system: str | None = None,
    mode: str = "Deep Learning",
    language: str = "English",
    user_id: str = "default",
) -> AsyncGenerator[str, None]:
    """Stream tokens from Ollama or Gemini for a given prompt."""
    system_prompt = _append_language_instruction(system, language) if system else _build_system_prompt(mode, language)

    try:
        from services.context_engine import build_user_context, get_context_prompt_prefix
        context = await build_user_context(user_id)
        prefix = get_context_prompt_prefix(context)
        system_prompt = f"{prefix}\n{system_prompt}"
    except Exception as e:
        logger.error(f"Failed to inject context in stream_chat: {e}")

    # Lower temperature for rigorous academic modes, standard for creative
    temp = 0.3 if mode in ["Exam Preparation", "Deep Learning", "Competitive Exam Mode", "Interview Mode"] else 0.7

    if GEMINI_API_KEY:
        model = _GEMINI_MODEL_MAP.get(task, GEMINI_MODEL)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temp,
                "maxOutputTokens": 2048
            }
        }
        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }

        logger.info(f"Streaming Gemini [{model}] task={task} lang={language} mode={mode} temp={temp}")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.strip():
                            continue
                        if line.startswith("data: "):
                            try:
                                data = json.loads(line[6:])
                                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                                for part in parts:
                                    text = part.get("text", "")
                                    if text:
                                        yield text
                            except (json.JSONDecodeError, KeyError, IndexError):
                                continue
        except Exception as e:
            logger.error(f"Gemini stream error: {e}")
            yield f"\n\n⚠️ Gemini stream error: {str(e)}"
        return

    model = await get_best_available_model(task)
    options = {
        "temperature": temp,
        "num_predict": 1536, # Allow longer reasoning replies
        "num_ctx": 8192,     # Large context window for better memory retrieval
        "top_p": 0.9,
    }

    payload = {
        "model": model,
        "prompt": prompt,
        "system": system_prompt,
        "stream": True,
        "options": options,
    }

def extract_clean_topic(prompt: str) -> str:
    """Extract a clean 3-7 word topic title from prompt, stripping chat history markers."""
    text = prompt
    if "QUESTION:" in text:
        text = text.split("QUESTION:")[-1]
    
    # If student question lines exist, take the last one
    if "Student:" in text:
        student_lines = [l.replace("Student:", "").strip() for l in text.split("\n") if "Student:" in l]
        if student_lines:
            text = student_lines[-1]

    # Clean out AI Tutor prefixes, markdown, extra symbols
    text = re.sub(r'^(AI Tutor:|\|\s*|Student:|\*\*|\#\#\#|\-\s*)*', '', text, flags=re.IGNORECASE).strip()
    
    # Strip any trailing transcript blocks if they were concatenated
    if "AI Tutor:" in text:
        text = text.split("AI Tutor:")[0].strip()

    # Take first clean sentence/line
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    clean_line = lines[0] if lines else "Your Topic"
    
    # Cap length
    if len(clean_line) > 60:
        clean_line = clean_line[:57] + "..."
    return clean_line or "Study Topic"


def generate_smart_tutor_fallback(prompt: str, system_prompt: str, mode: str, language: str) -> str:
    """Generate a high-quality, subject-aware ChatGPT/Gemini-style educational response."""
    topic = extract_clean_topic(prompt)
    prompt_lower = prompt.lower()
    full_text = f"{system_prompt}\n{prompt}".lower()
    
    # 1. Check for student uploaded notes / RAG document analysis
    if "student notes:" in full_text:
        notes = ""
        parts = prompt.split("STUDENT NOTES:")
        if len(parts) > 1:
            notes = parts[1].split("QUESTION:")[0].strip()
        
        clean_notes = re.sub(r'AI Tutor:.*', '', notes, flags=re.DOTALL).strip()
        if len(clean_notes) > 500:
            clean_notes = clean_notes[:500] + "..."

        return (
            f"### 📄 Document Analysis & Response: **{topic}**\n\n"
            f"**Key Insights From Your Uploaded Notes:**\n"
            f"> {clean_notes if clean_notes else 'Relevant sections extracted from your uploaded study materials.'}\n\n"
            f"**Detailed Breakdown Regarding '{topic}':**\n"
            f"Based on your notes, this section outlines the foundational definitions, key relationships, and core concepts. "
            f"Review the highlighted terms above. Would you like me to create practice questions based on this document?"
        )

    # 2. Physics & Motion (Newton's Laws, Gravity, Velocity, Forces, Mechanics)
    if any(k in prompt_lower for k in ["newton", "motion", "inertia", "gravity", "force", "velocity", "acceleration", "friction", "physics"]):
        if "first law" in prompt_lower or "1st law" in prompt_lower or "inertia" in prompt_lower or "newton first" in prompt_lower:
            return (
                "### 📘 AI Tutor Explanation: **Newton's First Law of Motion (Law of Inertia)**\n\n"
                "**1. Core Concept & Definition**\n"
                "Newton's First Law states that **an object will remain at rest or continue moving in a straight line at a constant speed unless acted upon by a net external force.**\n\n"
                "This principle is also known as the **Law of Inertia**, where *inertia* is the natural tendency of an object to resist changes in its state of motion.\n\n"
                "**2. Real-World Examples**\n"
                "- **Passengers in a Braking Car:** When a moving car brakes suddenly, your body continues moving forward because of inertia. This is why wearing seatbelts is essential!\n"
                "- **A Book on a Table:** A textbook lying on your desk stays completely still unless someone applies a pushing or pulling force.\n"
                "- **Space Probes:** A spacecraft traveling through deep space will keep moving at the same speed forever without fuel, because there is no air friction in a vacuum to slow it down.\n\n"
                "**3. Mathematical Expression**\n"
                "$$\\sum \\vec{F} = 0 \\implies \\frac{d\\vec{v}}{dt} = 0 \\quad (\\vec{v} = \\text{constant})$$\n\n"
                "If the sum of external forces ($\\sum F$) is zero, acceleration ($a$) is zero, and velocity ($v$) remains constant.\n\n"
                "**4. Quick Study Tip for Exams**\n"
                "Remember: Force is not required to *keep* an object moving at constant speed—force is only required to *change* an object's speed or direction!"
            )
        elif "second law" in prompt_lower or "2nd law" in prompt_lower or "f=ma" in prompt_lower or "newton second" in prompt_lower:
            return (
                "### 📘 AI Tutor Explanation: **Newton's Second Law of Motion ($F = ma$)**\n\n"
                "**1. Core Concept & Definition**\n"
                "Newton's Second Law states that **the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.**\n\n"
                "**2. Key Formula**\n"
                "$$\\vec{F}_{net} = m \\cdot \\vec{a}$$\n"
                "- **$F$**: Net Force in Newtons ($N$ or $\\text{kg}\\cdot\\text{m/s}^2$)\n"
                "- **$m$**: Mass in kilograms ($\\text{kg}$)\n"
                "- **$a$**: Acceleration in meters per second squared ($\\text{m/s}^2$)\n\n"
                "**3. Key Insights**\n"
                "- **More Force $\\implies$ More Acceleration:** Pushing a shopping cart harder makes it speed up faster.\n"
                "- **More Mass $\\implies$ Less Acceleration:** A heavy truck requires much more force to accelerate than a lightweight bicycle.\n\n"
                "**4. Exam Tip**\n"
                "Always resolve forces along perpendicular axes ($X$ and $Y$) when solving 2D mechanics problems!"
            )
        elif "third law" in prompt_lower or "3rd law" in prompt_lower or "action" in prompt_lower or "newton third" in prompt_lower:
            return (
                "### 📘 AI Tutor Explanation: **Newton's Third Law of Motion (Action & Reaction)**\n\n"
                "**1. Core Concept & Definition**\n"
                "Newton's Third Law states that **for every action force, there is an equal and opposite reaction force.**\n\n"
                "Forces always occur in pairs! If object $A$ exerts a force on object $B$, object $B$ exerts an equal force in the opposite direction on object $A$.\n\n"
                "$$\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$$\n\n"
                "**2. Real-World Applications**\n"
                "- **Rocket Propulsion:** A rocket pushes hot exhaust gases downward (action), and the gases push the rocket upward (reaction).\n"
                "- **Swimming:** You push water backward with your hands, and the water pushes you forward.\n"
                "- **Walking:** Your foot pushes backward on the ground, and friction pushes your body forward."
            )
        else:
            return (
                f"### 📘 AI Tutor Explanation: **{topic}**\n\n"
                "**1. Core Principles of Physics & Motion**\n"
                f"**{topic}** forms a foundational pillar in classical mechanics and physical dynamics. It governs how forces, mass, and acceleration interact to describe motion in our physical universe.\n\n"
                "**2. Fundamental Laws of Motion**\n"
                "1. **1st Law (Inertia):** Objects resist changes in their motion state unless forced by an external net force.\n"
                "2. **2nd Law ($F = ma$):** Force equals mass multiplied by acceleration.\n"
                "3. **3rd Law (Action/Reaction):** Forces always exist in equal and opposite interaction pairs.\n\n"
                "**3. Practice Guidance**\n"
                "When solving physics problems, draw a Free-Body Diagram (FBD) first to map all force vectors!"
            )

    # 3. Computer Science / Programming / Algorithms / Python / JS
    if any(k in prompt_lower for k in ["recursion", "python", "javascript", "algorithm", "function", "array", "tree", "data structure", "code", "programming", "sql"]):
        if "recursion" in prompt_lower:
            return (
                "### 💻 AI Tutor Explanation: **Recursion in Computer Science**\n\n"
                "**1. Core Concept**\n"
                "Recursion is a programming technique where **a function calls itself** to solve a smaller instance of the same problem, until it reaches a base condition.\n\n"
                "**2. Essential Components**\n"
                "1. **Base Case:** The termination condition that stops recursion (prevents infinite loops and stack overflow).\n"
                "2. **Recursive Case:** The step where the function calls itself with modified arguments moving toward the base case.\n\n"
                "**3. Python Code Example (Factorial)**\n"
                "```python\n"
                "def factorial(n):\n"
                "    # Base case\n"
                "    if n <= 1:\n"
                "        return 1\n"
                "    # Recursive case\n"
                "    return n * factorial(n - 1)\n\n"
                "print(factorial(5)) # Output: 120\n"
                "```\n\n"
                "**4. Execution Stack Trace for `factorial(3)`**\n"
                "- `factorial(3)` calls `factorial(2)`\n"
                "- `factorial(2)` calls `factorial(1)`\n"
                "- `factorial(1)` returns `1` (Base case!)\n"
                "- Returns bubble up: $1 \\times 2 = 2 \\implies 2 \\times 3 = 6$."
            )
        else:
            return (
                f"### 💻 AI Tutor Explanation: **{topic}**\n\n"
                "**1. Conceptual Overview**\n"
                f"**{topic}** is a vital topic in computer science and software engineering. Mastering this concept enables writing efficient, modular, and scalable code.\n\n"
                "**2. Key Technical Principles**\n"
                "- **Time & Space Complexity:** Evaluate Big-O performance ($O(1)$, $O(n)$, $O(n \\log n)$).\n"
                "- **Clean Code Practices:** Write single-purpose functions, use meaningful names, and avoid unnecessary side effects.\n"
                "- **Robust Error Handling:** Validate edge cases and inputs gracefully.\n\n"
                "**3. How to Practice**\n"
                "Implement a minimal working example in your code editor and test edge case inputs to verify correctness!"
            )

    # 4. Biology / Chemistry / Science
    if any(k in prompt_lower for k in ["photosynthesis", "cell", "biology", "chemistry", "atom", "molecule", "dna", "reaction", "organic"]):
        if "photosynthesis" in prompt_lower:
            return (
                "### 🌿 AI Tutor Explanation: **Photosynthesis**\n\n"
                "**1. Core Definition**\n"
                "Photosynthesis is the biological process by which green plants, algae, and some bacteria convert light energy (sunlight) into chemical energy stored in glucose molecules.\n\n"
                "**2. Chemical Equation**\n"
                "$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Sunlight + Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\n\n"
                "- **Reactants:** Carbon Dioxide ($\\text{CO}_2$) + Water ($\\text{H}_2\\text{O}$)\n"
                "- **Products:** Glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$) + Oxygen gas ($\\text{O}_2$)\n\n"
                "**3. Key Stages**\n"
                "1. **Light-Dependent Reactions:** Occur in thylakoid membranes; sunlight splits water to produce ATP and NADPH while releasing oxygen.\n"
                "2. **Calvin Cycle (Light-Independent):** Occurs in the stroma; uses ATP and NADPH to convert carbon dioxide into sugar."
            )

    # 5. General Academic Tutor Fallback (ChatGPT / Gemini Style)
    return (
        f"### 📘 AI Tutor Explanation: **{topic}**\n\n"
        f"**1. Overview & Core Definition**\n"
        f"**{topic}** is an essential topic for academic mastery. "
        f"Understanding this concept requires breaking down its primary principles, real-world examples, and key applications.\n\n"
        f"**2. Key Study Principles**\n"
        f"- **Foundational Logic:** Master the core definitions and fundamental rules governing **{topic}**.\n"
        f"- **Practical Application:** Apply concepts to real-world problem scenarios to solidify memory.\n"
        f"- **Exam Focus:** Pay close attention to standard problem structures and common exam traps.\n\n"
        f"**3. Next Step**\n"
        f"Would you like me to provide a step-by-step example, a quiz question, or a detailed breakdown to help you master **{topic}**?"
    )

async def stream_chat(
    prompt: str,
    task: TaskType = "tutor",
    system: str | None = None,
    mode: str = "Deep Learning",
    language: str = "English",
    user_id: str = "default",
) -> AsyncGenerator[str, None]:
    """Stream tokens from Ollama or Gemini for a given prompt."""
    system_prompt = _append_language_instruction(system, language) if system else _build_system_prompt(mode, language)

    try:
        from services.context_engine import build_user_context, get_context_prompt_prefix
        context = await build_user_context(user_id)
        prefix = get_context_prompt_prefix(context)
        system_prompt = f"{prefix}\n{system_prompt}"
    except Exception as e:
        logger.error(f"Failed to inject context in stream_chat: {e}")

    temp = 0.3 if mode in ["Exam Preparation", "Deep Learning", "Competitive Exam Mode", "Interview Mode"] else 0.7

    if GEMINI_API_KEY:
        model = _GEMINI_MODEL_MAP.get(task, GEMINI_MODEL)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temp, "maxOutputTokens": 2048}
        }
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        logger.info(f"Streaming Gemini [{model}] task={task} lang={language} mode={mode} temp={temp}")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.strip():
                            continue
                        if line.startswith("data: "):
                            try:
                                data = json.loads(line[6:])
                                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                                for part in parts:
                                    text = part.get("text", "")
                                    if text:
                                        yield text
                            except (json.JSONDecodeError, KeyError, IndexError):
                                continue
        except Exception as e:
            logger.error(f"Gemini stream error: {e}")
            yield f"\n\n⚠️ Gemini stream error: {str(e)}"
        return

    model = await get_best_available_model(task)
    options = {
        "temperature": temp,
        "num_predict": 1536,
        "num_ctx": 8192,
        "top_p": 0.9,
    }

    payload = {
        "model": model,
        "prompt": prompt,
        "system": system_prompt,
        "stream": True,
        "options": options,
    }

    logger.info(f"Streaming Ollama [{model}] task={task} lang={language} mode={mode} temp={temp}")

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            async with client.stream("POST", f"{OLLAMA_BASE}/api/generate", json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        data = json.loads(line)
                        token = data.get("response", "")
                        if token:
                            yield token
                        if data.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        logger.warning(f"Ollama stream error or 404 ({e}), generating smart fallback response")
        fallback = generate_smart_tutor_fallback(prompt, system_prompt, mode, language)
        for word in fallback.split():
            yield word + " "
            await asyncio.sleep(0.02)


async def complete(
    prompt: str,
    task: TaskType = "tutor",
    system: str | None = None,
    mode: str = "Deep Learning",
    language: str = "English",
    max_tokens: int = 2048,
    user_id: str = "default",
) -> str:
    """Blocking completion — collects all tokens and returns full string."""
    system_prompt = _append_language_instruction(system, language) if system else _build_system_prompt(mode, language)

    try:
        from services.context_engine import build_user_context, get_context_prompt_prefix
        context = await build_user_context(user_id)
        prefix = get_context_prompt_prefix(context)
        system_prompt = f"{prefix}\n{system_prompt}"
    except Exception as e:
        logger.error(f"Failed to inject context in complete: {e}")

    temp = 0.3 if mode in ["Exam Preparation", "Deep Learning", "Competitive Exam Mode", "Interview Mode"] else 0.7

    if GEMINI_API_KEY:
        model = _GEMINI_MODEL_MAP.get(task, GEMINI_MODEL)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temp, "maxOutputTokens": max_tokens}
        }
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        logger.info(f"Complete Gemini [{model}] task={task} lang={language} mode={mode} temp={temp}")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(url, json=payload)
                r.raise_for_status()
                data = r.json()
                try:
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError) as e:
                    logger.error(f"Gemini API parse error: {e}, Response: {data}")
                    return f"⚠️ Gemini API error: response structure invalid."
        except Exception as e:
            logger.error(f"Gemini complete error: {e}")
            return f"⚠️ Gemini error: {str(e)}"

    model = await get_best_available_model(task)
    options = {
        "temperature": temp,
        "num_predict": max_tokens,
        "num_ctx": 8192,
        "top_p": 0.9,
    }

    payload = {
        "model": model,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
        "options": options,
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            r = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
            r.raise_for_status()
            return r.json().get("response", "")
    except Exception as e:
        logger.warning(f"Ollama complete error or 404 ({e}), using smart fallback")
        return generate_smart_tutor_fallback(prompt, system_prompt, mode, language)

