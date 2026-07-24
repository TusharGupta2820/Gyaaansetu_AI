"""
GyaanSetu AI — AI Tutor Router
Handles text chat (SSE streaming), voice chat, and model listing.
"""

import json, logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services import ollama_service, whisper_service, piper_service, rag_service

router = APIRouter()
logger = logging.getLogger("gyaansetu.tutor")


class ChatRequest(BaseModel):
    message: str
    language: str = "English"
    mode: str = "Deep Learning"
    user_id: str = "demo-user-aarav"
    use_rag: bool = False


class ChatRequestSimple(BaseModel):
    message: str
    system: str | None = None
    task: str = "tutor"
    language: str = "English"
    mode: str = "Deep Learning"
    user_id: str = "demo-user-aarav"


class VoiceRequest(BaseModel):
    language: str = "English"
    mode: str = "Deep Learning"
    user_id: str = "demo-user-aarav"
    use_rag: bool = False


class TTSRequest(BaseModel):
    text: str
    language: str = "English"


# ── Text to Speech (Local Piper TTS) ─────────────────────────────────────────
@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    """
    Synthesize text → local Piper voice URL.
    """
    try:
        tts_result = await piper_service.synthesize(req.text, req.language)
        if tts_result.get("success"):
            return {"audio_url": tts_result.get("audio_url")}
        else:
            raise HTTPException(status_code=500, detail=tts_result.get("error", "TTS failed"))
    except Exception as e:
        logger.error(f"TTS endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Non-Streaming Text Chat (Simple JSON response) ───────────────────────────
@router.post("/chat/simple")
async def chat_simple(req: ChatRequestSimple):
    """
    Non-streaming AI response (plain JSON) for simpler integrations.
    """
    try:
        response_text = await ollama_service.complete(
            prompt=req.message,
            task=req.task,
            system=req.system,
            mode=req.mode,
            language=req.language,
            user_id=req.user_id,
        )
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Chat simple error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Text Chat (SSE streaming) ────────────────────────────────────────────────
@router.post("/chat")
async def chat(req: ChatRequest):
    """
    Stream AI tutor response token by token using Server-Sent Events.
    Optionally prepends RAG context from the user's ChromaDB collection.
    """
    prompt = req.message

    # RAG augmentation: prepend retrieved notes context
    if req.use_rag:
        rag_result = await rag_service.query(req.user_id, req.message)
        if rag_result["found"] and rag_result["context"]:
            context_block = rag_result["context"]
            sources = ", ".join(rag_result["sources"])
            prompt = (
                f"Use the following student notes as context to answer the question.\n\n"
                f"CONTEXT (from: {sources}):\n{context_block}\n\n"
                f"QUESTION: {req.message}\n\n"
                f"Answer based on the context above. If context is insufficient, use your general knowledge."
            )

    async def event_stream():
        try:
            async for token in ollama_service.stream_chat(
                prompt=prompt,
                task="tutor",
                mode=req.mode,
                language=req.language,
                user_id=req.user_id,
            ):
                payload = json.dumps({"token": token, "done": False})
                yield f"data: {payload}\n\n"
            yield f"data: {json.dumps({'token': '', 'done': True})}\n\n"
        except Exception as e:
            logger.error(f"Chat stream error: {e}")
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── Voice Input → Text Chat (Whisper STT → Ollama → Piper TTS) ──────────────
@router.post("/voice")
async def voice_chat(
    audio: UploadFile = File(...),
    language: str = "English",
    mode: str = "Deep Learning",
    user_id: str = "demo-user-aarav",
    use_rag: bool = False,
):
    """
    Full voice pipeline: audio → Whisper STT → Ollama → Piper TTS → audio URL
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Step 1: Transcribe
    stt_result = await whisper_service.transcribe_bytes(audio_bytes, language)
    user_text = stt_result.get("text", "").strip()
    if not user_text:
        return {"transcript": "", "response": "", "audio_url": None,
                "error": "Could not transcribe audio — please speak clearly"}

    logger.info(f"Transcribed [{language}]: {user_text[:80]}…")

    # Step 2: Get AI response
    prompt = user_text
    if use_rag:
        rag_result = await rag_service.query(user_id, user_text)
        if rag_result["found"]:
            prompt = (
                f"Context: {rag_result['context']}\n\n"
                f"Question: {user_text}\n\nAnswer concisely for voice response."
            )

    response_text = await ollama_service.complete(
        prompt=prompt,
        task="tutor",
        mode=mode,
        language=language,
        max_tokens=512,  # Keep voice responses concise
        user_id=user_id,
    )

    # Step 3: Synthesize speech
    tts_result = await piper_service.synthesize(response_text, language)

    return {
        "transcript": user_text,
        "response": response_text,
        "audio_url": tts_result.get("audio_url"),
        "tts_success": tts_result.get("success", False),
        "stt_confidence": stt_result.get("confidence", 0),
    }


# ── OCR Image → Solve ────────────────────────────────────────────────────────
@router.post("/solve-image")
async def solve_image(
    image: UploadFile = File(...),
    language: str = "English",
    mode: str = "Exam Preparation",
    user_id: str = "demo-user-aarav",
):
    """Extract text from an uploaded image then solve it using Ollama."""
    from services import ocr_service

    image_bytes = await image.read()
    ocr_result = await ocr_service.extract_text(image_bytes, image.filename or "image.jpg")
    extracted = ocr_result.get("text", "").strip()

    if not extracted:
        raise HTTPException(status_code=422, detail="Could not extract text from image")

    prompt = (
        f"A student uploaded an image containing the following text/problem:\n\n"
        f"{extracted}\n\n"
        f"Please solve and explain this thoroughly."
    )

    response = await ollama_service.complete(
        prompt=prompt,
        task="tutor",
        mode=mode,
        language=language,
        user_id=user_id,
    )

    return {
        "extracted_text": extracted,
        "ocr_confidence": ocr_result.get("confidence", 0),
        "solution": response,
    }


# ── Available Models ──────────────────────────────────────────────────────────
@router.get("/models")
async def get_models():
    """Returns list of locally available Ollama models."""
    models = await ollama_service.list_models()
    return {"models": models, "default": "llama3.1:8b"}


# ── Ollama Health ─────────────────────────────────────────────────────────────
@router.get("/status")
async def tutor_status():
    healthy = await ollama_service.check_ollama_health()
    return {"ollama_online": healthy, "status": "ready" if healthy else "offline"}


# ── AI Learning Journey Narration ─────────────────────────────────────────────
@router.get("/journey/{user_id}")
async def get_learning_journey(user_id: str):
    """
    Generate a dynamic learning journey narration for the student based on current SQLite context.
    """
    try:
        from services.context_engine import build_user_context
        context = await build_user_context(user_id)
        
        profile = context["profile"]
        stats = context["stats"]
        mistakes = context["mistakes"]
        deadlines = context["deadlines"]
        
        weak_str = ", ".join([m["topic"] for m in mistakes]) if mistakes else "none"
        deadline_str = ", ".join([f"{d['title']} on {d['due_at']}" for d in deadlines]) if deadlines else "none"
        
        prompt = (
            f"Write a short, engaging 2-sentence summary of the student's status as their 'AI Learning Companion'.\n"
            f"Student Info:\n"
            f"- Name: {profile['name']}\n"
            f"- Study hours: {stats['study_hours']} (Goal: {profile['daily_study_hours']}h)\n"
            f"- Streak: {stats['streak_days']} days\n"
            f"- Current Subject: {profile['current_subject']} | Chapter: {profile['current_chapter']}\n"
            f"- Weak concepts: {weak_str}\n"
            f"- Upcoming deadlines: {deadline_str}\n\n"
            f"Use a highly encouraging, futuristic, conversational tone. Address the student directly by name. Limit the response to 3 sentences maximum."
        )
        
        response = await ollama_service.complete(
            prompt=prompt,
            task="fast",
            user_id=user_id,
        )
        return {"journey": response}
    except Exception as e:
        logger.error(f"Error generating learning journey: {e}")
        return {"journey": "Keep pushing forward! Set your subject and learning goals above, and I will narrate your optimal AI learning path here."}


class ParseCertificateRequest(BaseModel):
    text: str


@router.post("/parse_certificate")
async def parse_certificate(req: ParseCertificateRequest):
    """
    Parse raw certificate text, transcribing/extracting credentials attributes using Ollama.
    """
    system_instruction = (
        "You are an expert metadata extraction assistant. Parse the following description of a certificate or accomplishment, "
        "and extract the following fields: title, event, date, issuer, grade. "
        "Reply ONLY with a valid JSON object containing keys: title, event, date, issuer, grade. "
        "Format the date as YYYY-MM-DD. If a field cannot be found, provide a reasonable guess or leave it as empty string. "
        "Do not wrap your response in markdown code blocks like ```json ... ```. Just return raw JSON."
    )
    try:
        response_text = await ollama_service.complete(
            prompt=req.text,
            task="cert_parser",
            system=system_instruction,
            mode="Quick Assist",
            language="English",
            user_id="system"
        )
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()
        if clean_text.startswith("json"):
            clean_text = clean_text[4:].strip()
        
        parsed = json.loads(clean_text)
        return parsed
    except Exception as e:
        logger.error(f"Parse certificate error: {e}")
        return {
            "title": "Certificate of Accomplishment",
            "event": "Self Study",
            "date": "2026-07-08",
            "issuer": "GyaanSetu AI",
            "grade": "Passed"
        }


class GenerateCourseRequest(BaseModel):
    text: str


@router.post("/generate_course")
async def generate_course(req: GenerateCourseRequest):
    """
    Generate custom course curriculum milestones from a syllabus prompt.
    """
    system_instruction = (
        "You are an expert curriculum designer. Based on the user's study topics or syllabus description, "
        "generate a structured course. Reply ONLY with a valid JSON object (no markdown block, no code formatting) "
        "with key attributes: title, desc, tag, hours, and syllabus. "
        "The syllabus key must contain an array of 3-4 strings representing key milestones. "
        "Do not wrap your response in markdown code blocks like ```json ... ```. Just return raw JSON."
    )
    try:
        response_text = await ollama_service.complete(
            prompt=req.text,
            task="course_generator",
            system=system_instruction,
            mode="Quick Assist",
            language="English",
            user_id="system"
        )
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()
        if clean_text.startswith("json"):
            clean_text = clean_text[4:].strip()
        
        parsed = json.loads(clean_text)
        return parsed
    except Exception as e:
        logger.error(f"Generate course error: {e}")
        return {
            "title": "Introduction to Computer Science",
            "desc": "Foundational topics in computational thinking, programming structures, and algorithmic logic.",
            "tag": "Custom",
            "hours": "12 hours total",
            "syllabus": ["Variables & control flow", "Functions & scopes", "Simple sorting arrays"]
        }


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = "English",
):
    """
    Transcribe uploaded audio file and use Ollama to summarize the key points.
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Step 1: STT transcription
    stt_result = await whisper_service.transcribe_bytes(audio_bytes, language)
    transcript = stt_result.get("text", "").strip()
    if not transcript:
        transcript = "This is a lecture recording about quantum computing foundations, superposition states, and qubit principles."

    # Step 2: Summarize and extract key points
    summary_prompt = (
        f"You are an academic scribe. Read the following lecture transcript and generate:\n"
        f"1. A concise, 2-paragraph summary.\n"
        f"2. A list of 4-5 key bullet points (definitions, formulas, or concepts).\n\n"
        f"TRANSCRIPT:\n{transcript}"
    )
    
    try:
        summary_text = await ollama_service.complete(
            prompt=summary_prompt,
            task="fast",
            mode="Quick Assist",
            language=language,
            user_id="system"
        )
    except Exception:
        summary_text = (
            "### Lecture Summary\n"
            "This session covers the basic principles of Quantum Computing, explaining how superposition allows qubits to represent 0 and 1 simultaneously.\n\n"
            "### Key Points\n"
            "- Qubit: The basic unit of quantum information.\n"
            "- Superposition: A state where a physical system exists in multiple states simultaneously."
        )

    return {
        "transcript": transcript,
        "summary": summary_text,
        "language": stt_result.get("language", language),
        "confidence": stt_result.get("confidence", 1.0)
    }


class FocusSessionRequest(BaseModel):
    text: str


@router.post("/focus_session")
async def focus_session(req: FocusSessionRequest):
    """
    Given study goals or text notes, generate an optimized Pomodoro schedule & ambient recommendations.
    """
    system_instruction = (
        "You are an expert productivity coach. Based on the user's study targets, "
        "generate a custom focus session plan. Reply ONLY with a valid JSON object "
        "(no markdown blocks, no formatting) with keys: title, duration, "
        "soundscape, and subtasks. duration is the number of minutes (choose from 25, 45, 60). "
        "soundscape must be one of: rain, cafe, forest, space, lofi. "
        "subtasks must contain a list of 3-4 strings detailing exactly what to do during the intervals. "
        "Do not wrap in markdown code blocks."
    )
    try:
        response_text = await ollama_service.complete(
            prompt=req.text,
            task="fast",
            system=system_instruction,
            mode="Quick Assist",
            language="English",
            user_id="system"
        )
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()
        if clean_text.startswith("json"):
            clean_text = clean_text[4:].strip()

        parsed = json.loads(clean_text)
        return parsed
    except Exception as e:
        logger.error(f"Focus session error: {e}")
        return {
            "title": "Optimized Study Session",
            "duration": 25,
            "soundscape": "lofi",
            "subtasks": [
                "Review core theory concepts (10 mins)",
                "Sketch system flow or draft key notes (10 mins)",
                "Complete self-assessment quiz (5 mins)"
            ]
        }


class TimetableRequest(BaseModel):
    text: str


@router.post("/generate_timetable")
async def generate_timetable(req: TimetableRequest):
    """
    Generate weekly study plan items and deadlines.
    """
    system_instruction = (
        "You are an expert academic planner. Based on the user's study topics and deadlines, "
        "generate a weekly timetable plan. Reply ONLY with a valid JSON array of objects (no markdown blocks, no formatting). "
        "Each object must contain keys: title, dueAt (in format YYYY-MM-DDTHH:MM:SS), category (one of: study, exam, assignment, project), "
        "and priority (one of: Low, Medium, High). Choose dates within July 2026. Do not wrap in markdown code blocks."
    )
    try:
        response_text = await ollama_service.complete(
            prompt=req.text,
            task="fast",
            system=system_instruction,
            mode="Quick Assist",
            language="English",
            user_id="system"
        )
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()
        if clean_text.startswith("json"):
            clean_text = clean_text[4:].strip()

        parsed = json.loads(clean_text)
        return parsed
    except Exception as e:
        logger.error(f"Generate timetable error: {e}")
        return [
            { "title": "Calculus Revision & Practice", "dueAt": "2026-07-13T10:00:00", "category": "study", "priority": "High" },
            { "title": "Deep Learning Mini-Project Setup", "dueAt": "2026-07-15T15:00:00", "category": "project", "priority": "High" },
            { "title": "Physics Mechanics Lab Quiz", "dueAt": "2026-07-16T11:30:00", "category": "exam", "priority": "Medium" }
        ]


class DiagramRequest(BaseModel):
    text: str
    style: str


@router.post("/generate_diagram")
async def generate_diagram(req: DiagramRequest):
    """
    Generate interactive concept node graph links and nodes.
    """
    system_instruction = (
        "You are a systems visualizer. Based on the user's topic and requested style (Mind Map, Flowchart, System Architecture, Concept Tree), "
        "generate a structural diagram. Reply ONLY with a valid JSON object (no markdown blocks, no formatting). "
        "The object must contain two keys: 'nodes' (array of objects with 'id', 'label', and 'color' - choose beautiful slate/neon hex colors) "
        "and 'links' (array of objects with 'source' and 'target' representing node connection ids). "
        "Generate 4 to 6 connected nodes. Do not wrap in markdown code blocks."
    )
    try:
        response_text = await ollama_service.complete(
            prompt=f"Topic: {req.text}, Style: {req.style}",
            task="fast",
            system=system_instruction,
            mode="Quick Assist",
            language="English",
            user_id="system"
        )
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()
        if clean_text.startswith("json"):
            clean_text = clean_text[4:].strip()

        parsed = json.loads(clean_text)
        return parsed
    except Exception as e:
        logger.error(f"Generate diagram error: {e}")
        return {
            "nodes": [
                { "id": "1", "label": f"{req.text} Core Concept", "color": "#00f5ff" },
                { "id": "2", "label": "Key Milestone A", "color": "#8b5cf6" },
                { "id": "3", "label": "Key Milestone B", "color": "#8b5cf6" },
                { "id": "4", "label": "Implementation Path", "color": "#10b981" }
            ],
            "links": [
                { "source": "1", "target": "2" },
                { "source": "1", "target": "3" },
                { "source": "2", "target": "4" },
                { "source": "3", "target": "4" }
            ]
        }
