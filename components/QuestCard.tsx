import type { Quest } from "../lib/types";

const difficultyStyles = {
  Easy: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
  Standard: "border-sky-400/20 bg-sky-400/8 text-sky-300",
  Hard: "border-violet-400/20 bg-violet-400/8 text-violet-300",
  Boss: "border-orange-400/25 bg-orange-400/10 text-orange-300",
  Finale: "border-red-400/30 bg-orange-400/12 text-red-300",
};

export function QuestCard({ quest, featured = false, onStart }: { quest: Quest; featured?: boolean; onStart?: (questId: string) => void }) {
  const completed = quest.status === "completed";
  const locked = quest.status === "locked";
  return (
    <article className={`group rounded-2xl border p-5 transition duration-300 ${featured ? "border-orange-500/30 bg-orange-500/6" : "border-white/8 bg-white/3 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/5"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${difficultyStyles[quest.difficulty]}`}>{quest.difficulty}</span>
        <span className="text-sm font-semibold text-orange-300">+{quest.xpReward} XP</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{quest.title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-stone-400">{quest.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/7 pt-4">
        <span className="text-xs text-stone-500">◷ {quest.estimatedMinutes} min focus</span>
        {completed ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300">✓ Cleared</span>
        ) : locked ? (
          <span className="text-sm font-medium text-stone-500">Upcoming</span>
        ) : (
          <button onClick={() => onStart?.(quest.id)} className="inline-flex items-center gap-1 text-sm font-medium text-stone-200 transition group-hover:text-orange-300">
            Start <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </article>
  );
}
