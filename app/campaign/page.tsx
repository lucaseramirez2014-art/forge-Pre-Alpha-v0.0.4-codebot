"use client";

import { useRouter } from "next/navigation";
import { CampaignCard } from "../../components/CampaignCard";
import { CampaignManager } from "../../components/CampaignManager";
import { ForgeNav } from "../../components/ForgeNav";
import { QuestCard } from "../../components/QuestCard";
import { campaignProgress, useForge } from "../../components/ForgeProvider";

export default function CampaignPage() {
  const router = useRouter();
  const { activeCampaign, activeQuests, selectQuest } = useForge();
  const normalQuests = activeQuests.filter((quest) => quest.difficulty !== "Boss");
  const bossQuest = activeQuests.find((quest) => quest.difficulty === "Boss");
  const cleared = activeQuests.filter((quest) => quest.status === "completed").length;
  const startQuest = (questId: string) => { if (selectQuest(questId)) router.push(`/focus?quest=${questId}`); };
  return <main className="min-h-screen pb-14"><ForgeNav /><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Campaign map · {activeCampaign.stage}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{activeCampaign.title}</h1><p className="mt-3 text-stone-400">{activeCampaign.description}</p></div><div className="mt-8"><CampaignCard campaign={activeCampaign} progress={campaignProgress(activeQuests)} completed={cleared} total={activeQuests.length} /></div><section className="mt-12"><div className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-orange-500 text-xs font-bold text-stone-950">{cleared + 1}</span><div><p className="text-sm font-semibold text-white">Quest path</p><p className="text-xs text-stone-500">Each completed quest unlocks the next step in the path.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-3">{normalQuests.map((quest) => <QuestCard key={quest.id} quest={quest} onStart={startQuest} />)}</div></section>{bossQuest && <section className="mt-10"><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300"><span className="size-1.5 rounded-full bg-orange-400" /> Boss quest</div><QuestCard quest={bossQuest} onStart={startQuest} featured /></section>}<CampaignManager /></div></main>;
}
