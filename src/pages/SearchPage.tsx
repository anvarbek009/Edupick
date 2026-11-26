import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  LocateFixed,
  Map as MapIcon,
  List as ListIcon,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { ALL_SUBJECTS, CITIES, FACILITIES_CATALOG, SUBJECT_TAXONOMY } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { CenterCard, TutorCard } from '../components/ListingCard';
import { MapView, type MapMarkerItem } from '../components/MapView';
import { EmptyState } from '../components/GlobalChrome';
import {
  AgeGroup,
  CourseLevel,
  ScheduleSlot,
  StudyFormat,
  type FacilityId,
  type Language,
  type SearchFilters,
  type SortOption,
} from '../types/domain';
import {
  calculatePricePerLesson,
  DEFAULT_FILTERS,
  filterAndSortCenters,
  filterAndSortTutors,
  filterCourses,
  formatUzs,
  getLocalized,
} from '../utils/format';
import { useDebounce } from '../hooks/useOnlineStatus';
import { useSEO } from '../hooks/useSEO';
import { aiService } from '../services/aiService';
import { analyticsService } from '../services/analyticsService';

export const SearchPage: React.FC = () => {
  const { subject: seoSubject, city: seoCity, district: seoDistrict } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, centers, tutors, courses, saveSearch, pushToast } =
    useAppStore();
  const t = getDictionary(language);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [aiParsing, setAiParsing] = useState(false);
  const urlQuery = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(localQuery, 200);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setLocalQuery((prev) => (prev === urlQuery ? prev : urlQuery));
  }, [urlQuery]);

  useEffect(() => {
    if (debouncedQuery === urlQuery) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery.trim()) {
      next.set('q', debouncedQuery);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  }, [debouncedQuery, urlQuery, searchParams, setSearchParams]);

  const filters: SearchFilters = useMemo(
    () => ({
      tab: (searchParams.get('tab') as SearchFilters['tab']) || 'centers',
      q: debouncedQuery,
      subject: searchParams.get('subject') || seoSubject || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || seoCity || '',
      district: searchParams.get('district') || seoDistrict || '',
      minPrice: Number(searchParams.get('minPrice') || 0),
      maxPrice: Number(searchParams.get('maxPrice') || DEFAULT_FILTERS.maxPrice),
      format: (searchParams.get('format') as StudyFormat) || '',
      level: (searchParams.get('level') as CourseLevel) || '',
      ageGroup: (searchParams.get('age') as AgeGroup) || '',
      schedule: (searchParams.get('schedule') as ScheduleSlot) || '',
      maxClassSize: Number(searchParams.get('classSize') || 30),
      instructionLang: (searchParams.get('ilang') as Language) || '',
      certifiedTeachersOnly: searchParams.get('certified') === '1',
      minRating: Number(searchParams.get('rating') || 0),
      freeTrialOnly: searchParams.get('freeTrial') === '1',
      installmentsOnly: searchParams.get('installments') === '1',
      facility: (searchParams.get('facility') as FacilityId) || '',
      maxDistanceKm: Number(searchParams.get('dist') || 50),
      sort: (searchParams.get('sort') as SortOption) || 'relevance',
    }),
    [searchParams, debouncedQuery, seoSubject, seoCity, seoDistrict]
  );

  useEffect(() => {
    setVisibleCount(12);
  }, [filters]);

  const aiNote = searchParams.get('aiNote') || '';

  const seoTitle = useMemo(() => {
    const subjLabel = ALL_SUBJECTS.find((s) => s.id === filters.subject)?.name[language];
    const cityLabel = CITIES.find((c) => c.id === filters.city)?.name[language];
    if (subjLabel && cityLabel) return `${subjLabel} — ${cityLabel} | Edupick`;
    if (subjLabel) return `${subjLabel} | Edupick`;
    return t.search.title;
  }, [filters.subject, filters.city, language, t.search.title]);

  useSEO({
    title: seoTitle,
    description: t.landing.heroSubtitle,
  });

  const updateParam = useCallback(
    (key: string, value: string | number | boolean) => {
      const next = new URLSearchParams(searchParams);
      if (value === '' || value === false || value === 0) {
        next.delete(key);
      } else {
        next.set(key, value === true ? '1' : String(value));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const clearAll = () => {
    setLocalQuery('');
    setSearchParams(new URLSearchParams({ tab: filters.tab }));
  };

  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setUserCoords({ lat: 41.3111, lng: 69.2797 });
      pushToast(t.search.geoDenied, 'info');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        updateParam('sort', 'nearest');
        pushToast(t.search.geoActive, 'success');
      },
      () => {
        setUserCoords({ lat: 41.2995, lng: 69.2401 });
        updateParam('sort', 'nearest');
        pushToast(t.search.geoDenied, 'info');
      },
      { timeout: 5000 }
    );
  }, [pushToast, t.search.geoActive, t.search.geoDenied, updateParam]);

  const handleAiParse = async () => {
    if (!localQuery.trim()) return;
    setAiParsing(true);
    try {
      const resp = await aiService.smartSearch(localQuery.trim(), language);
      const next = new URLSearchParams(searchParams);
      const f = resp.filters;
      if (f.subject) next.set('subject', String(f.subject));
      if (f.city) next.set('city', String(f.city));
      if (f.district) next.set('district', String(f.district));
      if (f.maxPrice && Number(f.maxPrice) > 0) next.set('maxPrice', String(f.maxPrice));
      if (f.format) next.set('format', String(f.format));
      if (f.schedule) next.set('schedule', String(f.schedule));
      if (f.freeTrialOnly) next.set('freeTrial', '1');
      if (f.explanation) next.set('aiNote', String(f.explanation));
      setSearchParams(next);
      analyticsService.track('ai_smart_search', { query: localQuery });
    } catch (err) {
      pushToast(`${t.ai.apiErrorPrefix}${err instanceof Error ? err.message : 'Error'}`, 'error');
    } finally {
      setAiParsing(false);
    }
  };

  const matchedCenters = useMemo(
    () => filterAndSortCenters(centers, filters, userCoords),
    [centers, filters, userCoords]
  );
  const matchedTutors = useMemo(
    () => filterAndSortTutors(tutors, filters, userCoords),
    [tutors, filters, userCoords]
  );
  const matchedCourses = useMemo(() => filterCourses(courses, filters), [courses, filters]);

  const activeCount =
    filters.tab === 'centers'
      ? matchedCenters.length
      : filters.tab === 'tutors'
        ? matchedTutors.length
        : matchedCourses.length;

  const mapItems: MapMarkerItem[] = useMemo(() => {
    if (filters.tab === 'tutors') {
      return matchedTutors.map((tut) => ({
        id: tut.id,
        slug: tut.slug,
        type: 'tutor',
        name: tut.name,
        lat: tut.lat,
        lng: tut.lng,
        priceUzs: tut.monthlyPackageUzs,
        rating: tut.rating,
        outcomeText: getLocalized(tut.outcomeSummary.headline, language),
        districtLabel: getLocalized(tut.addressLabel, language),
      }));
    }
    return matchedCenters.map((c) => ({
      id: c.id,
      slug: c.slug,
      type: 'center',
      name: c.name,
      lat: c.branches[0].lat,
      lng: c.branches[0].lng,
      priceUzs: c.priceFromUzs,
      rating: c.rating,
      outcomeText: getLocalized(c.outcomeSummary.headline, language),
      districtLabel: getLocalized(c.branches[0].address, language),
    }));
  }, [filters.tab, matchedCenters, matchedTutors, language]);

  const selectedCityObj = CITIES.find((c) => c.id === filters.city);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = [];
    if (filters.subject) {
      const s = ALL_SUBJECTS.find((x) => x.id === filters.subject);
      chips.push({ key: 'subject', label: s ? s.name[language] : filters.subject });
    }
    if (filters.city) {
      const c = CITIES.find((x) => x.id === filters.city);
      chips.push({ key: 'city', label: c ? c.name[language] : filters.city });
    }
    if (filters.district) {
      chips.push({ key: 'district', label: filters.district });
    }
    if (filters.maxPrice < DEFAULT_FILTERS.maxPrice) {
      chips.push({ key: 'maxPrice', label: `≤ ${formatUzs(filters.maxPrice, language)}` });
    }
    if (filters.format) chips.push({ key: 'format', label: filters.format });
    if (filters.schedule) chips.push({ key: 'schedule', label: filters.schedule });
    if (filters.freeTrialOnly) chips.push({ key: 'freeTrial', label: t.common.freeTrial });
    if (filters.installmentsOnly) chips.push({ key: 'installments', label: t.common.installments });
    if (filters.certifiedTeachersOnly) chips.push({ key: 'certified', label: 'IELTS 8+ / PhD' });
    if (filters.facility) {
      const fac = FACILITIES_CATALOG.find((x) => x.id === filters.facility);
      chips.push({ key: 'facility', label: fac ? fac.name[language] : filters.facility });
    }
    return chips;
  }, [filters, language, t]);

  const L = {
    subjectLabel: language === 'ru' ? 'Предмет / Направление' : language === 'en' ? 'Subject / Track' : 'Fan / Yo‘nalish',
    cityLabel: language === 'ru' ? 'Город / Регион' : language === 'en' ? 'City / Region' : 'Shahar / Viloyat',
    districtLabel: language === 'ru' ? 'Район' : language === 'en' ? 'District' : 'Tuman',
    all: language === 'ru' ? 'Все' : language === 'en' ? 'All' : 'Barchasi',
    morning: language === 'ru' ? 'Утро' : language === 'en' ? 'Morning' : 'Ertalab',
    afternoon: language === 'ru' ? 'День' : language === 'en' ? 'Afternoon' : 'Tushdan keyin',
    evening: language === 'ru' ? 'Вечер' : language === 'en' ? 'Evening' : 'Kechki',
    weekend: language === 'ru' ? 'Выходные' : language === 'en' ? 'Weekends' : 'Dam olish kunlari',
    kids: language === 'ru' ? 'Дети' : language === 'en' ? 'Kids' : 'Bolalar',
    teens: language === 'ru' ? 'Подростки' : language === 'en' ? 'Teens' : 'O‘smirlar',
    adults: language === 'ru' ? 'Взрослые' : language === 'en' ? 'Adults' : 'Kattalar',
    studentsUnit: language === 'ru' ? 'учеников' : language === 'en' ? 'students' : 'talaba',
    facilitiesLabel: language === 'ru' ? 'Удобства кампуса' : language === 'en' ? 'Campus Facilities' : 'Markaz sharoitlari',
    allFacilities: language === 'ru' ? 'Все удобства' : language === 'en' ? 'All facilities' : 'Barcha sharoitlar',
  };

  const filterFormContent = (
    <div className="space-y-5 text-sm">
      <div>
        <label htmlFor="f-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {L.subjectLabel}
        </label>
        <select
          id="f-subject"
          value={filters.subject}
          onChange={(e) => updateParam('subject', e.target.value)}
          className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100"
        >
          <option value="">{t.common.allSubjects}</option>
          {SUBJECT_TAXONOMY.map((cat) => (
            <optgroup key={cat.id} label={cat.name[language]}>
              {cat.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name[language]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label htmlFor="f-city" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {L.cityLabel}
          </label>
          <select
            id="f-city"
            value={filters.city}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('city', e.target.value);
              else next.delete('city');
              next.delete('district');
              setSearchParams(next);
            }}
            className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{t.common.allCities}</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name[language]}
              </option>
            ))}
          </select>
        </div>

        {selectedCityObj && (
          <div>
            <label htmlFor="f-district" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {L.districtLabel}
            </label>
            <select
              id="f-district"
              value={filters.district}
              onChange={(e) => updateParam('district', e.target.value)}
              className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="">{t.common.allDistricts}</option>
              {selectedCityObj.districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name[language]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="f-price" className="font-semibold text-slate-700 dark:text-slate-300">
            {t.search.priceRange}
          </label>
          <span className="font-mono font-semibold text-[#3B4CCA] dark:text-indigo-400 tabular-nums">
            ≤ {formatUzs(filters.maxPrice, language)}
          </span>
        </div>
        <input
          id="f-price"
          type="range"
          min={500000}
          max={3000000}
          step={100000}
          value={filters.maxPrice}
          onChange={(e) => updateParam('maxPrice', Number(e.target.value))}
          className="mt-2 w-full accent-[#3B4CCA]"
        />
      </div>

      <div className="grid grid-cols-2 items-end gap-2.5">
        <div>
          <label htmlFor="f-format" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.search.format}
          </label>
          <select
            id="f-format"
            value={filters.format}
            onChange={(e) => updateParam('format', e.target.value)}
            className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-2.5 pr-7 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{L.all}</option>
            <option value={StudyFormat.OFFLINE}>{t.common.offline}</option>
            <option value={StudyFormat.ONLINE}>{t.common.online}</option>
            <option value={StudyFormat.HYBRID}>{t.common.hybrid}</option>
          </select>
        </div>

        <div>
          <label htmlFor="f-schedule" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.search.schedule}
          </label>
          <select
            id="f-schedule"
            value={filters.schedule}
            onChange={(e) => updateParam('schedule', e.target.value)}
            className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-2.5 pr-7 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{L.all}</option>
            <option value={ScheduleSlot.MORNING}>{L.morning}</option>
            <option value={ScheduleSlot.AFTERNOON}>{L.afternoon}</option>
            <option value={ScheduleSlot.EVENING}>{L.evening}</option>
            <option value={ScheduleSlot.WEEKEND}>{L.weekend}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 items-end gap-2.5">
        <div>
          <label htmlFor="f-age" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.search.ageGroup}
          </label>
          <select
            id="f-age"
            value={filters.ageGroup}
            onChange={(e) => updateParam('age', e.target.value)}
            className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-2.5 pr-7 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{L.all}</option>
            <option value={AgeGroup.KIDS}>{L.kids}</option>
            <option value={AgeGroup.TEENS}>{L.teens}</option>
            <option value={AgeGroup.ADULTS}>{L.adults}</option>
          </select>
        </div>

        <div>
          <label htmlFor="f-ilang" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.search.instructionLang}
          </label>
          <select
            id="f-ilang"
            value={filters.instructionLang}
            onChange={(e) => updateParam('ilang', e.target.value)}
            className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-2.5 pr-7 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{L.all}</option>
            <option value="uz">O‘zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 items-end gap-2.5">
        <div>
          <label htmlFor="f-rating" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.search.minRating}
          </label>
          <select
            id="f-rating"
            value={filters.minRating}
            onChange={(e) => updateParam('rating', Number(e.target.value))}
            className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-2.5 pr-7 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value={0}>{L.all}</option>
            <option value={4.5}>4.5+ ★</option>
            <option value={4.7}>4.7+ ★</option>
            <option value={4.8}>4.8+ ★</option>
          </select>
        </div>

        <div>
          <label htmlFor="f-class" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.search.classSize}
          </label>
          <select
            id="f-class"
            value={filters.maxClassSize}
            onChange={(e) => updateParam('classSize', Number(e.target.value))}
            className="mt-1 w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-2.5 pr-7 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value={30}>{L.all}</option>
            <option value={8}>≤ 8 {L.studentsUnit}</option>
            <option value={12}>≤ 12 {L.studentsUnit}</option>
            <option value={16}>≤ 16 {L.studentsUnit}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="f-facility" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {L.facilitiesLabel}
        </label>
        <select
          id="f-facility"
          value={filters.facility}
          onChange={(e) => updateParam('facility', e.target.value)}
          className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100"
        >
          <option value="">{L.allFacilities}</option>
          {FACILITIES_CATALOG.map((fac) => (
            <option key={fac.id} value={fac.id}>
              {fac.name[language]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5 pt-1">
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.freeTrialOnly}
            onChange={(e) => updateParam('freeTrial', e.target.checked)}
            className="h-4 w-4 rounded accent-[#3B4CCA]"
          />
          <span>{t.common.freeTrial}</span>
        </label>
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.installmentsOnly}
            onChange={(e) => updateParam('installments', e.target.checked)}
            className="h-4 w-4 rounded accent-[#3B4CCA]"
          />
          <span>{t.common.installments}</span>
        </label>
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.certifiedTeachersOnly}
            onChange={(e) => updateParam('certified', e.target.checked)}
            className="h-4 w-4 rounded accent-[#3B4CCA]"
          />
          <span>{t.search.certifiedOnly}</span>
        </label>
      </div>

      <button
        type="button"
        onClick={clearAll}
        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        {t.common.clearAll}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {seoTitle}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {activeCount} {t.search.foundCount}
            </p>
          </div>

          {/* Segmented Entity Toggle: Centers | Tutors | Courses */}
          <div className="inline-flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800 p-1 self-start">
            {[
              { id: 'centers', label: `${t.search.tabCenters} (${matchedCenters.length})` },
              { id: 'tutors', label: `${t.search.tabTutors} (${matchedTutors.length})` },
              { id: 'courses', label: `${t.search.tabCourses} (${matchedCourses.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateParam('tab', tab.id)}
                className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap tabular-nums ${
                  filters.tab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input + AI Smart Parse + Sort + View Mode */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <label htmlFor="search-page-query" className="sr-only">
                {t.common.search}
              </label>
              <input
                id="search-page-query"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder={t.landing.searchPlaceholder}
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 text-sm text-slate-900 dark:text-white focus:border-[#3B4CCA] focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={aiParsing || !localQuery.trim()}
              onClick={handleAiParse}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 px-3.5 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-300 hover:bg-indigo-100 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{aiParsing ? '...' : t.landing.aiSearchBtn}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex lg:hidden h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{t.search.filters}</span>
            </button>

            <button
              type="button"
              onClick={handleRequestLocation}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <LocateFixed className="h-3.5 w-3.5 text-[#3B4CCA]" />
              <span>{t.common.nearMe}</span>
            </button>

            <label htmlFor="sort-select" className="sr-only">
              {t.search.sortBy}
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-8 text-xs font-semibold text-slate-800 dark:text-slate-100"
            >
              <option value="relevance">{t.search.sortRelevance}</option>
              <option value="results">{t.search.sortResults}</option>
              <option value="price_asc">{t.search.sortPriceAsc}</option>
              <option value="rating">{t.search.sortRating}</option>
              <option value="nearest">{t.search.sortNearest}</option>
              <option value="newest">{t.search.sortNewest}</option>
            </select>

            <button
              type="button"
              onClick={() => saveSearch(seoTitle, `?${searchParams.toString()}`)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.search.saveSearch}</span>
            </button>

            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label={t.search.listView}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ListIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.search.listView}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden lg:inline-flex rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  viewMode === 'split' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.search.splitView}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                aria-label={t.search.mapView}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1 ${
                  viewMode === 'map' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.search.mapView}</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Parsed Note & Active Filter Chips */}
        {aiNote && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-2 text-xs text-indigo-900 dark:text-indigo-200">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#3B4CCA] shrink-0" />
              <strong>{t.common.aiGenerated}:</strong> {aiNote}
            </span>
            <button
              type="button"
              onClick={() => updateParam('aiNote', '')}
              aria-label={t.common.close}
              className="text-indigo-500 hover:text-indigo-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => updateParam(chip.key, '')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline px-1"
            >
              {t.common.clearAll}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Desktop Sidebar + List / Split Map */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-4">
              {t.search.filters}
            </h2>
            {filterFormContent}
          </div>
        </aside>

        {/* Results + Map Workspace */}
        <div className="lg:col-span-9">
          {viewMode === 'map' && filters.tab !== 'courses' ? (
            <MapView
              items={mapItems}
              userCoords={userCoords}
              onRequestLocation={handleRequestLocation}
              heightClass="h-[580px]"
            />
          ) : (
            <div
              className={`grid grid-cols-1 gap-6 ${
                viewMode === 'split' && filters.tab !== 'courses' ? 'xl:grid-cols-12' : ''
              }`}
            >
              <div
                className={
                  viewMode === 'split' && filters.tab !== 'courses' ? 'xl:col-span-7' : ''
                }
              >
                {activeCount === 0 ? (
                  <EmptyState
                    title={t.common.noResults}
                    description={t.common.noResultsDesc}
                    actionLabel={t.common.clearAll}
                    onAction={clearAll}
                  />
                ) : filters.tab === 'centers' ? (
                  <>
                    <div
                      className={`grid grid-cols-1 gap-4 ${
                        viewMode === 'split' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
                      }`}
                    >
                      {matchedCenters.slice(0, visibleCount).map((center) => (
                        <CenterCard key={center.id} center={center} />
                      ))}
                    </div>
                    {matchedCenters.length > visibleCount && (
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((prev) => prev + 12)}
                          className="h-10 rounded-xl bg-[#3B4CCA] px-5 text-xs font-semibold text-white hover:bg-[#2E3CA8] transition-colors"
                        >
                          {language === 'ru'
                            ? `Показать ещё (${Math.min(12, matchedCenters.length - visibleCount)})`
                            : language === 'en'
                              ? `Show more (${Math.min(12, matchedCenters.length - visibleCount)})`
                              : `Yana ko‘rsatish (+${Math.min(12, matchedCenters.length - visibleCount)})`}
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisibleCount(matchedCenters.length)}
                          className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          {language === 'ru'
                            ? `Показать все (${matchedCenters.length})`
                            : language === 'en'
                              ? `Show all (${matchedCenters.length})`
                              : `Hammasini ko‘rsatish (${matchedCenters.length})`}
                        </button>
                      </div>
                    )}
                  </>
                ) : filters.tab === 'tutors' ? (
                  <>
                    <div
                      className={`grid grid-cols-1 gap-4 ${
                        viewMode === 'split' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
                      }`}
                    >
                      {matchedTutors.slice(0, visibleCount).map((tutor) => (
                        <TutorCard key={tutor.id} tutor={tutor} />
                      ))}
                    </div>
                    {matchedTutors.length > visibleCount && (
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((prev) => prev + 12)}
                          className="h-10 rounded-xl bg-[#3B4CCA] px-5 text-xs font-semibold text-white hover:bg-[#2E3CA8] transition-colors"
                        >
                          {language === 'ru'
                            ? `Показать ещё (${Math.min(12, matchedTutors.length - visibleCount)})`
                            : language === 'en'
                              ? `Show more (${Math.min(12, matchedTutors.length - visibleCount)})`
                              : `Yana ko‘rsatish (+${Math.min(12, matchedTutors.length - visibleCount)})`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {matchedCourses.slice(0, visibleCount).map((course) => {
                        const parentCenter = centers.find((c) => c.id === course.centerId);
                        return (
                          <article
                            key={course.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Link
                                  to={`/center/${course.providerSlug}`}
                                  className="font-semibold text-[#3B4CCA] dark:text-indigo-400 hover:underline"
                                >
                                  {course.providerName}
                                </Link>
                                <span className="tabular-nums">
                                  {course.seatsLeft} {t.common.seatsLeft}
                                </span>
                              </div>
                              <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 dark:text-white">
                                {getLocalized(course.title, language)}
                              </h3>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {course.durationMonths} {t.common.months} · {course.lessonsPerWeek} {t.common.lessonsWeek} · {course.format} · Max {course.classSizeMax}
                              </p>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3.5">
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
                                {parentCenter?.phone && (
                                  <a
                                    href={`tel:${parentCenter.phone.replace(/\s+/g, '')}`}
                                    aria-label={parentCenter.phone}
                                    title={parentCenter.phone}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                )}
                                <Link
                                  to={`/center/${course.providerSlug}`}
                                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#3B4CCA] px-4 text-xs font-semibold text-white hover:bg-[#2E3CA8] whitespace-nowrap"
                                >
                                  {language === 'ru'
                                    ? 'Контакты'
                                    : language === 'en'
                                      ? 'Contacts'
                                      : 'Batafsil va aloqa'}
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    {matchedCourses.length > visibleCount && (
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((prev) => prev + 16)}
                          className="h-10 rounded-xl bg-[#3B4CCA] px-5 text-xs font-semibold text-white hover:bg-[#2E3CA8] transition-colors"
                        >
                          {language === 'ru'
                            ? `Показать ещё (${Math.min(16, matchedCourses.length - visibleCount)})`
                            : language === 'en'
                              ? `Show more (${Math.min(16, matchedCourses.length - visibleCount)})`
                              : `Yana ko‘rsatish (+${Math.min(16, matchedCourses.length - visibleCount)})`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {viewMode === 'split' && filters.tab !== 'courses' && (
                <div className="hidden xl:block xl:col-span-5">
                  <div className="sticky top-20">
                    <MapView
                      items={mapItems}
                      userCoords={userCoords}
                      onRequestLocation={handleRequestLocation}
                      heightClass="h-[calc(100vh-7rem)]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Filters */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/60 backdrop-blur-xs lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t.search.filters}
        >
          <div className="w-full max-h-[86vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {t.search.filters}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label={t.common.close}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterFormContent}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full h-11 rounded-xl bg-[#3B4CCA] text-sm font-semibold text-white"
            >
              {t.common.apply} ({activeCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
