"""
GyaanSetu AI — FastAPI Backend
Offline Neural Education Ecosystem AI Engine
All processing runs locally via Ollama, Whisper, Piper, PaddleOCR, ChromaDB
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os, logging, json, re, asyncio

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("gyaansetu")

# ── delayed imports so startup is fast ──────────────────────────────────────
from routers import tutor, ocr, rag, career, interview, health, mistakes, projects, quiz
from db.database import init_db, current_user_id


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 GyaanSetu AI Backend starting up…")
    init_db()
    logger.info("✅ SQLite schema initialised")
    yield
    logger.info("👋 GyaanSetu AI Backend shutting down")


app = FastAPI(
    title="GyaanSetu AI Backend",
    description="Offline Neural Education Ecosystem — Llama · Whisper · Piper · PaddleOCR · ChromaDB",
    version="2.0.0",
    lifespan=lifespan,
)


# ── HTTP Middleware for Multi-Database Context Isolation ────────────────────
@app.middleware("http")
async def db_context_middleware(request: Request, call_next):
    user_id = "default"

    # 1. Check Query parameters
    if "user_id" in request.query_params:
        user_id = request.query_params["user_id"]
    elif "userId" in request.query_params:
        user_id = request.query_params["userId"]
    
    # 2. Check Path parameters
    else:
        path = request.url.path
        # E.g. /health/history/aarav or /interview/history/aarav
        match = re.search(r'/(?:history|index|heatmap|stats|report)/([^/]+)', path)
        if match:
            user_id = match.group(1)

    # 3. Check JSON request payload (without consuming stream)
    if user_id == "default" and request.method in ("POST", "PUT", "PATCH") and not request.url.path.endswith("/tutor/chat"):
        try:
            body = await request.body()
            if body:
                try:
                    data = json.loads(body)
                    if isinstance(data, dict):
                        user_id = data.get("user_id") or data.get("userId") or "default"
                except Exception:
                    pass
            # Recreate request stream
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            request._receive = receive
        except Exception:
            pass

    # Sanitize user_id
    safe_user_id = "".join(c for c in user_id if c.isalnum() or c in "-_").strip()
    if not safe_user_id:
        safe_user_id = "default"

    token = current_user_id.set(safe_user_id)
    try:
        response = await call_next(request)
        return response
    finally:
        current_user_id.reset(token)


# ── Long-timeout middleware for local Ollama complete() calls ─────────────────
# The SSE streaming /tutor/chat handles its own lifecycle.
# All blocking complete() calls (quiz, career, feynman, mistakes, etc.) need up to 5 min.
@app.middleware("http")
async def long_timeout_middleware(request: Request, call_next):
    # Streaming SSE endpoint — do not wrap in a timeout
    if request.url.path in ("/tutor/chat", "/tutor/voice"):
        return await call_next(request)
    try:
        return await asyncio.wait_for(call_next(request), timeout=300.0)
    except asyncio.TimeoutError:
        logger.warning(f"Request timed out after 300s: {request.url.path}")
        return Response(
            content='{"detail": "Request timed out — the local AI model is still loading. Please retry."}',
            status_code=504,
            media_type="application/json",
        )

# ── CORS: allow all local React frontends ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5180",
        "http://127.0.0.1:5180",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static audio output folder (Piper TTS) ───────────────────────────────────
os.makedirs("audio_out", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_out"), name="audio")

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(tutor.router,     prefix="/tutor",     tags=["AI Tutor"])
app.include_router(ocr.router,       prefix="/ocr",       tags=["OCR"])
app.include_router(rag.router,       prefix="/rag",       tags=["RAG Engine"])
app.include_router(career.router,    prefix="/career",    tags=["Career"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(health.router,    prefix="/health",    tags=["Health Monitor"])
app.include_router(mistakes.router,  prefix="/mistakes",  tags=["Mistake Analyzer"])
app.include_router(projects.router,  prefix="/projects",  tags=["Project Helper"])
app.include_router(quiz.router,      prefix="/quiz",      tags=["Quiz Generator"])


# ── Root & health-check ───────────────────────────────────────────────────────
@app.get("/", tags=["System"])
async def root():
    return {
        "name": "GyaanSetu AI Backend",
        "status": "online",
        "version": "2.0.0",
        "models": ["llama3.1:8b", "deepseek-r1", "phi3", "gemma3"],
        "engines": ["Ollama", "Faster-Whisper", "Piper TTS", "PaddleOCR", "ChromaDB"],
    }


@app.get("/health", tags=["System"])
async def health_endpoint():
    from services import ollama_service
    ollama_ok = await ollama_service.check_ollama_health()
    return {
        "status": "online",
        "version": "2.0.0",
        "ollama_connected": ollama_ok,
    }


@app.get("/ping", tags=["System"])
async def ping():
    return {"pong": True}


@app.post("/track", tags=["System"])
async def track():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
