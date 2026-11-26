import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, CreditCard, Download, Send, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { CourseLevel, type Booking } from '../types/domain';
import { formatUzPhone, formatUzs, generateBookingIcs, getLocalized, isValidUzPhone } from '../utils/format';

const TIME_SLOTS = ['09:30', '11:00', '14:30', '16:00', '18:30', '19:30'];

function getUpcomingDates() {
  const dates: Array<{ iso: string; label: string }> = [];
  const base = new Date('2026-11-26T09:00:00Z');
  for (let i = 0; i < 6; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    dates.push({ iso, label });
  }
  return dates;
}

export const BookingWizardModal: React.FC = () => {
  const {
    bookingTarget,
    closeBookingModal,
    centers,
    tutors,
    courses,
    user,
    language,
    createBooking,
  } = useAppStore();
  const t = getDictionary(language);
  const navigate = useNavigate();

  const entity = useMemo(() => {
    if (!bookingTarget) return null;
    if (bookingTarget.entityType === 'center') {
      return centers.find((c) => c.id === bookingTarget.entityId) || null;
    }
    return tutors.find((x) => x.id === bookingTarget.entityId) || null;
  }, [bookingTarget, centers, tutors]);

  const entityCourses = useMemo(() => {
    if (!bookingTarget || bookingTarget.entityType !== 'center') return [];
    return courses.filter((c) => c.centerId === bookingTarget.entityId);
  }, [bookingTarget, courses]);

  const dates = useMemo(() => getUpcomingDates(), []);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCourseId, setSelectedCourseId] = useState(bookingTarget?.courseId || '');
  const [selectedBranchIdx, setSelectedBranchIdx] = useState(0);
  const [date, setDate] = useState(dates[0].iso);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[4]);
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentAge, setStudentAge] = useState('17');
  const [currentLevel, setCurrentLevel] = useState<CourseLevel>(CourseLevel.INTERMEDIATE);
  const [goalText, setGoalText] = useState('Imtihonga tayyorlanish');
  const [targetScoreOrUni, setTargetScoreOrUni] = useState('IELTS 7.0');
  const [phone, setPhone] = useState(user?.phone || '+998 ');
  const [telegram, setTelegram] = useState(user?.telegramHandle || '');
  const [paymentMethod, setPaymentMethod] = useState<'free' | 'payme' | 'click' | 'uzum'>('free');
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingTarget) return;
    setStep(1);
    setSelectedCourseId(bookingTarget.courseId || '');
    setSelectedBranchIdx(0);
    setDate(dates[0].iso);
    setTimeSlot(TIME_SLOTS[4]);
    setStudentName(user?.name || '');
    setPhone(user?.phone || '+998 ');
    setTelegram(user?.telegramHandle || '');
    setPaymentMethod('free');
    setError('');
    setConfirmedBooking(null);
  }, [bookingTarget, user, dates]);

  if (!bookingTarget || !entity) return null;

  const isCenter = bookingTarget.entityType === 'center';
  const centerEntity = isCenter ? (entity as (typeof centers)[number]) : null;
  const tutorEntity = !isCenter ? (entity as (typeof tutors)[number]) : null;

  const chosenCourse =
    entityCourses.find((c) => c.id === selectedCourseId) || entityCourses[0];
  const courseTitle = chosenCourse
    ? getLocalized(chosenCourse.title, language)
    : tutorEntity
      ? `${tutorEntity.subjects[0].toUpperCase()} — 1-on-1`
      : 'Trial Lesson';
  const branchAddress = centerEntity
    ? getLocalized(centerEntity.branches[selectedBranchIdx]?.address || centerEntity.branches[0].address, language)
    : tutorEntity
      ? getLocalized(tutorEntity.addressLabel, language)
      : 'Tashkent';

  const depositUzs = paymentMethod === 'free' ? 0 : centerEntity?.trialFeeUzs || 50000;

  const resetAndClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    setError('');
    closeBookingModal();
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim().length < 2) {
      setError('Talaba ismini kiriting');
      return;
    }
    if (!isValidUzPhone(phone)) {
      setError('Telefon raqamini +998 XX XXX XX XX formatida kiriting');
      return;
    }
    setError('');
    const created = createBooking({
      entityId: entity.id,
      entityType: bookingTarget.entityType,
      entityName: entity.name,
      entitySlug: entity.slug,
      courseId: chosenCourse?.id,
      courseTitle,
      branchAddress,
      userId: user?.id || 'guest',
      studentName: studentName.trim(),
      studentAge: Number(studentAge) || 17,
      currentLevel,
      goalText: goalText.trim(),
      targetScoreOrUni: targetScoreOrUni.trim(),
      phone,
      telegram: telegram.trim() || undefined,
      date,
      timeSlot,
      paymentMethod,
      depositUzs,
    });
    setConfirmedBooking(created);
    setStep(4);
  };

  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;
    const content = generateBookingIcs({
      id: confirmedBooking.id,
      title: `Edupick Trial: ${confirmedBooking.entityName}`,
      location: confirmedBooking.branchAddress,
      date: confirmedBooking.date,
      timeSlot: confirmedBooking.timeSlot,
      description: `Course: ${confirmedBooking.courseTitle}. Goal: ${confirmedBooking.targetScoreOrUni}`,
    });
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupick-trial-${confirmedBooking.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl">
        <button
          type="button"
          onClick={resetAndClose}
          aria-label={t.common.close}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="booking-modal-title" className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white pr-8">
          {t.booking.title}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {entity.name} · {branchAddress}
        </p>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-colors ${
                  step >= idx ? 'bg-[#3B4CCA]' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-4">
            {isCenter && entityCourses.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t.booking.selectCourse}
                </p>
                <div className="space-y-2">
                  {entityCourses.map((c) => {
                    const active = (selectedCourseId || entityCourses[0].id) === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCourseId(c.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-[#3B4CCA] bg-indigo-50/70 dark:bg-indigo-950/50'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {getLocalized(c.title, language)}
                          </span>
                          <span className="text-xs font-bold text-[#3B4CCA] dark:text-indigo-400 tabular-nums">
                            {formatUzs(c.priceMonthlyUzs, language)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {c.lessonsPerWeek} {t.common.lessonsWeek} · {c.durationMonths} {t.common.months} · {c.seatsLeft} {t.common.seatsLeft}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {centerEntity && centerEntity.branches.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Filial</p>
                <div className="space-y-2">
                  {centerEntity.branches.map((br, idx) => (
                    <button
                      key={br.id}
                      type="button"
                      onClick={() => setSelectedBranchIdx(idx)}
                      className={`w-full rounded-xl border p-3 text-left text-xs transition-colors ${
                        selectedBranchIdx === idx
                          ? 'border-[#3B4CCA] bg-indigo-50/70 dark:bg-indigo-950/50 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{getLocalized(br.name, language)}</span> — {getLocalized(br.address, language)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-xl bg-[#3B4CCA] text-sm font-semibold text-white hover:bg-[#2E3CA8]"
            >
              {t.common.next}: {t.booking.step2}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {t.booking.selectDate}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {dates.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDate(d.iso)}
                    className={`min-h-[44px] rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                      date === d.iso
                        ? 'border-[#3B4CCA] bg-[#3B4CCA] text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {t.booking.selectSlot}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`min-h-[44px] rounded-xl border text-xs font-mono font-semibold transition-colors ${
                      timeSlot === slot
                        ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950 text-[#3B4CCA] dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.common.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-11 rounded-xl bg-[#3B4CCA] text-sm font-semibold text-white hover:bg-[#2E3CA8]"
              >
                {t.common.next}: {t.booking.step3}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleConfirm} className="mt-5 space-y-3.5">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="bk-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.booking.studentName}
                </label>
                <input
                  id="bk-name"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Anvar Asqarov"
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="bk-age" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.booking.studentAge}
                </label>
                <input
                  id="bk-age"
                  type="number"
                  min={5}
                  max={70}
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="bk-level" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.booking.currentLevel}
                </label>
                <select
                  id="bk-level"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value as CourseLevel)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                >
                  <option value={CourseLevel.BEGINNER}>Beginner (A1)</option>
                  <option value={CourseLevel.ELEMENTARY}>Elementary (A2)</option>
                  <option value={CourseLevel.INTERMEDIATE}>Intermediate (B1)</option>
                  <option value={CourseLevel.UPPER_INTERMEDIATE}>Upper-Intermediate (B2)</option>
                  <option value={CourseLevel.ADVANCED}>Advanced (C1)</option>
                </select>
              </div>
              <div>
                <label htmlFor="bk-target" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.booking.targetLabel}
                </label>
                <input
                  id="bk-target"
                  value={targetScoreOrUni}
                  onChange={(e) => setTargetScoreOrUni(e.target.value)}
                  placeholder="IELTS 7.5 / WIUT"
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="bk-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.booking.phoneLabel}
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUzPhone(e.target.value))}
                  placeholder="+998 90 123 45 67"
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="bk-tg" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.booking.telegramLabel}
                </label>
                <input
                  id="bk-tg"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Optional Payme / Click / Uzum Deposit Stub */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> {t.booking.paymentOption}
              </p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'free' as const, label: t.common.freeTrial },
                  { id: 'payme' as const, label: 'Payme' },
                  { id: 'click' as const, label: 'Click' },
                  { id: 'uzum' as const, label: 'Uzum' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                      paymentMethod === pm.id
                        ? 'border-[#3B4CCA] bg-indigo-50 dark:bg-indigo-950 text-[#3B4CCA] dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
              {paymentMethod !== 'free' && (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {t.booking.depositStub}: {formatUzs(depositUzs, language)}
                </p>
              )}
            </div>

            {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.common.back}
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                {t.booking.confirmBtn}
              </button>
            </div>
          </form>
        )}

        {step === 4 && confirmedBooking && (
          <div className="mt-5 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {t.booking.confirmedTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.booking.confirmedDesc}</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-left text-xs space-y-1.5">
              <p className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.entityName}</p>
              <p className="text-slate-600 dark:text-slate-300">{confirmedBooking.courseTitle}</p>
              <p className="font-mono text-slate-700 dark:text-slate-200">
                {confirmedBooking.date} · {confirmedBooking.timeSlot}
              </p>
              <p className="text-slate-500 dark:text-slate-400">{confirmedBooking.branchAddress}</p>
              <p className="pt-1.5 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5 font-medium">
                <Send className="h-3.5 w-3.5" /> {t.booking.mockNotificationSent}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                <span>{t.booking.addToCalendar}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  navigate('/dashboard/student');
                }}
                className="flex-1 h-11 rounded-xl bg-[#3B4CCA] text-xs font-semibold text-white hover:bg-[#2E3CA8]"
              >
                {t.booking.goToDashboard}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
