import type { FeedbackReport as FeedbackReportData } from "@/domain/session";

const scoreLabels: Array<[keyof FeedbackReportData["scores"], string]> = [
  ["clarity", "Clarity"],
  ["relevance", "Relevance"],
  ["listening", "Listening"],
  ["fluency", "Fluency"],
  ["confidence", "Confidence"],
];

export function FeedbackReport({ report }: { report: FeedbackReportData }) {
  return (
    <section className="border border-ink/15 bg-white p-6">
      <h2 className="text-2xl font-semibold">Session feedback</h2>
      <p className="mt-3 leading-7 text-slate">{report.summary}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {scoreLabels.map(([key, label]) => (
          <div key={key} className="border border-ink/10 p-3">
            <p className="text-sm text-slate">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{report.scores[key]}/5</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <FeedbackList title="Strengths" items={report.strengths} />
        <FeedbackList title="Improve next" items={report.improvements} />
        <FeedbackList title="Better answer examples" items={report.betterAnswerExamples} />
        <FeedbackList title="Next practice" items={report.nextPractice} />
      </div>
    </section>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
