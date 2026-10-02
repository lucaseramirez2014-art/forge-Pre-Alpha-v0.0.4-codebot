export type QuestDifficulty = "Easy" | "Standard" | "Hard" | "Boss";
export type QuestStatus = "locked" | "available" | "active" | "completed" | "archived";
export type StatName = "Development" | "Creativity" | "Learning" | "Discipline" | "Fitness" | "Communication";
export type PlayerStats = Record<StatName, number>;

export type StatRewards = Partial<Record<StatName, number>>;

export type Quest = {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  estimatedMinutes: number;
  xpReward: number;
  status: QuestStatus;
  prerequisites: string[];
  statRewards: StatRewards;
  focusPrompt: string;
};

export type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  progress: number;
  completed: number;
  total: number;
  color: string;
  stage: string;
};

export type PlayerProfile = {
  name: string;
  title: string;
  xp: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
  totalFocusMinutes: number;
  stats: PlayerStats;
};

export type FocusSession = {
  id: string;
  questId: string;
  questTitle: string;
  campaignId: string;
  minutes: number;
  xpAwarded: number;
  completionRatio: number;
  completedAt: string;
};

export type RewardResult = {
  questId: string;
  questTitle: string;
  xpGained: number;
  focusMinutes: number;
  completionRatio: number;
  levelBefore: number;
  levelAfter: number;
  unlockedQuestIds: string[];
  statsDelta: StatRewards;
  campaignProgress: number;
  streak: number;
};

export type ForgeData = {
  version: 4;
  player: PlayerProfile;
  campaigns: Campaign[];
  activeCampaignId: string;
  activeQuestId: string | null;
  quests: Quest[];
  sessions: FocusSession[];
  lastReward: RewardResult | null;
};

export type QuestDraft = Pick<Quest, "title" | "description" | "difficulty" | "estimatedMinutes" | "xpReward" | "focusPrompt" | "statRewards" | "prerequisites">;
export type CampaignDraft = Pick<Campaign, "title" | "subtitle" | "description" | "level">;
