"use client";

import { FormEvent, useState } from "react";
import type { CampaignDraft, Quest, QuestDifficulty, QuestDraft } from "../lib/types";
import { useForge } from "./ForgeProvider";

const emptyQuest: QuestDraft = { title: "", description: "", difficulty: "Standard", xpReward: 100, estimatedMinutes: 25, focusPrompt: "", prerequisites: [], statRewards: { Development: 2, Learning: 1, Discipline: 1 } };
const emptyCampaign: CampaignDraft = { title: "", subtitle: "Personal campaign", description: "", level: "Starter" };

export function CampaignManager() {
  const { activeCampaign, activeQuests, data, addCampaign, addQuest, archiveQuest, deleteQuest, moveQuest, setActiveCampaign, updateQuest } = useForge();
  const [questDraft, setQuestDraft] = useState<QuestDraft>(emptyQuest);
  const [campaignDraft, setCampaignDraft] = useState<CampaignDraft>(emptyCampaign);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showQuestForm, setShowQuestForm] = useState(false);

  function saveQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!questDraft.title.trim()) return;
    if (editingId) updateQuest(editingId, questDraft);
    else addQuest(questDraft);
    setQuestDraft(emptyQuest);
    setEditingId(null);
    setShowQuestForm(false);
  }

  function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignDraft.title.trim()) return;
    addCampaign(campaignDraft);
    setCampaignDraft(emptyCampaign);
    setShowCampaignForm(false);
  }

  function editQuest(quest: Quest) {
    const { title, description, difficulty, xpReward, estimatedMinutes, focusPrompt, prerequisites, statRewards } = quest;
    setQuestDraft({ title, description, difficulty, xpReward, estimatedMinutes, focusPrompt, prerequisites, statRewards });
    setEditingId(quest.id);
    setShowQuestForm(true);
  }

  return (
    <section className="mt-12 border-t border-white/8 pt-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Build your board</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Campaign tools</h2><p className="mt-2 text-sm text-stone-400">Everything stays on this device until you export a backup.</p></div><div className="flex gap-2"><button onClick={() => setShowQuestForm((value) => !value)} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-stone-950 hover:bg-orange-400">New quest</button><button onClick={() => setShowCampaignForm((value) => !value)} className="rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-stone-200 hover:bg-white/6">New campaign</button></div></div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4"><label htmlFor="campaign-picker" className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Active campaign</label><select id="campaign-picker" value={activeCampaign.id} onChange={(event) => setActiveCampaign(event.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400">{data.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select><p className="mt-3 text-xs leading-5 text-stone-500">Switching campaigns changes the quest board without discarding progress.</p></div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Manage quests</p><div className="mt-3 space-y-2">{activeQuests.length ? activeQuests.map((quest, index) => <div key={quest.id} className="flex items-center gap-3 rounded-xl border border-white/7 bg-black/15 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-stone-200">{quest.title}</p><p className="mt-1 text-xs text-stone-500">{quest.estimatedMinutes} min · +{quest.xpReward} XP · {quest.status}</p></div><div className="flex shrink-0 gap-1"><button aria-label={`Move ${quest.title} up`} onClick={() => moveQuest(quest.id, "up")} disabled={index === 0} className="rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-white/8 disabled:opacity-30">↑</button><button aria-label={`Move ${quest.title} down`} onClick={() => moveQuest(quest.id, "down")} disabled={index === activeQuests.length - 1} className="rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-white/8 disabled:opacity-30">↓</button><button onClick={() => editQuest(quest)} className="rounded-md px-2 py-1 text-xs text-orange-300 hover:bg-orange-400/8">Edit</button><button onClick={() => archiveQuest(quest.id)} className="rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-white/8">Archive</button><button onClick={() => { if (window.confirm(`Delete ${quest.title}?`)) deleteQuest(quest.id); }} className="rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-400/8">Delete</button></div></div>) : <p className="py-4 text-sm text-stone-500">This campaign has no quests yet.</p>}</div></div>
      </div>

      {showQuestForm && <form onSubmit={saveQuest} className="mt-5 grid gap-3 rounded-2xl border border-orange-400/20 bg-orange-500/5 p-5 md:grid-cols-2"><div className="md:col-span-2"><p className="text-sm font-semibold text-white">{editingId ? "Edit quest" : "Add a quest"}</p></div><Field label="Quest title" value={questDraft.title} onChange={(title) => setQuestDraft({ ...questDraft, title })} required /><Field label="Short description" value={questDraft.description} onChange={(description) => setQuestDraft({ ...questDraft, description })} /><label className="text-xs font-medium text-stone-400">Difficulty<select value={questDraft.difficulty} onChange={(event) => setQuestDraft({ ...questDraft, difficulty: event.target.value as QuestDifficulty })} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white"><option>Easy</option><option>Standard</option><option>Hard</option><option>Boss</option></select></label><Field label="XP reward" type="number" value={String(questDraft.xpReward)} onChange={(value) => setQuestDraft({ ...questDraft, xpReward: Number(value) || 0 })} /><Field label="Focus minutes" type="number" value={String(questDraft.estimatedMinutes)} onChange={(value) => setQuestDraft({ ...questDraft, estimatedMinutes: Number(value) || 1 })} /><div className="md:col-span-2"><Field label="Focus prompt" value={questDraft.focusPrompt} onChange={(focusPrompt) => setQuestDraft({ ...questDraft, focusPrompt })} /></div><div className="flex gap-2 md:col-span-2"><button className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-stone-950">Save quest</button><button type="button" onClick={() => { setShowQuestForm(false); setEditingId(null); setQuestDraft(emptyQuest); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-300 hover:bg-white/6">Cancel</button></div></form>}

      {showCampaignForm && <form onSubmit={saveCampaign} className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/3 p-5 md:grid-cols-2"><div className="md:col-span-2"><p className="text-sm font-semibold text-white">Add a campaign</p></div><Field label="Campaign title" value={campaignDraft.title} onChange={(title) => setCampaignDraft({ ...campaignDraft, title })} required /><Field label="Campaign level" value={campaignDraft.level} onChange={(level) => setCampaignDraft({ ...campaignDraft, level })} /><Field label="Subtitle" value={campaignDraft.subtitle} onChange={(subtitle) => setCampaignDraft({ ...campaignDraft, subtitle })} /><Field label="Description" value={campaignDraft.description} onChange={(description) => setCampaignDraft({ ...campaignDraft, description })} /><div className="flex gap-2 md:col-span-2"><button className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-stone-950">Create campaign</button><button type="button" onClick={() => setShowCampaignForm(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-300 hover:bg-white/6">Cancel</button></div></form>}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="text-xs font-medium text-stone-400">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label>;
}
