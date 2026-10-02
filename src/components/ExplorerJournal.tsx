import React, { useState } from 'react';
import {
  Trophy,
  Star,
  BookMarked,
  Award,
  Sparkles,
  Volume2,
  Trash2,
  CheckCircle,
  HelpCircle,
  Share2,
  FileText,
  Presentation,
  Printer,
  Download,
} from 'lucide-react';
import { ExplorerProfile } from '../types';
import { cosmicAudio } from '../utils/audio';
import { exportToWordDocument, exportToPowerPoint } from '../utils/documentExport';

interface ExplorerJournalProps {
  profile: ExplorerProfile;
  onRemoveWord: (id: string) => void;
  onRemoveSentence: (id: string) => void;
  onClaimDailyQuest: (questId: string, energy: number) => void;
}

const BADGES_DEFINITIONS = [
  { id: 'start', title: 'Cất Cánh Tinh Tú', desc: 'Gia nhập Hành Trình Đa Vũ Trụ Ngôn Từ', icon: '🚀', req: 0 },
  { id: 'senses', title: 'Phù Thủy Ngũ Giác', desc: 'Vận dụng đủ 5 giác quan vào câu chữ', icon: '👁️', req: 50 },
  { id: 'lexicon', title: 'Nhà Thám Hiểm Từ Ngữ', desc: 'Thu thập 5 từ vựng ở Hành tinh xa xôi', icon: '🪐', req: 100 },
  { id: 'poet', title: 'Thuyền Trưởng Ngân Hà', desc: 'Đạt mốc 200 Năng Lượng Ngôn Từ', icon: '🌟', req: 200 },
  { id: 'master', title: 'Đại Pháp Sư Văn Chương', desc: 'Chinh phục mọi quỹ đạo tu từ kỳ ảo', icon: '👑', req: 500 },
];

const DAILY_QUESTS = [
  {
    id: 'quest-1',
    title: 'Thám hiểm Hành Tinh Thời Tiết',
    desc: 'Nâng cấp 1 câu văn về trời mưa hoặc gió bằng kỹ thuật Show Don\'t Tell.',
    reward: 20,
    icon: '🌧️',
  },
  {
    id: 'quest-2',
    title: 'Chiếc gương thần kỳ (So sánh)',
    desc: 'Dùng từ "như" hoặc "tựa như" để tả nụ cười ấm áp của người thân.',
    reward: 25,
    icon: '🪞',
  },
  {
    id: 'quest-3',
    title: 'Biến đồ vật thành người bạn',
    desc: 'Nhân hóa chiếc bút chì hoặc cặp sách như một người bạn biết tâm sự.',
    reward: 30,
    icon: '🎒',
  },
];

export const ExplorerJournal: React.FC<ExplorerJournalProps> = ({
  profile,
  onRemoveWord,
  onRemoveSentence,
  onClaimDailyQuest,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notebook' | 'roadmap' | 'rhetoricLab'>('notebook');
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);

  const handleClaim = (questId: string, reward: number) => {
    if (claimedQuests.includes(questId)) return;
    setClaimedQuests((prev) => [...prev, questId]);
    cosmicAudio.playSuccessFanfare();
    onClaimDailyQuest(questId, reward);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 space-y-6">
      {/* Profile Overview Card */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-100 via-pink-100 to-purple-100 p-6 border border-amber-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-md border-2 border-amber-300 text-3xl">
              ⭐
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {profile.name}
                </h2>
                <span className="rounded-full bg-purple-200 text-purple-900 px-3 py-0.5 text-xs font-bold">
                  {profile.rankTitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Đã thu thập <strong>{profile.savedWords.length}</strong> từ vựng và{' '}
                <strong>{profile.savedSentences.length}</strong> câu văn tinh tú
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/90 px-4 py-2 text-center border border-amber-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Tổng Năng Lượng</span>
              <p className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                {profile.starEnergy}
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 px-4 py-2 text-center border border-orange-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Chuỗi ngày</span>
              <p className="text-xl font-black text-orange-600">
                {profile.streakDays} ngày 🔥
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('notebook')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
            activeSubTab === 'notebook'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookMarked className="h-4 w-4" />
          <span>Sổ Tay Tinh Tú ({profile.savedWords.length + profile.savedSentences.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roadmap')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
            activeSubTab === 'roadmap'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Huy Hiệu & Thử Thách Hàng Ngày</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rhetoricLab')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
            activeSubTab === 'rhetoricLab'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Phép Màu Tu Từ (Góc Học Vui)</span>
        </button>
      </div>

      {/* 1. Sổ Tay Tinh Tú (Saved words & sentences) */}
      {activeSubTab === 'notebook' && (
        <div className="space-y-6">
          {/* Education Export Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-50 via-pink-50 to-teal-50 p-4 rounded-2xl border border-purple-200/80 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                <Download className="h-4 w-4 text-purple-600" />
                <span>Xuất Tài Liệu & Bài Giảng Cho Giáo Viên & Học Sinh:</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                In phiếu bài tập kẻ ô ly hoặc tải bài giảng PowerPoint để trình chiếu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Word Export */}
              <button
                type="button"
                onClick={() => exportToWordDocument(profile)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Tải Phiếu bài tập làm văn định dạng Word (.doc)"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Xuất Word (.doc)</span>
              </button>

              {/* PowerPoint Export */}
              <button
                type="button"
                onClick={() => exportToPowerPoint(profile)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Tải Bài giảng trình chiếu PowerPoint (.ppt)"
              >
                <Presentation className="h-3.5 w-3.5" />
                <span>Xuất Slide (.ppt)</span>
              </button>

              {/* Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Mở giao diện in phiếu học tập"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>In trang 🖨️</span>
              </button>
            </div>
          </div>

          {/* Saved Sentences */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Câu văn tinh tú đã lưu ({profile.savedSentences.length})</span>
            </h3>

            {profile.savedSentences.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-slate-400">
                <p className="text-sm font-medium">Chưa có câu văn nào được lưu.</p>
                <p className="text-xs mt-1">
                  Hãy ghé <strong>Xưởng Chế Tác Câu Chữ</strong> và bấm "Lưu câu này" nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {profile.savedSentences.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5">
                        {s.technique}
                      </span>
                      <button
                        onClick={() => onRemoveSentence(s.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Xóa câu này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      "{s.upgraded}"
                    </p>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs text-slate-500">
                      <span className="italic line-clamp-1">Gốc: "{s.original}"</span>
                      <button
                        onClick={() => cosmicAudio.speakVietnamese(s.upgraded)}
                        className="text-teal-600 hover:text-teal-800 flex items-center gap-1 font-semibold"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Nghe</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Words */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Kho báu từ vựng đã thu thập ({profile.savedWords.length})</span>
            </h3>

            {profile.savedWords.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center text-slate-400">
                <p className="text-sm font-medium">Chưa có từ vựng nào trong túi thần kỳ.</p>
                <p className="text-xs mt-1">
                  Hãy khám phá <strong>Bản Đồ Từ Vựng</strong> để gom về những viên ngọc câu chữ!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.savedWords.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-white border border-purple-100 p-3.5 shadow-2xs hover:shadow-xs transition-shadow space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-purple-900">{w.word}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => cosmicAudio.speakVietnamese(w.word)}
                          className="text-slate-400 hover:text-purple-600 p-1"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveWord(w.id)}
                          className="text-slate-300 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold rounded-full bg-purple-50 text-purple-700 px-2 py-0.5 inline-block">
                      {w.planet}
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-2">{w.meaning}</p>
                    <p className="text-[11px] text-slate-500 italic bg-purple-50/50 p-2 rounded-xl">
                      "{w.example}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Roadmap & Daily Quests */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-6">
          {/* Daily Quests */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-800">
              Nhiệm Vụ Tinh Tú Hôm Nay:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DAILY_QUESTS.map((q) => {
                const isClaimed = claimedQuests.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between ${
                      isClaimed
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-amber-200 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{q.icon}</span>
                        <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">
                          +{q.reward} ⭐
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{q.title}</h4>
                      <p className="text-xs text-slate-600">{q.desc}</p>
                    </div>

                    <button
                      onClick={() => handleClaim(q.id, q.reward)}
                      disabled={isClaimed}
                      className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
                        isClaimed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 shadow-xs cursor-pointer'
                      }`}
                    >
                      {isClaimed ? '✓ Đã nhận thưởng' : 'Nhận Nhiệm Vụ ⭐'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Shelf */}
          <div className="space-y-3 pt-3">
            <h3 className="text-base font-bold text-slate-800">
              Bộ Sưu Tập Huy Hiệu Ngân Hà:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {BADGES_DEFINITIONS.map((b) => {
                const isUnlocked = profile.starEnergy >= b.req;
                return (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-4 text-center space-y-2 transition-all ${
                      isUnlocked
                        ? 'bg-white border-purple-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-3xl block">{b.icon}</span>
                    <h4 className="text-xs font-bold text-slate-800">{b.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">{b.desc}</p>
                    <span className="text-[10px] font-bold text-purple-700 block">
                      {isUnlocked ? '✓ Đã mở khóa' : `Cần ${b.req} ⭐`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Rhetoric Lab (Biện pháp tu từ lồng ghép tự nhiên) */}
      {activeSubTab === 'rhetoricLab' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-pink-50 border border-pink-200 p-5 space-y-2">
            <h3 className="text-base font-bold text-pink-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              Bí Kíp "Phù Thủy Tu Từ" Dành Cho Bạn Nhỏ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Người Dẫn Đường không dùng những từ ngữ khó hiểu như "nghệ thuật tu từ hàn lâm". 
              Chúng mình hãy học cách làm bạn với câu chữ thật dễ thương nhé!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Nhân hóa */}
            <div className="rounded-2xl bg-white border border-rose-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <span className="text-2xl">🧸</span>
                <span>Biến đồ vật thành người bạn (Nhân hóa)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hãy tưởng tượng mặt trời biết cười, giọt mưa biết nhảy múa, và chiếc đồng hồ báo thức đang cất tiếng ca giục giã.
              </p>
              <div className="rounded-xl bg-rose-50 p-3 text-xs border border-rose-100 text-rose-900 italic">
                "Cây bàng già xòe rộng tán ô xanh mát che chở cho chúng em."
              </div>
            </div>

            {/* Card 2: So sánh */}
            <div className="rounded-2xl bg-white border border-sky-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                <span className="text-2xl">🪞</span>
                <span>Chiếc gương thần kỳ (So sánh)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đặt hai hình ảnh xinh xắn cạnh nhau bằng từ "như", "tựa như", "giống như" để làm bật lên vẻ đẹp lộng lẫy.
              </p>
              <div className="rounded-xl bg-sky-50 p-3 text-xs border border-sky-100 text-sky-900 italic">
                "Mặt hồ phẳng lặng tựa như một tấm gương khổng lồ soi bóng mây trời."
              </div>
            </div>

            {/* Card 3: Ẩn dụ */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                <span className="text-2xl">🪄</span>
                <span>Bức tranh ẩn giấu (Ẩn dụ)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gọi tên sự vật này bằng tên một sự vật khác đẹp đẽ hơn mà không cần từ "như", tạo cảm giác kỳ ảo.
              </p>
              <div className="rounded-xl bg-purple-50 p-3 text-xs border border-purple-100 text-purple-900 italic">
                "Bầu trời đêm đính ngàn hạt ngọc lấp lánh soi sáng buôn làng."
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
