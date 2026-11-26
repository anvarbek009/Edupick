import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sendGeminiError(res: express.Response, err: unknown) {
  const message = err instanceof Error ? err.message : 'Unexpected Gemini API error';
  const status =
    message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
      ? 429
      : message.includes('403') || message.includes('PERMISSION_DENIED')
        ? 403
        : message.includes('400') || message.includes('API_KEY_INVALID')
          ? 400
          : 502;
  res.status(status).json({
    error: message,
    code: status === 429 ? 'QUOTA_EXCEEDED' : status === 403 || status === 400 ? 'AUTH_ERROR' : 'UPSTREAM_ERROR',
  });
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  });

  // 1. AI Matchmaker: Grounded recommendation shortlist from existing entities only
  app.post('/api/ai/matchmaker', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Check Settings > Secrets.',
        code: 'MISSING_API_KEY',
      });
      return;
    }
    try {
      const { profile, candidates, lang = 'uz' } = req.body as {
        profile: Record<string, unknown>;
        candidates: Array<Record<string, unknown>>;
        lang?: string;
      };
      if (!Array.isArray(candidates) || candidates.length === 0) {
        res.status(400).json({ error: 'Candidate list is required for grounded recommendations.' });
        return;
      }

      const langLabel = lang === 'ru' ? 'Russian' : lang === 'en' ? 'English' : 'Uzbek (Latin script)';
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: JSON.stringify({ studentProfile: profile, availableCatalog: candidates.slice(0, 24) }),
        config: {
          systemInstruction:
            `You are Edupick's unbiased education advisor for Uzbekistan. Respond strictly in ${langLabel}. ` +
            'You MUST ONLY recommend entities whose exact id appears in availableCatalog. Never invent centers, tutors, prices, or scores. ' +
            'Return top 3 to 5 ranked recommendations with honest trade-offs grounded in verified student outcomes, price in UZS, district, and schedule.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    entityType: { type: Type.STRING },
                    matchScore: { type: Type.INTEGER },
                    reason: { type: Type.STRING },
                    tradeoff: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const validIds = new Set(candidates.map((c) => String(c.id)));
      const grounded = Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter((r: { id?: string }) => r?.id && validIds.has(String(r.id)))
        : [];
      res.json({
        aiGenerated: true,
        summary: parsed.summary || '',
        recommendations: grounded,
      });
    } catch (err) {
      sendGeminiError(res, err);
    }
  });

  // 2. AI Compare Summary: Plain-language verdict across selected centers/tutors
  app.post('/api/ai/compare', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
      return;
    }
    try {
      const { items, goal, lang = 'uz' } = req.body as {
        items: Array<Record<string, unknown>>;
        goal?: string;
        lang?: string;
      };
      if (!Array.isArray(items) || items.length < 2) {
        res.status(400).json({ error: 'At least 2 items are required for comparison.' });
        return;
      }
      const langLabel = lang === 'ru' ? 'Russian' : lang === 'en' ? 'English' : 'Uzbek (Latin script)';
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: JSON.stringify({ userGoal: goal || 'Best verified learning outcome for budget', comparedItems: items }),
        config: {
          systemInstruction:
            `You are an objective comparison analyst for Edupick Uzbekistan. Respond strictly in ${langLabel}. ` +
            'Compare ONLY the provided items using their real metrics (verified results, price per month, price per lesson, rating, class size, schedule). ' +
            'Highlight clearly which option fits fast target scores, which fits tight budgets, and key pros/cons.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING },
              bestForResults: { type: Type.STRING },
              bestForBudget: { type: Type.STRING },
              itemNotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
              },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ aiGenerated: true, ...parsed });
    } catch (err) {
      sendGeminiError(res, err);
    }
  });

  // 3. AI Review Summarizer: Themes and sentiment across verified reviews
  app.post('/api/ai/review-summary', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
      return;
    }
    try {
      const { entityName, reviews, lang = 'uz' } = req.body as {
        entityName: string;
        reviews: Array<{ rating: number; comment: string; pros?: string; cons?: string }>;
        lang?: string;
      };
      if (!Array.isArray(reviews) || reviews.length === 0) {
        res.status(400).json({ error: 'Reviews array is required.' });
        return;
      }
      const langLabel = lang === 'ru' ? 'Russian' : lang === 'en' ? 'English' : 'Uzbek (Latin script)';
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: JSON.stringify({ entityName, reviews: reviews.slice(0, 40) }),
        config: {
          systemInstruction:
            `Summarize verified student reviews for ${entityName} strictly in ${langLabel}. ` +
            'Extract recurring themes, sentiment percentages, top strengths, and recurring complaints. Be concise and factual.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              positivePercent: { type: Type.INTEGER },
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    sentiment: { type: Type.STRING },
                    detail: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ aiGenerated: true, ...parsed });
    } catch (err) {
      sendGeminiError(res, err);
    }
  });

  // 4. AI Result Document Checker (Admin Assist, Vision + Metadata cross-check)
  app.post('/api/ai/verify-document', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
      return;
    }
    try {
      const { claimedExam, claimedScore, claimedDate, studentLabel, imageBase64, mimeType, lang = 'uz' } = req.body as {
        claimedExam: string;
        claimedScore: string;
        claimedDate: string;
        studentLabel?: string;
        imageBase64?: string;
        mimeType?: string;
        lang?: string;
      };

      const langLabel = lang === 'ru' ? 'Russian' : lang === 'en' ? 'English' : 'Uzbek (Latin script)';
      const promptText =
        `Admin verification assist. Claimed result: exam=${claimedExam}, score=${claimedScore}, date=${claimedDate}, student=${studentLabel || 'Anonymous'}. ` +
        `Respond strictly in ${langLabel}. Inspect the uploaded certificate evidence (if present) or metadata consistency. ` +
        'Extract visible exam, score, candidate name, and test date. Flag any mismatch, impossible score scale, or signs of tampering. Remind the moderator that a human makes the final decision.';

      const parts: Array<Record<string, unknown>> = [{ text: promptText }];
      if (imageBase64 && mimeType && mimeType.startsWith('image/')) {
        const cleanData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.unshift({
          inlineData: {
            mimeType,
            data: cleanData,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedExam: { type: Type.STRING },
              extractedScore: { type: Type.STRING },
              extractedDate: { type: Type.STRING },
              extractedName: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
              flags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ aiGenerated: true, humanDecisionRequired: true, ...parsed });
    } catch (err) {
      sendGeminiError(res, err);
    }
  });

  // 5. AI Smart Search: Natural language query -> structured search filters
  app.post('/api/ai/smart-search', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
      return;
    }
    try {
      const { query, lang = 'uz' } = req.body as { query: string; lang?: string };
      if (!query || query.trim().length < 2) {
        res.status(400).json({ error: 'Search query is required.' });
        return;
      }
      const langLabel = lang === 'ru' ? 'Russian' : lang === 'en' ? 'English' : 'Uzbek (Latin script)';
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: query,
        config: {
          systemInstruction:
            'Parse a natural-language Uzbekistan education search query (in Uzbek, Russian, or English) into structured Edupick filters. ' +
            'Valid subjects: ielts, cefr, toefl, english, russian, korean, german, math, physics, chemistry, biology, dtm, sat, web, python, design, data, kids, arts. ' +
            'Valid cities: tashkent, samarkand, bukhara, andijan, namangan, fergana, nukus. ' +
            'Valid Tashkent districts: chilonzor, yunusobod, mirzo-ulugbek, yakkasaroy, sergeli, shayxontohur, olmazor, mirobod, uchtepa. ' +
            'Valid format: offline, online, hybrid, or empty string. Valid schedule: morning, evening, weekend, or empty string. ' +
            `Also include a short explanation string in ${langLabel}.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              city: { type: Type.STRING },
              district: { type: Type.STRING },
              maxPrice: { type: Type.INTEGER },
              format: { type: Type.STRING },
              schedule: { type: Type.STRING },
              freeTrialOnly: { type: Type.BOOLEAN },
              explanation: { type: Type.STRING },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ aiGenerated: true, filters: parsed });
    } catch (err) {
      sendGeminiError(res, err);
    }
  });

  // 6. AI Description Writer for learning centers & tutors
  app.post('/api/ai/description-writer', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
      return;
    }
    try {
      const { name, subjects, strengths, city, lang = 'uz' } = req.body as {
        name: string;
        subjects: string[];
        strengths: string;
        city: string;
        lang?: string;
      };
      const langLabel = lang === 'ru' ? 'Russian' : lang === 'en' ? 'English' : 'Uzbek (Latin script)';
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: JSON.stringify({ name, subjects, strengths, city }),
        config: {
          systemInstruction:
            `Write a trustworthy, factual, non-hyped learning center/tutor profile description in ${langLabel} for Edupick Uzbekistan. ` +
            'Focus on teaching methodology, student outcomes, transparency, and who the courses fit best. Keep it under 110 words.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              description: { type: Type.STRING },
              highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ aiGenerated: true, ...parsed });
    } catch (err) {
      sendGeminiError(res, err);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });

    // HMR/WebSockets are disabled in this environment; intercept /@vite/client so
    // Vite 6 never attempts an unreachable ws://*:24678 connection while keeping
    // CSS style injection and import.meta.hot APIs intact.
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();

export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else {
    style.textContent = content;
  }
}

export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}

export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}

export function injectQuery(url, queryToInject) {
  if (!url.startsWith('.') && !url.startsWith('/')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + queryToInject;
}

export class ErrorOverlay extends HTMLElement {}
`);
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Edupick server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start Edupick server:', err);
  process.exit(1);
});
