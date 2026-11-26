import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Download,
  Phone,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { CenterLogo } from '../components/CenterLogo';
import { EmptyState } from '../components/GlobalChrome';
import {
  computeCompareRadarScore,
  formatUzs,
  getLocalized,
  verificationRank,
} from '../utils/format';
import { aiService, type AiCompareResponse } from '../services/aiService';
import { useSEO } from '../hooks/useSEO';
import { analyticsService } from '../services/analyticsService';
import { FACILITIES_CATALOG } from '../config/brand';
import type { VerificationLevel } from '../types/domain';

const FACILITY_MAP = new Map(FACILITIES_CATALOG.map((f) => [f.id, f]));

interface NormalizedCompareItem {
  id: string;
  slug: string;
  type: 'center' | 'tutor';
  name: string;
  accentColor: string;
  website?: string;
  logoDomain?: string;
  phone: string;
  telegram?: string;
  authorityScore?: number;
  totalGraduates?: number;
  googleRating?: number;
  googleReviewCount?: number;
  monthlyPriceUzs: number;
  pricePerLessonUzs: number;
  durationText: string;
  lessonsPerWeek: number;
  classSizeText: string;
  scheduleText: string;
  locationText: string;
  branchCount: number;
  formatText: string;
  teachersText: string;
  curriculumText: string;
  outcomeHeadline: string;
  successRatePercent: number;
  sampleSize: number;
  lastUpdated: string;
  verificationLevel: VerificationLevel;
  rating: number;
  reviewCount: number;
  trialText: string;
  refundText: string;
  installmentsText: string;
  languagesText: string;
  facilitiesText: string;
  hasTopCertifiedTeachers: boolean;
}

const RADAR_COLORS = ['#3B4CCA', '#16A34A', '#D97706', '#7C3AED'];

export const ComparePage: React.FC = () => {
  const {
    language,
    compareList,
    centers,
    tutors,
    toggleCompare,
    setCompareItems,
    removeCompare,
    clearCompare,
    saveCurrentComparison,
    pushToast,
  } = useAppStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = getDictionary(language);

  useSEO({
    title: t.compare.title,
    description: t.compare.subtitle,
  });

  // Hydrate comparison items when opened via shared ?ids=c1,c2 link
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (!idsParam) return;
    const rawIds = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    const hydrated = rawIds
      .map((id) => {
        if (centers.some((c) => c.id === id)) return { id, type: 'center' as const };
        if (tutors.some((tut) => tut.id === id)) return { id, type: 'tutor' as const };
        return null;
      })
      .filter((x): x is { id: string; type: 'center' | 'tutor' } => Boolean(x));
    if (hydrated.length > 0) {
      setCompareItems(hydrated);
      const next = new URLSearchParams(searchParams);
      next.delete('ids');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, centers, tutors, setCompareItems]);

  const [diffOnly, setDiffOnly] = useState(false);
  const defaultGoalByLang =
    language === 'ru'
      ? 'IELTS 7.0+ быстро и по оптимальной цене'
      : language === 'en'
        ? 'IELTS 7.0+ fast with the best value per lesson'
        : 'IELTS 7.0+ tez va hamyonbop narxda';
  const [aiGoal, setAiGoal] = useState(defaultGoalByLang);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiVerdict, setAiVerdict] = useState<AiCompareResponse | null>(null);
  const [addCenterId, setAddCenterId] = useState('');

  useEffect(() => {
    setAiGoal(defaultGoalByLang);
  }, [defaultGoalByLang]);

  const items: NormalizedCompareItem[] = useMemo(() => {
    return compareList
      .map((ref) => {
        if (ref.type === 'center') {
          const c = centers.find((x) => x.id === ref.id);
          if (!c) return null;
          return {
            id: c.id,
            slug: c.slug,
            type: 'center' as const,
            name: c.name,
            accentColor: c.accentColor,
            website: c.website,
            logoDomain: c.logoDomain,
            phone: c.phone,
            telegram: c.telegram,
            authorityScore: c.authorityScore,
            totalGraduates: c.totalGraduates,
            googleRating: c.googleRating,
            googleReviewCount: c.googleReviewCount,
            monthlyPriceUzs: c.priceFromUzs,
            pricePerLessonUzs: c.pricePerLessonFromUzs,
            durationText: language === 'ru' ? '3–6 мес.' : language === 'en' ? '3–6 months' : '3–6 oy',
            lessonsPerWeek: Math.max(3, Math.round(c.priceFromUzs / (c.pricePerLessonFromUzs * 4))),
            classSizeText: `${c.minClassSize}–${c.maxClassSize} ${t.common.students}`,
            scheduleText: c.schedules.join(', '),
            locationText: `${c.branches[0].address[language]} (${c.branches.length} ${language === 'ru' ? 'фил.' : language === 'en' ? 'branches' : 'filial'})`,
            branchCount: c.branches.length,
            formatText: c.formats.join(', '),
            teachersText: `${c.teachers.length}+ ${language === 'ru' ? 'преп.' : language === 'en' ? 'teachers' : 'ustoz'} · ${c.teacherCertHighlight}`,
            curriculumText: getLocalized(c.curriculumNote, language),
            outcomeHeadline: getLocalized(c.outcomeSummary.headline, language),
            successRatePercent: c.outcomeSummary.successRatePercent,
            sampleSize: c.outcomeSummary.sampleSize,
            lastUpdated: c.outcomeSummary.lastUpdated,
            verificationLevel: c.verificationLevel,
            rating: c.rating,
            reviewCount: c.reviewCount,
            trialText: c.freeTrial ? t.common.freeTrial : formatUzs(c.trialFeeUzs, language),
            refundText: getLocalized(c.refundPolicy, language),
            installmentsText: c.installmentsAvailable
              ? language === 'ru'
                ? 'Да (рассрочка 0%)'
                : language === 'en'
                  ? 'Yes (0% installments)'
                  : 'Ha (0% nasiya)'
              : language === 'ru'
                ? 'Нет'
                : language === 'en'
                  ? 'No'
                  : "Yo'q",
            languagesText: c.instructionLanguages.map((l) => l.toUpperCase()).join(', '),
            facilitiesText: (c.facilities || [])
              .map((fid) => FACILITY_MAP.get(fid)?.name[language] || fid)
              .join(', '),
            hasTopCertifiedTeachers: c.hasTopCertifiedTeachers,
          };
        }
        const tut = tutors.find((x) => x.id === ref.id);
        if (!tut) return null;
        return {
          id: tut.id,
          slug: tut.slug,
          type: 'tutor' as const,
          name: tut.name,
          accentColor: tut.accentColor,
          phone: tut.phone,
          telegram: tut.telegram,
          monthlyPriceUzs: tut.monthlyPackageUzs,
          pricePerLessonUzs: tut.hourlyPriceUzs,
          durationText: language === 'ru' ? 'Гибкий (1-на-1)' : language === 'en' ? 'Flexible (1-on-1)' : 'Moslashuvchan (1-on-1)',
          lessonsPerWeek: tut.lessonsPerWeek,
          classSizeText: language === 'ru' ? '1-на-1 индивидуально' : '1-on-1 individual',
          scheduleText: tut.availabilitySlots.slice(0, 3).join(', '),
          locationText: getLocalized(tut.addressLabel, language),
          branchCount: 1,
          formatText: tut.formats.join(', '),
          teachersText: `${tut.experienceYears} ${t.common.yearsExp} · ${tut.certificates.join(', ')}`,
          curriculumText: getLocalized(tut.bio, language),
          outcomeHeadline: getLocalized(tut.outcomeSummary.headline, language),
          successRatePercent: tut.outcomeSummary.successRatePercent,
          sampleSize: tut.outcomeSummary.sampleSize,
          lastUpdated: tut.outcomeSummary.lastUpdated,
          verificationLevel: tut.verificationLevel,
          rating: tut.rating,
          reviewCount: tut.reviewCount,
          trialText: tut.freeTrial ? t.common.freeTrial : formatUzs(tut.hourlyPriceUzs, language),
          refundText:
            language === 'ru'
              ? 'Возможен перенос урока'
              : language === 'en'
                ? 'Free lesson rescheduling'
                : "Keyingi darsga o'tkazish mumkin",
          installmentsText:
            language === 'ru'
              ? 'Поурочная оплата'
              : language === 'en'
                ? 'Pay per lesson'
                : "Darsma-dars to'lov",
          languagesText: tut.instructionLanguages.map((l) => l.toUpperCase()).join(', '),
          facilitiesText:
            language === 'ru'
              ? 'Индивидуальные 1-на-1 материалы'
              : language === 'en'
                ? '1-on-1 custom materials & flexible venue'
                : 'Individual 1-on-1 materiallar va moslashuvchan joy',
          hasTopCertifiedTeachers: tut.hasTopCertifiedTeachers,
        };
      })
      .filter(Boolean) as NormalizedCompareItem[];
  }, [compareList, centers, tutors, language, t]);

  const radarData = useMemo(() => {
    const scores = items.map((item) => computeCompareRadarScore(item));
    const axes = [
      { key: 'results' as const, label: t.profile.tabResults },
      {
        key: 'priceValue' as const,
        label: language === 'ru' ? 'Цена' : language === 'en' ? 'Value' : 'Narx',
      },
      { key: 'teachers' as const, label: t.profile.tabTeachers },
      {
        key: 'location' as const,
        label: language === 'ru' ? 'Локация' : language === 'en' ? 'Location' : 'Joylashuv',
      },
      { key: 'reviews' as const, label: t.profile.tabReviews },
    ];
    return axes.map((axis) => {
      const row: Record<string, string | number> = { metric: axis.label };
      items.forEach((item, idx) => {
        row[`item_${idx}`] = scores[idx][axis.key];
      });
      return row;
    });
  }, [items, t, language]);

  const handleGenerateAiVerdict = async () => {
    if (items.length < 2) return;
    setAiLoading(true);
    setAiError('');
    try {
      const payload = items.map((i) => ({
        name: i.name,
        type: i.type,
        monthlyPriceUzs: i.monthlyPriceUzs,
        pricePerLessonUzs: i.pricePerLessonUzs,
        outcomeHeadline: i.outcomeHeadline,
        successRatePercent: i.successRatePercent,
        sampleSize: i.sampleSize,
        verificationLevel: i.verificationLevel,
        rating: i.rating,
        reviewCount: i.reviewCount,
        classSize: i.classSizeText,
        location: i.locationText,
      }));
      const resp = await aiService.compareVerdict(payload, aiGoal, language);
      setAiVerdict(resp);
      analyticsService.track('compare_viewed', { count: items.length, aiUsed: true });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI service error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/compare?ids=${items.map((i) => i.id).join(',')}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    pushToast(t.common.copied, 'success');
    analyticsService.track('share_clicked', { target: 'compare' });
  };

  const handleExportReport = () => {
    const lines = [
      `Edupick Comparison Report (${new Date().toISOString().slice(0, 10)})`,
      '======================================================',
      ...items.map(
        (i) =>
          `\n${i.name} (${i.type.toUpperCase()})\n` +
          `  Monthly: ${formatUzs(i.monthlyPriceUzs, language)} | Per lesson: ${formatUzs(i.pricePerLessonUzs, language)}\n` +
          `  Outcomes: ${i.outcomeHeadline} (n=${i.sampleSize}, ${i.verificationLevel})\n` +
          `  Rating: ${i.rating}/5 (${i.reviewCount} reviews)\n` +
          `  Location: ${i.locationText}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edupick-comparison.txt';
    a.click();
    URL.revokeObjectURL(url);
    pushToast(
      language === 'ru'
        ? 'Отчёт сравнения скачан'
        : language === 'en'
          ? 'Comparison report downloaded'
          : 'Taqqoslash hisoboti yuklab olindi',
      'success'
    );
  };

  const availableCentersToAdd = useMemo(
    () =>
      centers
        .filter((c) => !compareList.some((x) => x.id === c.id))
        .sort((a, b) => b.authorityScore - a.authorityScore),
    [centers, compareList]
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title={t.compare.emptyTitle}
          description={t.compare.emptyDesc}
          actionLabel={t.compare.browseCatalog}
          onAction={() => {
            navigate('/search');
          }}
        />
      </div>
    );
  }

  const minMonthly = Math.min(...items.map((i) => i.monthlyPriceUzs));
  const minLesson = Math.min(...items.map((i) => i.pricePerLessonUzs));
  const maxSuccess = Math.max(...items.map((i) => i.successRatePercent));
  const maxRating = Math.max(...items.map((i) => i.rating));
  const maxVerif = Math.max(...items.map((i) => verificationRank(i.verificationLevel)));

  const maxAuthority = Math.max(...items.map((i) => i.authorityScore || 0));
  const maxGraduates = Math.max(...items.map((i) => i.totalGraduates || 0));

  const rows: Array<{
    key: string;
    label: string;
    values: Array<{ text: string; isBest?: boolean; node?: React.ReactNode }>;
  }> = [
    {
      key: 'priceMonthly',
      label: t.compare.rowPriceMonthly,
      values: items.map((i) => ({
        text: formatUzs(i.monthlyPriceUzs, language),
        isBest: items.length > 1 && i.monthlyPriceUzs === minMonthly,
      })),
    },
    {
      key: 'priceLesson',
      label: t.compare.rowPriceLesson,
      values: items.map((i) => ({
        text: formatUzs(i.pricePerLessonUzs, language),
        isBest: items.length > 1 && i.pricePerLessonUzs === minLesson,
      })),
    },
    {
      key: 'outcomes',
      label: t.compare.rowOutcomes,
      values: items.map((i) => ({
        text: `${i.outcomeHeadline} (n=${i.sampleSize})`,
        isBest: items.length > 1 && i.successRatePercent === maxSuccess,
      })),
    },
    {
      key: 'authority',
      label:
        language === 'ru'
          ? 'Индекс авторитетности'
          : language === 'en'
            ? 'Authority Index'
            : 'Nufuz indeksi (Google/Yandex)',
      values: items.map((i) => ({
        text: i.authorityScore
          ? `${i.authorityScore}/100 · Google ★ ${(i.googleRating || i.rating).toFixed(1)} (${(i.googleReviewCount || i.reviewCount).toLocaleString('ru-RU')})`
          : `★ ${i.rating.toFixed(1)} (${i.reviewCount})`,
        isBest: items.length > 1 && maxAuthority > 0 && i.authorityScore === maxAuthority,
      })),
    },
    {
      key: 'graduates',
      label:
        language === 'ru'
          ? 'Всего выпускников'
          : language === 'en'
            ? 'Total Graduates'
            : 'Jami bitiruvchilar',
      values: items.map((i) => ({
        text: i.totalGraduates
          ? `${i.totalGraduates.toLocaleString('ru-RU')}+`
          : `${i.sampleSize}+`,
        isBest: items.length > 1 && maxGraduates > 0 && i.totalGraduates === maxGraduates,
      })),
    },
    {
      key: 'verification',
      label: t.compare.rowVerification,
      values: items.map((i) => ({
        text: i.verificationLevel,
        isBest: items.length > 1 && verificationRank(i.verificationLevel) === maxVerif,
        node: <VerifiedBadge level={i.verificationLevel} interactive />,
      })),
    },
    {
      key: 'rating',
      label: t.compare.rowRating,
      values: items.map((i) => ({
        text: `★ ${i.rating.toFixed(1)} (${i.reviewCount})`,
        isBest: items.length > 1 && i.rating === maxRating,
      })),
    },
    {
      key: 'duration',
      label: t.compare.rowDuration,
      values: items.map((i) => ({ text: i.durationText })),
    },
    {
      key: 'lessonsWeek',
      label: t.compare.rowLessonsWeek,
      values: items.map((i) => ({ text: `${i.lessonsPerWeek} ${t.common.lessonsWeek}` })),
    },
    {
      key: 'classSize',
      label: t.compare.rowClassSize,
      values: items.map((i) => ({ text: i.classSizeText })),
    },
    {
      key: 'schedule',
      label: t.compare.rowSchedule,
      values: items.map((i) => ({ text: i.scheduleText })),
    },
    {
      key: 'location',
      label: t.compare.rowLocation,
      values: items.map((i) => ({ text: i.locationText })),
    },
    {
      key: 'format',
      label: t.compare.rowFormat,
      values: items.map((i) => ({ text: i.formatText })),
    },
    {
      key: 'teachers',
      label: t.compare.rowTeachers,
      values: items.map((i) => ({ text: i.teachersText })),
    },
    {
      key: 'curriculum',
      label: t.compare.rowCurriculum,
      values: items.map((i) => ({ text: i.curriculumText })),
    },
    {
      key: 'trial',
      label: t.compare.rowTrial,
      values: items.map((i) => ({ text: i.trialText })),
    },
    {
      key: 'refund',
      label: t.compare.rowRefund,
      values: items.map((i) => ({ text: i.refundText })),
    },
    {
      key: 'installments',
      label: t.compare.rowInstallments,
      values: items.map((i) => ({ text: i.installmentsText })),
    },
    {
      key: 'facilities',
      label:
        language === 'ru'
          ? 'Удобства кампуса'
          : language === 'en'
            ? 'Campus Facilities'
            : 'Sharoitlar va qulayliklar',
      values: items.map((i) => ({ text: i.facilitiesText })),
    },
    {
      key: 'languages',
      label: t.compare.rowLanguages,
      values: items.map((i) => ({ text: i.languagesText })),
    },
  ];

  const visibleRows = diffOnly
    ? rows.filter((r) => new Set(r.values.map((v) => v.text)).size > 1)
    : rows;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.compare.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.compare.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {items.length < 4 && availableCentersToAdd.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                aria-label="Add learning center to comparison"
                value={addCenterId}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) {
                    toggleCompare({ id, type: 'center' });
                    setAddCenterId('');
                  }
                }}
                className="h-9 max-w-[195px] rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/50 px-3 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-300"
              >
                <option value="">
                  {language === 'ru'
                    ? '+ Добавить центр'
                    : language === 'en'
                      ? '+ Add center'
                      : "+ Markaz qo'shish"}
                </option>
                {availableCentersToAdd.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatUzs(c.priceFromUzs, language)})
                  </option>
                ))}
              </select>
            </div>
          )}
          <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={(e) => setDiffOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#3B4CCA]"
            />
            <span>{t.compare.diffOnly}</span>
          </label>
          <button
            type="button"
            onClick={() => saveCurrentComparison(items.map((i) => i.name).join(' vs '))}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>{t.compare.saveComparison}</span>
          </button>
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{t.common.share}</span>
          </button>
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.compare.exportSummary}</span>
          </button>
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 whitespace-nowrap"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t.common.clearAll}</span>
          </button>
        </div>
      </div>

      {/* Radar Chart + AI Verdict */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t.compare.radarTitle}
          </h2>
          <div className="mt-3 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#CBD5E1" strokeOpacity={0.5} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748B' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                {items.map((item, idx) => (
                  <Radar
                    key={item.id}
                    name={item.name}
                    dataKey={`item_${idx}`}
                    stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3B4CCA]" />
                {t.compare.aiVerdictTitle}
              </h2>
              {aiVerdict && (
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {t.common.aiGenerated}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                aria-label="Your learning goal"
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={aiLoading || items.length < 2}
                onClick={handleGenerateAiVerdict}
                className="h-10 rounded-xl bg-[#3B4CCA] px-4 text-xs font-semibold text-white hover:bg-[#2E3CA8] disabled:opacity-50 whitespace-nowrap"
              >
                {aiLoading ? t.common.loading : t.compare.generateVerdict}
              </button>
            </div>

            {aiError && (
              <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
                {t.ai.apiErrorPrefix}
                {aiError}
              </div>
            )}

            {aiVerdict ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className="leading-relaxed text-slate-700 dark:text-slate-200">{aiVerdict.verdict}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {language === 'ru'
                        ? 'Сильнейшие результаты:'
                        : language === 'en'
                          ? 'Strongest results:'
                          : 'Eng kuchli natija:'}
                    </p>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-200">{aiVerdict.bestForResults}</p>
                  </div>
                  <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 p-3">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-300">
                      {language === 'ru'
                        ? 'Лучше для бюджета:'
                        : language === 'en'
                          ? 'Best for budget:'
                          : 'Byudjet uchun eng qulay:'}
                    </p>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-200">{aiVerdict.bestForBudget}</p>
                  </div>
                </div>
                {aiVerdict.itemNotes?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {aiVerdict.itemNotes.map((note) => (
                      <div
                        key={note.name}
                        className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-xs space-y-1"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">{note.name}</p>
                        <p className="text-emerald-700 dark:text-emerald-400">+ {note.pros?.join(' · ')}</p>
                        <p className="text-slate-500 dark:text-slate-400">− {note.cons?.join(' · ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'ru'
                  ? 'Укажите вашу цель — Edupick AI подготовит объективное сравнение на основе проверенных баллов, цены и интенсивности занятий.'
                  : language === 'en'
                    ? 'Enter your target goal and Edupick AI will generate an unbiased verdict based on verified outcomes, pricing, and schedule.'
                    : 'Maqsadingizni kiriting va Edupick AI tanlangan markazlarning tasdiqlangan ballari, narxi va dars soniga tayangan xolis xulosasini yaratadi.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="w-48 p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {language === 'ru' ? 'Критерии' : language === 'en' ? 'Criteria' : 'Mezonlar'}
              </th>
              {items.map((item) => (
                <th key={item.id} className="p-4 align-top min-w-[220px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CenterLogo
                        name={item.name}
                        slug={item.slug}
                        website={item.website}
                        logoDomain={item.logoDomain}
                        accentColor={item.accentColor}
                        size="sm"
                      />
                      <Link
                        to={item.type === 'center' ? `/center/${item.slug}` : `/tutor/${item.slug}`}
                        className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-[#3B4CCA] leading-tight line-clamp-2"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCompare(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="p-1 text-slate-400 hover:text-rose-500 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <a
                      href={`tel:${item.phone.replace(/\s+/g, '')}`}
                      className="flex-1 inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-700 whitespace-nowrap"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{language === 'ru' ? 'Позвонить' : language === 'en' ? 'Call' : 'Qo‘ng‘iroq'}</span>
                    </a>
                    {item.telegram && (
                      <a
                        href={`https://t.me/${item.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 px-2.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 whitespace-nowrap"
                      >
                        <Send className="h-3 w-3" />
                        <span>Telegram</span>
                      </a>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleRows.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 align-top">
                  {row.label}
                </th>
                {row.values.map((val, idx) => (
                  <td
                    key={`${row.key}-${idx}`}
                    className={`p-4 text-xs sm:text-sm align-top tabular-nums ${
                      val.isBest
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/25 font-semibold text-emerald-900 dark:text-emerald-200'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {val.node ? val.node : <span>{val.text}</span>}
                      {val.isBest && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <Trophy className="h-3 w-3" /> {t.compare.bestBadge}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
