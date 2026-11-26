import type { Language, SearchFilters } from '../types/domain';

export interface AiMatchmakerResponse {
  aiGenerated: boolean;
  summary: string;
  recommendations: Array<{
    id: string;
    entityType: 'center' | 'tutor';
    matchScore: number;
    reason: string;
    tradeoff: string;
  }>;
}

export interface AiCompareResponse {
  aiGenerated: boolean;
  verdict: string;
  bestForResults: string;
  bestForBudget: string;
  itemNotes: Array<{
    name: string;
    pros: string[];
    cons: string[];
  }>;
}

export interface AiReviewSummaryResponse {
  aiGenerated: boolean;
  overview: string;
  positivePercent: number;
  themes: Array<{
    label: string;
    sentiment: 'positive' | 'mixed' | 'negative' | string;
    detail: string;
  }>;
}

export interface AiDocumentCheckResponse {
  aiGenerated: boolean;
  humanDecisionRequired: boolean;
  extractedExam: string;
  extractedScore: string;
  extractedDate: string;
  extractedName: string;
  riskLevel: string;
  flags: string[];
  recommendation: string;
}

export interface AiSmartSearchResponse {
  aiGenerated: boolean;
  filters: Partial<SearchFilters> & { explanation?: string };
}

export interface AiDescriptionResponse {
  aiGenerated: boolean;
  headline: string;
  description: string;
  highlights: string[];
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const aiService = {
  matchmaker(profile: Record<string, unknown>, candidates: Array<Record<string, unknown>>, lang: Language) {
    return postJson<AiMatchmakerResponse>('/api/ai/matchmaker', { profile, candidates, lang });
  },

  compareVerdict(items: Array<Record<string, unknown>>, goal: string, lang: Language) {
    return postJson<AiCompareResponse>('/api/ai/compare', { items, goal, lang });
  },

  summarizeReviews(
    entityName: string,
    reviews: Array<{ rating: number; comment: string; pros?: string; cons?: string }>,
    lang: Language
  ) {
    return postJson<AiReviewSummaryResponse>('/api/ai/review-summary', { entityName, reviews, lang });
  },

  verifyDocument(payload: {
    claimedExam: string;
    claimedScore: string;
    claimedDate: string;
    studentLabel?: string;
    imageBase64?: string;
    mimeType?: string;
    lang: Language;
  }) {
    return postJson<AiDocumentCheckResponse>('/api/ai/verify-document', payload);
  },

  smartSearch(query: string, lang: Language) {
    return postJson<AiSmartSearchResponse>('/api/ai/smart-search', { query, lang });
  },

  writeDescription(payload: {
    name: string;
    subjects: string[];
    strengths: string;
    city: string;
    lang: Language;
  }) {
    return postJson<AiDescriptionResponse>('/api/ai/description-writer', payload);
  },
};
