import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  Calendar,
  Copy,
  Gift,
  Heart,
  LogOut,
  Plus,
  Scale,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { BookingStatus, UserRole } from '../types/domain';
import { CenterCard, TutorCard } from '../components/ListingCard';
import { useSEO } from '../hooks/useSEO';
import { analyticsService } from '../services/analyticsService';

export const StudentDashboardPage: React.FC = () => {
  const {
    language,
    user,
    openAuthModal,
    quickDemoLogin,
    signOut,
    bookings,
    updateBookingStatus,
    submitTrialFeedback,
    favorites,
    centers,
    tutors,
    savedSearches,
    deleteSavedSearch,
    savedComparisons,
    notifications,
    markNotificationsRead,
    addMockScore,
    addChildProfile,
    pushToast,
  } = useAppStore();
  const t = getDictionary(language);

  useSEO({
    title: t.dashboard.studentTitle,
    description: t.dashboard.studentTitle,
  });

  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'progress' | 'saved' | 'children' | 'notifications'>('bookings');
  const [newScoreVal, setNewScoreVal] = useState('7.0');
  const [newScoreNote, setNewScoreNote] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('14');
  const [childGoal, setChildGoal] = useState('IELTS 6.5');

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.dashboard.studentTitle}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sinov darslaringiz, sevimli markazlar va mock-test natijalaringizni ko‘rish uchun kiring.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={openAuthModal}
            className="h-11 rounded-xl bg-[#3B4CCA] px-6 text-sm font-semibold text-white"
          >
            {t.common.login}
          </button>
          <button
            type="button"
            onClick={() => quickDemoLogin(UserRole.STUDENT)}
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-5 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Demo talaba sifatida kirish
          </button>
        </div>
      </div>
    );
  }

  const favCenters = centers.filter((c) => favorites.includes(c.id));
  const favTutors = tutors.filter((x) => favorites.includes(x.id));
  const mockChartData = (user.mockScores || []).map((m) => ({
    date: m.date.slice(5),
    score: m.score,
    target: user.goal?.targetScore || 7.0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.dashboard.studentTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {user.name} · <span className="font-mono">{user.phone}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(user.referralCode).catch(() => {});
              analyticsService.track('referral_copied', { code: user.referralCode });
              pushToast(`Taklif kodi nusxalandi: ${user.referralCode}`, 'success');
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 px-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <Gift className="h-4 w-4" />
            <span className="font-mono">{user.referralCode}</span>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            <LogOut className="h-3.5 w-3.5" /> {t.common.logout}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'bookings' as const, label: `${t.dashboard.myBookings} (${bookings.length})`, Icon: Calendar },
            { id: 'progress' as const, label: t.dashboard.progressTracker, Icon: Target },
            { id: 'favorites' as const, label: `${t.dashboard.favorites} (${favorites.length})`, Icon: Heart },
            { id: 'saved' as const, label: `${t.dashboard.savedSearches} (${savedSearches.length + savedComparisons.length})`, Icon: Bookmark },
            { id: 'children' as const, label: t.dashboard.childrenProfiles, Icon: Users },
            { id: 'notifications' as const, label: `${t.dashboard.notifications} (${notifications.filter((n) => !n.read).length})`, Icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 border-b-2 px-4 text-xs font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#3B4CCA] text-[#3B4CCA] dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              <tab.Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((bk) => (
            <div
              key={bk.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-[#3B4CCA]">{bk.date} · {bk.timeSlot}</span>
                  <span>·</span>
                  <span className="font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                    {bk.status}
                  </span>
                </div>
                <Link
                  to={bk.entityType === 'center' ? `/center/${bk.entitySlug}` : `/tutor/${bk.entitySlug}`}
                  className="font-display text-base font-bold text-slate-900 dark:text-white hover:text-[#3B4CCA]"
                >
                  {bk.entityName}
                </Link>
                <p className="text-xs text-slate-500">
                  {bk.courseTitle} · {bk.branchAddress}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {bk.status === BookingStatus.CONFIRMED && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(bk.id, BookingStatus.COMPLETED)}
                      className="h-9 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white"
                    >
                      Qatnashdim
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(bk.id, BookingStatus.CANCELLED)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {t.common.cancel}
                    </button>
                  </>
                )}
                {bk.status === BookingStatus.COMPLETED && !bk.feedbackSubmitted && (
                  <div className="flex items-center gap-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 px-3 py-2 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Kursga yozildingizmi?</span>
                    <button
                      type="button"
                      onClick={() => submitTrialFeedback(bk.id, true, 5)}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white"
                    >
                      Ha (5★)
                    </button>
                    <button
                      type="button"
                      onClick={() => submitTrialFeedback(bk.id, false, 4)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 font-semibold"
                    >
                      Yo‘q (4★)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROGRESS TRACKER TAB */}
      {activeTab === 'progress' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {user.goal?.exam || 'IELTS'} maqsad: {user.goal?.targetScore || 7.0} ({user.goal?.targetDate || '2027-03'})
                </h2>
                <p className="text-xs text-slate-500">Mock-test ballari dinamikasi</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[4, 9]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3B4CCA" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target" stroke="#16A34A" strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = Number(newScoreVal);
              if (Number.isNaN(val) || val <= 0) return;
              addMockScore({
                date: new Date().toISOString().slice(0, 10),
                exam: user.goal?.exam || 'IELTS',
                score: val,
                maxScore: 9,
                note: newScoreNote.trim() || 'Mock test',
              });
              setNewScoreNote('');
            }}
            className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 self-start"
          >
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.dashboard.logMockScore}
            </h2>
            <div>
              <label htmlFor="ms-val" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Yangi ball (masalan: 7.0)
              </label>
              <input
                id="ms-val"
                type="number"
                step="0.5"
                min={1}
                max={9}
                value={newScoreVal}
                onChange={(e) => setNewScoreVal(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-mono"
              />
            </div>
            <div>
              <label htmlFor="ms-note" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Izoh (Listening / Writing)
              </label>
              <input
                id="ms-note"
                value={newScoreNote}
                onChange={(e) => setNewScoreNote(e.target.value)}
                placeholder="Listening 7.5, Writing 6.5"
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#3B4CCA] text-xs font-semibold text-white hover:bg-[#2E3CA8]"
            >
              <Plus className="inline h-4 w-4 mr-1" /> {t.common.save}
            </button>
          </form>
        </div>
      )}

      {/* FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favCenters.map((c) => (
              <CenterCard key={c.id} center={c} />
            ))}
            {favTutors.map((tut) => (
              <TutorCard key={tut.id} tutor={tut} />
            ))}
          </div>
        </div>
      )}

      {/* SAVED SEARCHES & COMPARISONS */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.dashboard.savedSearches}
            </h2>
            {savedSearches.map((ss) => (
              <div
                key={ss.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-xs"
              >
                <Link to={`/search${ss.queryString}`} className="font-semibold text-[#3B4CCA] hover:underline">
                  {ss.label}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteSavedSearch(ss.id)}
                  aria-label={`Delete ${ss.label}`}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#3B4CCA]" /> {t.dashboard.savedComparisons}
            </h2>
            {savedComparisons.length === 0 ? (
              <p className="text-xs text-slate-500">Hali saqlangan taqqoslashlar yo‘q.</p>
            ) : (
              savedComparisons.map((sc) => (
                <Link
                  key={sc.id}
                  to="/compare"
                  className="block rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-[#3B4CCA]"
                >
                  {sc.label}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* MULTI-CHILD PROFILES FOR PARENTS */}
      {activeTab === 'children' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(user.children || []).map((ch) => (
              <div
                key={ch.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1.5"
              >
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {ch.name} ({ch.age} yosh)
                </h3>
                <p className="text-xs text-slate-500">Maqsad: {ch.targetGoal}</p>
                <Link
                  to={`/search?subject=${ch.targetSubject}`}
                  className="inline-block pt-2 text-xs font-semibold text-[#3B4CCA] hover:underline"
                >
                  Mos kurslarni topish →
                </Link>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!childName.trim()) return;
              addChildProfile({
                name: childName.trim(),
                age: Number(childAge) || 14,
                targetSubject: 'ielts',
                targetGoal: childGoal,
              });
              setChildName('');
            }}
            className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
          >
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Farzand profilini qo‘shish
            </h2>
            <input
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Ismi"
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                placeholder="Yoshi"
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
              />
              <input
                value={childGoal}
                onChange={(e) => setChildGoal(e.target.value)}
                placeholder="Maqsad"
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#3B4CCA] text-xs font-semibold text-white"
            >
              Qo‘shish
            </button>
          </form>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.dashboard.notifications}
            </h2>
            <button
              type="button"
              onClick={markNotificationsRead}
              className="text-xs font-semibold text-[#3B4CCA] hover:underline"
            >
              Barchasini o‘qilgan qilish
            </button>
          </div>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-3.5 text-xs ${
                n.read
                  ? 'border-slate-100 dark:border-slate-800'
                  : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30'
              }`}
            >
              <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
