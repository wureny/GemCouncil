# VoxCPM TTS Service

FastAPI service for GemCouncil interviewer speech output. It accepts text and a voice profile, then returns base64-encoded WAV audio.

## Local mock mode

```bash
cd services/voxcpm-tts
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8010
```

Mock mode is enabled by default. It returns a short synthetic WAV tone so the frontend, proxy, playback state, auth, timeout, and health checks can be tested without GPU model loading.

## Real VoxCPM mode

Deploy this service on a remote GPU runtime. Hugging Face Spaces GPU is the default hackathon target; RunPod or Modal are good fallbacks if Spaces cold starts or queues become risky.

```bash
export VOXCPM_TTS_MOCK=0
export VOXCPM_MODEL_ID=openbmb/VoxCPM2
export VOXCPM_TTS_API_KEY=replace-with-a-shared-secret
uvicorn app:app --host 0.0.0.0 --port 8010
```

The service uses `VoxCPM.from_pretrained(...)` lazily, so startup remains cheap in mock mode and model loading happens only in real mode.

## Frontend wiring

Set these environment variables in the Next.js app:

```bash
NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER=voxcpm
VOXCPM_TTS_API_URL=https://your-voxcpm-service.example
VOXCPM_TTS_API_KEY=replace-with-a-shared-secret
VOXCPM_TTS_TIMEOUT_MS=60000
```

Do not expose `VOXCPM_TTS_API_KEY` with a `NEXT_PUBLIC_` prefix. The browser calls `/api/speech/synthesize`; the Next.js API route adds the server-side bearer token.
