import type { AudioOutput, SpeechOutputProvider, VoiceProfile } from "@/domain/providers";

export interface VoxCpmSpeechOutputProviderOptions {
  endpoint?: string;
}

interface VoxCpmSpeechOutputResponse {
  audioBase64?: unknown;
  durationMs?: unknown;
  mimeType?: unknown;
}

export class VoxCpmSpeechOutputProvider implements SpeechOutputProvider {
  private readonly endpoint: string;

  constructor(options: VoxCpmSpeechOutputProviderOptions = {}) {
    this.endpoint = options.endpoint ?? "/api/speech/synthesize";
  }

  async speak(text: string, voice: VoiceProfile): Promise<AudioOutput> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    });

    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }

    return parseSpeechOutput(await response.json());
  }
}

function parseSpeechOutput(data: VoxCpmSpeechOutputResponse): AudioOutput {
  const mimeType = typeof data.mimeType === "string" ? data.mimeType : "audio/wav";

  if (typeof data.audioBase64 !== "string" || data.audioBase64.length === 0) {
    throw new Error("VoxCPM TTS service returned empty audio.");
  }

  return {
    url: `data:${mimeType};base64,${data.audioBase64}`,
    mimeType,
    durationMs: typeof data.durationMs === "number" ? data.durationMs : undefined,
  };
}

async function responseErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: unknown; detail?: unknown };
    if (typeof data.error === "string") {
      return data.error;
    }
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // Fall through to generic status.
  }

  return `VoxCPM TTS service failed with ${response.status}.`;
}
