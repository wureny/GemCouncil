import type { AudioInput, SpeechUnderstanding, SpeechUnderstandingProvider } from "@/domain/providers";
import type { PracticeSession } from "@/domain/session";

export interface GemmaSpeechUnderstandingProviderOptions {
  endpoint?: string;
}

interface GemmaSpeechUnderstandingResponse {
  transcript?: unknown;
  confidence?: unknown;
  language?: unknown;
  notes?: unknown;
}

export class GemmaSpeechUnderstandingProvider implements SpeechUnderstandingProvider {
  private readonly endpoint: string;

  constructor(options: GemmaSpeechUnderstandingProviderOptions = {}) {
    this.endpoint = options.endpoint ?? "/api/speech/understand";
  }

  async understand(input: AudioInput, session: PracticeSession): Promise<SpeechUnderstanding> {
    const body = new FormData();
    body.append("audio", input.blob, `answer.${extensionForMimeType(input.mimeType)}`);
    body.append("durationMs", String(input.durationMs));
    body.append("mimeType", input.mimeType);
    body.append("session", JSON.stringify(toSpeechSessionContext(session)));

    const response = await fetch(this.endpoint, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }

    return parseSpeechUnderstanding(await response.json());
  }
}

function toSpeechSessionContext(session: PracticeSession) {
  return {
    id: session.id,
    mode: session.mode,
    setup: session.setup,
    recentTurns: session.turns.slice(-6).map((turn) => ({
      speakerRole: turn.speakerRole,
      text: turn.text,
    })),
  };
}

function parseSpeechUnderstanding(data: GemmaSpeechUnderstandingResponse): SpeechUnderstanding {
  if (typeof data.transcript !== "string" || data.transcript.trim().length === 0) {
    throw new Error("Gemma speech service returned an empty transcript.");
  }

  return {
    transcript: data.transcript.trim(),
    confidence: typeof data.confidence === "number" ? data.confidence : undefined,
    language: typeof data.language === "string" ? data.language : undefined,
    notes: Array.isArray(data.notes) ? data.notes.filter((note): note is string => typeof note === "string") : undefined,
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
    // Fall through to the generic status text.
  }

  return `Gemma speech service failed with ${response.status}.`;
}

function extensionForMimeType(mimeType: string) {
  if (mimeType.includes("wav")) {
    return "wav";
  }
  if (mimeType.includes("mp4")) {
    return "m4a";
  }
  if (mimeType.includes("mpeg")) {
    return "mp3";
  }
  return "webm";
}
