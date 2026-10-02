"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { ForgeNav } from "../../components/ForgeNav";
import { XPBar } from "../../components/XPBar";
import { useForge } from "../../components/ForgeProvider";

export default function CompletePage() { return <Suspense fallback={<CompletionLoading />}><Completion /></Suspense>; }

function Completion() {
  const params = useSearchParams();
  const { data, player, activeCampaign, finishQuest } = useForge();
  const quest = useMemo(() => data.quests.find((item) => item.id === params.get("quest")) ?? data.quests[0], [data.quests, params]);
  const minutes = Math.max(1, Number(params.get("minutes")) || 1);
  const ratio = Math.max(0, Math.min(1, Number(params.get("ratio")) || 1));
  const settled = useRef(false);
  useEffect(() => { if (!settled.current) { settled.current = true; finishQuest(quest.id, minutes, ratio); } }, [finishQuest, minutes, quest.id, ratio]);
  const reward = data.lastReward?.questId === quest.id ? data.lastReward : null;
  const levelUp = reward && reward.levelAfter > reward.levelBefore;

  return <main className="min-h-screen pb-12"><ForgeNav /><div className="mx-auto flex max-w-3xl justify-center px-5 py-14 sm:px-8 sm:py-20"><section className="w-full overflow-hidden rounded-3xl border border-orange-500/22 bg-linear-to-b from-orange-500/12 via-[#14110e] to-[#0f0f0f] p-7 text-center shadow-2xl shadow-orange-950/20 sm:p-12"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-orange-500 text-3xl text-stone-950 shadow-lg shadow-orange-900/40">✓</div><p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Quest complete</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{quest.title}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">{reward ? `You focused for ${reward.focusMinutes} minute${reward.focusMinutes === 1 ? "" : "s"} and banked your progress.` : "Banking your progress…"}</p>{levelUp && <div className="mt-7 animate-pulse rounded-2xl border border-orange-300/30 bg-orange-400/10 p-4"><p className="text-xs font-semibold tracking-[0.2em] text-orange-200">LEVEL UP</p><p className="mt-1 text-2xl font-semibold text-white">Level {reward.levelAfter}</p></div>}<div className="mx-auto mt-8 grid max-w-md gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-orange-400/15 bg-orange-500/8 p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">XP gained</p><p className="mt-2 text-4xl font-semibold tracking-tight text-orange-300">+{reward?.xpGained ?? 0}</p><p className="mt-2 text-xs text-stone-500">{Math.round((reward?.completionRatio ?? ratio) * 100)}% session completion</p></div><div className="rounded-2xl border border-white/8 bg-white/3 p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Campaign progress</p><p className="mt-2 text-4xl font-semibold tracking-tight text-white">{reward?.campaignProgress ?? activeCampaign.progress}%</p><p className="mt-2 text-xs text-stone-500">Streak · {reward?.streak ?? player.streak} days</p></div></div><div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/7 bg-black/15 p-4 text-left"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-white">Level {player.level} progress</span><span className="text-xs text-stone-500">{player.xp.toLocaleString()} XP</span></div><XPBar current={player.xp} goal={player.xpToNextLevel} compact /></div>{reward && Object.keys(reward.statsDelta).length > 0 && <p className="mt-5 text-sm text-stone-400">Stats improved · {Object.entries(reward.statsDelta).map(([stat, value]) => `${stat} +${value}`).join(" · ")}</p>}{reward?.unlockedQuestIds.length ? <p className="mt-3 text-sm font-medium text-emerald-300">New quest unlocked · {data.quests.find((item) => item.id === reward.unlockedQuestIds[0])?.title}</p> : null}<div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-orange-400">See your progress</Link><Link href="/campaign" className="rounded-xl border border-white/12 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/6">Choose another quest</Link></div></section></div></main>;
}

function CompletionLoading() { return <main className="grid min-h-screen place-items-center text-sm text-stone-500">Finalizing your progress…</main>; }
