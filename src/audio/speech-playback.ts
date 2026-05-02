import type { AudioOutput } from "@/domain/providers";

export interface SpeechPlaybackHandle {
  stop: () => void;
  done: Promise<void>;
}

export function playSpeechOutput(output: AudioOutput): SpeechPlaybackHandle {
  if (output.mimeType === "audio/mock") {
    return playMockSpeech(output.durationMs);
  }

  if (typeof Audio === "undefined") {
    return {
      stop: () => undefined,
      done: Promise.reject(new Error("Audio playback is not available in this environment.")),
    };
  }

  const audio = new Audio(output.url);
  audio.preload = "auto";

  let rejectDone: ((error: Error) => void) | undefined;
  const done = new Promise<void>((resolve, reject) => {
    rejectDone = reject;
    audio.addEventListener("ended", () => resolve(), { once: true });
    audio.addEventListener("error", () => reject(new Error("Interviewer speech playback failed.")), {
      once: true,
    });
  });

  void audio.play().catch(() => {
    rejectDone?.(new Error("Interviewer speech playback failed."));
  });

  return {
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
    },
    done,
  };
}

function playMockSpeech(durationMs = 900): SpeechPlaybackHandle {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let resolveDone: (() => void) | undefined;

  const done = new Promise<void>((resolve) => {
    resolveDone = resolve;
    timeout = setTimeout(resolve, durationMs);
  });

  return {
    stop: () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      resolveDone?.();
    },
    done,
  };
}
