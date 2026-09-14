"""
tts_engine.py — Upgraded TTS using edge-tts (Microsoft Neural TTS)
Provides:
  - High-quality neural female voice (no API key needed)
  - Word-level timing metadata for accurate lip sync
  - MP3 output (smaller, faster to serve)
"""

import asyncio
import uuid
import os
import json
import edge_tts

AUDIO_DIR = "static/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Neural female voice — change to any edge-tts voice you prefer
# Full list: run `edge-tts --list-voices`
VOICE = "en-US-JennyNeural"


async def _synthesize(text: str, audio_path: str, timing_path: str):
    """Run edge-tts synthesis and collect word timing."""
    communicate = edge_tts.Communicate(text, VOICE)
    word_timings = []

    with open(audio_path, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                word_timings.append({
                    "word": chunk["text"],
                    # offset is in 100-nanosecond units → convert to seconds
                    "start": chunk["offset"] / 10_000_000,
                    "duration": chunk["duration"] / 10_000_000,
                })

    with open(timing_path, "w") as f:
        json.dump(word_timings, f)


def text_to_speech(text: str) -> dict:
    """
    Synthesize text and return paths to audio and timing data.
    Returns:
        {
          "audio": "/static/audio/<id>.mp3",
          "timing": "/static/audio/<id>.json"
        }
    """
    uid = uuid.uuid4().hex
    audio_path = os.path.join(AUDIO_DIR, f"{uid}.mp3")
    timing_path = os.path.join(AUDIO_DIR, f"{uid}.json")

    try:
        asyncio.run(_synthesize(text, audio_path, timing_path))
        return {
            "audio": f"/static/audio/{uid}.mp3",
            "timing": f"/static/audio/{uid}.json",
        }
    except Exception as e:
        print(f"TTS Error: {e}")
        return {"audio": None, "timing": None, "error": str(e)}