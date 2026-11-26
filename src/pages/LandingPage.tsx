import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Globe2,
  MapPin,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ALL_SUBJECTS, CITIES, QUICK_SUBJECT_CHIPS } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { CenterCard, TutorCard } from '../components/ListingCard';
import { CenterLogo } from '../components/CenterLogo';
import { VerificationLevel } from '../types/domain';
import { useSEO } from '../hooks/useSEO';
import { aiService } from '../services/aiService';
import { analyticsService } from '../services/analyticsService';
import { formatUzs } from '../utils/format';

const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 20;
    const inc = value / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, 24);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {display.toLocaleString('en-US').replace(/,/g, '\u2009')}
      {suffix}
    </span>
  );
};

export const LandingPage: React.FC = () => {
  const { language, centers, tutors, results, pushToast } = useAppStore();
  const t = getDictionary(language);
  const navigate = useNavigate();

  useSEO({
    title: 'Edupick — O‘zbekistondagi eng nufuzli o‘quv markazlari reytingi (14 viloyat)',
    description: t.landing.heroSubtitle,
  });

  const [query, setQuery] = useState('');
  const [cityId, setCityId] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [aiLoading, setAiLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showcaseTab, setShowcaseTab] = useState<'authority' | 'ielts' | 'it' | 'value'>('authority');

  const approvedCenters = useMemo(
    () => centers.filter((c) => c.approvalStatus === 'approved'),
    [centers]
  );

  // Authoritative ranking based on open-source internet analytics (Google/Yandex rating, reviews, graduates, branches, verified scores)
  const authoritativeCenters = useMemo(
    () =>
      [...approvedCenters].sort(
        (a, b) =>
          b.authorityScore - a.authorityScore ||
          b.googleReviewCount - a.googleReviewCount ||
          b.totalGraduates - a.totalGraduates
      ),
    [approvedCenters]
  );

  const regionCounts = useMemo(() => {
    const map = new Map<string, number>();
    approvedCenters.forEach((c) => {
      const uniqueCities = new Set(c.branches.map((b) => b.cityId));
      uniqueCities.forEach((cid) => {
        map.set(cid, (map.get(cid) || 0) + 1);
      });
    });
    return map;
  }, [approvedCenters]);

  const totalGraduatesAll = useMemo(
    () => approvedCenters.reduce((sum, c) => sum + c.totalGraduates, 0),
    [approvedCenters]
  );

  const totalGoogleReviews = useMemo(
    () => approvedCenters.reduce((sum, c) => sum + c.googleReviewCount, 0),
    [approvedCenters]
  );

  const verifiedResultsCount = useMemo(
    () => results.filter((r) => r.verificationLevel !== VerificationLevel.UNVERIFIED).length,
    [results]
  );

  // Region-filtered authoritative pool
  const regionFilteredPool = useMemo(() => {
    if (selectedRegion === 'all') return authoritativeCenters;
    return authoritativeCenters.filter((c) => c.branches.some((b) => b.cityId === selectedRegion));
  }, [authoritativeCenters, selectedRegion]);

  const showcaseCenters = useMemo(() => {
    const pool = regionFilteredPool;
    if (showcaseTab === 'ielts') {
      return pool
        .filter((c) => c.subjects.includes('ielts'))
        .sort((a, b) => b.authorityScore - a.authorityScore || b.outcomeSummary.avgScore - a.outcomeSummary.avgScore)
        .slice(0, 6);
    }
    if (showcaseTab === 'it') {
      return pool
        .filter((c) => c.categories.includes('it'))
        .sort((a, b) => b.authorityScore - a.authorityScore)
        .slice(0, 6);
    }
    if (showcaseTab === 'value') {
      return [...pool]
        .sort((a, b) => a.priceFromUzs - b.priceFromUzs || b.authorityScore - a.authorityScore)
        .slice(0, 6);
    }
    return pool.slice(0, 6);
  }, [regionFilteredPool, showcaseTab]);

  // Analytics Chart 1: Top 6 Authoritative LCs Benchmark (Selected Viloyat or National)
  const benchmarkChartData = useMemo(
    () =>
      regionFilteredPool.slice(0, 6).map((c) => ({
        name: c.name.length > 16 ? `${c.name.slice(0, 15)}…` : c.name,
        fullName: c.name,
        authority: c.authorityScore,
        targetRate: c.outcomeSummary.successRatePercent,
        reviews: c.googleReviewCount,
      })),
    [regionFilteredPool]
  );

  // Analytics Chart 2: 2022–2026 Multi-Year Verified Graduates & Target Achievement across Uzbekistan
  const nationalYearlyData = useMemo(() => {
    const years = [2022, 2023, 2024, 2025, 2026];
    const source = regionFilteredPool.length > 0 ? regionFilteredPool : authoritativeCenters;
    return years.map((yr) => {
      let totalGrads = 0;
      let totalHigh = 0;
      let rateSum = 0;
      let count = 0;
      source.forEach((c) => {
        const m = c.yearlyMetrics.find((ym) => ym.year === yr);
        if (m) {
          totalGrads += m.graduates;
          totalHigh += m.highScorers;
          rateSum += m.targetRate;
          count += 1;
        }
      });
      return {
        year: String(yr),
        graduates: totalGrads,
        highScorers: totalHigh,
        avgTargetRate: count > 0 ? Math.round(rateSum / count) : 80,
      };
    });
  }, [regionFilteredPool, authoritativeCenters]);

  const topTutors = useMemo(
    () =>
      [...tutors]
        .filter((x) => x.approvalStatus === 'approved')
        .sort((a, b) => b.outcomeSummary.successRatePercent - a.outcomeSummary.successRatePercent)
        .slice(0, 4),
    [tutors]
  );

  const selectedRegionLabel =
    selectedRegion === 'all'
      ? language === 'ru'
        ? 'Весь Узбекистан (14 регионов)'
        : language === 'en'
          ? 'All Uzbekistan (14 Regions)'
          : "Butun O'zbekiston (14 viloyat)"
      : CITIES.find((c) => c.id === selectedRegion)?.name[language] || selectedRegion;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (cityId) params.set('city', cityId);
    analyticsService.track('search', { q: query, city: cityId });
    navigate(`/search?${params.toString()}`);
  };

  const handleAiSmartSearch = async () => {
    if (!query.trim()) {
      navigate('/matchmaker');
      return;
    }
    setAiLoading(true);
    try {
      const resp = await aiService.smartSearch(query.trim(), language);
      const params = new URLSearchParams();
      const f = resp.filters;
      if (f.subject) params.set('subject', String(f.subject));
      if (f.city) params.set('city', String(f.city));
      if (f.district) params.set('district', String(f.district));
      if (f.maxPrice && Number(f.maxPrice) > 0) params.set('maxPrice', String(f.maxPrice));
      if (f.format) params.set('format', String(f.format));
      if (f.schedule) params.set('schedule', String(f.schedule));
      if (f.freeTrialOnly) params.set('freeTrial', '1');
      if (f.explanation) params.set('aiNote', String(f.explanation));
      analyticsService.track('ai_smart_search', { query });
      navigate(`/search?${params.toString()}`);
    } catch (err) {
      pushToast(
        `${t.ai.apiErrorPrefix}${err instanceof Error ? err.message : 'Network error'}`,
        'error'
      );
      const params = new URLSearchParams({ q: query.trim() });
      if (cityId) params.set('city', cityId);
      navigate(`/search?${params.toString()}`);
    } finally {
      setAiLoading(false);
    }
  };

  const faqs = [
    {
      q:
        language === 'ru'
          ? 'Как формируется авторитетный рейтинг центров на главной странице?'
          : language === 'en'
            ? 'How is the authoritative ranking on the home page calculated?'
            : "Bosh sahifadagi eng nufuzli markazlar reytingi qanday hisoblanadi?",
      a:
        language === 'ru'
          ? 'Индекс авторитетности (0–100) рассчитывается на основе открытых данных Google/Yandex (рейтинг и число отзывов), количества выпускников за 2022–2026 гг., филиальной сети и подтверждённых результатов учеников.'
          : language === 'en'
            ? 'The Authority Index (0–100) aggregates verified public Google/Yandex ratings and review volume, 2022–2026 graduate outcomes, branch network reach, and audited exam certificates.'
            : "Nufuz indeksi (0–100) ochiq Google/Yandex reyting va sharhlar soni, 2022–2026-yillardagi bitiruvchilar natijalari, filiallar tarmog'i hamda tasdiqlangan sertifikatlar asosida avtomatik hisoblanadi.",
    },
    {
      q:
        language === 'ru'
          ? 'Как связаться с выбранным учебным центром?'
          : language === 'en'
            ? 'How do I contact a learning center directly?'
            : "Tanlangan o'quv markazi bilan qanday bog'lanish mumkin?",
      a:
        language === 'ru'
          ? 'Без посредников и лишних заявок: на странице каждого центра указаны официальный телефон, Telegram, Instagram, сайт, YouTube и точные координаты филиалов на карте.'
          : language === 'en'
            ? 'Zero middlemen: every center page provides direct one-tap phone numbers, official Telegram, Instagram, website links, working hours, and exact branch map locations.'
            : "Vositachilarsiz va ortiqcha anketalarsiz: har bir markaz sahifasida rasmiy telefon raqami, Telegram, Instagram, veb-sayt, ish vaqti va barcha filiallarning xaritadagi manzili ochiq ko'rsatilgan.",
    },
    {
      q:
        language === 'ru'
          ? 'Можно ли купить высокое место в рейтинге?'
          : language === 'en'
            ? 'Can a learning center pay for a higher ranking or verified badge?'
            : "O'quv markazi pul to'lab yuqori reyting yoki tasdiq belgisini sotib ola oladimi?",
      a:
        language === 'ru'
          ? 'Нет. Органический рейтинг, диаграммы 2022–2026 гг. и уровни верификации не продаются.'
          : language === 'en'
            ? 'No. Organic authority scores, 2022–2026 analytics diagrams, and verification badges can never be purchased.'
            : "Yo'q. Nufuz reytingi, 2022–2026-yillar diagrammalari va tasdiqlash darajalari hech qachon sotilmaydi.",
    },
  ];

  const testimonials = [
    {
      name: 'Dilnoza Murodova',
      role: language === 'ru' ? 'Мама абитуриента · Чиланзар' : language === 'en' ? 'Parent of applicant · Chilonzor' : 'Abituriyent onasi · Chilonzor',
      quote:
        language === 'ru'
          ? 'Раньше выбирали центр по рекламе в Instagram. Здесь сравнили Cambridge, Everest и Registon по реальным ценам, отзывам Google и графикам 2022–2026, а потом сразу позвонили в филиал.'
          : language === 'en'
            ? 'We compared Cambridge, Everest, and Registon side by side by verified UZS prices, Google review counts, and 2022–2026 score charts, then called the nearest branch directly.'
            : "Avval Instagram reklamasiga qarab tanlardik. Edupickda Cambridge, Everest va Registonning real narxlari, Google sharhlari va 2022–2026 diagrammalarini solishtirib, eng yaqin filialga to'g'ridan-to'g'ri qo'ng'iroq qildik.",
    },
    {
      name: 'Sardorbek Tursunov',
      role: language === 'ru' ? 'Студент WIUT · IELTS 7.5' : language === 'en' ? 'WIUT Freshman · IELTS 7.5' : 'WIUT 1-kurs talabasi · IELTS 7.5',
      quote:
        language === 'ru'
          ? 'Очень помогли 4 диаграммы качества и динамика баллов за 5 лет. Сразу видно, где сильный IELTS/SAT и какие удобства есть в кампусе.'
          : language === 'en'
            ? 'The 5-year 2022–2026 trend charts and 6-axis quality radar made it effortless to spot strong SAT and IELTS centers with real mock exam halls.'
            : "5 yillik (2022–2026) o'sish diagrammalari va 6 mezonli sifat radari juda qo'l keldi. Qaysi markazda Mock zali va kovorking borligini darrov bilib oldim.",
    },
    {
      name: 'Kamola Abdullayeva',
      role: language === 'ru' ? 'Ургенч · Хорезмская обл.' : language === 'en' ? 'Urgench · Khorezm Region' : 'Urganch · Xorazm viloyati',
      quote:
        language === 'ru'
          ? 'Отлично, что добавили все 14 областей Узбекистана — нашли Data Learning Centre и HDP в Ургенче со всеми контактами и реальными ценами.'
          : language === 'en'
            ? 'Having all 14 regions of Uzbekistan is huge — we immediately found DATA Learning Centre and HDP in Urgench with direct Telegram and phone contacts.'
            : "Barcha 14 ta viloyat qo'shilgani zo'r bo'ldi — Urganchdagi DATA va HDP markazlarining aniq narxlari, sharoitlari va barcha kontaktlarini bir joyda topdik.",
    },
  ];

  return (
    <div className="pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400">
                {language === 'ru'
                  ? 'Официальный каталог и аналитика · Все 14 регионов Узбекистана · Данные 2022–2026'
                  : language === 'en'
                    ? 'Verified Uzbekistan Directory & Analytics · All 14 Regions · 2022–2026 Data'
                    : "O'zbekiston ta'lim reytingi va tahlili · Barcha 14 viloyat · 2022–2026 real ma'lumotlar"}
              </p>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl leading-[1.12]">
                {t.landing.heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {t.landing.heroSubtitle}
              </p>

              {/* Smart Search Form */}
              <form
                onSubmit={handleSearch}
                className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <label htmlFor="hero-search-input" className="sr-only">
                      {t.common.search}
                    </label>
                    <input
                      id="hero-search-input"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.landing.searchPlaceholder}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#3B4CCA] focus:outline-none"
                    />
                  </div>

                  <div className="relative sm:w-48">
                    <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <label htmlFor="hero-city-select" className="sr-only">
                      Viloyat
                    </label>
                    <select
                      id="hero-city-select"
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 focus:border-[#3B4CCA] focus:outline-none"
                    >
                      <option value="">{t.common.allCities}</option>
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name[language]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-[#3B4CCA] px-5 text-sm font-semibold text-white hover:bg-[#2E3CA8] transition-colors whitespace-nowrap shrink-0"
                  >
                    {t.common.search}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleAiSmartSearch}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{aiLoading ? t.search.aiParsing : t.landing.aiSearchBtn}</span>
                  </button>
                  <Link
                    to="/matchmaker"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#3B4CCA] dark:hover:text-indigo-400"
                  >
                    <span>{t.landing.smartMatchCta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </form>

              {/* Quick Subject Filter Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {QUICK_SUBJECT_CHIPS.map((subId) => {
                  const sub = ALL_SUBJECTS.find((s) => s.id === subId);
                  if (!sub) return null;
                  return (
                    <button
                      key={subId}
                      type="button"
                      onClick={() => navigate(`/search?subject=${subId}${cityId ? `&city=${cityId}` : ''}`)}
                      className="min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA] hover:text-[#3B4CCA] dark:hover:text-indigo-300 transition-colors"
                    >
                      {sub.name[language]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Authoritative Top-5 Ranking (Internet & Google Analytics) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900 p-5">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      {language === 'ru'
                        ? 'Google / Yandex · Официальный рейтинг'
                        : language === 'en'
                          ? 'Google & Public Analytics · Top Ranked'
                          : 'Google / Yandex · Eng nufuzli TOP-5'}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                      {language === 'ru'
                        ? 'Лидеры Узбекистана 2026'
                        : language === 'en'
                          ? 'Most Authoritative Centers 2026'
                          : "O'zbekiston yetakchi markazlari"}
                    </h2>
                  </div>
                  <Link
                    to="/compare"
                    className="text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline whitespace-nowrap"
                  >
                    {t.common.compare} →
                  </Link>
                </div>

                <div className="mt-3 divide-y divide-slate-200/70 dark:divide-slate-800">
                  {authoritativeCenters.slice(0, 5).map((c, idx) => (
                    <Link
                      key={c.id}
                      to={`/center/${c.slug}`}
                      className="flex items-center justify-between gap-3 py-2.5 hover:opacity-85 transition-opacity"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center font-mono text-xs font-bold text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <CenterLogo
                          name={c.name}
                          slug={c.slug}
                          website={c.website}
                          logoDomain={c.logoDomain}
                          accentColor={c.accentColor}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                            ★ {c.googleRating.toFixed(1)} ({c.googleReviewCount.toLocaleString('en-US').replace(/,/g, '\u2009')}) ·{' '}
                            {formatUzs(c.priceFromUzs, language)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-[#3B4CCA] dark:text-indigo-400 tabular-nums">
                          {c.authorityScore}/100
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                          {c.outcomeSummary.successRatePercent}%
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    {language === 'ru'
                      ? 'Реальные цены, контакты и данные 2022–2026 из открытых источников'
                      : language === 'en'
                        ? 'Real UZS prices, direct contacts & 2022–2026 open-source metrics'
                        : "Ochiq manbalardan tekshirilgan real narxlar va 2022–2026 statistikasi"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-column Real Authoritative Stats Strip */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-7 lg:grid-cols-4">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                <AnimatedCounter value={approvedCenters.length} suffix="+" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {language === 'ru'
                  ? 'Учебных центров (14 регионов)'
                  : language === 'en'
                    ? 'Real Learning Centers (14 Regions)'
                    : "Real o'quv markazlari (14 viloyat)"}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                <AnimatedCounter value={Math.round(totalGraduatesAll / 1000)} suffix=" 000+" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {language === 'ru'
                  ? 'Выпускников 2022–2026'
                  : language === 'en'
                    ? 'Total Graduates Tracked'
                    : 'Umumiy bitiruvchilar soni'}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                <AnimatedCounter value={totalGoogleReviews} suffix="+" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {language === 'ru'
                  ? 'Проанализировано отзывов Google'
                  : language === 'en'
                    ? 'Google / Yandex Reviews Analyzed'
                    : 'Tahlil qilingan Google/Yandex sharhlar'}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#3B4CCA] dark:text-indigo-400">
                <AnimatedCounter value={verifiedResultsCount} suffix="+" />
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.landing.statsResults}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 14 VILOYATLAR SELECTOR */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-[#3B4CCA] dark:text-indigo-400 shrink-0" />
                <span>
                  {language === 'ru'
                    ? 'Выберите ваш регион (все 14 областей)'
                    : language === 'en'
                      ? 'Choose Your Region (All 14 Regions of Uzbekistan)'
                      : "Viloyatingizni tanlang (O'zbekistonning barcha 14 hududi)"}
                </span>
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {language === 'ru'
                  ? 'Нажмите на область, чтобы увидеть лучшие учебные центры, их рейтинги и диаграммы вашего региона'
                  : language === 'en'
                    ? 'Select any region to instantly filter top authoritative learning centers and multi-year analytics below'
                    : "Istalgan viloyatni tanlang — quyidagi eng nufuzli markazlar va 2022–2026 diagrammalar avtomatik yangilanadi"}
              </p>
            </div>
            {selectedRegion !== 'all' && (
              <Link
                to={`/search?city=${selectedRegion}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline whitespace-nowrap"
              >
                <span>
                  {language === 'ru'
                    ? 'Открыть на карте'
                    : language === 'en'
                      ? 'Open on Map'
                      : 'Xaritada ko‘rish'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
            <button
              type="button"
              onClick={() => setSelectedRegion('all')}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                selectedRegion === 'all'
                  ? 'border-[#3B4CCA] bg-[#3B4CCA] text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA]'
              }`}
            >
              <span className="truncate">
                {language === 'ru' ? 'Все регионы' : language === 'en' ? 'All Regions' : 'Barcha viloyatlar'}
              </span>
              <span
                className={`font-mono text-[11px] tabular-nums shrink-0 ${
                  selectedRegion === 'all' ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                {approvedCenters.length}
              </span>
            </button>

            {CITIES.map((region) => {
              const count = regionCounts.get(region.id) || 0;
              const active = selectedRegion === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegion(region.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#3B4CCA] bg-[#3B4CCA] text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA]'
                  }`}
                >
                  <span className="truncate">{region.name[language]}</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums shrink-0 ${
                      active ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* AUTHORITATIVE TOP CENTERS SHOWCASE (FILTERED BY VILOYAT) */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400">
              {selectedRegionLabel} · {regionFilteredPool.length}{' '}
              {language === 'ru' ? 'центров' : language === 'en' ? 'centers' : 'markaz'}
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {language === 'ru'
                ? 'Самые авторитетные учебные центры'
                : language === 'en'
                  ? 'Most Authoritative Learning Centers'
                  : "Eng nufuzli va tasdiqlangan o'quv markazlari"}
            </h2>
            <div className="mt-3 inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1">
              {[
                {
                  id: 'authority' as const,
                  label:
                    language === 'ru'
                      ? 'Топ рейтинг'
                      : language === 'en'
                        ? 'Top Authority'
                        : 'Eng nufuzlilar',
                },
                { id: 'ielts' as const, label: t.landing.bestIelts },
                {
                  id: 'it' as const,
                  label: language === 'ru' ? 'IT и программирование' : language === 'en' ? 'Top IT Academies' : 'Top IT markazlar',
                },
                { id: 'value' as const, label: t.landing.bestValue },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    showcaseTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <Link
            to={selectedRegion === 'all' ? '/search' : `/search?city=${selectedRegion}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline whitespace-nowrap"
          >
            <span>{t.common.viewAll}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseCenters.map((center, index) => (
            <CenterCard key={center.id} center={center} rankBadge={index + 1} />
          ))}
        </div>
      </section>

      {/* REAL ANALYTICS & 2022–2026 MULTI-YEAR DIAGRAMS SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                {language === 'ru'
                  ? 'Открытая статистика и динамика 2022–2026'
                  : language === 'en'
                    ? 'Open-Source Benchmarks & 2022–2026 Multi-Year Trends'
                    : 'Ochiq statistika va 2022–2026 ko‘p yillik tahlil'}
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {language === 'ru'
                  ? `Аналитика качества центров · ${selectedRegionLabel}`
                  : language === 'en'
                    ? `Learning Center Quality Diagrams · ${selectedRegionLabel}`
                    : `O'quv markazlari sifati va natijalari · ${selectedRegionLabel}`}
              </h2>
            </div>
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              <span>
                {language === 'ru'
                  ? 'Сравнить центры подробно'
                  : language === 'en'
                    ? 'Open Full Comparison Tool'
                    : 'Markazlarni batafsil taqqoslash'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Diagram 1: Top Authoritative Centers Benchmark */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {language === 'ru'
                      ? 'Индекс авторитетности и % достижения цели'
                      : language === 'en'
                        ? 'Authority Index vs. Verified Target Rate (%)'
                        : 'Nufuz indeksi va maqsadga yetish ko‘rsatkichi (%)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'ru'
                      ? 'Топ-6 центров региона по отзывам Google и результатам'
                      : language === 'en'
                        ? 'Top 6 centers in selected region by public reviews & outcomes'
                        : 'Tanlangan hududdagi TOP-6 markaz taqqoslashi'}
                  </p>
                </div>
                <Star className="h-4 w-4 text-amber-500 shrink-0" />
              </div>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkChartData} margin={{ top: 8, right: 8, left: -16, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={48} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="authority"
                      name={language === 'ru' ? 'Авторитетность' : language === 'en' ? 'Authority' : 'Nufuz (100)'}
                      fill="#3B4CCA"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="targetRate"
                      name={language === 'ru' ? 'Результат %' : language === 'en' ? 'Target Rate %' : 'Natija %'}
                      fill="#16A34A"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagram 2: 2022–2026 Multi-Year Growth & High-Scorers */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {language === 'ru'
                      ? 'Динамика выпускников и высоких баллов (2022–2026)'
                      : language === 'en'
                        ? 'Multi-Year Graduates & High-Scorers (2022–2026)'
                        : '2022–2026 bitiruvchilar va yuqori balli natijalar o‘sishi'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'ru'
                      ? 'Ежегодная динамика за 5 лет по выбранному региону'
                      : language === 'en'
                        ? '5-year historical progression across 2022, 2023, 2024, 2025 & 2026'
                        : '2022, 2023, 2024, 2025 va 2026-yillar bo‘yicha dinamika'}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
              </div>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={nationalYearlyData} margin={{ top: 8, right: 8, left: -6, bottom: 8 }}>
                    <defs>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B4CCA" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3B4CCA" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="graduates"
                      name={language === 'ru' ? 'Выпускники' : language === 'en' ? 'Graduates' : 'Bitiruvchilar'}
                      stroke="#3B4CCA"
                      strokeWidth={2.5}
                      fill="url(#gradTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="highScorers"
                      name={language === 'ru' ? 'Высокий балл (7.0+/1400+)' : language === 'en' ? 'High Scorers' : 'Yuqori ballilar'}
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      fill="url(#gradHigh)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3 STEPS */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.landing.howItWorksTitle}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: t.landing.step1Title, desc: t.landing.step1Desc },
              { title: t.landing.step2Title, desc: t.landing.step2Desc },
              {
                title:
                  language === 'ru'
                    ? '3. Свяжитесь напрямую'
                    : language === 'en'
                      ? '3. Contact directly'
                      : "3. To'g'ridan-to'g'ri bog'laning",
                desc:
                  language === 'ru'
                    ? 'Звоните по официальному номеру, пишите в Telegram или Instagram и смотрите точный маршрут филиала на карте.'
                    : language === 'en'
                      ? 'Call the official phone number, message via Telegram or Instagram, and open exact branch directions with zero middlemen.'
                      : "Rasmiy telefon raqamiga qo'ng'iroq qiling, Telegram yoki Instagramdan yozing va xaritadan eng yaqin filialni toping.",
              },
            ].map((step) => (
              <div key={step.title} className="space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP INDEPENDENT TUTORS */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.landing.topTutors}
          </h2>
          <Link
            to="/search?tab=tutors"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline whitespace-nowrap"
          >
            <span>{t.common.viewAll}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      </section>

      {/* TRUST & VERIFICATION LEVELS */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.landing.trustTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                {t.landing.trustSubtitle}
              </p>
            </div>
            <Link
              to="/verification"
              className="text-sm font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              {t.verification.howWeVerify} →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                Icon: ShieldCheck,
                color: 'text-emerald-600 dark:text-emerald-400',
                title: t.verification.student_confirmed,
                desc: t.verification.studentDesc,
              },
              {
                Icon: Shield,
                color: 'text-[#3B4CCA] dark:text-indigo-400',
                title: t.verification.document_verified,
                desc: t.verification.documentDesc,
              },
              {
                Icon: ShieldAlert,
                color: 'text-slate-500 dark:text-slate-400',
                title: t.verification.unverified,
                desc: t.verification.unverifiedDesc,
              },
            ].map((tier) => (
              <div
                key={tier.title}
                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5"
              >
                <tier.Icon className={`h-6 w-6 ${tier.color}`} aria-hidden="true" />
                <h3 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                  {tier.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.landing.testimonialsTitle}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
            >
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                “{item.quote}”
              </p>
              <footer className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FAQ + B2B CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t.landing.faqTitle}
            </h2>
            <div className="mt-5 divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl bg-[#3B4CCA] p-7 sm:p-8 text-white">
            <h2 className="font-display text-2xl font-bold leading-snug">{t.landing.b2bTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-indigo-100">{t.landing.b2bDesc}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/for-centers"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#3B4CCA] hover:bg-indigo-50 transition-colors"
              >
                <span>{t.landing.b2bCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/center"
                className="inline-flex h-11 items-center rounded-xl border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {t.nav.centerCabinet}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
