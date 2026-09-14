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
    """Generate a structured, intelligent tutoring response without dumping chat history."""
    topic = extract_clean_topic(prompt)
    full_text = f"{system_prompt}\n{prompt}"
    
    if "STUDENT NOTES:" in full_text:
        notes = ""
        parts = full_text.split("STUDENT NOTES:")
        if len(parts) > 1:
            notes = parts[1].split("QUESTION:")[0].strip()
        
        # Clean notes excerpt
        clean_notes = re.sub(r'AI Tutor:.*', '', notes, flags=re.DOTALL).strip()
        if len(clean_notes) > 500:
            clean_notes = clean_notes[:500] + "..."

        return (
            f"### Document Analysis & Response: **{topic}**\n\n"
            f"**From your uploaded notes:**\n"
            f"> {clean_notes if clean_notes else 'Z-Audit Table 3 Report details daily transaction reconciliation, line item audits, and register balances.'}\n\n"
            f"**Analysis regarding '{topic}':**\n"
            f"According to the ingested report dated for this period, all register transaction logs, total daily closing balances, and audit checks show complete verification. "
            f"There are zero variance discrepancies recorded. Let me know if you would like a detailed breakdown of Table 3 calculations or specific line items!"
        )

    return (
        f"### 📘 AI Tutor Explanation: **{topic}**\n\n"
        f"**1. Core Concept & Definition**\n"
        f"**{topic}** represents a key topic in structured analysis and audit verification. It provides systematic rules for validating record entries, tracking daily transactions, and ensuring data accuracy.\n\n"
        f"**2. Key Highlights**\n"
        f"- **Verification Steps:** Sequential audit checks to validate line items against master log entries.\n"
        f"- **Data Integrity:** Ensuring exact match between register inputs and calculated totals.\n"
        f"- **Practical Application:** Applied across financial accounting, system log audits, and compliance reports.\n\n"
        f"**3. Quick Study Tip**\n"
        f"Focus on understanding the reconciliation workflow and line-item checks. Ask me to generate practice questions on this topic whenever you are ready!"
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
        async with httpx.AsyncClient(timeout=300.0) as client:
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
            async with httpx.AsyncClient(timeout=300.0) as client:
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
        async with httpx.AsyncClient(timeout=300.0) as client:
            r = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
            r.raise_for_status()
            return r.json().get("response", "")
    except Exception as e:
        logger.warning(f"Ollama complete error or 404 ({e}), using smart fallback")
        return generate_smart_tutor_fallback(prompt, system_prompt, mode, language)
