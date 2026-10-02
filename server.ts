import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

function getAiClient(clientApiKey?: string) {
  const key = (clientApiKey && clientApiKey.trim()) || process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractRequestCredentials(req: express.Request) {
  const apiKey =
    (req.headers['x-gemini-api-key'] as string) ||
    (req.body?.apiKey as string) ||
    '';
  const preferredModel =
    (req.headers['x-gemini-model'] as string) ||
    (req.body?.model as string) ||
    DEFAULT_MODEL;
  return { apiKey, preferredModel };
}

async function generateWithFallback(
  aiClient: GoogleGenAI,
  preferredModel: string,
  params: { contents: any; config: any }
) {
  const modelsToTry = Array.from(
    new Set([preferredModel, ...FALLBACK_MODELS].filter(Boolean))
  );
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { response, usedModel: model };
    } catch (err: any) {
      console.warn(`[Gemini Retry] Model "${model}" failed, switching to next model...`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

const SYSTEM_INSTRUCTION_BASE = `
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

// Helper for fallback response if API key is not present or error occurs
function getFallbackAnalysis(sentence: string) {
  return {
    greeting: "Chào mừng Nhà thám hiểm dũng cảm đã ghé thăm Trạm Không Gian Ngôn Từ! ✨ Radar của ta vừa bắt được một tín hiệu ý tưởng rất lấp lánh từ con!",
    analysis: `Ta rất thích cách con đã chọn chủ đề này! Câu văn "${sentence}" của con đã có sẵn một hạt mầm cảm xúc tuyệt vời đang chờ bung nở thành đóa hoa rực rỡ.`,
    originalSentence: sentence,
    upgradeOptions: [
      {
        sentence: `Từng tia nắng ấm áp khẽ chạm vào vạn vật, như bàn tay dịu dàng của mẹ thiên nhiên đang đánh thức muôn loài bừng tỉnh sau giấc ngủ say.`,
        technique: "Show, Don't Tell - Hình ảnh & Xúc giác",
        sensesUsed: ["Thị giác", "Xúc giác"],
      },
      {
        sentence: `Cả không gian rộn ràng như một bản hòa ca tí tách, khi những giọt mưa tinh nghịch cùng nhau khiêu vũ trên phiến lá biếc xanh.`,
        technique: "Biến thiên nhiên thành người bạn biết khiêu vũ (Nhân hóa)",
        sensesUsed: ["Thính giác", "Thị giác"],
      },
    ],
    sageTip: "Khi con thêm một chút âm thanh hoặc màu sắc, câu văn của con sẽ như một thước phim hoạt hình sống động chuyển động ngay trước mắt người đọc đấy!",
    magicVocabularyBag: [
      {
        word: "Lấp lánh",
        meaning: "Tỏa ra ánh sáng nhỏ, chớp nháy liên hồi đầy mê hoặc",
        example: "Mặt hồ lấp lánh như dát muôn ngàn mảnh kim cương.",
        planet: "Không gian",
      },
      {
        word: "Rộn rã",
        meaning: "Âm thanh nhiều và vui vẻ vang lên liên tục",
        example: "Tiếng cười rộn rã khắp khoang tàu thám hiểm.",
        planet: "Hành động",
      },
      {
        word: "Hân hoan",
        meaning: "Cảm giác vui sướng, phấn khởi dạt dào từ sâu trong lòng",
        example: "Lòng em hân hoan khi chạm tay vào ngôi sao ước mơ.",
        planet: "Tâm trạng",
      },
      {
        word: "Bảng lảng",
        meaning: "Chập chờn, mờ ảo như sương sớm hay khói mây",
        example: "Sương mù bảng lảng trôi trên sườn đồi tím biếc.",
        planet: "Thời tiết",
      },
    ],
    starChallenge: {
      quest: `Con có thể thêm vào câu văn một chi tiết về âm thanh (ví dụ: tiếng gió xào xạc hay tiếng cười ríu rít) để nạp thêm 15 Năng Lượng Ngôn Từ không?`,
      rewardEnergy: 15,
      hint: "Hãy thử lắng tai nghe xem xung quanh cảnh tượng đó đang phát ra âm thanh gì nào!",
    },
  };
}

// 0. Endpoint: Check API Key & Model Health
app.post('/api/check-api-key', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    const ai = getAiClient(apiKey);
    if (!ai) {
      return res.status(400).json({ ok: false, error: 'Chưa có Gemini API Key. Hãy nhập key của bạn nhé!' });
    }

    const targetModel = model || DEFAULT_MODEL;
    const result = await ai.models.generateContent({
      model: targetModel,
      contents: 'Nói "Sẵn sàng" thật ngắn gọn.',
    });

    res.json({
      ok: true,
      model: targetModel,
      message: 'Kết nối thành công! ' + (result.text?.trim() || ''),
    });
  } catch (error: any) {
    console.error('Error in /api/check-api-key:', error);
    res.status(400).json({
      ok: false,
      error: error?.message || 'API key không hợp lệ hoặc đã hết hạn mức',
    });
  }
});

// 1. Endpoint: Main Sentence Analysis & Crafting (Xưởng Chế Tác Câu Chữ)
app.post('/api/guide/analyze', async (req, res) => {
  try {
    const { sentence, targetSense, planetFocus } = req.body;
    const { apiKey, preferredModel } = extractRequestCredentials(req);
    const ai = getAiClient(apiKey);

    if (!sentence || typeof sentence !== 'string') {
      return res.status(400).json({ error: 'Sentence is required' });
    }

    if (!ai) {
      return res.json(getFallbackAnalysis(sentence));
    }

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

    const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
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
                  sensesUsed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
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
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (!parsed.originalSentence) parsed.originalSentence = sentence;
    parsed._usedModel = usedModel;
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/guide/analyze:', error);
    res.json(getFallbackAnalysis(req.body?.sentence || 'Hôm nay trời rất đẹp'));
  }
});

// 2. Endpoint: Speech-to-Text Refinement (Bộ lọc Phép Thuật Ngôn Từ)
app.post('/api/guide/speech-refine', async (req, res) => {
  try {
    const { transcript } = req.body;
    const { apiKey, preferredModel } = extractRequestCredentials(req);
    const ai = getAiClient(apiKey);

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!ai) {
      return res.json({
        original: transcript,
        cleaned: transcript.replace(/(ừm|à|thì|là|kiểu như|cơ mà)/gi, '').trim(),
        poeticVersion: `Mỗi chi tiết nhỏ con vừa kể đều ẩn chứa một bí mật diệu kỳ: ${transcript}`,
        changes: ['Loại bỏ từ thừa khi nói', 'Làm câu văn trôi chảy và trong trẻo'],
        encouragement: 'Lời nói của con chứa đầy cảm xúc tự nhiên, sau khi gọt giũa thì sáng lấp lánh như kim cương!',
        energyEarned: 15,
      });
    }

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

    const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            cleaned: { type: Type.STRING },
            poeticVersion: { type: Type.STRING },
            changes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            encouragement: { type: Type.STRING },
            energyEarned: { type: Type.NUMBER },
          },
          required: ['original', 'cleaned', 'poeticVersion', 'changes', 'encouragement', 'energyEarned'],
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || '{}');
    if (!data.original) data.original = transcript;
    data._usedModel = usedModel;
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/guide/speech-refine:', error);
    res.json({
      original: req.body?.transcript || '',
      cleaned: req.body?.transcript || '',
      poeticVersion: req.body?.transcript || '',
      changes: ['Gọt giũa câu từ thêm trong sáng'],
      encouragement: 'Con đã diễn đạt rất tự tin và chân thực!',
      energyEarned: 10,
    });
  }
});

// 3. Endpoint: Planet Lexicon Mindmap Expansion (Bản Đồ Tư Duy Từ Vựng)
app.post('/api/guide/mindmap-expand', async (req, res) => {
  try {
    const { word, planet } = req.body;
    const { apiKey, preferredModel } = extractRequestCredentials(req);
    const ai = getAiClient(apiKey);

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    if (!ai) {
      return res.json({
        rootWord: word,
        planet: planet || 'Tâm trạng',
        nearOrbit: [
          { word: 'Vui vẻ', level: 'Hành tinh gần', explanation: 'Tâm trạng thoải mái, cười tươi', sampleSentence: 'Bé vui vẻ chạy vào lớp học.' },
          { word: 'Tươi tắn', level: 'Hành tinh gần', explanation: 'Nét mặt rạng rỡ đầy sức sống', sampleSentence: 'Khuôn mặt em tươi tắn đón chào bình minh.' },
        ],
        midOrbit: [
          { word: 'Hân hoan', level: 'Quỹ đạo giữa', explanation: 'Vui sướng rộn ràng trong tim', sampleSentence: 'Cả lớp hân hoan reo hò khi nhận sao thưởng.' },
          { word: 'Phấn chấn', level: 'Quỹ đạo giữa', explanation: 'Tinh thần hào hứng, tràn đầy năng lượng', sampleSentence: 'Bước chân em phấn chấn trên con đường quen thuộc.' },
        ],
        outerOrbit: [
          { word: 'Rạo rực', level: 'Hành tinh xa xôi', explanation: 'Niềm vui náo nức cuộn trào bên trong', sampleSentence: 'Mùa xuân về khiến lòng người rạo rực những ước mơ bay xa.' },
          { word: 'Ngập tràn ánh sáng', level: 'Hành tinh xa xôi', explanation: 'Ẩn dụ cho niềm hạnh phúc bao la', sampleSentence: 'Trái tim nhỏ như ngập tràn ánh sáng ngàn vì sao.' },
        ],
      });
    }

    const prompt = `
Phát triển Bản đồ tư duy từ vựng đa vũ trụ cho từ gốc: "${word}" thuộc Hành tinh: "${planet || 'Chung'}".
Dành cho học sinh tiểu học (6-11 tuổi).
Hãy chia các từ thay thế hoặc mở rộng thành 3 quỹ đạo:
1. nearOrbit (Hành tinh gần - cấp độ cơ bản, thân quen)
2. midOrbit (Quỹ đạo giữa - từ ngữ gợi cảm, biểu cảm sinh động hơn)
3. outerOrbit (Hành tinh xa xôi - từ ngữ văn chương tinh tế, giàu nhạc điệu, gợi tả đặc sắc)
Mỗi quỹ đạo có 2-3 từ, kèm giải nghĩa dễ thương và 1 câu ví dụ mẫu.
`;

    const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
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
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed._usedModel = usedModel;
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/guide/mindmap-expand:', error);
    res.status(500).json({ error: 'Failed to generate mindmap' });
  }
});

// 4. Endpoint: Challenge Feedback & Star Energy Award
app.post('/api/guide/challenge-feedback', async (req, res) => {
  try {
    const { originalQuest, studentAnswer, originalSentence } = req.body;
    const { apiKey, preferredModel } = extractRequestCredentials(req);
    const ai = getAiClient(apiKey);

    if (!studentAnswer) {
      return res.status(400).json({ error: 'Student answer is required' });
    }

    if (!ai) {
      return res.json({
        praise: 'Tuyệt đỉnh thám hiểm! Con đã bổ sung một chi tiết vô cùng sống động!',
        whyItShines: `Câu viết "${studentAnswer}" của con đã làm cho bức tranh câu chữ bừng sáng rực rỡ, người đọc như được hòa mình vào khoảnh khắc đó!`,
        energyAwarded: 20,
        badgeUnlocked: 'Ngôi Sao Sáng Tạo',
      });
    }

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

    const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
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
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed._usedModel = usedModel;
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/guide/challenge-feedback:', error);
    res.json({
      praise: 'Tuyệt vời lắm Nhà thám hiểm nhỏ! Câu chữ của con thật đầy ắp cảm xúc!',
      whyItShines: 'Con đã biết quan sát thế giới xung quanh bằng trái tim rộng mở.',
      energyAwarded: 20,
      badgeUnlocked: 'Ngôi Sao Tinh Tú',
    });
  }
});

// 5. Endpoint: Text-to-Speech in natural Vietnamese using Gemini TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ fallback: true, message: 'No GEMINI_API_KEY, use client speech' });
    }

    // Clean markdown/symbols
    const cleanText = text.replace(/[*#_~`]/g, '').trim().slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Giọng đọc tiếng Việt truyền cảm, trong trẻo, ấm áp và vui tươi như cô giáo tiểu học hoặc người bạn thông thái',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    return res.json({ fallback: true });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return res.json({ fallback: true, error: error?.message });
  }
});

// 6. Endpoint: Suggest Sentences by Student Topic (Gợi ý câu văn theo chủ đề học sinh cần)
app.post('/api/guide/suggest-sentences', async (req, res) => {
  try {
    const { topic } = req.body;
    const { apiKey, preferredModel } = extractRequestCredentials(req);
    const ai = getAiClient(apiKey);

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const cleanTopic = topic.trim();

    // Fallback if no AI client
    if (!ai) {
      return res.json({
        topic: cleanTopic,
        suggestions: [
          {
            id: 'suggest-1-' + Date.now(),
            category: cleanTopic,
            simpleSentence: `${cleanTopic} trông rất đẹp và quen thuộc với em.`,
            recommendedSense: 'Thị giác',
            planet: 'Không gian',
            emoji: '✨',
          },
          {
            id: 'suggest-2-' + Date.now(),
            category: cleanTopic,
            simpleSentence: `Em cảm thấy rất vui và ấm áp mỗi khi nhìn thấy ${cleanTopic.toLowerCase()}.`,
            recommendedSense: 'Xúc giác',
            planet: 'Tâm trạng',
            emoji: '💖',
          },
          {
            id: 'suggest-3-' + Date.now(),
            category: cleanTopic,
            simpleSentence: `Xung quanh ${cleanTopic.toLowerCase()} vang lên những âm thanh rộn rã.`,
            recommendedSense: 'Thính giác',
            planet: 'Hành động',
            emoji: '🎶',
          },
        ],
      });
    }

    const prompt = `
Chủ đề học sinh tiểu học (6-11 tuổi) cần viết văn: "${cleanTopic}"

Nhiệm vụ của Người Dẫn Đường Thông Thái:
Hãy gợi ý 3-4 câu văn khởi đầu đơn giản (câu kể cơ bản/câu Tell) liên quan chặt chẽ đến chủ đề này, để học sinh có thể mang vào "Xưởng Chế Tác Câu Chữ" nâng cấp thành câu gợi tả (Show, Don't Tell).
Mỗi gợi ý gồm:
- simpleSentence: Câu văn ngắn gọn, trong sáng, tự nhiên của học sinh tiểu học (ví dụ: "Cây bàng mùa đông rụng hết lá", "Chú cún chạy nhảy khắp sân", "Mẹ nấu bữa cơm chiều thật ấm áp"...)
- recommendedSense: Giác quan phù hợp nhất để nâng cấp (chọn 1 trong 5: Thị giác, Thính giác, Khứu giác, Xúc giác, Vị giác)
- planet: Hành tinh ngôn từ (chọn 1 trong 4: Không gian, Tâm trạng, Hành động, Thời tiết)
- emoji: Một biểu tượng cảm xúc minh họa phù hợp (ví dụ: 🌳, 🐶, 🍲, 🎨, ☀️...)
- category: Tên chủ đề ngắn gọn (${cleanTopic})
`;

    const { response, usedModel } = await generateWithFallback(ai, preferredModel, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  simpleSentence: { type: Type.STRING },
                  recommendedSense: { type: Type.STRING },
                  planet: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['simpleSentence', 'recommendedSense', 'planet', 'emoji', 'category'],
              },
            },
          },
          required: ['topic', 'suggestions'],
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || '{}');
    const suggestionsWithId = (data.suggestions || []).map((item: any, idx: number) => ({
      ...item,
      id: `ai-suggest-${Date.now()}-${idx}`,
      category: item.category || cleanTopic,
    }));

    res.json({
      topic: cleanTopic,
      suggestions: suggestionsWithId,
      _usedModel: usedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/guide/suggest-sentences:', error);
    res.json({
      topic: req.body?.topic || 'Chủ đề của em',
      suggestions: [
        {
          id: 'suggest-fallback-1-' + Date.now(),
          category: req.body?.topic || 'Chủ đề của em',
          simpleSentence: `${req.body?.topic || 'Cảnh vật'} để lại trong lòng em rất nhiều kỷ niệm đẹp.`,
          recommendedSense: 'Thị giác',
          planet: 'Không gian',
          emoji: '🌟',
        },
      ],
    });
  }
});

// Vite middleware / static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hành Trình Đa Vũ Trụ Ngôn Từ server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
