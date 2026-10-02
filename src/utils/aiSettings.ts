import { GeminiModelId, AiModelOption } from '../types';

export const API_KEY_STORAGE = 'cosmic_gemini_api_key_v1';
export const MODEL_STORAGE = 'cosmic_gemini_model_v1';

export const AVAILABLE_MODELS: AiModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    tag: '⚡ Siêu nhanh & Mới nhất',
    desc: 'Tốc độ phản hồi tức thì, sáng tạo, khuyên dùng cho học sinh.',
    badge: 'Khuyên dùng',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    tag: '🧠 Trí tuệ chuyên sâu',
    desc: 'Văn phong văn học sâu sắc, phân tích tu từ chuẩn mực.',
    badge: 'Nâng cao',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: '🚀 Bền bỉ & Ổn định',
    desc: 'Hoạt động ổn định khi mạng yếu, hạn chế nghẽn lưu lượng.',
    badge: 'Ổn định',
  },
];

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } catch {
    // ignore
  }
}

export function getStoredModel(): GeminiModelId {
  if (typeof window === 'undefined') return 'gemini-3-flash-preview';
  try {
    const saved = localStorage.getItem(MODEL_STORAGE) as GeminiModelId;
    if (saved && AVAILABLE_MODELS.some((m) => m.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'gemini-3-flash-preview';
}

export function setStoredModel(model: GeminiModelId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MODEL_STORAGE, model);
  } catch {
    // ignore
  }
}

export function getAiRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = getStoredApiKey();
  const model = getStoredModel();

  if (key) headers['x-gemini-api-key'] = key;
  if (model) headers['x-gemini-model'] = model;

  return headers;
}
