export type PlanetType = 'Không gian' | 'Tâm trạng' | 'Hành động' | 'Thời tiết';

export type SenseType = 'Thị giác' | 'Thính giác' | 'Khứu giác' | 'Xúc giác' | 'Vị giác';

export interface UpgradeOption {
  sentence: string;
  technique: string;
  sensesUsed: string[];
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  example: string;
  planet: PlanetType | string;
}

export interface StarChallenge {
  quest: string;
  rewardEnergy: number;
  hint: string;
}

export interface GuideAnalysis {
  greeting: string;
  analysis: string;
  originalSentence: string;
  upgradeOptions: UpgradeOption[];
  sageTip: string;
  magicVocabularyBag: VocabularyItem[];
  starChallenge: StarChallenge;
}

export interface SpeechRefineResult {
  original: string;
  cleaned: string;
  poeticVersion: string;
  changes: string[];
  encouragement: string;
  energyEarned: number;
}

export interface OrbitWord {
  word: string;
  level: string;
  explanation: string;
  sampleSentence: string;
}

export interface MindMapData {
  rootWord: string;
  planet: string;
  nearOrbit: OrbitWord[];
  midOrbit: OrbitWord[];
  outerOrbit: OrbitWord[];
}

export interface SavedWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  planet: string;
  savedAt: string;
}

export interface SavedSentence {
  id: string;
  original: string;
  upgraded: string;
  technique: string;
  senses: string[];
  savedAt: string;
}

export interface ExplorerProfile {
  name: string;
  starEnergy: number;
  streakDays: number;
  rankTitle: string;
  unlockedBadges: string[];
  savedWords: SavedWord[];
  savedSentences: SavedSentence[];
}

export type GeminiModelId =
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-preview'
  | 'gemini-2.5-flash';

export interface AiModelOption {
  id: GeminiModelId;
  name: string;
  tag: string;
  desc: string;
  badge: string;
  isDefault?: boolean;
}

export interface AiSettings {
  apiKey: string;
  selectedModel: GeminiModelId;
}

