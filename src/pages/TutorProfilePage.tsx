import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  Calendar,
  MapPin,
  Phone,
  Play,
  Scale,
  Send,
  Star,
  TrendingUp,
} from 'lucide-react';
import { ALL_SUBJECTS } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { EntityArtwork } from '../components/EntityArtwork';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { EmptyState } from '../components/GlobalChrome';
import { formatUzs, getLocalized } from '../utils/format';
import { useSEO } from '../hooks/useSEO';

export const TutorProfilePage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    language,
    tutors,
    results,
    reviews,
    compareList,
    toggleCompare,
    openReportModal,
  } = useAppStore();
  const t = getDictionary(language);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const tutor = tutors.find((x) => x.slug === slug);

  useSEO({
    title: tutor ? `${tutor.name} — Repetitor` : 'Tutor not found',
    description: tutor ? getLocalized(tutor.headline, language) : t.landing.heroSubtitle,
  });

  const tutorResults = useMemo(
    () => (tutor ? results.filter((r) => r.entityId === tutor.id && r.moderationStatus === 'approved') : []),
    [tutor, results]
  );

  const tutorReviews = useMemo(
    () => (tutor ? reviews.filter((r) => r.entityId === tutor.id && r.moderationStatus === 'approved') : []),
    [tutor, reviews]
  );

  if (!tutor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <EmptyState
          title={
            language === 'ru'
              ? 'Репетитор не найден'
              : language === 'en'
                ? 'Tutor not found'
                : 'Repetitor topilmadi'
          }
          description={
            language === 'ru'
              ? 'Вы можете выбрать другого проверенного репетитора из каталога.'
              : language === 'en'
                ? 'Browse other verified tutors in the directory.'
                : 'Katalogdan boshqa tasdiqlangan repetitorlarni ko‘rishingiz mumkin.'
          }
          actionLabel={t.compare.browseCatalog}
          onAction={() => {
            navigate('/search?tab=tutors');
          }}
        />
      </div>
    );
  }

  const isCompared = compareList.some((c) => c.id === tutor.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-20">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-5">
            <EntityArtwork
              name={tutor.name}
              initials={tutor.initials}
              accentColor={tutor.accentColor}
              variant="avatar"
              className="h-24 w-24 text-2xl"
            />
            <div className="space-y-2">
              <VerifiedBadge level={tutor.verificationLevel} interactive size="md" />
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {tutor.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {getLocalized(tutor.headline, language)}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {tutor.rating.toFixed(1)} ({tutor.reviewCount} {t.common.reviews})
                </span>
                <span>· {tutor.experienceYears} {t.common.yearsExp}</span>
                <span className="inline-flex items-center gap-1">
                  · <MapPin className="h-3.5 w-3.5" /> {getLocalized(tutor.addressLabel, language)}
                </span>
              </div>
              <div className="pt-1 flex flex-wrap gap-2 text-xs">
                <a
                  href={`tel:${tutor.phone.replace(/\s+/g, '')}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Phone className="h-3.5 w-3.5" /> {tutor.phone}
                </a>
                <a
                  href={`https://t.me/${tutor.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 font-semibold text-sky-700 dark:text-sky-400"
                >
                  <Send className="h-3.5 w-3.5" /> {tutor.telegram}
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:min-w-[250px]">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
              <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatUzs(tutor.hourlyPriceUzs, language)}
                <span className="text-xs font-normal text-slate-500"> / {t.common.perHour}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                {language === 'ru' ? 'Месячный пакет:' : language === 'en' ? 'Monthly package:' : 'Oylik paket:'}{' '}
                {formatUzs(tutor.monthlyPackageUzs, language)} ({tutor.lessonsPerWeek} {t.common.lessonsWeek})
              </p>
            </div>
            <a
              href={`tel:${tutor.phone.replace(/\s+/g, '')}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700"
            >
              <Phone className="h-4 w-4" />
              <span>{tutor.phone}</span>
            </a>
            <a
              href={`https://t.me/${tutor.telegram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-500 text-xs font-bold text-white hover:bg-sky-600"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Telegram: {tutor.telegram}</span>
            </a>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleCompare({ id: tutor.id, type: 'tutor' })}
                className={`flex-1 h-10 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                  isCompared
                    ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950 text-[#3B4CCA]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Scale className="h-3.5 w-3.5" /> {t.common.compare}
              </button>
              <button
                type="button"
                onClick={() =>
                  openReportModal({
                    entityId: tutor.id,
                    entityType: 'tutor',
                    entityLabel: tutor.name,
                  })
                }
                aria-label={t.common.report}
                className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex items-center justify-center text-slate-500 hover:text-amber-600"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          {/* Intro Video Slot */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-3">
              {t.profile.introVideo} ({tutor.introVideoDuration})
            </h2>
            <div
              className="relative flex h-52 flex-col items-center justify-center rounded-xl text-white p-6 text-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${tutor.accentColor} 0%, #0F172A 100%)` }}
            >
              {!videoPlaying ? (
                <>
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#3B4CCA] shadow-lg hover:scale-105 transition-transform"
                    aria-label="Play intro video"
                  >
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </button>
                  <p className="mt-3 text-sm font-semibold max-w-md">
                    {getLocalized(tutor.introVideoTopic, language)}
                  </p>
                </>
              ) : (
                <div className="space-y-3 max-w-md">
                  <p className="text-xs font-mono text-emerald-300">00:12 / {tutor.introVideoDuration} · Video preview</p>
                  <p className="text-sm leading-relaxed">
                    “Assalomu alaykum! Men {tutor.name}. Har bir darsda imtihon strategiyasi va shaxsiy xatolar ustida ishlaymiz.”
                  </p>
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(false)}
                    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
                  >
                    {t.common.close}
                  </button>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {getLocalized(tutor.bio, language)}
            </p>
          </div>

          {/* Verified Results */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                {t.profile.tabResults}
              </h2>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {getLocalized(tutor.outcomeSummary.headline, language)}
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tutorResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {r.studentDisplayName} · <span className="font-mono text-[#3B4CCA]">{r.scoreLabel}</span>
                    </p>
                    <p className="text-slate-500">{r.evidenceSummary}</p>
                  </div>
                  <VerifiedBadge level={r.verificationLevel} interactive />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.profile.tabReviews} ({tutorReviews.length})
            </h2>
            {tutorReviews.map((rev) => (
              <div key={rev.id} className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {rev.authorName} · ★ {rev.rating}.0
                  </span>
                  <span className="text-slate-400">{rev.attendedMonths} {t.profile.attendedMonths}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#3B4CCA]" />
              {t.profile.availability}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {tutor.availabilitySlots.map((slot) => (
                <a
                  key={slot}
                  href={`https://t.me/${tutor.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[42px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:border-[#3B4CCA] hover:text-[#3B4CCA]"
                >
                  {slot}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 text-xs">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              {language === 'ru'
                ? 'Сертификаты и предметы'
                : language === 'en'
                  ? 'Certificates & subjects'
                  : 'Sertifikatlar va fanlar'}
            </h2>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {tutor.certificates.join(' · ')}
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'ru' ? 'Предметы:' : language === 'en' ? 'Subjects:' : 'Fanlar:'}{' '}
              {tutor.subjects
                .map((s) => ALL_SUBJECTS.find((x) => x.id === s)?.name[language] || s)
                .join(', ')}
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'ru' ? 'Формат:' : language === 'en' ? 'Format:' : 'Format:'} {tutor.formats.join(', ')} ·{' '}
              {language === 'ru' ? 'Языки:' : language === 'en' ? 'Languages:' : 'Tillar:'}{' '}
              {tutor.instructionLanguages.map((l) => l.toUpperCase()).join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
