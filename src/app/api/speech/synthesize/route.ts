import { NextResponse } from "next/server";
import { configuredRemoteProvider, fetchWithTimeout, remoteProviderHeaders } from "@/server/remote-provider";

export const runtime = "nodejs";

interface SynthesizeRequest {
  text?: unknown;
  voice?: unknown;
}

interface SpeechSynthesisBackendResponse {
  audioBase64?: unknown;
  durationMs?: unknown;
  mimeType?: unknown;
}

export async function POST(request: Request) {
  const remote = voxcpmRemoteConfig();

  if (!remote.baseUrl) {
    return NextResponse.json(
      {
        error:
          "VOXCPM_TTS_API_URL is not configured. Keep NEXT_PUBLIC_SPEECH_OUTPUT_PROVIDER=mock or configure a remote VoxCPM TTS service.",
      },
      { status: 503 },
    );
  }

  const payload = (await request.json()) as SynthesizeRequest;
  const text = typeof payload.text === "string" ? payload.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Text is required for speech synthesis." }, { status: 400 });
  }

  try {
    const response = await fetchWithTimeout(`${remote.baseUrl.replace(/\/$/, "")}/speech/synthesize`, {
      method: "POST",
      headers: jsonHeaders(remote.apiKey),
      body: JSON.stringify({
        text,
        voice: payload.voice,
      }),
    }, remote.timeoutMs);

    if (!response.ok) {
      return NextResponse.json({ error: await upstreamErrorMessage(response) }, { status: response.status });
    }

    return NextResponse.json(parseBackendResponse(await response.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "VoxCPM TTS backend request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  const remote = voxcpmRemoteConfig();

  if (!remote.baseUrl) {
    return NextResponse.json({
      ok: false,
      provider: "voxcpm-tts",
      configured: false,
      error: "VOXCPM_TTS_API_URL is not configured.",
    });
  }

  try {
    const response = await fetchWithTimeout(`${remote.baseUrl.replace(/\/$/, "")}/health`, {
      headers: remoteProviderHeaders(remote.apiKey),
      method: "GET",
    }, remote.timeoutMs);

    return NextResponse.json({
      ok: response.ok,
      provider: "voxcpm-tts",
      configured: true,
      remoteStatus: response.status,
      remote: await optionalJson(response),
    }, { status: response.ok ? 200 : 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "VoxCPM TTS backend health check failed.";
    return NextResponse.json({
      ok: false,
      provider: "voxcpm-tts",
      configured: true,
      error: message,
    }, { status: 502 });
  }
}

function voxcpmRemoteConfig() {
  return configuredRemoteProvider({
    apiKeyEnv: "VOXCPM_TTS_API_KEY",
    baseUrlEnv: "VOXCPM_TTS_API_URL",
    defaultTimeoutMs: 60000,
    timeoutEnv: "VOXCPM_TTS_TIMEOUT_MS",
  });
}

function jsonHeaders(apiKey?: string) {
  const headers = remoteProviderHeaders(apiKey);
  headers.set("Content-Type", "application/json");
  return headers;
}

function parseBackendResponse(data: SpeechSynthesisBackendResponse) {
  if (typeof data.audioBase64 !== "string" || data.audioBase64.length === 0) {
    throw new Error("VoxCPM TTS backend returned empty audio.");
  }

  return {
    audioBase64: data.audioBase64,
    durationMs: typeof data.durationMs === "number" ? data.durationMs : undefined,
    mimeType: typeof data.mimeType === "string" ? data.mimeType : "audio/wav",
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

  return response.statusText || "VoxCPM TTS backend failed.";
}

async function optionalJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
