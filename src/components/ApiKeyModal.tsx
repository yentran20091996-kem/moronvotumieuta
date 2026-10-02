import React, { useState, useEffect } from 'react';
import {
  Key,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../utils/aiSettings';
import { GeminiModelId } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestStatus({ type: null, message: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Vui lòng nhập API Key trước khi kiểm tra!',
      });
      return;
    }

    setIsTesting(true);
    setTestStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/check-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestStatus({
          type: 'success',
          message: `Kết nối thành công tới ${selectedModel}! Bạn có thể yên tâm sử dụng.`,
        });
      } else {
        setTestStatus({
          type: 'error',
          message: data.error || 'API Key không hợp lệ hoặc đã hết hạn mức!',
        });
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: 'Không thể kết nối tới máy chủ kiểm tra API Key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-pink-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-teal-400 text-white shadow-md">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>Thiết Lập Model & API Key Gemini</span>
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-bold text-pink-700">
                  Google AI Studio
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cung cấp API Key riêng giúp ứng dụng không bị gián đoạn khi hết hạn mức dùng chung
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Guide banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center justify-between font-bold text-amber-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Cách lấy API Key miễn phí từ Google:
            </span>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-pink-700 hover:text-pink-900 underline font-semibold bg-white/80 px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs"
            >
              <span>Mở Google AI Studio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="leading-relaxed text-slate-700">
            1. Đăng nhập tài khoản Google của bạn tại liên kết trên.<br />
            2. Nhấn nút <strong>"Create API key"</strong> (Tạo khóa API).<br />
            3. Sao chép đoạn mã và dán vào ô bên dưới, sau đó bấm <strong>Lưu cài đặt</strong>.
          </p>
        </div>

        {/* Input API Key */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Gemini API Key của bạn:
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Dán API Key bắt đầu bằng AIzaSy..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-24 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:ring-3 focus:ring-pink-100 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting || !apiKey.trim()}
                className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-pink-700 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span>Thử</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Key được lưu bảo mật trong trình duyệt (localStorage) của bạn, không chia sẻ cho bên thứ ba.</span>
          </p>
        </div>

        {/* Test status banner */}
        {testStatus.type && (
          <div
            className={`rounded-2xl p-3.5 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200 ${
              testStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testStatus.message}</span>
          </div>
        )}

        {/* Model AI Selector (Cards) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chọn Model AI Ưu Tiên:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/70 ring-2 ring-pink-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-800">{model.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-pink-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-pink-700 mb-1">
                      {model.tag}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      {model.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 italic">
            * Hệ thống tự động chuyển đổi giữa các model dự phòng nếu model đang chọn gặp lỗi quá tải.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-200 hover:opacity-95 active:scale-95 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Lưu Cài Đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
