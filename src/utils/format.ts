import type {
  Center,
  Course,
  Language,
  LocalizedString,
  SearchFilters,
  Tutor,
  VerificationLevel,
} from '../types/domain';
import { VerificationLevel as VLevel } from '../types/domain';
import { FACILITIES_CATALOG } from '../config/brand';

const FACILITY_TEXT_MAP = new Map(
  FACILITIES_CATALOG.map((f) => [
    f.id,
    `${f.id.replace(/_/g, ' ')} ${f.name.uz} ${f.name.ru} ${f.name.en}`.toLowerCase(),
  ])
);

function matchesTokens(haystack: string, query: string): boolean {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((tok) => haystack.includes(tok));
}

const THIN_SPACE = '\u2009';

export function formatUzs(amount: number, lang: Language = 'uz'): string {
  const safe = Math.max(0, Math.round(amount));
  const formatted = safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  const unit = lang === 'ru' ? 'сум' : lang === 'en' ? 'UZS' : "so'm";
  return `${formatted} ${unit}`;
}

export function calculatePricePerLesson(monthlyPriceUzs: number, lessonsPerWeek: number): number {
  const lessonsPerMonth = Math.max(1, lessonsPerWeek * 4);
  return Math.round(monthlyPriceUzs / lessonsPerMonth);
}

export function formatUzPhone(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '');
  let national = digits;
  if (national.startsWith('998')) {
    national = national.slice(3);
  }
  national = national.slice(0, 9);
  const p1 = national.slice(0, 2);
  const p2 = national.slice(2, 5);
  const p3 = national.slice(5, 7);
  const p4 = national.slice(7, 9);
  let out = '+998';
  if (p1) out += ` ${p1}`;
  if (p2) out += ` ${p2}`;
  if (p3) out += ` ${p3}`;
  if (p4) out += ` ${p4}`;
  return out;
}

export function isValidUzPhone(phone: string): boolean {
  return /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(phone.trim());
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getLocalized(val: LocalizedString | string, lang: Language): string {
  if (typeof val === 'string') return val;
  return val[lang] || val.uz || val.en;
}

export function verificationRank(level: VerificationLevel): number {
  if (level === VLevel.STUDENT_CONFIRMED) return 3;
  if (level === VLevel.DOCUMENT_VERIFIED) return 2;
  return 1;
}

export const DEFAULT_FILTERS: SearchFilters = {
  tab: 'centers',
  q: '',
  subject: '',
  category: '',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 3000000,
  format: '',
  level: '',
  ageGroup: '',
  schedule: '',
  maxClassSize: 30,
  instructionLang: '',
  certifiedTeachersOnly: false,
  minRating: 0,
  freeTrialOnly: false,
  installmentsOnly: false,
  facility: '',
  maxDistanceKm: 50,
  sort: 'relevance',
};

export function filterAndSortCenters(
  centers: Center[],
  filters: SearchFilters,
  userCoords?: { lat: number; lng: number } | null
): Array<Center & { distanceKm?: number }> {
  const q = filters.q.trim().toLowerCase();
  const withDist = centers
    .filter((c) => c.approvalStatus === 'approved')
    .map((c) => {
      let distanceKm: number | undefined;
      if (userCoords && c.branches.length > 0) {
        distanceKm = Math.min(
          ...c.branches.map((b) => haversineDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng))
        );
      }
      return { ...c, distanceKm };
    });

  const filtered = withDist.filter((c) => {
    if (q) {
      const hay = [
        c.name,
        c.slug.replace(/-/g, ' '),
        (c.searchAliases || []).join(' '),
        c.tagline.uz,
        c.tagline.ru,
        c.tagline.en,
        c.subjects.join(' '),
        c.branches
          .map(
            (b) =>
              `${b.cityId} ${b.districtId} ${b.name.uz} ${b.name.ru} ${b.name.en} ${b.address.uz} ${b.address.ru} ${b.address.en}`
          )
          .join(' '),
        (c.facilities || []).map((fid) => FACILITY_TEXT_MAP.get(fid) || fid).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!matchesTokens(hay, q)) return false;
    }
    if (filters.subject && !c.subjects.includes(filters.subject)) return false;
    if (filters.category && !c.categories.includes(filters.category)) return false;
    if (filters.city && !c.branches.some((b) => b.cityId === filters.city)) return false;
    if (filters.district && !c.branches.some((b) => b.districtId === filters.district)) return false;
    if (c.priceFromUzs < filters.minPrice || c.priceFromUzs > filters.maxPrice) return false;
    if (filters.format && !c.formats.includes(filters.format)) return false;
    if (filters.ageGroup && !c.ageGroups.includes(filters.ageGroup)) return false;
    if (filters.schedule && !c.schedules.includes(filters.schedule)) return false;
    if (c.minClassSize > filters.maxClassSize) return false;
    if (filters.instructionLang && !c.instructionLanguages.includes(filters.instructionLang)) return false;
    if (filters.certifiedTeachersOnly && !c.hasTopCertifiedTeachers) return false;
    if (c.rating < filters.minRating) return false;
    if (filters.freeTrialOnly && !c.freeTrial) return false;
    if (filters.installmentsOnly && !c.installmentsAvailable) return false;
    if (filters.facility && !(c.facilities || []).includes(filters.facility)) return false;
    if (
      userCoords &&
      typeof c.distanceKm === 'number' &&
      filters.maxDistanceKm < 50 &&
      c.distanceKm > filters.maxDistanceKm
    ) {
      return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'results') {
      const scoreA = verificationRank(a.verificationLevel) * 100 + a.outcomeSummary.successRatePercent;
      const scoreB = verificationRank(b.verificationLevel) * 100 + b.outcomeSummary.successRatePercent;
      return scoreB - scoreA;
    }
    if (filters.sort === 'price_asc') return a.priceFromUzs - b.priceFromUzs;
    if (filters.sort === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (filters.sort === 'nearest') {
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    }
    if (filters.sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Relevance: authoritative ranking first (authorityScore + verification + outcome + Google review volume)
    const relA =
      a.authorityScore * 1.45 +
      verificationRank(a.verificationLevel) * 18 +
      a.outcomeSummary.successRatePercent * 0.45 +
      Math.min(12, Math.log10(a.googleReviewCount + 1) * 3.5);
    const relB =
      b.authorityScore * 1.45 +
      verificationRank(b.verificationLevel) * 18 +
      b.outcomeSummary.successRatePercent * 0.45 +
      Math.min(12, Math.log10(b.googleReviewCount + 1) * 3.5);
    return relB - relA;
  });
}

export function filterAndSortTutors(
  tutors: Tutor[],
  filters: SearchFilters,
  userCoords?: { lat: number; lng: number } | null
): Array<Tutor & { distanceKm?: number }> {
  const q = filters.q.trim().toLowerCase();
  const withDist = tutors
    .filter((t) => t.approvalStatus === 'approved')
    .map((t) => ({
      ...t,
      distanceKm: userCoords ? haversineDistanceKm(userCoords.lat, userCoords.lng, t.lat, t.lng) : undefined,
    }));

  const filtered = withDist.filter((t) => {
    if (q) {
      const hay = `${t.name} ${t.headline.uz} ${t.headline.ru} ${t.headline.en} ${t.subjects.join(' ')} ${t.cityId} ${t.districtId} ${t.addressLabel.uz} ${t.addressLabel.ru} ${t.addressLabel.en}`.toLowerCase();
      if (!matchesTokens(hay, q)) return false;
    }
    if (filters.subject && !t.subjects.includes(filters.subject)) return false;
    if (filters.category && !t.categories.includes(filters.category)) return false;
    if (filters.city && t.cityId !== filters.city) return false;
    if (filters.district && t.districtId !== filters.district) return false;
    if (t.monthlyPackageUzs < filters.minPrice || t.monthlyPackageUzs > filters.maxPrice) return false;
    if (filters.format && !t.formats.includes(filters.format)) return false;
    if (filters.level && !t.levels.includes(filters.level)) return false;
    if (filters.ageGroup && !t.ageGroups.includes(filters.ageGroup)) return false;
    if (filters.schedule && !t.schedules.includes(filters.schedule)) return false;
    if (filters.instructionLang && !t.instructionLanguages.includes(filters.instructionLang)) return false;
    if (filters.certifiedTeachersOnly && !t.hasTopCertifiedTeachers) return false;
    if (t.rating < filters.minRating) return false;
    if (filters.freeTrialOnly && !t.freeTrial) return false;
    if (filters.installmentsOnly && !t.installmentsAvailable) return false;
    if (
      userCoords &&
      typeof t.distanceKm === 'number' &&
      filters.maxDistanceKm < 50 &&
      t.distanceKm > filters.maxDistanceKm
    ) {
      return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'results') {
      return (
        verificationRank(b.verificationLevel) * 100 +
        b.outcomeSummary.successRatePercent -
        (verificationRank(a.verificationLevel) * 100 + a.outcomeSummary.successRatePercent)
      );
    }
    if (filters.sort === 'price_asc') return a.monthlyPackageUzs - b.monthlyPackageUzs;
    if (filters.sort === 'rating') return b.rating - a.rating;
    if (filters.sort === 'nearest') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    if (filters.sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (
      verificationRank(b.verificationLevel) * 25 +
      b.outcomeSummary.successRatePercent * 0.5 +
      b.rating * 10 -
      (verificationRank(a.verificationLevel) * 25 + a.outcomeSummary.successRatePercent * 0.5 + a.rating * 10)
    );
  });
}

export function filterCourses(courses: Course[], filters: SearchFilters): Course[] {
  const q = filters.q.trim().toLowerCase();
  const filtered = courses.filter((c) => {
    if (q) {
      const hay = `${c.title.uz} ${c.title.ru} ${c.title.en} ${c.providerName} ${c.subjectId} ${c.cityId} ${c.districtId}`.toLowerCase();
      if (!matchesTokens(hay, q)) return false;
    }
    if (filters.subject && c.subjectId !== filters.subject) return false;
    if (filters.category && c.categoryId !== filters.category) return false;
    if (filters.city && c.cityId !== filters.city) return false;
    if (filters.district && c.districtId !== filters.district) return false;
    if (c.priceMonthlyUzs < filters.minPrice || c.priceMonthlyUzs > filters.maxPrice) return false;
    if (filters.format && c.format !== filters.format) return false;
    if (filters.level && c.level !== filters.level) return false;
    if (filters.ageGroup && c.ageGroup !== filters.ageGroup) return false;
    if (filters.schedule && !c.schedules.includes(filters.schedule)) return false;
    if (c.classSizeMax > filters.maxClassSize) return false;
    if (filters.instructionLang && !c.instructionLanguages.includes(filters.instructionLang)) return false;
    if (filters.freeTrialOnly && !c.freeTrial) return false;
    if (filters.installmentsOnly && !c.installmentsAvailable) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'price_asc') return a.priceMonthlyUzs - b.priceMonthlyUzs;
    return a.seatsLeft - b.seatsLeft;
  });
}

export interface RadarScoreProfile {
  results: number;
  priceValue: number;
  teachers: number;
  location: number;
  reviews: number;
}

export function computeCompareRadarScore(item: {
  verificationLevel: VerificationLevel;
  successRatePercent: number;
  monthlyPriceUzs: number;
  hasTopCertifiedTeachers: boolean;
  rating: number;
  reviewCount: number;
  branchCount: number;
}): RadarScoreProfile {
  const results = Math.min(100, Math.round(item.successRatePercent * 0.72 + verificationRank(item.verificationLevel) * 10));
  const priceValue = Math.max(35, Math.min(100, Math.round(115 - item.monthlyPriceUzs / 32000)));
  const teachers = item.hasTopCertifiedTeachers ? 92 : 74;
  const location = Math.min(98, 66 + item.branchCount * 10);
  const reviews = Math.min(100, Math.round(item.rating * 17 + Math.min(15, item.reviewCount / 4)));
  return { results, priceValue, teachers, location, reviews };
}

export function generateBookingIcs(params: {
  id: string;
  title: string;
  location: string;
  date: string;
  timeSlot: string;
  description: string;
}): string {
  const [hourStr, minStr] = (params.timeSlot.split(':')[0] ? params.timeSlot : '10:00').split(':');
  const cleanDate = params.date.replace(/-/g, '');
  const startH = hourStr.padStart(2, '0');
  const startM = (minStr || '00').slice(0, 2).padStart(2, '0');
  const endH = String(Math.min(23, Number(startH) + 1)).padStart(2, '0');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Edupick Uzbekistan//Trial Booking//EN',
    'BEGIN:VEVENT',
    `UID:edupick-${params.id}@edupick.uz`,
    `DTSTART:${cleanDate}T${startH}${startM}00`,
    `DTEND:${cleanDate}T${endH}${startM}00`,
    `SUMMARY:${params.title}`,
    `LOCATION:${params.location}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function detectDuplicateReview(
  existingComments: string[],
  newComment: string
): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яёʻʼ']/gi, '').trim();
  const target = norm(newComment);
  if (target.length < 10) return false;
  return existingComments.some((c) => norm(c) === target);
}
