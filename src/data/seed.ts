import { ALL_SUBJECTS, CITIES } from '../config/brand';
import {
  AgeGroup,
  BookingStatus,
  CourseLevel,
  LeadStatus,
  ModerationStatus,
  PlanTier,
  ScheduleSlot,
  StudyFormat,
  UserRole,
  VerificationLevel,
  type AuditLogEntry,
  type Booking,
  type CampusPhotoKey,
  type Center,
  type CenterQualityScores,
  type Course,
  type FacilityId,
  type GuideArticle,
  type Language,
  type Lead,
  type Report,
  type ResultEntry,
  type Review,
  type Teacher,
  type Tutor,
  type YearlyCenterMetric,
} from '../types/domain';
import { calculatePricePerLesson } from '../utils/format';

// Deterministic PRNG so seed data is consistent across sessions & tests
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(20261125);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

const ACCENTS = [
  '#3B4CCA',
  '#2563EB',
  '#0F766E',
  '#4F46E5',
  '#0369A1',
  '#1D4ED8',
  '#15803D',
  '#6D28D9',
];

interface RealBranchSeed {
  nameUz: string;
  nameRu: string;
  nameEn: string;
  cityId: string;
  districtId: string;
  street: string;
  landmarkUz: string;
  landmarkRu: string;
  landmarkEn: string;
  latOffset?: number;
  lngOffset?: number;
}

interface RealCenterSpec {
  name: string;
  slug: string;
  cityId: string;
  districtId: string;
  subjects: string[];
  exam: string;
  avgScore: number;
  successRate: number;
  price: number;
  vLevel: VerificationLevel;
  sponsored?: boolean;
  plan: PlanTier;
  foundedYear: number;
  phone: string;
  telegram: string;
  instagram: string;
  website: string;
  taglineUz: string;
  taglineRu: string;
  taglineEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  facilities: FacilityId[];
  branches: RealBranchSeed[];
  aliases?: string[];
  formats?: StudyFormat[];
  certHighlight?: string;
  youtube?: string;
  googleRating?: number;
  googleReviewCount?: number;
  totalGraduates?: number;
  campusPhotos?: CampusPhotoKey[];
}

const CENTER_SPECS: RealCenterSpec[] = [
  {
    name: 'Cambridge Learning Centre',
    slug: 'cambridge-learning-centre',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['ielts', 'english', 'cefr', 'kids'],
    exam: 'IELTS',
    avgScore: 7.3,
    successRate: 89,
    price: 996000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2014,
    phone: '+998 78 777 77 74',
    telegram: '@cambridge_learning_center',
    instagram: '@cambridge_learning_center',
    website: 'https://cambridgeonline.uz',
    youtube: 'https://youtube.com/@cambridgelearningcenter',
    googleRating: 5.0,
    googleReviewCount: 2420,
    totalGraduates: 100000,
    campusPhotos: ['building_reception', 'english_classroom', 'coworking_lounge'],
    taglineUz: '16+ filial, ikki ustozli Academic Support, kovorking va yakshanba Speaking Clublari',
    taglineRu: '16+ филиалов, система Academic Support, коворкинг и воскресные Speaking Club',
    taglineEn: '16+ branches, dual-instructor Academic Support, coworking zones & Sunday Speaking Clubs',
    descriptionUz:
      "Cambridge Learning Centre — 2014-yildan beri faoliyat yurituvchi O'zbekistondagi eng yirik ingliz tili va IELTS markazlaridan biri. Har bir talabaga asosiy ustozdan tashqari bepul Academic Support yordamchi ustozi, kovorking hududi, Cambridge mobil ilovasi va yakshanba kungi Speaking Club hamda Movie Day tadbirlari taqdim etiladi.",
    descriptionRu:
      'Cambridge Learning Centre — одна из крупнейших сетей изучения английского языка и подготовки к IELTS в Узбекистане (с 2014 года). Студенты получают поддержку второго преподавателя (Academic Support), доступ к коворкингу, фирменное приложение Cambridge App и воскресные Speaking Club.',
    descriptionEn:
      'Founded in 2014, Cambridge Learning Centre is one of Uzbekistan’s largest English & IELTS networks. Students benefit from dual-instructor Academic Support, dedicated coworking zones, the proprietary Cambridge App, and Sunday Speaking Clubs & seminars.',
    facilities: ['coworking', 'academic_support', 'speaking_club', 'student_app', 'mock_exam_hall', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['cambridge', 'kembridj', 'cambridgeonline', 'novza cambridge'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–9.0 · CELTA',
    branches: [
      { nameUz: 'Novza (Chilonzor) filiali', nameRu: 'Филиал Новза (Чиланзар)', nameEn: 'Novza (Chilonzor) Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, Novza metro", landmarkUz: 'Novza metro bekatidan 3 daqiqa piyoda', landmarkRu: '3 минуты пешком от метро Новза', landmarkEn: '3 min walk from Novza Metro' },
      { nameUz: "Buyuk Ipak Yo'li filiali", nameRu: 'Филиал Буюк Ипак Йули', nameEn: "Buyuk Ipak Yo'li Branch", cityId: 'tashkent', districtId: 'mirzo-ulugbek', street: "Buyuk Ipak Yo'li ko'chasi, Darxon", landmarkUz: "Buyuk Ipak Yo'li metro yonida", landmarkRu: 'Рядом с метро Буюк Ипак Йули', landmarkEn: "Next to Buyuk Ipak Yo'li Metro" },
      { nameUz: 'Yunusobod filiali', nameRu: 'Филиал Юнусабад', nameEn: 'Yunusobod Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur shoh ko'chasi, Shahriston", landmarkUz: 'Shahriston metro bekati yaqinida', landmarkRu: 'Рядом с метро Шахристан', landmarkEn: 'Near Shahriston Metro' },
      { nameUz: 'Sergeli filiali', nameRu: 'Филиал Сергели', nameEn: 'Sergeli Branch', cityId: 'tashkent', districtId: 'sergeli', street: "Yangi Sergeli ko'chasi", landmarkUz: 'Sergeli metro yo‘nalishi yaqinida', landmarkRu: 'Рядом с линией метро Сергели', landmarkEn: 'Near Sergeli Metro' },
    ],
  },
  {
    name: 'Everest Learning Center',
    slug: 'everest-learning-center',
    cityId: 'tashkent',
    districtId: 'shayxontohur',
    subjects: ['ielts', 'cefr', 'english'],
    exam: 'IELTS',
    avgScore: 7.4,
    successRate: 90,
    price: 690000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 78 888 80 08',
    telegram: '@everestofficial',
    instagram: '@everest_learning_center',
    website: 'https://t.me/everestofficial',
    googleRating: 4.9,
    googleReviewCount: 1760,
    totalGraduates: 48000,
    campusPhotos: ['mock_exam_hall', 'english_classroom', 'library_study'],
    taglineUz: '20+ filial, IELTS 7.5–8.5 natijalar, rasmiy imtihon hamkori va Mock Exam markazi',
    taglineRu: 'Высокие баллы IELTS 7.5–8.5, строгая дисциплина и собственный центр пробных экзаменов',
    taglineEn: 'High-band IELTS 7.5–8.5 track record, structured drilling & dedicated Mock Exam Center',
    descriptionUz:
      "Everest Learning Center — Toshkentdagi IELTS va General English bo'yicha eng mashhur o'quv markazlaridan biri. Markaz qat'iy uy vazifa nazorati, yuqori balli ustozlar jamoasi, alohida Chilonzor Mock Exam markazi va haftalik natijalar tahlili bilan tanilgan.",
    descriptionRu:
      'Everest Learning Center — один из самых известных центров IELTS и английского языка в Ташкенте. Отличается строгим контролем домашних заданий, сильным составом преподавателей и собственным экзаменационным центром Mock IELTS.',
    descriptionEn:
      'Everest Learning Center is a flagship Tashkent IELTS & English academy known for rigorous homework accountability, high-band instructors, and a dedicated Chilonzor Mock Exam facility.',
    facilities: ['mock_exam_hall', 'academic_support', 'speaking_club', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['everest', 'everest education', 'everestofficial', 'drujba everest'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.5–9.0 · Senior Trainers',
    branches: [
      { nameUz: 'Drujba (Xalqlar Do‘stligi) filiali', nameRu: 'Филиал Дружба народов', nameEn: 'Drujba (Xalqlar Do‘stligi) Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Furqat ko'chasi, 33", landmarkUz: "Xalqlar Do'stligi metro bekatidan 2 daqiqa", landmarkRu: '2 минуты от метро Дружба народов', landmarkEn: '2 min from Drujba Narodov Metro' },
      { nameUz: 'Novza / Muqimiy filiali', nameRu: 'Филиал Новза / Мукими', nameEn: 'Novza / Muqimiy Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Muqimiy ko'chasi, 22A", landmarkUz: 'Bella Casa va Novza metro yaqinida', landmarkRu: 'Ориентир Bella Casa, метро Новза', landmarkEn: 'Near Bella Casa & Novza Metro' },
      { nameUz: 'Chilonzor-C Mock Exam markazi', nameRu: 'Чиланзар-C (Экзаменационный центр)', nameEn: 'Chilonzor-C Mock Exam Hub', cityId: 'tashkent', districtId: 'chilonzor', street: "Cho'ponota ko'chasi, Chilonzor-C", landmarkUz: 'Chilonzor-C mavzesi', landmarkRu: 'Квартал Чиланзар-Ц', landmarkEn: 'Chilonzor-C Block' },
      { nameUz: 'Yunusobod Shahriston filiali', nameRu: 'Филиал Юнусабад (Шахристан)', nameEn: 'Yunusobod Shahriston Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur shoh ko'chasi, 129B", landmarkUz: 'Anor Plaza / Shahriston metro', landmarkRu: 'Anor Plaza / метро Шахристан', landmarkEn: 'Anor Plaza / Shahriston Metro' },
    ],
  },
  {
    name: "Registon O'quv Markazi",
    slug: 'registon-oquv-markazi',
    cityId: 'tashkent',
    districtId: 'yakkasaroy',
    subjects: ['dtm', 'ielts', 'math', 'physics', 'biology', 'chemistry', 'english', 'russian', 'kids'],
    exam: 'DTM',
    avgScore: 174,
    successRate: 91,
    price: 650000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2014,
    phone: '+998 78 113 27 00',
    telegram: '@registon_lc',
    instagram: '@registon_lc',
    website: 'https://rgn.uz',
    youtube: 'https://youtube.com/@registonlc',
    googleRating: 4.9,
    googleReviewCount: 2180,
    totalGraduates: 62000,
    campusPhotos: ['library_study', 'mock_exam_hall', 'building_reception'],
    taglineUz: "22+ filial, DTM abituriyent fanlari, kompyuterli Mock IELTS va grant chegirmalari",
    taglineRu: 'Подготовка к ДТМ по всем предметам, IELTS/CEFR, грантовые скидки и 10+ филиалов',
    taglineEn: 'Full-spectrum DTM entrance prep, IELTS/CEFR, scholarship grants & 10+ Tashkent branches',
    descriptionUz:
      "Registon o'quv markazi (rgn.uz) — O'zbekistondagi abituriyentlar, maktab o'quvchilari va til o'rganuvchilar uchun eng yirik ta'lim tarmog'i. Matematika, fizika, kimyo, biologiya, ona tili, tarix va ingliz tili (IELTS/CEFR) bo'yicha oylik blok-testlar, ota-onalar nazorati va yuqori balli talabalar uchun grantlar mavjud.",
    descriptionRu:
      'Учебный центр «Регистан» (rgn.uz) — крупнейшая сеть подготовки абитуриентов и школьников в Узбекистане. Включает ежемесячные блок-тесты ДТМ, курсы IELTS/CEFR, систему грантов за высокие результаты и филиалы во всех районах Ташкента.',
    descriptionEn:
      'Registon Learning Center (rgn.uz) is Uzbekistan’s flagship DTM university entrance and language network, offering monthly diagnostic mock exams, scholarship grants for top scorers, and 10+ accessible branches.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['registon', 'registan', 'rgn', 'rgn.uz', 'abituriyent'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'DTM Expert Authors · IELTS 8.0+',
    branches: [
      { nameUz: 'Yakkasaroy filiali', nameRu: 'Филиал Яккасарай', nameEn: 'Yakkasaroy Branch', cityId: 'tashkent', districtId: 'yakkasaroy', street: "Shota Rustaveli ko'chasi, 53", landmarkUz: 'Askiya bozori va Di-Sport yonida', landmarkRu: 'Рядом с базаром Аския и Di-Sport', landmarkEn: 'Near Askiya Bazaar & Di-Sport' },
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Kichik Halqa Yo'li, Shuhrat chorrahasi", landmarkUz: 'Andalus supermarketi yonida', landmarkRu: 'Ориентир супермаркет Andalus', landmarkEn: 'Near Shuhrat Intersection & Andalus' },
      { nameUz: 'Uchtepa filiali', nameRu: 'Филиал Учтепа', nameEn: 'Uchtepa Branch', cityId: 'tashkent', districtId: 'uchtepa', street: "Lutfiy ko'chasi, 65A", landmarkUz: 'Farhod bozori yaqinida', landmarkRu: 'Рядом с базаром Фархад', landmarkEn: 'Near Farhod Bazaar' },
      { nameUz: 'Yunusobod Shahriston filiali', nameRu: 'Филиал Юнусабад (Шахристан)', nameEn: 'Yunusobod Shahriston Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur ko'chasi, 129B (Anor Plaza)", landmarkUz: 'Shahriston metro / Anor Plaza', landmarkRu: 'Метро Шахристан / Anor Plaza', landmarkEn: 'Shahriston Metro / Anor Plaza' },
      { nameUz: 'Sergeli filiali', nameRu: 'Филиал Сергели', nameEn: 'Sergeli Branch', cityId: 'tashkent', districtId: 'sergeli', street: "Sergeli-6 dahasi, Mehrigiyo ko'chasi", landmarkUz: 'Sergeli-6 markazi', landmarkRu: 'Массив Сергели-6', landmarkEn: 'Sergeli-6 District' },
    ],
  },
  {
    name: 'SATashkent',
    slug: 'satashkent',
    cityId: 'tashkent',
    districtId: 'shayxontohur',
    subjects: ['sat', 'math', 'english', 'westminster'],
    exam: 'SAT',
    avgScore: 1470,
    successRate: 92,
    price: 1450000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    sponsored: true,
    plan: PlanTier.FEATURED,
    foundedYear: 2021,
    phone: '+998 78 555 65 75',
    telegram: '@satashkent',
    instagram: '@satashkent',
    website: 'https://satashkent.uz',
    youtube: 'https://youtube.com/@satashkent',
    googleRating: 5.0,
    googleReviewCount: 980,
    totalGraduates: 8500,
    campusPhotos: ['mock_exam_hall', 'coworking_lounge', 'library_study'],
    taglineUz: 'Markaziy Osiyodagi eng yirik Digital SAT, AP va AQSH/Top-50 universitetlarga kirish markazi',
    taglineRu: 'Крупнейший центр Digital SAT, AP и поступления в топ-университеты США в Центральной Азии',
    taglineEn: 'Central Asia’s premier Digital SAT, AP & US College Admissions prep community',
    descriptionUz:
      "SATashkent (satashkent.uz / 1600.satashkent.uz) — Digital SAT, AP fanlari (Calculus, Physics, CS, Economics), Agora Writing va Unlock Admissions kollej maslahat tizimini birlashtirgan yetakchi markaz. Shaxsiy Bluebook formatidagi test platformasi, 1500+ balli ustozlar va kuchli talabalar hamjamiyati mavjud.",
    descriptionRu:
      'SATashkent (satashkent.uz / 1600.satashkent.uz) — ведущий центр подготовки к Digital SAT, курсам AP, академическому письму Agora Writing и поступлению в зарубежные вузы (Unlock Admissions). Собственная цифровая платформа в формате Bluebook и менторы 1500+.',
    descriptionEn:
      'SATashkent (satashkent.uz / 1600.satashkent.uz) combines Digital SAT preparation, AP subjects, Agora Writing, and integrated college admissions mentoring (Unlock Admissions) with a proprietary Bluebook-style testing portal.',
    facilities: ['computer_lab', 'mock_exam_hall', 'student_app', 'career_center', 'coworking', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['sat tashkent', 'satashkent', '1600', 'digital sat', 'ap', 'admissions'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'SAT 1530–1600 · Ivy/Top-50 Mentors',
    branches: [
      { nameUz: 'Drujba / Furqat (Asosiy) filiali', nameRu: 'Филиал Дружба / Фуркат (Главный)', nameEn: 'Furqat / Drujba (Main) Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Furqat ko'chasi, 15/1 (Katta Olmazor MFY)", landmarkUz: "Xalqlar Do'stligi saroyi va metro yonida", landmarkRu: 'Рядом с дворцом и метро Дружба народов', landmarkEn: 'Near Drujba Narodov Palace & Metro' },
      { nameUz: 'Yunusobod Shahriston filiali', nameRu: 'Филиал Юнусабад (Шахристан)', nameEn: 'Yunusobod Shahriston Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur shoh ko'chasi, 129B, 7-qavat", landmarkUz: 'Shahriston metro bekati yonida', landmarkRu: 'Рядом с метро Шахристан', landmarkEn: 'Near Shahriston Metro (7th floor)' },
    ],
  },
  {
    name: 'Inter Nation English School',
    slug: 'inter-nation-english-school',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['ielts', 'english', 'cefr'],
    exam: 'IELTS',
    avgScore: 7.2,
    successRate: 88,
    price: 1050000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2013,
    phone: '+998 78 777 77 07',
    telegram: '@internation_uz',
    instagram: '@internation.uz',
    website: 'https://inter-nation.uz',
    youtube: 'https://youtube.com/@internationuz',
    googleRating: 5.0,
    googleReviewCount: 2850,
    totalGraduates: 85000,
    campusPhotos: ['english_classroom', 'building_reception', 'coworking_lounge'],
    taglineUz: '16+ filial, Oxford litsenziyalangan dastur, 23 000+ faol talaba va IELTS 9.0 ustozlar',
    taglineRu: 'Программа Oxford, современные кампусы, Academic Support, приложение и воскресные ивенты',
    taglineEn: 'Oxford curriculum, modern campuses, Academic Support, student app & Sunday events',
    descriptionUz:
      "Inter Nation English School — 2013-yildan beri Toshkent va viloyatlarda faoliyat yurituvchi yetakchi ingliz tili va IELTS maktabi. Oxford University Press materiallari, qulay kovorking, shaxsiy Student App va yakshanba kungi Speaking Club tadbirlari bilan ajralib turadi.",
    descriptionRu:
      'Inter Nation English School — одна из ведущих школ английского языка и IELTS в Узбекистане (с 2013 года). Обучение по программе Oxford University Press, коворкинг, мобильное приложение для студентов и воскресные разговорные клубы.',
    descriptionEn:
      'Operating since 2013 across Tashkent and regional capitals, Inter Nation pairs Oxford University Press curricula with dedicated Academic Support, a student mobile app, and weekend Speaking Clubs.',
    facilities: ['coworking', 'academic_support', 'speaking_club', 'student_app', 'mock_exam_hall', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['inter nation', 'internation', 'oxford english'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–8.5 · Oxford Certified',
    branches: [
      { nameUz: 'C1 (Markaz) filiali', nameRu: 'Филиал Ц1 (Центр)', nameEn: 'C1 Central Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Shahrisabz ko'chasi, 1", landmarkUz: 'Sobiq Detskiy Mir yonida', landmarkRu: 'Рядом с бывшим Детским Миром', landmarkEn: 'Near former Detsky Mir' },
      { nameUz: 'Westminster filiali', nameRu: 'Филиал Вестминстер', nameEn: 'Westminster Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Istiqlol ko'chasi, 14", landmarkUz: 'WIUT va O‘zbekneftgaz yonida', landmarkRu: 'Рядом с WIUT и Узбекнефтегаз', landmarkEn: 'Near WIUT & Uzbekneftegaz' },
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, 52/2", landmarkUz: 'Chilonzor metro / KFC yonida', landmarkRu: 'Метро Чиланзар / рядом с KFC', landmarkEn: 'Chilonzor Metro / near KFC' },
    ],
  },
  {
    name: "Najot Ta'lim",
    slug: 'najot-talim',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['web', 'python', 'design', 'data'],
    exam: 'IT Portfolio',
    avgScore: 93,
    successRate: 85,
    price: 1600000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2018,
    phone: '+998 78 888 98 88',
    telegram: '@najottalim',
    instagram: '@najottalim',
    website: 'https://najottalim.uz',
    youtube: 'https://youtube.com/@najottalim',
    googleRating: 5.0,
    googleReviewCount: 1940,
    totalGraduates: 14500,
    campusPhotos: ['it_coding_lab', 'coworking_lounge', 'building_reception'],
    taglineUz: "14 500+ bitiruvchi · Dasturlash, dizayn va marketing bootcamp, kovorking va Karyera markazi",
    taglineRu: 'Буткемпы по программированию, дизайну и маркетингу, коворкинг и Центр карьеры',
    taglineEn: 'Full-stack coding, design & digital bootcamps with spacious coworking & Career Center',
    descriptionUz:
      "Najot Ta'lim — O'zbekistondagi zamonaviy kasblar (Full-stack Web, Python, Node.js, React, Grafik va UI/UX dizayn, SMM) bo'yicha eng yirik ta'lim markazi. Har bir filialda kuchli kompyuter xonalari, katta kovorking zonasi, mentorlik va bitiruvchilarni ishga yo'naltiruvchi Karyera markazi faoliyat yuritadi.",
    descriptionRu:
      'Najot Ta’lim — крупнейший учебный центр современных IT и digital-профессий в Узбекистане. Современные компьютерные классы, просторный коворкинг, менторы-практики и собственный Центр карьеры.',
    descriptionEn:
      'Najot Ta’lim is Uzbekistan’s flagship IT & digital professions academy featuring coding & design bootcamps, dedicated computer labs, large student coworking spaces, and an active Career Placement Center.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['najot talim', 'najot', 'bootcamp', 'qatortol it'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'Senior Software Engineers · Practice Mentors',
    branches: [
      { nameUz: 'Chilonzor (Asosiy) filiali', nameRu: 'Филиал Чиланзар (Главный)', nameEn: 'Chilonzor Main Campus', cityId: 'tashkent', districtId: 'chilonzor', street: "Qatortol ko'chasi, 1-uy", landmarkUz: 'Chilonzor Qatortol', landmarkRu: 'Улица Катартал, дом 1', landmarkEn: 'Qatortol St 1, Chilonzor' },
      { nameUz: 'Xadra filiali', nameRu: 'Филиал Хадра', nameEn: 'Xadra Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Xadra maydoni, Navoiy ko'chasi", landmarkUz: 'Xadra maydoni / G‘afur G‘ulom metro', landmarkRu: 'Площадь Хадра / метро Гафура Гуляма', landmarkEn: 'Xadra Square / Gafur Gulom Metro' },
      { nameUz: 'Chimboy filiali', nameRu: 'Филиал Чимбай', nameEn: 'Chimboy Branch', cityId: 'tashkent', districtId: 'olmazor', street: "Chimboy ko'chasi, Olmazor", landmarkUz: 'Chimboy chorrahasi', landmarkRu: 'Перекрёсток Чимбай', landmarkEn: 'Chimboy Intersection' },
    ],
  },
  {
    name: 'PDP Academy',
    slug: 'pdp-academy',
    cityId: 'tashkent',
    districtId: 'olmazor',
    subjects: ['web', 'python', 'data', 'design'],
    exam: 'IT Portfolio',
    avgScore: 92,
    successRate: 86,
    price: 1800000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 78 777 47 47',
    telegram: '@pdpuz',
    instagram: '@pdp.uz',
    website: 'https://www.pdp.uz',
    youtube: 'https://youtube.com/@pdpuz',
    googleRating: 4.9,
    googleReviewCount: 1480,
    totalGraduates: 11200,
    campusPhotos: ['coworking_lounge', 'it_coding_lab', 'building_reception'],
    taglineUz: '11 000+ bitiruvchi · Java, Python, Frontend, Flutter bootcamp va PDP Ecosystem',
    taglineRu: 'Буткемпы Java, Python, Frontend, Flutter и QA · Экосистема PDP и центр карьеры',
    taglineEn: 'Java, Python, Frontend, Flutter & QA bootcamps inside the PDP IT Ecosystem',
    descriptionUz:
      "PDP Academy (pdp.uz) — O'zbekistondagi yetakchi dasturlash akademiyasi va PDP IT ekotizimining bir qismi. Chuqurlashtirilgan Java, Python, Frontend, Flutter va Mobile dasturlash, LMS platformasi, kovorking va texnik suhbatlarga tayyorlov mavjud.",
    descriptionRu:
      'PDP Academy (pdp.uz) — ведущая IT-академия Узбекистана и часть экосистемы PDP (University, Academy, School). Интенсивные курсы Java, Python, Frontend, Flutter, собственная LMS-платформа и подготовка к тех-интервью.',
    descriptionEn:
      'PDP Academy is one of Uzbekistan’s premier software engineering academies, offering structured Java, Python, Frontend, and Flutter tracks backed by its own LMS platform, coworking campus, and tech interview prep.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'student_app', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['pdp', 'pdp academy', 'beruniy it', 'java bootcamp'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'Team Leads · PDP Senior Mentors',
    branches: [
      { nameUz: 'Beruniy (Asosiy kampus)', nameRu: 'Главный кампус (Беруний)', nameEn: 'Beruniy Main Campus', cityId: 'tashkent', districtId: 'olmazor', street: "Beruniy ko'chasi, 3A", landmarkUz: 'Beruniy metro / Florensia to‘yxonasi yonida', landmarkRu: 'Метро Беруний, ориентир Florensia', landmarkEn: 'Near Beruniy Metro & Florensia' },
    ],
  },
  {
    name: 'IELTS Zone',
    slug: 'ielts-zone',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['ielts', 'english', 'cefr'],
    exam: 'IELTS',
    avgScore: 7.5,
    successRate: 91,
    price: 1100000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    sponsored: true,
    plan: PlanTier.FEATURED,
    foundedYear: 2018,
    phone: '+998 55 511 09 09',
    telegram: '@ieltszone',
    instagram: '@ieltszone_uz',
    website: 'https://ieltszone.uz',
    youtube: 'https://youtube.com/@ieltszone',
    googleRating: 5.0,
    googleReviewCount: 1320,
    totalGraduates: 18500,
    campusPhotos: ['mock_exam_hall', 'english_classroom', 'coworking_lounge'],
    taglineUz: '8.5–9.0 balli ustozlar, kompyuterli Mock IELTS zali va kuchli Academic Support',
    taglineRu: 'Преподаватели с IELTS 8.5–9.0, компьютерный зал Mock IELTS и Academic Support',
    taglineEn: 'Band 8.5–9.0 instructors, computer-delivered Mock IELTS lab & Academic Support',
    descriptionUz:
      "IELTS Zone (ieltszone.uz) — yuqori IELTS natijalariga ixtisoslashgan yetakchi o'quv markazi. Amir Temur xiyoboni, Chilonzor Integro va Furqat filiallarida zamonaviy kompyuterli Mock IELTS laboratoriyasi, yordamchi ustozlar (support teachers) va intensiv Writing/Speaking mashg'ulotlari olib boriladi.",
    descriptionRu:
      'IELTS Zone (ieltszone.uz) — специализированный центр подготовки к высоким баллам IELTS. Филиалы у сквера Амира Темура, в Integro (Чиланзар) и на ул. Фуркат оснащены компьютерными залами Mock IELTS и системой Academic Support.',
    descriptionEn:
      'IELTS Zone specializes in high-band IELTS preparation led by 8.5–9.0 scorers, featuring computer-delivered mock exam labs, assistant support tutors, and intensive Writing/Speaking workshops.',
    facilities: ['mock_exam_hall', 'computer_lab', 'academic_support', 'speaking_club', 'coworking', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['ielts zone', 'ieltszone', 'bekzod mirahmedov', 'integro ielts'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.5–9.0 · CELTA',
    branches: [
      { nameUz: 'Amir Temur (Istiqbol) filiali', nameRu: 'Филиал Амир Темур (Истикбол)', nameEn: 'Amir Temur (Istiqbol) Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Istiqbol ko'chasi, 8", landmarkUz: 'Amir Temur xiyoboni metro yaqinida', landmarkRu: 'Рядом с метро Сквер Амира Темура', landmarkEn: 'Near Amir Temur Square Metro' },
      { nameUz: 'Chilonzor (Integro) filiali', nameRu: 'Филиал Чиланзар (Integro)', nameEn: 'Chilonzor (Integro) Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, 52/1 (Integro)", landmarkUz: 'Chilonzor metro / Integro savdo markazi', landmarkRu: 'Метро Чиланзар / ТЦ Integro', landmarkEn: 'Chilonzor Metro / Integro Mall' },
      { nameUz: "Xalqlar Do'stligi (Furqat) filiali", nameRu: 'Филиал Дружба народов (Фуркат)', nameEn: 'Furqat / Drujba Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Furqat ko'chasi, 15A", landmarkUz: "Xalqlar Do'stligi metro bekati", landmarkRu: 'Метро Дружба народов', landmarkEn: 'Drujba Narodov Metro' },
    ],
  },
  {
    name: 'Thompson School & Learning Center',
    slug: 'thompson-school',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['ielts', 'english', 'kids', 'sat'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 86,
    price: 950000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 78 113 74 74',
    telegram: '@thompson_uz',
    instagram: '@thompson_uz',
    website: 'https://thompson.uz',
    googleRating: 5.0,
    googleReviewCount: 1240,
    totalGraduates: 24000,
    campusPhotos: ['building_reception', 'english_classroom', 'library_study'],
    taglineUz: 'Ingliz tili, IELTS va maktab o‘quvchilari uchun zamonaviy kampuslar tarmog‘i',
    taglineRu: 'Сеть современных кампусов английского языка, IELTS и программ для школьников',
    taglineEn: 'Multi-campus English, IELTS, SAT & youth academy across Tashkent',
    descriptionUz:
      "Thompson School & Learning Center (thompson.uz) — Toshkentning Chilonzor (Novza), Shayxontohur, Olmazor, Yunusobod va Uchtepa tumanlarida faoliyat yurituvchi zamonaviy til va ta'lim markazi. General English, IELTS, SAT hamda bolalar uchun maxsus dasturlar mavjud.",
    descriptionRu:
      'Thompson School & Learning Center (thompson.uz) — сеть современных образовательных центров и школ в Ташкенте (Новза, Шайхантахур, Алмазар, Юнусабад, Учтепа). Курсы General English, IELTS, SAT и программы для детей.',
    descriptionEn:
      'Thompson operates modern learning centers and school campuses across five Tashkent districts, offering General English, IELTS, SAT, and structured youth programs.',
    facilities: ['coworking', 'speaking_club', 'mock_exam_hall', 'library', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['thompson', 'tompson', 'thompson school'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · TESOL / CELTA',
    branches: [
      { nameUz: 'Novza (Chilonzor) filiali', nameRu: 'Филиал Новза (Чиланзар)', nameEn: 'Novza Campus', cityId: 'tashkent', districtId: 'chilonzor', street: 'Beshchinor mahallasi, Novza', landmarkUz: 'Novza metro bekati yaqinida', landmarkRu: 'Рядом с метро Новза', landmarkEn: 'Near Novza Metro' },
      { nameUz: 'Shayxontohur kampusi', nameRu: 'Кампус Шайхантахур', nameEn: 'Shayxontohur Campus', cityId: 'tashkent', districtId: 'shayxontohur', street: "Shoahmad Shomahmudov ko'chasi, 128", landmarkUz: 'Jarariq mahallasi', landmarkRu: 'Махалля Жарарык', landmarkEn: 'Jarariq Mahalla' },
      { nameUz: 'Yunusobod kampusi', nameRu: 'Кампус Юнусабад', nameEn: 'Yunusobod Campus', cityId: 'tashkent', districtId: 'yunusobod', street: "Yunusota ko'chasi", landmarkUz: 'Yunusobod tumani', landmarkRu: 'Юнусабадский район', landmarkEn: 'Yunusobod District' },
    ],
  },
  {
    name: 'MARS IT School',
    slug: 'mars-it-school',
    cityId: 'tashkent',
    districtId: 'yunusobod',
    subjects: ['kids', 'web', 'python', 'design'],
    exam: 'IT Portfolio',
    avgScore: 91,
    successRate: 88,
    price: 680000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 78 777 77 57',
    telegram: '@mars_it_school',
    instagram: '@mars_it_school',
    website: 'https://marsit.uz',
    googleRating: 4.9,
    googleReviewCount: 1120,
    totalGraduates: 9200,
    campusPhotos: ['it_coding_lab', 'coworking_lounge', 'building_reception'],
    taglineUz: "7+ filial, 8–16 yoshli bolalar uchun IT va AI kurslar, Space gamifikatsiya va Coin Shop",
    taglineRu: 'IT-школа для детей и подростков 8–16 лет с платформой Space и мотивационной системой',
    taglineEn: 'Youth IT & coding school (ages 8–16) with Space LMS, Coin Shop & Demo Days',
    descriptionUz:
      "MARS IT School (marsit.uz) — bolalar va o'smirlarga zamonaviy dasturlash (Frontend, Python, Roblox, Grafik dizayn) o'rgatuvchi O'zbekistondagi eng mashhur IT maktab. O'quvchilar shaxsiy Space platformasida coin yig'adi, Demo Day loyihalarini taqdim etadi va zamonaviy kompyuter xonalarida shug'ullanadi.",
    descriptionRu:
      'MARS IT School (marsit.uz) — ведущая IT-школа для детей и подростков в Узбекистане. Обучение программированию и дизайну на геймифицированной платформе Space, современные компьютерные классы, Demo Day и родительский контроль.',
    descriptionEn:
      'MARS IT School teaches coding, Python, web dev, and design to kids & teens ages 8–16 through its gamified Space LMS, coin reward shop, modern computer labs, and project Demo Days.',
    facilities: ['computer_lab', 'student_app', 'coworking', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['mars', 'mars it', 'kids it', 'bolalar it'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Youth IT Mentors · Certified Instructors',
    branches: [
      { nameUz: 'Yunusobod filiali', nameRu: 'Филиал Юнусабад', nameEn: 'Yunusobod Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur shoh ko'chasi, Yunusobod", landmarkUz: 'Shahriston / Yunusobod', landmarkRu: 'Шахристан / Юнусабад', landmarkEn: 'Shahriston / Yunusobod' },
      { nameUz: 'Chilonzor (Qatortol) filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, Chilonzor", landmarkUz: 'Chilonzor metro yaqinida', landmarkRu: 'Рядом с метро Чиланзар', landmarkEn: 'Near Chilonzor Metro' },
    ],
  },
  {
    name: 'PROWEB',
    slug: 'proweb',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['web', 'python', 'design', 'data'],
    exam: 'IT Portfolio',
    avgScore: 90,
    successRate: 83,
    price: 1350000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2015,
    phone: '+998 71 203 60 60',
    telegram: '@proweb_uz',
    instagram: '@proweb.uz',
    website: 'https://proweb.uz',
    googleRating: 4.9,
    googleReviewCount: 1090,
    totalGraduates: 12000,
    campusPhotos: ['it_coding_lab', 'coworking_lounge', 'building_reception'],
    taglineUz: 'Web dasturlash, Python, 3D/Grafik dizayn, kovorking va ishga joylashishda ko‘mak',
    taglineRu: 'Веб-разработка, Python, дизайн, SMM, коворкинг и помощь в трудоустройстве',
    taglineEn: 'Web dev, Python, UI/UX & 3D design tracks with coworking & placement support',
    descriptionUz:
      "PROWEB (proweb.uz) — Toshkentdagi tajribali IT va dizayn o'quv markazi. O'zbek va rus tillarida Web dasturlash, Python, Grafik va 3D dizayn, Marketing kurslari, bepul kovorking hududi hamda amaliy portfel loyihalari taqdim etiladi.",
    descriptionRu:
      'PROWEB (proweb.uz) — учебный центр современных профессий в Ташкенте. Курсы веб-разработки, Python, графического и 3D-дизайна на русском и узбекском языках, бесплатный коворкинг и помощь с портфолио.',
    descriptionEn:
      'PROWEB is an established Tashkent IT & creative academy delivering bilingual (UZ/RU) courses in Web Dev, Python, Graphic/3D Design, and Marketing with open coworking access.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['proweb', 'pro web', 'oybek it'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'Practicing IT Developers & Art Directors',
    branches: [
      { nameUz: 'Oybek (Mirobod) filiali', nameRu: 'Филиал Ойбек (Мирабад)', nameEn: 'Oybek (Mirobod) Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Oybek ko'chasi, 16", landmarkUz: 'Oybek metro bekati yaqinida', landmarkRu: 'Рядом с метро Ойбек', landmarkEn: 'Near Oybek Metro' },
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, 45", landmarkUz: 'Novza / Chilonzor', landmarkRu: 'Новза / Чиланзар', landmarkEn: 'Novza / Chilonzor' },
    ],
  },
  {
    name: 'Result Learning Center',
    slug: 'result-learning-center',
    cityId: 'tashkent',
    districtId: 'shayxontohur',
    subjects: ['ielts', 'english', 'dtm', 'math', 'russian'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 85,
    price: 850000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 78 113 11 00',
    telegram: '@resultschool_uz',
    instagram: '@result_school_uz',
    website: 'https://t.me/resultschool_uz',
    googleRating: 5.0,
    googleReviewCount: 890,
    totalGraduates: 22000,
    campusPhotos: ['english_classroom', 'mock_exam_hall', 'library_study'],
    taglineUz: 'Ingliz tili, IELTS, rus tili va DTM fanlari bo‘yicha shahar markazidagi filiallar',
    taglineRu: 'Английский, IELTS, русский язык и подготовка к ДТМ в удобных филиалах Ташкента',
    taglineEn: 'IELTS, English, Russian & DTM preparation across central Tashkent campuses',
    descriptionUz:
      "Result Learning Center (Result School) — Navoiy, Chilonzor, Xadra va Mirzo Ulug'bek hududlarida joylashgan ko'p tarmoqli o'quv markazi. Ingliz tili, IELTS, rus tili va abituriyentlar uchun matematika kurslari hamda haftalik mock testlar o'tkaziladi.",
    descriptionRu:
      'Result Learning Center — многопрофильный учебный центр с филиалами на ул. Навои, Чиланзаре, Хадре и в Мирзо-Улугбекском районе. Специализируется на IELTS, английском, русском и математике.',
    descriptionEn:
      'Result Learning Center offers IELTS, English, Russian, and DTM Math tracks across four convenient Tashkent locations with weekly mock tests and extra speaking practice.',
    facilities: ['mock_exam_hall', 'speaking_club', 'academic_support', 'library', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['result', 'result school', 'result lc', 'navoiy result'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · Senior Language Coaches',
    branches: [
      { nameUz: 'Navoiy / Xadra filiali', nameRu: 'Филиал Навои / Хадра', nameEn: 'Navoiy / Xadra Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Alisher Navoiy ko'chasi, 26A", landmarkUz: 'Xadra / Navoiy ko‘chasi markazi', landmarkRu: 'Ул. Навои 26А, район Хадра', landmarkEn: '26A Navoiy St, Xadra' },
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, Olmazor mavzesi", landmarkUz: 'Chilonzor / Olmazor', landmarkRu: 'Чиланзар / Алмазар', landmarkEn: 'Chilonzor / Almazar area' },
    ],
  },
  {
    name: 'Real Science',
    slug: 'real-science',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['westminster', 'math', 'sat', 'ielts', 'dtm'],
    exam: 'SAT',
    avgScore: 1420,
    successRate: 89,
    price: 1100000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2013,
    phone: '+998 71 205 08 80',
    telegram: '@realscienceuz',
    instagram: '@realscienceuz',
    website: 'https://realscience.uz',
    googleRating: 5.0,
    googleReviewCount: 680,
    totalGraduates: 11500,
    campusPhotos: ['mock_exam_hall', 'library_study', 'english_classroom'],
    taglineUz: 'WIUT, INHA, Turin, MDIS va SAT Matematika bo‘yicha chuqurlashtirilgan tayyorlov',
    taglineRu: 'Углублённая подготовка в WIUT, INHA, Туринский, MDIS и по математике SAT',
    taglineEn: 'Specialized WIUT, INHA, Turin, MDIS & SAT Mathematics entrance preparation',
    descriptionUz:
      "Real Science (realscience.uz) — Toshkentdagi xalqaro universitetlar (Westminster/WIUT, INHA, Turin, MDIS, Akfa) hamda litseylarga matematika va ingliz tilidan kirish imtihonlariga tayyorlovchi yetakchi markaz. Har bir o'quvchi bilan kichik guruhlarda chuqur mashq qilinadi.",
    descriptionRu:
      'Real Science (realscience.uz) — профильный центр подготовки к поступлению в международные вузы Ташкента (WIUT, INHA, Turin, MDIS) и академические лицеи по математике, SAT и английскому.',
    descriptionEn:
      'Real Science specializes in entrance preparation for international universities in Uzbekistan (WIUT, INHA, Turin, MDIS) and elite academic lyceums through small-group math & English coaching.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['real science', 'wiut math', 'westminster prep', 'inha prep'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'WIUT/INHA Entrance Experts · MSc Math',
    branches: [
      { nameUz: 'Oybek (Mirobod) markaziy filiali', nameRu: 'Центральный филиал (Ойбек)', nameEn: 'Oybek Central Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Shahrisabz ko'chasi, 25", landmarkUz: 'Oybek metro bekati yaqinida', landmarkRu: 'Рядом с метро Ойбек', landmarkEn: 'Near Oybek Metro' },
    ],
  },
  {
    name: 'Target Education',
    slug: 'target-education',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['ielts', 'sat', 'dtm', 'english', 'math', 'kids'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 86,
    price: 950000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2015,
    phone: '+998 71 200 07 37',
    telegram: '@target_edu_uz',
    instagram: '@target.uz',
    website: 'https://www.target.uz',
    googleRating: 4.8,
    googleReviewCount: 840,
    totalGraduates: 19000,
    campusPhotos: ['building_reception', 'english_classroom', 'library_study'],
    taglineUz: 'Target xalqaro maktabi va o‘quv markazi · IELTS, SAT, DTM va biznes ingliz tili',
    taglineRu: 'Международная школа и учебный центр Target · IELTS, SAT, ДТМ и английский',
    taglineEn: 'Target Education Group · IELTS, SAT, DTM & international school preparation',
    descriptionUz:
      "Target Education (target.uz) — o'quv markazi va xususiy maktab ekotizimi. IELTS, SAT, DTM fanlari, biznes ko'nikmalar va bolalar uchun zamonaviy sinf xonalari, kutubxona va haftalik natija nazorati yo'lga qo'yilgan.",
    descriptionRu:
      'Target Education (target.uz) — образовательная группа, объединяющая учебные центры и международную школу. Подготовка к IELTS, SAT, ДТМ и программы развития для школьников.',
    descriptionEn:
      'Target Education Group runs learning centers and international school programs across Tashkent, featuring IELTS, SAT, DTM tracks, study libraries, and weekly parent progress updates.',
    facilities: ['coworking', 'library', 'mock_exam_hall', 'speaking_club', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['target', 'target school', 'target lc'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · SAT 1480+',
    branches: [
      { nameUz: 'Chilonzor (Asosiy) filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, 15", landmarkUz: 'Novza / Chilonzor', landmarkRu: 'Новза / Чиланзар', landmarkEn: 'Novza / Chilonzor' },
      { nameUz: 'Yunusobod filiali', nameRu: 'Филиал Юнусабад', nameEn: 'Yunusobod Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur ko'chasi, 107B", landmarkUz: 'Bodomzor metro yaqinida', landmarkRu: 'Рядом с метро Бодомзор', landmarkEn: 'Near Bodomzor Metro' },
    ],
  },
  {
    name: 'Astrum IT Academy',
    slug: 'astrum-it-academy',
    cityId: 'tashkent',
    districtId: 'mirzo-ulugbek',
    subjects: ['web', 'python', 'data'],
    exam: 'IT Portfolio',
    avgScore: 94,
    successRate: 87,
    price: 2200000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2021,
    phone: '+998 71 202 42 22',
    telegram: '@astrumuz',
    instagram: '@astrumuz',
    website: 'https://www.astrum.uz',
    googleRating: 4.9,
    googleReviewCount: 790,
    totalGraduates: 6400,
    campusPhotos: ['it_coding_lab', 'coworking_lounge', 'building_reception'],
    taglineUz: '24/7 iMac kampus, Silicon Valley Qwasar peer-to-peer tizimi va IT karyera akseleratori',
    taglineRu: 'Кампус с iMac 24/7, платформа Qwasar (Silicon Valley) и карьерный акселератор',
    taglineEn: '24/7 iMac campus powered by Silicon Valley’s Qwasar peer-to-peer coding platform',
    descriptionUz:
      "Astrum IT Academy (astrum.uz) — Markaziy Osiyodagi eng yirik zamonaviy IT akademiya kampusi. Yuzlab Apple iMac kompyuterlari, 24/7 ochiq kovorking, Qwasar (AQSH) ta'lim platformasi, sport va dam olish zonalari hamda xalqaro IT kompaniyalarga ishga joylashish imkoniyati mavjud.",
    descriptionRu:
      'Astrum IT Academy (astrum.uz) — крупнейший инновационный IT-кампус в Центральной Азии. Сотни Apple iMac, круглосуточный коворкинг 24/7, американская платформа Qwasar и центр трудоустройства.',
    descriptionEn:
      'Astrum IT Academy is Central Asia’s largest 24/7 iMac coding campus utilizing Silicon Valley’s Qwasar peer-to-peer engineering curriculum, with full campus dining, lounges, and career placement.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'student_app', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['astrum', 'imac', 'qwasar', 'it academy'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Qwasar Silicon Valley Certified Mentors',
    branches: [
      { nameUz: 'Astrum IT Kampusi (Toshkent)', nameRu: 'Кампус Astrum IT (Ташкент)', nameEn: 'Astrum IT Campus (Tashkent)', cityId: 'tashkent', districtId: 'mirzo-ulugbek', street: "Toshkent viloyati / Mirzo Ulug'bek yo'nalishi", landmarkUz: 'Toshkentdan maxsus avtobus va keng avtoturargoh', landmarkRu: 'Шаттл из Ташкента и просторная парковка', landmarkEn: 'Shuttle from Tashkent & campus parking' },
    ],
  },
  {
    name: 'Mohirdev',
    slug: 'mohirdev',
    cityId: 'tashkent',
    districtId: 'mirzo-ulugbek',
    subjects: ['python', 'data', 'web', 'design'],
    exam: 'IT Portfolio',
    avgScore: 91,
    successRate: 84,
    price: 950000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2021,
    phone: '+998 71 200 05 84',
    telegram: '@mohirdev',
    instagram: '@mohirdev',
    website: 'https://mohirdev.uz',
    taglineUz: 'O‘zbek tilidagi Data Science, AI, Python va Full-stack praktikumlar · Onlayn & Gibrid',
    taglineRu: 'Практикумы по Data Science, AI, Python и Full-stack · Онлайн и гибрид',
    taglineEn: 'Uzbek-language Data Science, AI, Python & Full-stack practicums with live code reviews',
    descriptionUz:
      "Mohirdev (mohirdev.uz) — O'zbekistondagi eng yirik onlayn va gibrid dasturlash ta'lim platformasi. Data Science va Sun'iy Intellekt, Python, Frontend/Backend praktikumlari, mentorlar bilan jonli kod tekshiruvi va bitiruvchilar hamjamiyati mavjud.",
    descriptionRu:
      'Mohirdev (mohirdev.uz) — ведущая онлайн и гибридная платформа IT-образования в Узбекистане. Практикумы по Data Science и AI, Python, веб-разработке с регулярным code review от менторов.',
    descriptionEn:
      'Mohirdev is Uzbekistan’s largest online & hybrid coding platform offering Data Science, AI, Python, and Full-stack practicums with structured mentor code reviews and job readiness coaching.',
    facilities: ['student_app', 'career_center', 'academic_support', 'wifi', 'coworking'],
    aliases: ['mohirdev', 'ai kurs', 'data science uzbekistan', 'anvar narzullayev'],
    formats: [StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'PhD & Senior AI/Software Engineers',
    branches: [
      { nameUz: 'Toshkent IT Park / Onlayn markaz', nameRu: 'Офис IT Park Ташкент / Онлайн', nameEn: 'Tashkent IT Park Hub & Online', cityId: 'tashkent', districtId: 'mirzo-ulugbek', street: "Maxtumquli ko'chasi, IT Park hududi", landmarkUz: 'IT Park Toshkent', landmarkRu: 'Территория IT Park Ташкент', landmarkEn: 'IT Park Tashkent Campus' },
    ],
  },
  {
    name: 'Edu-Action (IDP IELTS & Exams)',
    slug: 'edu-action-ielts',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['ielts', 'cefr', 'toefl', 'english'],
    exam: 'IELTS',
    avgScore: 7.4,
    successRate: 90,
    price: 1450000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2012,
    phone: '+998 71 230 01 03',
    telegram: '@eduaction_uz',
    instagram: '@eduaction_uz',
    website: 'https://www.exams.uz',
    taglineUz: 'Rasmiy IDP IELTS imtihon markazi, TKT/CELTA ustozlar tayyorlovi va kompyuterli mocklar',
    taglineRu: 'Официальный экзаменационный центр IDP IELTS, подготовка к IELTS и TKT/CELTA',
    taglineEn: 'Official IDP IELTS test center, computer-delivered mock labs & TKT/CELTA training',
    descriptionUz:
      "Edu-Action (exams.uz / edu-action.uk) — O'zbekistondagi rasmiy IDP IELTS imtihon markazi va akademik tayyorlov akademiyasi. Haqiqiy imtihon kompyuter xonalarida IELTS Mock testlari, IELTS tayyorlov va ingliz tili o'qituvchilari uchun TKT/CELTA kurslari mavjud.",
    descriptionRu:
      'Edu-Action (exams.uz) — официальный экзаменационный центр IDP IELTS в Узбекистане. Проводит пробные компьютерные экзамены в реальных экзаменационных залах, курсы IELTS и сертификацию преподавателей TKT.',
    descriptionEn:
      'Edu-Action operates official IDP IELTS testing rooms in Uzbekistan alongside structured IELTS prep and TKT/CELTA teacher qualification courses.',
    facilities: ['mock_exam_hall', 'computer_lab', 'library', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['edu action', 'edu-action', 'idp ielts', 'exams.uz'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Official IDP Examiners & CELTA Trainers',
    branches: [
      { nameUz: 'Mirobod (Asosiy) imtihon markazi', nameRu: 'Главный центр Мирабад', nameEn: 'Mirobod Main Exam Center', cityId: 'tashkent', districtId: 'mirobod', street: "Afrosiyob ko'chasi, 4B", landmarkUz: 'Oybek / Ming O‘rik metro yaqinida', landmarkRu: 'Рядом с метро Ойбек и Минг Урик', landmarkEn: 'Near Oybek & Ming Orik Metro' },
    ],
  },
  {
    name: "King's Academy",
    slug: 'kings-academy',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['ielts', 'english', 'kids', 'cefr'],
    exam: 'IELTS',
    avgScore: 7.0,
    successRate: 84,
    price: 980000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2015,
    phone: '+998 90 900 79 66',
    telegram: '@kingsacademy_uz',
    instagram: '@kingsacademy.uz',
    website: 'https://kings.uz',
    taglineUz: 'Ingliz tili, IELTS, bolalar kurslari va har hafta jonli Speaking Club uchrashuvlari',
    taglineRu: 'Английский, IELTS, детские группы и еженедельные Speaking Club',
    taglineEn: 'General English, IELTS, Kids tracks & weekly interactive Speaking Clubs',
    descriptionUz:
      "King's Academy (kings.uz) — Toshkentda ingliz tili va IELTS bo'yicha kichik guruhlarda sifatli darslar olib boruvchi markaz. Haftalik Speaking Club, bepul daraja aniqlash va ota-onalar uchun progress hisobotlari taqdim etiladi.",
    descriptionRu:
      'King’s Academy (kings.uz) — центр английского языка и IELTS в Ташкенте с мини-группами, еженедельными разговорными клубами и бесплатным входным тестированием.',
    descriptionEn:
      'King’s Academy provides focused small-group General English, IELTS, and kids English classes in Tashkent with weekly Speaking Clubs and diagnostic placement.',
    facilities: ['speaking_club', 'mock_exam_hall', 'library', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['kings', 'kings academy', 'king academy'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · TESOL',
    branches: [
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Muqimiy ko'chasi, 166", landmarkUz: 'Novza metro yaqinida', landmarkRu: 'Рядом с метро Новза', landmarkEn: 'Near Novza Metro' },
      { nameUz: 'Mirobod filiali', nameRu: 'Филиал Мирабад', nameEn: 'Mirobod Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Nukus ko'chasi, 29", landmarkUz: 'Oybek metro yaqinida', landmarkRu: 'Рядом с метро Ойбек', landmarkEn: 'Near Oybek Metro' },
    ],
  },
  {
    name: 'Profi Education',
    slug: 'profi-education',
    cityId: 'tashkent',
    districtId: 'shayxontohur',
    subjects: ['dtm', 'math', 'biology', 'chemistry', 'physics', 'ielts'],
    exam: 'DTM',
    avgScore: 171,
    successRate: 88,
    price: 880000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2013,
    phone: '+998 78 777 11 11',
    telegram: '@profieducation_uz',
    instagram: '@profi.education',
    website: 'https://profi-school.uz',
    taglineUz: 'Abituriyentlar uchun DTM, tibbiyot va texnika OTMlariga chuqur tayyorlov',
    taglineRu: 'Сильная подготовка к ДТМ, медицинским и техническим вузам Узбекистана',
    taglineEn: 'Proven DTM entrance prep for medical, STEM & national universities',
    descriptionUz:
      "Profi Education (Profi School & University ekotizimi) — 2013-yildan beri minglab abituriyentlarni O'zbekistonning yetakchi OTMlariga grant asosida tayyorlab kelayotgan markaz. Kimyo, biologiya, matematika, fizika va IELTS bo'yicha kuchli ustozlar hamda oylik DTM simulyatsiyalari mavjud.",
    descriptionRu:
      'Profi Education (экосистема Profi School и Profi University) — с 2013 года готовит абитуриентов на бюджет в ведущие вузы страны. Сильные направления по химии, биологии, математике и IELTS.',
    descriptionEn:
      'Part of the Profi School & University ecosystem since 2013, Profi Education prepares DTM applicants in Chemistry, Biology, Math, Physics, and IELTS with monthly full-length exam simulations.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['profi', 'profi education', 'profi school', 'medprep'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'DTM Olympiad & University Faculty',
    branches: [
      { nameUz: 'Shayxontohur (Beruniy) filiali', nameRu: 'Филиал Шайхантахур', nameEn: 'Shayxontohur Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Navoiy shoh ko'chasi, 30", landmarkUz: 'Alisher Navoiy / Paxtakor metro', landmarkRu: 'Метро Алишер Навои / Пахтакор', landmarkEn: 'Navoiy / Paxtakor Metro' },
      { nameUz: 'Yunusobod filiali', nameRu: 'Филиал Юнусабад', nameEn: 'Yunusobod Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Ahmad Donish ko'chasi, 24", landmarkUz: 'Yunusobod Universam yaqinida', landmarkRu: 'Рядом с Юнусабад Универсам', landmarkEn: 'Near Yunusobod Universam' },
    ],
  },
  {
    name: "Yuksalish O'quv Markazi",
    slug: 'yuksalish-lc',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['ielts', 'english', 'dtm', 'web', 'math'],
    exam: 'IELTS',
    avgScore: 7.0,
    successRate: 84,
    price: 890000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 78 122 02 22',
    telegram: '@yuksalish_lc',
    instagram: '@yuksalish_lc',
    website: 'https://www.yuksalishedu.uz',
    taglineUz: 'Novza metro yonida IELTS, General English, DTM va ITmatic dasturlash kurslari',
    taglineRu: 'IELTS, английский, ДТМ и IT-курсы ITmatic рядом с метро Новза',
    taglineEn: 'IELTS, General English, DTM & ITmatic coding tracks right by Novza Metro',
    descriptionUz:
      "Yuksalish o'quv markazi (yuksalishedu.uz) — Chilonzor tumani Novza metro yonida joylashgan zamonaviy ta'lim markazi. Ingliz tili, IELTS, abituriyent fanlari hamda ITmatic yo'nalishi bo'yicha amaliy kurslar va kovorking xonasi mavjud.",
    descriptionRu:
      'Учебный центр Yuksalish (yuksalishedu.uz) рядом с метро Новза предлагает курсы английского, IELTS, подготовки к вузам и IT-направление ITmatic с собственной зоной для самоподготовки.',
    descriptionEn:
      'Located steps from Novza Metro, Yuksalish LC delivers IELTS, English, DTM prep, and ITmatic tech courses with dedicated study zones and regular diagnostic tests.',
    facilities: ['coworking', 'mock_exam_hall', 'speaking_club', 'computer_lab', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['yuksalish', 'yuksalish ziyo', 'itmatic'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · DTM & IT Mentors',
    branches: [
      { nameUz: 'Novza (Asosiy) filiali', nameRu: 'Главный филиал (Новза)', nameEn: 'Novza Main Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, 2A", landmarkUz: 'Novza metro bekatidan 2 daqiqa', landmarkRu: '2 минуты от метро Новза', landmarkEn: '2 min walk from Novza Metro' },
    ],
  },
  {
    name: "Grand Ta'lim",
    slug: 'grand-talim',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['english', 'ielts', 'russian', 'korean', 'kids'],
    exam: 'CEFR',
    avgScore: 87,
    successRate: 85,
    price: 780000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2008,
    phone: '+998 71 207 80 40',
    telegram: '@grandaloqa',
    instagram: '@grandtalim',
    website: 'https://grandtalim.uz',
    taglineUz: '15+ yillik tajriba · Ingliz, rus, arab, koreys va turk tillari hamda bolalar akademiyasi',
    taglineRu: 'Более 15 лет опыта · Английский, русский, арабский, корейский и курсы для детей',
    taglineEn: '15+ years of heritage · English, Russian, Korean, Arabic & youth language tracks',
    descriptionUz:
      "Grand Ta'lim (grandtalim.uz, qisqa raqam 1321) — 2008-yildan beri faoliyat yurituvchi O'zbekistondagi eng tajribali tillar markazlaridan biri. Ingliz (CEFR/IELTS), rus, koreys, arab va turk tillari, bolalar uchun maktabga tayyorlov va shinam kutubxona mavjud.",
    descriptionRu:
      'Grand Ta’lim (grandtalim.uz, колл-центр 1321) — один из старейших языковых центров Ташкента (с 2008 года). Английский, русский, корейский, арабский, турецкий языки и детские развивающие программы.',
    descriptionEn:
      'Operating since 2008, Grand Ta’lim (short code 1321) is one of Uzbekistan’s most established multilingual centers covering English, Russian, Korean, Arabic, Turkish, and early-childhood programs.',
    facilities: ['library', 'speaking_club', 'academic_support', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['grand talim', 'grand', '1321', 'arab tili', 'til markazi'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE],
    certHighlight: 'Certified Philologists · CEFR C1',
    branches: [
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Chilonzor 9-kvartal, Qatortol 42", landmarkUz: 'Qatortol / Chilonzor', landmarkRu: 'Чиланзар 9-квартал, Катартал', landmarkEn: 'Chilonzor 9th Quarter' },
      { nameUz: 'Olmazor filiali', nameRu: 'Филиал Алмазар', nameEn: 'Olmazor Branch', cityId: 'tashkent', districtId: 'olmazor', street: "Farobiy ko'chasi, 33", landmarkUz: 'Tinchlik metro yaqinida', landmarkRu: 'Рядом с метро Тинчлик', landmarkEn: 'Near Tinchlik Metro' },
    ],
  },
  {
    name: 'IlmHub IT School',
    slug: 'ilmhub-it-school',
    cityId: 'tashkent',
    districtId: 'mirzo-ulugbek',
    subjects: ['web', 'python', 'data'],
    exam: 'IT Portfolio',
    avgScore: 90,
    successRate: 83,
    price: 1520000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 97 050 02 07',
    telegram: '@ilmhub_uz',
    instagram: '@ilmhub.uz',
    website: 'https://ilmhub.uz',
    taglineUz: 'C#/.NET, Python, Frontend bootcamp kurslari va amaliy muhandislik mentorligi',
    taglineRu: 'Буткемпы C#/.NET, Python, Frontend с практическим инженерным менторством',
    taglineEn: 'Engineering-first C#/.NET, Python & Frontend bootcamps with live code mentoring',
    descriptionUz:
      "IlmHub IT School (ilmhub.uz) — dasturiy ta'minot muhandisligi, C#/.NET, Python va Web dasturlashga ixtisoslashgan zamonaviy IT maktab. Kichik guruhlar, real GitHub loyihalari, kovorking va senior dasturchilar bilan haftalik code-review yo'lga qo'yilgan.",
    descriptionRu:
      'IlmHub IT School (ilmhub.uz) — практическая IT-школа по разработке на C#/.NET, Python и Frontend. Небольшие группы, реальные проекты на GitHub, коворкинг и еженедельный code review.',
    descriptionEn:
      'IlmHub IT School focuses on software engineering fundamentals in C#/.NET, Python, and Web development with small cohorts, GitHub portfolios, coworking, and weekly senior code reviews.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms', 'cafe_water'],
    aliases: ['ilmhub', 'ilm hub', 'dotnet', 'csharp'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'Senior .NET / Backend Engineers',
    branches: [
      { nameUz: "Mirzo Ulug'bek filiali", nameRu: 'Филиал Мирзо-Улугбек', nameEn: "Mirzo Ulug'bek Campus", cityId: 'tashkent', districtId: 'mirzo-ulugbek', street: "Mustaqillik shoh ko'chasi, 88", landmarkUz: 'Darxon / Hamid Olimjon metro', landmarkRu: 'Дархан / метро Хамида Алимджана', landmarkEn: 'Darkhan / Hamid Olimjon Metro' },
    ],
  },
  {
    name: "Qorako'l Ziyo",
    slug: 'qorakol-ziyo',
    cityId: 'tashkent',
    districtId: 'chilonzor',
    subjects: ['math', 'physics', 'dtm', 'sat', 'chemistry'],
    exam: 'DTM',
    avgScore: 176,
    successRate: 93,
    price: 850000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2015,
    phone: '+998 71 200 18 18',
    telegram: '@qorakolziyo',
    instagram: '@qorakol_ziyo',
    website: 'https://t.me/qorakolziyo',
    taglineUz: "Afsonaviy Qorako'l matematika va fizika metodikasi · Olimpiada va DTM 180+ ball",
    taglineRu: 'Знаменитая Каракульская методика математики и физики · Олимпиады и ДТМ 180+',
    taglineEn: 'Renowned Qorakol Mathematics & Physics methodology for Olympiads and top DTM scores',
    descriptionUz:
      "Qorako'l Ziyo — O'zbekiston bo'ylab mashhur Qorako'l matematika va fizika maktabi an'analariga asoslangan kuchli aniq fanlar markazi. Kunlik masalalar to'plami, qat'iy sinov testlari va respublika olimpiadalari hamda DTM grantiga tayyorlov olib boriladi.",
    descriptionRu:
      'Qorako’l Ziyo — центр углублённой математики и физики, работающий по знаменитой Каракульской методике. Ежедневная практика олимпиадных задач и высокая доля поступления на грант по ДТМ.',
    descriptionEn:
      'Built on Uzbekistan’s celebrated Qorakol math & physics pedagogy, Qorako’l Ziyo delivers intensive daily problem-solving, Olympiad coaching, and high-rate DTM scholarship prep.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'ac_classrooms', 'wifi', 'parking'],
    aliases: ['qorakol', 'qorako\'l', 'karakul', 'olympiad math'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'IMO/IPhO Olympiad Coaches · Qorakol School',
    branches: [
      { nameUz: 'Chilonzor (Asosiy) filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor shoh ko'chasi, 21", landmarkUz: 'Chilonzor metro yaqinida', landmarkRu: 'Рядом с метро Чиланзар', landmarkEn: 'Near Chilonzor Metro' },
      { nameUz: 'Olmazor (Talabalar shaharchasi) filiali', nameRu: 'Филиал Алмазар (Вузгородок)', nameEn: 'Olmazor Student Town Branch', cityId: 'tashkent', districtId: 'olmazor', street: "Talabalar shaharchasi, 8", landmarkUz: 'Beruniy metro / Milliy universitet yonida', landmarkRu: 'Метро Беруний / рядом с НУУз', landmarkEn: 'Beruniy Metro / near NUUz' },
    ],
  },
  {
    name: 'Progress Academy',
    slug: 'progress-academy',
    cityId: 'tashkent',
    districtId: 'mirzo-ulugbek',
    subjects: ['ielts', 'english', 'russian', 'math', 'kids'],
    exam: 'IELTS',
    avgScore: 6.9,
    successRate: 83,
    price: 840000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2016,
    phone: '+998 99 898 10 00',
    telegram: '@progress_academy_uz',
    instagram: '@progress_academy_uz',
    website: 'https://t.me/progress_academy_uz',
    taglineUz: "Feruza, Chilonzor va Uchtepada ingliz, rus tili, IELTS va maktab fanlari",
    taglineRu: 'Английский, IELTS, русский и школьная математика на Ферузе, Чиланзаре и Учтепе',
    taglineEn: 'Neighborhood IELTS, English, Russian & school math across Mirzo Ulugbek & Chilonzor',
    descriptionUz:
      "Progress Academy — Mirzo Ulug'bek (Feruza), Chilonzor va Uchtepa tumanlarida faoliyat yurituvchi qulay va hamyonbop o'quv markazi. Ingliz tili, IELTS, rus tili hamda maktab o'quvchilari uchun matematika kurslari mavjud.",
    descriptionRu:
      'Progress Academy — доступный и качественный учебный центр с филиалами на массиве Феруза, Чиланзаре и Учтепе. Курсы IELTS, английского, русского и школьной математики.',
    descriptionEn:
      'Progress Academy serves students in Feruza, Chilonzor, and Uchtepa with accessible pricing for IELTS, English, Russian, and school mathematics.',
    facilities: ['speaking_club', 'library', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['progress', 'feruza', 'progress school'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'IELTS 7.5–8.0 · Experienced Tutors',
    branches: [
      { nameUz: "Mirzo Ulug'bek (Feruza) filiali", nameRu: 'Филиал Феруза (Мирзо-Улугбек)', nameEn: 'Feruza Branch', cityId: 'tashkent', districtId: 'mirzo-ulugbek', street: "Feruza ko'chasi, 12", landmarkUz: 'Feruza massivi markazi', landmarkRu: 'Центр массива Феруза', landmarkEn: 'Feruza Residential Center' },
      { nameUz: 'Uchtepa filiali', nameRu: 'Филиал Учтепа', nameEn: 'Uchtepa Branch', cityId: 'tashkent', districtId: 'uchtepa', street: "Lutfiy ko'chasi, 44", landmarkUz: 'Farhod bozori yaqinida', landmarkRu: 'Рядом с Фархадским рынком', landmarkEn: 'Near Farhod Bazaar' },
    ],
  },
  {
    name: 'MyTeacher IELTS',
    slug: 'myteacher-ielts',
    cityId: 'tashkent',
    districtId: 'yakkasaroy',
    subjects: ['ielts', 'english', 'cefr'],
    exam: 'IELTS',
    avgScore: 7.2,
    successRate: 87,
    price: 750000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 71 200 84 44',
    telegram: '@Myteacher_IELTS',
    instagram: '@myteacher.uz',
    website: 'https://myteacher.uz',
    taglineUz: 'Onlayn va gibrid IELTS platformasi · Shaxsiy speaking/writing tekshiruvi va mobil ilova',
    taglineRu: 'Онлайн и гибридная платформа IELTS с личной проверкой Writing/Speaking и приложением',
    taglineEn: 'Online & hybrid IELTS platform with dedicated mobile app and Writing/Speaking grading',
    descriptionUz:
      "MyTeacher (myteacher.uz) — O'zbekistonning istalgan hududidan turib sifatli IELTS va ingliz tili o'rganish imkonini beruvchi zamonaviy ta'lim platformasi. Video darslar, jonli Speaking amaliyoti, Writing insholarini batafsil tekshirish va shaxsiy kurator nazorati mavjud.",
    descriptionRu:
      'MyTeacher (myteacher.uz) — современная платформа для подготовки к IELTS из любой точки Узбекистана. Мобильное приложение, живые сессии Speaking, детальный разбор эссе Writing и поддержка куратора.',
    descriptionEn:
      'MyTeacher enables students across all regions of Uzbekistan to prepare for IELTS online or hybrid with its mobile app, live speaking drills, and detailed Writing evaluations.',
    facilities: ['student_app', 'academic_support', 'mock_exam_hall', 'speaking_club', 'wifi'],
    aliases: ['myteacher', 'my teacher', 'online ielts'],
    formats: [StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.5 · Online Mentors',
    branches: [
      { nameUz: 'Toshkent Bosh ofis & Onlayn', nameRu: 'Офис Ташкент и Онлайн', nameEn: 'Tashkent Hub & Online', cityId: 'tashkent', districtId: 'yakkasaroy', street: "Bobur ko'chasi, 34", landmarkUz: 'Yakkasaroy / Onlayn butun O‘zbekiston', landmarkRu: 'Яккасарай / Онлайн по всему Узбекистану', landmarkEn: 'Yakkasaroy / Nationwide Online' },
    ],
  },
  {
    name: 'Alpha Education',
    slug: 'alpha-education',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['accounting', 'data', 'design', 'web'],
    exam: 'Business Cert',
    avgScore: 91,
    successRate: 85,
    price: 1950000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 71 200 00 99',
    telegram: '@alphaeducation',
    instagram: '@alphaeducation.uz',
    website: 'https://alpha.uz',
    taglineUz: 'Moliya, biznes-tahlil, mahsulot boshqaruvi, marketing va korporativ ta’lim akademiyasi',
    taglineRu: 'Академия бизнеса, финансов, аналитики данных, Product Management и маркетинга',
    taglineEn: 'Executive academy for Finance, Data Analytics, Product Management & Marketing',
    descriptionUz:
      "Alpha Education (alpha.uz) — O'zbekistondagi biznes, moliya, buxgalteriya, data-analitika va raqamli marketing bo'yicha yetakchi kasbiy ta'lim maktabi. Darslarni yirik kompaniyalar top-menejerlari va amaliyotchi ekspertlar olib boradi.",
    descriptionRu:
      'Alpha Education (alpha.uz) — ведущая школа бизнес-образования, финансов, аналитики и маркетинга в Ташкенте. Преподают действующие топ-менеджеры и практики крупнейших компаний.',
    descriptionEn:
      'Alpha Education delivers practitioner-led courses in Finance, Accounting, Data Analytics, and Product/Digital Marketing taught by senior industry leaders in Tashkent.',
    facilities: ['coworking', 'career_center', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['alpha', 'alpha education', 'finance', 'marketing', 'mba'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'C-Level Executives · ACCA / CFA Practitioners',
    branches: [
      { nameUz: 'Mirobod (Markaz) kampusi', nameRu: 'Кампус Мирабад (Центр)', nameEn: 'Mirobod Central Campus', cityId: 'tashkent', districtId: 'mirobod', street: "Oybek ko'chasi, 18", landmarkUz: 'Oybek metro bekati yonida', landmarkRu: 'Рядом с метро Ойбек', landmarkEn: 'Near Oybek Metro' },
    ],
  },
  {
    name: "Ilm Ziyo O'quv Markazi",
    slug: 'ilm-ziyo',
    cityId: 'tashkent',
    districtId: 'yakkasaroy',
    subjects: ['dtm', 'kids', 'mental-math', 'english', 'russian'],
    exam: 'DTM',
    avgScore: 165,
    successRate: 84,
    price: 690000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2015,
    phone: '+998 33 929 07 00',
    telegram: '@ilmziyo_uz',
    instagram: '@ilmziyo_uz',
    website: 'https://ilm-ziyo.uz',
    taglineUz: 'Bolalar uchun mental arifmetika, tez o‘qish, maktabga tayyorlov va DTM fanlari',
    taglineRu: 'Ментальная арифметика, скорочтение, подготовка к школе и ДТМ',
    taglineEn: 'Mental arithmetic, speed reading, school readiness & DTM preparation',
    descriptionUz:
      "Ilm Ziyo o'quv markazi — bolalar uchun mental arifmetika, mantiqiy fikrlash, ingliz va rus tillari hamda abituriyentlar uchun DTM tayyorlov kurslarini taklif etuvchi hamyonbop markaz.",
    descriptionRu:
      'Учебный центр Ilm Ziyo специализируется на детских развивающих курсах (ментальная арифметика, подготовка к школе), языках и подготовке к ДТМ по доступным ценам.',
    descriptionEn:
      'Ilm Ziyo offers affordable kids mental math, early school prep, language classes, and DTM exam courses in Tashkent.',
    facilities: ['library', 'ac_classrooms', 'wifi', 'parking'],
    aliases: ['ilm ziyo', 'mental arifmetika', 'bolalar'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'Certified Kids & DTM Pedagogues',
    branches: [
      { nameUz: 'Toshkent (Yakkasaroy) filiali', nameRu: 'Филиал Яккасарай', nameEn: 'Yakkasaroy Branch', cityId: 'tashkent', districtId: 'yakkasaroy', street: "Shota Rustaveli ko'chasi, 45", landmarkUz: 'Grand Mir / Askiya yaqinida', landmarkRu: 'Ориентир Аския', landmarkEn: 'Near Askiya / Rustaveli' },
    ],
  },
  {
    name: '5+ (Five Plus) Education',
    slug: 'five-plus-education',
    cityId: 'tashkent',
    districtId: 'shayxontohur',
    subjects: ['dtm', 'biology', 'chemistry', 'math', 'physics'],
    exam: 'DTM',
    avgScore: 173,
    successRate: 89,
    price: 890000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2014,
    phone: '+998 71 200 55 05',
    telegram: '@fiveplus_uz',
    instagram: '@fiveplus_uz',
    website: 'https://t.me/fiveplus_uz',
    taglineUz: 'Tibbiyot institutlari (TTA, SamDTU) va texnika OTMlari uchun kuchli kimyo-biologiya',
    taglineRu: 'Сильная химия, биология и математика для поступления в ТМА и ведущие вузы',
    taglineEn: 'High-rate Chemistry, Biology & Math prep for Tashkent Medical Academy & DTM',
    descriptionUz:
      "5+ Education — tibbiyot oliygohlari (TTA, ToshPMI) hamda texnika universitetlariga kirishga ixtisoslashgan yetakchi DTM markazi. Har oyda 2 marta DTM standartidagi katta sinov testlari va xatolar tahlili o'tkaziladi.",
    descriptionRu:
      '5+ Education — специализированный центр подготовки абитуриентов в медицинские (ТМА, ТашПМИ) и технические вузы. Регулярные пробные блок-тесты ДТМ дважды в месяц.',
    descriptionEn:
      '5+ Education focuses on medical and STEM university admissions in Uzbekistan, running bi-weekly full-scale DTM block mock tests with individual gap analysis.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'ac_classrooms', 'wifi', 'parking'],
    aliases: ['5+', 'five plus', '5 plus', 'med', 'kimyo biologiya'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'Medical & DTM Exam Specialists',
    branches: [
      { nameUz: 'Shayxontohur (Chorsu) filiali', nameRu: 'Филиал Шайхантахур (Чорсу)', nameEn: 'Chorsu Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Beruniy shoh ko'chasi, 14", landmarkUz: 'Chorsu metro bekati yonida', landmarkRu: 'Рядом с метро Чорсу', landmarkEn: 'Near Chorsu Metro' },
      { nameUz: 'Chilonzor filiali', nameRu: 'Филиал Чиланзар', nameEn: 'Chilonzor Branch', cityId: 'tashkent', districtId: 'chilonzor', street: "Bunyodkor ko'chasi, 18", landmarkUz: 'Novza metro', landmarkRu: 'Метро Новза', landmarkEn: 'Novza Metro' },
    ],
  },
  {
    name: 'Merit Education',
    slug: 'merit-education',
    cityId: 'tashkent',
    districtId: 'yunusobod',
    subjects: ['ielts', 'cefr', 'sat', 'english', 'kids'],
    exam: 'IELTS',
    avgScore: 7.0,
    successRate: 85,
    price: 1050000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2016,
    phone: '+998 71 200 44 04',
    telegram: '@merit_education_uz',
    instagram: '@merit.school',
    website: 'https://t.me/merit_education_uz',
    taglineUz: 'Yunusobod va Mirzo Ulug‘bekda ingliz tili, IELTS, CEFR va bolalar kurslari',
    taglineRu: 'Английский, IELTS, CEFR и детские программы на Юнусабаде и Мирзо-Улугбеке',
    taglineEn: 'English, IELTS, CEFR & youth learning programs in Yunusobod and Mirzo Ulugbek',
    descriptionUz:
      "Merit Education — o'quv markazi va xususiy ta'lim loyihasi bo'lib, zamonaviy sinf xonalari, kichik guruhlar, ingliz tili, IELTS va maktab o'quvchilari uchun qo'shimcha fanlarni taklif etadi.",
    descriptionRu:
      'Merit Education предлагает курсы английского языка, IELTS, CEFR и школьные программы в современных аудиториях Юнусабада и Мирзо-Улугбекского района.',
    descriptionEn:
      'Merit Education runs modern small-group IELTS, CEFR, and school enrichment classes across Yunusobod and Mirzo Ulugbek.',
    facilities: ['library', 'speaking_club', 'mock_exam_hall', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['merit', 'merit school', 'merit education'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'IELTS 8.0 · TESOL',
    branches: [
      { nameUz: 'Yunusobod filiali', nameRu: 'Филиал Юнусабад', nameEn: 'Yunusobod Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Bog'ishamol ko'chasi, 18", landmarkUz: 'Bodomzor metro yaqinida', landmarkRu: 'Рядом с метро Бодомзор', landmarkEn: 'Near Bodomzor Metro' },
    ],
  },
  {
    name: 'WIUT & International Uni Prep Hub',
    slug: 'wiut-prep-hub',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['westminster', 'sat', 'ielts', 'math'],
    exam: 'IELTS',
    avgScore: 7.3,
    successRate: 90,
    price: 1480000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2018,
    phone: '+998 71 238 74 00',
    telegram: '@wiut_prep_uz',
    instagram: '@wiut_prep_uz',
    website: 'https://t.me/wiut_prep_uz',
    taglineUz: 'Westminster (WIUT), MDIS, Webster va New Uzbekistan University kirish imtihonlariga tayyorlov',
    taglineRu: 'Подготовка к поступлению в WIUT, MDIS, Webster и New Uzbekistan University',
    taglineEn: 'Dedicated entrance prep for WIUT, MDIS, Webster & New Uzbekistan University',
    descriptionUz:
      "WIUT Prep Hub — Toshkentdagi xalqaro universitetlar (WIUT, MDIS, Webster, INHA, NewUU) kirish imtihonlari bo'yicha ixtisoslashgan markaz. Matematika testi, IELTS 6.5–7.5 va universitet suhbatiga tayyorlov bitta dasturda jamlangan.",
    descriptionRu:
      'WIUT Prep Hub готовит абитуриентов к экзаменам международных вузов Ташкента (WIUT, MDIS, Webster, INHA, NewUU): математика на английском, IELTS и пробные вступительные тесты.',
    descriptionEn:
      'WIUT Prep Hub combines English-medium mathematics, IELTS 7.0+ prep, and past-paper entrance simulations for WIUT, MDIS, Webster, and New Uzbekistan University.',
    facilities: ['mock_exam_hall', 'coworking', 'career_center', 'library', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['wiut', 'westminster', 'mdis', 'newuu'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'WIUT Alumni & IELTS 8.5 Mentors',
    branches: [
      { nameUz: 'Istiqlol (Westminster yonida) filiali', nameRu: 'Филиал Истиклол (рядом с WIUT)', nameEn: 'Istiqlol (Near WIUT) Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Istiqlol ko'chasi, 18", landmarkUz: 'WIUT universitetidan 3 daqiqa', landmarkRu: '3 минуты от WIUT', landmarkEn: '3 min walk from WIUT' },
    ],
  },
  {
    name: 'King Sejong Korean Center Tashkent',
    slug: 'sejong-korean-tashkent',
    cityId: 'tashkent',
    districtId: 'yakkasaroy',
    subjects: ['korean', 'english'],
    exam: 'TOPIK',
    avgScore: 5.0,
    successRate: 88,
    price: 920000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2015,
    phone: '+998 71 255 34 00',
    telegram: '@sejong_tashkent',
    instagram: '@sejong.tashkent',
    website: 'https://t.me/sejong_tashkent',
    taglineUz: 'Koreys tili (TOPIK 1–6), Koreya universitetlariga GKS granti va native ustozlar',
    taglineRu: 'Корейский язык (TOPIK 1–6), гранты GKS в вузы Кореи и носители языка',
    taglineEn: 'Korean TOPIK 1–6 mastery, native Korean instructors & GKS Korea scholarship advising',
    descriptionUz:
      "King Sejong Korean Center — koreys tili va TOPIK imtihonlariga tayyorlovchi yetakchi markaz. Janubiy Koreyada tahsil olgan va native o'qituvchilar, haftalik TOPIK mock testlari hamda GKS / Seul universitetlariga hujjat topshirish maslahatlari mavjud.",
    descriptionRu:
      'Центр корейского языка с преподавателями-носителями и выпускниками вузов Южной Кореи. Подготовка к TOPIK 1–6, разговорные клубы и консультации по грантам GKS.',
    descriptionEn:
      'Specialized Korean language center with native & Korea-educated instructors, weekly TOPIK mocks, cultural clubs, and GKS scholarship admissions guidance.',
    facilities: ['speaking_club', 'mock_exam_hall', 'library', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['sejong', 'topik', 'korea', 'koreys tili'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'TOPIK Level 6 · Native Korean Teachers',
    branches: [
      { nameUz: 'Yakkasaroy filiali', nameRu: 'Филиал Яккасарай', nameEn: 'Yakkasaroy Branch', cityId: 'tashkent', districtId: 'yakkasaroy', street: "Nukus ko'chasi, 71", landmarkUz: 'Toshkent Janubiy / Yakkasaroy', landmarkRu: 'Ул. Нукус, 71', landmarkEn: '71 Nukus St, Yakkasaroy' },
    ],
  },
  {
    name: 'Deutsch Zentrum Tashkent',
    slug: 'deutsch-zentrum-tashkent',
    cityId: 'tashkent',
    districtId: 'mirobod',
    subjects: ['german', 'cefr'],
    exam: 'Goethe B2',
    avgScore: 88,
    successRate: 86,
    price: 1120000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 71 254 02 10',
    telegram: '@deutsch_tashkent',
    instagram: '@deutsch_tashkent',
    website: 'https://t.me/deutsch_tashkent',
    taglineUz: 'Nemis tili A1–C1, Goethe / TestDaF imtihonlari, Ausbildung va Germaniyada o‘qish',
    taglineRu: 'Немецкий язык A1–C1, экзамены Goethe/TestDaF, Ausbildung и учёба в Германии',
    taglineEn: 'German A1–C1, Goethe/TestDaF certification & Ausbildung / Studienkolleg advising',
    descriptionUz:
      "Deutsch Zentrum Tashkent — nemis tili A1 dan C1 darajagacha, Goethe-Zertifikat, TestDaF va Germaniyada Ausbildung hamda Studienkolleg dasturlariga tayyorlovchi ixtisoslashgan markaz.",
    descriptionRu:
      'Deutsch Zentrum Tashkent — профильный центр немецкого языка от A1 до C1 с подготовкой к Goethe-Zertifikat, TestDaF, программам Ausbildung и Studienkolleg.',
    descriptionEn:
      'Specialized German language academy preparing students for Goethe-Zertifikat, TestDaF, and German Ausbildung / Studienkolleg university pathways.',
    facilities: ['mock_exam_hall', 'speaking_club', 'library', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['german', 'nemis tili', 'goethe', 'ausbildung', 'testdaf'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'Goethe C2 · DaF Certified Instructors',
    branches: [
      { nameUz: 'Mirobod (Oybek) filiali', nameRu: 'Филиал Мирабад (Ойбек)', nameEn: 'Mirobod Branch', cityId: 'tashkent', districtId: 'mirobod', street: "Shahrisabz ko'chasi, 31", landmarkUz: 'Oybek metro bekati yaqinida', landmarkRu: 'Рядом с метро Ойбек', landmarkEn: 'Near Oybek Metro' },
    ],
  },
  {
    name: 'Confucius Silk Road Chinese Center',
    slug: 'confucius-silk-road-chinese',
    cityId: 'tashkent',
    districtId: 'yunusobod',
    subjects: ['chinese', 'english'],
    exam: 'HSK 4–5',
    avgScore: 89,
    successRate: 84,
    price: 1020000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2016,
    phone: '+998 71 233 98 12',
    telegram: '@confucius_tashkent',
    instagram: '@confucius.tashkent',
    website: 'https://t.me/confucius_tashkent',
    taglineUz: 'Xitoy tili HSK 1–6, biznes xitoy tili va Xitoy universitetlariga CSC grantlari',
    taglineRu: 'Китайский язык HSK 1–6, деловой китайский и гранты CSC в вузы Китая',
    taglineEn: 'Mandarin Chinese HSK 1–6, Business Chinese & CSC China scholarship guidance',
    descriptionUz:
      "Confucius Silk Road Center — xitoy tilini noldan HSK 6 darajagacha o'rgatuvchi, Xitoy oliygohlari CSC grantlariga tayyorlovchi va xitoylik ustozlar bilan suhbat klublariga ega markaz.",
    descriptionRu:
      'Центр китайского языка с подготовкой к HSK 1–6, практикой иероглифики, разговорными клубами с носителями и сопровождением по грантам CSC.',
    descriptionEn:
      'Mandarin Chinese academy offering HSK 1–6 preparation, native speaker conversation clubs, and CSC scholarship admission support.',
    facilities: ['speaking_club', 'library', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['chinese', 'xitoy tili', 'hsk', 'confucius'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'HSK 6 · Native Mandarin Instructors',
    branches: [
      { nameUz: 'Yunusobod (Bodomzor) filiali', nameRu: 'Филиал Юнусабад (Бодомзор)', nameEn: 'Bodomzor Branch', cityId: 'tashkent', districtId: 'yunusobod', street: "Amir Temur shoh ko'chasi, 95", landmarkUz: 'Bodomzor metro bekati', landmarkRu: 'Метро Бодомзор', landmarkEn: 'Bodomzor Metro' },
    ],
  },
  {
    name: 'Uchtepa Smart Kids & Mental Academy',
    slug: 'uchtepa-smart-kids',
    cityId: 'tashkent',
    districtId: 'uchtepa',
    subjects: ['kids', 'mental-math', 'english', 'arts'],
    exam: 'CEFR Kids',
    avgScore: 91,
    successRate: 92,
    price: 720000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2019,
    phone: '+998 71 275 44 10',
    telegram: '@smartkids_tashkent',
    instagram: '@smartkids.uz',
    website: 'https://t.me/smartkids_tashkent',
    taglineUz: '5–13 yoshli bolalar uchun ingliz tili, mental arifmetika, rasm va maktabga tayyorlov',
    taglineRu: 'Английский, ментальная арифметика, рисование и подготовка к школе для детей 5–13 лет',
    taglineEn: 'Safe, engaging English, Mental Math, Arts & school readiness for kids ages 5–13',
    descriptionUz:
      "Uchtepa Smart Kids — kichik yoshdagi bolalar uchun interaktiv o'yin uslubidagi ingliz tili, mental arifmetika, rassomlik va boshlang'ich sinf darslariga ko'maklashuvchi oilaviy markaz.",
    descriptionRu:
      'Семейный детский центр на Учтепе с игровым английским, ментальной арифметикой, изостудией и уютной зоной ожидания для родителей.',
    descriptionEn:
      'Family-friendly kids center offering playful English, mental arithmetic, art workshops, and parent waiting lounge in Uchtepa.',
    facilities: ['library', 'ac_classrooms', 'cafe_water', 'wifi', 'parking'],
    aliases: ['smart kids', 'bolalar', 'kids', 'rassomlik'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'Certified Child Pedagogues',
    branches: [
      { nameUz: 'Uchtepa filiali', nameRu: 'Филиал Учтепа', nameEn: 'Uchtepa Branch', cityId: 'tashkent', districtId: 'uchtepa', street: "Lutfiy ko'chasi, 52", landmarkUz: 'Farhod bozori yaqinida', landmarkRu: 'Рядом с Фархадским рынком', landmarkEn: 'Near Farhod Bazaar' },
    ],
  },
  {
    name: 'Russkiy Dom Language Hub',
    slug: 'russkiy-dom-tashkent',
    cityId: 'tashkent',
    districtId: 'shayxontohur',
    subjects: ['russian', 'english', 'kids'],
    exam: 'TRKI B2',
    avgScore: 87,
    successRate: 86,
    price: 710000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.FREE,
    foundedYear: 2017,
    phone: '+998 71 244 82 15',
    telegram: '@russkiydom_lc',
    instagram: '@russkiydom.uz',
    website: 'https://t.me/russkiydom_lc',
    taglineUz: 'Rus tili jonli muloqot, grammatika, biznes rus tili va maktab o‘quvchilari uchun',
    taglineRu: 'Разговорный русский, грамматика, деловой русский и подготовка школьников',
    taglineEn: 'Conversational Russian, grammar mastery, business Russian & youth courses',
    descriptionUz:
      "Russkiy Dom Language Hub — rus tilida erkin so'zlashish va grammatikani tez o'zlashtirishga yo'naltirilgan o'quv markazi. Har shanba jonli rus tili suhbat klubi va kichik guruhlarda amaliy mashg'ulotlar olib boriladi.",
    descriptionRu:
      'Центр разговорного и академического русского языка с субботними разговорными клубами, мини-группами и опытными филологами.',
    descriptionEn:
      'Dedicated Russian language center focused on rapid speaking fluency, grammar accuracy, and Saturday conversation clubs.',
    facilities: ['speaking_club', 'library', 'ac_classrooms', 'wifi', 'parking'],
    aliases: ['rus tili', 'russian', 'trki'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE],
    certHighlight: 'Master Philologists · TRKI Examiners',
    branches: [
      { nameUz: 'Shayxontohur filiali', nameRu: 'Филиал Шайхантахур', nameEn: 'Shayxontohur Branch', cityId: 'tashkent', districtId: 'shayxontohur', street: "Navoiy shoh ko'chasi, 40", landmarkUz: 'Alisher Navoiy metro', landmarkRu: 'Метро Алишера Навои', landmarkEn: 'Alisher Navoiy Metro' },
    ],
  },
  {
    name: 'Sergeli Tech & IELTS Academy',
    slug: 'sergeli-tech-ielts',
    cityId: 'tashkent',
    districtId: 'sergeli',
    subjects: ['ielts', 'english', 'web', 'dtm', 'kids'],
    exam: 'IELTS',
    avgScore: 6.9,
    successRate: 82,
    price: 730000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2019,
    phone: '+998 71 258 90 12',
    telegram: '@sergeli_academy',
    instagram: '@sergeli.academy',
    website: 'https://t.me/sergeli_academy',
    taglineUz: 'Sergeli tumanidagi zamonaviy IELTS, IT dasturlash va DTM tayyorlov markazi',
    taglineRu: 'Современный центр IELTS, IT-программирования и ДТМ в Сергелийском районе',
    taglineEn: 'Modern neighborhood IELTS, IT coding & DTM academy right in Sergeli',
    descriptionUz:
      "Sergeli Tech & IELTS Academy — Sergeli aholisi uchun shahar markaziga qatnamasdan sifatli IELTS, Web dasturlash va DTM fanlarini o'rganish imkonini beruvchi zamonaviy markaz.",
    descriptionRu:
      'Учебный центр в Сергели с современными классами, компьютерной лабораторией и сильной подготовкой по IELTS, веб-разработке и ДТМ.',
    descriptionEn:
      'Bringing city-center quality IELTS, web development, and DTM coaching directly to Sergeli with computer labs and weekly mock tests.',
    facilities: ['computer_lab', 'mock_exam_hall', 'speaking_club', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['sergeli', 'sergeli ielts', 'sergeli it'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0 · Full-stack Mentors',
    branches: [
      { nameUz: 'Yangi Sergeli filiali', nameRu: 'Филиал Янги Сергели', nameEn: 'Yangi Sergeli Branch', cityId: 'tashkent', districtId: 'sergeli', street: "Yangi Sergeli ko'chasi, 28", landmarkUz: 'Sergeli-5 metro bekati yaqinida', landmarkRu: 'Рядом с метро Сергели-5', landmarkEn: 'Near Sergeli-5 Metro' },
    ],
  },
  {
    name: 'Toshkent FinPro & ACCA School',
    slug: 'toshkent-finpro-school',
    cityId: 'tashkent',
    districtId: 'yakkasaroy',
    subjects: ['accounting', 'math', 'russian'],
    exam: 'ACCA / 1C',
    avgScore: 86,
    successRate: 85,
    price: 1240000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2018,
    phone: '+998 71 255 60 20',
    telegram: '@finpro_uz',
    instagram: '@finpro.tashkent',
    website: 'https://t.me/finpro_uz',
    taglineUz: '1C Buxgalteriya, soliq hisobi, MHXS (IFRS) va ACCA F3 amaliy kurslari',
    taglineRu: 'Практическая бухгалтерия 1С, налоги Узбекистана, МСФО и ACCA F3',
    taglineEn: 'Hands-on 1C Accounting, Uzbekistan Tax Law, IFRS & ACCA F3 training',
    descriptionUz:
      "Toshkent FinPro School — boshlang'ich va amaliyotchi buxgalterlar uchun 1C 8.3, O'zbekiston soliq qonunchiligi, MHXS va ACCA asoslari bo'yicha kompyuterda real hujjatlar bilan ishlaydigan markaz.",
    descriptionRu:
      'Практическая школа бухгалтерии и финансов: работа с реальной базой 1С 8.3, налоговая отчётность РУз, МСФО и подготовка к ACCA.',
    descriptionEn:
      'Hands-on accounting and finance school training students on live 1C 8.3 systems, Uzbekistan tax reporting, IFRS, and ACCA foundations.',
    facilities: ['computer_lab', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['buxgalteriya', '1c', 'acca', 'finpro'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE],
    certHighlight: 'Chief Accountants · ACCA DipIFR',
    branches: [
      { nameUz: 'Yakkasaroy filiali', nameRu: 'Филиал Яккасарай', nameEn: 'Yakkasaroy Branch', cityId: 'tashkent', districtId: 'yakkasaroy', street: "Bobur ko'chasi, 40", landmarkUz: 'Yakkasaroy tumani markazi', landmarkRu: 'Центр Яккасарайского района', landmarkEn: 'Central Yakkasaroy' },
    ],
  },
  {
    name: 'Yakkasaroy Art & UX Design Studio',
    slug: 'yakkasaroy-design-studio',
    cityId: 'tashkent',
    districtId: 'yakkasaroy',
    subjects: ['design', 'arts', 'web'],
    exam: 'Portfolio',
    avgScore: 91,
    successRate: 84,
    price: 1390000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2020,
    phone: '+998 71 253 19 40',
    telegram: '@uzdesign_studio',
    instagram: '@uzdesign.studio',
    website: 'https://t.me/uzdesign_studio',
    taglineUz: 'Figma UI/UX dizayn, grafik dizayn, motion va akademik rasm studiyasi',
    taglineRu: 'Студия UI/UX дизайна в Figma, графического дизайна, motion и академического рисунка',
    taglineEn: 'Figma UI/UX, Graphic Design, Motion & Fine Arts studio with portfolio reviews',
    descriptionUz:
      "Yakkasaroy Art & UX Design Studio — Figma, Adobe Creative Cloud, brending va akademik rassomlik bo'yicha real mijoz loyihalari asosida portfel yaratuvchi ijodiy markaz.",
    descriptionRu:
      'Творческая студия дизайна и искусства в Яккасарае: обучение Figma, брендингу, motion-дизайну и рисунку на реальных брифах.',
    descriptionEn:
      'Creative studio focusing on Figma UI/UX, branding, motion graphics, and fine arts with real-brief portfolio mentorship.',
    facilities: ['computer_lab', 'coworking', 'wifi', 'ac_classrooms', 'cafe_water'],
    aliases: ['figma', 'ui ux', 'design', 'dizayn', 'rassomlik'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Senior Product Designers · Art Directors',
    branches: [
      { nameUz: 'Yakkasaroy Studiyasi', nameRu: 'Студия Яккасарай', nameEn: 'Yakkasaroy Studio', cityId: 'tashkent', districtId: 'yakkasaroy', street: "Shota Rustaveli ko'chasi, 22", landmarkUz: 'Grand Mir mehmonxonasi yaqinida', landmarkRu: 'Рядом с отелем Grand Mir', landmarkEn: 'Near Grand Mir Hotel' },
    ],
  },
  {
    name: 'Cambridge Samarqand',
    slug: 'cambridge-samarkand',
    cityId: 'samarkand',
    districtId: 'registon',
    subjects: ['ielts', 'english', 'cefr', 'kids'],
    exam: 'IELTS',
    avgScore: 7.2,
    successRate: 88,
    price: 890000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2021,
    phone: '+998 78 777 77 74',
    telegram: '@cambridge_samarkand',
    instagram: '@cambridge_learning_center',
    website: 'https://cambridgeonline.uz',
    taglineUz: 'Cambridge Learning Centre Samarqand filiali · Kovorking, Academic Support va Speaking Club',
    taglineRu: 'Филиал Cambridge Learning Centre в Самарканде · Коворкинг, Academic Support и Speaking Club',
    taglineEn: 'Cambridge Learning Centre Samarkand · Coworking, Academic Support & Sunday Speaking Clubs',
    descriptionUz:
      "Cambridge Learning Centre ning Samarqand shahridagi rasmiy filiali — Toshkent standartidagi IELTS va General English dasturlari, zamonaviy kovorking hududi, yordamchi ustozlar (Academic Support) va yakshanba tadbirlari.",
    descriptionRu:
      'Официальный филиал Cambridge Learning Centre в Самарканде с полным набором стандартов сети: коворкинг, Academic Support, приложение и воскресные Speaking Club.',
    descriptionEn:
      'Official Samarkand branch of Cambridge Learning Centre bringing full network standards: coworking lounge, dual-instructor Academic Support, Cambridge App, and Sunday Speaking Clubs.',
    facilities: ['coworking', 'academic_support', 'speaking_club', 'student_app', 'mock_exam_hall', 'library', 'wifi', 'ac_classrooms', 'cafe_water'],
    aliases: ['cambridge samarkand', 'samarqand cambridge', 'samarqand ielts'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–8.5 · Cambridge Certified',
    branches: [
      { nameUz: 'Samarqand Markaz filiali', nameRu: 'Филиал Самарканд Центр', nameEn: 'Samarkand Center Branch', cityId: 'samarkand', districtId: 'registon', street: "Mirzo Ulug'bek ko'chasi, 40", landmarkUz: 'Samarqand shahar markazi', landmarkRu: 'Центр Самарканда', landmarkEn: 'Central Samarkand' },
    ],
  },
  {
    name: 'Registon Samarqand',
    slug: 'registon-samarkand',
    cityId: 'samarkand',
    districtId: 'registon',
    subjects: ['dtm', 'ielts', 'math', 'biology', 'chemistry', 'english'],
    exam: 'DTM',
    avgScore: 170,
    successRate: 88,
    price: 680000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2019,
    phone: '+998 66 233 27 00',
    telegram: '@registon_samarkand',
    instagram: '@registon_lc',
    website: 'https://rgn.uz',
    taglineUz: 'Samarqandda DTM, IELTS va olimpiada fanlari · Oylik blok-testlar va grantlar',
    taglineRu: 'Филиал «Регистан» в Самарканде · ДТМ, IELTS, ежемесячные блок-тесты и гранты',
    taglineEn: 'Registon Samarkand · DTM entrance prep, IELTS, monthly mock exams & grants',
    descriptionUz:
      "Registon o'quv markazining Samarqanddagi yetakchi filiali — SamDU, SamDTU va Toshkent OTMlariga kirish uchun barcha DTM fanlari, IELTS/CEFR hamda oylik natijalar reytingi.",
    descriptionRu:
      'Крупный филиал сети «Регистан» в Самарканде для подготовки к поступлению в СамГУ, СамГМУ и столичные вузы по ДТМ и IELTS.',
    descriptionEn:
      'Registon’s Samarkand hub preparing applicants for SamSU, SamSMU, and national universities across all DTM subjects and IELTS.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'student_app', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['registon samarkand', 'samarqand registon', 'samarqand dtm'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'DTM Experts · IELTS 8.0',
    branches: [
      { nameUz: 'Universitet Xiyoboni filiali', nameRu: 'Филиал Университетский бульвар', nameEn: 'University Blvd Branch', cityId: 'samarkand', districtId: 'registon', street: 'Universitet xiyoboni, 12', landmarkUz: 'SamDU yaqinida', landmarkRu: 'Рядом с СамГУ', landmarkEn: 'Near Samarkand State University' },
    ],
  },
  {
    name: 'Samarqand IT Park & Coding Guild',
    slug: 'samarkand-it-guild',
    cityId: 'samarkand',
    districtId: 'sogdiana',
    subjects: ['web', 'python', 'design', 'data'],
    exam: 'IT Portfolio',
    avgScore: 89,
    successRate: 81,
    price: 890000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2020,
    phone: '+998 66 239 45 10',
    telegram: '@samarkand_it_hub',
    instagram: '@samarkand.ithub',
    website: 'https://it-park.uz',
    taglineUz: 'Samarqandda Web dasturlash, Python, grafik dizayn va frilans karyera markazi',
    taglineRu: 'Веб-разработка, Python, дизайн и фриланс-карьера в Самарканде',
    taglineEn: 'Web development, Python, graphic design & freelance career training in Samarkand',
    descriptionUz:
      "Samarqand IT Park & Coding Guild — Samarqand yoshlari uchun zamonaviy kompyuter xonalari, kovorking, Web/Python dasturlash va xalqaro frilans bozoriga chiqish kurslari.",
    descriptionRu:
      'IT-центр в Самарканде с современными компьютерными классами, коворкингом и курсами по веб-разработке, Python и дизайну.',
    descriptionEn:
      'Modern Samarkand coding hub offering computer labs, coworking, Web/Python tracks, and freelance career mentoring.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms'],
    aliases: ['samarqand it', 'samarkand coding', 'it park samarkand'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Certified Mentors',
    branches: [
      { nameUz: "So'g'diyona IT markazi", nameRu: 'IT-центр Согдиана', nameEn: 'Sogdiana IT Hub', cityId: 'samarkand', districtId: 'sogdiana', street: "So'g'diyona massivi, 14", landmarkUz: "So'g'diyona markazi", landmarkRu: 'Массив Согдиана', landmarkEn: 'Sogdiana District' },
    ],
  },
  {
    name: "Buxoro Qorako'l Ziyo & IELTS",
    slug: 'buxoro-qorakol-ziyo',
    cityId: 'bukhara',
    districtId: 'buxoro-markaz',
    subjects: ['math', 'physics', 'dtm', 'ielts', 'chemistry'],
    exam: 'DTM',
    avgScore: 175,
    successRate: 92,
    price: 640000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 65 224 18 18',
    telegram: '@qorakolziyo_buxoro',
    instagram: '@qorakol_buxoro',
    website: 'https://t.me/qorakolziyo',
    taglineUz: "Buxoroda Qorako'l matematika-fizika maktabi, olimpiada va kuchli IELTS tayyorlov",
    taglineRu: 'Каракульская школа математики и физики, олимпиады, ДТМ и IELTS в Бухаре',
    taglineEn: 'Bukhara’s flagship Qorakol Math/Physics Olympiad, DTM & IELTS academy',
    descriptionUz:
      "Buxoro Qorako'l Ziyo — Buxoro viloyatidagi matematika, fizika, kimyo va IELTS bo'yicha eng yuqori grant ko'rsatkichiga ega o'quv markazi. Oylik sinov imtihonlari va kutubxona mavjud.",
    descriptionRu:
      'Флагманский учебный центр Бухары по математике, физике, ДТМ и IELTS с высоким процентом поступления на бюджет и регулярными пробными экзаменами.',
    descriptionEn:
      'Bukhara’s top-performing Math, Physics, DTM, and IELTS academy with rigorous testing and high university scholarship admission rates.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'ac_classrooms', 'wifi', 'parking'],
    aliases: ['buxoro', 'bukhara', 'buxoro qorakol', 'buxoro ielts'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'Qorakol Math Masters · IELTS 8.0',
    branches: [
      { nameUz: 'Buxoro Shahar Markazi', nameRu: 'Бухара Центр города', nameEn: 'Bukhara City Center', cityId: 'bukhara', districtId: 'buxoro-markaz', street: "Bahouddin Naqshband ko'chasi, 110", landmarkUz: 'Buxoro markaziy ko‘chasi', landmarkRu: 'Центральный проспект Бухары', landmarkEn: 'Central Bukhara Avenue' },
    ],
  },
  {
    name: "Buxoro Sharq Ta'lim & Korean",
    slug: 'buxoro-sharq-talim',
    cityId: 'bukhara',
    districtId: 'buxoro-markaz',
    subjects: ['ielts', 'cefr', 'korean', 'english', 'russian'],
    exam: 'IELTS',
    avgScore: 6.9,
    successRate: 83,
    price: 620000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2018,
    phone: '+998 65 223 41 20',
    telegram: '@buxoro_sharq_talim',
    instagram: '@sharqtalim.buxoro',
    website: 'https://t.me/buxoro_sharq_talim',
    taglineUz: 'Buxoroda IELTS, CEFR, Koreys tili (TOPIK) va zamonaviy Speaking Clublar',
    taglineRu: 'IELTS, CEFR, корейский язык (TOPIK) и Speaking Club в Бухаре',
    taglineEn: 'IELTS, CEFR, Korean (TOPIK) & weekend Speaking Clubs in Bukhara',
    descriptionUz:
      "Buxoro Sharq Ta'lim — xorijiy tillar (Ingliz, Koreys, Rus) va IELTS/TOPIK sertifikatlariga tayyorlovchi zamonaviy markaz.",
    descriptionRu:
      'Современный языковой центр в Бухаре с курсами английского (IELTS/CEFR), корейского (TOPIK) и русского языков.',
    descriptionEn:
      'Bukhara multilingual center specializing in IELTS, CEFR, Korean TOPIK, and weekly conversation practice.',
    facilities: ['speaking_club', 'mock_exam_hall', 'library', 'wifi', 'ac_classrooms'],
    aliases: ['buxoro sharq', 'buxoro topik', 'buxoro english'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'IELTS 8.0 · TOPIK 6',
    branches: [
      { nameUz: 'Buxoro Mustaqillik filiali', nameRu: 'Филиал Мустакиллик (Бухара)', nameEn: 'Mustaqillik Branch', cityId: 'bukhara', districtId: 'buxoro-markaz', street: "Mustaqillik ko'chasi, 19", landmarkUz: 'BuxDU yaqinida', landmarkRu: 'Рядом с БухГУ', landmarkEn: 'Near Bukhara State University' },
    ],
  },
  {
    name: 'Inter Nation Andijon',
    slug: 'inter-nation-andijon',
    cityId: 'andijan',
    districtId: 'andijon-markaz',
    subjects: ['ielts', 'english', 'cefr'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 86,
    price: 780000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2021,
    phone: '+998 78 777 77 07',
    telegram: '@internation_andijan',
    instagram: '@internation.uz',
    website: 'https://inter-nation.uz',
    taglineUz: 'Inter Nation English School Andijon filiali · Oxford dasturi, kovorking va Speaking Club',
    taglineRu: 'Филиал Inter Nation в Андижане · Программа Oxford, коворкинг и Speaking Club',
    taglineEn: 'Inter Nation Andijan · Oxford curriculum, Academic Support, coworking & Student App',
    descriptionUz:
      "Inter Nation English School ning Andijondagi rasmiy filiali — poytaxt standartidagi Oxford dasturi, Academic Support, mobil ilova va haftalik Mock IELTS imtihonlari.",
    descriptionRu:
      'Официальный филиал Inter Nation English School в Андижане: обучение по программе Oxford, Academic Support, коворкинг и воскресные Speaking Club.',
    descriptionEn:
      'Official Andijan campus of Inter Nation English School with Oxford materials, coworking desks, student app, and Sunday Speaking Clubs.',
    facilities: ['coworking', 'academic_support', 'speaking_club', 'student_app', 'mock_exam_hall', 'wifi', 'ac_classrooms', 'cafe_water'],
    aliases: ['andijon inter nation', 'andijan english', 'andijon ielts'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · Oxford Certified',
    branches: [
      { nameUz: 'Andijon Bobur shoh filiali', nameRu: 'Филиал Андижан (пр. Бабура)', nameEn: 'Andijan Babur Ave Branch', cityId: 'andijan', districtId: 'andijon-markaz', street: "Bobur shoh ko'chasi, 73", landmarkUz: 'Andijon markazi', landmarkRu: 'Центр Андижана', landmarkEn: 'Central Andijan' },
    ],
  },
  {
    name: 'Andijon Vector STEM & DTM',
    slug: 'andijon-vector-center',
    cityId: 'andijan',
    districtId: 'andijon-markaz',
    subjects: ['math', 'physics', 'dtm', 'ielts'],
    exam: 'DTM',
    avgScore: 168,
    successRate: 85,
    price: 590000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.FREE,
    foundedYear: 2017,
    phone: '+998 74 228 45 10',
    telegram: '@andijon_vector',
    instagram: '@vector.andijon',
    website: 'https://t.me/andijon_vector',
    taglineUz: 'Andijonda DTM matematika, fizika, IELTS va oylik bepul diagnostik testlar',
    taglineRu: 'Математика, физика, ДТМ и IELTS в Андижане с ежемесячной диагностикой',
    taglineEn: 'Andijan DTM Math, Physics & IELTS prep with monthly diagnostic mock exams',
    descriptionUz:
      "Andijon Vector Center — aniq fanlar va abituriyentlar tayyorlovi bo'yicha Andijonning ishonchli markazi. Ota-onalarga haftalik SMS/Telegram hisobotlar yuboriladi.",
    descriptionRu:
      'Учебный центр точных наук и подготовки к ДТМ в Андижане с регулярными пробными тестами и отчётами для родителей.',
    descriptionEn:
      'Trusted Andijan STEM & DTM coaching center offering weekly mock exams and parent progress notifications.',
    facilities: ['mock_exam_hall', 'library', 'ac_classrooms', 'wifi', 'parking'],
    aliases: ['andijon dtm', 'andijon math', 'vector'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'DTM Master Instructors',
    branches: [
      { nameUz: 'Andijon Markaz', nameRu: 'Андижан Центр', nameEn: 'Andijan Center', cityId: 'andijan', districtId: 'andijon-markaz', street: "Mashrab ko'chasi, 24", landmarkUz: 'ADU yaqinida', landmarkRu: 'Рядом с АнГУ', landmarkEn: 'Near Andijan State University' },
    ],
  },
  {
    name: "Najot Ta'lim Farg'ona",
    slug: 'najot-talim-fergana',
    cityId: 'fergana',
    districtId: 'fargona-markaz',
    subjects: ['web', 'python', 'design', 'data'],
    exam: 'IT Portfolio',
    avgScore: 91,
    successRate: 84,
    price: 1250000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2022,
    phone: '+998 78 888 98 88',
    telegram: '@najottalim_fergana',
    instagram: '@najottalim',
    website: 'https://najottalim.uz',
    taglineUz: "Farg'ona vodiysidagi Najot Ta'lim filiali · Dasturlash, dizayn va zamonaviy kovorking",
    taglineRu: 'Филиал Najot Ta’lim в Фергане · Программирование, дизайн и коворкинг',
    taglineEn: 'Najot Ta’lim Fergana · Coding & design bootcamps, computer labs & coworking',
    descriptionUz:
      "Najot Ta'lim Farg'ona filiali — Farg'ona vodiysi yoshlari uchun Full-stack dasturlash, Python, Grafik dizayn, SMM kurslari, kuchli kompyuter xonalari va kovorking markazi.",
    descriptionRu:
      'Ферганский филиал Najot Ta’lim с современными компьютерными классами, коворкингом и практическим обучением программированию и дизайну.',
    descriptionEn:
      'Najot Ta’lim’s Fergana Valley campus bringing full-stack coding, Python, design bootcamps, computer labs, and coworking to Fergana.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['fargona it', 'fergana najot', 'najot fargona'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Najot Ta’lim Certified Mentors',
    branches: [
      { nameUz: "Farg'ona Markaz filiali", nameRu: 'Филиал Фергана Центр', nameEn: 'Fergana Central Campus', cityId: 'fergana', districtId: 'fargona-markaz', street: "Mustaqillik ko'chasi, 22", landmarkUz: "Farg'ona shahar markazi", landmarkRu: 'Центр Ферганы', landmarkEn: 'Central Fergana' },
    ],
  },
  {
    name: "Cambridge Farg'ona",
    slug: 'cambridge-fergana',
    cityId: 'fergana',
    districtId: 'fargona-markaz',
    subjects: ['ielts', 'english', 'cefr', 'kids'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 86,
    price: 820000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2022,
    phone: '+998 78 777 77 74',
    telegram: '@cambridge_fergana',
    instagram: '@cambridge_learning_center',
    website: 'https://cambridgeonline.uz',
    taglineUz: "Cambridge Learning Centre Farg'ona · Academic Support, kovorking va IELTS mocklar",
    taglineRu: 'Филиал Cambridge Learning Centre в Фергане · Academic Support, коворкинг и IELTS',
    taglineEn: 'Cambridge Learning Centre Fergana · Academic Support, coworking & Sunday clubs',
    descriptionUz:
      "Cambridge Learning Centre ning Farg'ona filiali — Toshkentdagi kabi Academic Support, Cambridge ilovasi, kovorking va haftalik Speaking Club dasturlari bilan ishlaydi.",
    descriptionRu:
      'Официальный филиал Cambridge Learning Centre в Фергане с системой Academic Support, коворкингом и воскресными разговорными клубами.',
    descriptionEn:
      'Official Fergana branch of Cambridge Learning Centre offering dual-instructor Academic Support, coworking, and IELTS mock labs.',
    facilities: ['coworking', 'academic_support', 'speaking_club', 'student_app', 'mock_exam_hall', 'wifi', 'ac_classrooms'],
    aliases: ['fargona cambridge', 'fergana ielts', 'cambridge fergana'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · Cambridge Trainers',
    branches: [
      { nameUz: "Farg'ona Markaz", nameRu: 'Фергана Центр', nameEn: 'Fergana Center', cityId: 'fergana', districtId: 'fargona-markaz', street: "Sayilgoh ko'chasi, 15", landmarkUz: "Farg'ona Markaziy park yaqinida", landmarkRu: 'Рядом с Центральным парком', landmarkEn: 'Near Central Park Fergana' },
    ],
  },
  {
    name: 'Namangan Registon & IELTS',
    slug: 'namangan-registon',
    cityId: 'namangan',
    districtId: 'namangan-markaz',
    subjects: ['dtm', 'ielts', 'english', 'math', 'kids'],
    exam: 'IELTS',
    avgScore: 6.9,
    successRate: 84,
    price: 610000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 69 227 27 00',
    telegram: '@registon_namangan',
    instagram: '@registon_lc',
    website: 'https://rgn.uz',
    taglineUz: 'Namanganda Registon metodikasi · DTM, IELTS, matematika va iqtidorli bolalar kurslari',
    taglineRu: 'Методика «Регистан» в Намангане · ДТМ, IELTS, математика и детские группы',
    taglineEn: 'Registon Namangan · DTM entrance prep, IELTS, Math & youth enrichment',
    descriptionUz:
      "Namangan Registon — Namangan shahridagi eng yirik abituriyent va ingliz tili o'quv markazi. Oylik sinov testlari, grantlar va ota-onalar uchun shaffof natija kuzatuvi mavjud.",
    descriptionRu:
      'Крупный центр подготовки к ДТМ и IELTS в Намангане с ежемесячными пробными тестами и стипендиальными скидками.',
    descriptionEn:
      'Namangan’s leading DTM & IELTS academy delivering monthly diagnostic exams, merit scholarships, and structured parent reporting.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'speaking_club', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['namangan', 'namangan registon', 'namangan ielts', 'namangan dtm'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'DTM & IELTS 8.0 Instructors',
    branches: [
      { nameUz: 'Namangan Markaz filiali', nameRu: 'Филиал Наманган Центр', nameEn: 'Namangan Center Branch', cityId: 'namangan', districtId: 'namangan-markaz', street: "Alisher Navoiy ko'chasi, 54", landmarkUz: 'Namangan shahar markazi', landmarkRu: 'Центр Намангана', landmarkEn: 'Central Namangan' },
    ],
  },
  {
    name: 'Nukus IT Park & IELTS Hub',
    slug: 'nukus-it-park-ielts',
    cityId: 'nukus',
    districtId: 'nukus-markaz',
    subjects: ['ielts', 'web', 'python', 'dtm', 'english', 'russian'],
    exam: 'IELTS',
    avgScore: 6.8,
    successRate: 82,
    price: 580000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 61 222 40 40',
    telegram: '@itpark_nukus',
    instagram: '@itpark.nukus',
    website: 'https://it-park.uz',
    taglineUz: 'Nukusda IT dasturlash, IELTS, DTM va zamonaviy kovorking ekotizimi',
    taglineRu: 'IT-программирование, IELTS, ДТМ и современный коворкинг в Нукусе',
    taglineEn: 'Nukus hub for IT coding, IELTS, DTM preparation & coworking',
    descriptionUz:
      "Nukus IT Park & IELTS Hub — Qoraqalpog'iston yoshlari uchun zamonaviy kompyuter xonalari, kovorking, Web/Python dasturlash hamda IELTS va DTM tayyorlov kurslarini jamlagan markaz.",
    descriptionRu:
      'Современный образовательный и IT-хаб в Нукусе с компьютерными классами, коворкингом, курсами программирования, IELTS и ДТМ.',
    descriptionEn:
      'Karakalpakstan’s modern learning & IT hub combining computer labs, coworking, Python/Web tracks, IELTS, and DTM exam prep.',
    facilities: ['computer_lab', 'coworking', 'mock_exam_hall', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['nukus', 'qoraqalpogiston', 'nukus it', 'nukus ielts'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Mentors · IELTS 7.5–8.0',
    branches: [
      { nameUz: 'Nukus Markaz filiali', nameRu: 'Филиал Нукус Центр', nameEn: 'Nukus Center Branch', cityId: 'nukus', districtId: 'nukus-markaz', street: "Do'stlik guzari, 16", landmarkUz: 'Nukus IT Park binosi', landmarkRu: 'Здание IT Park Нукус', landmarkEn: 'IT Park Nukus Building' },
    ],
  },
  // =========================================================================
  // ALL REMAINING UZBEKISTAN VILOYATLAR — REAL REGIONAL LEARNING CENTERS
  // =========================================================================
  {
    name: "Sabina's Academy Chirchiq",
    slug: 'sabinas-academy-chirchiq',
    cityId: 'tashkent-region',
    districtId: 'chirchiq',
    subjects: ['ielts', 'english', 'russian', 'kids'],
    exam: 'IELTS',
    avgScore: 7.0,
    successRate: 85,
    price: 580000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 99 840 15 00',
    telegram: '@sabinas_academy',
    instagram: '@sabinas.academy',
    website: 'https://sabinasacademy.uz',
    googleRating: 4.9,
    googleReviewCount: 340,
    totalGraduates: 4800,
    taglineUz: "Chirchiqdagi yetakchi ingliz tili, IELTS, rus tili va bolalar ta'lim akademiyasi",
    taglineRu: 'Ведущая академия английского, IELTS, русского и детских программ в Чирчике',
    taglineEn: 'Chirchik’s leading English, IELTS, Russian & youth education academy',
    descriptionUz:
      "Sabina's Academy — Toshkent viloyati Chirchiq shahridagi eng mashhur til va IELTS markazi. Kichik guruhlar, haftalik speaking club va ota-onalar uchun shaffof progress hisobotlari taqdim etiladi.",
    descriptionRu:
      "Sabina's Academy — ведущий центр английского языка и IELTS в Чирчике (Ташкентская область) с разговорными клубами и мини-группами.",
    descriptionEn:
      "Sabina's Academy is Chirchik's flagship English & IELTS center featuring small cohorts, weekly speaking clubs, and parent progress reports.",
    facilities: ['speaking_club', 'mock_exam_hall', 'library', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['sabina', 'chirchiq', 'toshkent viloyati', 'sabinasacademy'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0+ · Senior Regional Trainers',
    branches: [
      { nameUz: 'Chirchiq Markaz filiali', nameRu: 'Филиал Чирчик Центр', nameEn: 'Chirchik Central Branch', cityId: 'tashkent-region', districtId: 'chirchiq', street: "Amir Temur ko'chasi, 45", landmarkUz: 'Chirchiq markaziy xiyoboni', landmarkRu: 'Центральный проспект Чирчика', landmarkEn: 'Chirchik Central Avenue' },
    ],
  },
  {
    name: 'IT Park Chirchiq',
    slug: 'it-park-chirchiq',
    cityId: 'tashkent-region',
    districtId: 'chirchiq',
    subjects: ['web', 'python', 'design', 'kids'],
    exam: 'IT Portfolio',
    avgScore: 88,
    successRate: 83,
    price: 520000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 99 309 11 99',
    telegram: '@itpark_chirchiq',
    instagram: '@itpark.tashkentregion',
    website: 'https://it-park.uz',
    googleRating: 4.8,
    googleReviewCount: 280,
    totalGraduates: 3900,
    taglineUz: 'Toshkent viloyati IT Park filiali · Dasturlash, dizayn, kompyuter savodxonligi va IT-English',
    taglineRu: 'Филиал IT Park Ташкентской области · Программирование, дизайн и IT-English',
    taglineEn: 'Tashkent Region IT Park campus · Coding, UI/UX design & youth robotics',
    descriptionUz:
      "IT Park Chirchiq — Toshkent viloyati yoshlari uchun zamonaviy kompyuter laboratoriyalari, Web/Python dasturlash, grafik dizayn va kovorking maydonini taqdim etuvchi rasmiy IT ta'lim markazi.",
    descriptionRu:
      'Официальный учебный центр IT Park в Чирчике с современными компьютерными классами, курсами Web/Python и коворкингом.',
    descriptionEn:
      'Official IT Park learning campus in Chirchik offering modern computer labs, Web & Python bootcamps, graphic design, and coworking.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['it park chirchiq', 'toshkent viloyati it', 'chirchiq dasturlash'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Certified Mentors',
    branches: [
      { nameUz: 'Chirchiq IT Park kampusi', nameRu: 'Кампус IT Park Чирчик', nameEn: 'Chirchik IT Park Campus', cityId: 'tashkent-region', districtId: 'chirchiq', street: "Zakovat ko'chasi, 12", landmarkUz: 'Chirchiq Yoshlar markazi yonida', landmarkRu: 'Рядом с Молодёжным центром Чирчика', landmarkEn: 'Near Chirchik Youth Center' },
    ],
  },
  {
    name: 'Olmaliq DTM & IT Academy',
    slug: 'olmaliq-dtm-it-academy',
    cityId: 'tashkent-region',
    districtId: 'olmaliq',
    subjects: ['dtm', 'math', 'physics', 'ielts', 'web'],
    exam: 'DTM',
    avgScore: 168,
    successRate: 86,
    price: 490000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2018,
    phone: '+998 94 612 44 10',
    telegram: '@olmaliq_academy',
    instagram: '@olmaliq_academy',
    website: 'https://t.me/olmaliq_academy',
    googleRating: 4.8,
    googleReviewCount: 230,
    totalGraduates: 3400,
    taglineUz: 'Olmaliqda DTM matematika, fizika, kimyo, IELTS va IT dasturlash tayyorlovi',
    taglineRu: 'Подготовка к ДТМ по математике, физике, IELTS и IT в Алмалыке',
    taglineEn: 'Almalyk center for DTM Math, Physics, IELTS & IT coding',
    descriptionUz:
      "Olmaliq DTM & IT Academy — Olmaliq va Angren o'quvchilari uchun abituriyent fanlari, oylik DTM blok-testlari va IELTS/CEFR kurslarini birlashtirgan markaz.",
    descriptionRu:
      'Учебный центр в Алмалыке, объединяющий подготовку к ДТМ с ежемесячными блок-тестами, курсы IELTS и базовое программирование.',
    descriptionEn:
      'Multi-subject learning center in Almalyk offering monthly DTM diagnostic tests, STEM subjects, IELTS, and introductory IT tracks.',
    facilities: ['mock_exam_hall', 'library', 'computer_lab', 'wifi', 'ac_classrooms'],
    aliases: ['olmaliq', 'almalyk', 'angren', 'toshkent viloyati dtm'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'DTM Authors · Senior STEM Teachers',
    branches: [
      { nameUz: 'Olmaliq Markaz filiali', nameRu: 'Филиал Алмалык Центр', nameEn: 'Almalyk Central Branch', cityId: 'tashkent-region', districtId: 'olmaliq', street: "Amir Temur shoh ko'chasi, 28", landmarkUz: 'Olmaliq Metallurg madaniyat saroyi yonida', landmarkRu: 'Рядом с ДК Металлург', landmarkEn: 'Near Metallurg Palace' },
    ],
  },
  {
    name: "Education Express Qo'qon",
    slug: 'education-express-qoqon',
    cityId: 'fergana',
    districtId: 'qoqon',
    subjects: ['ielts', 'english', 'sat', 'math', 'dtm'],
    exam: 'IELTS',
    avgScore: 7.2,
    successRate: 88,
    price: 550000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 73 542 50 50',
    telegram: '@edukokand',
    instagram: '@edukokand.uz',
    website: 'https://edukokand.uz',
    googleRating: 4.9,
    googleReviewCount: 510,
    totalGraduates: 9800,
    taglineUz: "Qo'qonning eng yirik IELTS, SAT va DTM tayyorlov akademiyasi · Haftalik mock testlar",
    taglineRu: 'Крупнейшая академия IELTS, SAT и ДТМ в Коканде с еженедельными пробными экзаменами',
    taglineEn: 'Kokand’s flagship IELTS, SAT & DTM academy with weekly mock exams',
    descriptionUz:
      "Education Express (edukokand.uz) — Farg'ona vodiysi va Qo'qon shahridagi nufuzli til va imtihon markazi. IELTS 7.0–8.0, Digital SAT hamda DTM abituriyent yo'nalishlarida yuqori natijalar qayd etib kelmoqda.",
    descriptionRu:
      'Education Express (edukokand.uz) — ведущий образовательный центр Коканда, готовящий к IELTS 7.0–8.0, Digital SAT и поступлению по ДТМ.',
    descriptionEn:
      'Education Express (edukokand.uz) is Kokand’s leading IELTS, Digital SAT, and DTM exam academy with structured weekly mocks.',
    facilities: ['mock_exam_hall', 'speaking_club', 'library', 'academic_support', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['qoqon', 'kokand', 'edukokand', 'education express', 'fargona'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–8.5 · SAT 1450+',
    branches: [
      { nameUz: "Qo'qon Markaz filiali", nameRu: 'Филиал Коканд Центр', nameEn: 'Kokand Central Branch', cityId: 'fergana', districtId: 'qoqon', street: "Turon ko'chasi, 34", landmarkUz: "Qo'qon markaziy bog'i yonida", landmarkRu: 'Рядом с центральным парком Коканда', landmarkEn: 'Near Kokand Central Park' },
    ],
  },
  {
    name: "Grand Ta'lim Qo'qon & Marg'ilon",
    slug: 'grand-talim-fargona',
    cityId: 'fergana',
    districtId: 'margilon',
    subjects: ['english', 'ielts', 'russian', 'math', 'kids'],
    exam: 'IELTS',
    avgScore: 6.9,
    successRate: 84,
    price: 480000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.FREE,
    foundedYear: 2015,
    phone: '+998 73 253 88 88',
    telegram: '@grandtalim_vodiy',
    instagram: '@grandtalim.uz',
    website: 'https://grandtalim.uz',
    googleRating: 4.8,
    googleReviewCount: 420,
    totalGraduates: 11000,
    taglineUz: "Farg'ona vodiysida ingliz, rus va arab tillari hamda maktab fanlari tarmog'i",
    taglineRu: 'Сеть языковых и школьных программ в Ферганской долине (Маргилан, Коканд)',
    taglineEn: 'Fergana Valley multi-language & youth academy in Margilan and Kokand',
    descriptionUz:
      "Grand Ta'lim — Farg'ona, Marg'ilon va Qo'qon shaharlarida xorijiy tillar, IELTS, mental arifmetika va maktab o'quvchilari uchun zamonaviy dasturlarni taqdim etuvchi tajribali tarmoq.",
    descriptionRu:
      'Опытная образовательная сеть в Маргилане и Коканде по английскому, русскому языкам, IELTS и детским развивающим курсам.',
    descriptionEn:
      'Established language and youth education network across Margilan and Kokand offering English, Russian, IELTS, and school tracks.',
    facilities: ['library', 'speaking_club', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['grand talim', 'margilon', 'qoqon', 'fargona'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'Certified Language Specialists',
    branches: [
      { nameUz: "Marg'ilon filiali", nameRu: 'Филиал Маргилан', nameEn: 'Margilan Branch', cityId: 'fergana', districtId: 'margilon', street: "Mustaqillik ko'chasi, 118", landmarkUz: "Marg'ilon markazi", landmarkRu: 'Центр Маргилана', landmarkEn: 'Margilan Center' },
      { nameUz: "Qo'qon filiali", nameRu: 'Филиал Коканд', nameEn: 'Kokand Branch', cityId: 'fergana', districtId: 'qoqon', street: "Istiqlol ko'chasi, 19", landmarkUz: "Qo'qon savdo markazi", landmarkRu: 'Торговый центр Коканд', landmarkEn: 'Kokand Trade Center' },
    ],
  },
  {
    name: 'Level Up Qarshi',
    slug: 'level-up-qarshi',
    cityId: 'qashqadaryo',
    districtId: 'qarshi',
    subjects: ['ielts', 'english', 'sat', 'math', 'dtm'],
    exam: 'IELTS',
    avgScore: 7.2,
    successRate: 88,
    price: 540000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 75 221 70 70',
    telegram: '@levelup_qarshi',
    instagram: '@levelup.qarshi',
    website: 'https://level-up-karshi.uz',
    googleRating: 4.9,
    googleReviewCount: 620,
    totalGraduates: 11200,
    taglineUz: 'Qashqadaryodagi №1 IELTS, Digital SAT va DTM tayyorlov markazi · Kovorking va Mock zali',
    taglineRu: 'Ведущий центр IELTS, Digital SAT и ДТМ в Карши (Кашкадарья) · Коворкинг и Mock-зал',
    taglineEn: 'Kashkadarya’s premier IELTS, Digital SAT & DTM academy in Karshi',
    descriptionUz:
      "Level Up Qarshi (level-up-karshi.uz) — Qashqadaryo viloyatining eng nufuzli til va imtihon tayyorlov markazi. IELTS 7.0–8.5 bitiruvchilari, Digital SAT guruhlari, bepul Academic Support va yakshanba Speaking Clublari mavjud.",
    descriptionRu:
      'Level Up Карши (level-up-karshi.uz) — крупнейший центр IELTS, Digital SAT и ДТМ в Кашкадарьинской области с коворкингом и поддержкой второго преподавателя.',
    descriptionEn:
      'Level Up Karshi is Kashkadarya’s top-rated IELTS, Digital SAT, and DTM prep academy featuring Academic Support, coworking, and weekly mock exams.',
    facilities: ['coworking', 'mock_exam_hall', 'academic_support', 'speaking_club', 'library', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['level up', 'qarshi', 'karshi', 'qashqadaryo', 'kashkadarya'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–8.5 · SAT 1480+',
    branches: [
      { nameUz: 'Qarshi Markaz (Asosiy) filiali', nameRu: 'Главный филиал Карши', nameEn: 'Karshi Main Campus', cityId: 'qashqadaryo', districtId: 'qarshi', street: "Mustaqillik shoh ko'chasi, 42", landmarkUz: 'Qarshi viloyat hokimligi yaqinida', landmarkRu: 'Рядом с хокимиятом Карши', landmarkEn: 'Near Karshi City Center' },
      { nameUz: 'Shahrisabz filiali', nameRu: 'Филиал Шахрисабз', nameEn: 'Shahrisabz Branch', cityId: 'qashqadaryo', districtId: 'shahrisabz', street: "Ipak Yo'li ko'chasi, 15", landmarkUz: 'Oqsaroy majmuasi yaqinida', landmarkRu: 'Рядом с комплексом Ак-Сарай', landmarkEn: 'Near Ak-Saray Square' },
    ],
  },
  {
    name: 'Alfa School Qarshi',
    slug: 'alfa-school-qarshi',
    cityId: 'qashqadaryo',
    districtId: 'qarshi',
    subjects: ['dtm', 'math', 'physics', 'biology', 'chemistry', 'ielts'],
    exam: 'DTM',
    avgScore: 171,
    successRate: 89,
    price: 460000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 97 311 45 00',
    telegram: '@alfaschool_qarshi',
    instagram: '@alfaschool.qarshi',
    website: 'https://t.me/alfaschool_qarshi',
    googleRating: 4.9,
    googleReviewCount: 440,
    totalGraduates: 8900,
    taglineUz: 'Qarshida DTM grant abituriyentlari, tibbiyot va muhandislik yo‘nalishlari yetakchisi',
    taglineRu: 'Лидер подготовки к грантам ДТМ по точным и медицинским направлениям в Карши',
    taglineEn: 'Karshi DTM entrance academy specializing in STEM and medical university grants',
    descriptionUz:
      "Alfa School Qarshi — Qashqadaryo abituriyentlari orasida matematika, kimyo, biologiya va fizika fanlaridan yuqori DTM natijalari bilan tanilgan o'quv markazi.",
    descriptionRu:
      'Учебный центр Alfa School в Карши, известный высокими грантовыми результатами абитуриентов ДТМ по математике, химии, биологии и физике.',
    descriptionEn:
      'Alfa School Karshi specializes in intensive DTM preparation across Math, Chemistry, Biology, and Physics with monthly simulated entrance exams.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'wifi', 'ac_classrooms'],
    aliases: ['alfa school', 'qarshi dtm', 'qashqadaryo dtm', 'kimyo biologiya qarshi'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'Regional Olympiad & DTM Experts',
    branches: [
      { nameUz: 'Qarshi 4-mikrorayon filiali', nameRu: 'Филиал 4-й мкр. Карши', nameEn: 'Karshi 4th Microdistrict Branch', cityId: 'qashqadaryo', districtId: 'qarshi', street: "Nasaf ko'chasi, 18", landmarkUz: 'Qarshi Davlat Universiteti yaqinida', landmarkRu: 'Рядом с Каршинским госуниверситетом', landmarkEn: 'Near Karshi State University' },
    ],
  },
  {
    name: 'IT Park Qashqadaryo (Qarshi)',
    slug: 'it-park-qashqadaryo',
    cityId: 'qashqadaryo',
    districtId: 'qarshi',
    subjects: ['web', 'python', 'design', 'data', 'kids'],
    exam: 'IT Portfolio',
    avgScore: 89,
    successRate: 84,
    price: 500000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 75 220 11 99',
    telegram: '@itpark_qashqadaryo',
    instagram: '@itpark.qashqadaryo',
    website: 'https://it-park.uz',
    googleRating: 4.8,
    googleReviewCount: 310,
    totalGraduates: 4600,
    taglineUz: 'Qarshi IT Park akademiyasi · Web, Python, Mobil dasturlash, UI/UX dizayn va frilans',
    taglineRu: 'Академия IT Park в Карши · Web, Python, мобильная разработка, UI/UX и фриланс',
    taglineEn: 'Karshi IT Park Academy · Web, Python, UI/UX design & freelance career center',
    descriptionUz:
      "IT Park Qashqadaryo — Qarshi shahridagi zamonaviy IT ta'lim va startap markazi. Kompyuter sinflari, kovorking, mentorlik va xalqaro frilans bozoriga chiqish dasturlari mavjud.",
    descriptionRu:
      'Современный IT-центр в Карши с компьютерными классами, коворкингом, курсами программирования и поддержкой фриланс-карьеры.',
    descriptionEn:
      'Official regional IT Park hub in Karshi equipped with computer labs, coworking lounge, coding bootcamps, and career mentorship.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['it park qarshi', 'qashqadaryo it', 'qarshi dasturlash'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Practicing Software Engineers',
    branches: [
      { nameUz: 'Qarshi IT Park binosi', nameRu: 'Здание IT Park Карши', nameEn: 'Karshi IT Park Building', cityId: 'qashqadaryo', districtId: 'qarshi', street: "Islom Karimov ko'chasi, 60", landmarkUz: 'IT Park Qashqadaryo markazi', landmarkRu: 'Центр IT Park Кашкадарья', landmarkEn: 'IT Park Kashkadarya HQ' },
    ],
  },
  {
    name: 'Imperial Academy Termiz',
    slug: 'imperial-academy-termiz',
    cityId: 'surxondaryo',
    districtId: 'termiz',
    subjects: ['ielts', 'english', 'cefr', 'sat', 'math'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 87,
    price: 520000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 76 223 44 00',
    telegram: '@imperial_termiz',
    instagram: '@imperial.academy.uz',
    website: 'https://imperial-academy.uz',
    googleRating: 4.9,
    googleReviewCount: 480,
    totalGraduates: 7600,
    taglineUz: 'Surxondaryodagi yetakchi IELTS, CEFR, SAT va ingliz tili akademiyasi · Haftalik mocklar',
    taglineRu: 'Ведущая академия IELTS, CEFR, SAT и английского языка в Термезе (Сурхандарья)',
    taglineEn: 'Surkhandarya’s leading IELTS, CEFR & SAT academy in Termez',
    descriptionUz:
      "Imperial Academy Termiz (imperial-academy.uz) — Surxondaryo viloyati va Termiz shahridagi eng mashhur IELTS hamda xalqaro imtihonlar markazi. IELTS 7.0–8.5 bitiruvchilar, speaking club va zamonaviy kutubxonaga ega.",
    descriptionRu:
      'Imperial Academy (imperial-academy.uz) — ведущий центр IELTS, CEFR и SAT в Термезе с библиотекой, разговорными клубами и еженедельными пробными экзаменами.',
    descriptionEn:
      'Imperial Academy Termez is Surkhandarya’s premier English, IELTS, and SAT preparation academy with weekly full-length mock exams.',
    facilities: ['mock_exam_hall', 'speaking_club', 'library', 'academic_support', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['imperial', 'termiz', 'termez', 'surxondaryo', 'surkhandarya'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–8.5 · CEFR C1 Experts',
    branches: [
      { nameUz: 'Termiz Markaz filiali', nameRu: 'Филиал Термез Центр', nameEn: 'Termez Central Branch', cityId: 'surxondaryo', districtId: 'termiz', street: "At-Termiziy shoh ko'chasi, 24", landmarkUz: 'Termiz Davlat Universiteti yaqinida', landmarkRu: 'Рядом с Термезским госуниверситетом', landmarkEn: 'Near Termez State University' },
    ],
  },
  {
    name: 'Everest Education Termiz',
    slug: 'everest-education-termiz',
    cityId: 'surxondaryo',
    districtId: 'termiz',
    subjects: ['dtm', 'math', 'physics', 'biology', 'chemistry', 'ielts'],
    exam: 'DTM',
    avgScore: 169,
    successRate: 86,
    price: 450000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2018,
    phone: '+998 91 580 77 11',
    telegram: '@everest_termiz',
    instagram: '@everest.termiz',
    website: 'https://t.me/everest_termiz',
    googleRating: 4.8,
    googleReviewCount: 360,
    totalGraduates: 6200,
    taglineUz: 'Termizda DTM abituriyent fanlari, oylik blok-testlar va IELTS/CEFR guruhlari',
    taglineRu: 'Подготовка к ДТМ, ежемесячные блок-тесты и курсы IELTS/CEFR в Термезе',
    taglineEn: 'Termez DTM entrance prep, monthly diagnostic tests & IELTS/CEFR classes',
    descriptionUz:
      "Everest Education Termiz — Surxondaryo abituriyentlari uchun matematika, biologiya, kimyo, ona tili va ingliz tili bo'yicha qat'iy nazoratli tayyorlov markazi.",
    descriptionRu:
      'Центр интенсивной подготовки абитуриентов в Термезе по математике, биологии, химии и английскому с ежемесячным контролем.',
    descriptionEn:
      'Structured DTM and language prep center in Termez focused on state university grants and CEFR/IELTS certification.',
    facilities: ['mock_exam_hall', 'library', 'wifi', 'ac_classrooms'],
    aliases: ['everest termiz', 'surxondaryo dtm', 'termiz dtm'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'DTM Specialists · Senior Coaches',
    branches: [
      { nameUz: 'Termiz Barkamol Avlod filiali', nameRu: 'Филиал Термез Центр', nameEn: 'Termez City Branch', cityId: 'surxondaryo', districtId: 'termiz', street: "Navbahor ko'chasi, 11", landmarkUz: 'Termiz Markaziy dehqon bozori yaqinida', landmarkRu: 'Рядом с центральным рынком Термеза', landmarkEn: 'Near Termez Central Market' },
    ],
  },
  {
    name: 'IT Park Termiz',
    slug: 'it-park-termiz',
    cityId: 'surxondaryo',
    districtId: 'termiz',
    subjects: ['web', 'python', 'design', 'kids'],
    exam: 'IT Portfolio',
    avgScore: 88,
    successRate: 83,
    price: 490000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 76 221 11 99',
    telegram: '@itpark_surxondaryo',
    instagram: '@itpark.surxondaryo',
    website: 'https://it-park.uz',
    googleRating: 4.8,
    googleReviewCount: 270,
    totalGraduates: 3800,
    taglineUz: 'Surxondaryo IT Park filiali · Dasturlash, grafik dizayn, robototexnika va kovorking',
    taglineRu: 'Филиал IT Park Сурхандарья · Программирование, дизайн, робототехника и коворкинг',
    taglineEn: 'Surkhandarya IT Park branch · Coding, graphic design, robotics & coworking',
    descriptionUz:
      "IT Park Termiz — zamonaviy kompyuter laboratoriyalari, Web/Python dasturlash, UI/UX dizayn va yoshlar uchun kovorking markazini o'z ichiga olgan rasmiy IT ta'lim majmuasi.",
    descriptionRu:
      'Официальный кампус IT Park в Термезе с современными ПК, курсами программирования, дизайна и зоной коворкинга.',
    descriptionEn:
      'Official IT Park campus in Termez offering Web/Python coding, UI/UX design, youth robotics, and free coworking for students.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['it park termiz', 'surxondaryo it', 'termiz dasturlash'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Certified Engineers',
    branches: [
      { nameUz: 'Termiz IT Park binosi', nameRu: 'Здание IT Park Термез', nameEn: 'Termez IT Park Building', cityId: 'surxondaryo', districtId: 'termiz', street: "Alisher Navoiy ko'chasi, 40", landmarkUz: 'Termiz Yoshlar markazi', landmarkRu: 'Молодёжный центр Термеза', landmarkEn: 'Termez Youth Center' },
    ],
  },
  {
    name: "HDP O'quv Markazi Urganch",
    slug: 'hdp-oquv-markazi-urganch',
    cityId: 'xorazm',
    districtId: 'urganch',
    subjects: ['ielts', 'english', 'dtm', 'math', 'sat'],
    exam: 'IELTS',
    avgScore: 7.3,
    successRate: 89,
    price: 560000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 62 224 77 77',
    telegram: '@hdp_urganch',
    instagram: '@hdp.learning.center',
    website: 'https://t.me/hdp_urganch',
    googleRating: 4.9,
    googleReviewCount: 740,
    totalGraduates: 13500,
    taglineUz: 'Xorazmning eng mashhur IELTS, SAT va DTM akademiyasi · Kuchli natijalar va kovorking',
    taglineRu: 'Самая известная академия IELTS, SAT и ДТМ в Ургенче (Хорезм) · Коворкинг и Mock-зал',
    taglineEn: 'Khorezm’s flagship IELTS, SAT & DTM academy in Urgench',
    descriptionUz:
      "HDP O'quv Markazi — Xorazm viloyati va Urganch shahridagi eng yuqori IELTS va DTM ko'rsatkichlariga ega yetakchi markaz. Haftalik kompyuterli mock testlar, speaking club va zamonaviy kutubxona faoliyat yuritadi.",
    descriptionRu:
      'Учебный центр HDP в Ургенче — лидер Хорезмской области по результатам IELTS 7.0–8.5, SAT и ДТМ с собственным коворкингом и библиотекой.',
    descriptionEn:
      'HDP Learning Center is Khorezm’s top-performing IELTS, SAT, and DTM academy featuring computer-delivered mocks, coworking, and dedicated study library.',
    facilities: ['coworking', 'mock_exam_hall', 'academic_support', 'speaking_club', 'library', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['hdp', 'urganch', 'urgench', 'xorazm', 'khorezm', 'xiva'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0–8.5 · SAT 1460+',
    branches: [
      { nameUz: 'Urganch Markaz (Asosiy) filiali', nameRu: 'Главный филиал Ургенч', nameEn: 'Urgench Main Campus', cityId: 'xorazm', districtId: 'urganch', street: "Al-Xorazmiy ko'chasi, 66", landmarkUz: 'Urganch Davlat Universiteti yaqinida', landmarkRu: 'Рядом с Ургенчским госуниверситетом', landmarkEn: 'Near Urgench State University' },
      { nameUz: 'Xiva filiali', nameRu: 'Филиал Хива', nameEn: 'Khiva Branch', cityId: 'xorazm', districtId: 'xiva', street: "Amir Temur ko'chasi, 14", landmarkUz: 'Xiva markazi', landmarkRu: 'Центр Хивы', landmarkEn: 'Khiva Center' },
    ],
  },
  {
    name: 'Data Learning Centre Urganch',
    slug: 'data-learning-centre-urganch',
    cityId: 'xorazm',
    districtId: 'urganch',
    subjects: ['web', 'python', 'design', 'ielts', 'english', 'kids'],
    exam: 'IT Portfolio',
    avgScore: 91,
    successRate: 87,
    price: 620000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2019,
    phone: '+998 62 227 72 22',
    telegram: '@data_talim_stansiyasi',
    instagram: '@data.learning.centre',
    website: 'https://data.uz',
    googleRating: 5.0,
    googleReviewCount: 680,
    totalGraduates: 9400,
    taglineUz: 'DATA Ta’lim Stansiyasi Urganch · IT dasturlash, dizayn, IELTS va 24/7 zamonaviy kovorking',
    taglineRu: 'DATA Учебная Станция Ургенч · IT, дизайн, IELTS и современный коворкинг',
    taglineEn: 'DATA Learning Station Urgench · Coding, design, IELTS & modern coworking campus',
    descriptionUz:
      "DATA Ta'lim Stansiyasi (Data Learning Centre) — Urganch shahridagi eng zamonaviy IT va xorijiy tillar kampusi. Full-Stack dasturlash, Grafik dizayn, SMM, IELTS hamda karyera akseleratori bilan mashhur.",
    descriptionRu:
      'DATA Learning Centre — самый современный IT и языковой кампус Хорезма в Ургенче: программирование, дизайн, IELTS и карьерный центр.',
    descriptionEn:
      'DATA Learning Station is Urgench’s premier IT & English campus offering Full-Stack coding, UI/UX design, IELTS, coworking, and career placement.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'speaking_club', 'student_app', 'wifi', 'ac_classrooms', 'cafe_water', 'parking'],
    aliases: ['data', 'data talim', 'urganch it', 'xorazm it', 'data learning'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Senior IT Mentors · IELTS 8.0+',
    branches: [
      { nameUz: 'Urganch DATA Stansiyasi', nameRu: 'Станция DATA Ургенч', nameEn: 'Urgench DATA Station', cityId: 'xorazm', districtId: 'urganch', street: "Al-Xorazmiy ko'chasi, 110", landmarkUz: 'Urganch markaziy Darital yonida', landmarkRu: 'Рядом с ТЦ Darital Ургенч', landmarkEn: 'Near Darital Mall Urgench' },
    ],
  },
  {
    name: 'IT Park Xorazm (Urganch)',
    slug: 'it-park-xorazm',
    cityId: 'xorazm',
    districtId: 'urganch',
    subjects: ['web', 'python', 'data', 'design'],
    exam: 'IT Portfolio',
    avgScore: 90,
    successRate: 85,
    price: 540000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 62 224 11 99',
    telegram: '@itpark_xorazm',
    instagram: '@itpark.xorazm',
    website: 'https://itcenterxorazm.uz',
    googleRating: 4.9,
    googleReviewCount: 410,
    totalGraduates: 6100,
    taglineUz: 'Al-Xorazmiy shaharchasi IT Park · Python, Web, AI va BPO karyera tayyorlovi',
    taglineRu: 'IT Park Хорезм · Python, Web, Data/AI и подготовка к IT/BPO карьере',
    taglineEn: 'IT Park Khorezm campus · Python, Web, Data/AI & tech startup mentorship',
    descriptionUz:
      "IT Park Xorazm (itcenterxorazm.uz) — Urganch shahridagi rasmiy IT Park texnoparki va akademiyasi. Zamonaviy kompyuter xonalari, startap inkubatsiya va frilans karyera dasturlari mavjud.",
    descriptionRu:
      'Официальный технопарк и IT-академия Хорезма в Ургенче с курсами Python, Web, AI и программой стартап-инкубации.',
    descriptionEn:
      'Official IT Park Khorezm campus in Urgench offering Python, Web, Data/AI tracks, startup incubation, and coworking.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['it park xorazm', 'itcenterxorazm', 'urganch it park'],
    formats: [StudyFormat.OFFLINE, StudyFormat.ONLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Certified Developers',
    branches: [
      { nameUz: 'Urganch IT Park Texnoparki', nameRu: 'Технопарк IT Park Ургенч', nameEn: 'Urgench IT Park Technopark', cityId: 'xorazm', districtId: 'urganch', street: "Tinchlik ko'chasi, 6", landmarkUz: 'Urganch IT Park binosi', landmarkRu: 'Здание IT Park Ургенч', landmarkEn: 'IT Park Urgench HQ' },
    ],
  },
  {
    name: "Sensorika IT O'quv Markazi Navoiy",
    slug: 'sensorika-it-navoiy',
    cityId: 'navoiy',
    districtId: 'navoiy-markaz',
    subjects: ['web', 'python', 'design', 'kids'],
    exam: 'IT Portfolio',
    avgScore: 91,
    successRate: 88,
    price: 550000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2016,
    phone: '+998 79 224 55 00',
    telegram: '@sensorika_education',
    instagram: '@sensorika.uz',
    website: 'https://sensorika.uz',
    googleRating: 5.0,
    googleReviewCount: 590,
    totalGraduates: 10800,
    taglineUz: "Navoiyning №1 IT ta'lim markazi · Frontend, Python, 3D dizayn va sertifikatlangan kurslar",
    taglineRu: 'IT-центр №1 в Навои · Frontend, Python, 3D-дизайн и сертифицированное обучение',
    taglineEn: 'Navoiy’s #1 IT education center · Frontend, Python, 3D design & digital skills',
    descriptionUz:
      "Sensorika Education (sensorika.uz) — Navoiy viloyatidagi eng nufuzli IT va zamonaviy kasblar markazi. 10 000+ bitiruvchi, zamonaviy kompyuter laboratoriyalari, kovorking va IT Park hamkorligidagi amaliyot dasturlari mavjud.",
    descriptionRu:
      'Sensorika (sensorika.uz) — ведущий учебный IT-центр Навоийской области с более чем 10 000 выпускников, современными ПК-классами и коворкингом.',
    descriptionEn:
      'Sensorika Education (sensorika.uz) is Navoiy’s flagship IT academy with 10,000+ alumni, modern computer labs, coworking, and project-based coding tracks.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'student_app', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['sensorika', 'navoiy', 'navoi', 'navoiy it', 'sensorika.uz'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Sensorika Senior IT Mentors',
    branches: [
      { nameUz: 'Navoiy Markaz (Asosiy) filiali', nameRu: 'Главный филиал Навои', nameEn: 'Navoiy Main Campus', cityId: 'navoiy', districtId: 'navoiy-markaz', street: "Islom Karimov ko'chasi, 90", landmarkUz: 'Navoiy viloyati markaziy banki yonida', landmarkRu: 'Рядом с Центральным банком Навои', landmarkEn: 'Near Navoiy Central Bank' },
    ],
  },
  {
    name: "Sifat O'quv Markazi Navoiy",
    slug: 'sifat-oquv-markazi-navoiy',
    cityId: 'navoiy',
    districtId: 'navoiy-markaz',
    subjects: ['ielts', 'english', 'dtm', 'math', 'russian'],
    exam: 'IELTS',
    avgScore: 7.1,
    successRate: 86,
    price: 490000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 79 223 30 30',
    telegram: '@sifat_navoiy',
    instagram: '@sifat.navoiy',
    website: 'https://t.me/sifat_navoiy',
    googleRating: 4.9,
    googleReviewCount: 410,
    totalGraduates: 7400,
    taglineUz: 'Navoiyda IELTS 7.0+, DTM matematika, rus tili va abituriyentlar tayyorlov markazi',
    taglineRu: 'IELTS 7.0+, математика ДТМ, русский язык и подготовка абитуриентов в Навои',
    taglineEn: 'Navoiy IELTS 7.0+, DTM Math, Russian & university entrance academy',
    descriptionUz:
      "Sifat O'quv Markazi — Navoiy shahrida yuqori IELTS va DTM ko'rsatkichlari, haftalik mock imtihonlar va ota-onalar nazorati tizimi bilan tanilgan yetakchi o'quv markazi.",
    descriptionRu:
      'Учебный центр Sifat в Навои — подготовка к IELTS 7.0+, ДТМ и русскому языку с еженедельными пробными экзаменами.',
    descriptionEn:
      'Sifat Learning Center is Navoiy’s trusted IELTS, DTM, and Russian language academy with weekly mock exams and parent tracking.',
    facilities: ['mock_exam_hall', 'speaking_club', 'library', 'academic_support', 'wifi', 'ac_classrooms'],
    aliases: ['sifat', 'navoiy ielts', 'navoiy dtm'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'IELTS 8.0+ · DTM Experts',
    branches: [
      { nameUz: 'Navoiy Markaz filiali', nameRu: 'Филиал Навои Центр', nameEn: 'Navoiy Center Branch', cityId: 'navoiy', districtId: 'navoiy-markaz', street: "G'alaba shoh ko'chasi, 148", landmarkUz: 'Navoiy TSUM yaqinida', landmarkRu: 'Рядом с ЦУМ Навои', landmarkEn: 'Near Navoiy TSUM' },
    ],
  },
  {
    name: 'Registon Jizzax',
    slug: 'registon-jizzax',
    cityId: 'jizzax',
    districtId: 'jizzax-markaz',
    subjects: ['dtm', 'ielts', 'math', 'physics', 'english', 'biology'],
    exam: 'DTM',
    avgScore: 172,
    successRate: 89,
    price: 540000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2019,
    phone: '+998 72 226 27 00',
    telegram: '@registon_jizzax',
    instagram: '@registon.jizzax',
    website: 'https://rgn.uz',
    googleRating: 4.9,
    googleReviewCount: 490,
    totalGraduates: 8200,
    taglineUz: 'Registon tarmog‘ining Jizzax filiali · DTM grantlar, IELTS/CEFR va oylik blok-testlar',
    taglineRu: 'Филиал сети «Регистан» в Джизаке · Гранты ДТМ, IELTS/CEFR и ежемесячные блок-тесты',
    taglineEn: 'Registon Network Jizzakh campus · DTM grants, IELTS/CEFR & monthly mocks',
    descriptionUz:
      "Registon Jizzax — O'zbekistonning yetakchi Registon o'quv markazi tarmog'ining Jizzax viloyati filiali. Abituriyent fanlari, IELTS, kutubxona va grant stipendiyalari taqdim etiladi.",
    descriptionRu:
      'Официальный филиал сети «Регистан» в Джизаке с программами ДТМ, IELTS, библиотекой и системой грантовых скидок.',
    descriptionEn:
      'Official Jizzakh campus of the national Registon network offering DTM entrance prep, IELTS/CEFR, study library, and merit scholarships.',
    facilities: ['mock_exam_hall', 'library', 'academic_support', 'student_app', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['registon jizzax', 'jizzax', 'jizzakh', 'jizzax dtm'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'Registon Certified Faculty · IELTS 8.0+',
    branches: [
      { nameUz: 'Jizzax Markaz filiali', nameRu: 'Филиал Джизак Центр', nameEn: 'Jizzakh Central Branch', cityId: 'jizzax', districtId: 'jizzax-markaz', street: "Sharof Rashidov shoh ko'chasi, 64", landmarkUz: 'Jizzax markaziy ko‘chasi', landmarkRu: 'Проспект Ш. Рашидова, центр Джизака', landmarkEn: 'Sh. Rashidov Ave, Jizzakh Center' },
    ],
  },
  {
    name: 'English House & IT Park Jizzax',
    slug: 'english-house-jizzax',
    cityId: 'jizzax',
    districtId: 'jizzax-markaz',
    subjects: ['ielts', 'english', 'web', 'python', 'kids'],
    exam: 'IELTS',
    avgScore: 7.0,
    successRate: 85,
    price: 480000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2018,
    phone: '+998 72 222 85 85',
    telegram: '@englishhouse_jizzax',
    instagram: '@englishhouse.jizzax',
    website: 'https://it-park.uz',
    googleRating: 4.8,
    googleReviewCount: 330,
    totalGraduates: 5100,
    taglineUz: 'Jizzaxda IELTS, General English, IT dasturlash va zamonaviy kovorking markazi',
    taglineRu: 'IELTS, английский язык, IT-программирование и коворкинг в Джизаке',
    taglineEn: 'Jizzakh hub for IELTS, General English, Web/Python coding & coworking',
    descriptionUz:
      "English House & IT Park Jizzax — Jizzax shahridagi ingliz tili, IELTS, bolalar uchun tillar hamda zamonaviy Web/Python dasturlash kurslarini birlashtirgan markaz.",
    descriptionRu:
      'Образовательный центр в Джизаке по направлениям IELTS, английский язык и IT-программирование с компьютерными классами.',
    descriptionEn:
      'Modern Jizzakh learning center combining IELTS, General English, and practical Web/Python coding tracks.',
    facilities: ['computer_lab', 'coworking', 'speaking_club', 'mock_exam_hall', 'wifi', 'ac_classrooms'],
    aliases: ['english house', 'jizzax ielts', 'it park jizzax'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IELTS 8.0 · IT Park Mentors',
    branches: [
      { nameUz: 'Jizzax Sambhram / Markaz filiali', nameRu: 'Филиал Джизак Центр', nameEn: 'Jizzakh Center Branch', cityId: 'jizzax', districtId: 'jizzax-markaz', street: "Mustaqillik ko'chasi, 22", landmarkUz: 'Jizzax Politexnika instituti yaqinida', landmarkRu: 'Рядом с Джизакским политехническим институтом', landmarkEn: 'Near Jizzakh Polytechnic Institute' },
    ],
  },
  {
    name: 'IT Park Sirdaryo (Guliston)',
    slug: 'it-park-sirdaryo-guliston',
    cityId: 'sirdaryo',
    districtId: 'guliston',
    subjects: ['web', 'python', 'design', 'english', 'kids'],
    exam: 'IT Portfolio',
    avgScore: 89,
    successRate: 85,
    price: 490000,
    vLevel: VerificationLevel.STUDENT_CONFIRMED,
    plan: PlanTier.PRO,
    foundedYear: 2020,
    phone: '+998 67 225 11 99',
    telegram: '@itpark_sirdaryo',
    instagram: '@itpark.sirdaryo',
    website: 'https://it-park.uz',
    googleRating: 4.9,
    googleReviewCount: 360,
    totalGraduates: 4700,
    taglineUz: 'Sirdaryo viloyati IT Park akademiyasi · Web, Python, dizayn, IT-English va kovorking',
    taglineRu: 'Академия IT Park Сырдарья (Гулистан) · Web, Python, дизайн, IT-English и коворкинг',
    taglineEn: 'Syrdarya IT Park Academy in Gulistan · Web, Python, design & coworking',
    descriptionUz:
      "IT Park Sirdaryo — Guliston shahridagi eng zamonaviy IT ta'lim va frilans markazi. Kuchli kompyuter sinflari, kovorking, Web/Python bootcamp hamda IT-English kurslari faoliyat yuritadi.",
    descriptionRu:
      'Официальный учебный центр IT Park в Гулистане (Сырдарьинская область) с компьютерными классами, курсами программирования и коворкингом.',
    descriptionEn:
      'Official IT Park campus in Gulistan serving Syrdarya youth with coding bootcamps, UI/UX design, IT-English, and coworking.',
    facilities: ['computer_lab', 'coworking', 'career_center', 'wifi', 'ac_classrooms', 'parking'],
    aliases: ['sirdaryo', 'syrdarya', 'guliston', 'gulistan', 'it park sirdaryo'],
    formats: [StudyFormat.OFFLINE, StudyFormat.HYBRID],
    certHighlight: 'IT Park Certified Mentors',
    branches: [
      { nameUz: 'Guliston IT Park binosi', nameRu: 'Здание IT Park Гулистан', nameEn: 'Gulistan IT Park Building', cityId: 'sirdaryo', districtId: 'guliston', street: "O'zbekiston shoh ko'chasi, 27", landmarkUz: 'Guliston Davlat Universiteti yaqinida', landmarkRu: 'Рядом с Гулистанским госуниверситетом', landmarkEn: 'Near Gulistan State University' },
    ],
  },
  {
    name: 'Ziyo Maskani Guliston',
    slug: 'ziyo-maskani-guliston',
    cityId: 'sirdaryo',
    districtId: 'guliston',
    subjects: ['ielts', 'english', 'dtm', 'math', 'russian'],
    exam: 'IELTS',
    avgScore: 7.0,
    successRate: 86,
    price: 440000,
    vLevel: VerificationLevel.DOCUMENT_VERIFIED,
    plan: PlanTier.PRO,
    foundedYear: 2017,
    phone: '+998 67 226 40 40',
    telegram: '@ziyomaskani_guliston',
    instagram: '@ziyomaskani.guliston',
    website: 'https://t.me/ziyomaskani_guliston',
    googleRating: 4.8,
    googleReviewCount: 290,
    totalGraduates: 5300,
    taglineUz: 'Gulistonda IELTS, CEFR, DTM matematika va rus tili bo‘yicha yetakchi o‘quv markazi',
    taglineRu: 'Ведущий учебный центр IELTS, CEFR, ДТМ и русского языка в Гулистане',
    taglineEn: 'Gulistan’s leading IELTS, CEFR, DTM Math & Russian language center',
    descriptionUz:
      "Ziyo Maskani — Sirdaryo viloyati Guliston shahridagi abituriyentlar va til o'rganuvchilar uchun eng ishonchli o'quv markazi. Haftalik mock testlar, speaking club va kutubxona mavjud.",
    descriptionRu:
      'Учебный центр Ziyo Maskani в Гулистане — подготовка к IELTS, CEFR, ДТМ и русскому языку с библиотекой и еженедельными тестами.',
    descriptionEn:
      'Ziyo Maskani Gulistan provides structured IELTS, CEFR, DTM, and Russian courses across Syrdarya with weekly diagnostic testing.',
    facilities: ['mock_exam_hall', 'speaking_club', 'library', 'wifi', 'ac_classrooms'],
    aliases: ['ziyo maskani', 'guliston ielts', 'sirdaryo ielts', 'sirdaryo dtm'],
    formats: [StudyFormat.OFFLINE],
    certHighlight: 'IELTS 8.0 · Senior DTM Coaches',
    branches: [
      { nameUz: 'Guliston Markaz filiali', nameRu: 'Филиал Гулистан Центр', nameEn: 'Gulistan Central Branch', cityId: 'sirdaryo', districtId: 'guliston', street: "Sayxun ko'chasi, 15", landmarkUz: 'Guliston markaziy xiyoboni', landmarkRu: 'Центральный бульвар Гулистана', landmarkEn: 'Gulistan Central Boulevard' },
    ],
  },
];

const FIRST_NAMES_M = ['Azizbek', 'Sardor', 'Jasur', 'Dilshod', 'Bobur', 'Farrux', 'Javohir', 'Timur', 'Bekzod', 'Otabek', 'Sherzod', 'Rustam', 'Sanjar', 'Alisher', 'Umidjon', 'Nodir'];
const FIRST_NAMES_F = ['Malika', 'Madina', 'Sevara', 'Nilufar', 'Kamola', 'Zarina', 'Dilnoza', 'Shahnoza', 'Nigora', 'Gulnoza', 'Mohira', 'Laylo', 'Feruza', 'Diyora', 'Saida', 'Umida'];
const LAST_NAMES = ['Karimov', 'Toshmatov', 'Raximov', 'Abdullayev', 'Ismoilov', 'Yusupov', 'Nazarov', 'Qodirov', 'Mirzayev', 'Salimov', 'Xolmatov', 'Tursunov', 'Sobirov', 'Usmonov', 'Ergashev', 'Mahmudov'];

const UNIVERSITIES = [
  'WIUT (Westminster Tashkent)',
  'INHA University in Tashkent',
  'New Uzbekistan University',
  'TUIT (TATU)',
  'Tashkent State University of Economics',
  'MDIS Tashkent',
  'Webster University Tashkent',
  'Turin Polytechnic Tashkent',
  'University of Bristol (UK)',
  'KAIST (South Korea)',
];

function getDistrictInfo(cityId: string, districtId: string) {
  const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
  const district = city.districts.find((d) => d.id === districtId) || city.districts[0];
  return { city, district };
}

function getCategoryForSubject(subjectId: string): string {
  return ALL_SUBJECTS.find((s) => s.id === subjectId)?.categoryId || 'languages';
}

function buildTeachers(centerIdx: number, subjects: string[]): Teacher[] {
  const count = 3;
  const teachers: Teacher[] = [];
  for (let i = 0; i < count; i++) {
    const isFemale = (centerIdx + i) % 2 === 0;
    const fn = isFemale
      ? FIRST_NAMES_F[(centerIdx * 3 + i) % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[(centerIdx * 3 + i) % FIRST_NAMES_M.length];
    const lnBase = LAST_NAMES[(centerIdx * 5 + i * 2) % LAST_NAMES.length];
    const ln = isFemale ? `${lnBase}a` : lnBase;
    const fullName = `${fn} ${ln}`;
    const exp = randInt(4, 11);
    const certs = subjects.includes('ielts')
      ? ['IELTS 8.5', 'CELTA Cambridge']
      : subjects.includes('sat') || subjects.includes('math')
        ? ['SAT Math 800', 'MSc Applied Math']
        : subjects.includes('web') || subjects.includes('python')
          ? ['Senior Engineer (6+ yrs)', 'Cloud & Architecture']
          : subjects.includes('korean')
            ? ['TOPIK Level 6', 'Seoul National Univ.']
            : subjects.includes('german')
              ? ['Goethe C2', 'TestDaF Expert']
              : ['DTM Expert', 'Tashkent State Ped. Univ.'];
    teachers.push({
      id: `teacher-${centerIdx}-${i}`,
      name: fullName,
      initials: `${fn[0]}${ln[0]}`,
      accentHue: ACCENTS[(centerIdx + i) % ACCENTS.length],
      bio: {
        uz: `${exp} yillik tajribaga ega yetakchi ustoz. Har bir guruhda haftalik diagnostik test va shaxsiy fikr-mulohaza tizimini olib boradi.`,
        ru: `Ведущий преподаватель с опытом ${exp} лет. Проводит еженедельные пробные тесты и даёт индивидуальную обратную связь.`,
        en: `Senior instructor with ${exp} years of teaching experience, weekly diagnostic mocks, and structured progress tracking.`,
      },
      experienceYears: exp,
      certificates: certs,
      subjects: subjects.slice(0, 2),
      studentsAchievedTarget: randInt(45, 240),
      avgStudentScore: subjects.includes('ielts') ? '7.2' : subjects.includes('sat') ? '1440' : '168+',
    });
  }
  return teachers;
}

export interface SeedDataset {
  centers: Center[];
  tutors: Tutor[];
  courses: Course[];
  results: ResultEntry[];
  reviews: Review[];
  bookings: Booking[];
  leads: Lead[];
  reports: Report[];
  auditLogs: AuditLogEntry[];
  guides: GuideArticle[];
}

export function buildSeedDataset(): SeedDataset {
  const centers: Center[] = CENTER_SPECS.map((spec, idx) => {
    const lessonsPerWeek = idx % 3 === 0 ? 5 : 3;
    const pricePerLesson = calculatePricePerLesson(spec.price, lessonsPerWeek);
    const categories = Array.from(new Set(spec.subjects.map(getCategoryForSubject)));
    const rating = spec.googleRating ?? Math.round((4.6 + rng() * 0.38) * 10) / 10;
    const reviewCount = spec.googleReviewCount ?? randInt(85, 580);
    const totalGraduates =
      spec.totalGraduates ?? Math.max(850, (2026 - spec.foundedYear) * randInt(480, 1450));

    const extractCleanDomain = (url: string): string | undefined => {
      try {
        const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        if (!host || host.includes('t.me') || host.includes('instagram.com') || host.includes('youtube.com')) {
          return undefined;
        }
        return host;
      } catch {
        return undefined;
      }
    };

    const isItCenter =
      spec.subjects.includes('web') ||
      spec.subjects.includes('python') ||
      spec.subjects.includes('data') ||
      spec.exam === 'IT Portfolio';
    const isSatDtm = spec.exam === 'SAT' || spec.exam === 'DTM';
    const defaultCampusPhotos: CampusPhotoKey[] = isItCenter
      ? ['it_coding_lab', 'coworking_lounge', 'building_reception']
      : isSatDtm
        ? ['mock_exam_hall', 'library_study', 'building_reception']
        : idx % 2 === 0
          ? ['english_classroom', 'coworking_lounge', 'mock_exam_hall']
          : ['building_reception', 'english_classroom', 'library_study'];
    const campusPhotos: CampusPhotoKey[] = spec.campusPhotos ?? defaultCampusPhotos;

    const yearsActive = Math.max(1, 2026 - spec.foundedYear);
    const authorityScore = Math.min(
      99,
      Math.max(
        68,
        Math.round(
          rating * 10.2 +
            Math.min(18, Math.log10(reviewCount + 10) * 5.2) +
            Math.min(14, Math.log10(totalGraduates + 10) * 2.8) +
            Math.min(10, spec.branches.length * 2.2) +
            Math.min(7, yearsActive * 0.65) +
            (spec.vLevel === VerificationLevel.STUDENT_CONFIRMED ? 6 : 3)
        )
      )
    );

    const baseYearGrads = Math.max(120, Math.round(totalGraduates / Math.max(3.5, yearsActive * 0.85)));
    const yearlyMetrics: YearlyCenterMetric[] = [2022, 2023, 2024, 2025, 2026].map((year, yIdx) => {
      const progressFactor = (4 - yIdx) * 0.25; // 1.0 in 2022 -> 0.0 in 2026
      let avgScoreYear = spec.avgScore;
      if (spec.exam === 'IELTS') {
        avgScoreYear = Number(Math.max(5.8, spec.avgScore - progressFactor * 0.55).toFixed(1));
      } else if (spec.exam === 'SAT') {
        avgScoreYear = Math.round(spec.avgScore - progressFactor * 95);
      } else if (spec.exam === 'DTM') {
        avgScoreYear = Math.round(spec.avgScore - progressFactor * 16);
      } else {
        avgScoreYear = Math.round(Math.max(70, spec.avgScore - progressFactor * 8));
      }
      const targetRateYear = Math.max(66, Math.min(97, Math.round(spec.successRate - progressFactor * 9)));
      const gradsYear = Math.max(60, Math.round(baseYearGrads * (0.58 + yIdx * 0.14)));
      const highScorersYear = Math.max(24, Math.round(gradsYear * (targetRateYear / 100) * 0.52));
      return {
        year,
        avgScore: avgScoreYear,
        targetRate: targetRateYear,
        graduates: gradsYear,
        highScorers: highScorersYear,
      };
    });

    const qualityScores: CenterQualityScores = {
      teaching: Math.min(99, Math.round(rating * 18.8 + (spec.vLevel === VerificationLevel.STUDENT_CONFIRMED ? 4 : 1))),
      results: Math.min(99, Math.round(spec.successRate + 4)),
      facilities: Math.min(98, 66 + Math.min(32, spec.facilities.length * 3.4)),
      curriculum: Math.min(98, Math.round(80 + Math.min(16, yearsActive * 1.4))),
      valueForMoney: Math.max(68, Math.min(98, Math.round(108 - spec.price / 58000))),
      studentSupport: Math.min(
        98,
        74 +
          (spec.facilities.includes('academic_support') ? 10 : 0) +
          (spec.facilities.includes('coworking') ? 7 : 0) +
          (spec.facilities.includes('student_app') ? 5 : 0)
      ),
    };

    const branches = spec.branches.map((br, bIdx) => {
      const { city, district } = getDistrictInfo(br.cityId, br.districtId);
      const latOffset = br.latOffset ?? (rng() - 0.5) * 0.018;
      const lngOffset = br.lngOffset ?? (rng() - 0.5) * 0.022;
      return {
        id: `br-${idx}-${bIdx + 1}`,
        name: { uz: br.nameUz, ru: br.nameRu, en: br.nameEn },
        cityId: city.id,
        districtId: district.id,
        address: {
          uz: `${city.name.uz}, ${district.name.uz}, ${br.street}`,
          ru: `${city.name.ru}, ${district.name.ru}, ${br.street}`,
          en: `${br.street}, ${district.name.en}, ${city.name.en}`,
        },
        landmark: { uz: br.landmarkUz, ru: br.landmarkRu, en: br.landmarkEn },
        lat: Number((district.coords[0] + latOffset).toFixed(5)),
        lng: Number((district.coords[1] + lngOffset).toFixed(5)),
        phone: spec.phone,
        workingHours: '08:30 – 21:00 (Du–Sh)',
      };
    });

    const scoreText =
      spec.exam === 'IELTS'
        ? `Avg IELTS ${spec.avgScore}`
        : spec.exam === 'SAT'
          ? `Avg SAT ${spec.avgScore}`
          : spec.exam === 'DTM'
            ? `Avg DTM ${spec.avgScore}/189`
            : spec.exam === 'TOPIK'
              ? `Avg TOPIK ${spec.avgScore}`
              : `${spec.exam} ${spec.avgScore}%`;

    const sampleSize = randInt(80, 360);

    return {
      id: `center-${idx + 1}`,
      slug: spec.slug,
      name: spec.name,
      tagline: { uz: spec.taglineUz, ru: spec.taglineRu, en: spec.taglineEn },
      description: { uz: spec.descriptionUz, ru: spec.descriptionRu, en: spec.descriptionEn },
      accentColor: ACCENTS[idx % ACCENTS.length],
      foundedYear: spec.foundedYear,
      verificationLevel: spec.vLevel,
      approvalStatus: ModerationStatus.APPROVED,
      isSponsored: Boolean(spec.sponsored),
      planTier: spec.plan,
      rating,
      reviewCount,
      ratingBreakdown: {
        teaching: Math.min(5, Number((rating + 0.06).toFixed(1))),
        results: Math.min(5, Number((rating + 0.03).toFixed(1))),
        facilities: Math.min(5, Number((rating - 0.02).toFixed(1))),
        value: Math.min(5, Number((rating - 0.06).toFixed(1))),
      },
      subjects: spec.subjects,
      categories,
      priceFromUzs: spec.price,
      pricePerLessonFromUzs: pricePerLesson,
      formats: spec.formats || [StudyFormat.OFFLINE, StudyFormat.HYBRID],
      schedules:
        idx % 2 === 0
          ? [ScheduleSlot.MORNING, ScheduleSlot.AFTERNOON, ScheduleSlot.EVENING, ScheduleSlot.WEEKEND]
          : [ScheduleSlot.MORNING, ScheduleSlot.EVENING],
      ageGroups: spec.subjects.includes('kids')
        ? [AgeGroup.KIDS, AgeGroup.TEENS]
        : [AgeGroup.TEENS, AgeGroup.ADULTS],
      instructionLanguages:
        spec.cityId === 'tashkent' ? ['uz', 'ru', 'en'] : idx % 2 === 0 ? ['uz', 'ru'] : ['uz', 'en'],
      minClassSize: 8 + (idx % 4),
      maxClassSize: 12 + (idx % 6),
      freeTrial: idx % 6 !== 5,
      trialFeeUzs: idx % 6 === 5 ? 50000 : 0,
      installmentsAvailable: idx % 2 === 0 || spec.price >= 1200000,
      refundPolicy: {
        uz: "Birinchi 3 dars ichida qoniqmasangiz, to'lovning 100% qismi qaytariladi.",
        ru: '100% возврат оплаты в течение первых 3 занятий, если формат не подойдёт.',
        en: '100% refund within the first 3 lessons if the program does not match your expectations.',
      },
      hasTopCertifiedTeachers: spec.vLevel !== VerificationLevel.UNVERIFIED,
      teacherCertHighlight: spec.certHighlight || 'IELTS 8.5 · CELTA',
      curriculumNote: {
        uz: "Rasmiy darsliklar, haftalik to'liq mock imtihon, yordamchi ustoz tahlili va ota-onalar uchun progress hisoboti narx ichiga kiritilgan.",
        ru: 'Официальные учебные материалы, еженедельные пробные тесты, разбор ошибок и отчёт прогресса включены в стоимость.',
        en: 'Official exam materials, weekly full-length mocks, assistant tutor reviews, and progress tracking included.',
      },
      branches,
      teachers: buildTeachers(idx, spec.subjects),
      outcomeSummary: {
        headline: {
          uz: `${scoreText} · ${spec.successRate}% maqsadga yetdi`,
          ru: `${scoreText} · ${spec.successRate}% достигли цели`,
          en: `${scoreText} · ${spec.successRate}% reached target`,
        },
        exam: spec.exam,
        avgScore: spec.avgScore,
        successRatePercent: spec.successRate,
        verifiedCount: Math.round(sampleSize * 0.85),
        sampleSize,
        lastUpdated: '2026-11-20',
      },
      phone: spec.phone,
      telegram: spec.telegram,
      instagram: spec.instagram,
      website: spec.website,
      youtube: spec.youtube,
      logoDomain: extractCleanDomain(spec.website),
      campusPhotos,
      googleRating: rating,
      googleReviewCount: reviewCount,
      totalGraduates,
      authorityScore,
      yearlyMetrics,
      qualityScores,
      faqs: [
        {
          q: {
            uz: 'Qanday qilib bog‘lanish va guruhga yozilish mumkin?',
            ru: 'Как связаться с центром и записаться в группу?',
            en: 'How can I contact the center directly?',
          },
          a: {
            uz: "Yuqoridagi rasmiy telefon raqami, Telegram yoki Instagram orqali markaz ma'muriyatiga to'g'ridan-to'g'ri murojaat qilishingiz va daraja aniqlash testiga yozilishingiz mumkin.",
            ru: 'Свяжитесь с администрацией напрямую по официальному телефону, в Telegram или Instagram, чтобы уточнить расписание и пройти тестирование уровня.',
            en: 'Reach out directly via the official phone number, Telegram, or Instagram listed on this page to confirm schedules and placement testing.',
          },
        },
        {
          q: {
            uz: "Bo'lib to'lash yoki chegirma bormi?",
            ru: 'Есть ли рассрочка или скидки?',
            en: 'Are installments or sibling discounts available?',
          },
          a: {
            uz: "Oyma-oy to'lov va Uzum Nasiya / Payme orqali bo'lib to'lash mavjud. Bir oiladan 2 ta farzandga 10% chegirma beriladi.",
            ru: 'Доступна помесячная оплата и рассрочка, а также семейная скидка 10% при обучении двух детей.',
            en: 'Monthly payment plans and installment options are supported, plus a 10% sibling discount.',
          },
        },
      ],
      galleryTags: [
        { uz: 'Zamonaviy sinf xonalari', ru: 'Современные аудитории', en: 'Modern Classrooms' },
        { uz: 'Mock Exam va kompyuter zali', ru: 'Зал пробных экзаменов и лаборатория', en: 'Mock Exam & Tech Lab' },
        { uz: 'Kutubxona va kovorking', ru: 'Библиотека и коворкинг', en: 'Study Lounge & Library' },
      ],
      facilities: spec.facilities,
      searchAliases: spec.aliases,
      createdAt: `2026-${String((idx % 10) + 1).padStart(2, '0')}-${String((idx % 25) + 1).padStart(2, '0')}T09:00:00Z`,
      viewsCount: randInt(1280, 14500),
      impressionsCount: randInt(8200, 52000),
      compareAppearances: randInt(180, 1450),
    };
  });

  // Generate 42 clearly fictional independent tutors across Uzbekistan
  const TUTOR_SUBJECT_POOL = [
    ['ielts', 'english'],
    ['ielts', 'cefr'],
    ['math', 'sat'],
    ['dtm', 'math'],
    ['physics', 'math'],
    ['chemistry', 'biology'],
    ['web', 'python'],
    ['russian', 'english'],
    ['korean', 'english'],
    ['kids', 'english'],
    ['design', 'web'],
    ['german', 'cefr'],
  ];

  const tutors: Tutor[] = Array.from({ length: 42 }, (_, idx) => {
    const isFemale = idx % 2 === 0;
    const fn = isFemale
      ? FIRST_NAMES_F[idx % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[idx % FIRST_NAMES_M.length];
    const lnBase = LAST_NAMES[(idx * 3 + 2) % LAST_NAMES.length];
    const ln = isFemale ? `${lnBase}a` : lnBase;
    const name = `${fn} ${ln}`;
    const slug = `${fn.toLowerCase()}-${ln.toLowerCase()}-${idx + 1}`;
    const city = idx < 28 ? CITIES[0] : CITIES[(idx % (CITIES.length - 1)) + 1];
    const district = city.districts[idx % city.districts.length];
    const subjects = TUTOR_SUBJECT_POOL[idx % TUTOR_SUBJECT_POOL.length];
    const categories = Array.from(new Set(subjects.map(getCategoryForSubject)));
    const hourly = 70000 + (idx % 9) * 20000;
    const lessonsPerWeek = idx % 3 === 0 ? 3 : 2;
    const monthlyPackage = hourly * lessonsPerWeek * 4;
    const vLevel =
      idx % 5 === 0
        ? VerificationLevel.UNVERIFIED
        : idx % 2 === 0
          ? VerificationLevel.STUDENT_CONFIRMED
          : VerificationLevel.DOCUMENT_VERIFIED;
    const exam = subjects.includes('ielts')
      ? 'IELTS'
      : subjects.includes('sat')
        ? 'SAT'
        : subjects.includes('dtm') || subjects.includes('biology')
          ? 'DTM'
          : subjects.includes('korean')
            ? 'TOPIK'
            : 'Mastery';
    const avgScore = exam === 'IELTS' ? Number((6.8 + (idx % 8) * 0.1).toFixed(1)) : exam === 'SAT' ? 1360 + (idx % 5) * 30 : 162 + (idx % 16);
    const targetStudents = randInt(9, 48);
    const successRate = randInt(78, 95);
    const rating = Math.round((4.5 + rng() * 0.48) * 10) / 10;

    return {
      id: `tutor-${idx + 1}`,
      slug,
      name,
      initials: `${fn[0]}${ln[0]}`,
      accentColor: ACCENTS[(idx + 2) % ACCENTS.length],
      headline: {
        uz: `${exam} bo'yicha individual repetitor · ${targetStudents} talaba maqsad ballini olgan`,
        ru: `Индивидуальный репетитор по ${exam} · ${targetStudents} учеников достигли целевого балла`,
        en: `1-on-1 ${exam} mentor · ${targetStudents} students reached their target score`,
      },
      bio: {
        uz: `Individual yondashuv asosida har bir o'quvchi uchun alohida dars rejasi tuzaman. Darslar davomida zaif tomonlar ustida chuqur ishlanadi va har 2 haftada natija nazorat qilinadi.`,
        ru: `Составляю персональную программу под цель каждого ученика. Фокусируемся на слабых темах и каждые 2 недели проводим контрольный срез.`,
        en: `I design a personalized study plan for every student, targeting weak sub-skills with bi-weekly timed mock assessments.`,
      },
      verificationLevel: vLevel,
      approvalStatus: ModerationStatus.APPROVED,
      isSponsored: idx === 1,
      planTier: idx % 4 === 0 ? PlanTier.PRO : PlanTier.FREE,
      rating,
      reviewCount: randInt(7, 46),
      subjects,
      categories,
      levels: [CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.UPPER_INTERMEDIATE, CourseLevel.ADVANCED],
      ageGroups: subjects.includes('kids') ? [AgeGroup.KIDS, AgeGroup.TEENS] : [AgeGroup.TEENS, AgeGroup.ADULTS],
      hourlyPriceUzs: hourly,
      monthlyPackageUzs: monthlyPackage,
      lessonsPerWeek,
      formats: idx % 3 === 0 ? [StudyFormat.ONLINE] : [StudyFormat.HYBRID, StudyFormat.OFFLINE, StudyFormat.ONLINE],
      schedules: [ScheduleSlot.MORNING, ScheduleSlot.EVENING, ScheduleSlot.WEEKEND],
      instructionLanguages: (idx % 2 === 0 ? ['uz', 'en'] : ['uz', 'ru', 'en']) as Language[],
      experienceYears: randInt(3, 12),
      certificates:
        exam === 'IELTS'
          ? ['IELTS 8.5 Overall', 'TESOL Certified']
          : exam === 'SAT'
            ? ['SAT 1510', 'New Uzbekistan Univ.']
            : exam === 'TOPIK'
              ? ['TOPIK Level 6']
              : ['National Olympiad Mentor', 'BSc Honors'],
      hasTopCertifiedTeachers: vLevel !== VerificationLevel.UNVERIFIED,
      freeTrial: idx % 4 !== 0,
      installmentsAvailable: false,
      cityId: city.id,
      districtId: district.id,
      addressLabel: {
        uz: `${city.name.uz}, ${district.name.uz}`,
        ru: `${city.name.ru}, ${district.name.ru}`,
        en: `${district.name.en}, ${city.name.en}`,
      },
      lat: Number((district.coords[0] + (rng() - 0.5) * 0.028).toFixed(5)),
      lng: Number((district.coords[1] + (rng() - 0.5) * 0.028).toFixed(5)),
      availabilitySlots: ['Du 18:00', 'Se 10:00', 'Chor 19:00', 'Pay 16:30', 'Jum 18:30', 'Shan 11:00'],
      introVideoDuration: '01:45',
      introVideoTopic: {
        uz: `${exam} imtihoniga 12 haftada tayyorlanish strategiyam`,
        ru: `Моя стратегия подготовки к ${exam} за 12 недель`,
        en: `My 12-week roadmap to your target ${exam} score`,
      },
      outcomeSummary: {
        headline: {
          uz: `${targetStudents} talaba ${exam === 'IELTS' ? 'IELTS 7.0+' : 'yuqori ball'} oldi · ${successRate}%`,
          ru: `${targetStudents} учеников получили ${exam === 'IELTS' ? 'IELTS 7.0+' : 'целевой балл'} · ${successRate}%`,
          en: `${targetStudents} students hit ${exam === 'IELTS' ? 'IELTS 7.0+' : 'target'} · ${successRate}%`,
        },
        exam,
        avgScore,
        successRatePercent: successRate,
        verifiedCount: targetStudents,
        sampleSize: targetStudents + randInt(4, 15),
        lastUpdated: '2026-11-12',
      },
      phone: `+998 90 ${300 + idx} ${10 + (idx % 80)} ${12 + (idx % 70)}`,
      telegram: `@${slug.replace(/-/g, '_')}`,
      createdAt: `2026-${String((idx % 10) + 1).padStart(2, '0')}-${String((idx % 26) + 1).padStart(2, '0')}T10:00:00Z`,
      viewsCount: randInt(220, 1800),
    };
  });

  // Generate 96 courses across centers and top tutors
  const courses: Course[] = [];
  centers.forEach((center, cIdx) => {
    center.subjects.slice(0, 3).forEach((subj, sIdx) => {
      const subjObj = ALL_SUBJECTS.find((s) => s.id === subj);
      const price = Math.round((center.priceFromUzs + sIdx * 120000) / 10000) * 10000;
      const lessonsPerWeek = sIdx === 0 ? 3 : sIdx === 1 ? 5 : 3;
      const level = sIdx === 0 ? CourseLevel.INTERMEDIATE : sIdx === 1 ? CourseLevel.UPPER_INTERMEDIATE : CourseLevel.BEGINNER;
      courses.push({
        id: `course-${cIdx}-${sIdx}`,
        slug: `${center.slug}-${subj}`,
        centerId: center.id,
        providerName: center.name,
        providerSlug: center.slug,
        providerType: 'center',
        title: {
          uz: `${subjObj?.name.uz || subj.toUpperCase()} — ${sIdx === 1 ? 'Intensiv' : 'Standart'} kurs`,
          ru: `${subjObj?.name.ru || subj.toUpperCase()} — ${sIdx === 1 ? 'Интенсив' : 'Стандарт'}`,
          en: `${subjObj?.name.en || subj.toUpperCase()} — ${sIdx === 1 ? 'Intensive' : 'Standard'} Track`,
        },
        subjectId: subj,
        categoryId: getCategoryForSubject(subj),
        priceMonthlyUzs: price,
        durationMonths: subj === 'ielts' || subj === 'sat' ? 4 : subj === 'web' || subj === 'python' ? 6 : 5,
        lessonsPerWeek,
        lessonDurationMin: 90,
        classSizeMax: center.maxClassSize,
        format: center.formats[sIdx % center.formats.length],
        level,
        ageGroup: center.ageGroups[0],
        schedules: center.schedules,
        instructionLanguages: center.instructionLanguages,
        seatsLeft: randInt(2, 9),
        nextStartDate: `2026-12-${String(randInt(1, 20)).padStart(2, '0')}`,
        freeTrial: center.freeTrial,
        installmentsAvailable: center.installmentsAvailable,
        certificateIncluded: true,
        syllabus: [
          { uz: '1-oy: Diagnostika, baza va asosiy strategiyalar', ru: 'Месяц 1: Диагностика, база и ключевые стратегии', en: 'Month 1: Diagnostic baseline and core frameworks' },
          { uz: '2-oy: Amaliy mashg‘ulotlar va haftalik mock testlar', ru: 'Месяц 2: Практика и еженедельные пробные тесты', en: 'Month 2: Applied drills and weekly full mock exams' },
          { uz: '3-4 oy: Xatolar tahlili va imtihon simulyatsiyasi', ru: 'Месяц 3–4: Разбор ошибок и симуляция экзамена', en: 'Month 3–4: Error clinic and timed exam simulations' },
        ],
        cityId: center.branches[0].cityId,
        districtId: center.branches[0].districtId,
      });
    });
  });

  // Generate 240 outcome entries across centers & tutors spanning 2022–2026 (including 8 pending items for Admin queue)
  const results: ResultEntry[] = [];
  for (let i = 0; i < 240; i++) {
    const isCenter = i < 192;
    const center = centers[i % centers.length];
    const tutor = tutors[i % tutors.length];
    const entityId = isCenter ? center.id : tutor.id;
    const entityName = isCenter ? center.name : tutor.name;
    const exam = isCenter ? center.outcomeSummary.exam : tutor.outcomeSummary.exam;
    const subjectId = isCenter ? center.subjects[0] : tutor.subjects[0];
    const year = 2022 + (i % 5);
    const fn = i % 2 === 0 ? FIRST_NAMES_F[i % FIRST_NAMES_F.length] : FIRST_NAMES_M[i % FIRST_NAMES_M.length];
    const ln = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const consent = i % 3 !== 0;

    let numericScore = 7.0;
    let beforeScore = 5.5;
    let scoreLabel = 'IELTS 7.0';
    if (exam === 'IELTS') {
      const bands = [6.0, 6.5, 6.5, 7.0, 7.0, 7.5, 7.5, 8.0, 8.5];
      numericScore = bands[i % bands.length];
      beforeScore = Math.max(4.5, Number((numericScore - 1.0 - (i % 3) * 0.5).toFixed(1)));
      scoreLabel = `IELTS ${numericScore.toFixed(1)}`;
    } else if (exam === 'SAT') {
      numericScore = 1280 + (i % 7) * 40;
      beforeScore = numericScore - 220;
      scoreLabel = `SAT ${numericScore}`;
    } else if (exam === 'DTM') {
      numericScore = 148 + (i % 8) * 5;
      beforeScore = numericScore - 48;
      scoreLabel = `DTM ${numericScore}/189`;
    } else {
      numericScore = 78 + (i % 20);
      beforeScore = Math.max(45, numericScore - 26);
      scoreLabel = `${exam} ${numericScore}%`;
    }

    const isPending = i >= 232;
    const vLevel = isPending
      ? VerificationLevel.UNVERIFIED
      : i % 5 === 0
        ? VerificationLevel.UNVERIFIED
        : i % 2 === 0
          ? VerificationLevel.STUDENT_CONFIRMED
          : VerificationLevel.DOCUMENT_VERIFIED;

    results.push({
      id: `res-${i + 1}`,
      entityId,
      entityType: isCenter ? 'center' : 'tutor',
      entityName,
      exam,
      subjectId,
      scoreLabel,
      numericScore,
      beforeScore,
      targetReached: exam === 'IELTS' ? numericScore >= 6.5 : true,
      universityAdmitted: i % 3 === 0 ? UNIVERSITIES[i % UNIVERSITIES.length] : undefined,
      cohortYear: year,
      sampleSize: randInt(18, 64),
      studentDisplayName: consent ? `${fn} ${ln[0]}.` : `Talaba #${1040 + i}`,
      studentConsentGiven: consent,
      verificationLevel: vLevel,
      moderationStatus: isPending ? ModerationStatus.PENDING : ModerationStatus.APPROVED,
      evidenceSummary:
        exam === 'IELTS'
          ? `TRF #26UZ${10000 + i} · British Council / IDP official report`
          : exam === 'SAT'
            ? `College Board Score Report #CB-${80000 + i}`
            : `Rasmiy sertifikat / qabul xati #UZ-${5000 + i}`,
      evidenceFileName: `certificate_${exam.toLowerCase().replace(/\s+/g, '_')}_${i + 1}.pdf`,
      verifiedAt: isPending ? undefined : `2026-10-${String((i % 26) + 1).padStart(2, '0')}T12:00:00Z`,
      createdAt: `2026-11-${String((i % 20) + 1).padStart(2, '0')}T11:30:00Z`,
    });
  }

  // Generate 212 realistic verified student reviews
  const PROS_POOL = [
    "O'qituvchilar har hafta mock test natijasini birma-bir tahlil qilib beradi.",
    'Kichik guruh va speaking amaliyoti juda kuchli tashkil etilgan.',
    'Narx va sifat nisbati Toshkentdagi eng adolatli variantlardan biri.',
    'Ota-onalar uchun haftalik davomat va ball hisoboti Telegramdan kelib turadi.',
    'Dars materiallari zamonaviy va imtihon formatiga to‘liq mos.',
  ];
  const CONS_POOL = [
    'Kechki 18:30 guruhlarida joylar tez to‘lib qoladi, oldindan yozilish kerak.',
    'Avtoturargoh ba’zan gavjum bo‘ladi, metroda kelish qulayroq.',
    'Uy vazifalari hajmi katta, har kuni kamida 2 soat ajratish zarur.',
    'Yozgi intensiv davrida speaking club vaqti biroz qisqaroq edi.',
  ];
  const COMMENTS_POOL = [
    "4 oy ichida IELTS 5.5 dan 7.0 ga chiqdim. Eng yoqqani — va'da emas, aniq haftalik testlar bo'ldi.",
    "Farzandimni DTM matematika va fizika guruhiga berdik, 169 ball bilan grantga kirdi.",
    "Sinov darsidayoq guruh darajasi aniq tekshirildi. Darslar tartibli va natijaga yo'naltirilgan.",
    "Boshqa 3 ta markazni Edupickda solishtirib shuni tanladik. Narx shaffof, qo'shimcha yashirin to'lov yo'q.",
    "Ustoz writing xatolarini alohida qizil qalam bilan tushuntirib beradi. 3 oyda katta o'sish sezildi.",
  ];

  const reviews: Review[] = Array.from({ length: 212 }, (_, i) => {
    const isCenter = i < 156;
    const entity = isCenter ? centers[i % centers.length] : tutors[i % tutors.length];
    const fn = i % 2 === 0 ? FIRST_NAMES_M[i % FIRST_NAMES_M.length] : FIRST_NAMES_F[i % FIRST_NAMES_F.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const rating = i % 13 === 0 ? 3 : i % 4 === 0 ? 4 : 5;
    const flagged = i === 12 || i === 45 || i === 89;

    return {
      id: `rev-${i + 1}`,
      entityId: entity.id,
      entityType: isCenter ? 'center' : 'tutor',
      authorId: `student-${(i % 60) + 1}`,
      authorName: `${fn} ${ln[0]}.`,
      rating,
      subRatings: {
        teaching: rating,
        results: Math.min(5, rating + (i % 2 === 0 ? 0 : 1)),
        value: Math.max(3, rating - (i % 5 === 0 ? 1 : 0)),
      },
      attendedMonths: randInt(2, 9),
      verifiedAttendance: true,
      attendanceCodeUsed: `ATT-${2026}${100 + i}`,
      pros: PROS_POOL[i % PROS_POOL.length],
      cons: CONS_POOL[i % CONS_POOL.length],
      comment: COMMENTS_POOL[i % COMMENTS_POOL.length],
      helpfulCount: randInt(1, 29),
      flagged,
      flagReason: flagged ? 'Shubhali takroriy matn / moderator tekshiruvi talab etiladi' : undefined,
      moderationStatus: ModerationStatus.APPROVED,
      reply:
        i % 3 === 0
          ? {
              text: "Fikringiz uchun rahmat! Keyingi oqimda kechki guruhlar sonini yana oshirdik.",
              repliedAt: '2026-11-15T14:20:00Z',
              responderName: `${entity.name} ma'muriyati`,
            }
          : undefined,
      createdAt: `2026-${String((i % 10) + 2).padStart(2, '0')}-${String((i % 26) + 1).padStart(2, '0')}T15:10:00Z`,
    };
  });

  // Seed initial bookings & B2B CRM leads
  const bookings: Booking[] = [
    {
      id: 'bk-seed-1',
      entityId: centers[0].id,
      entityType: 'center',
      entityName: centers[0].name,
      entitySlug: centers[0].slug,
      courseId: courses[0].id,
      courseTitle: courses[0].title.uz,
      branchAddress: centers[0].branches[0].address.uz,
      userId: 'demo-student',
      studentName: 'Anvar Asqarov',
      studentAge: 18,
      currentLevel: CourseLevel.INTERMEDIATE,
      goalText: 'IELTS 7.5 for WIUT admission',
      targetScoreOrUni: 'IELTS 7.5 · WIUT',
      phone: '+998 90 123 45 67',
      telegram: '@anvar_uz',
      date: '2026-11-29',
      timeSlot: '18:30',
      status: BookingStatus.CONFIRMED,
      paymentMethod: 'free',
      depositUzs: 0,
      reminderSent: true,
      feedbackSubmitted: false,
      createdAt: '2026-11-22T10:15:00Z',
    },
    {
      id: 'bk-seed-2',
      entityId: centers[2].id,
      entityType: 'center',
      entityName: centers[2].name,
      entitySlug: centers[2].slug,
      courseId: courses[6].id,
      courseTitle: courses[6].title.uz,
      branchAddress: centers[2].branches[0].address.uz,
      userId: 'demo-student',
      studentName: 'Anvar Asqarov',
      studentAge: 18,
      currentLevel: CourseLevel.UPPER_INTERMEDIATE,
      goalText: 'SAT 1450+ by Spring',
      targetScoreOrUni: 'SAT 1450',
      phone: '+998 90 123 45 67',
      telegram: '@anvar_uz',
      date: '2026-11-18',
      timeSlot: '16:00',
      status: BookingStatus.COMPLETED,
      paymentMethod: 'free',
      depositUzs: 0,
      reminderSent: true,
      feedbackSubmitted: false,
      createdAt: '2026-11-12T08:40:00Z',
    },
  ];

  const leads: Lead[] = [
    {
      id: 'lead-1',
      bookingId: 'bk-seed-1',
      entityId: centers[0].id,
      studentName: 'Anvar Asqarov',
      phone: '+998 90 123 45 67',
      telegram: '@anvar_uz',
      subject: 'IELTS',
      goal: 'IELTS 7.5 · WIUT',
      preferredSlot: '2026-11-29 18:30',
      status: LeadStatus.TRIAL_BOOKED,
      notes: "Kechki guruhni so'radi, sinov darsi tasdiqlangan.",
      createdAt: '2026-11-22T10:15:00Z',
      updatedAt: '2026-11-22T11:00:00Z',
    },
    {
      id: 'lead-2',
      entityId: centers[0].id,
      studentName: 'Madina Sobirova',
      phone: '+998 93 456 78 90',
      telegram: '@madina_s',
      subject: 'IELTS',
      goal: 'IELTS 7.0 by March',
      preferredSlot: '2026-11-30 10:00',
      status: LeadStatus.NEW,
      notes: 'Ota-onasi narx va jadval haqida so‘radi.',
      createdAt: '2026-11-24T09:10:00Z',
      updatedAt: '2026-11-24T09:10:00Z',
    },
    {
      id: 'lead-3',
      entityId: centers[0].id,
      studentName: 'Javohir Raximov',
      phone: '+998 99 812 34 11',
      telegram: '@javohir_r',
      subject: 'CEFR',
      goal: 'B2 sertifikat',
      preferredSlot: '2026-11-28 15:00',
      status: LeadStatus.CONTACTED,
      notes: 'Telegramda mock test havolasi yuborildi.',
      createdAt: '2026-11-23T14:20:00Z',
      updatedAt: '2026-11-24T08:00:00Z',
    },
    {
      id: 'lead-4',
      entityId: centers[0].id,
      studentName: 'Nilufar Karimova',
      phone: '+998 91 205 66 44',
      subject: 'IELTS',
      goal: 'IELTS 6.5+',
      preferredSlot: '2026-11-20 18:30',
      status: LeadStatus.ENROLLED,
      notes: "Sinov darsidan so'ng 4 oylik kursga yozildi.",
      createdAt: '2026-11-18T12:00:00Z',
      updatedAt: '2026-11-21T16:30:00Z',
    },
  ];

  const reports: Report[] = [
    {
      id: 'rep-1',
      entityId: 'res-15',
      entityType: 'result',
      entityLabel: `${centers[14].name} — IELTS 7.5 da'vosi`,
      reason: 'Sertifikat sanasi aniq emas',
      details: "Talaba bu kursda qancha muddat o'qigani ko'rsatilmagan, qayta tekshirishni so'rayman.",
      reporterPhone: '+998 90 555 22 11',
      status: 'open',
      createdAt: '2026-11-23T13:15:00Z',
    },
    {
      id: 'rep-2',
      entityId: 'rev-12',
      entityType: 'review',
      entityLabel: 'Sharh #rev-12',
      reason: 'Takroriy matn shubhasi',
      details: "Boshqa markaz sahifasidagi matnga juda o'xshash.",
      status: 'open',
      createdAt: '2026-11-24T09:45:00Z',
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      actorName: 'Moderator Dilshod',
      actorRole: UserRole.ADMIN,
      action: 'APPROVED_RESULT',
      target: 'Novus IELTS Lab — TRF #26UZ10001 (IELTS 7.5)',
      createdAt: '2026-11-24T10:15:00Z',
    },
    {
      id: 'aud-2',
      actorName: 'Moderator Dilshod',
      actorRole: UserRole.ADMIN,
      action: 'FLAGGED_REVIEW',
      target: 'Review #rev-12 (Duplicate check alert)',
      createdAt: '2026-11-24T09:50:00Z',
    },
  ];

  const guides: GuideArticle[] = [
    {
      id: 'guide-1',
      slug: 'how-to-choose-ielts-center-tashkent',
      category: { uz: 'IELTS qo‘llanma', ru: 'Гайд по IELTS', en: 'IELTS Guide' },
      title: {
        uz: "Toshkentda IELTS markazini qanday tanlash kerak: 6 ta real mezon",
        ru: 'Как выбрать IELTS-центр в Ташкенте: 6 реальных критериев',
        en: 'How to choose an IELTS center in Tashkent: 6 evidence-based criteria',
      },
      excerpt: {
        uz: "Instagramdagi 8.5 plakatlariga aldanmaslik uchun namuna hajmi, kirish darajasi va 1 dars narxini qanday tekshirish kerak.",
        ru: 'Как проверять размер выборки, стартовый уровень учеников и стоимость одного урока вместо рекламных баннеров 8.5.',
        en: 'How to inspect cohort sample size, baseline-to-final score delta, and true per-lesson cost instead of ad posters.',
      },
      readMinutes: 5,
      publishedAt: '2026-11-10',
      sections: [
        {
          heading: { uz: '1. O‘rtacha ball va namuna hajmini so‘rang', ru: '1. Смотрите на средний балл и выборку', en: '1. Ask for median scores and cohort sample size' },
          body: {
            uz: "Faqat bitta 8.0 olgan talaba markaz sifatini ko'rsatmaydi. Oxirgi 6 oyda imtihon topshirgan barcha talabalarning necha foizi 7.0+ olgani muhim.",
            ru: 'Один сертификат на 8.0 не отражает уровень всей группы. Важно видеть, какой процент выпускников за последние 6 месяцев достиг цели.',
            en: 'A single 8.0 poster does not represent typical results. Look at what percentage of the entire cohort hit 7.0+ over the past 6 months.',
          },
        },
        {
          heading: { uz: '2. 1 ta dars narxini hisoblang', ru: '2. Считайте цену одного урока', en: '2. Compare real price per lesson' },
          body: {
            uz: "Ba'zi markazlar oyiga 900 000 so'm bo'lib haftada 3 marta dars o'tadi (75 000 so'm/dars), boshqalari 1 200 000 so'mga haftada 5 marta dars beradi (60 000 so'm/dars).",
            ru: 'Курс за 900 000 сум 3 раза в неделю стоит 75 000 сум за урок, а интенсив за 1 200 000 сум 5 раз в неделю — всего 60 000 сум за урок.',
            en: 'A 900k UZS course meeting 3x/week costs 75k UZS per lesson, while a 1.2M UZS intensive meeting 5x/week costs only 60k UZS per lesson.',
          },
        },
      ],
    },
    {
      id: 'guide-2',
      slug: 'dtm-vs-sat-uzbekistan-universities',
      category: { uz: 'OTM qabul', ru: 'Поступление в вузы', en: 'Admissions' },
      title: {
        uz: "DTM yoki SAT + IELTS: 2027-yilgi abituriyentlar uchun taqqoslash",
        ru: 'ДТМ или SAT + IELTS: сравнение для абитуриентов 2027 года',
        en: 'DTM vs. SAT + IELTS: A practical comparison for Uzbekistan applicants',
      },
      excerpt: {
        uz: "Davlat universitetlari va xalqaro filiallar (WIUT, INHA, NewUU) uchun qaysi imtihon yo'li samaraliroq?",
        ru: 'Какая стратегия лучше подходит для государственных вузов и международных филиалов (WIUT, INHA, NewUU)?',
        en: 'Which exam strategy fits state universities versus international branches like WIUT, INHA, and New Uzbekistan University?',
      },
      readMinutes: 6,
      publishedAt: '2026-11-04',
      sections: [
        {
          heading: { uz: 'Vaqt va byudjet taqqoslashi', ru: 'Сравнение сроков и бюджета', en: 'Timeline and budget trade-offs' },
          body: {
            uz: "SAT va IELTS kombinatsiyasi xalqaro grantlar hamda NewUU/WIUT uchun eshik ochadi, DTM esa davlat tibbiyot va huquq yo'nalishlari uchun asosiy yo'l bo'lib qolmoqda.",
            ru: 'Связка SAT + IELTS открывает доступ к международным грантам и филиалам, тогда как ДТМ остаётся основным путём в государственные вузы.',
            en: 'SAT + IELTS unlocks international scholarships and branch campuses, whereas DTM remains mandatory for state medical, law, and national grants.',
          },
        },
      ],
    },
    {
      id: 'guide-3',
      slug: 'center-vs-private-tutor-checklist',
      category: { uz: 'Ota-onalar uchun', ru: 'Для родителей', en: 'For Parents' },
      title: {
        uz: "O'quv markazi yoki yakka repetitor: qachon qaysi biri foydali?",
        ru: 'Учебный центр или частный репетитор: что выбрать?',
        en: 'Learning center vs. private tutor: Which format fits your learner?',
      },
      excerpt: {
        uz: "Guruh dinamikasi, narx farqi va tez muddatli imtihon tayyorgarligi bo'yicha amaliy cheklist.",
        ru: 'Практический чеклист по групповой динамике, бюджету и подготовке в сжатые сроки.',
        en: 'A decision checklist comparing peer motivation, budget efficiency, and rapid exam turnaround.',
      },
      readMinutes: 4,
      publishedAt: '2026-10-28',
      sections: [
        {
          heading: { uz: 'Qachon markaz, qachon repetitor?', ru: 'Когда центр, а когда репетитор?', en: 'When to pick a center vs. a tutor' },
          body: {
            uz: "Agar imtihonga 6 oy+ vaqt bo'lsa va speaking muhiti kerak bo'lsa — markaz tejamkor. Agar 6–8 hafta ichida faqat Writing/Math bo'shliqlarini yopish kerak bo'lsa — repetitor tezroq natija beradi.",
            ru: 'Если до экзамена 6+ месяцев и важна среда общения — выгоднее центр. Если нужно закрыть конкретные пробелы за 6–8 недель — репетитор эффективнее.',
            en: 'With 6+ months and a need for peer speaking practice, a verified center offers stronger value. For targeted 6–8 week gap closing, a 1-on-1 tutor moves faster.',
          },
        },
      ],
    },
  ];

  return {
    centers,
    tutors,
    courses,
    results,
    reviews,
    bookings,
    leads,
    reports,
    auditLogs,
    guides,
  };
}
