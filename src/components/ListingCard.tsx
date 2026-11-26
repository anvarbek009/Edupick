import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  GraduationCap,
  Heart,
  MapPin,
  Phone,
  Scale,
  Send,
  Star,
  TrendingUp,
} from 'lucide-react';
import { EntityArtwork } from './EntityArtwork';
import { VerifiedBadge } from './VerifiedBadge';
import { ALL_SUBJECTS, CITIES, FACILITIES_CATALOG } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { type Center, type Tutor } from '../types/domain';
import { formatUzs, getLocalized } from '../utils/format';

const SUBJECT_MAP = new Map(ALL_SUBJECTS.map((s) => [s.id, s]));
const CITY_MAP = new Map(CITIES.map((c) => [c.id, c]));
const FACILITY_MAP = new Map(FACILITIES_CATALOG.map((f) => [f.id, f]));

interface CenterCardProps {
  center: Center & { distanceKm?: number };
  rankBadge?: number;
}

export const CenterCard: React.FC<CenterCardProps> = React.memo(({ center, rankBadge }) => {
  const language = useAppStore((s) => s.language);
  const isFav = useAppStore((s) => s.favorites.includes(center.id));
  const isCompared = useAppStore((s) => s.compareList.some((c) => c.id === center.id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const t = getDictionary(language);

  const primaryBranch = center.branches[0];
  const city = CITY_MAP.get(primaryBranch.cityId);
  const district = city?.districts.find((d) => d.id === primaryBranch.districtId);

  const subjectLabels = center.subjects
    .slice(0, 3)
    .map((id) => SUBJECT_MAP.get(id)?.name[language] || id.toUpperCase())
    .join(' · ');

  const facilities = center.facilities || [];
  const topFacilityNames = facilities
    .slice(0, 3)
    .map((fid) => FACILITY_MAP.get(fid)?.name[language] || fid);
  const extraFacilityCount = Math.max(0, facilities.length - 3);

  const branchSuffix =
    center.branches.length > 1
      ? language === 'ru'
        ? ` · ${center.branches.length} фил.`
        : language === 'en'
          ? ` · ${center.branches.length} branches`
          : ` · ${center.branches.length} filial`
      : '';

  const graduatesLabel =
    center.totalGraduates >= 1000
      ? `${(center.totalGraduates / 1000).toFixed(center.totalGraduates >= 10000 ? 0 : 1)}k+`
      : `${center.totalGraduates}+`;

  const detailsCta =
    language === 'ru'
      ? 'Подробнее и контакты'
      : language === 'en'
        ? 'Details & Contacts'
        : 'Batafsil va aloqa';

  const telegramHref = `https://t.me/${center.telegram.replace(/^@/, '')}`;
  const telHref = `tel:${center.phone.replace(/\s+/g, '')}`;

  return (
    <article className="@container group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="relative">
          <Link
            to={`/center/${center.slug}`}
            className="block focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-xl overflow-hidden"
          >
            <EntityArtwork
              name={center.name}
              slug={center.slug}
              website={center.website}
              accentColor={center.accentColor}
              category={center.categories[0]}
              photoKey={center.campusPhotos?.[0]}
              logoDomain={center.logoDomain}
              subtitle={
                district
                  ? `${district.name[language]}, ${city?.name[language]}`
                  : city?.name[language]
              }
            />
          </Link>

          {typeof rankBadge === 'number' && (
            <div className="pointer-events-none absolute left-2.5 bottom-2.5 hidden" aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={() => toggleFavorite(center.id)}
            aria-label={isFav ? `Remove ${center.name} from favorites` : `Save ${center.name} to favorites`}
            className="absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-sm hover:scale-105 active:scale-90 transition-transform"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${isFav ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
            />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <VerifiedBadge level={center.verificationLevel} interactive />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            {rankBadge ? `#${rankBadge} · ` : ''}
            {language === 'ru' ? 'Индекс' : language === 'en' ? 'Authority' : 'Reyting'}{' '}
            <strong className="text-[#3B4CCA] dark:text-indigo-400">{center.authorityScore}/100</strong>
          </span>
        </div>

        <Link
          to={`/center/${center.slug}`}
          className="mt-1.5 block font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#3B4CCA] dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
        >
          {center.name}
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            {center.googleRating.toFixed(1)}
          </span>
          <span className="tabular-nums">
            ({center.googleReviewCount.toLocaleString('en-US').replace(/,/g, '\u2009')} Google/Yandex)
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <GraduationCap className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {graduatesLabel}
          </span>
        </div>

        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 truncate">{subjectLabels}</p>

        {/* Key Verified Outcome Highlight */}
        <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-200">
          <TrendingUp
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-semibold tabular-nums truncate">
              {getLocalized(center.outcomeSummary.headline, language)}
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 tabular-nums">
              2022–2026 · n = {center.outcomeSummary.sampleSize} {t.common.students}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">
            {district ? `${district.name[language]}, ${city?.name[language]}` : primaryBranch.address[language]}
            {branchSuffix}
          </span>
          {typeof center.distanceKm === 'number' && (
            <span className="shrink-0 font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
              · {center.distanceKm} km
            </span>
          )}
        </div>

        {topFacilityNames.length > 0 && (
          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3B4CCA] dark:text-indigo-400" aria-hidden="true" />
            <span className="line-clamp-1">
              {topFacilityNames.join(' · ')}
              {extraFacilityCount > 0 ? ` +${extraFacilityCount}` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3.5 border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.common.from} </span>
            <span className="font-display text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {formatUzs(center.priceFromUzs, language)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400"> / {t.common.perMonth}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            ~{formatUzs(center.pricePerLessonFromUzs, language)}
          </span>
        </div>

        {/* Direct Contacts + Profile + Compare Actions (No Trial Booking Middleman) */}
        <div className="mt-3 flex items-center gap-1.5">
          <Link
            to={`/center/${center.slug}`}
            className="flex-1 min-w-0 h-9 inline-flex items-center justify-center gap-1 rounded-xl bg-[#3B4CCA] px-2.5 text-xs font-semibold text-white hover:bg-[#2E3CA8] active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <span className="hidden @[275px]:inline">{detailsCta}</span>
            <span className="@[275px]:hidden">
              {language === 'ru' ? 'Подробнее' : language === 'en' ? 'Details' : 'Batafsil'}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>

          <a
            href={telHref}
            title={center.phone}
            aria-label={`${center.name} phone ${center.phone}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            title={`Telegram: ${center.telegram}`}
            aria-label={`${center.name} Telegram ${center.telegram}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => toggleCompare({ id: center.id, type: 'center' })}
            aria-pressed={isCompared}
            aria-label={`${t.common.compare} ${center.name}`}
            title={t.common.compare}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold active:scale-95 transition-all ${
              isCompared
                ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950/60 text-[#3B4CCA] dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
});

CenterCard.displayName = 'CenterCard';

interface TutorCardProps {
  tutor: Tutor & { distanceKm?: number };
}

export const TutorCard: React.FC<TutorCardProps> = React.memo(({ tutor }) => {
  const language = useAppStore((s) => s.language);
  const isFav = useAppStore((s) => s.favorites.includes(tutor.id));
  const isCompared = useAppStore((s) => s.compareList.some((c) => c.id === tutor.id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const t = getDictionary(language);

  const subjectLabels = tutor.subjects
    .map((id) => SUBJECT_MAP.get(id)?.name[language] || id.toUpperCase())
    .join(' · ');

  const detailsCta =
    language === 'ru'
      ? 'Профиль и контакты'
      : language === 'en'
        ? 'Profile & Contacts'
        : 'Profil va aloqa';

  const telegramHref = `https://t.me/${tutor.telegram.replace(/^@/, '')}`;
  const telHref = `tel:${tutor.phone.replace(/\s+/g, '')}`;

  return (
    <article className="@container group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link to={`/tutor/${tutor.slug}`} className="flex items-center gap-3 min-w-0">
            <EntityArtwork
              name={tutor.name}
              initials={tutor.initials}
              accentColor={tutor.accentColor}
              variant="avatar"
              className="h-14 w-14 text-base"
            />
            <div className="min-w-0">
              <VerifiedBadge level={tutor.verificationLevel} interactive />
              <h3 className="mt-0.5 font-display text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[#3B4CCA] dark:group-hover:text-indigo-400">
                {tutor.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {subjectLabels} · {tutor.experienceYears} {t.common.yearsExp}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => toggleFavorite(tutor.id)}
            aria-label={isFav ? `Remove ${tutor.name} from favorites` : `Save ${tutor.name} to favorites`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {tutor.rating.toFixed(1)}
          </span>
          <span>
            ({tutor.reviewCount} {t.common.reviews})
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{tutor.certificates[0]}</span>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-200">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="font-semibold tabular-nums">
            {getLocalized(tutor.outcomeSummary.headline, language)}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{getLocalized(tutor.addressLabel, language)}</span>
          {typeof tutor.distanceKm === 'number' && (
            <span className="shrink-0 font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
              · {tutor.distanceKm} km
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-display text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {formatUzs(tutor.hourlyPriceUzs, language)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400"> / {t.common.perHour}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {formatUzs(tutor.monthlyPackageUzs, language)}/{t.common.perMonth}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <Link
            to={`/tutor/${tutor.slug}`}
            className="flex-1 min-w-0 h-9 inline-flex items-center justify-center gap-1 rounded-xl bg-[#3B4CCA] px-2.5 text-xs font-semibold text-white hover:bg-[#2E3CA8] active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <span className="hidden @[275px]:inline">{detailsCta}</span>
            <span className="@[275px]:hidden">
              {language === 'ru' ? 'Профиль' : language === 'en' ? 'Profile' : 'Profil'}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
          <a
            href={telHref}
            title={tutor.phone}
            aria-label={`${tutor.name} phone ${tutor.phone}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            title={`Telegram: ${tutor.telegram}`}
            aria-label={`${tutor.name} Telegram ${tutor.telegram}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => toggleCompare({ id: tutor.id, type: 'tutor' })}
            aria-pressed={isCompared}
            aria-label={`${t.common.compare} ${tutor.name}`}
            title={t.common.compare}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold active:scale-95 transition-all ${
              isCompared
                ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950/60 text-[#3B4CCA] dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
});

TutorCard.displayName = 'TutorCard';
