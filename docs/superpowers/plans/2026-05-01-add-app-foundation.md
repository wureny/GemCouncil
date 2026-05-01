# Add App Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial GemCouncil web app foundation described by OpenSpec change `add-app-foundation`.

**Architecture:** Use a Vercel-first Next.js TypeScript app with focused shared modules for domain contracts and provider interfaces. Keep product behavior thin: the app shell exposes Interview and Meeting entry points, while real session flows remain deferred to later OpenSpec changes.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Vitest, Testing Library, ESLint, GitHub Actions.

---

## File Structure

Create or modify these files:

- Create: `package.json` - root scripts and dependencies for the app foundation.
- Create: `tsconfig.json` - TypeScript configuration.
- Create: `next.config.ts` - Next.js configuration.
- Create: `postcss.config.mjs` - Tailwind/PostCSS configuration.
- Create: `tailwind.config.ts` - Tailwind content and theme configuration.
- Create: `vitest.config.ts` - unit test configuration.
- Create: `vitest.setup.ts` - test DOM setup.
- Create: `eslint.config.mjs` - lint configuration.
- Create: `src/app/layout.tsx` - root app layout.
- Create: `src/app/page.tsx` - minimal GemCouncil first screen.
- Create: `src/app/globals.css` - global styles.
- Create: `src/domain/session.ts` - practice session, turn, setup, and feedback contracts.
- Create: `src/domain/providers.ts` - provider interfaces.
- Create: `src/domain/session.test.ts` - contract tests for representative objects.
- Create: `src/domain/providers.test.ts` - provider interface tests with fake providers.
- Create: `README.md` - setup, verify, and deployment baseline.
- Create: `.github/workflows/ci.yml` - CI workflow.
- Modify: `.gitignore` - keep existing `productv0.md` ignore and add standard Node/Next artifacts.
- Modify: `openspec/changes/add-app-foundation/tasks.md` - check off tasks after implementation.

## Task 1: Initialize Next.js Foundation Files

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "gemcouncil",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "verify": "npm run typecheck && npm run lint && npm run test && npm run build"
  },
  "dependencies": {
    "@next/env": "^15.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0",
    "typescript-eslint": "^8.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create TypeScript and Next config files**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Create Tailwind config and global styles**

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16201b",
        paper: "#f7f5ef",
        moss: "#45624e",
        signal: "#b5462f",
        slate: "#344156",
      },
    },
  },
  plugins: [],
};

export default config;
```

`src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #16201b;
  background: #f7f5ef;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}
```

- [ ] **Step 4: Create minimal app layout and first screen**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GemCouncil",
  description: "Voice-first English interview and meeting practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
const practiceModes = [
  {
    title: "Interview Room",
    label: "Primary v0 path",
    description: "Practice a one-on-one general English interview with voice interaction.",
  },
  {
    title: "Meeting Room",
    label: "Lightweight v0 mode",
    description: "Join a moderated business discussion with multiple AI participants.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-moss">
          GemCouncil
        </p>
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
            Practice the room before you enter the room.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate">
            A voice-first practice space for English interviews and business meetings.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {practiceModes.map((mode) => (
            <article key={mode.title} className="border border-ink/15 bg-white p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">{mode.title}</h2>
                <span className="text-sm font-medium text-signal">{mode.label}</span>
              </div>
              <p className="min-h-16 text-base leading-7 text-slate">{mode.description}</p>
              <button className="mt-6 w-full border border-ink px-4 py-3 text-left font-semibold transition hover:bg-ink hover:text-white">
                Start setup
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Update `.gitignore`**

```gitignore
productv0.md
node_modules/
.next/
out/
dist/
coverage/
.env
.env*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

- [ ] **Step 6: Run scaffold verification**

Run:

```bash
npm install
npm run typecheck
npm run build
```

Expected: dependency installation succeeds, TypeScript passes, and Next.js production build succeeds.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts src/app .gitignore
git commit -m "feat: scaffold GemCouncil web app"
```

## Task 2: Add Shared Domain Contracts

**Files:**

- Create: `src/domain/session.ts`
- Create: `src/domain/session.test.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `eslint.config.mjs`

- [ ] **Step 1: Create `src/domain/session.ts`**

```ts
export type PracticeMode = "interview" | "meeting";

export type SessionStatus = "setup" | "active" | "completed" | "failed";

export type SpeakerRole = "user" | "interviewer" | "moderator" | "participant";

export interface InterviewSetup {
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
```

- [ ] **Step 2: Create Vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Create ESLint config**

`eslint.config.mjs`:

```js
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**"],
  },
];
```

- [ ] **Step 4: Add contract tests**

`src/domain/session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { PracticeSession } from "./session";

describe("PracticeSession contracts", () => {
  it("represents an interview session with v0 feedback scores", () => {
    const session: PracticeSession = {
      id: "session-1",
      mode: "interview",
      status: "completed",
      createdAt: "2026-05-01T00:00:00.000Z",
      setup: {
        style: "random",
        difficulty: "auto",
        goal: "General English interview",
      },
      turns: [
        {
          id: "turn-1",
          speakerId: "interviewer",
          speakerRole: "interviewer",
          text: "Tell me about yourself.",
          startedAt: "2026-05-01T00:00:01.000Z",
        },
      ],
      report: {
        summary: "Clear answer with room for more specific examples.",
        scores: {
          clarity: 4,
          relevance: 4,
          listening: 3,
          fluency: 3,
          confidence: 3,
        },
        strengths: ["Structured opening"],
        improvements: ["Add concrete evidence"],
        betterAnswerExamples: ["I would frame the answer around one recent project."],
        nextPractice: ["Practice a two-minute self-introduction."],
      },
    };

    expect(session.mode).toBe("interview");
    expect(session.report?.scores.confidence).toBe(3);
  });

  it("represents a business meeting session", () => {
    const session: PracticeSession = {
      id: "session-2",
      mode: "meeting",
      status: "setup",
      createdAt: "2026-05-01T00:00:00.000Z",
      setup: {
        topic: "Should the team launch the beta next month?",
        meetingType: "business",
        participantCount: 3,
      },
      turns: [],
    };

    expect(session.setup).toMatchObject({ meetingType: "business" });
  });
});
```

- [ ] **Step 5: Run tests and lint**

Run:

```bash
npm run typecheck
npm run lint
npm run test
```

Expected: all commands pass.

- [ ] **Step 6: Commit shared contracts**

```bash
git add src/domain/session.ts src/domain/session.test.ts vitest.config.ts vitest.setup.ts eslint.config.mjs package.json package-lock.json
git commit -m "feat: add shared session contracts"
```

## Task 3: Add Provider Interfaces

**Files:**

- Create: `src/domain/providers.ts`
- Create: `src/domain/providers.test.ts`

- [ ] **Step 1: Create `src/domain/providers.ts`**

```ts
import type { PracticeSession } from "./session";

export interface AudioInput {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export interface SpeechUnderstanding {
  transcript: string;
  confidence?: number;
  language?: string;
  notes?: string[];
}

export interface VoiceProfile {
  id: string;
  label: string;
  speakingRate?: number;
}

export interface AudioOutput {
  url: string;
  mimeType: string;
  durationMs?: number;
}

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelResponse {
  text: string;
  raw?: unknown;
}

export interface ContextRequest {
  mode: PracticeSession["mode"];
  topic?: string;
  background?: string;
}

export interface ContextResult {
  title: string;
  prompts: string[];
  source: "built-in" | "search";
}

export interface SpeechUnderstandingProvider {
  understand(input: AudioInput, session: PracticeSession): Promise<SpeechUnderstanding>;
}

export interface SpeechOutputProvider {
  speak(text: string, voice: VoiceProfile): Promise<AudioOutput>;
}

export interface ModelReasoningProvider {
  generate(messages: ModelMessage[]): Promise<ModelResponse>;
}

export interface ContextProvider {
  getContext(request: ContextRequest): Promise<ContextResult>;
}
```

- [ ] **Step 2: Add provider interface tests**

`src/domain/providers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type {
  ContextProvider,
  ModelReasoningProvider,
  SpeechOutputProvider,
  SpeechUnderstandingProvider,
} from "./providers";
import type { PracticeSession } from "./session";

const session: PracticeSession = {
  id: "session-1",
  mode: "interview",
  status: "active",
  createdAt: "2026-05-01T00:00:00.000Z",
  setup: {
    style: "standard",
    difficulty: "auto",
  },
  turns: [],
};

describe("provider interfaces", () => {
  it("supports fake speech understanding providers", async () => {
    const provider: SpeechUnderstandingProvider = {
      async understand() {
        return { transcript: "I am ready for the interview.", confidence: 0.92 };
      },
    };

    const input = new Blob(["audio"], { type: "audio/webm" });
    const result = await provider.understand(
      { blob: input, mimeType: "audio/webm", durationMs: 1200 },
      session,
    );

    expect(result.transcript).toContain("ready");
  });

  it("supports fake speech output providers", async () => {
    const provider: SpeechOutputProvider = {
      async speak() {
        return { url: "blob:voice-output", mimeType: "audio/mpeg", durationMs: 900 };
      },
    };

    const result = await provider.speak("Welcome to GemCouncil.", {
      id: "interviewer-default",
      label: "Interviewer",
    });

    expect(result.mimeType).toBe("audio/mpeg");
  });

  it("supports fake reasoning and context providers", async () => {
    const model: ModelReasoningProvider = {
      async generate(messages) {
        return { text: messages.at(-1)?.content ?? "" };
      },
    };

    const context: ContextProvider = {
      async getContext() {
        return {
          title: "General interview",
          prompts: ["Tell me about yourself."],
          source: "built-in",
        };
      },
    };

    await expect(model.generate([{ role: "user", content: "Ask a question" }])).resolves.toEqual({
      text: "Ask a question",
    });
    await expect(context.getContext({ mode: "interview" })).resolves.toMatchObject({
      source: "built-in",
    });
  });
});
```

- [ ] **Step 3: Run provider verification**

Run:

```bash
npm run typecheck
npm run test
```

Expected: both commands pass.

- [ ] **Step 4: Commit provider interfaces**

```bash
git add src/domain/providers.ts src/domain/providers.test.ts
git commit -m "feat: add provider interfaces"
```

## Task 4: Add CI and Documentation

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `README.md`
- Modify: `openspec/changes/add-app-foundation/tasks.md`

- [ ] **Step 1: Create CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
```

- [ ] **Step 2: Create README**

`README.md`:

```md
# GemCouncil

GemCouncil is a voice-first practice room for non-native English speakers preparing for high-pressure interviews and business meetings.

The v0 product direction is documented in `docs/superpowers/specs/2026-05-01-gemcouncil-v0-product-design.md`.

## Current Status

This repository is in the app foundation phase. The current OpenSpec change is `add-app-foundation`, which establishes the web app scaffold, shared contracts, provider interfaces, verification workflow, and deployment baseline.

Interview and Meeting session behavior are intentionally deferred to later OpenSpec changes.

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run verification:

```bash
npm run verify
```

## Scripts

- `npm run dev` starts the local Next.js server.
- `npm run build` creates a production build.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run lint` runs ESLint.
- `npm run test` runs unit tests.
- `npm run verify` runs typecheck, lint, tests, and build.

## Project Structure

- `src/app/` contains the Next.js app shell.
- `src/domain/session.ts` defines practice session, turn, setup, and feedback contracts.
- `src/domain/providers.ts` defines provider interfaces for speech, model reasoning, and context sourcing.
- `openspec/` contains OpenSpec changes and capability specs.
- `docs/superpowers/` contains product design and implementation plans.

## Deployment

The first deployment target is Vercel. The app foundation must pass `npm run build` before deployment.
```

- [ ] **Step 3: Check off completed OpenSpec tasks**

After implementation and verification pass, update `openspec/changes/add-app-foundation/tasks.md` so all completed foundation tasks are checked:

```md
## 1. Project Scaffold

- [x] 1.1 Create the Vercel-first TypeScript web app structure.
- [x] 1.2 Add package scripts for development, build, typecheck, lint, test, and verify.
- [x] 1.3 Add a minimal GemCouncil first screen with Interview and Meeting entry points.

## 2. Shared Contracts

- [x] 2.1 Add shared TypeScript contracts for practice sessions, conversation turns, setup data, and feedback reports.
- [x] 2.2 Add provider interfaces for speech understanding, speech output, model reasoning, and context sourcing.
- [x] 2.3 Add unit tests that compile and validate representative contract objects.

## 3. Verification and CI

- [x] 3.1 Configure TypeScript, linting, formatting, and unit test tooling.
- [x] 3.2 Add a GitHub Actions workflow that runs install, typecheck, lint, tests, and production build.
- [x] 3.3 Run the local verification command and confirm it fails on errors and passes on the scaffold.

## 4. Documentation

- [x] 4.1 Add README setup instructions for install, development, verification, and deployment.
- [x] 4.2 Document the initial project structure and provider boundary rationale.
- [x] 4.3 Note that Interview and Meeting behavior are intentionally deferred to later OpenSpec changes.
```

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run verify
openspec validate add-app-foundation
```

Expected: both commands pass.

- [ ] **Step 5: Commit CI and docs**

```bash
git add .github/workflows/ci.yml README.md openspec/changes/add-app-foundation/tasks.md
git commit -m "chore: add foundation verification workflow"
```

## Task 5: Final Review

**Files:**

- Review: all changed files

- [ ] **Step 1: Inspect final status**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: only intentional untracked local files remain, and recent commits show scaffold, contracts, provider interfaces, and CI/docs.

- [ ] **Step 2: Verify OpenSpec task status**

Run:

```bash
openspec list
openspec validate add-app-foundation
```

Expected: `add-app-foundation` remains valid and shows completed task count after tasks are checked.

- [ ] **Step 3: Prepare implementation summary**

Summarize:

- App foundation files created.
- Commands run and results.
- Any provider or dependency decisions made during implementation.
- Any deviations from this plan and why.
