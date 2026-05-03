# Remote Provider Deployment

GemCouncil keeps model runtimes outside the web app. Vercel hosts the frontend and lightweight API proxies; GPU-backed services host Gemma and VoxCPM.

```text
Browser
  -> Vercel / Next.js
    -> /api/speech/understand
      -> Gemma Speech Service on GPU
    -> /api/speech/synthesize
      -> VoxCPM TTS Service on GPU
```

## Provider rules

- Do not expose provider API keys with `NEXT_PUBLIC_`.
- Browser code calls only same-origin Next.js API routes.
- Next.js API routes add server-side `Authorization: Bearer ...` headers.
- Every remote provider needs a health endpoint, timeout, and mock fallback.
- Vercel does not load Gemma or VoxCPM weights.

## Gemma speech understanding

Frontend mode:

```bash
NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER=gemma
GEMMA_SPEECH_API_URL=https://your-gemma-space.hf.space
GEMMA_SPEECH_API_KEY=replace-with-a-shared-secret
GEMMA_SPEECH_TIMEOUT_MS=45000
```

Remote service secrets:

```bash
HF_TOKEN=your_huggingface_token_with_gemma_access
GEMMA_SPEECH_MOCK=0
GEMMA_MODEL_ID=google/gemma-3n-E2B-it
GEMMA_DEVICE=cuda
GEMMA_SPEECH_API_KEY=replace-with-a-shared-secret
```

Health check from the web app:

```bash
curl https://your-vercel-app.vercel.app/api/speech/understand
```

## VoxCPM TTS

VoxCPM should follow the same pattern in a later change:

```bash
NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER=voxcpm
VOXCPM_TTS_API_URL=https://your-voxcpm-space.hf.space
VOXCPM_TTS_API_KEY=replace-with-a-shared-secret
VOXCPM_TTS_TIMEOUT_MS=60000
```

For the hackathon, prefer one service per model. Gemma and VoxCPM have different dependencies, memory profiles, cold starts, and failure modes.

## Deployment target choice

Hugging Face Spaces GPU is the default demo target because it is easy to share and close to the model ecosystem. If cold starts, queues, or GPU availability threaten the demo, move the service to RunPod or Modal without changing the frontend provider contract.
