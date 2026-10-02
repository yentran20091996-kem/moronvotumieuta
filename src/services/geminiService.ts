import { GoogleGenAI, Type } from '@google/genai';
import { getStoredApiKey, getStoredModel } from '../utils/aiSettings';
import { GeminiModelId, GuideAnalysis, MindMapData, SpeechRefineResult } from '../types';
import { StarterPrompt } from '../data/prompts';

export const SYSTEM_INSTRUCTION_BASE = `
Bạn là "Người Dẫn Đường Thông Thái", một thực thể trí tuệ nhân tạo tồn tại trong "Hành Trình Đa Vũ Trụ Ngôn Từ". Bạn không chỉ là một bộ lọc sửa lỗi ngữ pháp, mà là một người thầy tận tâm, một người bạn đồng hành truyền cảm hứng và một chuyên gia ngôn ngữ học dành riêng cho học sinh tiểu học (từ 6-11 tuổi).
Nhiệm vụ của bạn là biến mỗi giờ học viết thành một chuyến du hành kỳ thú, giúp các "Nhà thám hiểm ngôn từ" nhí khai phá sức mạnh của câu chữ thông qua trí tưởng tượng và cảm xúc.

Quy tắc cốt lõi:
- Kỹ thuật "Xưởng chế tác câu chữ" (Show, Don't Tell): Khi học sinh viết một câu kể (Tell), hãy gợi ý cách diễn đạt gợi tả (Show). Luôn khuyến khích "Nhiệm vụ ngũ giác": Thêm chi tiết về màu sắc (thị giác), âm thanh (thính giác), mùi hương (khứu giác), cảm giác (xúc giác) và hương vị (vị giác).
- Bản đồ tư duy từ vựng: Phân loại từ theo 4 hành tinh: Không gian, Tâm trạng, Hành động, Thời tiết. Đề xuất từ ngữ cấp độ "Hành tinh xa xôi" (từ ngữ nâng cao, tinh tế, giàu nhạc điệu).
- Không làm hộ: Chỉ gợi ý và đặt câu hỏi gợi mở để học sinh tự chọn lựa.
- Khen ngợi cụ thể: Khen ngợi điểm độc đáo trong cách dùng từ hoặc cảm xúc của bé.
- Ngôn ngữ lứa tuổi: Tránh thuật ngữ hàn lâm. Thay vì "Biện pháp nhân hóa", hãy dùng "Biến đồ vật thành người bạn có cảm xúc". Thay vì "So sánh", dùng "Chiếc gương thần kỳ ví von".
- Tone & Persona: Đáng yêu, ngọt ngào, tràn đầy năng lượng tích cực, vibe Pastel (xanh mint, hồng phấn). Xưng là "Người Dẫn Đường" hoặc "Ta", gọi học sinh là "Nhà thám hiểm", "Thuyền trưởng ngôn từ" hoặc "Bạn nhỏ". Dùng từ ngữ vũ trụ (tinh tú, thiên thạch, năng lượng ngôn từ, quỹ đạo, hành tinh).
`;

const RETRY_MODELS: GeminiModelId[] = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

function formatGeminiError(err: any): string {
  if (!err) return 'Lỗi không xác định khi gọi AI';
  if (typeof err === 'string') return err;
  const status = err.status || err.code || err.statusCode || (err.error && err.error.code);
  const msg = err.message || (err.error && err.error.message) || JSON.stringify(err);
  if (status && !msg.includes(String(status))) {
    return `[${status}] ${msg}`;
  }
  return msg;
}

async function callGeminiDirectWithRetry<T>(
  apiKey: string,
  preferredModel: GeminiModelId,
  params: {
    contents: string;
    systemInstruction?: string;
    responseSchema?: any;
    responseMimeType?: string;
  }
): Promise<{ data: T; usedModel: string }> {
  const modelsToTry: GeminiModelId[] = Array.from(
    new Set([preferredModel, ...RETRY_MODELS])
  );

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini Retry] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction || SYSTEM_INSTRUCTION_BASE,
          responseMimeType: params.responseMimeType || 'application/json',
          responseSchema: params.responseSchema,
        },
      });

      const rawText = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawText) as T;
      return { data: parsed, usedModel: model };
    } catch (err: any) {
      const formatted = formatGeminiError(err);
      console.warn(`[Gemini Retry] Model "${model}" failed, switching to next model...`, formatted);
      lastError = err;
    }
  }

  const errMsg = formatGeminiError(lastError);
  throw new Error(errMsg);
}

export async function analyzeSentence(
  sentence: string,
  targetSense?: string,
  planetFocus?: string
): Promise<GuideAnalysis> {
  const apiKey = getStoredApiKey();
  const preferredModel = getStoredModel();

  try {
    const res = await fetch('/api/guide/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
        'x-gemini-model': preferredModel,
      },
      body: JSON.stringify({ sentence, targetSense, planetFocus }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.upgradeOptions && data.upgradeOptions.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback to client direct call
  }

  if (apiKey) {
    const prompt = `
Phân tích và nâng cấp câu văn này cho học sinh tiểu học:
"${sentence}"
${targetSense ? `Yêu cầu ưu tiên phát triển giác quan: ${targetSense}` : ''}
${planetFocus ? `Hành tinh chủ đề tập trung: ${planetFocus}` : ''}

Hãy trả về kết quả JSON theo đúng schema sau đây, tuân thủ đúng 5 phần chuẩn mực của Người Dẫn Đường Thông Thái:
1. Lời chào du hành (greeting)
2. Trạm phân tích ưu điểm (analysis)
3. 2 gợi ý nâng cấp (upgradeOptions: mảng 2 phương án với sentence, technique, sensesUsed)
4. Mẹo nhỏ từ Người Dẫn Đường (sageTip)
5. Túi thần kỳ từ vựng (magicVocabularyBag: mảng 3-5 từ với word, meaning, example, planet)
6. Thử thách tinh tú (starChallenge: quest, rewardEnergy số điểm từ 10-20, hint)
`;

    const { data } = await callGeminiDirectWithRetry<GuideAnalysis>(apiKey, preferredModel, {
      contents: prompt,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          greeting: { type: Type.STRING },
          analysis: { type: Type.STRING },
          originalSentence: { type: Type.STRING },
          upgradeOptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sentence: { type: Type.STRING },
                technique: { type: Type.STRING },
                sensesUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['sentence', 'technique', 'sensesUsed'],
            },
          },
          sageTip: { type: Type.STRING },
          magicVocabularyBag: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING },
                example: { type: Type.STRING },
                planet: { type: Type.STRING },
              },
              required: ['word', 'meaning', 'example', 'planet'],
            },
          },
          starChallenge: {
            type: Type.OBJECT,
            properties: {
              quest: { type: Type.STRING },
              rewardEnergy: { type: Type.NUMBER },
              hint: { type: Type.STRING },
            },
            required: ['quest', 'rewardEnergy', 'hint'],
          },
        },
        required: [
          'greeting',
          'analysis',
          'originalSentence',
          'upgradeOptions',
          'sageTip',
          'magicVocabularyBag',
          'starChallenge',
        ],
      },
    });

    if (!data.originalSentence) data.originalSentence = sentence;
    return data;
  }

  throw new Error('Chưa có API Key. Hãy bấm nút "Lấy API key để sử dụng app" trên thanh điều hướng để thiết lập!');
}

export async function refineSpeech(transcript: string): Promise<SpeechRefineResult> {
  const apiKey = getStoredApiKey();
  const preferredModel = getStoredModel();

  try {
    const res = await fetch('/api/guide/speech-refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
        'x-gemini-model': preferredModel,
      },
      body: JSON.stringify({ transcript }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  if (apiKey) {
    const prompt = `
Học sinh tiểu học vừa thâu âm một đoạn chia sẻ bằng giọng nói (Speech-to-Text):
"${transcript}"

Nhiệm vụ: Bộ lọc "Phép thuật ngôn từ"
1. Giữ nguyên ý tưởng cốt lõi và nét ngây thơ hồn nhiên của học sinh.
2. Tinh chỉnh cấu trúc câu cho trau chuốt, loại bỏ từ thừa thường thấy khi nói (như: à, ừm, thì, là, kiểu như, với lại...).
3. Tạo ra:
   - "cleaned": Phiên bản câu văn chuẩn mực, mượt mà, sáng sủa.
   - "poeticVersion": Phiên bản nâng cấp giàu hình ảnh, âm thanh, sử dụng kỹ thuật Show Don't Tell hoặc tu từ phù hợp với lứa tuổi 6-11.
   - "changes": Mảng các điểm đã được cải thiện (ngắn gọn, dễ hiểu cho trẻ).
   - "encouragement": Lời khen ngợi ngọt ngào, ấm áp từ Người Dẫn Đường.
   - "energyEarned": 15
`;

    const { data } = await callGeminiDirectWithRetry<SpeechRefineResult>(apiKey, preferredModel, {
      contents: prompt,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          cleaned: { type: Type.STRING },
          poeticVersion: { type: Type.STRING },
          changes: { type: Type.ARRAY, items: { type: Type.STRING } },
          encouragement: { type: Type.STRING },
          energyEarned: { type: Type.NUMBER },
        },
        required: ['original', 'cleaned', 'poeticVersion', 'changes', 'encouragement', 'energyEarned'],
      },
    });

    if (!data.original) data.original = transcript;
    return data;
  }

  throw new Error('Chưa có API Key để lọc giọng nói.');
}

export async function expandMindmap(word: string, planet?: string): Promise<MindMapData> {
  const apiKey = getStoredApiKey();
  const preferredModel = getStoredModel();

  try {
    const res = await fetch('/api/guide/mindmap-expand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
        'x-gemini-model': preferredModel,
      },
      body: JSON.stringify({ word, planet }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  if (apiKey) {
    const prompt = `
Phát triển Bản đồ tư duy từ vựng đa vũ trụ cho từ gốc: "${word}" thuộc Hành tinh: "${planet || 'Chung'}".
Dành cho học sinh tiểu học (6-11 tuổi).
Hãy chia các từ thay thế hoặc mở rộng thành 3 quỹ đạo:
1. nearOrbit (Hành tinh gần - cấp độ cơ bản, thân quen)
2. midOrbit (Quỹ đạo giữa - từ ngữ gợi cảm, biểu cảm sinh động hơn)
3. outerOrbit (Hành tinh xa xôi - từ ngữ văn chương tinh tế, giàu nhạc điệu, gợi tả đặc sắc)
Mỗi quỹ đạo có 2-3 từ, kèm giải nghĩa dễ thương và 1 câu ví dụ mẫu.
`;

    const { data } = await callGeminiDirectWithRetry<MindMapData>(apiKey, preferredModel, {
      contents: prompt,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rootWord: { type: Type.STRING },
          planet: { type: Type.STRING },
          nearOrbit: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                level: { type: Type.STRING },
                explanation: { type: Type.STRING },
                sampleSentence: { type: Type.STRING },
              },
              required: ['word', 'level', 'explanation', 'sampleSentence'],
            },
          },
          midOrbit: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                level: { type: Type.STRING },
                explanation: { type: Type.STRING },
                sampleSentence: { type: Type.STRING },
              },
              required: ['word', 'level', 'explanation', 'sampleSentence'],
            },
          },
          outerOrbit: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                level: { type: Type.STRING },
                explanation: { type: Type.STRING },
                sampleSentence: { type: Type.STRING },
              },
              required: ['word', 'level', 'explanation', 'sampleSentence'],
            },
          },
        },
        required: ['rootWord', 'planet', 'nearOrbit', 'midOrbit', 'outerOrbit'],
      },
    });

    return data;
  }

  throw new Error('Chưa có API Key để mở rộng từ vựng.');
}

export async function evaluateChallenge(
  originalQuest: string,
  originalSentence: string,
  studentAnswer: string
): Promise<{ praise: string; whyItShines: string; energyAwarded: number; badgeUnlocked?: string }> {
  const apiKey = getStoredApiKey();
  const preferredModel = getStoredModel();

  try {
    const res = await fetch('/api/guide/challenge-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
        'x-gemini-model': preferredModel,
      },
      body: JSON.stringify({ originalQuest, originalSentence, studentAnswer }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  if (apiKey) {
    const prompt = `
Đánh giá nỗ lực của học sinh tiểu học khi hoàn thành Thử thách tinh tú:
- Nhiệm vụ ban đầu: "${originalQuest || ''}"
- Câu văn gốc: "${originalSentence || ''}"
- Câu trả lời/viết tiếp của học sinh: "${studentAnswer}"

Yêu cầu Người Dẫn Đường Thông Thái:
1. Khen ngợi cụ thể chi tiết độc đáo hoặc cảm xúc trong câu của bé.
2. Giải thích vì sao chi tiết này giúp câu văn tỏa sáng (Show, Don't Tell / Tu từ).
3. Trao tặng Năng lượng Ngôn từ (energyAwarded: 15-25 điểm).
4. Huy hiệu khích lệ (badgeUnlocked, ví dụ: 'Phù Thủy Ngũ Giác', 'Bậc Thầy Gió Mây', 'Đôi Mắt Tinh Tú'...)
`;

    const { data } = await callGeminiDirectWithRetry<any>(apiKey, preferredModel, {
      contents: prompt,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          praise: { type: Type.STRING },
          whyItShines: { type: Type.STRING },
          energyAwarded: { type: Type.NUMBER },
          badgeUnlocked: { type: Type.STRING },
        },
        required: ['praise', 'whyItShines', 'energyAwarded', 'badgeUnlocked'],
      },
    });

    return data;
  }

  throw new Error('Chưa có API Key để chấm điểm thử thách.');
}

export async function suggestSentencesByTopic(topic: string): Promise<StarterPrompt[]> {
  const apiKey = getStoredApiKey();
  const preferredModel = getStoredModel();

  try {
    const res = await fetch('/api/guide/suggest-sentences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
        'x-gemini-model': preferredModel,
      },
      body: JSON.stringify({ topic }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.suggestions && data.suggestions.length > 0) {
        return data.suggestions;
      }
    }
  } catch {
    // fallback
  }

  if (apiKey) {
    const prompt = `
Hãy gợi ý 4 câu văn ngắn khởi đầu (Tell) thuộc chủ đề "${topic}" dành cho học sinh tiểu học (lớp 1 - 5).
Mỗi câu đại diện cho một hoàn cảnh, cảm xúc hoặc hình ảnh dễ thương mà học sinh có thể dùng kỹ thuật Show Don't Tell để mở rộng.
Kèm theo giác quan gợi ý phù hợp nhất (Thị giác, Thính giác, Khứu giác, Xúc giác, hoặc Vị giác) và 1 emoji liên quan.
`;

    const { data } = await callGeminiDirectWithRetry<{ suggestions: any[] }>(apiKey, preferredModel, {
      contents: prompt,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                simpleSentence: { type: Type.STRING },
                recommendedSense: { type: Type.STRING },
                emoji: { type: Type.STRING },
              },
              required: ['simpleSentence', 'recommendedSense', 'emoji'],
            },
          },
        },
        required: ['suggestions'],
      },
    });

    return (data.suggestions || []).map((s, idx) => ({
      id: `ai-suggest-${Date.now()}-${idx}`,
      category: topic,
      simpleSentence: s.simpleSentence,
      recommendedSense: s.recommendedSense as any,
      planet: 'Không gian',
      emoji: s.emoji || '✨',
    }));
  }

  throw new Error('Chưa có API Key để gợi ý câu văn.');
}
