import { create } from 'zustand';
import { BRAND_CONFIG } from '../config/brand';
import { buildSeedDataset } from '../data/seed';
import { readStorage, writeStorage } from '../services/storage';
import { analyticsService } from '../services/analyticsService';
import {
  BookingStatus,
  LeadStatus,
  ModerationStatus,
  PlanTier,
  UserRole,
  VerificationLevel,
  type AuditLogEntry,
  type Booking,
  type Center,
  type ChildProfile,
  type CompareItemRef,
  type Course,
  type GuideArticle,
  type Language,
  type Lead,
  type MockTestScore,
  type NotificationItem,
  type Report,
  type ResultEntry,
  type Review,
  type SavedComparison,
  type SavedSearch,
  type StudentGoal,
  type Tutor,
  type User,
} from '../types/domain';
import { detectDuplicateReview } from '../utils/format';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface BookingModalTarget {
  entityId: string;
  entityType: 'center' | 'tutor';
  courseId?: string;
}

interface ReportModalTarget {
  entityId: string;
  entityType: 'center' | 'tutor' | 'result' | 'review';
  entityLabel: string;
}

const seed = buildSeedDataset();

interface AppState {
  // Preferences
  language: Language;
  theme: 'light' | 'dark';
  cookieAccepted: boolean;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  acceptCookies: () => void;

  // Auth & Users (SWAP POINT: authService -> Eskiz SMS / Firebase Auth)
  user: User | null;
  registeredUsers: User[];
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  findRegisteredUser: (phone: string) => User | undefined;
  signInWithOtp: (params: {
    phone: string;
    name: string;
    role: UserRole;
    cityId?: string;
    telegramHandle?: string;
  }) => void;
  quickDemoLogin: (role: UserRole) => void;
  signOut: () => void;
  updateStudentGoal: (goal: StudentGoal) => void;
  addChildProfile: (child: Omit<ChildProfile, 'id'>) => void;
  addMockScore: (score: Omit<MockTestScore, 'id'>) => void;
  requestDataDeletion: () => void;

  // Catalog Data (SWAP POINT: directoryService -> Firestore / Supabase)
  centers: Center[];
  tutors: Tutor[];
  courses: Course[];
  results: ResultEntry[];
  reviews: Review[];
  guides: GuideArticle[];

  // User Interactions
  favorites: string[];
  compareList: CompareItemRef[];
  savedSearches: SavedSearch[];
  savedComparisons: SavedComparison[];
  bookings: Booking[];
  leads: Lead[];
  notifications: NotificationItem[];
  reports: Report[];
  auditLogs: AuditLogEntry[];

  toggleFavorite: (entityId: string) => void;
  toggleCompare: (ref: CompareItemRef) => { added: boolean; limitReached?: boolean };
  setCompareItems: (refs: CompareItemRef[]) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  saveSearch: (label: string, queryString: string) => void;
  deleteSavedSearch: (id: string) => void;
  saveCurrentComparison: (label: string) => void;
  markNotificationsRead: () => void;

  // Booking Flow
  bookingTarget: BookingModalTarget | null;
  openBookingModal: (target: BookingModalTarget) => void;
  closeBookingModal: () => void;
  createBooking: (payload: Omit<Booking, 'id' | 'status' | 'reminderSent' | 'feedbackSubmitted' | 'createdAt'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus, date?: string, timeSlot?: string) => void;
  submitTrialFeedback: (bookingId: string, joined: boolean, rating: number) => void;

  // Reviews
  submitReview: (payload: {
    entityId: string;
    entityType: 'center' | 'tutor';
    rating: number;
    teaching: number;
    results: number;
    value: number;
    attendedMonths: number;
    attendanceCode?: string;
    pros: string;
    cons: string;
    comment: string;
  }) => { ok: boolean; error?: string };
  voteReviewHelpful: (reviewId: string) => void;
  replyToReview: (reviewId: string, text: string) => void;
  flagReview: (reviewId: string, reason: string) => void;

  // Center / Tutor B2B Actions
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => void;
  submitResultForVerification: (payload: Omit<ResultEntry, 'id' | 'verificationLevel' | 'moderationStatus' | 'createdAt'>) => void;
  updateCenterProfile: (centerId: string, patch: Partial<Center>) => void;
  addCourseToCenter: (course: Omit<Course, 'id' | 'slug'>) => void;
  upgradeCenterPlan: (centerId: string, plan: PlanTier) => void;

  // Admin Moderation Actions
  moderateResult: (resultId: string, approve: boolean, level?: VerificationLevel, reason?: string) => void;
  moderateReview: (reviewId: string, approve: boolean) => void;
  toggleCenterApproval: (centerId: string, status: ModerationStatus) => void;
  toggleSponsoredCenter: (centerId: string) => void;
  resolveReport: (reportId: string, status: 'resolved' | 'dismissed') => void;

  // Reporting
  reportTarget: ReportModalTarget | null;
  openReportModal: (target: ReportModalTarget) => void;
  closeReportModal: () => void;
  submitReport: (reason: string, details: string) => void;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (text: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const initialTheme = readStorage<'light' | 'dark'>('theme', 'light');
if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
}

export const useAppStore = create<AppState>((set, get) => ({
  language: readStorage<Language>('lang', BRAND_CONFIG.defaultLanguage),
  theme: initialTheme,
  cookieAccepted: readStorage<boolean>('cookies', false),

  setLanguage: (lang) => {
    writeStorage('lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    writeStorage('theme', next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
    set({ theme: next });
  },

  acceptCookies: () => {
    writeStorage('cookies', true);
    set({ cookieAccepted: true });
  },

  user: readStorage<User | null>('user', null),
  registeredUsers: readStorage<User[]>('registered_users', []),
  authModalOpen: false,
  openAuthModal: () => set({ authModalOpen: true }),
  closeAuthModal: () => set({ authModalOpen: false }),

  findRegisteredUser: (phone) => {
    const digits = phone.replace(/\D/g, '');
    return get().registeredUsers.find((u) => u.phone.replace(/\D/g, '') === digits);
  },

  signInWithOtp: ({ phone, name, role, cityId, telegramHandle }) => {
    const lang = get().language;
    const existing = get().findRegisteredUser(phone);
    const managedEntityId =
      role === UserRole.CENTER
        ? get().centers[0]?.id
        : role === UserRole.TUTOR
          ? get().tutors[0]?.id
          : undefined;

    const newUser: User = existing
      ? {
          ...existing,
          name: name.trim() || existing.name,
          role: role || existing.role,
          cityId: cityId || existing.cityId,
          language: lang,
          telegramHandle: telegramHandle || existing.telegramHandle,
        }
      : {
          id: role === UserRole.STUDENT ? 'demo-student' : `user-${Date.now()}`,
          phone,
          name: name.trim() || (lang === 'ru' ? 'Пользователь' : lang === 'en' ? 'User' : 'Foydalanuvchi'),
          role,
          telegramHandle,
          cityId: cityId || 'tashkent',
          language: lang,
          createdAt: new Date().toISOString(),
          managedEntityId,
          referralCode: `EDU-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          referralCount: 2,
          goal:
            role === UserRole.STUDENT
              ? {
                  exam: 'IELTS',
                  currentScore: 5.5,
                  targetScore: 7.0,
                  targetDate: '2027-03-15',
                  budgetUzs: 1200000,
                  cityId: cityId || 'tashkent',
                  districtId: 'chilonzor',
                }
              : undefined,
          children:
            role === UserRole.STUDENT
              ? [
                  { id: 'ch-1', name: 'Jasmina', age: 15, targetSubject: 'ielts', targetGoal: 'IELTS 7.0' },
                  { id: 'ch-2', name: 'Amirbek', age: 12, targetSubject: 'math', targetGoal: 'Prezident maktabi' },
                ]
              : undefined,
          mockScores:
            role === UserRole.STUDENT
              ? [
                  { id: 'ms-1', date: '2026-09-10', exam: 'IELTS', score: 5.5, maxScore: 9, note: 'Kirish testi' },
                  { id: 'ms-2', date: '2026-10-12', exam: 'IELTS', score: 6.0, maxScore: 9, note: 'Reading +1.0' },
                  { id: 'ms-3', date: '2026-11-15', exam: 'IELTS', score: 6.5, maxScore: 9, note: 'Writing 6.5' },
                ]
              : undefined,
        };

    const digits = newUser.phone.replace(/\D/g, '');
    const nextRegistry = [
      newUser,
      ...get().registeredUsers.filter((u) => u.phone.replace(/\D/g, '') !== digits),
    ].slice(0, 30);

    writeStorage('registered_users', nextRegistry);
    writeStorage('user', newUser);
    set({ user: newUser, registeredUsers: nextRegistry, authModalOpen: false });
    get().pushToast(
      lang === 'ru'
        ? `${newUser.name} — вход выполнен`
        : lang === 'en'
          ? `${newUser.name} — signed in successfully`
          : `${newUser.name} — kirish muvaffaqiyatli`,
      'success'
    );
  },

  quickDemoLogin: (role) => {
    const names: Record<UserRole, string> = {
      [UserRole.STUDENT]: 'Anvar Asqarov',
      [UserRole.CENTER]: 'Cambridge Learning Centre (Rahbar)',
      [UserRole.TUTOR]: 'Malika Karimova (Repetitor)',
      [UserRole.ADMIN]: 'Moderator Dilshod',
    };
    get().signInWithOtp({
      phone: '+998 90 123 45 67',
      name: names[role],
      role,
      telegramHandle: '@edupick_demo',
    });
  },

  signOut: () => {
    const lang = get().language;
    writeStorage('user', null);
    set({ user: null });
    get().pushToast(
      lang === 'ru' ? 'Вы вышли из аккаунта' : lang === 'en' ? 'Signed out' : 'Hisobdan chiqildi',
      'info'
    );
  },

  updateStudentGoal: (goal) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, goal };
    writeStorage('user', updated);
    set({ user: updated });
    get().pushToast('Maqsadingiz yangilandi', 'success');
  },

  addChildProfile: (child) => {
    const user = get().user;
    if (!user) return;
    const nextChild: ChildProfile = { ...child, id: `ch-${Date.now()}` };
    const updated = { ...user, children: [...(user.children || []), nextChild] };
    writeStorage('user', updated);
    set({ user: updated });
    get().pushToast(`${child.name} profili qo‘shildi`, 'success');
  },

  addMockScore: (score) => {
    const user = get().user;
    if (!user) return;
    const nextScore: MockTestScore = { ...score, id: `ms-${Date.now()}` };
    const updated = { ...user, mockScores: [...(user.mockScores || []), nextScore] };
    writeStorage('user', updated);
    set({ user: updated });
    get().pushToast('Mock test natijasi saqlandi', 'success');
  },

  requestDataDeletion: () => {
    const user = get().user;
    const log: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: user?.name || 'Visitor',
      actorRole: user?.role || UserRole.STUDENT,
      action: 'DATA_DELETION_REQUEST',
      target: user?.phone || 'Anonymous session',
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...get().auditLogs];
    writeStorage('audit_logs', nextLogs);
    set({ auditLogs: nextLogs });
    get().pushToast("Ma'lumotlarni o'chirish so'rovingiz ro'yxatga olindi (24 soat ichida bajariladi)", 'info');
  },

  centers: readStorage<Center[]>('centers', seed.centers),
  tutors: readStorage<Tutor[]>('tutors', seed.tutors),
  courses: readStorage<Course[]>('courses', seed.courses),
  results: readStorage<ResultEntry[]>('results', seed.results),
  reviews: readStorage<Review[]>('reviews', seed.reviews),
  guides: seed.guides,

  favorites: readStorage<string[]>('favorites', ['center-1', 'center-5', 'tutor-1']),
  compareList: readStorage<CompareItemRef[]>('compare', [
    { id: 'center-1', type: 'center' },
    { id: 'center-5', type: 'center' },
  ]),
  savedSearches: readStorage<SavedSearch[]>('saved_searches', [
    {
      id: 'ss-1',
      label: 'IELTS · Chilonzor · < 1.2M',
      queryString: '?subject=ielts&city=tashkent&district=chilonzor&maxPrice=1200000',
      createdAt: '2026-11-20T10:00:00Z',
    },
  ]),
  savedComparisons: readStorage<SavedComparison[]>('saved_comparisons', []),
  bookings: readStorage<Booking[]>('bookings', seed.bookings),
  leads: readStorage<Lead[]>('leads', seed.leads),
  notifications: readStorage<NotificationItem[]>('notifications', [
    {
      id: 'ntf-1',
      userId: 'demo-student',
      title: 'Sinov darsi tasdiqlandi',
      body: 'Novus IELTS Lab · 2026-11-29 18:30 (SMS & Telegram orqali yuborildi)',
      channel: 'telegram_mock',
      read: false,
      createdAt: '2026-11-22T10:16:00Z',
    },
  ]),
  reports: readStorage<Report[]>('reports', seed.reports),
  auditLogs: readStorage<AuditLogEntry[]>('audit_logs', seed.auditLogs),

  toggleFavorite: (entityId) => {
    const current = get().favorites;
    const exists = current.includes(entityId);
    const next = exists ? current.filter((id) => id !== entityId) : [entityId, ...current];
    writeStorage('favorites', next);
    set({ favorites: next });
  },

  toggleCompare: (ref) => {
    const lang = get().language;
    const current = get().compareList;
    const exists = current.some((i) => i.id === ref.id);
    if (exists) {
      const next = current.filter((i) => i.id !== ref.id);
      writeStorage('compare', next);
      set({ compareList: next });
      return { added: false };
    }
    if (current.length >= 4) {
      get().pushToast(
        lang === 'ru'
          ? 'Можно сравнить максимум 4 центра или репетитора'
          : lang === 'en'
            ? 'You can compare up to 4 centers or tutors at once'
            : 'Maksimal 4 ta markaz yoki repetitorni solishtirish mumkin',
        'error'
      );
      return { added: false, limitReached: true };
    }
    const next = [...current, ref];
    writeStorage('compare', next);
    set({ compareList: next });
    analyticsService.track('compare_added', { id: ref.id, type: ref.type });
    return { added: true };
  },

  setCompareItems: (refs) => {
    const unique = refs
      .filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx)
      .slice(0, 4);
    writeStorage('compare', unique);
    set({ compareList: unique });
  },

  removeCompare: (id) => {
    const next = get().compareList.filter((i) => i.id !== id);
    writeStorage('compare', next);
    set({ compareList: next });
  },

  clearCompare: () => {
    writeStorage('compare', []);
    set({ compareList: [] });
  },

  saveSearch: (label, queryString) => {
    const lang = get().language;
    const entry: SavedSearch = {
      id: `ss-${Date.now()}`,
      label,
      queryString,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...get().savedSearches].slice(0, 12);
    writeStorage('saved_searches', next);
    set({ savedSearches: next });
    get().pushToast(
      lang === 'ru' ? 'Поиск сохранён' : lang === 'en' ? 'Search saved' : 'Qidiruv saqlandi',
      'success'
    );
  },

  deleteSavedSearch: (id) => {
    const next = get().savedSearches.filter((s) => s.id !== id);
    writeStorage('saved_searches', next);
    set({ savedSearches: next });
  },

  saveCurrentComparison: (label) => {
    const lang = get().language;
    const items = get().compareList;
    if (items.length < 2) return;
    const entry: SavedComparison = {
      id: `sc-${Date.now()}`,
      label,
      items,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...get().savedComparisons];
    writeStorage('saved_comparisons', next);
    set({ savedComparisons: next });
    get().pushToast(
      lang === 'ru'
        ? 'Сравнение сохранено в личный кабинет'
        : lang === 'en'
          ? 'Comparison saved to your dashboard'
          : 'Taqqoslash kabinetingizga saqlandi',
      'success'
    );
  },

  markNotificationsRead: () => {
    const next = get().notifications.map((n) => ({ ...n, read: true }));
    writeStorage('notifications', next);
    set({ notifications: next });
  },

  bookingTarget: null,
  openBookingModal: (target) => {
    analyticsService.track('booking_started', { ...target });
    set({ bookingTarget: target });
  },
  closeBookingModal: () => set({ bookingTarget: null }),

  createBooking: (payload) => {
    const booking: Booking = {
      ...payload,
      id: `bk-${Date.now()}`,
      status: BookingStatus.CONFIRMED,
      reminderSent: true,
      feedbackSubmitted: false,
      createdAt: new Date().toISOString(),
    };
    const nextBookings = [booking, ...get().bookings];
    writeStorage('bookings', nextBookings);

    // Also push into B2B Leads CRM + mock SMS/Telegram notification
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      bookingId: booking.id,
      entityId: booking.entityId,
      studentName: booking.studentName,
      phone: booking.phone,
      telegram: booking.telegram,
      subject: booking.courseTitle,
      goal: booking.targetScoreOrUni || booking.goalText,
      preferredSlot: `${booking.date} ${booking.timeSlot}`,
      status: LeadStatus.TRIAL_BOOKED,
      notes: 'Edupick orqali onlayn sinov darsiga yozildi.',
      createdAt: booking.createdAt,
      updatedAt: booking.createdAt,
    };
    const nextLeads = [newLead, ...get().leads];
    writeStorage('leads', nextLeads);

    const ntf: NotificationItem = {
      id: `ntf-${Date.now()}`,
      userId: booking.userId,
      title: `Sinov darsi tasdiqlandi: ${booking.entityName}`,
      body: `${booking.date} · ${booking.timeSlot} (${booking.branchAddress}). Demo SMS & Telegram bot xabari yuborildi.`,
      channel: 'telegram_mock',
      read: false,
      createdAt: booking.createdAt,
    };
    const nextNotifications = [ntf, ...get().notifications];
    writeStorage('notifications', nextNotifications);

    set({ bookings: nextBookings, leads: nextLeads, notifications: nextNotifications });
    analyticsService.track('booking_completed', {
      entityId: booking.entityId,
      entityType: booking.entityType,
      depositUzs: booking.depositUzs,
    });
    return booking;
  },

  updateBookingStatus: (bookingId, status, date, timeSlot) => {
    const next = get().bookings.map((b) =>
      b.id === bookingId
        ? { ...b, status, date: date || b.date, timeSlot: timeSlot || b.timeSlot }
        : b
    );
    writeStorage('bookings', next);
    set({ bookings: next });
    get().pushToast('Bron holati yangilandi', 'success');
  },

  submitTrialFeedback: (bookingId, joined, rating) => {
    const next = get().bookings.map((b) =>
      b.id === bookingId
        ? { ...b, feedbackSubmitted: true, joinedAfterTrial: joined, trialRating: rating }
        : b
    );
    writeStorage('bookings', next);
    set({ bookings: next });
    get().pushToast('Sinov darsi bahosi uchun rahmat!', 'success');
  },

  submitReview: (payload) => {
    const user = get().user;
    if (!user) {
      return { ok: false, error: 'Sharh yozish uchun avval tizimga kiring.' };
    }
    const existingForEntity = get().reviews.filter((r) => r.entityId === payload.entityId);
    // Anti-fake-review check 1: Completed booking OR valid attendance code
    const hasCompletedBooking = get().bookings.some(
      (b) =>
        b.entityId === payload.entityId &&
        (b.userId === user.id || b.phone === user.phone) &&
        (b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED)
    );
    const hasValidCode = Boolean(payload.attendanceCode && payload.attendanceCode.trim().toUpperCase().startsWith('ATT-'));
    if (!hasCompletedBooking && !hasValidCode) {
      return {
        ok: false,
        error:
          "Faqat sinov/kursga qatnashgan talabalar yoki 'ATT-...' tasdiq kodiga ega o'quvchilar sharh qoldira oladi (demo kod: ATT-2026).",
      };
    }
    // Anti-fake-review check 2: Rate limit (one review per user per entity)
    if (existingForEntity.some((r) => r.authorId === user.id)) {
      return { ok: false, error: 'Siz ushbu markaz/repetitor uchun allaqachon sharh qoldirgansiz.' };
    }
    // Anti-fake-review check 3: Duplicate text detection
    if (detectDuplicateReview(existingForEntity.map((r) => r.comment), payload.comment)) {
      return { ok: false, error: 'Takroriy sharh matni aniqlandi. Iltimos, shaxsiy tajribangizni yozing.' };
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      entityId: payload.entityId,
      entityType: payload.entityType,
      authorId: user.id,
      authorName: user.name,
      rating: payload.rating,
      subRatings: {
        teaching: payload.teaching,
        results: payload.results,
        value: payload.value,
      },
      attendedMonths: payload.attendedMonths,
      verifiedAttendance: true,
      attendanceCodeUsed: payload.attendanceCode || 'BOOKING-VERIFIED',
      pros: payload.pros,
      cons: payload.cons,
      comment: payload.comment,
      helpfulCount: 0,
      flagged: false,
      moderationStatus: ModerationStatus.APPROVED,
      createdAt: new Date().toISOString(),
    };
    const nextReviews = [newReview, ...get().reviews];
    writeStorage('reviews', nextReviews);
    set({ reviews: nextReviews });
    analyticsService.track('review_submitted', { entityId: payload.entityId, rating: payload.rating });
    get().pushToast('Tasdiqlangan sharhingiz joylandi!', 'success');
    return { ok: true };
  },

  voteReviewHelpful: (reviewId) => {
    const next = get().reviews.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
    writeStorage('reviews', next);
    set({ reviews: next });
  },

  replyToReview: (reviewId, text) => {
    const user = get().user;
    const next = get().reviews.map((r) =>
      r.id === reviewId
        ? {
            ...r,
            reply: {
              text,
              repliedAt: new Date().toISOString(),
              responderName: user?.name || "Markaz ma'muriyati",
            },
          }
        : r
    );
    writeStorage('reviews', next);
    set({ reviews: next });
    get().pushToast('Sharhga javob joylandi', 'success');
  },

  flagReview: (reviewId, reason) => {
    const next = get().reviews.map((r) => (r.id === reviewId ? { ...r, flagged: true, flagReason: reason } : r));
    writeStorage('reviews', next);
    set({ reviews: next });
    get().pushToast('Sharh moderator tekshiruviga yuborildi', 'info');
  },

  updateLeadStatus: (leadId, status, notes) => {
    const next = get().leads.map((l) =>
      l.id === leadId
        ? { ...l, status, notes: notes !== undefined ? notes : l.notes, updatedAt: new Date().toISOString() }
        : l
    );
    writeStorage('leads', next);
    set({ leads: next });
    get().pushToast('Ariza holati yangilandi', 'success');
  },

  submitResultForVerification: (payload) => {
    const entry: ResultEntry = {
      ...payload,
      id: `res-${Date.now()}`,
      verificationLevel: VerificationLevel.UNVERIFIED,
      moderationStatus: ModerationStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...get().results];
    writeStorage('results', next);
    set({ results: next });
    get().pushToast('Natija moderator tasdiqlash navbatiga yuborildi', 'success');
  },

  updateCenterProfile: (centerId, patch) => {
    const next = get().centers.map((c) => (c.id === centerId ? { ...c, ...patch } : c));
    writeStorage('centers', next);
    set({ centers: next });
    get().pushToast('Markaz profili saqlandi', 'success');
  },

  addCourseToCenter: (course) => {
    const nextCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
      slug: `${course.providerSlug}-${course.subjectId}-${Date.now()}`,
    };
    const next = [nextCourse, ...get().courses];
    writeStorage('courses', next);
    set({ courses: next });
    get().pushToast("Yangi kurs katalogga qo'shildi", 'success');
  },

  upgradeCenterPlan: (centerId, plan) => {
    const next = get().centers.map((c) =>
      c.id === centerId ? { ...c, planTier: plan, isSponsored: plan === PlanTier.FEATURED } : c
    );
    writeStorage('centers', next);
    set({ centers: next });
    get().pushToast(`Tarif yangilandi: ${plan.toUpperCase()} (demo billing)`, 'success');
  },

  moderateResult: (resultId, approve, level = VerificationLevel.DOCUMENT_VERIFIED, reason) => {
    const target = get().results.find((r) => r.id === resultId);
    const nextResults = get().results.map((r) =>
      r.id === resultId
        ? {
            ...r,
            moderationStatus: approve ? ModerationStatus.APPROVED : ModerationStatus.REJECTED,
            verificationLevel: approve ? level : VerificationLevel.UNVERIFIED,
            verifiedAt: approve ? new Date().toISOString() : undefined,
            rejectionReason: approve ? undefined : reason,
          }
        : r
    );
    writeStorage('results', nextResults);

    const log: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: get().user?.name || 'Admin',
      actorRole: UserRole.ADMIN,
      action: approve ? `APPROVED_RESULT (${level})` : 'REJECTED_RESULT',
      target: target ? `${target.entityName} — ${target.scoreLabel}` : resultId,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...get().auditLogs];
    writeStorage('audit_logs', nextLogs);

    set({ results: nextResults, auditLogs: nextLogs });
    get().pushToast(approve ? 'Natija tasdiqlandi' : 'Natija rad etildi', approve ? 'success' : 'info');
  },

  moderateReview: (reviewId, approve) => {
    const next = get().reviews.map((r) =>
      r.id === reviewId
        ? {
            ...r,
            flagged: false,
            moderationStatus: approve ? ModerationStatus.APPROVED : ModerationStatus.REJECTED,
          }
        : r
    );
    writeStorage('reviews', next);
    const log: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: get().user?.name || 'Admin',
      actorRole: UserRole.ADMIN,
      action: approve ? 'APPROVED_FLAGGED_REVIEW' : 'REMOVED_FAKE_REVIEW',
      target: reviewId,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...get().auditLogs];
    writeStorage('audit_logs', nextLogs);
    set({ reviews: next, auditLogs: nextLogs });
    get().pushToast(approve ? 'Sharh saqlab qolindi' : 'Shubhali sharh yashirildi', 'info');
  },

  toggleCenterApproval: (centerId, status) => {
    const next = get().centers.map((c) => (c.id === centerId ? { ...c, approvalStatus: status } : c));
    writeStorage('centers', next);
    const log: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: get().user?.name || 'Admin',
      actorRole: UserRole.ADMIN,
      action: `CENTER_STATUS_${status.toUpperCase()}`,
      target: centerId,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...get().auditLogs];
    writeStorage('audit_logs', nextLogs);
    set({ centers: next, auditLogs: nextLogs });
    get().pushToast('Markaz holati yangilandi', 'success');
  },

  toggleSponsoredCenter: (centerId) => {
    const next = get().centers.map((c) => (c.id === centerId ? { ...c, isSponsored: !c.isSponsored } : c));
    writeStorage('centers', next);
    set({ centers: next });
    get().pushToast('Reklama joylashuvi yangilandi', 'info');
  },

  resolveReport: (reportId, status) => {
    const next = get().reports.map((r) => (r.id === reportId ? { ...r, status } : r));
    writeStorage('reports', next);
    set({ reports: next });
    get().pushToast('Shikoyat yopildi', 'success');
  },

  reportTarget: null,
  openReportModal: (target) => set({ reportTarget: target }),
  closeReportModal: () => set({ reportTarget: null }),
  submitReport: (reason, details) => {
    const target = get().reportTarget;
    if (!target) return;
    const report: Report = {
      id: `rep-${Date.now()}`,
      entityId: target.entityId,
      entityType: target.entityType,
      entityLabel: target.entityLabel,
      reason,
      details,
      reporterPhone: get().user?.phone,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    const next = [report, ...get().reports];
    writeStorage('reports', next);
    set({ reports: next, reportTarget: null });
    get().pushToast('Shikoyatingiz moderatorlarga yuborildi', 'success');
  },

  toasts: [],
  pushToast: (text, type = 'info') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, text, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
