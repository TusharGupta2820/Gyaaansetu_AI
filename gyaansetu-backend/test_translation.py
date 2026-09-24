import sys, os, asyncio
sys.path.insert(0, "d:/Gyaansetu-AI/gyaansetu-backend")
os.chdir("d:/Gyaansetu-AI/gyaansetu-backend")

from services import ollama_service

async def test_llm_translation():
    sample_speech = "Hello my name is Dushar Gupta"
    print("=" * 60)
    print("TESTING TUTOR LLM TRANSLATION")
    print(f"Original speech text: '{sample_speech}'")
    print("Target language: Hindi")
    print("=" * 60)

    prompt = (
        f"You are an expert educational translator.\n"
        f"Translate the following transcribed text into Hindi.\n\n"
        f"CRITICAL REQUIREMENTS:\n"
        f"1. Output MUST be exclusively in native Hindi script (Devanagari script).\n"
        f"2. Translate accurately and preserve names/places phonetically.\n"
        f"3. Return ONLY the translated text without quotes, introductory text, markdown headers, or explanations.\n\n"
        f"TEXT TO TRANSLATE:\n{sample_speech}"
    )

    result = await ollama_service.complete(
        prompt=prompt,
        task="tutor",  # Doubt solver model
        mode="Quick Assist",
        language="Hindi",
        user_id="system"
    )

    clean_res = result.strip().strip('"').strip("'")
    print("\nRESULT FROM TUTOR LLM:")
    print(clean_res.encode('utf-8'))
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_llm_translation())
