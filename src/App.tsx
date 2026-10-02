/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CosmicHeader } from './components/CosmicHeader';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { ShowDontTellStudio } from './components/ShowDontTellStudio';
import { VocabPlanetMap } from './components/VocabPlanetMap';
import { SpeechRefiner } from './components/SpeechRefiner';
import { CosmicArcade } from './components/CosmicArcade';
import { ExplorerJournal } from './components/ExplorerJournal';
import { ExplorerProfile, SavedSentence, SavedWord } from './types';
import { Sparkles, Star } from 'lucide-react';

const STORAGE_KEY = 'cosmic_words_profile_v1';

const INITIAL_PROFILE: ExplorerProfile = {
  name: 'Nhà Thám Hiểm Nhí',
  starEnergy: 120,
  streakDays: 3,
  rankTitle: 'Thợ Săn Sao Băng 🌠',
  unlockedBadges: ['start', 'senses', 'lexicon'],
  savedWords: [
    {
      id: 'w-1',
      word: 'Hân hoan',
      meaning: 'Niềm vui sướng tràn ngập và rộn rã trong lòng',
      example: 'Cả lớp hân hoan reo hò khi nhận sao thưởng.',
      planet: 'Tâm trạng',
      savedAt: '2026-10-01',
    },
    {
      id: 'w-2',
      word: 'Tí tách',
      meaning: 'Tiếng hạt mưa rơi từng giọt trên mái ngói',
      example: 'Những giọt mưa tí tách rơi như đang gõ nhịp bài ca.',
      planet: 'Thời tiết',
      savedAt: '2026-10-01',
    },
  ],
  savedSentences: [
    {
      id: 's-1',
      original: 'Trời mưa to.',
      upgraded: 'Những hạt mưa nặng hạt đang nhảy múa trên mái tôn, tạo nên một bản nhạc rộn ràng của mây trời.',
      technique: 'Show, Don\'t Tell - Hình ảnh & Âm thanh',
      senses: ['Thính giác', 'Thị giác'],
      savedAt: '2026-10-01',
    },
  ],
};

function calculateRank(energy: number): string {
  if (energy < 100) return 'Nhà Thám Hiểm Tập Sự 🚀';
  if (energy < 200) return 'Thợ Săn Sao Băng 🌠';
  if (energy < 350) return 'Thuyền Trưởng Ngân Hà ⭐';
  return 'Đại Pháp Sư Ngôn Từ 👑';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('studio');
  const [profile, setProfile] = useState<ExplorerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROFILE;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleAddStarEnergy = (amount: number, reason: string) => {
    setProfile((prev) => {
      const nextEnergy = prev.starEnergy + amount;
      const nextRank = calculateRank(nextEnergy);
      return {
        ...prev,
        starEnergy: nextEnergy,
        rankTitle: nextRank,
      };
    });
    showToast(`+${amount} Năng Lượng Ngôn Từ! (${reason}) ⭐`);
  };

  const handleSaveSentence = (item: Omit<SavedSentence, 'id' | 'savedAt'>) => {
    const newEntry: SavedSentence = {
      ...item,
      id: 's-' + Date.now(),
      savedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setProfile((prev) => ({
      ...prev,
      savedSentences: [newEntry, ...prev.savedSentences],
    }));
    showToast('Đã cất câu văn vào Sổ Tay Tinh Tú! 📖');
  };

  const handleSaveWord = (item: Omit<SavedWord, 'id' | 'savedAt'>) => {
    // Avoid duplicate words
    if (profile.savedWords.some((w) => w.word.toLowerCase() === item.word.toLowerCase())) {
      showToast(`Từ "${item.word}" đã có trong Sổ Tay rồi nhé! ✨`);
      return;
    }

    const newEntry: SavedWord = {
      ...item,
      id: 'w-' + Date.now(),
      savedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setProfile((prev) => ({
      ...prev,
      savedWords: [newEntry, ...prev.savedWords],
    }));
    showToast(`Đã thu thập từ "${item.word}" vào Sổ Tay! 🎒`);
  };

  const handleRemoveWord = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      savedWords: prev.savedWords.filter((w) => w.id !== id),
    }));
  };

  const handleRemoveSentence = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      savedSentences: prev.savedSentences.filter((s) => s.id !== id),
    }));
  };

  const handleClaimDailyQuest = (questId: string, energy: number) => {
    handleAddStarEnergy(energy, 'Hoàn thành nhiệm vụ hàng ngày');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] via-[#f7f5ff] to-[#f0f9ff] text-slate-800 flex flex-col selection:bg-pink-200 selection:text-pink-900">
      {/* Header */}
      <CosmicHeader
        profile={profile}
        onOpenNotebook={() => setActiveTab('journal')}
      />

      {/* Main Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && (
          <ShowDontTellStudio
            onAddStarEnergy={handleAddStarEnergy}
            onSaveSentence={handleSaveSentence}
            onSaveWord={handleSaveWord}
          />
        )}

        {activeTab === 'planetMap' && (
          <VocabPlanetMap
            onAddStarEnergy={handleAddStarEnergy}
            onSaveWord={handleSaveWord}
          />
        )}

        {activeTab === 'speechRefine' && (
          <SpeechRefiner
            onAddStarEnergy={handleAddStarEnergy}
            onSaveSentence={handleSaveSentence}
          />
        )}

        {activeTab === 'arcade' && (
          <CosmicArcade onAddStarEnergy={handleAddStarEnergy} />
        )}

        {activeTab === 'journal' && (
          <ExplorerJournal
            profile={profile}
            onRemoveWord={handleRemoveWord}
            onRemoveSentence={handleRemoveSentence}
            onClaimDailyQuest={handleClaimDailyQuest}
          />
        )}
      </main>

      {/* Toast Notification Floating Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white shadow-xl border border-pink-400/40 animate-in fade-in slide-in-from-bottom-5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5">
          <span>Hành Trình Đa Vũ Trụ Ngôn Từ</span>
          <span>•</span>
          <span className="text-pink-600 font-semibold">Người Dẫn Đường Thông Thái</span>
          <span>•</span>
          <span>Đồng hành cùng học sinh tiểu học (Lớp 1 - 5)</span>
        </p>
      </footer>
    </div>
  );
}
