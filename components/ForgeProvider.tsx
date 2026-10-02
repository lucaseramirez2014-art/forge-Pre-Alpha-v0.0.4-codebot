"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { activeCampaign, createDefaultForgeData, mockPlayer } from "../lib/mockUser";
import type { Campaign, CampaignDraft, FocusSession, ForgeData, PlayerStats, Quest, QuestDraft, RewardResult, StatRewards } from "../lib/types";

const storageKey = "forge-v0-0-4-data";
const legacyStorageKey = "forge-v0-0-3-data";
const defaultSnapshot = JSON.stringify(createDefaultForgeData());
const listeners = new Set<() => void>();

function readSnapshot() {
  if (typeof window === "undefined") return defaultSnapshot;
  return window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey) ?? defaultSnapshot;
}

function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
function notify() { listeners.forEach((listener) => listener()); }
function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function nextLevelThreshold(level: number) { return level * 200 + 200; }

function calculateStreak(sessions: FocusSession[]) {
  const days = new Set(sessions.map((session) => new Date(session.completedAt).toDateString()));
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toDateString())) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function progressFor(quests: Quest[]) {
  const visible = quests.filter((quest) => quest.status !== "archived");
  const completed = visible.filter((quest) => quest.status === "completed").length;
  return { completed, total: visible.length, progress: visible.length ? Math.round((completed / visible.length) * 100) : 0 };
}

function resolveStatuses(quests: Quest[], activeQuestId: string | null) {
  return quests.map((quest) => {
    if (quest.status === "archived" || quest.status === "completed") return quest;
    if (quest.id === activeQuestId) return { ...quest, status: "active" as const };
    const unlocked = quest.prerequisites.every((prerequisite) => quests.find((item) => item.id === prerequisite)?.status === "completed");
    return { ...quest, status: unlocked ? "available" as const : "locked" as const };
  });
}

function applyCampaignProgress(campaigns: Campaign[], quests: Quest[]) {
  return campaigns.map((campaign) => {
    const stats = progressFor(quests.filter((quest) => quest.campaignId === campaign.id));
    return { ...campaign, ...stats };
  });
}

type LegacyQuest = { id: string; campaignId: string; title: string; description: string; difficulty: Quest["difficulty"]; xp?: number; duration?: number; status?: string; focusPrompt?: string };
type LegacyData = { version: 3; xp?: number; campaigns?: Campaign[]; activeCampaignId?: string; quests?: LegacyQuest[]; sessions?: Array<Partial<FocusSession> & { minutes?: number; questId?: string; questTitle?: string; completedAt?: string }> };

function migrateLegacyData(legacy: LegacyData): ForgeData {
  const fallback = createDefaultForgeData();
  const legacyQuests = legacy.quests ?? [];
  const quests = legacyQuests.map((quest, index) => {
    const starter = fallback.quests.find((item) => item.id === quest.id);
    return {
      ...(starter ?? fallback.quests[Math.min(index, fallback.quests.length - 1)]),
      ...quest,
      estimatedMinutes: quest.duration ?? starter?.estimatedMinutes ?? 25,
      xpReward: quest.xp ?? starter?.xpReward ?? 100,
      prerequisites: starter?.prerequisites ?? (index ? [legacyQuests[index - 1].id] : []),
      statRewards: starter?.statRewards ?? { Development: 2, Learning: 1, Discipline: 1 },
      status: quest.status === "completed" ? "completed" : "locked",
      focusPrompt: quest.focusPrompt ?? starter?.focusPrompt ?? "Make deliberate progress on this quest.",
    } as Quest;
  });
  const resolved = resolveStatuses(quests.length ? quests : fallback.quests, null);
  const sessions = (legacy.sessions ?? []).map((session) => ({ id: session.id ?? id("session"), questId: session.questId ?? "legacy", questTitle: session.questTitle ?? "Imported focus session", campaignId: "python-developer", minutes: Math.max(1, session.minutes ?? 1), xpAwarded: session.xpAwarded ?? 0, completionRatio: session.completionRatio ?? 1, completedAt: session.completedAt ?? new Date().toISOString() }));
  const player = { ...mockPlayer, xp: legacy.xp ?? mockPlayer.xp, totalFocusMinutes: mockPlayer.totalFocusMinutes + sessions.reduce((sum, session) => sum + session.minutes, 0), streak: calculateStreak(sessions) };
  return { version: 4, player, campaigns: applyCampaignProgress(legacy.campaigns?.length ? legacy.campaigns : [{ ...activeCampaign }], resolved), activeCampaignId: legacy.activeCampaignId ?? activeCampaign.id, activeQuestId: null, quests: resolved, sessions, lastReward: null };
}

function parseData(snapshot: string): ForgeData | null {
  try {
    const candidate = JSON.parse(snapshot) as Partial<ForgeData> & Partial<LegacyData>;
    if (candidate.version === 4 && candidate.player && Array.isArray(candidate.campaigns) && candidate.campaigns.length > 0 && Array.isArray(candidate.quests) && Array.isArray(candidate.sessions)) return candidate as ForgeData;
    if (candidate.version === 3) return migrateLegacyData(candidate as LegacyData);
  } catch { /* Invalid local data falls back to starter data. */ }
  return null;
}

type ForgeState = {
  data: ForgeData;
  player: ForgeData["player"];
  activeCampaign: Campaign;
  activeQuests: Quest[];
  activeQuest: Quest | null;
  sessions: FocusSession[];
  selectQuest: (questId: string) => boolean;
  finishQuest: (questId: string, minutes: number, completionRatio: number) => RewardResult | null;
  addQuest: (draft: QuestDraft) => void;
  updateQuest: (questId: string, draft: QuestDraft) => void;
  archiveQuest: (questId: string) => void;
  deleteQuest: (questId: string) => void;
  moveQuest: (questId: string, direction: "up" | "down") => void;
  addCampaign: (draft: CampaignDraft) => void;
  setActiveCampaign: (campaignId: string) => void;
  resetProgress: () => void;
  exportData: () => string;
  importData: (serialized: string) => boolean;
};

const ForgeContext = createContext<ForgeState | null>(null);

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => defaultSnapshot);
  const data = useMemo(() => parseData(snapshot) ?? createDefaultForgeData(), [snapshot]);
  const commit = useCallback((nextData: ForgeData) => { window.localStorage.setItem(storageKey, JSON.stringify(nextData)); notify(); }, []);
  const activeCampaign = data.campaigns.find((campaign) => campaign.id === data.activeCampaignId) ?? data.campaigns[0];
  const activeQuests = data.quests.filter((quest) => quest.campaignId === activeCampaign.id && quest.status !== "archived");
  const activeQuest = data.quests.find((quest) => quest.id === data.activeQuestId) ?? null;

  const value = useMemo<ForgeState>(() => ({
    data, player: data.player, activeCampaign, activeQuests, activeQuest, sessions: data.sessions,
    selectQuest: (questId) => {
      const quest = data.quests.find((item) => item.id === questId);
      if (!quest || quest.status === "locked" || quest.status === "archived" || quest.status === "completed") return false;
      const quests = resolveStatuses(data.quests.map((item) => item.id === questId ? { ...item, status: "active" } : item), questId);
      commit({ ...data, activeQuestId: questId, quests, lastReward: null });
      return true;
    },
    finishQuest: (questId, minutes, completionRatio) => {
      const quest = data.quests.find((item) => item.id === questId);
      if (!quest || quest.status === "locked" || quest.status === "archived") return null;
      const ratio = Math.max(0, Math.min(1, completionRatio));
      const isNewCompletion = quest.status !== "completed";
      const xpGained = isNewCompletion ? Math.max(1, Math.round(quest.xpReward * ratio)) : 0;
      const statsDelta: StatRewards = isNewCompletion ? Object.fromEntries(Object.entries(quest.statRewards).map(([name, value]) => [name, Math.max(1, Math.round((value ?? 0) * ratio))])) as StatRewards : {};
      const session: FocusSession = { id: id("session"), questId: quest.id, questTitle: quest.title, campaignId: quest.campaignId, minutes: Math.max(1, Math.round(minutes)), xpAwarded: xpGained, completionRatio: ratio, completedAt: new Date().toISOString() };
      const completedQuests = data.quests.map((item) => item.id === questId ? { ...item, status: "completed" as const } : item);
      const resolvedQuests = resolveStatuses(completedQuests, null);
      const unlockedQuestIds = resolvedQuests.filter((item) => item.status === "available" && data.quests.find((prior) => prior.id === item.id)?.status === "locked").map((item) => item.id);
      let level = data.player.level;
      let xpToNextLevel = data.player.xpToNextLevel;
      const nextXP = data.player.xp + xpGained;
      while (nextXP >= xpToNextLevel) { level += 1; xpToNextLevel = nextLevelThreshold(level); }
      const nextStats = { ...data.player.stats } as PlayerStats;
      Object.entries(statsDelta).forEach(([name, value]) => { nextStats[name as keyof PlayerStats] += value ?? 0; });
      const nextSessions = [session, ...data.sessions].slice(0, 50);
      const campaigns = applyCampaignProgress(data.campaigns, resolvedQuests);
      const campaignProgress = campaigns.find((campaign) => campaign.id === quest.campaignId)?.progress ?? 0;
      const result: RewardResult = { questId, questTitle: quest.title, xpGained, focusMinutes: session.minutes, completionRatio: ratio, levelBefore: data.player.level, levelAfter: level, unlockedQuestIds, statsDelta, campaignProgress, streak: calculateStreak(nextSessions) };
      commit({ ...data, player: { ...data.player, xp: nextXP, level, xpToNextLevel, totalFocusMinutes: data.player.totalFocusMinutes + session.minutes, streak: result.streak, stats: nextStats }, campaigns, activeQuestId: null, quests: resolvedQuests, sessions: nextSessions, lastReward: result });
      return result;
    },
    addQuest: (draft) => {
      const quest: Quest = { ...draft, id: id("quest"), campaignId: activeCampaign.id, status: draft.prerequisites?.length ? "locked" : "available", prerequisites: draft.prerequisites ?? [], statRewards: draft.statRewards ?? {} };
      const quests = resolveStatuses([...data.quests, quest], data.activeQuestId);
      commit({ ...data, quests, campaigns: applyCampaignProgress(data.campaigns, quests) });
    },
    updateQuest: (questId, draft) => {
      const quests = resolveStatuses(data.quests.map((quest) => quest.id === questId ? { ...quest, ...draft } : quest), data.activeQuestId);
      commit({ ...data, quests, campaigns: applyCampaignProgress(data.campaigns, quests) });
    },
    archiveQuest: (questId) => { const quests = data.quests.map((quest) => quest.id === questId ? { ...quest, status: "archived" as const } : quest); commit({ ...data, activeQuestId: data.activeQuestId === questId ? null : data.activeQuestId, quests, campaigns: applyCampaignProgress(data.campaigns, quests) }); },
    deleteQuest: (questId) => { const quests = resolveStatuses(data.quests.filter((quest) => quest.id !== questId), data.activeQuestId === questId ? null : data.activeQuestId); commit({ ...data, activeQuestId: data.activeQuestId === questId ? null : data.activeQuestId, quests, sessions: data.sessions.filter((session) => session.questId !== questId), campaigns: applyCampaignProgress(data.campaigns, quests) }); },
    moveQuest: (questId, direction) => {
      const indexes = data.quests.map((quest, index) => ({ quest, index })).filter(({ quest }) => quest.campaignId === activeCampaign.id);
      const current = indexes.findIndex(({ quest }) => quest.id === questId); const swap = direction === "up" ? current - 1 : current + 1;
      if (current < 0 || swap < 0 || swap >= indexes.length) return;
      const quests = [...data.quests]; [quests[indexes[current].index], quests[indexes[swap].index]] = [quests[indexes[swap].index], quests[indexes[current].index]]; commit({ ...data, quests });
    },
    addCampaign: (draft) => { const campaign: Campaign = { id: id("campaign"), ...draft, progress: 0, completed: 0, total: 0, color: "from-orange-400 to-amber-200", stage: "New expedition" }; commit({ ...data, campaigns: [...data.campaigns, campaign], activeCampaignId: campaign.id, activeQuestId: null }); },
    setActiveCampaign: (campaignId) => commit({ ...data, activeCampaignId: campaignId, activeQuestId: null }),
    resetProgress: () => commit(createDefaultForgeData()),
    exportData: () => JSON.stringify(data, null, 2),
    importData: (serialized) => { const imported = parseData(serialized); if (!imported) return false; commit(imported); return true; },
  }), [activeCampaign, activeQuest, activeQuests, commit, data]);
  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge() { const context = useContext(ForgeContext); if (!context) throw new Error("useForge must be used inside ForgeProvider"); return context; }
export const campaignProgress = (quests: Quest[]) => progressFor(quests).progress;
