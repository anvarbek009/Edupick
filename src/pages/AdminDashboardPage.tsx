import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  FileSearch,
  History,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { ModerationStatus, UserRole, VerificationLevel } from '../types/domain';
import { aiService, type AiDocumentCheckResponse } from '../services/aiService';
import { useSEO } from '../hooks/useSEO';

export const AdminDashboardPage: React.FC = () => {
  const {
    language,
    user,
    quickDemoLogin,
    results,
    reviews,
    centers,
    reports,
    auditLogs,
    moderateResult,
    moderateReview,
    toggleCenterApproval,
    toggleSponsoredCenter,
    resolveReport,
    pushToast,
  } = useAppStore();
  const t = getDictionary(language);

  useSEO({
    title: t.dashboard.adminTitle,
    description: t.dashboard.adminTitle,
  });

  const [tab, setTab] = useState<'queue' | 'reviews' | 'centers' | 'reports' | 'audit'>('queue');
  const [aiCheckingId, setAiCheckingId] = useState<string | null>(null);
  const [aiChecks, setAiChecks] = useState<Record<string, AiDocumentCheckResponse>>({});

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.dashboard.adminTitle}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tasdiqlash navbati, AI hujjat tekshiruvi, sharh moderatsiyasi va audit jurnaliga kirish uchun Admin sifatida kiring.
        </p>
        <button
          type="button"
          onClick={() => quickDemoLogin(UserRole.ADMIN)}
          className="h-11 rounded-xl bg-[#3B4CCA] px-6 text-sm font-semibold text-white"
        >
          Demo Admin / Moderator sifatida kirish
        </button>
      </div>
    );
  }

  const pendingResults = results.filter((r) => r.moderationStatus === ModerationStatus.PENDING);
  const flaggedReviews = reviews.filter((r) => r.flagged && r.moderationStatus === ModerationStatus.APPROVED);
  const openReports = reports.filter((r) => r.status === 'open');

  const handleAiDocCheck = async (resId: string) => {
    const item = results.find((r) => r.id === resId);
    if (!item) return;
    setAiCheckingId(resId);
    try {
      const resp = await aiService.verifyDocument({
        claimedExam: item.exam,
        claimedScore: item.scoreLabel,
        claimedDate: `${item.cohortYear}`,
        studentLabel: item.studentDisplayName,
        imageBase64: item.evidenceImageData,
        mimeType: item.evidenceImageData?.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        lang: language,
      });
      setAiChecks((prev) => ({ ...prev, [resId]: resp }));
    } catch (err) {
      pushToast(`${t.ai.apiErrorPrefix}${err instanceof Error ? err.message : 'Error'}`, 'error');
    } finally {
      setAiCheckingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Trust & Safety Control Center
        </p>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.dashboard.adminTitle}
        </h1>
      </div>

      {/* Platform KPI Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Tasdiqlash navbati</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-amber-600 tabular-nums">
            {pendingResults.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Shubhali sharhlar</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-rose-600 tabular-nums">
            {flaggedReviews.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Ochiq shikoyatlar</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{openReports.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Faol markazlar</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-emerald-600 tabular-nums">
            {centers.filter((c) => c.approvalStatus === ModerationStatus.APPROVED).length}/{centers.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'queue' as const, label: `${t.dashboard.verificationQueue} (${pendingResults.length})`, Icon: ShieldCheck },
            { id: 'reviews' as const, label: `${t.dashboard.reviewModeration} (${flaggedReviews.length})`, Icon: FileSearch },
            { id: 'centers' as const, label: t.dashboard.centerApprovals, Icon: Building2 },
            { id: 'reports' as const, label: `${t.dashboard.reportsDisputes} (${openReports.length})`, Icon: AlertTriangle },
            { id: 'audit' as const, label: `${t.dashboard.auditLog} (${auditLogs.length})`, Icon: History },
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

      {/* TAB 1: VERIFICATION QUEUE + AI DOCUMENT CHECKER */}
      {tab === 'queue' && (
        <div className="space-y-4">
          {pendingResults.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
              Tasdiqlash navbati bo‘sh — barcha natijalar ko‘rib chiqilgan.
            </p>
          ) : (
            pendingResults.map((item) => {
              const aiCheck = aiChecks[item.id];
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#3B4CCA]">{item.entityName}</p>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {item.studentDisplayName} · <span className="font-mono">{item.scoreLabel}</span> ({item.cohortYear})
                      </h3>
                      <p className="text-xs text-slate-500">{item.evidenceSummary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={aiCheckingId === item.id}
                        onClick={() => handleAiDocCheck(item.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 px-3 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-300"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{aiCheckingId === item.id ? 'Tekshirilmoqda...' : 'AI Hujjat Tekshiruvi'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateResult(item.id, true, VerificationLevel.DOCUMENT_VERIFIED)}
                        className="inline-flex h-9 items-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" /> Document Verified
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateResult(item.id, true, VerificationLevel.STUDENT_CONFIRMED)}
                        className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#3B4CCA] px-3 text-xs font-semibold text-white hover:bg-[#2E3CA8]"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Student Confirmed
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateResult(item.id, false, undefined, 'Hujjat tasdiqlanmadi')}
                        className="inline-flex h-9 items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900 px-3 text-xs font-semibold text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" /> Rad etish
                      </button>
                    </div>
                  </div>

                  {aiCheck && (
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#3B4CCA]">{t.common.aiGenerated} · Admin Assist</span>
                        <span className="font-mono font-bold">Risk: {aiCheck.riskLevel}</span>
                      </div>
                      <p>
                        Aniqlangan: <strong>{aiCheck.extractedExam}</strong> · {aiCheck.extractedScore} · {aiCheck.extractedDate} · {aiCheck.extractedName}
                      </p>
                      {aiCheck.flags?.length > 0 && (
                        <p className="text-amber-700 dark:text-amber-400">Ogohlantirishlar: {aiCheck.flags.join('; ')}</p>
                      )}
                      <p className="text-slate-600 dark:text-slate-300">{aiCheck.recommendation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: REVIEW MODERATION */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {flaggedReviews.length === 0 ? (
            <p className="text-sm text-slate-500">Shubhali sharhlar yo‘q.</p>
          ) : (
            flaggedReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{rev.authorName} · ★ {rev.rating}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{rev.comment}</p>
                  <p className="text-amber-700 dark:text-amber-400">{rev.flagReason}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => moderateReview(rev.id, true)}
                    className="h-9 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white"
                  >
                    Qoldirish
                  </button>
                  <button
                    type="button"
                    onClick={() => moderateReview(rev.id, false)}
                    className="h-9 rounded-xl bg-rose-600 px-3 text-xs font-semibold text-white"
                  >
                    Yashirish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CENTERS APPROVAL & SPONSORED */}
      {tab === 'centers' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Markaz</th>
                <th className="p-3.5 font-semibold">Holat</th>
                <th className="p-3.5 font-semibold">Reklama</th>
                <th className="p-3.5 font-semibold text-right">Boshqaruv</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {centers.slice(0, 14).map((c) => (
                <tr key={c.id}>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="p-3.5 uppercase font-mono">{c.approvalStatus}</td>
                  <td className="p-3.5">{c.isSponsored ? 'Reklama (Faol)' : 'Organik'}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleCenterApproval(
                          c.id,
                          c.approvalStatus === ModerationStatus.APPROVED
                            ? ModerationStatus.PENDING
                            : ModerationStatus.APPROVED
                        )
                      }
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-semibold"
                    >
                      {c.approvalStatus === ModerationStatus.APPROVED ? 'To‘xtatish' : 'Tasdiqlash'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSponsoredCenter(c.id)}
                      className="rounded-lg border border-amber-300 dark:border-amber-800 px-2.5 py-1 font-semibold text-amber-700 dark:text-amber-400"
                    >
                      Reklama toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  {rep.entityLabel} · <span className="uppercase font-mono text-amber-600">{rep.status}</span>
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{rep.reason}</p>
                <p className="text-slate-500">{rep.details}</p>
              </div>
              {rep.status === 'open' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => resolveReport(rep.id, 'resolved')}
                    className="h-9 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white"
                  >
                    Hal qilindi
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveReport(rep.id, 'dismissed')}
                    className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold"
                  >
                    Rad etish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {tab === 'audit' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 text-xs">
              <div>
                <span className="font-mono font-bold text-[#3B4CCA]">{log.action}</span>
                <span className="mx-2 text-slate-400">·</span>
                <span className="font-semibold text-slate-900 dark:text-white">{log.target}</span>
              </div>
              <span className="text-slate-500 tabular-nums">
                {log.actorName} · {log.createdAt.slice(0, 16).replace('T', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
