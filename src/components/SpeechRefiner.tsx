import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Wand2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SageAvatar } from './SageAvatar';
import { SpeechRefineResult, SavedSentence } from '../types';
import { cosmicAudio } from '../utils/audio';
import { refineSpeech } from '../services/geminiService';

interface SpeechRefinerProps {
  onAddStarEnergy: (amount: number, reason: string) => void;
  onSaveSentence: (item: Omit<SavedSentence, 'id' | 'savedAt'>) => void;
}

const SAMPLE_SPOKEN_RECORDINGS = [
  {
    id: 'sample-1',
    label: 'Mèo lười sưởi nắng',
    text: 'À ừm... sáng nay em thấy con mèo mướp kiểu như là nó đang nằm ngủ ừm lười biếng ở ngoài hiên nắng thì là gió thổi mát lắm.',
  },
  {
    id: 'sample-2',
    label: 'Cơn mưa bất chợt',
    text: 'Thì hôm nay trời mưa to kiểu như là nước à ừm chảy ngập khắp đường với lại sấm chớp ầm ầm sợ ơi là sợ luôn á.',
  },
  {
    id: 'sample-3',
    label: 'Bữa cơm gia đình',
    text: 'Ừm thì mẹ em nấu canh cua rau đay kiểu là thơm ơi là thơm cả nhà em ngồi ăn với nhau vui vẻ lắm luôn ạ.',
  },
];

export const SpeechRefiner: React.FC<SpeechRefinerProps> = ({
  onAddStarEnergy,
  onSaveSentence,
}) => {
  const [transcript, setTranscript] = useState<string>(SAMPLE_SPOKEN_RECORDINGS[0].text);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [refineResult, setRefineResult] = useState<SpeechRefineResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for Vietnamese if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của con chưa hỗ trợ ghi âm trực tiếp. Hãy chọn các đoạn giọng nói mẫu hoặc gõ vào ô bên dưới nhé!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      cosmicAudio.playStarChime();
    } else {
      setTranscript('');
      setRefineResult(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        cosmicAudio.playRocketLaunch();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleRefine = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setApiError(null);
    setRefineResult(null);
    setHasSaved(false);
    cosmicAudio.playRocketLaunch();

    try {
      const data = await refineSpeech(transcript.trim());
      setRefineResult(data);
      cosmicAudio.playSuccessFanfare();
      onAddStarEnergy(data.energyEarned || 15, 'Biến giọng nói thành thơ văn');

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#ec4899', '#38bdf8'],
      });
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSaveToJournal = () => {
    if (!refineResult) return;
    onSaveSentence({
      original: refineResult.original,
      upgraded: refineResult.poeticVersion,
      technique: 'Phép thuật lọc giọng nói & Show Don\'t Tell',
      senses: ['Đa giác quan'],
    });
    setHasSaved(true);
    cosmicAudio.playStarChime();
    onAddStarEnergy(5, 'Lưu bản thảo tinh tú vào sổ tay');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 space-y-6">
      {/* Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 p-5 sm:p-6 border border-purple-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <SageAvatar mood={isRecording ? 'happy' : 'sparkle'} size="lg" className="shrink-0" />
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-purple-800 border border-purple-200">
              <Wand2 className="h-3.5 w-3.5 text-purple-600" />
              Bộ Lọc "Phép Thuật Ngôn Từ" (Speech-to-Text Refinement)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Nói ra suy nghĩ của con — Người Dẫn Đường sẽ dệt thành thơ!
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Trẻ em thường nói có nhiều từ thừa như: <em>"à, ừm, thì là, kiểu như..."</em>. 
              Chiếc máy lọc đa vũ trụ sẽ giữ trọn ý tưởng hồn nhiên của con, gọt sạch từ thừa và thắp sáng câu chữ bằng hình ảnh sống động!
            </p>
          </div>
        </div>
      </div>

      {/* Voice Recorder & Presets */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Sample Voice Clips for Quick Testing */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Hoặc thử các đoạn thu âm mẫu dưới đây:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SPOKEN_RECORDINGS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setTranscript(sample.text);
                  setRefineResult(null);
                  cosmicAudio.playStarChime();
                }}
                className={`rounded-2xl px-3 py-1.5 text-xs font-bold border transition-all ${
                  transcript === sample.text
                    ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50'
                }`}
              >
                🎙️ {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea & Mic Action */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600">
            Lời nói nguyên bản (Từ micro hoặc gõ vào):
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Bấm nút 'Bắt đầu nói' bên dưới hoặc nhập lời nói của con vào đây..."
              className="w-full rounded-2xl border border-slate-200 p-4 text-base font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:ring-3 focus:ring-purple-100 transition-all resize-none"
            />
            {isRecording && (
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Đang lắng nghe giọng con...
              </div>
            )}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Dừng thâu âm</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 text-purple-600" />
                <span>Bắt đầu nói vào Mic 🎙️</span>
              </>
            )}
          </button>

          <button
            onClick={handleRefine}
            disabled={isProcessing || !transcript.trim()}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-6 py-2.5 text-sm sm:text-base font-bold text-white shadow-md shadow-purple-200 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Máy Lọc Đang Hoạt Động...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Khai Phóng Phép Thuật Ngôn Từ! ✨</span>
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
                  Thất bại khi lọc giọng nói
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

      {/* Refined Results Comparison */}
      {refineResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Praise banner */}
          <div className="rounded-3xl bg-pink-50 border border-pink-200 p-4 flex items-center gap-3">
            <span className="text-2xl">💖</span>
            <div>
              <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">
                Lời khen từ Người Dẫn Đường:
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {refineResult.encouragement}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version 1: Cleaned */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-bold">
                    🌿 Bước 1: Gọt giũa từ thừa
                  </span>
                  <button
                    onClick={() => handleCopyText(refineResult.cleaned)}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {hasCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{hasCopied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-base font-semibold text-slate-800 leading-relaxed">
                  "{refineResult.cleaned}"
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-500 block mb-1.5">
                  Phép màu đã thực hiện:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {refineResult.changes.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 text-xs font-medium"
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Version 2: Poetic Master Upgrade */}
            <div className="rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-purple-200 text-purple-900 px-3 py-1 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    Bước 2: Bản thảo tinh tú lấp lánh (Show Don't Tell)
                  </span>
                </div>
                <p className="text-base font-bold text-purple-950 leading-relaxed">
                  "{refineResult.poeticVersion}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                <button
                  onClick={() => cosmicAudio.speakVietnamese(refineResult.poeticVersion)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Nghe bản đọc diễn cảm</span>
                </button>

                <button
                  onClick={handleSaveToJournal}
                  disabled={hasSaved}
                  className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                    hasSaved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                  }`}
                >
                  {hasSaved ? '✓ Đã lưu vào Sổ Tay' : 'Lưu bản thảo này (+5⭐)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
