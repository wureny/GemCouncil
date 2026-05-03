# Gemma Speech Service

FastAPI service for GemCouncil speech understanding. It accepts one model-safe audio chunk and returns a transcript for the Interview Room.

## Local setup

```bash
cd services/gemma-speech
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

By default, the service runs in mock mode so the HTTP integration can be tested without downloading Gemma:

```bash
curl http://127.0.0.1:8000/health
```

## Real Gemma mode

Before using the model, accept the Gemma license for `google/gemma-3n-E2B-it` on Hugging Face and make sure the runtime has access to your Hugging Face token.

```bash
export GEMMA_SPEECH_MOCK=0
export GEMMA_MODEL_ID=google/gemma-3n-E2B-it
export GEMMA_DEVICE=cuda
uvicorn app:app --host 0.0.0.0 --port 8000
```

Gemma 3n supports text, audio, image, and video inputs and produces text output. This service uses it only for short audio-to-text interview answers. Each `/speech/understand` request rejects audio chunks longer than 30 seconds; the Next.js app is responsible for chunking longer user answers before calling the provider.

## Frontend wiring

Set these environment variables in the Next.js app:

```bash
NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER=gemma
GEMMA_SPEECH_API_URL=http://127.0.0.1:8000
```

If `NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER` is omitted or set to `mock`, the app keeps using deterministic mock speech understanding.
