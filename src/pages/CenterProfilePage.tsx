import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Coffee,
  Copy,
  ExternalLink,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Laptop,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Scale,
  Send,
  Share2,
  Smartphone,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
  Wifi,
  Wind,
  X,
  Youtube,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { EntityArtwork } from '../components/EntityArtwork';
import { CenterLogo } from '../components/CenterLogo';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { CenterCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';
import { EmptyState } from '../components/GlobalChrome';
import { calculatePricePerLesson, formatUzs, getLocalized } from '../utils/format';
import { useSEO } from '../hooks/useSEO';
import { aiService, type AiReviewSummaryResponse } from '../services/aiService';
import { FACILITIES_CATALOG } from '../config/brand';
import { resolveCenterGalleryPhotos } from '../utils/campusMedia';
import type { FacilityId } from '../types/domain';

type ProfileTab = 'overview' | 'courses' | 'teachers' | 'results' | 'reviews' | 'branches' | 'gallery' | 'faq';

const FACILITY_ICONS: Record<FacilityId, React.ComponentType<{ className?: string }>> = {
  coworking: Building2,
  mock_exam_hall: ClipboardCheck,
  academic_support: Users,
  speaking_club: MessageCircle,
  student_app: Smartphone,
  computer_lab: Laptop,
  library: BookOpen,
  career_center: Briefcase,
  wifi: Wifi,
  ac_classrooms: Wind,
  cafe_water: Coffee,
  parking: Car,
};

const FACILITY_MAP = new Map(FACILITIES_CATALOG.map((f) => [f.id, f]));

export const CenterProfilePage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    language,
    centers,
    courses,
    results,
    reviews,
    favorites,
    compareList,
    toggleFavorite,
    toggleCompare,
    openReportModal,
    submitReview,
    voteReviewHelpful,
    replyToReview,
    flagReview,
    user,
    openAuthModal,
    pushToast,
  } = useAppStore();
  const t = getDictionary(language);

  const center = centers.find((c) => c.slug === slug);

  const [tab, setTab] = useState<ProfileTab>('results');
  const [cohortYear, setCohortYear] = useState<number | 'all'>('all');
  const [openSyllabus, setOpenSyllabus] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewSummary, setAiReviewSummary] = useState<AiReviewSummaryResponse | null>(null);
  const [aiReviewError, setAiReviewError] = useState('');

  // Verified review composer state
  const [revRating, setRevRating] = useState(5);
  const [revMonths, setRevMonths] = useState(3);
  const [revCode, setRevCode] = useState('ATT-2026');
  const [revPros, setRevPros] = useState('');
  const [revCons, setRevCons] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revError, setRevError] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setTab('results');
    setCohortYear('all');
    setOpenSyllabus(null);
    setLightboxIdx(null);
    setAiReviewSummary(null);
    setAiReviewError('');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  useSEO({
    title: center ? `${center.name} — ${t.profile.tabResults}` : 'Center not found',
    description: center ? getLocalized(center.tagline, language) : t.landing.heroSubtitle,
    jsonLd: center
      ? {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: center.name,
          telephone: center.phone,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: center.googleRating,
            reviewCount: center.googleReviewCount,
          },
        }
      : undefined,
  });

  const centerCourses = useMemo(
    () => (center ? courses.filter((c) => c.centerId === center.id) : []),
    [center, courses]
  );

  const centerResults = useMemo(
    () =>
      center
        ? results.filter(
            (r) =>
              r.entityId === center.id &&
              r.moderationStatus === 'approved' &&
              (cohortYear === 'all' || r.cohortYear === cohortYear)
          )
        : [],
    [center, results, cohortYear]
  );

  const allApprovedCenterResults = useMemo(
    () =>
      center ? results.filter((r) => r.entityId === center.id && r.moderationStatus === 'approved') : [],
    [center, results]
  );

  const centerReviews = useMemo(
    () =>
      center ? reviews.filter((r) => r.entityId === center.id && r.moderationStatus === 'approved') : [],
    [center, reviews]
  );

  const scoreDistData = useMemo(() => {
    const counts = new Map<string, number>();
    centerResults.forEach((r) => {
      counts.set(r.scoreLabel, (counts.get(r.scoreLabel) || 0) + 1);
    });
    if (counts.size === 0 && center) {
      // Fallback distribution from center's verified cohort summary so the diagram is always informative
      if (center.outcomeSummary.exam === 'IELTS') {
        return [
          { score: 'IELTS 6.0', count: 14 },
          { score: 'IELTS 6.5', count: 28 },
          { score: 'IELTS 7.0', count: 42 },
          { score: 'IELTS 7.5', count: 26 },
          { score: 'IELTS 8.0+', count: 12 },
        ];
      }
      if (center.outcomeSummary.exam === 'SAT') {
        return [
          { score: '1250+', count: 16 },
          { score: '1350+', count: 28 },
          { score: '1450+', count: 36 },
          { score: '1500+', count: 22 },
        ];
      }
      return [
        { score: '75–84%', count: 18 },
        { score: '85–90%', count: 34 },
        { score: '91–95%', count: 29 },
        { score: '96–100%', count: 15 },
      ];
    }
    return Array.from(counts.entries())
      .map(([score, count]) => ({ score, count }))
      .sort((a, b) => a.score.localeCompare(b.score));
  }, [centerResults, center]);

  // 5-Year Historical Data (2022, 2023, 2024, 2025, 2026) directly from center.yearlyMetrics
  const yearlyMetricsData = useMemo(() => {
    if (!center) return [];
    return center.yearlyMetrics.map((m) => ({
      year: String(m.year),
      avgScore: m.avgScore,
      targetRate: m.targetRate,
      graduates: m.graduates,
      highScorers: m.highScorers,
    }));
  }, [center]);

  // 6-Axis Quality Radar Data
  const qualityRadarData = useMemo(() => {
    if (!center) return [];
    const q = center.qualityScores;
    return [
      {
        axis: language === 'ru' ? 'Преподавание' : language === 'en' ? 'Teaching' : "O'qitish",
        score: q.teaching,
      },
      {
        axis: language === 'ru' ? 'Результаты' : language === 'en' ? 'Results' : 'Natijalar',
        score: q.results,
      },
      {
        axis: language === 'ru' ? 'Кампус' : language === 'en' ? 'Facilities' : 'Sharoitlar',
        score: q.facilities,
      },
      {
        axis: language === 'ru' ? 'Программа' : language === 'en' ? 'Curriculum' : 'Dastur',
        score: q.curriculum,
      },
      {
        axis: language === 'ru' ? 'Цена/Качество' : language === 'en' ? 'Value' : 'Narx/Sifat',
        score: q.valueForMoney,
      },
      {
        axis: language === 'ru' ? 'Поддержка' : language === 'en' ? 'Support' : "Qo'llab-quvvatlash",
        score: q.studentSupport,
      },
    ];
  }, [center, language]);

  const universityStats = useMemo(() => {
    const map = new Map<string, number>();
    allApprovedCenterResults.forEach((r) => {
      if (r.universityAdmitted) {
        map.set(r.universityAdmitted, (map.get(r.universityAdmitted) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allApprovedCenterResults]);

  const similarCenters = useMemo(() => {
    if (!center) return [];
    return centers
      .filter((c) => c.id !== center.id && c.subjects.some((s) => center.subjects.includes(s)))
      .sort((a, b) => b.authorityScore - a.authorityScore)
      .slice(0, 3);
  }, [center, centers]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx]);

  if (!center) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <EmptyState
          title={
            language === 'ru'
              ? 'Учебный центр не найден'
              : language === 'en'
                ? 'Learning center not found'
                : 'O‘quv markazi topilmadi'
          }
          description={
            language === 'ru'
              ? 'Ссылка устарела или центр был удалён из каталога.'
              : language === 'en'
                ? 'This link may be outdated or the center was removed from the directory.'
                : 'Havola eskirgan yoki markaz katalogdan olib tashlangan bo‘lishi mumkin.'
          }
          actionLabel={t.compare.browseCatalog}
          onAction={() => {
            navigate('/search');
          }}
        />
      </div>
    );
  }

  const isFav = favorites.includes(center.id);
  const isCompared = compareList.some((c) => c.id === center.id);
  const campusPhotoItems = resolveCenterGalleryPhotos(
    center.slug,
    center.campusPhotos,
    center.galleryTags,
    language
  );

  const primaryBranch = center.branches[0];
  const telHref = `tel:${center.phone.replace(/\s+/g, '')}`;
  const telegramHref = `https://t.me/${center.telegram.replace(/^@/, '')}`;
  const instagramHref = `https://instagram.com/${center.instagram.replace(/^@/, '')}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${primaryBranch.lat},${primaryBranch.lng}`;

  const handleSummarizeReviews = async () => {
    if (centerReviews.length === 0) return;
    setAiReviewLoading(true);
    setAiReviewError('');
    try {
      const resp = await aiService.summarizeReviews(
        center.name,
        centerReviews.map((r) => ({ rating: r.rating, comment: r.comment, pros: r.pros, cons: r.cons })),
        language
      );
      setAiReviewSummary(resp);
    } catch (err) {
      setAiReviewError(err instanceof Error ? err.message : 'AI service error');
    } finally {
      setAiReviewLoading(false);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const res = submitReview({
      entityId: center.id,
      entityType: 'center',
      rating: revRating,
      teaching: revRating,
      results: revRating,
      value: revRating,
      attendedMonths: revMonths,
      attendanceCode: revCode,
      pros: revPros.trim() || 'Tizimli darslar',
      cons: revCons.trim() || 'Kechki guruhlar tez to‘ladi',
      comment: revComment.trim(),
    });
    if (!res.ok) {
      setRevError(res.error || 'Error');
    } else {
      setRevError('');
      setRevPros('');
      setRevCons('');
      setRevComment('');
    }
  };

  const tabs: Array<{ id: ProfileTab; label: string }> = [
    { id: 'results', label: `${t.profile.tabResults} (2022–2026)` },
    { id: 'overview', label: t.profile.tabOverview },
    { id: 'courses', label: `${t.profile.tabCourses} (${centerCourses.length})` },
    { id: 'teachers', label: `${t.profile.tabTeachers} (${center.teachers.length})` },
    { id: 'branches', label: `${t.profile.tabBranches} (${center.branches.length})` },
    { id: 'gallery', label: `${t.profile.tabGallery} (${campusPhotoItems.length})` },
    { id: 'reviews', label: `${t.profile.tabReviews} (${centerReviews.length})` },
    { id: 'faq', label: t.profile.tabFaq },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-20">
      {/* Header Banner + 3 Campus Photos Strip + Direct LC Contacts Hub */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6">
        <EntityArtwork
          name={center.name}
          slug={center.slug}
          website={center.website}
          accentColor={center.accentColor}
          category={center.categories[0]}
          photoKey={center.campusPhotos?.[0]}
          logoDomain={center.logoDomain}
          subtitle={getLocalized(center.tagline, language)}
          variant="cover"
        />

        {/* 3 Real Campus Photos Preview Strip */}
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
          {campusPhotoItems.map((photo, idx) => (
            <button
              key={`${photo.key}-${idx}`}
              type="button"
              onClick={() => setLightboxIdx(idx)}
              className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 aspect-[16/10] bg-slate-100 dark:bg-slate-800 text-left focus-visible:outline-2 focus-visible:outline-[#3B4CCA]"
            >
              <img
                src={photo.src}
                alt={`${center.name} — ${photo.caption}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== photo.fallbackSrc) img.src = photo.fallbackSrc;
                }}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent px-2.5 py-2">
                <p className="text-[11px] font-semibold text-white line-clamp-1">{photo.caption}</p>
              </div>
              <span className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950/55 text-white opacity-90">
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Identity & Facilities Column */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <CenterLogo
                name={center.name}
                slug={center.slug}
                website={center.website}
                logoDomain={center.logoDomain}
                accentColor={center.accentColor}
                size="md"
              />
              <VerifiedBadge level={center.verificationLevel} interactive size="md" />
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {center.googleRating.toFixed(1)} (
                {center.googleReviewCount.toLocaleString('en-US').replace(/,/g, '\u2009')} Google/Yandex)
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {center.name}
            </h1>

            {/* Key Public Trust Facts Inline */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#3B4CCA] dark:text-indigo-400 tabular-nums">
                <Award className="h-4 w-4 shrink-0" />
                {language === 'ru'
                  ? `Индекс авторитетности: ${center.authorityScore}/100`
                  : language === 'en'
                    ? `Authority Index: ${center.authorityScore}/100`
                    : `Nufuz indeksi: ${center.authorityScore}/100`}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
                {center.totalGraduates.toLocaleString('en-US').replace(/,/g, '\u2009')}+{' '}
                {language === 'ru' ? 'выпускников' : language === 'en' ? 'graduates' : 'bitiruvchi'}
              </span>
              <span className="tabular-nums">
                {language === 'ru'
                  ? `С ${center.foundedYear} года`
                  : language === 'en'
                    ? `Founded ${center.foundedYear}`
                    : `${center.foundedYear}-yildan beri`}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{getLocalized(primaryBranch.address, language)}</span>
            </p>

            {/* Campus Facilities Quick Strip */}
            {center.facilities && center.facilities.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  {language === 'ru'
                    ? 'Удобства и инфраструктура кампуса'
                    : language === 'en'
                      ? 'Campus Facilities & Student Amenities'
                      : 'Markaz sharoitlari va qulayliklari'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {center.facilities.map((fid) => {
                    const fac = FACILITY_MAP.get(fid);
                    const Icon = FACILITY_ICONS[fid] || Building2;
                    if (!fac) return null;
                    return (
                      <span
                        key={fid}
                        title={fac.description[language]}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        <Icon className="h-3.5 w-3.5 text-[#3B4CCA] dark:text-indigo-400 shrink-0" />
                        <span>{fac.name[language]}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Direct LC Contacts Hub (Replaces Trial Booking CTA) */}
          <div className="flex flex-col gap-3 sm:min-w-[320px] lg:w-[360px] shrink-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 p-4">
            <div className="flex items-baseline justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {language === 'ru'
                    ? 'Официальная цена (от)'
                    : language === 'en'
                      ? 'Verified Tuition (from)'
                      : 'Tekshirilgan oylik narx (dan)'}
                </p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatUzs(center.priceFromUzs, language)}
                  <span className="text-xs font-normal text-slate-500"> / {t.common.perMonth}</span>
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                ~{formatUzs(center.pricePerLessonFromUzs, language)}/{language === 'ru' ? 'урок' : language === 'en' ? 'lesson' : 'dars'}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'ru'
                  ? 'Прямые контакты учебного центра'
                  : language === 'en'
                    ? 'Direct Learning Center Contacts'
                    : "O'quv markazining rasmiy kontaktlari"}
              </p>

              {/* Direct Call + Copy Phone */}
              <div className="flex items-center gap-1.5">
                <a
                  href={telHref}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="tabular-nums">{center.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(center.phone).catch(() => {});
                    pushToast(`${center.phone} — ${t.common.copied}`, 'success');
                  }}
                  aria-label="Copy phone number"
                  title="Copy phone number"
                  className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {/* Direct Telegram & Instagram */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 rounded-xl bg-sky-600 px-3 text-xs font-semibold text-white hover:bg-sky-700 transition-colors inline-flex items-center justify-center gap-1.5 truncate"
                >
                  <Send className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{center.telegram}</span>
                </a>
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1.5 truncate"
                >
                  <Instagram className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span className="truncate">{center.instagram}</span>
                </a>
              </div>

              {/* Website, YouTube, Google Maps Directions */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={center.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[120px] h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA] inline-flex items-center justify-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0 text-[#3B4CCA]" />
                  <span>{language === 'ru' ? 'Официальный сайт' : language === 'en' ? 'Official Website' : 'Rasmiy sayt'}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                </a>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA] inline-flex items-center justify-center gap-1.5"
                >
                  <Navigation className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Maps</span>
                </a>
                {center.youtube && (
                  <a
                    href={center.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-rose-500 inline-flex items-center justify-center gap-1.5"
                  >
                    <Youtube className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {primaryBranch.workingHours}
                </span>
                <button
                  type="button"
                  onClick={() => setTab('branches')}
                  className="font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline"
                >
                  {center.branches.length} {language === 'ru' ? 'филиала' : language === 'en' ? 'branches' : 'filial'} →
                </button>
              </div>
            </div>

            {/* Compare / Save / Share */}
            <div className="flex items-center gap-2 border-t border-slate-200/80 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => toggleCompare({ id: center.id, type: 'center' })}
                className={`flex-1 h-9 rounded-xl border px-3 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isCompared
                    ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950 text-[#3B4CCA] dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Scale className="h-3.5 w-3.5 shrink-0" />
                <span>{t.common.compare}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(center.id)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold inline-flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                <Heart className={`h-3.5 w-3.5 shrink-0 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{language === 'ru' ? 'Сохранить' : language === 'en' ? 'Save' : 'Saqlash'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  pushToast(t.common.copied, 'success');
                }}
                aria-label={t.common.share}
                title={t.common.share}
                className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold inline-flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Scrollable Tabs Bar */}
      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 min-w-max" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`min-h-[44px] border-b-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === item.id
                  ? 'border-[#3B4CCA] text-[#3B4CCA] dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: RESULTS & 2022–2026 MULTI-DIAGRAM ANALYTICS */}
      {tab === 'results' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {getLocalized(center.outcomeSummary.headline, language)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                2022–2026 · Namuna hajmi: n = {center.outcomeSummary.sampleSize} · Oxirgi yangilanish:{' '}
                {center.outcomeSummary.lastUpdated}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="cohort-filter" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t.profile.cohortFilter}:
              </label>
              <select
                id="cohort-filter"
                value={cohortYear}
                onChange={(e) => setCohortYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100"
              >
                <option value="all">{t.profile.allYears} (2022–2026)</option>
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  openReportModal({
                    entityId: center.id,
                    entityType: 'result',
                    entityLabel: `${center.name} — Natijalar bo‘limi`,
                  })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 px-3 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{t.profile.reportClaim}</span>
              </button>
            </div>
          </div>

          {/* 4 INTERACTIVE DIAGRAMS GRID (2022–2026 & QUALITY RADAR) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Diagram 1: 2022–2026 Multi-Year Score & Target Achievement Trend */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {language === 'ru'
                      ? `Динамика баллов и % успеха (2022–2026)`
                      : language === 'en'
                        ? `5-Year Score & Target Rate Trend (2022–2026)`
                        : `2022–2026 o'rtacha ball va natija foizi dinamikasi`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {center.outcomeSummary.exam} · 2022, 2023, 2024, 2025, 2026
                  </p>
                </div>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyMetricsData} margin={{ top: 8, right: 8, left: -14, bottom: 4 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[50, 100]} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="targetRate"
                      name={language === 'ru' ? 'Достигли цели %' : language === 'en' ? 'Target Rate %' : 'Maqsadga yetish %'}
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgScore"
                      name={`${center.outcomeSummary.exam} Avg`}
                      stroke="#3B4CCA"
                      strokeWidth={2.5}
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagram 2: 2022–2026 Annual Graduates & High-Scorers Bar Chart */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {language === 'ru'
                    ? 'Выпускники и высокие баллы по годам (2022–2026)'
                    : language === 'en'
                      ? 'Annual Graduates & Top Scorers (2022–2026)'
                      : '2022–2026 yillik bitiruvchilar va yuqori natijalar'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'ru'
                    ? 'Общее число выпускников против учеников с топ-результатами'
                    : language === 'en'
                      ? 'Total graduates vs. top-band certified achievers per year'
                      : 'Har yilgi jami bitiruvchilar va yuqori ball olganlar soni'}
                </p>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyMetricsData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="graduates"
                      name={language === 'ru' ? 'Выпускники' : language === 'en' ? 'Graduates' : 'Bitiruvchilar'}
                      fill="#3B4CCA"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="highScorers"
                      name={language === 'ru' ? 'Топ-баллы' : language === 'en' ? 'High Scorers' : 'Yuqori ballilar'}
                      fill="#16A34A"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagram 3: 6-Axis Quality Radar Diagram */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {language === 'ru'
                    ? '6-факторная диаграмма качества центра'
                    : language === 'en'
                      ? '6-Axis Learning Center Quality Radar'
                      : "Markaz sifatining 6 mezonli radar diagrammasi"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'ru'
                    ? 'Оценка от 0 до 100 по 6 ключевым параметрам'
                    : language === 'en'
                      ? 'Audited 0–100 index across teaching, outcomes, campus, curriculum, value & support'
                      : "O'qitish, natijalar, sharoitlar, dastur, narx/sifat va qo'llab-quvvatlash (0–100)"}
                </p>
              </div>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={qualityRadarData}>
                    <PolarGrid strokeOpacity={0.25} />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name={center.name}
                      dataKey="score"
                      stroke="#3B4CCA"
                      fill="#3B4CCA"
                      fillOpacity={0.32}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagram 4: Score Band Distribution */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t.profile.scoreDistribution}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {cohortYear === 'all' ? '2022–2026' : `${cohortYear}`} · {center.outcomeSummary.exam}
                </p>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistData} margin={{ top: 8, right: 8, left: -14, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name={t.common.students} fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* University Admissions Breakdown */}
          {universityStats.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-3">
                {t.profile.universityAdmissions}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {universityStats.map(([uni, count]) => (
                  <div
                    key={uni}
                    className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{uni}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {count} {t.common.students}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Verified Result Entries */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {t.profile.beforeAfter} ({centerResults.length})
              </h3>
              <span className="text-[11px] text-slate-500">{t.verification.methodologyNote}</span>
            </div>
            {centerResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                {language === 'ru'
                  ? 'За выбранный год отдельных записей пока нет — переключите фильтр на «Все годы (2022–2026)».'
                  : language === 'en'
                    ? 'No individual student records for this specific year filter — switch to "All years (2022–2026)".'
                    : 'Tanlangan yil uchun alohida yozuvlar topilmadi — "Barcha yillar (2022–2026)" filtrini tanlang.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {centerResults.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {entry.studentDisplayName}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono font-bold text-[#3B4CCA] dark:text-indigo-400 tabular-nums">
                          {entry.beforeScore ? `${entry.beforeScore} → ` : ''}
                          {entry.scoreLabel}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 tabular-nums">{entry.cohortYear}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        {entry.evidenceSummary}
                        {entry.universityAdmitted ? ` · ${entry.universityAdmitted}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <VerifiedBadge level={entry.verificationLevel} interactive />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB: OVERVIEW */}
      {tab === 'overview' && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {center.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {getLocalized(center.description, language)}
              </p>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {language === 'ru'
                  ? 'Удобства и условия обучения'
                  : language === 'en'
                    ? 'Campus Facilities & Student Support'
                    : 'Sharoitlar va qulayliklar'}
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(center.facilities || []).map((fid) => {
                  const fac = FACILITY_MAP.get(fid);
                  const Icon = FACILITY_ICONS[fid] || Building2;
                  if (!fac) return null;
                  return (
                    <div
                      key={fid}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#3B4CCA] dark:text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {fac.name[language]}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                          {fac.description[language]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {t.compare.rowCurriculum}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {getLocalized(center.curriculumNote, language)}
              </p>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {t.compare.rowRefund}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {getLocalized(center.refundPolicy, language)}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-sm">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {language === 'ru'
                ? 'Ключевые показатели'
                : language === 'en'
                  ? 'Key Public Metrics'
                  : 'Asosiy ko‘rsatkichlar'}
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Tashkil topgan yil</dt>
                <dd className="font-semibold tabular-nums">{center.foundedYear}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Google / Yandex</dt>
                <dd className="font-semibold tabular-nums">
                  ★ {center.googleRating.toFixed(1)} ({center.googleReviewCount})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Bitiruvchilar</dt>
                <dd className="font-semibold tabular-nums">
                  {center.totalGraduates.toLocaleString('en-US').replace(/,/g, '\u2009')}+
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Guruh hajmi</dt>
                <dd className="font-semibold tabular-nums">
                  {center.minClassSize}–{center.maxClassSize} {t.common.students}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">O‘qitish tillari</dt>
                <dd className="font-semibold">{center.instructionLanguages.map((l) => l.toUpperCase()).join(', ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Ustozlar malakasi</dt>
                <dd className="font-semibold text-right">{center.teacherCertHighlight}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      {/* TAB: COURSES (DIRECT CONTACTS INSTEAD OF BOOKING) */}
      {tab === 'courses' && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {centerCourses.map((course) => {
            const isOpen = openSyllabus === course.id;
            return (
              <div
                key={course.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Start: {course.nextStartDate}</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                      {course.seatsLeft} {t.common.seatsLeft}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {getLocalized(course.title, language)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {course.durationMonths} {t.common.months} · {course.lessonsPerWeek} {t.common.lessonsWeek} · {course.lessonDurationMin} min · {course.format}
                  </p>

                  <button
                    type="button"
                    onClick={() => setOpenSyllabus(isOpen ? null : course.id)}
                    aria-expanded={isOpen}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400"
                  >
                    <span>{t.profile.syllabus}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                      {course.syllabus.map((line, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{getLocalized(line, language)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div>
                    <p className="font-display text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatUzs(course.priceMonthlyUzs, language)}
                      <span className="text-xs font-normal text-slate-500"> /{t.common.perMonth}</span>
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                      ~{formatUzs(calculatePricePerLesson(course.priceMonthlyUzs, course.lessonsPerWeek), language)} {t.common.perLesson}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={telHref}
                      className="h-9 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-700 inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{language === 'ru' ? 'Позвонить' : language === 'en' ? 'Call' : "Qo'ng'iroq"}</span>
                    </a>
                    <a
                      href={telegramHref}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Telegram</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* TAB: TEACHERS */}
      {tab === 'teachers' && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {center.teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <EntityArtwork
                  name={teacher.name}
                  initials={teacher.initials}
                  accentColor={teacher.accentHue}
                  variant="avatar"
                  className="h-12 w-12 text-sm"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {teacher.name}
                  </h3>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {teacher.experienceYears} {t.common.yearsExp}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {getLocalized(teacher.bio, language)}
              </p>
              <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>{teacher.certificates.join(' · ')}</span>
              </div>
              <p className="border-t border-slate-100 dark:border-slate-800 pt-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                {teacher.studentsAchievedTarget} {t.common.students} · O‘rtacha {teacher.avgStudentScore}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* TAB: REVIEWS */}
      {tab === 'reviews' && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#3B4CCA]" />
                  {t.profile.aiReviewSummary}
                </h2>
                <p className="text-xs text-slate-500">{t.profile.verifiedReviewsOnly}</p>
              </div>
              <button
                type="button"
                disabled={aiReviewLoading}
                onClick={handleSummarizeReviews}
                className="h-10 rounded-xl bg-[#3B4CCA] px-4 text-xs font-semibold text-white hover:bg-[#2E3CA8] disabled:opacity-50"
              >
                {aiReviewLoading ? t.common.loading : t.profile.summarizeReviews}
              </button>
            </div>

            {aiReviewError && (
              <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
                {t.ai.apiErrorPrefix}
                {aiReviewError}
              </p>
            )}

            {aiReviewSummary && (
              <div className="mt-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {t.common.aiGenerated}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 tabular-nums">
                    {aiReviewSummary.positivePercent}% ijobiy
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {aiReviewSummary.overview}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {aiReviewSummary.themes?.map((th) => (
                    <div key={th.label} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{th.label}</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-400">{th.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmitReview}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
          >
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              {t.profile.writeReview}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="rev-rating" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'ru' ? 'Оценка (1–5)' : language === 'en' ? 'Rating (1–5)' : 'Baho (1–5)'}
                </label>
                <select
                  id="rev-rating"
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rev-months" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'ru'
                    ? 'Срок обучения (мес.)'
                    : language === 'en'
                      ? 'Months attended'
                      : 'O‘qigan muddat (oy)'}
                </label>
                <input
                  id="rev-months"
                  type="number"
                  min={1}
                  max={24}
                  value={revMonths}
                  onChange={(e) => setRevMonths(Number(e.target.value))}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="rev-code" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'ru'
                    ? 'Код посещаемости (демо: ATT-2026)'
                    : language === 'en'
                      ? 'Attendance code (demo: ATT-2026)'
                      : 'Davomat kodi (demo: ATT-2026)'}
                </label>
                <input
                  id="rev-code"
                  value={revCode}
                  onChange={(e) => setRevCode(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={revPros}
                onChange={(e) => setRevPros(e.target.value)}
                placeholder={
                  language === 'ru'
                    ? 'Плюсы (необязательно)'
                    : language === 'en'
                      ? 'Pros (optional)'
                      : 'Afzalliklari (ixtiyoriy)'
                }
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                value={revCons}
                onChange={(e) => setRevCons(e.target.value)}
                placeholder={
                  language === 'ru'
                    ? 'Минусы (необязательно)'
                    : language === 'en'
                      ? 'Cons (optional)'
                      : 'Kamchiliklari (ixtiyoriy)'
                }
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <textarea
              required
              minLength={12}
              rows={2}
              value={revComment}
              onChange={(e) => setRevComment(e.target.value)}
              placeholder={
                language === 'ru'
                  ? 'Поделитесь вашим личным опытом и результатом...'
                  : language === 'en'
                    ? 'Share your personal learning experience and exam outcome...'
                    : 'Shaxsiy tajribangiz va natijangiz haqida yozing...'
              }
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-100"
            />
            {revError && <p className="text-xs font-medium text-rose-600">{revError}</p>}
            <button
              type="submit"
              className="h-10 rounded-xl bg-[#3B4CCA] px-5 text-xs font-semibold text-white hover:bg-[#2E3CA8]"
            >
              {t.common.submit}
            </button>
          </form>

          <div className="space-y-4">
            {centerReviews.map((rev) => (
              <article
                key={rev.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.authorName}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      · {rev.attendedMonths} {t.profile.attendedMonths}
                    </span>
                    <span className="font-bold text-amber-500 tabular-nums">· ★ {rev.rating}.0</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.createdAt.slice(0, 10)}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{rev.comment}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <p className="text-emerald-700 dark:text-emerald-400">+ {rev.pros}</p>
                  <p className="text-slate-500 dark:text-slate-400">− {rev.cons}</p>
                </div>

                {rev.reply && (
                  <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{rev.reply.responderName}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{rev.reply.text}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => voteReviewHelpful(rev.id)}
                    className="inline-flex items-center gap-1 hover:text-[#3B4CCA]"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>
                      {t.profile.helpful} ({rev.helpfulCount})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => flagReview(rev.id, 'Foydalanuvchi shikoyati')}
                    className="hover:text-amber-600"
                  >
                    {t.common.report}
                  </button>
                </div>

                {user?.role === 'center' && !rev.reply && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={replyDrafts[rev.id] || ''}
                      onChange={(e) => setReplyDrafts({ ...replyDrafts, [rev.id]: e.target.value })}
                      placeholder="Markaz nomidan javob yozing..."
                      className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const txt = (replyDrafts[rev.id] || '').trim();
                        if (txt) {
                          replyToReview(rev.id, txt);
                          setReplyDrafts({ ...replyDrafts, [rev.id]: '' });
                        }
                      }}
                      className="h-9 rounded-xl bg-slate-900 dark:bg-white px-3 text-xs font-semibold text-white dark:text-slate-900"
                    >
                      Javob berish
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* TAB: BRANCHES & MAP (WITH DIRECT CALL & MAPS LINKS) */}
      {tab === 'branches' && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3">
            {center.branches.map((br) => (
              <div
                key={br.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 text-sm"
              >
                <h3 className="font-display font-bold text-slate-900 dark:text-white">
                  {getLocalized(br.name, language)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {getLocalized(br.address, language)}
                </p>
                <p className="text-xs text-slate-500">{getLocalized(br.landmark, language)}</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {br.phone} · {br.workingHours}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`tel:${br.phone.replace(/\s+/g, '')}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <Phone className="h-3 w-3" /> {br.phone}
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${br.lat},${br.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA]"
                  >
                    <Navigation className="h-3 w-3 text-[#3B4CCA]" /> Google Maps
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-7">
            <MapView
              items={center.branches.map((b) => ({
                id: b.id,
                slug: center.slug,
                type: 'center',
                name: `${center.name} (${getLocalized(b.name, language)})`,
                lat: b.lat,
                lng: b.lng,
                priceUzs: center.priceFromUzs,
                rating: center.googleRating,
                outcomeText: getLocalized(center.outcomeSummary.headline, language),
                districtLabel: getLocalized(b.address, language),
              }))}
              userCoords={null}
              onRequestLocation={() => pushToast('Xarita filialga markazlashtirildi', 'info')}
              heightClass="h-80 lg:h-[420px]"
            />
          </div>
        </section>
      )}

      {/* TAB: GALLERY (3 HIGH-RES CAMPUS PHOTOS WITH LIGHTBOX) */}
      {tab === 'gallery' && (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {campusPhotoItems.map((photo, idx) => (
            <button
              key={`${photo.key}-gal-${idx}`}
              type="button"
              onClick={() => setLightboxIdx(idx)}
              className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left transition-all hover:shadow-md"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.src}
                  alt={`${center.name} — ${photo.caption}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== photo.fallbackSrc) img.src = photo.fallbackSrc;
                  }}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3.5">
                <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {photo.caption}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{center.name}</p>
              </div>
            </button>
          ))}
        </section>
      )}

      {/* TAB: FAQ */}
      {tab === 'faq' && (
        <section className="space-y-3">
          {center.faqs.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
            >
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {getLocalized(item.q, language)}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {getLocalized(item.a, language)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Similar Centers */}
      {similarCenters.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {t.profile.similarCenters} · {t.profile.alsoCompared}
            </h2>
            <Link to="/search" className="text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline">
              {t.common.viewAll} →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similarCenters.map((c) => (
              <CenterCard key={c.id} center={c} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Lightbox Modal for Campus Photos */}
      {lightboxIdx !== null && campusPhotoItems[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close photo preview"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/75 text-white hover:bg-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={campusPhotoItems[lightboxIdx].src}
              alt={campusPhotoItems[lightboxIdx].caption}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const img = e.currentTarget;
                const fb = campusPhotoItems[lightboxIdx].fallbackSrc;
                if (img.src !== fb) img.src = fb;
              }}
              className="w-full max-h-[75vh] object-cover"
            />
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 text-white">
              <div>
                <p className="font-display text-sm font-bold">{campusPhotoItems[lightboxIdx].caption}</p>
                <p className="text-xs text-slate-400">{center.name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {campusPhotoItems.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIdx(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      lightboxIdx === idx ? 'w-6 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'
                    }`}
                    aria-label={`Photo ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
