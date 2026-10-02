import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Volume2,
  BookmarkPlus,
  Search,
  Check,
  Globe2,
  Orbit,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { PLANETS_INFO, PRESET_MINDMAPS } from '../data/planets';
import { PlanetType, MindMapData, SavedWord } from '../types';
import { cosmicAudio } from '../utils/audio';
import { expandMindmap } from '../services/geminiService';

interface VocabPlanetMapProps {
  onAddStarEnergy: (amount: number, reason: string) => void;
  onSaveWord: (item: Omit<SavedWord, 'id' | 'savedAt'>) => void;
}

export const VocabPlanetMap: React.FC<VocabPlanetMapProps> = ({
  onAddStarEnergy,
  onSaveWord,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetType>('Tâm trạng');
  const [selectedWord, setSelectedWord] = useState<string>('Vui vẻ');
  const [customWordInput, setCustomWordInput] = useState<string>('');
  const [mindmapData, setMindmapData] = useState<MindMapData>(PRESET_MINDMAPS['Vui vẻ']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [activeOrbitTab, setActiveOrbitTab] = useState<'all' | 'near' | 'mid' | 'outer'>('all');

  const planet = PLANETS_INFO[selectedPlanet];

  const handleSelectRootWord = (word: string, planetType?: PlanetType) => {
    setSelectedWord(word);
    if (planetType) setSelectedPlanet(planetType);

    if (PRESET_MINDMAPS[word]) {
      setMindmapData(PRESET_MINDMAPS[word]);
      setApiError(null);
      cosmicAudio.playStarChime();
    } else {
      handleExpandWord(word, planetType || selectedPlanet);
    }
  };

  const handleExpandWord = async (wordToExpand: string, targetPlanet: PlanetType) => {
    if (!wordToExpand.trim()) return;
    setIsLoading(true);
    setApiError(null);
    cosmicAudio.playRocketLaunch();

    try {
      const data = await expandMindmap(wordToExpand.trim(), targetPlanet);
      setMindmapData(data);
      setSelectedWord(wordToExpand);
      cosmicAudio.playStarChime();
      onAddStarEnergy(5, `Mở rộng Bản đồ từ vựng: ${wordToExpand}`);
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWordInput.trim()) return;
    handleExpandWord(customWordInput.trim(), selectedPlanet);
    setCustomWordInput('');
  };

  const handleSaveOrbitWord = (word: string, explanation: string, sampleSentence: string) => {
    onSaveWord({
      word,
      meaning: explanation,
      example: sampleSentence,
      planet: selectedPlanet,
    });
    setSavedWords((prev) => [...prev, word]);
    cosmicAudio.playStarChime();
    onAddStarEnergy(5, `Thu thập từ vựng tinh tú: ${word}`);
  };

  const handlePronounce = (text: string) => {
    cosmicAudio.speakVietnamese(text);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-100 to-sky-100 p-5 sm:p-6 border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              Bản Đồ Tư Duy Từ Vựng Đa Vũ Trụ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Khám phá 4 Hành Tinh Từ Ngữ Diệu Kỳ
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Tạm biệt các từ lặp lại nhàm chán! Hãy đưa câu chữ bay từ{' '}
              <strong className="text-emerald-700">"Hành tinh gần"</strong> (từ quen thuộc) đến{' '}
              <strong className="text-purple-700">"Hành tinh xa xôi"</strong> (từ ngữ văn chương tinh tế, lấp lánh như sao).
            </p>
          </div>

          <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 shadow-sm border border-emerald-200 text-3xl">
            🪐
          </div>
        </div>
      </div>

      {/* 4 Themed Planets Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(PLANETS_INFO) as PlanetType[]).map((planetKey) => {
          const item = PLANETS_INFO[planetKey];
          const isSelected = selectedPlanet === planetKey;
          return (
            <button
              key={planetKey}
              onClick={() => {
                setSelectedPlanet(planetKey);
                cosmicAudio.playStarChime();
                // If this planet has a preset word, select the first one
                if (item.sampleWords.length > 0) {
                  const firstWord = item.sampleWords[0];
                  if (PRESET_MINDMAPS[firstWord]) {
                    setMindmapData(PRESET_MINDMAPS[firstWord]);
                    setSelectedWord(firstWord);
                  }
                }
              }}
              className={`p-3.5 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? `${item.colorScheme.bgLight} ${item.colorScheme.border} ring-2 ring-emerald-300 shadow-sm`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {item.emoji}
                </span>
                <span
                  className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${item.colorScheme.badgeBg} ${item.colorScheme.badgeText}`}
                >
                  {planetKey}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                {item.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {item.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Word Bubbles & Custom AI Word Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick word tags for this planet */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 mr-1">Từ mẫu ở {selectedPlanet}:</span>
            {planet.sampleWords.map((sample) => (
              <button
                key={sample}
                onClick={() => handleSelectRootWord(sample, selectedPlanet)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  selectedWord === sample
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                }`}
              >
                {sample}
              </button>
            ))}
          </div>

          {/* AI Search Custom Word */}
          <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5 w-full sm:w-72">
            <div className="relative flex-1">
              <input
                type="text"
                value={customWordInput}
                onChange={(e) => setCustomWordInput(e.target.value)}
                placeholder="Tra từ bất kỳ (VD: buồn, hoa, cười)..."
                className="w-full rounded-2xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customWordInput.trim()}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              Mở Rộng
            </button>
          </form>
        </div>

        {/* Orbit Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Orbit className="h-3.5 w-3.5" />
            Quỹ đạo:
          </span>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveOrbitTab('all')}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                activeOrbitTab === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả các quỹ đạo
            </button>
            <button
              onClick={() => setActiveOrbitTab('near')}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                activeOrbitTab === 'near'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              🟢 Hành tinh gần (Cơ bản)
            </button>
            <button
              onClick={() => setActiveOrbitTab('mid')}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                activeOrbitTab === 'mid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              🟣 Quỹ đạo giữa (Gợi cảm)
            </button>
            <button
              onClick={() => setActiveOrbitTab('outer')}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                activeOrbitTab === 'outer'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              ✨ Hành tinh xa xôi (Văn chương)
            </button>
          </div>
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
                  Thất bại khi mở rộng bản đồ
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

      {/* Interactive Orbital Mind Map Diagram */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
        {/* Ambient star dust effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/10 via-teal-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Center Solar Core (Root Word) */}
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-teal-300 font-bold">
              {planet.name} • {mindmapData.planet}
            </span>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 backdrop-blur-md px-6 py-3 border border-white/20 shadow-lg">
              <span className="text-3xl animate-bounce">🪐</span>
              <div className="text-left">
                <p className="text-xs text-slate-300 font-medium">Từ gốc đang thám hiểm:</p>
                <h3 className="text-2xl font-black text-amber-300 tracking-wide">
                  "{mindmapData.rootWord}"
                </h3>
              </div>
              <button
                onClick={() => handlePronounce(mindmapData.rootWord)}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                title="Nghe phát âm"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3 Orbit Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1: Hành Tinh Gần */}
            {(activeOrbitTab === 'all' || activeOrbitTab === 'near') && (
              <div className="rounded-3xl bg-slate-800/80 border border-teal-500/30 p-4 space-y-3 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
                    <h4 className="text-sm font-bold text-teal-300">
                      Hành Tinh Gần (Cơ bản)
                    </h4>
                  </div>
                  <span className="text-[10px] text-teal-200/70">Quen thuộc, dễ dùng</span>
                </div>

                <div className="space-y-2.5">
                  {mindmapData.nearOrbit.map((item, idx) => {
                    const isSaved = savedWords.includes(item.word);
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-teal-200">{item.word}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePronounce(item.word)}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleSaveOrbitWord(item.word, item.explanation, item.sampleSentence)}
                              disabled={isSaved}
                              className={`p-1 rounded-md text-xs font-bold transition-colors ${
                                isSaved ? 'text-emerald-400' : 'text-teal-300 hover:text-white'
                              }`}
                              title="Lưu vào sổ tay"
                            >
                              {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">{item.explanation}</p>
                        <p className="text-[11px] text-teal-300/80 italic bg-black/20 p-2 rounded-xl">
                          "{item.sampleSentence}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Level 2: Quỹ Đạo Giữa */}
            {(activeOrbitTab === 'all' || activeOrbitTab === 'mid') && (
              <div className="rounded-3xl bg-slate-800/80 border border-indigo-500/30 p-4 space-y-3 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-indigo-300">
                      Quỹ Đạo Giữa (Gợi Cảm)
                    </h4>
                  </div>
                  <span className="text-[10px] text-indigo-200/70">Biểu cảm, giàu hình ảnh</span>
                </div>

                <div className="space-y-2.5">
                  {mindmapData.midOrbit.map((item, idx) => {
                    const isSaved = savedWords.includes(item.word);
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-indigo-200">{item.word}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePronounce(item.word)}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleSaveOrbitWord(item.word, item.explanation, item.sampleSentence)}
                              disabled={isSaved}
                              className={`p-1 rounded-md text-xs font-bold transition-colors ${
                                isSaved ? 'text-emerald-400' : 'text-indigo-300 hover:text-white'
                              }`}
                              title="Lưu vào sổ tay"
                            >
                              {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">{item.explanation}</p>
                        <p className="text-[11px] text-indigo-300/80 italic bg-black/20 p-2 rounded-xl">
                          "{item.sampleSentence}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Level 3: Hành Tinh Xa Xôi */}
            {(activeOrbitTab === 'all' || activeOrbitTab === 'outer') && (
              <div className="rounded-3xl bg-gradient-to-b from-purple-950/80 to-slate-900 border border-purple-500/40 p-4 space-y-3 backdrop-blur-sm shadow-inner">
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
                    <h4 className="text-sm font-bold text-amber-300">
                      Hành Tinh Xa Xôi (Văn Chương)
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-200/70">Tinh tế, diệu kỳ</span>
                </div>

                <div className="space-y-2.5">
                  {mindmapData.outerOrbit.map((item, idx) => {
                    const isSaved = savedWords.includes(item.word);
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-purple-900/30 border border-purple-400/30 p-3 hover:bg-purple-900/50 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-amber-200">{item.word}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePronounce(item.word)}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleSaveOrbitWord(item.word, item.explanation, item.sampleSentence)}
                              disabled={isSaved}
                              className={`p-1 rounded-md text-xs font-bold transition-colors ${
                                isSaved ? 'text-emerald-400' : 'text-amber-300 hover:text-white'
                              }`}
                              title="Lưu vào sổ tay"
                            >
                              {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-purple-200">{item.explanation}</p>
                        <p className="text-[11px] text-amber-200/90 italic bg-black/40 p-2 rounded-xl">
                          "{item.sampleSentence}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
