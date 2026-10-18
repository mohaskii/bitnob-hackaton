# Oolel-Voices (Wolof TTS) on the GPU. The model (~8 GB) is downloaded on
# first start into the `oolel-cache` volume, then reused.
FROM pytorch/pytorch:2.8.0-cuda12.8-cudnn9-runtime
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir torchaudio==2.8.0 \
    --index-url https://download.pytorch.org/whl/cu128 \
  && pip install --no-cache-dir -r requirements.txt

COPY server.py .

ENV HF_HOME=/cache/huggingface
ENV OOLEL_VOICE=/cache/voice.wav
ENV OOLEL_HOST=0.0.0.0
ENV OOLEL_PORT=8010
EXPOSE 8010
CMD ["python", "server.py"]
