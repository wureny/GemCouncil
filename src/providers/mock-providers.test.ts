import { describe, expect, it } from "vitest";
import { createMockProviderSet } from "./mock-providers";

describe("mock providers", () => {
  it("returns deterministic speech understanding output", async () => {
    const providers = createMockProviderSet();
    const result = await providers.speechUnderstanding.understand(
      { blob: new Blob(["audio"]), mimeType: "audio/webm", durationMs: 1400 },
      {
        id: "session-1",
        mode: "interview",
        status: "active",
        createdAt: "2026-05-02T00:00:00.000Z",
        setup: { style: "standard", difficulty: "auto" },
        turns: [],
      },
    );

    expect(result.transcript).toBe("Mock transcript for 1400ms answer.");
  });

  it("returns deterministic speech output metadata", async () => {
    const providers = createMockProviderSet();
    const result = await providers.speechOutput.speak("Hello", {
      id: "interviewer-default",
      label: "Interviewer",
    });

    expect(result.mimeType).toBe("audio/mock");
    expect(result.url).toContain("interviewer-default");
  });

  it("returns deterministic interviewer and context output", async () => {
    const providers = createMockProviderSet();

    await expect(providers.context.getContext({ mode: "interview" })).resolves.toMatchObject({
      title: "General English interview",
      source: "built-in",
    });
    await expect(providers.context.getContext({ mode: "interview", topic: "software-engineering" })).resolves.toMatchObject({
      title: "Software engineering interview",
      prompts: expect.arrayContaining([expect.stringContaining("technical project")]),
    });
    await expect(
      providers.modelReasoning.generate([{ role: "user", content: "Open the interview proactively" }]),
    ).resolves.toMatchObject({
      text: expect.stringContaining("tell me about yourself"),
    });
  });
});
