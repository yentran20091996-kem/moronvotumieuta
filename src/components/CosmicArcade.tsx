import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Star,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap,
  Eye,
  Ear,
  Wind,
  HandMetal,
  Utensils,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { cosmicAudio } from '../utils/audio';

interface CosmicArcadeProps {
  onAddStarEnergy: (amount: number, reason: string) => void;
}

// Data for Game 1: Bắt Sao Ngũ Giác
const SENSES_QUESTIONS = [
  {
    sentence: 'Tiếng ve sầu râm ran như một dàn đồng ca mùa hạ vang vọng khắp các vòm lá biếc.',
    correctSense: 'Thính giác',
    explanation: 'Từ "tiếng ve râm ran", "dàn đồng ca vang vọng" là âm thanh tác động vào tai nghe (Thính giác)!',
  },
  {
    sentence: 'Những hạt nắng vàng như mật ong rót rực rỡ xuống dòng sông lấp lánh muôn ngàn đốm bạc.',
    correctSense: 'Thị giác',
    explanation: 'Hình ảnh "nắng vàng như mật", "sông lấp lánh đốm bạc" là màu sắc và ánh sáng mắt nhìn thấy (Thị giác)!',
  },
  {
    sentence: 'Cơn gió bấc đầu mùa thổi qua khiến làn da em se se mát lạnh và rùng mình thích thú.',
    correctSense: 'Xúc giác',
    explanation: '"Gió thổi se se mát lạnh" là cảm giác làn da chạm vào không khí (Xúc giác)!',
  },
  {
    sentence: 'Hương hoa bưởi nồng nàn thơm ngát len lỏi vào từng góc nhỏ của căn phòng.',
    correctSense: 'Khứu giác',
    explanation: '"Hương thơm nồng nàn" là mùi hương mũi ngửi thấy (Khứu giác)!',
  },
  {
    sentence: 'Vị ngọt thanh dịu của quả dưa hấu ướp lạnh làm tan biến mọi mệt mỏi trưa hè.',
    correctSense: 'Vị giác',
    explanation: '"Vị ngọt thanh dịu" là hương vị nơi đầu lưỡi nếm được (Vị giác)!',
  },
  {
    sentence: 'Tiếng suối chảy róc rách giữa rừng vắng như khúc đàn violon của thiên nhiên.',
    correctSense: 'Thính giác',
    explanation: '"Tiếng suối róc rách" là âm thanh kỳ diệu của Thính giác!',
  },
];

// Data for Game 2: Ghép Đôi Tell vs Show
const MATCHING_PAIRS = [
  {
    id: 1,
    tell: 'Trời mưa to.',
    show: 'Những giọt mưa nặng hạt thi nhau nhảy múa trên mái tôn, tạo nên bản hòa ca rộn ràng.',
  },
  {
    id: 2,
    tell: 'Con mèo đang ngủ.',
    show: 'Chú mèo cuộn tròn như một cuộn len êm ái trên chiếc nệm ấm, khẽ phát ra tiếng gừ gừ.',
  },
  {
    id: 3,
    tell: 'Mẹ nấu ăn ngon.',
    show: 'Mùi canh thơm lừng bay khắp gian bếp nhỏ, ấm nồng như tình yêu thương mẹ dành cho cả nhà.',
  },
];

// Data for Game 3: Vòng Quay Hành Tinh Từ Vựng
const VOCAB_WHEEL_QUESTIONS = [
  {
    rootWord: 'Vui vẻ',
    planet: 'Tâm trạng',
    options: ['Cười', 'Hân hoan / Rạo rực', 'Chạy nhảy', 'Bình thường'],
    correct: 'Hân hoan / Rạo rực',
    hint: 'Từ ngữ mang âm hưởng rộn rã, niềm vui cuộn trào từ sâu thẳm tâm hồn.',
  },
  {
    rootWord: 'Sương mù',
    planet: 'Thời tiết',
    options: ['Trắng xóa', 'Mờ mịt', 'Bảng lảng', 'Nhiều khói'],
    correct: 'Bảng lảng',
    hint: 'Gợi tả làn sương mỏng manh, chập chờn trôi nhẹ trong gió sớm.',
  },
  {
    rootWord: 'Sáng',
    planet: 'Không gian',
    options: ['Rất sáng', 'Lấp lánh / Lung linh', 'Ban ngày', 'Bóng đèn'],
    correct: 'Lấp lánh / Lung linh',
    hint: 'Gợi tả ánh sáng chớp nháy huyền ảo như những vì sao trên trời.',
  },
  {
    rootWord: 'Nhanh',
    planet: 'Hành động',
    options: ['Chạy vội', 'Đi mau', 'Thoăn thoắt', 'Kịp giờ'],
    correct: 'Thoăn thoắt',
    hint: 'Gợi tả bước chân hoặc bàn tay chuyển động nhanh nhẹn, nhịp nhàng và liên tục.',
  },
];

export const CosmicArcade: React.FC<CosmicArcadeProps> = ({ onAddStarEnergy }) => {
  const [activeGame, setActiveGame] = useState<'senses' | 'matching' | 'vocabWheel'>('senses');

  // Game 1 State
  const [sensesIndex, setSensesIndex] = useState<number>(0);
  const [sensesScore, setSensesScore] = useState<number>(0);
  const [sensesFeedback, setSensesFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Game 2 State
  const [selectedTellId, setSelectedTellId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [matchError, setMatchError] = useState<string>('');

  // Game 3 State
  const [wheelIndex, setWheelIndex] = useState<number>(0);
  const [wheelFeedback, setWheelFeedback] = useState<string | null>(null);
  const [wheelScore, setWheelScore] = useState<number>(0);

  // Handlers for Game 1
  const handleSelectSenseAnswer = (sense: string) => {
    const currentQ = SENSES_QUESTIONS[sensesIndex];
    if (sense === currentQ.correctSense) {
      cosmicAudio.playSuccessFanfare();
      setSensesScore((prev) => prev + 1);
      setSensesFeedback({ isCorrect: true, text: `Chính xác! 🌟 ${currentQ.explanation}` });
      onAddStarEnergy(10, 'Chiến thắng màn chơi Bắt Sao Ngũ Giác');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } else {
      cosmicAudio.playStarChime();
      setSensesFeedback({ isCorrect: false, text: `Chưa đúng rồi bé ơi! Câu này gợi tả về ${currentQ.correctSense}.` });
    }
  };

  const handleNextSenseQuestion = () => {
    setSensesFeedback(null);
    setSensesIndex((prev) => (prev + 1) % SENSES_QUESTIONS.length);
  };

  // Handlers for Game 2
  const handleSelectShowCard = (showId: number) => {
    if (!selectedTellId) return;

    if (selectedTellId === showId) {
      cosmicAudio.playSuccessFanfare();
      setMatchedIds((prev) => [...prev, showId]);
      setSelectedTellId(null);
      setMatchError('');
      onAddStarEnergy(15, 'Ghép đúng cặp câu Tell vs. Show');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else {
      cosmicAudio.playStarChime();
      setMatchError('Chưa khớp rồi! Hãy đọc kỹ ý nghĩa của 2 câu nhé.');
      setTimeout(() => setMatchError(''), 2000);
    }
  };

  const handleResetMatchingGame = () => {
    setMatchedIds([]);
    setSelectedTellId(null);
    setMatchError('');
  };

  // Handlers for Game 3
  const handleSelectWheelOption = (option: string) => {
    const currentQ = VOCAB_WHEEL_QUESTIONS[wheelIndex];
    if (option === currentQ.correct) {
      cosmicAudio.playSuccessFanfare();
      setWheelScore((prev) => prev + 1);
      setWheelFeedback(`🎉 Tuyệt đỉnh! "${option}" chính là từ ngữ ở Hành Tinh Xa Xôi của "${currentQ.rootWord}"!`);
      onAddStarEnergy(15, 'Chinh phục Vòng quay Từ vựng');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else {
      cosmicAudio.playStarChime();
      setWheelFeedback(`Chưa chính xác! Gợi ý: ${currentQ.hint}`);
    }
  };

  const handleNextWheelQuestion = () => {
    setWheelFeedback(null);
    setWheelIndex((prev) => (prev + 1) % VOCAB_WHEEL_QUESTIONS.length);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-3xl">
              🎮
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-pink-100 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                Đấu Trường Ngôn Từ Tương Tác
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Chơi Game Thú Vị - Nạp Ngàn Năng Lượng Sao!
              </h2>
              <p className="text-xs sm:text-sm text-pink-100 mt-0.5">
                Vừa giải trí vui nhộn, vừa rèn luyện kỹ năng viết văn và mở rộng vốn từ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveGame('senses')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeGame === 'senses'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>👁️ 1. Bắt Sao Ngũ Giác</span>
          <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px]">{sensesScore} ⭐</span>
        </button>

        <button
          onClick={() => setActiveGame('matching')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeGame === 'matching'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🪄 2. Ghép Đôi Phép Màu (Tell vs. Show)</span>
          <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px]">{matchedIds.length}/3</span>
        </button>

        <button
          onClick={() => setActiveGame('vocabWheel')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeGame === 'vocabWheel'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🪐 3. Vòng Quay Hành Tinh Từ Vựng</span>
          <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px]">{wheelScore} ⭐</span>
        </button>
      </div>

      {/* GAME 1: Bắt Sao Ngũ Giác */}
      {activeGame === 'senses' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Câu số {sensesIndex + 1} / {SENSES_QUESTIONS.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Thưởng +10 Năng Lượng mỗi câu đúng
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 p-5 border border-amber-200 text-center space-y-2">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Câu văn này đánh thức giác quan nào nhiều nhất?
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-800 italic leading-relaxed">
              "{SENSES_QUESTIONS[sensesIndex].sentence}"
            </p>
          </div>

          {/* Senses choices */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'Thị giác', label: 'Thị Giác', icon: Eye, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-200' },
              { id: 'Thính giác', label: 'Thính Giác', icon: Ear, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200' },
              { id: 'Khứu giác', label: 'Khứu Giác', icon: Wind, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
              { id: 'Xúc giác', label: 'Xúc Giác', icon: HandMetal, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' },
              { id: 'Vị giác', label: 'Vị Giác', icon: Utensils, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  disabled={Boolean(sensesFeedback)}
                  onClick={() => handleSelectSenseAnswer(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer disabled:opacity-60 ${item.color}`}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {sensesFeedback && (
            <div className="rounded-2xl p-4 space-y-3 bg-slate-50 border border-slate-200 animate-in fade-in">
              <div className={`flex items-center gap-2 text-sm font-bold ${sensesFeedback.isCorrect ? 'text-emerald-700' : 'text-amber-800'}`}>
                {sensesFeedback.isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                <span>{sensesFeedback.text}</span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNextSenseQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: Ghép Đôi Phép Màu */}
      {activeGame === 'matching' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Chạm 1 câu Kể (Tell) bên trái, sau đó chạm câu Gợi Tả (Show) tương ứng bên phải để ghép đôi!
            </p>
            <button
              onClick={handleResetMatchingGame}
              className="flex items-center gap-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 px-2.5 py-1 rounded-xl"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Chơi lại</span>
            </button>
          </div>

          {matchError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              ⚠️ {matchError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column: Tell */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">
                ❌ Câu Kể Đơn Điệu (Tell):
              </span>
              {MATCHING_PAIRS.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedTellId === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => setSelectedTellId(item.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-300 opacity-60 text-slate-500 line-through'
                        : isSelected
                        ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-200 font-bold text-slate-800'
                        : 'bg-white border-slate-200 hover:border-pink-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{item.tell}</span>
                  </button>
                );
              })}
            </div>

            {/* Right column: Show (shuffled order) */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                ✨ Câu Gợi Tả Sống Động (Show):
              </span>
              {[MATCHING_PAIRS[1], MATCHING_PAIRS[2], MATCHING_PAIRS[0]].map((item) => {
                const isMatched = matchedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleSelectShowCard(item.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-300 opacity-60 text-emerald-800'
                        : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-medium leading-relaxed block">{item.show}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {matchedIds.length === MATCHING_PAIRS.length && (
            <div className="text-center py-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-3xl">🎉</span>
              <h4 className="text-base font-bold text-emerald-900">Tuyệt đỉnh! Con đã ghép đúng toàn bộ các câu!</h4>
              <p className="text-xs text-emerald-700">+45 Năng Lượng Ngôn Từ đã được cộng vào tài khoản của con!</p>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: Vòng Quay Hành Tinh Từ Vựng */}
      {activeGame === 'vocabWheel' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Vòng thi {wheelIndex + 1} / {VOCAB_WHEEL_QUESTIONS.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Hành tinh: {VOCAB_WHEEL_QUESTIONS[wheelIndex].planet}
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border border-purple-200 text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold text-xl shadow-md">
                🪐
              </div>
            </div>
            <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Từ ngữ cấp độ "Hành tinh xa xôi" (Văn chương tinh tế) của từ:
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              "{VOCAB_WHEEL_QUESTIONS[wheelIndex].rootWord}"
            </h3>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VOCAB_WHEEL_QUESTIONS[wheelIndex].options.map((opt) => (
              <button
                key={opt}
                disabled={Boolean(wheelFeedback)}
                onClick={() => handleSelectWheelOption(opt)}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 text-slate-800 text-sm font-bold text-left transition-all disabled:opacity-60 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>

          {wheelFeedback && (
            <div className="rounded-2xl p-4 space-y-3 bg-slate-50 border border-slate-200 animate-in fade-in">
              <p className="text-sm font-semibold text-slate-800">{wheelFeedback}</p>
              <div className="flex justify-end">
                <button
                  onClick={handleNextWheelQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  <span>Từ tiếp theo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
