"""
Oolel-Voices sidecar: Wolof text-to-speech for Tekki Voice.

Runs Soynade Research's Oolel-Voices model (AGPL-3.0) locally on the GPU and
exposes it over HTTP to Tekki's backend:

  GET  /health          -> {"ready": bool, "device": "cuda" | "cpu"}
  POST /tts {"text"}    -> audio/wav (16-bit PCM, mono)

Only localhost is served: the model never receives anything but the answer
text that Tekki wants read aloud.
"""

import io
import json
import os
import re
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(HERE / ".cache" / "huggingface"))

import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from huggingface_hub import snapshot_download  # noqa: E402
from num2words import num2words  # noqa: E402
from transformers import AutoModel  # noqa: E402

HOST = os.environ.get("OOLEL_HOST", "127.0.0.1")
PORT = int(os.environ.get("OOLEL_PORT", "8010"))
MODEL_ID = os.environ.get("OOLEL_MODEL", "soynade-research/Oolel-Voices")
# Reference voice the model imitates. Default: the voice of Soynade's demo.
VOICE_URL = (
    "https://huggingface.co/spaces/soynade-research/Oolel-Voices-Demo"
    "/resolve/main/8_1_c.wav"
)
VOICE_PATH = Path(os.environ.get("OOLEL_VOICE", HERE / ".cache" / "voice.wav"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# Settings of Soynade's demo: calm delivery, stable pronunciation.
GENERATE = {"exaggeration": 0.3, "temperature": 0.2, "cfg_weight": 0.5}
# Audio decoder steps (model default 10). 5 saves ~0.7 s per sentence on an
# RTX 3060; the token loop (~75 % of the time) is unaffected by any setting.
S3GEN_STEPS = int(os.environ.get("OOLEL_S3GEN_STEPS", "10"))

# TF32 matmuls on Ampere+ GPUs: faster audio decoding, same voice.
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

MODEL = None
LOCK = threading.Lock()  # one generation at a time on the GPU


def log(message: str) -> None:
    print(f"[oolel] {message}", flush=True)


def load() -> None:
    global MODEL
    if not VOICE_PATH.exists():
        VOICE_PATH.parent.mkdir(parents=True, exist_ok=True)
        log("downloading reference voice")
        urllib.request.urlretrieve(VOICE_URL, VOICE_PATH)
    started = time.time()
    path = snapshot_download(repo_id=MODEL_ID)
    model = AutoModel.from_pretrained(path, trust_remote_code=True).to(DEVICE)
    # Analyse the reference voice once, not on every sentence.
    model.prepare_conditionals(str(VOICE_PATH), exaggeration=GENERATE["exaggeration"])
    if S3GEN_STEPS != 10:
        decode = model.s3gen.inference
        model.s3gen.inference = lambda *a, **k: decode(*a, **k, n_cfm_timesteps=S3GEN_STEPS)
    log(f"model loaded on {DEVICE} in {time.time() - started:.0f}s")
    synthesize(model, "Na nga def.")  # warm-up: first CUDA call is slow
    MODEL = model  # /health reports ready only once warmed up
    log("ready")


def speakable(text: str) -> str:
    """Numbers and symbols as words, the way the demo prepares its input."""
    text = text.replace("%", " pour cent").replace("FCFA", "francs CFA")
    text = re.sub(r"(?<=\d)[\s  ](?=\d{3}\b)", "", text)  # 21 500

    def words(match: re.Match) -> str:
        raw = match.group().replace(",", ".")
        try:
            number = float(raw) if "." in raw else int(raw)
            return num2words(number, lang="fr")
        except (ValueError, NotImplementedError):
            return match.group()

    return re.sub(r"\d+(?:[.,]\d+)?", words, text)


def max_tokens(text: str) -> int:
    """~25 speech tokens per second, ~12 characters per second of speech:
    a generous cap that stops a run that never emits its end token."""
    return min(1024, 80 + len(text) * 3)


def synthesize(model, text: str) -> bytes:
    """Tekki sends a sentence or two at a time (the app splits answers)."""
    spoken = speakable(text)[:500]
    with LOCK, torch.inference_mode():
        wav = model.generate(spoken, max_new_tokens=max_tokens(spoken), **GENERATE)
    buffer = io.BytesIO()
    sf.write(buffer, wav.squeeze(0).float().cpu().numpy(), model.sr, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, payload: dict) -> None:
        self._send(status, json.dumps(payload).encode(), "application/json")

    def do_GET(self) -> None:
        if self.path == "/health":
            return self._json(200, {"ready": MODEL is not None, "device": DEVICE})
        self._json(404, {"error": "not found"})

    def do_POST(self) -> None:
        if self.path != "/tts":
            return self._json(404, {"error": "not found"})
        if MODEL is None:
            return self._json(503, {"error": "model loading"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            text = str(json.loads(self.rfile.read(length) or b"{}").get("text", ""))
        except (ValueError, json.JSONDecodeError):
            return self._json(400, {"error": "invalid JSON"})
        if not text.strip():
            return self._json(400, {"error": "empty text"})
        started = time.time()
        try:
            audio = synthesize(MODEL, text)
        except Exception as error:  # surface the cause to Tekki's logs
            log(f"generation failed: {error!r}")
            return self._json(500, {"error": str(error)})
        log(f"{len(text)} chars in {time.time() - started:.1f}s")
        self._send(200, audio, "audio/wav")

    def log_message(self, *_args) -> None:  # keep stdout for our own logs
        pass


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    def load_or_exit() -> None:
        try:
            load()
        except Exception as error:  # a sidecar stuck "loading" helps no one
            log(f"model failed to load: {error!r}")
            os._exit(1)

    threading.Thread(target=load_or_exit, daemon=True).start()
    log(f"listening on http://{HOST}:{PORT} (model loading…)")
    server.serve_forever()
