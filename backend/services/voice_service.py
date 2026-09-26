import os
import hashlib
from config import ELEVENLABS_API_KEY, AUDIO_DIR

def generate_voice_narration(text: str) -> dict:
    """
    Generates a natural, human-sounding voice explanation using ElevenLabs API.
    Caches audio to disk so subsequent requests are instant.
    """
    if not text:
        text = "An AVL tree maintains height balance within one unit difference to guarantee logarithmic search time."
    
    # Generate unique hash for cache
    hash_id = hashlib.md5(text.encode('utf-8')).hexdigest()[:12]
    filename = f"concept_{hash_id}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    if os.path.exists(filepath):
        return {
            "status": "cached",
            "audio_url": f"/static/audio/{filename}",
            "text": text
        }

    if not ELEVENLABS_API_KEY:
        return {
            "status": "demo_fallback",
            "audio_url": None,
            "text": text,
            "note": "Using browser Web Speech synthesis API as offline fallback."
        }

    try:
        from elevenlabs.client import ElevenLabs
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        audio = client.generate(
            text=text,
            voice="Rachel",
            model="eleven_turbo_v2_5"
        )
        with open(filepath, "wb") as f:
            for chunk in audio:
                f.write(chunk)
        return {
            "status": "success",
            "audio_url": f"/static/audio/{filename}",
            "text": text
        }
    except Exception as e:
        print(f"ElevenLabs generation error: {e}")
        return {
            "status": "error_fallback",
            "audio_url": None,
            "text": text,
            "error": str(e)
        }
