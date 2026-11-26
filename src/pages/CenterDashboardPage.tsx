import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  FileCheck,
  Inbox,
  MessageSquare,
  Phone,
  QrCode,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import {
  LeadStatus,
  PlanTier,
  UserRole,
} from '../types/domain';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { formatUzs } from '../utils/format';
import { aiService } from '../services/aiService';
import { useSEO } from '../hooks/useSEO';

export const CenterDashboardPage: React.FC = () => {
  const {
    language,
    user,
    quickDemoLogin,
    centers,
    leads,
    results,
    reviews,
    updateLeadStatus,
    submitResultForVerification,
    replyToReview,
    updateCenterProfile,
    upgradeCenterPlan,
    pushToast,
  } = useAppStore();
  const t = getDictionary(language);

  useSEO({
    title: t.dashboard.centerTitle,
    description: t.dashboard.centerTitle,
  });

  const managedCenter = useMemo(
    () => centers.find((c) => c.id === user?.managedEntityId) || centers[0],
    [centers, user]
  );

  const [tab, setTab] = useState<'leads' | 'results' | 'analytics' | 'reviews' | 'profile' | 'plans'>('leads');

  // Results upload form state
  const [resStudent, setResStudent] = useState('');
  const [resConsent, setResConsent] = useState(true);
  const [resExam, setResExam] = useState('IELTS');
  const [resScore, setResScore] = useState('7.5');
  const [resBefore, setResBefore] = useState('6.0');
  const [resUni, setResUni] = useState('WIUT (Westminster Tashkent)');
  const [resFileName, setResFileName] = useState('ielts_trf_2026.jpg');
  const [resImageBase64, setResImageBase64] = useState<string | undefined>(undefined);

  // AI Description writer state
  const [strengthsInput, setStrengthsInput] = useState('Haftalik to‘liq IELTS mock test, CELTA ustozlar, 88% 7.0+ natija');
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiDescPreview, setAiDescPreview] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  if (!user || (user.role !== UserRole.CENTER && user.role !== UserRole.TUTOR && user.role !== UserRole.ADMIN)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.dashboard.centerTitle}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          O‘quv markazi CRM arizalari, natijalar menejeri va analitikani ko‘rish uchun markaz rahbari sifatida kiring.
        </p>
        <button
          type="button"
          onClick={() => quickDemoLogin(UserRole.CENTER)}
          className="h-11 rounded-xl bg-[#3B4CCA] px-6 text-sm font-semibold text-white"
        >
          Demo Markaz Rahbari sifatida kirish ({managedCenter.name})
        </button>
      </div>
    );
  }

  const centerLeads = leads.filter((l) => l.entityId === managedCenter.id);
  const centerResults = results.filter((r) => r.entityId === managedCenter.id);
  const centerReviews = reviews.filter((r) => r.entityId === managedCenter.id);

  const marketAvgPrice = Math.round(
    centers.reduce((s, c) => s + c.priceFromUzs, 0) / Math.max(1, centers.length)
  );

  const funnelData = [
    { stage: 'Impressions', count: Math.round(managedCenter.impressionsCount / 20) },
    { stage: 'Profile Views', count: Math.round(managedCenter.viewsCount / 5) },
    { stage: 'Compared', count: managedCenter.compareAppearances },
    { stage: 'Trial Leads', count: centerLeads.length * 14 },
    { stage: 'Enrolled', count: Math.max(12, centerLeads.filter((l) => l.status === LeadStatus.ENROLLED).length * 14) },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setResImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadResult = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(resScore) || 7.0;
    submitResultForVerification({
      entityId: managedCenter.id,
      entityType: 'center',
      entityName: managedCenter.name,
      exam: resExam,
      subjectId: managedCenter.subjects[0] || 'ielts',
      scoreLabel: `${resExam} ${resScore}`,
      numericScore: numeric,
      beforeScore: Number(resBefore) || undefined,
      targetReached: true,
      universityAdmitted: resUni.trim() || undefined,
      cohortYear: 2026,
      sampleSize: 28,
      studentDisplayName: resConsent && resStudent.trim() ? resStudent.trim() : 'Anonim talaba',
      studentConsentGiven: resConsent,
      evidenceSummary: `Uploaded certificate: ${resFileName}`,
      evidenceFileName: resFileName,
      evidenceImageData: resImageBase64,
    });
    setResStudent('');
    setResImageBase64(undefined);
  };

  const handleAiDescription = async () => {
    setAiDescLoading(true);
    try {
      const resp = await aiService.writeDescription({
        name: managedCenter.name,
        subjects: managedCenter.subjects,
        strengths: strengthsInput,
        city: managedCenter.branches[0].cityId,
        lang: language,
      });
      setAiDescPreview(resp.description);
    } catch (err) {
      pushToast(`${t.ai.apiErrorPrefix}${err instanceof Error ? err.message : 'Error'}`, 'error');
    } finally {
      setAiDescLoading(false);
    }
  };

  const reviewQrUrl = `${window.location.origin}/center/${managedCenter.slug}?reviewCode=ATT-2026`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400">B2B Partner Cabinet</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {managedCenter.name}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <VerifiedBadge level={managedCenter.verificationLevel} interactive />
            <span className="text-xs text-slate-500">Plan: {managedCenter.planTier.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'leads' as const, label: `${t.dashboard.leadsInbox} (${centerLeads.length})`, Icon: Inbox },
            { id: 'results' as const, label: `${t.dashboard.resultsManager} (${centerResults.length})`, Icon: FileCheck },
            { id: 'analytics' as const, label: t.dashboard.analytics, Icon: BarChart3 },
            { id: 'reviews' as const, label: t.dashboard.reviewsManager, Icon: MessageSquare },
            { id: 'profile' as const, label: t.dashboard.onboardingProfile, Icon: Sparkles },
            { id: 'plans' as const, label: t.dashboard.plansBilling, Icon: CreditCard },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 border-b-2 px-4 text-xs font-semibold whitespace-nowrap ${
                tab === item.id
                  ? 'border-[#3B4CCA] text-[#3B4CCA] dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <item.Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CRM LEADS INBOX */}
      {tab === 'leads' && (
        <div className="space-y-4">
          {centerLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {lead.studentName}
                  </h3>
                  <span className="text-xs font-semibold text-[#3B4CCA]">{lead.subject}</span>
                  <span className="text-xs text-slate-500">· {lead.goal}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  {lead.phone} {lead.telegram ? `· ${lead.telegram}` : ''} · Slot: {lead.preferredSlot}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{lead.notes}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold"
                >
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                {lead.telegram && (
                  <a
                    href={`https://t.me/${lead.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-sky-200 dark:border-sky-800 px-3 text-xs font-semibold text-sky-700 dark:text-sky-400"
                  >
                    <Send className="h-3.5 w-3.5" /> Telegram
                  </a>
                )}
                <label className="sr-only" htmlFor={`lead-st-${lead.id}`}>
                  Lead status
                </label>
                <select
                  id={`lead-st-${lead.id}`}
                  value={lead.status}
                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold"
                >
                  <option value={LeadStatus.NEW}>New</option>
                  <option value={LeadStatus.CONTACTED}>Contacted</option>
                  <option value={LeadStatus.TRIAL_BOOKED}>Trial booked</option>
                  <option value={LeadStatus.ATTENDED}>Attended</option>
                  <option value={LeadStatus.ENROLLED}>Enrolled</option>
                  <option value={LeadStatus.LOST}>Lost</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RESULTS MANAGER */}
      {tab === 'results' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleUploadResult}
            className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 self-start"
          >
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#3B4CCA]" /> Yangi natija yuklash
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="rm-exam" className="block text-xs font-semibold">Imtihon</label>
                <select
                  id="rm-exam"
                  value={resExam}
                  onChange={(e) => setResExam(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
                >
                  <option>IELTS</option>
                  <option>SAT</option>
                  <option>DTM</option>
                  <option>CEFR</option>
                  <option>TOPIK</option>
                </select>
              </div>
              <div>
                <label htmlFor="rm-score" className="block text-xs font-semibold">Yakuniy ball</label>
                <input
                  id="rm-score"
                  required
                  value={resScore}
                  onChange={(e) => setResScore(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="rm-before" className="block text-xs font-semibold">Boshlang‘ich ball</label>
                <input
                  id="rm-before"
                  value={resBefore}
                  onChange={(e) => setResBefore(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono"
                />
              </div>
              <div>
                <label htmlFor="rm-student" className="block text-xs font-semibold">Talaba (ixtiyoriy)</label>
                <input
                  id="rm-student"
                  value={resStudent}
                  onChange={(e) => setResStudent(e.target.value)}
                  placeholder="Anonim qoldirish mumkin"
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
                />
              </div>
            </div>
            <div>
              <label htmlFor="rm-uni" className="block text-xs font-semibold">Qabul qilingan OTM (ixtiyoriy)</label>
              <input
                id="rm-uni"
                value={resUni}
                onChange={(e) => setResUni(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
              />
            </div>
            <div>
              <label htmlFor="rm-file" className="block text-xs font-semibold">Sertifikat rasmi / PDF</label>
              <input
                id="rm-file"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="mt-1 w-full text-xs text-slate-600"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={resConsent}
                onChange={(e) => setResConsent(e.target.checked)}
                className="h-4 w-4 accent-[#3B4CCA]"
              />
              <span>Talaba ismini ko‘rsatishga rozilik bergan</span>
            </label>
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#3B4CCA] text-xs font-semibold text-white hover:bg-[#2E3CA8]"
            >
              Tasdiqlashga yuborish
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 text-sm font-bold">
              Yuklangan natijalar va holat ({centerResults.length})
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
              {centerResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {r.studentDisplayName} · <span className="font-mono text-[#3B4CCA]">{r.scoreLabel}</span>
                    </p>
                    <p className="text-slate-500">
                      Status: <strong className="uppercase">{r.moderationStatus}</strong> · {r.evidenceSummary}
                    </p>
                  </div>
                  <VerifiedBadge level={r.verificationLevel} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & COMPETITOR BENCHMARK */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500">Search Impressions</p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                {managedCenter.impressionsCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500">Profile Views</p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                {managedCenter.viewsCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500">Compare Appearances</p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                {managedCenter.compareAppearances}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500">Bozor o‘rtacha narxi</p>
              <p className="mt-1 font-display text-lg font-extrabold text-emerald-600 tabular-nums">
                {formatUzs(managedCenter.priceFromUzs, language)}
              </p>
              <p className="text-[11px] text-slate-500 tabular-nums">
                Bozor o‘rtachasi: {formatUzs(marketAvgPrice, language)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display text-base font-bold mb-4">Lead Conversion Funnel</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B4CCA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS & QR */}
      {tab === 'reviews' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 self-start">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#3B4CCA]" /> Talabalardan sharh so‘rash QR
            </h2>
            <p className="text-xs text-slate-500">
              Ushbu QR kodni sinf xonasiga osib qo‘ying — faqat haqiqiy talabalar tasdiqlangan sharh qoldiradi.
            </p>
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-3">
              <svg viewBox="0 0 21 21" className="h-full w-full text-slate-900" aria-label="Center review QR code">
                <rect x="0" y="0" width="7" height="7" fill="currentColor" />
                <rect x="1" y="1" width="5" height="5" fill="white" />
                <rect x="2" y="2" width="3" height="3" fill="currentColor" />
                <rect x="14" y="0" width="7" height="7" fill="currentColor" />
                <rect x="15" y="1" width="5" height="5" fill="white" />
                <rect x="16" y="2" width="3" height="3" fill="currentColor" />
                <rect x="0" y="14" width="7" height="7" fill="currentColor" />
                <rect x="1" y="15" width="5" height="5" fill="white" />
                <rect x="2" y="16" width="3" height="3" fill="currentColor" />
                <rect x="9" y="2" width="3" height="3" fill="currentColor" />
                <rect x="9" y="8" width="4" height="4" fill="currentColor" />
                <rect x="14" y="10" width="3" height="3" fill="currentColor" />
                <rect x="10" y="15" width="4" height="4" fill="currentColor" />
                <rect x="16" y="16" width="5" height="5" fill="currentColor" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(reviewQrUrl).catch(() => {});
                pushToast(t.common.copied, 'success');
              }}
              className="w-full h-9 rounded-xl bg-slate-900 dark:bg-white text-xs font-semibold text-white dark:text-slate-900"
            >
              Sharh havolasini nusxalash
            </button>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {centerReviews.slice(0, 8).map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-bold">{rev.authorName} · ★ {rev.rating}.0</span>
                  <span className="text-slate-400">{rev.createdAt.slice(0, 10)}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{rev.comment}</p>
                {rev.reply ? (
                  <p className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-600 dark:text-slate-300">
                    <strong>Javobingiz:</strong> {rev.reply.text}
                  </p>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <input
                      value={replyText[rev.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                      placeholder="Rasmiy javob yozing (sharhni o‘chirib bo‘lmaydi)..."
                      className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const txt = (replyText[rev.id] || '').trim();
                        if (txt) {
                          replyToReview(rev.id, txt);
                          setReplyText({ ...replyText, [rev.id]: '' });
                        }
                      }}
                      className="h-9 rounded-xl bg-[#3B4CCA] px-3.5 font-semibold text-white"
                    >
                      Yuborish
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE & AI DESCRIPTION WRITER */}
      {tab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 max-w-3xl">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#3B4CCA]" /> {t.dashboard.aiWriter}
          </h2>
          <div>
            <label htmlFor="ai-str" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Markazingizning kuchli tomonlari (kalit faktlar)
            </label>
            <textarea
              id="ai-str"
              rows={2}
              value={strengthsInput}
              onChange={(e) => setStrengthsInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={aiDescLoading}
            onClick={handleAiDescription}
            className="h-10 rounded-xl bg-[#3B4CCA] px-5 text-xs font-semibold text-white hover:bg-[#2E3CA8] disabled:opacity-50"
          >
            {aiDescLoading ? t.common.loading : 'AI yordamida ishonchli tavsif yozish'}
          </button>
          {aiDescPreview && (
            <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 p-4 space-y-3 text-sm">
              <span className="text-[11px] font-semibold text-[#3B4CCA]">{t.common.aiGenerated}</span>
              <p className="text-slate-800 dark:text-slate-100 leading-relaxed">{aiDescPreview}</p>
              <button
                type="button"
                onClick={() => {
                  updateCenterProfile(managedCenter.id, {
                    description: {
                      ...managedCenter.description,
                      [language]: aiDescPreview,
                    },
                  });
                }}
                className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white"
              >
                Profilga qo‘llash
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PLANS & PROMOTION (MONETIZATION) */}
      {tab === 'plans' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t.verification.methodologyNote}
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                tier: PlanTier.FREE,
                title: 'Free — Boshlang‘ich',
                price: 0,
                features: ['Katalogda profil', 'Cheksiz kurs qo‘shish', 'Sinov darsi arizalari'],
              },
              {
                tier: PlanTier.PRO,
                title: 'Pro — O‘suvchi markazlar',
                price: 490000,
                features: ['CRM-lite arizalar paneli', 'Tezkor natija tekshiruvi', 'Raqobat narx analitikasi', 'Sharh QR kodi'],
              },
              {
                tier: PlanTier.FEATURED,
                title: 'Featured — Reklama joylashuvi',
                price: 1190000,
                features: ['Barcha Pro imkoniyatlar', "Katalog yuqorisida 'Reklama' yorlig‘i bilan chiqish", 'Haftalik Telegram digest'],
              },
            ].map((plan) => {
              const active = managedCenter.planTier === plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={`rounded-2xl border p-6 flex flex-col justify-between ${
                    active
                      ? 'border-[#3B4CCA] bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {plan.title}
                    </h3>
                    <p className="mt-2 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {plan.price === 0 ? 'Bepul' : formatUzs(plan.price, language)}
                      {plan.price > 0 && <span className="text-xs font-normal text-slate-500"> / oy</span>}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    disabled={active}
                    onClick={() => upgradeCenterPlan(managedCenter.id, plan.tier)}
                    className={`mt-6 h-10 w-full rounded-xl text-xs font-semibold ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#3B4CCA] text-white hover:bg-[#2E3CA8]'
                    }`}
                  >
                    {active ? 'Faol tarif' : 'Tanlash (demo billing)'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
