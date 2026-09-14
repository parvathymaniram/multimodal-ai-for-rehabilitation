"""
wav2lip_route.py — Flask blueprint for lip-sync avatar generation
"""
from flask import Blueprint, request, jsonify, send_file
import subprocess, os, uuid, traceback

wav2lip_bp = Blueprint("wav2lip", __name__)

BASE_FOLDER = r"C:\Users\hp\OneDrive\Desktop\CopyBE - Copy - 333\ai-agent\backend\Wav2Lip"

WAV2LIP_PYTHON   = os.path.join(BASE_FOLDER, "wav2lip_venv", "Scripts", "python.exe")
INFERENCE_SCRIPT = os.path.join(BASE_FOLDER, "inference.py")
CHECKPOINT       = os.path.join(BASE_FOLDER, "checkpoints", "wav2lip_gan.pth")
FACE_IMAGE       = os.path.join(BASE_FOLDER, "myphoto_new.jpeg")
FFMPEG = r"C:\Users\hp\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"

# Short path — no spaces — avoids ffmpeg permission errors
TEMP_DIR    = r"C:\wav2lip_temp"
RESULTS_DIR = os.path.join(BASE_FOLDER, "results")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

print("=== Avatar Route Ready ===")
print(f"Python     : {os.path.exists(WAV2LIP_PYTHON)}")
print(f"Checkpoint : {os.path.exists(CHECKPOINT)}")
print(f"Face image : {os.path.exists(FACE_IMAGE)}")
print(f"FFmpeg     : {os.path.exists(FFMPEG)}")
print("==========================")


@wav2lip_bp.route("/wav2lip", methods=["POST"])
def wav2lip():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files["audio"]
    job_id = str(uuid.uuid4())[:8]

    input_mp3  = os.path.join(TEMP_DIR, f"in_{job_id}.mp3")
    input_wav  = os.path.join(TEMP_DIR, f"in_{job_id}.wav")
    output_mp4 = os.path.join(RESULTS_DIR, f"r_{job_id}.mp4")

    try:
        audio_file.save(input_mp3)

        # Convert to WAV
        conv_cmd = '"{}" -y -i "{}" -ar 16000 -ac 1 "{}"'.format(FFMPEG, input_mp3, input_wav)
        conv = subprocess.run(conv_cmd, shell=True, capture_output=True, text=True, timeout=30)
        if conv.returncode != 0 or not os.path.exists(input_wav):
            return jsonify({"error": "Audio conversion failed", "detail": conv.stderr[-200:]}), 500

        # Run inference — resize_factor 2 = ~2x faster, still good quality
        cmd = [
            WAV2LIP_PYTHON,
            INFERENCE_SCRIPT,
            "--checkpoint_path", CHECKPOINT,
            "--face", FACE_IMAGE,
            "--audio", input_wav,
            "--outfile", output_mp4,
            "--resize_factor", "2",      # faster than 1, still looks good
            "--wav2lip_batch_size", "8", # larger batch = faster processing
            "--static", "True",
            "--pads", "0", "20", "0", "0",
            "--nosmooth",
        ]

        print(f"Avatar job {job_id} started...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300, cwd=BASE_FOLDER)
        print("STDOUT:", result.stdout[-400:])

        if not os.path.exists(output_mp4) or os.path.getsize(output_mp4) < 1000:
            return jsonify({
                "error": "Avatar generation failed",
                "detail": result.stdout[-300:] + result.stderr[-300:]
            }), 500

        print(f"Avatar job {job_id} done: {os.path.getsize(output_mp4)} bytes")

        return send_file(output_mp4, mimetype="video/mp4", as_attachment=False,
                         download_name=f"avatar_{job_id}.mp4")

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Avatar generation timed out"}), 500
    except Exception as e:
        print("Error:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
    finally:
        for f in [input_mp3, input_wav]:
            try:
                if os.path.exists(f): os.remove(f)
            except: pass