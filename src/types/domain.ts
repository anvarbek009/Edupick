export type Language = 'uz' | 'ru' | 'en';

export type FacilityId =
  | 'coworking'
  | 'library'
  | 'speaking_club'
  | 'mock_exam_hall'
  | 'academic_support'
  | 'student_app'
  | 'wifi'
  | 'ac_classrooms'
  | 'computer_lab'
  | 'cafe_water'
  | 'parking'
  | 'career_center';

export type CampusPhotoKey =
  | 'english_classroom'
  | 'coworking_lounge'
  | 'it_coding_lab'
  | 'mock_exam_hall'
  | 'library_study'
  | 'building_reception';

export interface YearlyCenterMetric {
  year: number;
  avgScore: number;
  targetRate: number;
  graduates: number;
  highScorers: number;
}

export interface CenterQualityScores {
  teaching: number;
  results: number;
  facilities: number;
  curriculum: number;
  valueForMoney: number;
  studentSupport: number;
}

export interface LocalizedString {
  uz: string;
  ru: string;
  en: string;
}

export enum UserRole {
  STUDENT = 'student',
  CENTER = 'center',
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  DOCUMENT_VERIFIED = 'document_verified',
  STUDENT_CONFIRMED = 'student_confirmed',
}

export enum StudyFormat {
  OFFLINE = 'offline',
  ONLINE = 'online',
  HYBRID = 'hybrid',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
}

export enum AgeGroup {
  KIDS = 'kids',
  TEENS = 'teens',
  ADULTS = 'adults',
  ALL = 'all',
}

export enum ScheduleSlot {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  WEEKEND = 'weekend',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  TRIAL_BOOKED = 'trial_booked',
  ATTENDED = 'attended',
  ENROLLED = 'enrolled',
  LOST = 'lost',
}

export enum PlanTier {
  FREE = 'free',
  PRO = 'pro',
  FEATURED = 'featured',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  targetSubject: string;
  targetGoal: string;
}

export interface MockTestScore {
  id: string;
  date: string;
  exam: string;
  score: number;
  maxScore: number;
  note?: string;
}

export interface StudentGoal {
  exam: string;
  currentScore: number;
  targetScore: number;
  targetDate: string;
  budgetUzs: number;
  cityId: string;
  districtId?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  telegramHandle?: string;
  cityId: string;
  language: Language;
  createdAt: string;
  managedEntityId?: string;
  goal?: StudentGoal;
  children?: ChildProfile[];
  mockScores?: MockTestScore[];
  referralCode: string;
  referralCount: number;
}

export interface Branch {
  id: string;
  name: LocalizedString;
  cityId: string;
  districtId: string;
  address: LocalizedString;
  landmark: LocalizedString;
  lat: number;
  lng: number;
  phone: string;
  workingHours: string;
}

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  accentHue: string;
  bio: LocalizedString;
  experienceYears: number;
  certificates: string[];
  subjects: string[];
  studentsAchievedTarget: number;
  avgStudentScore: string;
}

export interface Course {
  id: string;
  slug: string;
  centerId?: string;
  tutorId?: string;
  providerName: string;
  providerSlug: string;
  providerType: 'center' | 'tutor';
  title: LocalizedString;
  subjectId: string;
  categoryId: string;
  priceMonthlyUzs: number;
  durationMonths: number;
  lessonsPerWeek: number;
  lessonDurationMin: number;
  classSizeMax: number;
  format: StudyFormat;
  level: CourseLevel;
  ageGroup: AgeGroup;
  schedules: ScheduleSlot[];
  instructionLanguages: Language[];
  seatsLeft: number;
  nextStartDate: string;
  freeTrial: boolean;
  installmentsAvailable: boolean;
  certificateIncluded: boolean;
  syllabus: LocalizedString[];
  cityId: string;
  districtId: string;
}

export interface ResultEntry {
  id: string;
  entityId: string;
  entityType: 'center' | 'tutor';
  entityName: string;
  exam: string;
  subjectId: string;
  scoreLabel: string;
  numericScore: number;
  beforeScore?: number;
  targetReached: boolean;
  universityAdmitted?: string;
  cohortYear: number;
  sampleSize: number;
  studentDisplayName: string;
  studentConsentGiven: boolean;
  verificationLevel: VerificationLevel;
  moderationStatus: ModerationStatus;
  evidenceSummary: string;
  evidenceFileName?: string;
  evidenceImageData?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface OutcomeSummary {
  headline: LocalizedString;
  exam: string;
  avgScore: number;
  successRatePercent: number;
  verifiedCount: number;
  sampleSize: number;
  lastUpdated: string;
}

export interface Center {
  id: string;
  slug: string;
  name: string;
  tagline: LocalizedString;
  description: LocalizedString;
  accentColor: string;
  foundedYear: number;
  verificationLevel: VerificationLevel;
  approvalStatus: ModerationStatus;
  isSponsored: boolean;
  planTier: PlanTier;
  rating: number;
  reviewCount: number;
  ratingBreakdown: {
    teaching: number;
    results: number;
    facilities: number;
    value: number;
  };
  subjects: string[];
  categories: string[];
  priceFromUzs: number;
  pricePerLessonFromUzs: number;
  formats: StudyFormat[];
  schedules: ScheduleSlot[];
  ageGroups: AgeGroup[];
  instructionLanguages: Language[];
  minClassSize: number;
  maxClassSize: number;
  freeTrial: boolean;
  trialFeeUzs: number;
  installmentsAvailable: boolean;
  refundPolicy: LocalizedString;
  hasTopCertifiedTeachers: boolean;
  teacherCertHighlight: string;
  curriculumNote: LocalizedString;
  branches: Branch[];
  teachers: Teacher[];
  outcomeSummary: OutcomeSummary;
  phone: string;
  telegram: string;
  instagram: string;
  website: string;
  youtube?: string;
  logoDomain?: string;
  campusPhotos: CampusPhotoKey[];
  googleRating: number;
  googleReviewCount: number;
  totalGraduates: number;
  authorityScore: number;
  yearlyMetrics: YearlyCenterMetric[];
  qualityScores: CenterQualityScores;
  faqs: Array<{ q: LocalizedString; a: LocalizedString }>;
  galleryTags: LocalizedString[];
  facilities: FacilityId[];
  searchAliases?: string[];
  createdAt: string;
  viewsCount: number;
  impressionsCount: number;
  compareAppearances: number;
}

export interface Tutor {
  id: string;
  slug: string;
  name: string;
  initials: string;
  accentColor: string;
  headline: LocalizedString;
  bio: LocalizedString;
  verificationLevel: VerificationLevel;
  approvalStatus: ModerationStatus;
  isSponsored: boolean;
  planTier: PlanTier;
  rating: number;
  reviewCount: number;
  subjects: string[];
  categories: string[];
  levels: CourseLevel[];
  ageGroups: AgeGroup[];
  hourlyPriceUzs: number;
  monthlyPackageUzs: number;
  lessonsPerWeek: number;
  formats: StudyFormat[];
  schedules: ScheduleSlot[];
  instructionLanguages: Language[];
  experienceYears: number;
  certificates: string[];
  hasTopCertifiedTeachers: boolean;
  freeTrial: boolean;
  installmentsAvailable: boolean;
  cityId: string;
  districtId: string;
  addressLabel: LocalizedString;
  lat: number;
  lng: number;
  availabilitySlots: string[];
  introVideoDuration: string;
  introVideoTopic: LocalizedString;
  outcomeSummary: OutcomeSummary;
  phone: string;
  telegram: string;
  createdAt: string;
  viewsCount: number;
}

export interface Review {
  id: string;
  entityId: string;
  entityType: 'center' | 'tutor';
  authorId: string;
  authorName: string;
  rating: number;
  subRatings: {
    teaching: number;
    results: number;
    value: number;
  };
  attendedMonths: number;
  verifiedAttendance: boolean;
  attendanceCodeUsed?: string;
  pros: string;
  cons: string;
  comment: string;
  helpfulCount: number;
  flagged: boolean;
  flagReason?: string;
  moderationStatus: ModerationStatus;
  reply?: {
    text: string;
    repliedAt: string;
    responderName: string;
  };
  createdAt: string;
}

export interface Booking {
  id: string;
  entityId: string;
  entityType: 'center' | 'tutor';
  entityName: string;
  entitySlug: string;
  courseId?: string;
  courseTitle: string;
  branchAddress: string;
  userId: string;
  studentName: string;
  studentAge: number;
  currentLevel: CourseLevel;
  goalText: string;
  targetScoreOrUni: string;
  phone: string;
  telegram?: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  paymentMethod?: 'free' | 'payme' | 'click' | 'uzum';
  depositUzs: number;
  reminderSent: boolean;
  feedbackSubmitted: boolean;
  joinedAfterTrial?: boolean;
  trialRating?: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  bookingId?: string;
  entityId: string;
  studentName: string;
  phone: string;
  telegram?: string;
  subject: string;
  goal: string;
  preferredSlot: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  queryString: string;
  createdAt: string;
}

export interface SavedComparison {
  id: string;
  label: string;
  items: CompareItemRef[];
  createdAt: string;
}

export interface CompareItemRef {
  id: string;
  type: 'center' | 'tutor';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: 'in_app' | 'sms_mock' | 'telegram_mock';
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  entityId: string;
  entityType: 'center' | 'tutor' | 'result' | 'review';
  entityLabel: string;
  reason: string;
  details: string;
  reporterPhone?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  createdAt: string;
}

export interface GuideArticle {
  id: string;
  slug: string;
  category: LocalizedString;
  title: LocalizedString;
  excerpt: LocalizedString;
  readMinutes: number;
  publishedAt: string;
  sections: Array<{ heading: LocalizedString; body: LocalizedString }>;
}

export type SortOption = 'relevance' | 'results' | 'price_asc' | 'rating' | 'nearest' | 'newest';

export interface SearchFilters {
  tab: 'centers' | 'tutors' | 'courses';
  q: string;
  subject: string;
  category: string;
  city: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  format: StudyFormat | '';
  level: CourseLevel | '';
  ageGroup: AgeGroup | '';
  schedule: ScheduleSlot | '';
  maxClassSize: number;
  instructionLang: Language | '';
  certifiedTeachersOnly: boolean;
  minRating: number;
  freeTrialOnly: boolean;
  installmentsOnly: boolean;
  facility: FacilityId | '';
  maxDistanceKm: number;
  sort: SortOption;
}
