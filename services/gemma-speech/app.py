from __future__ import annotations

import json
import os
import tempfile
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel, Field


MAX_AUDIO_SECONDS = 30.0
DEFAULT_MODEL_ID = "google/gemma-3n-E2B-it"

app = FastAPI(title="GemCouncil Gemma Speech Service")


class SpeechUnderstandingResponse(BaseModel):
    transcript: str = Field(min_length=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    language: str | None = None
    notes: list[str] = Field(default_factory=list)


@app.get("/health")
def health(_: None = Depends(require_api_key)) -> dict[str, Any]:
    return {
        "ok": True,
        "model_id": os.getenv("GEMMA_MODEL_ID", DEFAULT_MODEL_ID),
        "mock": use_mock_mode(),
    }


@app.post("/speech/understand")
async def understand_speech(
    _: None = Depends(require_api_key),
    audio: UploadFile = File(...),
    durationMs: str = Form("0"),
    mimeType: str = Form("audio/webm"),
    session: str = Form("{}"),
) -> SpeechUnderstandingResponse:
    duration_seconds = parse_duration_seconds(durationMs)
    if duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="durationMs must be positive.")
    if duration_seconds > MAX_AUDIO_SECONDS:
        raise HTTPException(status_code=413, detail="Gemma speech chunks must be 30 seconds or shorter.")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    session_context = parse_json_object(session)

    if use_mock_mode():
        return SpeechUnderstandingResponse(
            transcript=f"Mock Gemma transcript for {round(duration_seconds, 2)} seconds of {mimeType} audio.",
            confidence=1.0,
            language="en",
            notes=["mock"],
        )

    suffix = suffix_for_mime_type(mimeType)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as handle:
        handle.write(audio_bytes)
        audio_path = Path(handle.name)

    try:
        return get_gemma_engine().understand(audio_path, session_context)
    finally:
        audio_path.unlink(missing_ok=True)


def require_api_key(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("GEMMA_SPEECH_API_KEY")
    if not expected:
        return

    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")


class GemmaSpeechEngine:
    def __init__(self) -> None:
        import torch
        from transformers import AutoProcessor, Gemma3nForConditionalGeneration

        self.torch = torch
        self.model_id = os.getenv("GEMMA_MODEL_ID", DEFAULT_MODEL_ID)
        self.device = os.getenv("GEMMA_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
        dtype_name = os.getenv("GEMMA_TORCH_DTYPE", "bfloat16")
        dtype = torch.bfloat16 if dtype_name == "bfloat16" and self.device != "cpu" else torch.float32

        self.processor = AutoProcessor.from_pretrained(self.model_id)
        self.model = Gemma3nForConditionalGeneration.from_pretrained(
            self.model_id,
            device_map="auto" if self.device == "cuda" else None,
            torch_dtype=dtype,
        ).eval()
        if self.device != "cuda":
            self.model.to(self.device)

    def understand(self, audio_path: Path, session_context: dict[str, Any]) -> SpeechUnderstandingResponse:
        prompt = speech_prompt(session_context)
        messages = [
            {
                "role": "system",
                "content": [{"type": "text", "text": "You transcribe and lightly normalize spoken English interview answers."}],
            },
            {
                "role": "user",
                "content": [
                    {"type": "audio", "audio": str(audio_path)},
                    {"type": "text", "text": prompt},
                ],
            },
        ]

        inputs = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        )
        inputs = inputs.to(self.model.device)
        input_len = inputs["input_ids"].shape[-1]

        with self.torch.inference_mode():
            generated = self.model.generate(
                **inputs,
                max_new_tokens=int(os.getenv("GEMMA_MAX_NEW_TOKENS", "220")),
                do_sample=False,
            )
            generated = generated[0][input_len:]

        decoded = self.processor.decode(generated, skip_special_tokens=True).strip()
        transcript = extract_transcript(decoded)
        if not transcript:
            raise HTTPException(status_code=502, detail="Gemma returned an empty transcript.")

        return SpeechUnderstandingResponse(
            transcript=transcript,
            confidence=None,
            language="en",
            notes=["gemma-3n"],
        )


@lru_cache(maxsize=1)
def get_gemma_engine() -> GemmaSpeechEngine:
    return GemmaSpeechEngine()


def use_mock_mode() -> bool:
    return os.getenv("GEMMA_SPEECH_MOCK", "1") != "0"


def parse_duration_seconds(duration_ms: str) -> float:
    try:
        return float(duration_ms) / 1000.0
    except ValueError as error:
        raise HTTPException(status_code=400, detail="durationMs must be numeric.") from error


def parse_json_object(value: str) -> dict[str, Any]:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def suffix_for_mime_type(mime_type: str) -> str:
    if "wav" in mime_type:
        return ".wav"
    if "mp4" in mime_type:
        return ".m4a"
    if "mpeg" in mime_type:
        return ".mp3"
    return ".webm"


def speech_prompt(session_context: dict[str, Any]) -> str:
    setup = session_context.get("setup", {})
    recent_turns = session_context.get("recentTurns", [])
    goal = setup.get("goal", "General English interview") if isinstance(setup, dict) else "General English interview"
    recent_text = ""
    if isinstance(recent_turns, list):
        recent_text = "\n".join(
            f"{turn.get('speakerRole', 'speaker')}: {turn.get('text', '')}"
            for turn in recent_turns[-4:]
            if isinstance(turn, dict)
        )

    return (
        "Transcribe the candidate's spoken answer for an English interview practice app.\n"
        "Return only the transcript text, with light punctuation. Do not answer the interview question.\n"
        f"Interview goal: {goal}\n"
        f"Recent context:\n{recent_text}"
    )


def extract_transcript(decoded: str) -> str:
    if decoded.startswith("{"):
        try:
            parsed = json.loads(decoded)
            transcript = parsed.get("transcript")
            if isinstance(transcript, str):
                return transcript.strip()
        except json.JSONDecodeError:
            pass
    return decoded.strip().strip('"')
