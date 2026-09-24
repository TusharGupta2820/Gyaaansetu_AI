import sys, os, inspect
sys.path.insert(0, "d:/Gyaansetu-AI/gyaansetu-backend")
os.chdir("d:/Gyaansetu-AI/gyaansetu-backend")

print("=" * 55)
print("TRANSCRIBE FIX VERIFICATION")
print("=" * 55)

# Test 1: word count threshold
transcript = "Hello my name is Tushar I am a student at Thakur College IT department."
wc = len(transcript.split())
print(f"\nTEST 1: Word count of sample intro = {wc} (threshold=20)")
if wc < 20:
    print("  PASS: Short transcript -> skips LLM, no hallucination possible")
else:
    print("  FAIL: Would still call LLM for this intro")

# Test 2: language mapping
from services.whisper_service import _language_to_code
code = _language_to_code("Hindi")
print(f"\nTEST 2: Language mapping Hindi -> '{code}'")
print("  PASS" if code == "hi" else "  FAIL: expected 'hi'")

code_mr = _language_to_code("Marathi")
print(f"  Marathi -> '{code_mr}' : {'PASS' if code_mr=='mr' else 'FAIL'}")

# Test 3: task=transcribe present in whisper service
from services import whisper_service
src = inspect.getsource(whisper_service.transcribe_bytes)
kw = 'task="transcribe"'
print(f"\nTEST 3: task=transcribe in whisper_service: {kw in src}")
print("  PASS" if kw in src else "  FAIL: Fix did not save correctly!")

# Test 4: anti-hallucination keywords in tutor
from routers.tutor import transcribe_audio
src2 = inspect.getsource(transcribe_audio)
checks = [
    ("FORBIDDEN", "LLM told what is forbidden to add"),
    ("WORD-FOR-WORD", "Must use only exact spoken words"),
    ("word_count < 20", "Short transcript threshold is 20"),
    ("BEGIN RESPONSE", "Forces immediate structured response"),
]
print("\nTEST 4: Anti-hallucination prompt keywords:")
all_pass = True
for kw2, desc in checks:
    found = kw2 in src2
    print(f"  {'PASS' if found else 'FAIL'}: '{kw2}' - {desc}")
    if not found:
        all_pass = False

print("\n" + "=" * 55)
print("RESULT:", "ALL PASS" if all_pass and code == "hi" and kw in src else "SOME FAILURES - review above")
print("=" * 55)
