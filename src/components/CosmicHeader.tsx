import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, Star, Flame, Trophy, Square, Key, Settings, AlertCircle } from 'lucide-react';
import { cosmicAudio } from '../utils/audio';
import { ExplorerProfile } from '../types';
import { ApiKeyModal } from './ApiKeyModal';
import { getStoredApiKey, getStoredModel } from '../utils/aiSettings';

interface CosmicHeaderProps {
  profile: ExplorerProfile;
  onOpenNotebook: () => void;
}

export const CosmicHeader: React.FC<CosmicHeaderProps> = ({ profile, onOpenNotebook }) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(() => !getStoredApiKey());
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());
  const [currentModel, setCurrentModel] = useState<string>(() => getStoredModel());

  useEffect(() => {
    const unsubscribe = cosmicAudio.addSpeakingListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleKeySaved = () => {
    setApiKey(getStoredApiKey());
    setCurrentModel(getStoredModel());
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    cosmicAudio.setSoundEnabled(next);
    if (next) {
      cosmicAudio.playStarChime();
    } else {
      cosmicAudio.stopSpeaking();
    }
  };

  const stopCurrentSpeech = () => {
    cosmicAudio.stopSpeaking();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/80 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 via-purple-400 to-sky-400 shadow-md shadow-pink-200">
              <Sparkles className="h-6 w-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-teal-500 bg-clip-text text-transparent">
                  Hành Trình Đa Vũ Trụ Ngôn Từ
                </h1>
                <span className="hidden sm:inline-flex rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
                  Lớp 1 - 5
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Người Dẫn Đường Thông Thái • Xưởng Viết Văn Đa Giác Quan
              </p>
            </div>
          </div>

          {/* Gamification Stats & Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* API Key / Model Settings Button */}
            {!apiKey ? (
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-rose-50 border-2 border-rose-400 px-3 py-1 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 transition-all animate-pulse active:scale-95 cursor-pointer"
                title="Bấm để nhập API Key sử dụng app"
              >
                <Key className="h-3.5 w-3.5 text-rose-600 animate-bounce" />
                <span className="font-extrabold text-rose-600">Lấy API key để sử dụng app</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-pink-300 hover:bg-pink-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-pink-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Cài đặt Model AI & API Key"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden md:inline text-slate-400 font-normal">Model:</span>
                <span className="font-bold text-slate-800 text-[11px]">
                  {currentModel.replace('-preview', '')}
                </span>
                <Settings className="h-3 w-3 text-slate-400 ml-0.5" />
              </button>
            )}

            {/* Active Vietnamese Audio Playing Indicator */}
            {isSpeaking && (
              <button
                onClick={stopCurrentSpeech}
                className="flex items-center gap-2 rounded-full bg-pink-500 text-white px-3 py-1 text-xs font-bold shadow-md animate-pulse hover:bg-pink-600 transition-all"
                title="Bấm để dừng đọc"
              >
                <Volume2 className="h-3.5 w-3.5 animate-bounce" />
                <span>Đang đọc tiếng Việt...</span>
                <Square className="h-3 w-3 fill-white" />
              </button>
            )}

            {/* Star Energy Counter */}
            <div
              className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-bold text-amber-800 shadow-xs cursor-pointer hover:bg-amber-100 transition-colors"
              title="Năng Lượng Ngôn Từ kiếm được từ các bài viết và thử thách"
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-500 animate-pulse" />
              <span>{profile.starEnergy}</span>
              <span className="text-xs font-medium text-amber-600 hidden md:inline">Năng Lượng</span>
            </div>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-sm font-bold text-orange-800 shadow-xs"
              title="Chuỗi ngày thám hiểm ngôn từ liên tiếp"
            >
              <Flame className="h-4 w-4 fill-orange-400 text-orange-500" />
              <span>{profile.streakDays} ngày</span>
            </div>

            {/* Explorer Rank Pill */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700 shadow-xs">
              <Trophy className="h-3.5 w-3.5 text-purple-600" />
              <span>{profile.rankTitle}</span>
            </div>

            {/* Star Notebook Button */}
            <button
              onClick={onOpenNotebook}
              className="flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-800 transition-all shadow-xs active:scale-95"
              title="Mở Sổ Tay Tinh Tú (Từ vựng & câu văn đã lưu)"
            >
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span>Sổ Tay</span>
              <span className="ml-0.5 rounded-full bg-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-900">
                {profile.savedWords.length + profile.savedSentences.length}
              </span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={toggleSound}
              aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title={soundOn ? 'Âm thanh đang bật' : 'Âm thanh đang tắt'}
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-pink-500" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* API Key & Model Settings Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSaved={handleKeySaved}
      />
    </>
  );
};
