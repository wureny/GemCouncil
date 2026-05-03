import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface SpeechUnderstandingBackendResponse {
  transcript?: unknown;
  confidence?: unknown;
  language?: unknown;
  notes?: unknown;
}

export async function POST(request: Request) {
  const backendUrl = process.env.GEMMA_SPEECH_API_URL;

  if (!backendUrl) {
    return NextResponse.json(
      {
        error:
          "GEMMA_SPEECH_API_URL is not configured. Keep NEXT_PUBLIC_SPEECH_UNDERSTANDING_PROVIDER=mock or start the Gemma speech service.",
      },
      { status: 503 },
    );
  }

  const incoming = await request.formData();
  const audio = incoming.get("audio");

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("audio", audio, fileNameFor(audio));
  appendIfPresent(upstream, incoming, "durationMs");
  appendIfPresent(upstream, incoming, "mimeType");
  appendIfPresent(upstream, incoming, "session");

  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/speech/understand`, {
      method: "POST",
      body: upstream,
    });

    if (!response.ok) {
      return NextResponse.json({ error: await upstreamErrorMessage(response) }, { status: response.status });
    }

    return NextResponse.json(parseBackendResponse(await response.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemma speech backend request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function appendIfPresent(target: FormData, source: FormData, key: string) {
  const value = source.get(key);
  if (typeof value === "string") {
    target.append(key, value);
  }
}

function fileNameFor(audio: Blob) {
  if (audio.type.includes("wav")) {
    return "answer.wav";
  }
  if (audio.type.includes("mp4")) {
    return "answer.m4a";
  }
  if (audio.type.includes("mpeg")) {
    return "answer.mp3";
  }
  return "answer.webm";
}

function parseBackendResponse(data: SpeechUnderstandingBackendResponse) {
  if (typeof data.transcript !== "string" || data.transcript.trim().length === 0) {
    throw new Error("Gemma speech backend returned an empty transcript.");
  }

  return {
    transcript: data.transcript.trim(),
    confidence: typeof data.confidence === "number" ? data.confidence : undefined,
    language: typeof data.language === "string" ? data.language : undefined,
    notes: Array.isArray(data.notes) ? data.notes.filter((note): note is string => typeof note === "string") : undefined,
  };
}

async function upstreamErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: unknown; detail?: unknown };
    if (typeof data.error === "string") {
      return data.error;
    }
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // Use status text below.
  }

  return response.statusText || "Gemma speech backend failed.";
}
