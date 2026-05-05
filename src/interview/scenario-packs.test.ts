import { describe, expect, it } from "vitest";
import { getInterviewScenarioPack, interviewScenarioPacks, scenarioPromptContext } from "./scenario-packs";

describe("interview scenario packs", () => {
  it("defines the hackathon scenario set", () => {
    expect(interviewScenarioPacks.map((pack) => pack.id)).toEqual([
      "general-english",
      "software-engineering",
      "product-management",
      "research-discussion",
      "scholarship-interview",
      "international-team-meeting",
    ]);
  });

  it("falls back to the general English scenario", () => {
    expect(getInterviewScenarioPack(undefined).id).toBe("general-english");
    expect(getInterviewScenarioPack("unknown").id).toBe("general-english");
  });

  it("builds prompt context with question plan and rubric", () => {
    const context = scenarioPromptContext({
      scenarioId: "software-engineering",
      style: "standard",
      difficulty: "auto",
    });

    expect(context).toContain("Software engineering interview");
    expect(context).toContain("Question plan:");
    expect(context).toContain("Evaluation rubric:");
    expect(context).toContain("tradeoff reasoning");
  });
});
