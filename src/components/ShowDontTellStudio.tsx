import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  BookmarkPlus,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Eye,
  Ear,
  Wind,
  HandMetal,
  Utensils,
  Rocket,
  Check,
  Plus,
  Trash2,
  Edit2,
  Shuffle,
  Wand2,
  X,
  Filter,
  FolderPlus,
  Smile,
  Star,
  AlertCircle,
} from 'lucide-react';
import { SageAvatar } from './SageAvatar';
import { STARTER_PROMPTS, DEFAULT_CATEGORIES, StarterPrompt } from '../data/prompts';
import { GuideAnalysis, SenseType, SavedSentence, SavedWord } from '../types';
import { cosmicAudio } from '../utils/audio';
import { analyzeSentence, evaluateChallenge, suggestSentencesByTopic } from '../services/geminiService';

interface ShowDontTellStudioProps {
  onAddStarEnergy: (amount: number, reason: string) => void;
  onSaveSentence: (item: Omit<SavedSentence, 'id' | 'savedAt'>) => void;
  onSaveWord: (item: Omit<SavedWord, 'id' | 'savedAt'>) => void;
}

const CUSTOM_PROMPTS_STORAGE_KEY = 'cosmic_student_custom_prompts_v1';
const QUICK_EMOJIS = ['✨', '🌟', '🎨', '🚀', '🐱', '🐶', '🌸', '🌳', '🌈', '☀️', '🌧️', '📚', '🎒', '🚲', '🍲', '🍦', '💖', '🎵'];

const SENSE_OPTIONS: { id: SenseType; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'Thị giác', label: 'Thị Giác', icon: Eye, color: 'text-sky-600 bg-sky-50 border-sky-200', desc: 'Mắt nhìn màu sắc, ánh sáng, chuyển động' },
  { id: 'Thính giác', label: 'Thính Giác', icon: Ear, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Tai nghe âm thanh rộn ràng, tí tách' },
  { id: 'Khứu giác', label: 'Khứu Giác', icon: Wind, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Mũi ngửi hương thơm thoang thoảng' },
  { id: 'Xúc giác', label: 'Xúc Giác', icon: HandMetal, color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Da chạm cảm giác mát lạnh, êm ái' },
  { id: 'Vị giác', label: 'Vị Giác', icon: Utensils, color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Lưỡi nếm vị ngọt ngào, thơm lừng' },
];

export const ShowDontTellStudio: React.FC<ShowDontTellStudioProps> = ({
  onAddStarEnergy,
  onSaveSentence,
  onSaveWord,
}) => {
  const [inputSentence, setInputSentence] = useState<string>('Trời mưa to.');
  const [selectedSense, setSelectedSense] = useState<SenseType | ''>('Thính giác');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GuideAnalysis | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Custom Student Prompts & Categories state
  const [customPrompts, setCustomPrompts] = useState<StarterPrompt[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_PROMPTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Modal Add / Edit Custom Prompt
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<string>('Chủ đề của em');
  const [formSentence, setFormSentence] = useState<string>('');
  const [formSense, setFormSense] = useState<SenseType>('Thị giác');
  const [formEmoji, setFormEmoji] = useState<string>('🌟');
  const [formError, setFormError] = useState<string>('');

  // AI Topic suggestion panel
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(false);
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [isSearchingTopic, setIsSearchingTopic] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<StarterPrompt[]>([]);

  // Star challenge interactive state
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [isEvaluatingChallenge, setIsEvaluatingChallenge] = useState<boolean>(false);
  const [challengeFeedback, setChallengeFeedback] = useState<{
    praise: string;
    whyItShines: string;
    energyAwarded: number;
    badgeUnlocked?: string;
  } | null>(null);

  const [savedSentenceIndices, setSavedSentenceIndices] = useState<number[]>([]);
  const [savedWordIndices, setSavedWordIndices] = useState<number[]>([]);
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);

  // Save custom prompts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PROMPTS_STORAGE_KEY, JSON.stringify(customPrompts));
    } catch {
      // ignore
    }
  }, [customPrompts]);

  // Combine custom prompts and default prompts
  const allPrompts = useMemo(() => {
    return [...customPrompts, ...STARTER_PROMPTS];
  }, [customPrompts]);

  // Categories list
  const allCategories = useMemo(() => {
    const list: string[] = ['Tất cả'];
    if (customPrompts.length > 0) {
      list.push('Của riêng em');
    }
    DEFAULT_CATEGORIES.forEach((cat) => {
      if (cat !== 'Tất cả' && cat !== 'Của riêng em' && !list.includes(cat)) {
        list.push(cat);
      }
    });
    customPrompts.forEach((p) => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [customPrompts]);

  // Filtered prompts based on selected category
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'Tất cả') return allPrompts;
    if (selectedCategory === 'Của riêng em') return customPrompts;
    return allPrompts.filter((p) => p.category === selectedCategory);
  }, [allPrompts, customPrompts, selectedCategory]);

  const handleSelectStarter = (sentence: string, sense: SenseType) => {
    setInputSentence(sentence);
    setSelectedSense(sense);
    cosmicAudio.playStarChime();
  };

  // Open modal to add new custom sentence
  const handleOpenAddModal = (presetCategory?: string, presetSentence?: string) => {
    setEditingPromptId(null);
    setFormCategory(presetCategory || (selectedCategory !== 'Tất cả' && selectedCategory !== 'Của riêng em' ? selectedCategory : 'Chủ đề của em'));
    setFormSentence(presetSentence || '');
    setFormSense('Thị giác');
    setFormEmoji('🌟');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal to edit existing custom sentence
  const handleOpenEditModal = (prompt: StarterPrompt) => {
    setEditingPromptId(prompt.id);
    setFormCategory(prompt.category);
    setFormSentence(prompt.simpleSentence);
    setFormSense(prompt.recommendedSense);
    setFormEmoji(prompt.emoji);
    setFormError('');
    setIsModalOpen(true);
  };

  // Save (add or edit) custom prompt
  const handleSavePrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formSentence.trim()) {
      setFormError('Con hãy nhập một câu văn ngắn nhé!');
      return;
    }
    if (!formCategory.trim()) {
      setFormError('Con hãy đặt tên cho chủ đề nhé!');
      return;
    }

    if (editingPromptId) {
      // Update existing
      setCustomPrompts((prev) =>
        prev.map((item) =>
          item.id === editingPromptId
            ? {
                ...item,
                category: formCategory.trim(),
                simpleSentence: formSentence.trim(),
                recommendedSense: formSense,
                emoji: formEmoji,
              }
            : item
        )
      );
      cosmicAudio.playStarChime();
    } else {
      // Add new
      const newPrompt: StarterPrompt = {
        id: 'custom-' + Date.now(),
        category: formCategory.trim(),
        simpleSentence: formSentence.trim(),
        recommendedSense: formSense,
        planet: 'Không gian',
        emoji: formEmoji,
        isCustom: true,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };
      setCustomPrompts((prev) => [newPrompt, ...prev]);
      onAddStarEnergy(10, 'Tạo câu văn & chủ đề mới');
      cosmicAudio.playSuccessFanfare();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'],
      });
    }

    setIsModalOpen(false);
  };

  // Delete custom prompt
  const handleDeleteCustomPrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPrompts((prev) => prev.filter((p) => p.id !== id));
    cosmicAudio.playStarChime();
  };

  // Random pick
  const handleRandomPick = () => {
    const pool = filteredPrompts.length > 0 ? filteredPrompts : allPrompts;
    if (pool.length === 0) return;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    handleSelectStarter(randomItem.simpleSentence, randomItem.recommendedSense);
  };

  // Search/Suggest topic with AI
  const handleSearchTopicSuggestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTopic.trim()) return;

    setIsSearchingTopic(true);
    setApiError(null);
    try {
      const suggestions = await suggestSentencesByTopic(searchTopic.trim());
      setAiSuggestions(suggestions);
      cosmicAudio.playStarChime();
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || String(err));
      // Fallback
      setAiSuggestions([
        {
          id: 'suggest-fallback-' + Date.now(),
          category: searchTopic.trim(),
          simpleSentence: `${searchTopic.trim()} gợi cho em nhiều cảm xúc đẹp.`,
          recommendedSense: 'Thị giác',
          planet: 'Không gian',
          emoji: '✨',
        },
      ]);
    } finally {
      setIsSearchingTopic(false);
    }
  };

  // Use AI suggested sentence directly
  const handleUseAiSuggestion = (item: StarterPrompt) => {
    handleSelectStarter(item.simpleSentence, item.recommendedSense);
  };

  // Save AI suggested sentence to student's custom list
  const handleSaveAiSuggestionToCustom = (item: StarterPrompt) => {
    const newPrompt: StarterPrompt = {
      ...item,
      id: 'custom-' + Date.now(),
      isCustom: true,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setCustomPrompts((prev) => [newPrompt, ...prev]);
    onAddStarEnergy(5, 'Lưu câu gợi ý vào bộ sưu tập');
    cosmicAudio.playStarChime();
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputSentence.trim()) return;

    setIsLoading(true);
    setApiError(null);
    setAnalysisResult(null);
    setChallengeFeedback(null);
    setChallengeAnswer('');
    setSavedSentenceIndices([]);
    setSavedWordIndices([]);
    cosmicAudio.playRocketLaunch();

    try {
      const data = await analyzeSentence(
        inputSentence.trim(),
        selectedSense || undefined
      );
      setAnalysisResult(data);
      cosmicAudio.playStarChime();
      onAddStarEnergy(10, 'Khám phá câu chữ mới');
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if (isReadingAloud) {
      cosmicAudio.stopSpeaking();
      setIsReadingAloud(false);
    } else {
      setIsReadingAloud(true);
      cosmicAudio.speakVietnamese(text, () => setIsReadingAloud(false));
    }
  };

  const handleSaveUpgrade = (optionIndex: number) => {
    if (!analysisResult) return;
    const option = analysisResult.upgradeOptions[optionIndex];
    if (!option) return;

    onSaveSentence({
      original: analysisResult.originalSentence,
      upgraded: option.sentence,
      technique: option.technique,
      senses: option.sensesUsed,
    });

    setSavedSentenceIndices((prev) => [...prev, optionIndex]);
    cosmicAudio.playStarChime();
    onAddStarEnergy(5, 'Lưu câu văn vào Sổ Tay Tinh Tú');
  };

  const handleSaveVocab = (wordIndex: number) => {
    if (!analysisResult) return;
    const item = analysisResult.magicVocabularyBag[wordIndex];
    if (!item) return;

    onSaveWord({
      word: item.word,
      meaning: item.meaning,
      example: item.example,
      planet: item.planet,
    });

    setSavedWordIndices((prev) => [...prev, wordIndex]);
    cosmicAudio.playStarChime();
    onAddStarEnergy(5, 'Thu thập từ ngữ mới');
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeAnswer.trim() || !analysisResult) return;

    setIsEvaluatingChallenge(true);
    setApiError(null);
    try {
      const result = await evaluateChallenge(
        analysisResult.starChallenge.quest,
        analysisResult.originalSentence,
        challengeAnswer.trim()
      );
      setChallengeFeedback(result);
      cosmicAudio.playSuccessFanfare();
      onAddStarEnergy(result.energyAwarded || 15, 'Hoàn thành Thử Thách Tinh Tú');

      // Trigger starry confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f472b6', '#38bdf8', '#fbbf24', '#a855f7'],
      });
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || String(err));
    } finally {
      setIsEvaluatingChallenge(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 space-y-6">
      {/* Introduction Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-100 via-purple-100 to-teal-100 p-5 sm:p-6 border border-pink-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <SageAvatar mood={isLoading ? 'thinking' : 'greeting'} size="lg" className="shrink-0" />
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-pink-700 mb-2 border border-pink-200">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              Xưởng Chế Tác Câu Chữ (Show, Don't Tell)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Biến câu văn đơn giản thành bức tranh biết nói!
            </h2>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl">
              Thay vì chỉ <strong className="text-pink-700">kể (Tell)</strong>: <em>"Trời mưa to"</em>, 
              Người Dẫn Đường sẽ mách bạn cách <strong className="text-teal-700">gợi tả (Show)</strong> bằng màu sắc, âm thanh, xúc giác để người đọc như đang đứng dưới màn mưa mát rượi!
            </p>
          </div>
        </div>
      </div>

      {/* Starter Prompts & Student Custom Hub */}
      <div className="space-y-3 bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        {/* Hub Header & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-100 text-pink-700 text-sm font-bold">
                🎯
              </span>
              <h3 className="text-base font-bold text-slate-800">
                Chủ Đề & Câu Văn Của Nhà Thám Hiểm
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn câu mẫu có sẵn hoặc tự tạo chủ đề theo bài tập làm văn của con
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Random Pick Button */}
            <button
              type="button"
              onClick={handleRandomPick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs active:scale-95"
              title="Bốc ngẫu nhiên một câu văn"
            >
              <Shuffle className="h-3.5 w-3.5 text-amber-600" />
              <span>Đổi ngẫu nhiên 🎲</span>
            </button>

            {/* AI Topic Suggestion Button */}
            <button
              type="button"
              onClick={() => setIsSuggestOpen(!isSuggestOpen)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                isSuggestOpen
                  ? 'bg-sky-500 border-sky-600 text-white'
                  : 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100'
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Gợi ý theo chủ đề ✨</span>
            </button>

            {/* Add Custom Sentence Button */}
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Thêm câu của em</span>
            </button>
          </div>
        </div>

        {/* AI Topic Suggestion Panel (Collapsible) */}
        {isSuggestOpen && (
          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-pink-50/40 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span>Người Dẫn Đường gợi ý câu văn theo bất kỳ chủ đề nào con cần:</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSuggestOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSearchTopicSuggestions} className="flex gap-2">
              <input
                type="text"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                placeholder="Nhập chủ đề con muốn viết (Ví dụ: Cây phượng vĩ, Buổi sáng trên biển, Bà ngoại, Chú mèo mướp...)"
                className="flex-1 rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                type="submit"
                disabled={isSearchingTopic || !searchTopic.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-50 transition-all shrink-0 active:scale-95"
              >
                {isSearchingTopic ? (
                  <>
                    <Rocket className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang tìm ý...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Gợi ý ngay ✨</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Suggested Results */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                  Ý tưởng Người Dẫn Đường dành tặng con:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {aiSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl bg-white border border-sky-200 p-3 shadow-2xs hover:border-sky-300 transition-all space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl shrink-0">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md mb-1">
                            {item.recommendedSense}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 leading-snug">
                            "{item.simpleSentence}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-sky-100 text-xs">
                        <button
                          type="button"
                          onClick={() => handleUseAiSuggestion(item)}
                          className="font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                        >
                          <Rocket className="h-3 w-3" />
                          <span>Dùng câu này</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAiSuggestionToCustom(item)}
                          className="text-[11px] font-medium text-pink-700 hover:text-pink-900 inline-flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200"
                        >
                          <BookmarkPlus className="h-3 w-3" />
                          <span>Lưu (+5⭐)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <div className="flex items-center gap-1 text-slate-400 pl-1 pr-1 shrink-0 text-xs font-bold">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lọc:</span>
          </div>
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'Tất cả'
                ? allPrompts.length
                : cat === 'Của riêng em'
                ? customPrompts.length
                : allPrompts.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-pink-600 text-white shadow-xs ring-2 ring-pink-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {cat === 'Của riêng em' && <Star className="h-3 w-3 fill-amber-300 text-amber-300" />}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sentence Cards Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
            {filteredPrompts.map((prompt) => {
              const isSelected = inputSentence === prompt.simpleSentence;
              return (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectStarter(prompt.simpleSentence, prompt.recommendedSense)}
                  className={`group relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-pink-50/90 border-pink-400 ring-2 ring-pink-200 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-pink-300 hover:bg-slate-50/80 hover:shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{prompt.emoji}</span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {prompt.category}
                        </span>
                      </div>

                      {/* Custom prompt indicators & actions */}
                      {prompt.isCustom ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                            Của em
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(prompt);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                            title="Sửa câu này"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomPrompt(prompt.id, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa câu này"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md">
                          {prompt.recommendedSense}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug line-clamp-2">
                      {prompt.simpleSentence}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-400 group-hover:text-pink-600 transition-colors">
                    <span>Chạm để chế tác</span>
                    {isSelected ? (
                      <span className="text-pink-600 font-bold flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Đang chọn
                      </span>
                    ) : (
                      <span>→</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
            <span className="text-3xl">🌟</span>
            <h4 className="text-sm font-bold text-slate-700">Chưa có câu văn nào trong mục này!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Con có thể tự tạo câu văn và chủ đề của riêng con, hoặc dùng tính năng gợi ý theo chủ đề nhé!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleOpenAddModal(selectedCategory !== 'Của riêng em' ? selectedCategory : 'Chủ đề của em')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-pink-700 transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tạo câu văn đầu tiên (+10⭐)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Workbench */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Câu văn con muốn nâng cấp hôm nay:</span>
            <span className="text-xs font-normal text-slate-400">
              {inputSentence.trim().split(/\s+/).filter(Boolean).length} từ
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={inputSentence}
              onChange={(e) => setInputSentence(e.target.value)}
              placeholder="Nhập một câu văn bất kỳ con vừa nghĩ ra... (Ví dụ: Con mèo đang ngủ, Em rất vui, Cánh đồng lúa chín vàng...)"
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-base sm:text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:ring-3 focus:ring-pink-100 transition-all resize-none"
            />
          </div>
        </div>

        {/* 5 Senses selector - Nhiệm vụ ngũ giác */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Nhiệm vụ ngũ giác (Chọn một giác quan con muốn thêm vào câu văn):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {SENSE_OPTIONS.map((sense) => {
              const Icon = sense.icon;
              const isSelected = selectedSense === sense.id;
              return (
                <button
                  key={sense.id}
                  type="button"
                  onClick={() => setSelectedSense(isSelected ? '' : sense.id)}
                  className={`flex flex-col items-start p-2.5 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? `${sense.color} ring-2 ring-offset-1 font-bold shadow-xs`
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">{sense.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{sense.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !inputSentence.trim()}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 px-6 py-3 font-bold text-white shadow-md shadow-pink-200 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all cursor-pointer text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <Rocket className="h-5 w-5 animate-bounce" />
                <span>Người Dẫn Đường Đang Bay Đến...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Phóng Tàu Khám Phá Câu Chữ! 🚀</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert if all models fail / API error */}
      {apiError && (
        <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/95 p-5 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-rose-700 text-base">Đã dừng do lỗi</span>
                <span className="text-xs bg-rose-200/80 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
                  Thất bại khi gọi AI
                </span>
              </div>
              <p className="font-mono text-xs text-rose-700 bg-white/90 p-3 rounded-xl border border-rose-200 break-all select-all">
                {apiError}
              </p>
              <p className="text-xs text-rose-600">
                ⚠️ Con hoặc Thầy/Cô hãy kiểm tra lại API Key ở nút cài đặt góc trên bên phải hoặc đổi model khác để tiếp tục hành trình nhé!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result (Formatted strictly according to 5 guidelines) */}
      {analysisResult && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Section 1: Lời chào du hành & Avatar */}
          <div className="rounded-3xl bg-gradient-to-tr from-pink-50 via-purple-50 to-teal-50 border border-pink-200/90 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <SageAvatar mood="sparkle" size="md" className="shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-pink-700">
                    ✨ 1. Lời Chào Du Hành
                  </span>
                  <button
                    onClick={() => handleReadAloud(`${analysisResult.greeting}. ${analysisResult.analysis}`)}
                    className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                    title="Nghe Người Dẫn Đường đọc"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-pink-500" />
                    <span>{isReadingAloud ? 'Dừng đọc' : 'Nghe giọng nói'}</span>
                  </button>
                </div>
                <p className="text-base font-semibold text-pink-900 leading-snug">
                  {analysisResult.greeting}
                </p>
                {/* Section 2: Trạm phân tích (Phản hồi hiện tại) */}
                <div className="rounded-2xl bg-white/80 p-3.5 border border-pink-100 text-sm text-slate-700 leading-relaxed">
                  <div className="font-bold text-purple-800 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    2. Trạm Phân Tích (Điểm sáng trong câu văn của con)
                  </div>
                  {analysisResult.analysis}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Phép thuật biến hóa (Gợi ý chỉnh sửa Show, Don't Tell) */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                  🪄 3. Phép Thuật Biến Hóa (Show, Don't Tell & Tu Từ)
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  Hai cách nâng cấp câu văn lấp lánh như sao
                </h3>
              </div>
            </div>

            {/* Original Sentence badge */}
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0 text-xs">
                Nguyên bản:
              </span>
              <span className="italic font-medium text-slate-800">"{analysisResult.originalSentence}"</span>
            </div>

            {/* 2 Upgrade Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {analysisResult.upgradeOptions.map((opt, idx) => {
                const isSaved = savedSentenceIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col justify-between rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/50 via-white to-pink-50/30 p-4 hover:shadow-md transition-shadow space-y-3"
                  >
                    <div>
                      {/* Technique Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded-full bg-teal-100/90 text-teal-800 px-2.5 py-0.5 text-xs font-bold">
                          Phương án {idx + 1}: {opt.technique}
                        </span>
                      </div>

                      {/* Upgraded Sentence */}
                      <p className="text-base font-semibold text-slate-800 leading-relaxed">
                        "{opt.sentence}"
                      </p>

                      {/* Senses used */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[11px] font-bold text-slate-400">Giác quan:</span>
                        {opt.sensesUsed.map((sense, sIdx) => (
                          <span
                            key={sIdx}
                            className="rounded-full bg-white border border-teal-200 px-2 py-0.5 text-[11px] font-medium text-teal-700 shadow-2xs"
                          >
                            {sense}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-teal-100">
                      <button
                        onClick={() => handleReadAloud(opt.sentence)}
                        className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Nghe câu này</span>
                      </button>

                      <button
                        onClick={() => handleSaveUpgrade(idx)}
                        disabled={isSaved}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          isSaved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs active:scale-95'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Đã lưu vào sổ</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="h-3.5 w-3.5" />
                            <span>Lưu câu này (+5⭐)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mẹo nhỏ từ Người Dẫn Đường */}
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50/90 border border-amber-200 p-3.5 text-sm text-amber-900">
              <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-800 text-xs uppercase tracking-wider block mb-0.5">
                  💡 Mẹo nhỏ từ Người Dẫn Đường:
                </span>
                <p className="leading-relaxed">{analysisResult.sageTip}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Túi thần kỳ từ vựng (Synonym & Planet Lexicon) */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                🎒 4. Túi Thần Kỳ Từ Vựng
              </span>
              <span className="text-xs text-slate-500">Chạm vào từ để lưu lại và nạp thêm sao</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {analysisResult.magicVocabularyBag.map((item, idx) => {
                const isSaved = savedWordIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-2xl border border-purple-100 bg-purple-50/40 p-3.5 hover:bg-purple-50 hover:border-purple-300 transition-all space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-base font-bold text-purple-900">{item.word}</h4>
                        <span className="text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700 px-2 py-0.5">
                          {item.planet}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.meaning}</p>
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-white/70 p-1.5 rounded-lg border border-purple-100">
                        Ví dụ: "{item.example}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleSaveVocab(idx)}
                      disabled={isSaved}
                      className={`w-full flex items-center justify-center gap-1 rounded-xl py-1 text-xs font-bold transition-all ${
                        isSaved
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-white hover:bg-purple-100 border border-purple-200 text-purple-700'
                      }`}
                    >
                      {isSaved ? <Check className="h-3 w-3" /> : <BookmarkPlus className="h-3 w-3" />}
                      <span>{isSaved ? 'Đã thu thập' : 'Thu thập (+5⭐)'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Thử thách tinh tú (Interactive Mini Quest) */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-bold">
                ⭐ 5. Thử Thách Tinh Tú
              </span>
              <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                +{analysisResult.starChallenge.rewardEnergy} Năng Lượng Ngôn Từ
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white font-bold text-lg shadow-sm">
                🎯
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">
                  {analysisResult.starChallenge.quest}
                </p>
                <p className="text-xs text-amber-700 italic">
                  Gợi ý từ Người Dẫn Đường: {analysisResult.starChallenge.hint}
                </p>
              </div>
            </div>

            {/* Interactive submission */}
            {!challengeFeedback ? (
              <form onSubmit={handleSubmitChallenge} className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                    placeholder="Viết tiếp hoặc thử thêm chi tiết vào đây con nhé..."
                    className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isEvaluatingChallenge || !challengeAnswer.trim()}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                  >
                    {isEvaluatingChallenge ? (
                      <span>Đang chấm điểm...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Nộp Bài Nhận Sao! ⭐</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl bg-white/90 border border-amber-300 p-4 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>{challengeFeedback.praise}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {challengeFeedback.whyItShines}
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs font-bold text-amber-800">
                  <span className="rounded-full bg-amber-100 px-3 py-1">
                    +{challengeFeedback.energyAwarded} Năng Lượng Ngôn Từ đã được nạp!
                  </span>
                  {challengeFeedback.badgeUnlocked && (
                    <span className="rounded-full bg-purple-100 text-purple-800 px-3 py-1">
                      Huy hiệu: {challengeFeedback.badgeUnlocked}
                    </span>
                  )}
                </div>
              </div>
            )}
      {/* Add / Edit Student Prompt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-pink-200 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white font-bold text-sm shadow-xs">
                  {formEmoji || '🌟'}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    {editingPromptId ? 'Chỉnh Sửa Câu Văn Của Con' : 'Thêm Câu Văn & Chủ Đề Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPromptId
                      ? 'Cập nhật lại câu chữ hoặc chủ đề con muốn thay đổi'
                      : 'Tạo riêng câu văn của bài tập hôm nay vào xưởng'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePrompt} className="space-y-4">
              {/* Field 1: Topic / Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Tên chủ đề của bài học:
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Ví dụ: Cây phượng vĩ, Chú cún vàng, Mẹ của em, Kỷ niệm mùa hè..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                />

                {/* Quick Topic Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-400">Gợi ý chọn nhanh:</span>
                  {['Thiên nhiên', 'Động vật', 'Gia đình', 'Trường lớp', 'Cảm xúc', 'Đồ vật & Kỷ niệm'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormCategory(preset)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                        formCategory === preset
                          ? 'bg-pink-100 border-pink-300 text-pink-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Sentence input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Câu văn khởi đầu của con:
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formSentence.trim().split(/\s+/).filter(Boolean).length} từ
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formSentence}
                  onChange={(e) => {
                    setFormSentence(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Gõ câu văn ngắn con vừa nghĩ ra... (Ví dụ: Em rất nhớ quê ngoại, Cây bàng rụng lá, Chú mèo chạy quanh sân...)"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>

              {/* Field 3: Recommended Sense */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Giác quan con muốn ưu tiên thêm vào câu:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SENSE_OPTIONS.map((sense) => {
                    const Icon = sense.icon;
                    const isSelected = formSense === sense.id;
                    return (
                      <button
                        key={sense.id}
                        type="button"
                        onClick={() => setFormSense(sense.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${sense.color} ring-2 ring-pink-300 font-bold shadow-2xs`
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs">{sense.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 4: Choose Emoji */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Chọn biểu tượng yêu thích:
                </label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormEmoji(emoji)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                        formEmoji === emoji
                          ? 'bg-white ring-2 ring-pink-400 shadow-xs scale-110'
                          : 'hover:bg-white/80'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700">
                  ⚠️ {formError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-95 transition-all"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  <span>{editingPromptId ? 'Lưu Thay Đổi' : 'Lưu Vào Xưởng (+10⭐)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
