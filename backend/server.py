"""
server.py — Flask backend for Post-Op Knee Rehabilitation Assistant
"""
from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from llm_engine import generate_llm_response
from tts_engine import text_to_speech
from wav2lip_route import wav2lip_bp
import os

app = Flask(__name__)

# Allow ALL origins for all routes (needed for Web Audio API crossOrigin="anonymous")
CORS(app, resources={r"/*": {"origins": "*"}})

# Register Wav2Lip blueprint
app.register_blueprint(wav2lip_bp)

# ── Serve static audio files WITH explicit CORS headers ──────────────────────
@app.route("/static/audio/<filename>")
def serve_audio(filename):
    response = make_response(send_from_directory("static/audio", filename))
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route("/")
def home():
    return "KneeAssist Backend Running (edge-tts + Groq + Wav2Lip)"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    # Accept EITHER payload format:
    # Format A (React frontend): { "messages": [ { "role": "user", "content": "..." } ] }
    # Format B (simple):         { "message": "plain string" }
    user_text = ""
    if "messages" in data:
        for msg in reversed(data["messages"]):
            if msg.get("role") == "user":
                user_text = msg.get("content", "").strip()
                break
    elif "message" in data:
        user_text = data["message"].strip()

    if not user_text:
        return jsonify({"error": "Empty message"}), 400

    # Generate AI response
    reply_text = generate_llm_response(user_text)

    # Synthesize speech → returns { "audio": "/static/audio/xxx.mp3", "timing": "..." }
    tts_result = text_to_speech(reply_text)

    return jsonify({
        "text":   reply_text,
        "audio":  tts_result.get("audio"),
        "timing": tts_result.get("timing"),
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)