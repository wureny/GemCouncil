import { InterviewExperience } from "@/components/interview/InterviewExperience";

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
      <section className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10">
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
                {mode.title === "Interview Room" ? "Available below" : "Coming next"}
              </button>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <InterviewExperience />
        </div>
      </section>
    </main>
  );
}
