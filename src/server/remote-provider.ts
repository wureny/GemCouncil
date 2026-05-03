export interface RemoteProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs: number;
}

export function configuredRemoteProvider(options: {
  apiKeyEnv: string;
  baseUrlEnv: string;
  defaultTimeoutMs: number;
  timeoutEnv: string;
}): RemoteProviderConfig {
  return {
    apiKey: process.env[options.apiKeyEnv],
    baseUrl: process.env[options.baseUrlEnv],
    timeoutMs: parseTimeoutMs(process.env[options.timeoutEnv], options.defaultTimeoutMs),
  };
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Remote provider request timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function remoteProviderHeaders(apiKey?: string): Headers {
  const headers = new Headers();
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  return headers;
}

function parseTimeoutMs(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
