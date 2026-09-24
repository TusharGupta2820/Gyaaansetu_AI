"""
GyaanSetu AI — Faster Whisper Speech-to-Text Service
Transcribes audio files or buffers offline using Faster Whisper.
Model is loaded once at startup for speed.

FIX: Browser MediaRecorder sends audio/webm;codecs=opus — we must save
     with the correct extension so Whisper/ffmpeg can decode it properly.
"""

import os, tempfile, logging, subprocess, shutil
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("gyaansetu.whisper")

WHISPER_MODEL  = os.getenv("WHISPER_MODEL",  "base")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")

_model = None  # Lazy-loaded on first use


def _get_model():
    global _model
    if _model is None:
        try:
            from faster_whisper import WhisperModel
            logger.info(f"Loading Whisper model '{WHISPER_MODEL}' on {WHISPER_DEVICE}…")
            _model = WhisperModel(
                WHISPER_MODEL,
                device=WHISPER_DEVICE,
                compute_type="int8" if WHISPER_DEVICE == "cpu" else "float16",
            )
            logger.info("✅ Whisper model loaded")
        except ImportError:
            logger.error("faster-whisper not installed. Run: pip install faster-whisper")
            return None
        except Exception as e:
            logger.error(f"Failed to load Whisper: {e}")
            return None
    return _model


def _detect_audio_format(audio_bytes: bytes) -> str:
    """
    Detect the real audio format from magic bytes.
    Browser MediaRecorder typically sends webm (starts with 0x1A 0x45 0xDF 0xA3).
    """
    if len(audio_bytes) < 4:
        return ".wav"
    magic = audio_bytes[:4]
    # WebM / Matroska magic bytes
    if magic[:3] == b'\x1a\x45\xdf':
        return ".webm"
    # RIFF / WAV
    if magic == b'RIFF':
        return ".wav"
    # OGG
    if magic == b'OggS':
        return ".ogg"
    # MP4 / M4A (ftyp box at offset 4)
    if len(audio_bytes) >= 8 and audio_bytes[4:8] in (b'ftyp', b'moov'):
        return ".mp4"
    # FLAC
    if magic == b'fLaC':
        return ".flac"
    # MP3 (ID3 tag or sync frame)
    if magic[:2] in (b'ID', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
        return ".mp3"
    # Default to webm (most likely from browser)
    return ".webm"


def _convert_to_wav(input_path: str) -> str | None:
    """
    Use ffmpeg to convert any audio format to WAV (16kHz mono) for Whisper.
    Returns path to converted file, or None if ffmpeg not available.
    """
    if not shutil.which("ffmpeg"):
        logger.warning("ffmpeg not found — skipping conversion, Whisper will try to read as-is")
        return None

    out_path = input_path + "_converted.wav"
    try:
        result = subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", input_path,
                "-ar", "16000",   # 16kHz sample rate (optimal for Whisper)
                "-ac", "1",       # Mono
                "-f", "wav",
                out_path,
            ],
            capture_output=True,
            timeout=30,
        )
        if result.returncode == 0 and Path(out_path).exists():
            logger.info(f"ffmpeg converted {input_path} → {out_path}")
            return out_path
        else:
            logger.error(f"ffmpeg conversion failed: {result.stderr.decode()[:200]}")
            return None
    except Exception as e:
        logger.error(f"ffmpeg error: {e}")
        return None


async def transcribe_bytes(audio_bytes: bytes, language: str = "en") -> dict:
    """
    Transcribe raw audio bytes (any format: webm, wav, ogg, mp4, etc.)
    Returns: {"text": str, "language": str, "confidence": float}
    """
    model = _get_model()
    if model is None:
        return {"text": "", "language": language, "confidence": 0.0, "error": "Whisper unavailable"}

    if len(audio_bytes) < 500:
        logger.warning(f"Audio too small: {len(audio_bytes)} bytes — likely empty recording")
        return {"text": "", "language": language, "confidence": 0.0, "error": "Audio too short"}

    # Detect real format and save with correct extension
    ext = _detect_audio_format(audio_bytes)
    logger.info(f"Detected audio format: {ext}, size: {len(audio_bytes)} bytes")

    tmp_path = None
    converted_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Try to convert to WAV via ffmpeg for best Whisper compatibility
        transcribe_path = tmp_path
        if ext != ".wav":
            converted = _convert_to_wav(tmp_path)
            if converted:
                converted_path = converted
                transcribe_path = converted_path

        lang_code = _language_to_code(language)
        logger.info(f"Transcribing {transcribe_path} as lang={lang_code} (task=transcribe)")

        segments, info = model.transcribe(
            transcribe_path,
            language=lang_code if lang_code != "auto" else None,
            task="transcribe",      # CRITICAL: keep original language, never translate to English
            beam_size=5,           # Higher beam = better accuracy for Indic languages
            vad_filter=False,      # Disable VAD — it was filtering real speech
            word_timestamps=False,
            condition_on_previous_text=False,  # Prevents hallucination loops
            temperature=0.0,       # Deterministic output
        )

        text_parts = [seg.text for seg in segments]
        full_text = " ".join(text_parts).strip()

        logger.info(f"Transcription result: '{full_text[:100]}' (lang={info.language}, prob={info.language_probability:.2f})")

        return {
            "text": full_text,
            "language": info.language,
            "confidence": round(info.language_probability, 3),
        }
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return {"text": "", "language": language, "confidence": 0.0, "error": str(e)}
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)
        if converted_path:
            Path(converted_path).unlink(missing_ok=True)


async def transcribe_file(file_path: str, language: str = "en") -> dict:
    """Transcribe an audio file by path."""
    with open(file_path, "rb") as f:
        audio_bytes = f.read()
    return await transcribe_bytes(audio_bytes, language)


def _language_to_code(language: str) -> str:
    """Map language name / ISO code to Whisper-compatible ISO 639-1 code."""
    mapping = {
        # Full names (from frontend dropdown)
        "English": "en",
        "Hindi": "hi",
        "Marathi": "mr",
        "Tamil": "ta",
        "Telugu": "te",
        "Bengali": "bn",
        "Gujarati": "gu",
        "Kannada": "kn",
        "Malayalam": "ml",
        "Punjabi": "pa",
        "Urdu": "ur",
        # ISO codes (passthrough)
        "en": "en", "hi": "hi", "mr": "mr", "ta": "ta",
        "te": "te", "bn": "bn", "gu": "gu", "kn": "kn",
        "ml": "ml", "pa": "pa", "ur": "ur",
    }
    code = mapping.get(language) or mapping.get(language.capitalize())
    if code:
        logger.info(f"Language mapped: '{language}' → '{code}'")
        return code
    logger.warning(f"Unknown language '{language}' — using auto-detect")
    return "auto"
