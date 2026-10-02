"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo } from "react";
import { FocusTimer } from "../../components/FocusTimer";
import { ForgeNav } from "../../components/ForgeNav";
import { useForge } from "../../components/ForgeProvider";

export default function FocusPage() { return <Suspense fallback={<FocusLoading />}><FocusSession /></Suspense>; }

function FocusSession() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, activeCampaign, activeQuest, selectQuest } = useForge();
  const quest = useMemo(() => data.quests.find((item) => item.id === params.get("quest")) ?? activeQuest, [activeQuest, data.quests, params]);
  const finish = useCallback((elapsedSeconds: number, completionRatio: number) => { if (quest) router.push(`/complete?quest=${quest.id}&minutes=${Math.max(1, Math.ceil(elapsedSeconds / 60))}&ratio=${completionRatio.toFixed(3)}`); }, [quest, router]);

  useEffect(() => { if (quest && quest.status === "available") selectQuest(quest.id); }, [quest, selectQuest]);

  if (!quest) return <main className="min-h-screen"><ForgeNav /><div className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="text-3xl font-semibold text-white">Choose a quest before starting focus.</h1><Link href="/campaign" className="mt-6 inline-block text-orange-300">Open campaign map →</Link></div></main>;
  if (quest.status === "locked") return <main className="min-h-screen"><ForgeNav /><div className="mx-auto max-w-xl px-5 py-20 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Quest locked</p><h1 className="mt-3 text-3xl font-semibold text-white">Clear its prerequisites first.</h1><Link href="/campaign" className="mt-6 inline-block text-orange-300">Return to campaign →</Link></div></main>;

  return <main className="min-h-screen pb-12"><ForgeNav /><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12"><Link href="/campaign" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-200">← Leave focus</Link><section className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-[#11100f] p-6 sm:p-10"><div className="mx-auto max-w-xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">{activeCampaign.title} · {activeCampaign.stage}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{quest.title}</h1><p className="mt-3 text-sm leading-6 text-stone-400">{quest.focusPrompt}</p><div className="mt-5 flex flex-wrap justify-center gap-2 text-xs"><span className="rounded-full border border-white/10 px-3 py-1.5 text-stone-300">{quest.difficulty}</span><span className="rounded-full border border-white/10 px-3 py-1.5 text-stone-300">{quest.estimatedMinutes} min</span><span className="rounded-full border border-orange-400/20 bg-orange-400/8 px-3 py-1.5 text-orange-300">+{quest.xpReward} XP</span></div></div><div className="mt-10"><FocusTimer key={quest.id} minutes={quest.estimatedMinutes} xpReward={quest.xpReward} onFinish={finish} /></div></section></div></main>;
}

function FocusLoading() { return <main className="grid min-h-screen place-items-center text-sm text-stone-500">Preparing your focus session…</main>; }
