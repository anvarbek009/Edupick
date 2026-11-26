import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Phone, Send, Sparkles, AlertCircle } from 'lucide-react';
import { ALL_SUBJECTS, CITIES } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { aiService, type AiMatchmakerResponse } from '../services/aiService';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { formatUzs, getLocalized } from '../utils/format';
import { useSEO } from '../hooks/useSEO';

export const MatchmakerPage: React.FC = () => {
  const { language, centers, tutors, toggleCompare } = useAppStore();
  const t = getDictionary(language);

  useSEO({
    title: t.ai.matchmakerTitle,
    description: t.ai.matchmakerSubtitle,
  });

  const [subject, setSubject] = useState('ielts');
  const [goal, setGoal] = useState('IELTS 7.0+');
  const [level, setLevel] = useState('Intermediate (B1)');
  const [budget, setBudget] = useState(1200000);
  const [cityId, setCityId] = useState('tashkent');
  const [districtId, setDistrictId] = useState('chilonzor');
  const [schedule, setSchedule] = useState('evening');
  const [deadline, setDeadline] = useState('4 oy ichida');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiMatchmakerResponse | null>(null);

  const selectedCity = CITIES.find((c) => c.id === cityId);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Ground AI strictly in real retrieved candidates from the Edupick catalog
    const matchingCenters = centers
      .filter((c) => c.approvalStatus === 'approved' && (c.subjects.includes(subject) || !subject))
      .sort((a, b) => {
        const aCityMatch = a.branches.some((br) => br.cityId === cityId) ? 1 : 0;
        const bCityMatch = b.branches.some((br) => br.cityId === cityId) ? 1 : 0;
        return bCityMatch - aCityMatch || b.outcomeSummary.successRatePercent - a.outcomeSummary.successRatePercent;
      })
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        entityType: 'center',
        name: c.name,
        city: c.branches[0].cityId,
        district: c.branches[0].districtId,
        monthlyPriceUzs: c.priceFromUzs,
        pricePerLessonUzs: c.pricePerLessonFromUzs,
        verificationLevel: c.verificationLevel,
        outcomeHeadline: c.outcomeSummary.headline[language],
        successRatePercent: c.outcomeSummary.successRatePercent,
        rating: c.rating,
        schedules: c.schedules,
        freeTrial: c.freeTrial,
      }));

    const matchingTutors = tutors
      .filter((tut) => tut.approvalStatus === 'approved' && (tut.subjects.includes(subject) || !subject))
      .slice(0, 8)
      .map((tut) => ({
        id: tut.id,
        entityType: 'tutor',
        name: tut.name,
        city: tut.cityId,
        district: tut.districtId,
        monthlyPriceUzs: tut.monthlyPackageUzs,
        hourlyPriceUzs: tut.hourlyPriceUzs,
        verificationLevel: tut.verificationLevel,
        outcomeHeadline: tut.outcomeSummary.headline[language],
        successRatePercent: tut.outcomeSummary.successRatePercent,
        rating: tut.rating,
        schedules: tut.schedules,
        freeTrial: tut.freeTrial,
      }));

    const candidates = [...matchingCenters, ...matchingTutors];

    try {
      const resp = await aiService.matchmaker(
        { subject, goal, level, budgetUzs: budget, cityId, districtId, schedule, deadline },
        candidates,
        language
      );
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI service error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400">
          <Sparkles className="h-4 w-4" />
          <span>{t.common.aiGenerated}</span>
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.ai.matchmakerTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {t.ai.matchmakerSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleRun}
          className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 self-start"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="mm-subj" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Предмет' : language === 'en' ? 'Subject' : 'Fan'}
              </label>
              <select
                id="mm-subj"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name[language]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mm-goal" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Конкретная цель' : language === 'en' ? 'Target goal' : 'Aniq maqsad'}
              </label>
              <input
                id="mm-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="mm-level" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Текущий уровень' : language === 'en' ? 'Current level' : 'Hozirgi daraja'}
              </label>
              <select
                id="mm-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              >
                <option>Beginner (A1)</option>
                <option>Elementary (A2)</option>
                <option>Intermediate (B1)</option>
                <option>Upper-Intermediate (B2)</option>
                <option>Advanced (C1)</option>
              </select>
            </div>
            <div>
              <label htmlFor="mm-deadline" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Срок' : language === 'en' ? 'Timeline' : 'Muddat'}
              </label>
              <input
                id="mm-deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <label htmlFor="mm-budget" className="font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Месячный бюджет' : language === 'en' ? 'Monthly budget' : 'Oylik byudjet'}
              </label>
              <span className="font-mono font-bold text-[#3B4CCA] dark:text-indigo-400 tabular-nums">
                {formatUzs(budget, language)}
              </span>
            </div>
            <input
              id="mm-budget"
              type="range"
              min={500000}
              max={2500000}
              step={100000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 w-full accent-[#3B4CCA]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="mm-city" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Регион / Город' : language === 'en' ? 'Region / City' : 'Viloyat / Shahar'}
              </label>
              <select
                id="mm-city"
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setDistrictId('');
                }}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name[language]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mm-dist" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'ru' ? 'Район' : language === 'en' ? 'District' : 'Tuman'}
              </label>
              <select
                id="mm-dist"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="">{t.common.allDistricts}</option>
                {selectedCity?.districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name[language]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="mm-schedule" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'ru' ? 'Удобное время' : language === 'en' ? 'Preferred schedule' : 'Qulay vaqt'}
            </label>
            <select
              id="mm-schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="morning">{language === 'ru' ? 'Утром' : language === 'en' ? 'Morning' : 'Ertalab'}</option>
              <option value="afternoon">{language === 'ru' ? 'Днём' : language === 'en' ? 'Afternoon' : 'Tushdan keyin'}</option>
              <option value="evening">{language === 'ru' ? 'Вечером (18:00+)' : language === 'en' ? 'Evening (18:00+)' : 'Kechki (18:00+)'}</option>
              <option value="weekend">{language === 'ru' ? 'Выходные' : language === 'en' ? 'Weekends' : 'Dam olish kunlari'}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#3B4CCA] text-sm font-bold text-white hover:bg-[#2E3CA8] disabled:opacity-60 transition-colors"
          >
            {loading ? t.ai.thinking : t.ai.runMatchmaker}
          </button>

          <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{t.ai.groundedNote}</span>
          </p>
        </form>

        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 p-5 text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t.ai.apiErrorPrefix}</p>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-5">
                <span className="text-[11px] font-semibold text-[#3B4CCA] dark:text-indigo-400">
                  {t.common.aiGenerated}
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                  {result.summary}
                </p>
              </div>

              {result.recommendations.map((rec, idx) => {
                const center = centers.find((c) => c.id === rec.id);
                const tutor = tutors.find((x) => x.id === rec.id);
                const entity = center || tutor;
                if (!entity) return null;
                const price = center ? center.priceFromUzs : tutor!.monthlyPackageUzs;
                const href = center ? `/center/${center.slug}` : `/tutor/${tutor!.slug}`;
                const type = center ? 'center' : 'tutor';

                return (
                  <article
                    key={rec.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#3B4CCA]">
                          #{idx + 1} · {rec.matchScore}% moslik
                        </span>
                        <h2 className="mt-0.5 font-display text-lg font-bold text-slate-900 dark:text-white">
                          <Link to={href} className="hover:text-[#3B4CCA]">
                            {entity.name}
                          </Link>
                        </h2>
                        <div className="mt-1">
                          <VerifiedBadge level={entity.verificationLevel} interactive />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatUzs(price, language)}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          {getLocalized(entity.outcomeSummary.headline, language)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-200">{rec.reason}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <strong>Eslatma:</strong> {rec.tradeoff}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={`tel:${entity.phone.replace(/\s+/g, '')}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{entity.phone}</span>
                      </a>
                      {entity.telegram && (
                        <a
                          href={`https://t.me/${entity.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Telegram</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleCompare({ id: entity.id, type })}
                        className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        {t.common.compare}
                      </button>
                      <Link
                        to={href}
                        className="inline-flex h-9 items-center gap-1 px-2 text-xs font-semibold text-[#3B4CCA] dark:text-indigo-400"
                      >
                        {language === 'ru'
                          ? 'Подробнее'
                          : language === 'en'
                            ? 'Details & Contacts'
                            : 'Batafsil va aloqa'}{' '}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-10 text-center space-y-3">
              <Sparkles className="mx-auto h-8 w-8 text-[#3B4CCA]" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ru'
                  ? 'Персональные рекомендации появятся здесь'
                  : language === 'en'
                    ? 'Your personalized matches will appear here'
                    : 'Shaxsiy tavsiyalar shu yerda chiqadi'}
              </h2>
              <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
                {language === 'ru'
                  ? `Заполните форму слева — Edupick AI проанализирует результаты ${centers.length}+ учебных центров (14 регионов) и ${tutors.length}+ репетиторов и подберёт 3–5 лучших вариантов.`
                  : language === 'en'
                    ? `Fill out the form on the left — Edupick AI analyzes verified outcomes across ${centers.length}+ learning centers (all 14 regions) and ${tutors.length}+ tutors to pick your top 3–5 matches.`
                    : `Chap tomondagi anketani to‘ldiring — Edupick AI O‘zbekistonning 14 viloyatidagi ${centers.length}+ o‘quv markazi va ${tutors.length}+ repetitor natijalarini tahlil qilib eng mos 3–5 ta variantni ajratib beradi.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
