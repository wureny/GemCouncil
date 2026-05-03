from __future__ import annotations

import base64
import io
import math
import os
import wave
from functools import lru_cache
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field


DEFAULT_MODEL_ID = "openbmb/VoxCPM2"
DEFAULT_SAMPLE_RATE = 48000

app = FastAPI(title="GemCouncil VoxCPM TTS Service")


class VoiceProfile(BaseModel):
    id: str = "interviewer-default"
    label: str = "Interviewer"
    speakingRate: float | None = None


class SpeechSynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1200)
    voice: VoiceProfile = Field(default_factory=VoiceProfile)


class SpeechSynthesisResponse(BaseModel):
    audioBase64: str = Field(min_length=1)
    mimeType: str = "audio/wav"
    durationMs: int | None = None
    notes: list[str] = Field(default_factory=list)


@app.get("/health")
def health(_: None = Depends(require_api_key)) -> dict[str, Any]:
    return {
        "ok": True,
        "model_id": os.getenv("VOXCPM_MODEL_ID", DEFAULT_MODEL_ID),
        "mock": use_mock_mode(),
    }


@app.post("/speech/synthesize")
def synthesize_speech(
    request: SpeechSynthesisRequest,
    _: None = Depends(require_api_key),
) -> SpeechSynthesisResponse:
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    if use_mock_mode():
        wav_bytes = mock_wav_bytes(duration_ms=max(800, min(4500, len(text) * 35)))
        return SpeechSynthesisResponse(
            audioBase64=base64.b64encode(wav_bytes).decode("ascii"),
            durationMs=wav_duration_ms(wav_bytes),
            notes=["mock"],
        )

    wav, sample_rate = get_voxcpm_engine().synthesize(text, request.voice)
    wav_bytes = wav_to_bytes(wav, sample_rate)

    return SpeechSynthesisResponse(
        audioBase64=base64.b64encode(wav_bytes).decode("ascii"),
        durationMs=wav_duration_ms(wav_bytes),
        notes=["voxcpm"],
    )


class VoxCpmEngine:
    def __init__(self) -> None:
        from voxcpm import VoxCPM

        self.model_id = os.getenv("VOXCPM_MODEL_ID", DEFAULT_MODEL_ID)
        self.model = VoxCPM.from_pretrained(
            self.model_id,
            load_denoiser=os.getenv("VOXCPM_LOAD_DENOISER", "0") == "1",
        )
        self.sample_rate = getattr(self.model.tts_model, "sample_rate", DEFAULT_SAMPLE_RATE)

    def synthesize(self, text: str, voice: VoiceProfile):
        control = voice_control_text(voice)
        target_text = f"({control}){text}" if control else text
        wav = self.model.generate(
            text=target_text,
            cfg_value=float(os.getenv("VOXCPM_CFG_VALUE", "2.0")),
            inference_timesteps=int(os.getenv("VOXCPM_INFERENCE_TIMESTEPS", "10")),
        )
        return wav, self.sample_rate


@lru_cache(maxsize=1)
def get_voxcpm_engine() -> VoxCpmEngine:
    return VoxCpmEngine()


def require_api_key(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("VOXCPM_TTS_API_KEY")
    if not expected:
        return

    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")


def use_mock_mode() -> bool:
    return os.getenv("VOXCPM_TTS_MOCK", "1") != "0"


def voice_control_text(voice: VoiceProfile) -> str:
    if voice.id == "interviewer-default":
        return "Professional English interviewer, clear, calm, slightly challenging, natural pace"
    return voice.label


def wav_to_bytes(samples: Any, sample_rate: int) -> bytes:
    import numpy as np
    import soundfile as sf

    buffer = io.BytesIO()
    sf.write(buffer, np.asarray(samples), sample_rate, format="WAV")
    return buffer.getvalue()


def mock_wav_bytes(duration_ms: int) -> bytes:
    sample_rate = 16000
    frame_count = int(sample_rate * duration_ms / 1000)
    amplitude = 1200
    frequency = 440

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for index in range(frame_count):
            value = int(amplitude * math.sin(2 * math.pi * frequency * index / sample_rate))
            wav_file.writeframesraw(value.to_bytes(2, byteorder="little", signed=True))
    return buffer.getvalue()


def wav_duration_ms(wav_bytes: bytes) -> int:
    with wave.open(io.BytesIO(wav_bytes), "rb") as wav_file:
        frames = wav_file.getnframes()
        sample_rate = wav_file.getframerate()
    return int(frames / sample_rate * 1000)
