import englishClassroomImg from '../assets/images/campus_english_classroom_1795631454201.jpg';
import coworkingLoungeImg from '../assets/images/campus_coworking_lounge_1795631455037.jpg';
import itCodingLabImg from '../assets/images/campus_it_coding_lab_1795631454677.jpg';
import mockExamHallImg from '../assets/images/campus_mock_exam_hall_1795631459621.jpg';
import libraryStudyImg from '../assets/images/campus_library_study_1795631456733.jpg';
import buildingReceptionImg from '../assets/images/campus_building_reception_1795631458292.jpg';
import type { CampusPhotoKey, Language, LocalizedString } from '../types/domain';

export interface CampusPhotoAsset {
  key: CampusPhotoKey;
  src: string;
  caption: LocalizedString;
}

export interface ResolvedCampusPhoto {
  key: string;
  src: string;
  fallbackSrc: string;
  caption: string;
  isOfficialWebPhoto?: boolean;
}

export const CAMPUS_PHOTO_MAP: Record<CampusPhotoKey, CampusPhotoAsset> = {
  english_classroom: {
    key: 'english_classroom',
    src: englishClassroomImg,
    caption: {
      uz: 'Zamonaviy o‘quv xonasi va interaktiv doska',
      ru: 'Современная аудитория с интерактивной доской',
      en: 'Modern classroom with interactive smartboard',
    },
  },
  coworking_lounge: {
    key: 'coworking_lounge',
    src: coworkingLoungeImg,
    caption: {
      uz: 'Talabalar kovorking va mustaqil tayyorgarlik zonasi',
      ru: 'Коворкинг-зона и пространство для самоподготовки',
      en: 'Student coworking lounge & self-study zone',
    },
  },
  it_coding_lab: {
    key: 'it_coding_lab',
    src: itCodingLabImg,
    caption: {
      uz: 'Kompyuter va iMac dasturlash laboratoriyasi',
      ru: 'Компьютерный и iMac класс для IT-практики',
      en: 'Computer & iMac coding laboratory',
    },
  },
  mock_exam_hall: {
    key: 'mock_exam_hall',
    src: mockExamHallImg,
    caption: {
      uz: 'Kompyuterli IELTS / Digital SAT / DTM mock imtihon zali',
      ru: 'Зал компьютерных пробных экзаменов IELTS / SAT / ДТМ',
      en: 'Computer-delivered IELTS / Digital SAT / DTM mock exam hall',
    },
  },
  library_study: {
    key: 'library_study',
    src: libraryStudyImg,
    caption: {
      uz: 'O‘quv kutubxonasi va akademik maslahat xonasi',
      ru: 'Учебная библиотека и зал академических консультаций',
      en: 'Academic library & university prep room',
    },
  },
  building_reception: {
    key: 'building_reception',
    src: buildingReceptionImg,
    caption: {
      uz: 'Asosiy kampus qabulxonasi va talabalar kutish hududi',
      ru: 'Главный кампус, ресепшен и зона ожидания',
      en: 'Main campus reception lobby & student atrium',
    },
  },
};

/**
 * Verified HTTP-200 official high-resolution logos directly from Uzbekistan LCs.
 * Matched by exact slug or brand prefix (so regional branches share their brand logo).
 */
const OFFICIAL_BRAND_LOGOS: Array<{ match: string; url: string }> = [
  { match: 'cambridge', url: 'https://cambridgeonline.uz/apple-touch-icon.png' },
  { match: 'najot-talim', url: 'https://najottalim.uz/icon.svg' },
  { match: 'pdp', url: 'https://online.pdp.uz/assets/icons/logo-pdp.jpg' },
  { match: 'satashkent', url: 'https://www.satashkent.uz/images/logo.jpg' },
  { match: 'mars-it', url: 'https://marsit.uz/favicon.svg' },
  { match: 'ielts-zone', url: 'https://ieltszone.uz/images/favicon-96x96.png' },
  { match: 'thompson', url: 'https://thompson.uz/assets/logo/hub-logo.webp' },
  { match: 'registon', url: 'https://rgn.uz/wp-content/uploads/2025/12/cropped-logo-v1-32x32.png' },
];

/**
 * Verified HTTP-200 real official campus & community photos directly from official Uzbekistan LC sites.
 * Every slot still preserves a bundled local fallback photo so images never break offline or on hotlink issues.
 */
const OFFICIAL_BRAND_PHOTOS: Array<{ match: string; photos: string[] }> = [
  {
    match: 'najot-talim',
    photos: [
      'https://najottalim.uz/hero/0O8A0066.webp',
      'https://najottalim.uz/hero/0O8A7814.webp',
      'https://najottalim.uz/hero/0O8A7958.webp',
    ],
  },
  {
    match: 'satashkent',
    photos: [
      'https://www.satashkent.uz/images/community-2026/center-life.webp',
      'https://www.satashkent.uz/images/community-2026/guest-masterclasses.webp',
      'https://www.satashkent.uz/images/hero-telegram.webp',
    ],
  },
  {
    match: 'pdp',
    photos: [
      'https://school.pdp.uz/site/pdp/img/hero-bino.webp',
      'https://school.pdp.uz/site/pdp/img/yondashuv-foto-1.webp',
      'https://school.pdp.uz/assets/og-image.jpg',
    ],
  },
  {
    match: 'thompson',
    photos: [
      'https://thompson.uz/assets/binolar/learning-center.webp',
      'https://thompson.uz/assets/binolar/international-school.webp',
      'https://thompson.uz/assets/binolar/thompson-kids.webp',
    ],
  },
  {
    match: 'proweb',
    photos: [
      'https://42bc9131-ca53-4c3f-abe0-9facd51965a0.selstorage.ru/homeheaderbg_new_481398f526.webp',
      'https://42bc9131-ca53-4c3f-abe0-9facd51965a0.selstorage.ru/1_9203b577e1.webp',
      'https://42bc9131-ca53-4c3f-abe0-9facd51965a0.selstorage.ru/2_7db2fa062f.webp',
    ],
  },
  {
    match: 'inter-nation',
    photos: ['https://inter-nation.uz/banner.png'],
  },
  {
    match: 'registon',
    photos: [
      'https://rgn.uz/wp-content/uploads/2025/12/Group-35-2.png',
      'https://rgn.uz/wp-content/uploads/elementor/thumbs/natija-1-rhq90nvtkkmksvbt7if1gas4dpjotusw3k1e9dk0a8.jpg',
      'https://rgn.uz/wp-content/uploads/elementor/thumbs/natija-2-rhq9683g0a8nht8zqeykpe9aws4vddvpv2zthbb5gw.jpg',
    ],
  },
  {
    match: 'mars-it',
    photos: ['https://marsit.uz/og-image.png'],
  },
  {
    match: 'cambridge',
    photos: ['https://cambridgeonline.uz/images/certificates-banner.png'],
  },
];

const NO_FAVICON_DOMAINS = new Set([
  't.me',
  'instagram.com',
  'youtube.com',
  'data.uz',
  'myteacher.uz',
  'pdp.uz',
  'profi-school.uz',
  'sensorika.uz',
  'target.uz',
  'yuksalishedu.uz',
]);

export function extractDomain(website?: string): string | null {
  if (!website) return null;
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function getOfficialLogoUrl(
  website?: string,
  logoDomain?: string,
  slug?: string
): string | null {
  if (slug) {
    const normalized = slug.toLowerCase();
    const matched = OFFICIAL_BRAND_LOGOS.find((item) => normalized.includes(item.match));
    if (matched) return matched.url;
  }
  const domain = (logoDomain || extractDomain(website))?.toLowerCase();
  if (!domain || NO_FAVICON_DOMAINS.has(domain)) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function getOfficialPhotosForSlug(slug?: string): string[] {
  if (!slug) return [];
  const normalized = slug.toLowerCase();
  const matched = OFFICIAL_BRAND_PHOTOS.find((item) => normalized.includes(item.match));
  return matched ? matched.photos : [];
}

export function resolveCenterGalleryPhotos(
  slug: string | undefined,
  campusPhotos: CampusPhotoKey[] | undefined,
  galleryTags: LocalizedString[] | undefined,
  language: Language
): ResolvedCampusPhoto[] {
  const keys: CampusPhotoKey[] =
    campusPhotos && campusPhotos.length >= 3
      ? campusPhotos.slice(0, 3)
      : ['building_reception', 'english_classroom', 'coworking_lounge'];
  const officialUrls = getOfficialPhotosForSlug(slug);

  return keys.map((key, idx) => {
    const asset = CAMPUS_PHOTO_MAP[key] || CAMPUS_PHOTO_MAP.building_reception;
    const officialSrc = officialUrls[idx];
    const tagCaption = galleryTags?.[idx]?.[language];
    return {
      key: `${key}-${idx}`,
      src: officialSrc || asset.src,
      fallbackSrc: asset.src,
      caption: tagCaption || asset.caption[language],
      isOfficialWebPhoto: Boolean(officialSrc),
    };
  });
}
