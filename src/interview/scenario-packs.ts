import type { InterviewSetup } from "@/domain/session";

export type InterviewScenarioId =
  | "general-english"
  | "software-engineering"
  | "product-management"
  | "research-discussion"
  | "scholarship-interview"
  | "international-team-meeting";

export interface InterviewScenarioPack {
  id: InterviewScenarioId;
  label: string;
  description: string;
  defaultGoal: string;
  targetContext: string;
  interviewerStyle: InterviewSetup["style"];
  questionPlan: string[];
  evaluationRubric: string[];
  strongAnswerTraits: string[];
}

export const interviewScenarioPacks: InterviewScenarioPack[] = [
  {
    id: "general-english",
    label: "General English interview",
    description: "A flexible interview for confidence, clarity, and answer structure.",
    defaultGoal: "General English interview",
    targetContext: "General English interview practice",
    interviewerStyle: "standard",
    questionPlan: [
      "Open with a self-introduction question.",
      "Ask for one concrete past example.",
      "Ask about a challenge or learning moment.",
      "Close with next goals or motivation.",
    ],
    evaluationRubric: ["clear structure", "specific examples", "relevance to the question", "confident delivery"],
    strongAnswerTraits: ["answers one question directly", "uses a concrete example", "keeps the answer concise"],
  },
  {
    id: "software-engineering",
    label: "Software engineering interview",
    description: "Practice explaining projects, tradeoffs, collaboration, and impact.",
    defaultGoal: "Software engineering interview",
    targetContext: "Software engineering behavioral and project interview",
    interviewerStyle: "standard",
    questionPlan: [
      "Ask about a technical project the candidate owned.",
      "Probe tradeoffs, constraints, and technical decisions.",
      "Ask about collaboration with product, design, or backend teams.",
      "Ask how the candidate measured impact or handled failure.",
    ],
    evaluationRubric: ["technical clarity", "ownership", "tradeoff reasoning", "impact", "collaboration"],
    strongAnswerTraits: ["names the problem and constraints", "explains personal role", "connects technical choices to user or business impact"],
  },
  {
    id: "product-management",
    label: "Product manager interview",
    description: "Practice product sense, prioritization, metrics, and stakeholder communication.",
    defaultGoal: "Product manager interview",
    targetContext: "Product management interview with product sense and execution questions",
    interviewerStyle: "standard",
    questionPlan: [
      "Ask about a product decision or launch.",
      "Probe customer insight and prioritization.",
      "Ask how success was measured.",
      "Ask about stakeholder conflict or scope reduction.",
    ],
    evaluationRubric: ["customer focus", "prioritization", "metric clarity", "stakeholder reasoning", "decision quality"],
    strongAnswerTraits: ["starts with user problem", "states tradeoffs", "uses metrics", "shows cross-functional alignment"],
  },
  {
    id: "research-discussion",
    label: "Research discussion",
    description: "Practice explaining research ideas, evidence, limitations, and next steps.",
    defaultGoal: "Research or graduate-school discussion",
    targetContext: "Academic or research discussion in English",
    interviewerStyle: "friendly",
    questionPlan: [
      "Ask the candidate to summarize their research interest.",
      "Probe evidence, methods, or assumptions.",
      "Ask about limitations and uncertainty.",
      "Ask what they would investigate next.",
    ],
    evaluationRubric: ["conceptual clarity", "evidence", "limitations", "curiosity", "structured explanation"],
    strongAnswerTraits: ["defines terms simply", "separates evidence from opinion", "states uncertainty clearly"],
  },
  {
    id: "scholarship-interview",
    label: "Scholarship interview",
    description: "Practice motivation, personal story, impact, and future contribution.",
    defaultGoal: "Scholarship interview",
    targetContext: "Scholarship or fellowship interview in English",
    interviewerStyle: "friendly",
    questionPlan: [
      "Ask about motivation and background.",
      "Probe a meaningful challenge or contribution.",
      "Ask why this opportunity matters now.",
      "Ask how the candidate will contribute after receiving support.",
    ],
    evaluationRubric: ["authenticity", "mission fit", "impact", "reflection", "future contribution"],
    strongAnswerTraits: ["connects personal story to mission", "shows reflection", "names concrete future impact"],
  },
  {
    id: "international-team-meeting",
    label: "International team meeting",
    description: "Practice speaking up, clarifying, disagreeing politely, and summarizing decisions.",
    defaultGoal: "International team meeting",
    targetContext: "Business meeting with international teammates",
    interviewerStyle: "standard",
    questionPlan: [
      "Ask the user to give a short update.",
      "Challenge one unclear assumption.",
      "Ask the user to clarify a tradeoff or risk.",
      "Ask the user to summarize the next step.",
    ],
    evaluationRubric: ["conciseness", "clarification", "polite disagreement", "listening", "decision focus"],
    strongAnswerTraits: ["states the main point first", "asks clarifying questions", "summarizes ownership and next steps"],
  },
];

export function getInterviewScenarioPack(id: string | undefined): InterviewScenarioPack {
  return interviewScenarioPacks.find((pack) => pack.id === id) ?? interviewScenarioPacks[0];
}

export function scenarioPromptContext(setup: InterviewSetup): string {
  const pack = getInterviewScenarioPack(setup.scenarioId);

  return [
    `Scenario: ${pack.label}`,
    `Scenario goal: ${setup.goal || pack.defaultGoal}`,
    `Target context: ${setup.targetContext || pack.targetContext}`,
    `Question plan: ${pack.questionPlan.join(" | ")}`,
    `Evaluation rubric: ${pack.evaluationRubric.join(", ")}`,
    `Strong answer traits: ${pack.strongAnswerTraits.join(", ")}`,
  ].join("\n");
}
