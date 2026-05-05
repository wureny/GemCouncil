export type PracticeMode = "interview" | "meeting";

export type SessionStatus = "setup" | "active" | "completed" | "failed";

export type SpeakerRole = "user" | "interviewer" | "moderator" | "participant";

export interface InterviewSetup {
  scenarioId?: string;
  goal?: string;
  targetContext?: string;
  selfIntroduction?: string;
  backgroundNotes?: string;
  style: "random" | "friendly" | "standard" | "tough";
  difficulty: "auto" | "junior" | "mid" | "senior";
}

export interface MeetingSetup {
  topic: string;
  meetingType: "business";
  participantCount: 2 | 3;
}

export interface ConversationTurn {
  id: string;
  speakerId: string;
  speakerRole: SpeakerRole;
  text: string;
  audioUrl?: string;
  startedAt: string;
  endedAt?: string;
}

export interface FeedbackScores {
  clarity: number;
  relevance: number;
  listening: number;
  fluency: number;
  confidence: number;
}

export interface FeedbackReport {
  summary: string;
  scores: FeedbackScores;
  strengths: string[];
  improvements: string[];
  betterAnswerExamples: string[];
  nextPractice: string[];
}

export interface PracticeSession {
  id: string;
  mode: PracticeMode;
  status: SessionStatus;
  createdAt: string;
  setup: InterviewSetup | MeetingSetup;
  turns: ConversationTurn[];
  report?: FeedbackReport;
}
