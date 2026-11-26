import type { Language, LocalizedString } from '../types/domain';

export const BRAND_CONFIG = {
  name: 'Edupick',
  domain: 'edupick.uz',
  email: 'salom@edupick.uz',
  phone: '+998 71 200 45 90',
  telegram: 'https://t.me/edupick_uz',
  instagram: 'https://instagram.com/edupick.uz',
  primaryColor: '#3B4CCA',
  verifiedColor: '#16A34A',
  defaultLanguage: 'uz' as Language,
  mockOtpCode: '123456',
} as const;

export interface CityConfig {
  id: string;
  name: LocalizedString;
  coords: [number, number];
  districts: Array<{ id: string; name: LocalizedString; coords: [number, number] }>;
}

export const CITIES: CityConfig[] = [
  {
    id: 'tashkent',
    name: { uz: 'Toshkent shahri', ru: 'г. Ташкент', en: 'Tashkent City' },
    coords: [41.2995, 69.2401],
    districts: [
      { id: 'chilonzor', name: { uz: 'Chilonzor', ru: 'Чиланзар', en: 'Chilonzor' }, coords: [41.2752, 69.2036] },
      { id: 'yunusobod', name: { uz: 'Yunusobod', ru: 'Юнусабад', en: 'Yunusobod' }, coords: [41.3665, 69.2889] },
      { id: 'mirzo-ulugbek', name: { uz: "Mirzo Ulug'bek", ru: 'Мирзо-Улугбек', en: "Mirzo Ulug'bek" }, coords: [41.3385, 69.3346] },
      { id: 'yakkasaroy', name: { uz: 'Yakkasaroy', ru: 'Яккасарай', en: 'Yakkasaroy' }, coords: [41.2818, 69.2591] },
      { id: 'sergeli', name: { uz: 'Sergeli', ru: 'Сергели', en: 'Sergeli' }, coords: [41.2213, 69.2239] },
      { id: 'shayxontohur', name: { uz: 'Shayxontohur', ru: 'Шайхантахур', en: 'Shayxontohur' }, coords: [41.3219, 69.2435] },
      { id: 'mirobod', name: { uz: 'Mirobod', ru: 'Мирабад', en: 'Mirobod' }, coords: [41.2943, 69.2778] },
      { id: 'olmazor', name: { uz: 'Olmazor', ru: 'Алмазар', en: 'Olmazor' }, coords: [41.3496, 69.2189] },
      { id: 'uchtepa', name: { uz: 'Uchtepa', ru: 'Учтепа', en: 'Uchtepa' }, coords: [41.2945, 69.1684] },
    ],
  },
  {
    id: 'tashkent-region',
    name: { uz: 'Toshkent viloyati', ru: 'Ташкентская обл.', en: 'Tashkent Region' },
    coords: [41.4689, 69.5822],
    districts: [
      { id: 'chirchiq', name: { uz: 'Chirchiq', ru: 'Чирчик', en: 'Chirchik' }, coords: [41.4689, 69.5822] },
      { id: 'olmaliq', name: { uz: 'Olmaliq', ru: 'Алмалык', en: 'Almalyk' }, coords: [40.8447, 69.5983] },
      { id: 'angren', name: { uz: 'Angren', ru: 'Ангрен', en: 'Angren' }, coords: [41.0167, 70.1436] },
    ],
  },
  {
    id: 'samarkand',
    name: { uz: 'Samarqand viloyati', ru: 'Самаркандская обл.', en: 'Samarkand' },
    coords: [39.6542, 66.9597],
    districts: [
      { id: 'registon', name: { uz: 'Markaz (Registon)', ru: 'Центр (Регистан)', en: 'Center (Registan)' }, coords: [39.6548, 66.9757] },
      { id: 'sogdiana', name: { uz: "So'g'diyona", ru: 'Согдиана', en: 'Sogdiana' }, coords: [39.6691, 66.9212] },
    ],
  },
  {
    id: 'bukhara',
    name: { uz: 'Buxoro viloyati', ru: 'Бухарская обл.', en: 'Bukhara' },
    coords: [39.7747, 64.4286],
    districts: [
      { id: 'buxoro-markaz', name: { uz: 'Buxoro markazi', ru: 'Центр Бухары', en: 'Bukhara Center' }, coords: [39.7747, 64.4286] },
    ],
  },
  {
    id: 'andijan',
    name: { uz: 'Andijon viloyati', ru: 'Андижанская обл.', en: 'Andijan' },
    coords: [40.7821, 72.3442],
    districts: [
      { id: 'andijon-markaz', name: { uz: 'Bobur shoh ko‘chasi', ru: 'Проспект Бабура', en: 'Babur Ave' }, coords: [40.7821, 72.3442] },
    ],
  },
  {
    id: 'fergana',
    name: { uz: "Farg'ona viloyati", ru: 'Ферганская обл.', en: 'Fergana' },
    coords: [40.3864, 71.7864],
    districts: [
      { id: 'fargona-markaz', name: { uz: "Farg'ona shahri", ru: 'г. Фергана', en: 'Fergana City' }, coords: [40.3864, 71.7864] },
      { id: 'qoqon', name: { uz: "Qo'qon", ru: 'Коканд', en: 'Kokand' }, coords: [40.5286, 70.9425] },
      { id: 'margilon', name: { uz: "Marg'ilon", ru: 'Маргилан', en: 'Margilan' }, coords: [40.4711, 71.7247] },
    ],
  },
  {
    id: 'namangan',
    name: { uz: 'Namangan viloyati', ru: 'Наманганская обл.', en: 'Namangan' },
    coords: [41.0011, 71.6726],
    districts: [
      { id: 'namangan-markaz', name: { uz: 'Namangan shahri', ru: 'г. Наманган', en: 'Namangan City' }, coords: [41.0011, 71.6726] },
    ],
  },
  {
    id: 'qashqadaryo',
    name: { uz: 'Qashqadaryo viloyati', ru: 'Кашкадарьинская обл.', en: 'Kashkadarya' },
    coords: [38.8606, 65.7891],
    districts: [
      { id: 'qarshi', name: { uz: 'Qarshi shahri', ru: 'г. Карши', en: 'Karshi City' }, coords: [38.8606, 65.7891] },
      { id: 'shahrisabz', name: { uz: 'Shahrisabz', ru: 'Шахрисабз', en: 'Shahrisabz' }, coords: [39.0578, 66.8342] },
    ],
  },
  {
    id: 'surxondaryo',
    name: { uz: 'Surxondaryo viloyati', ru: 'Сурхандарьинская обл.', en: 'Surkhandarya' },
    coords: [37.2242, 67.2783],
    districts: [
      { id: 'termiz', name: { uz: 'Termiz shahri', ru: 'г. Термез', en: 'Termez City' }, coords: [37.2242, 67.2783] },
    ],
  },
  {
    id: 'xorazm',
    name: { uz: 'Xorazm viloyati', ru: 'Хорезмская обл.', en: 'Khorezm' },
    coords: [41.5500, 60.6333],
    districts: [
      { id: 'urganch', name: { uz: 'Urganch shahri', ru: 'г. Ургенч', en: 'Urgench City' }, coords: [41.5500, 60.6333] },
      { id: 'xiva', name: { uz: 'Xiva', ru: 'Хива', en: 'Khiva' }, coords: [41.3783, 60.3639] },
    ],
  },
  {
    id: 'navoiy',
    name: { uz: 'Navoiy viloyati', ru: 'Навоийская обл.', en: 'Navoiy' },
    coords: [40.0844, 65.3792],
    districts: [
      { id: 'navoiy-markaz', name: { uz: 'Navoiy shahri', ru: 'г. Навои', en: 'Navoiy City' }, coords: [40.0844, 65.3792] },
    ],
  },
  {
    id: 'jizzax',
    name: { uz: 'Jizzax viloyati', ru: 'Джизакская обл.', en: 'Jizzakh' },
    coords: [40.1158, 67.8422],
    districts: [
      { id: 'jizzax-markaz', name: { uz: 'Jizzax shahri', ru: 'г. Джизак', en: 'Jizzakh City' }, coords: [40.1158, 67.8422] },
    ],
  },
  {
    id: 'sirdaryo',
    name: { uz: 'Sirdaryo viloyati', ru: 'Сырдарьинская обл.', en: 'Syrdarya' },
    coords: [40.4897, 68.7842],
    districts: [
      { id: 'guliston', name: { uz: 'Guliston shahri', ru: 'г. Гулистан', en: 'Gulistan City' }, coords: [40.4897, 68.7842] },
    ],
  },
  {
    id: 'nukus',
    name: { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан', en: 'Karakalpakstan' },
    coords: [42.4619, 59.6166],
    districts: [
      { id: 'nukus-markaz', name: { uz: 'Nukus shahri', ru: 'г. Нукус', en: 'Nukus City' }, coords: [42.4619, 59.6166] },
    ],
  },
];

export interface SubjectCategoryConfig {
  id: string;
  name: LocalizedString;
  subcategories: Array<{ id: string; name: LocalizedString }>;
}

export const SUBJECT_TAXONOMY: SubjectCategoryConfig[] = [
  {
    id: 'languages',
    name: { uz: 'Xorijiy tillar', ru: 'Иностранные языки', en: 'Languages' },
    subcategories: [
      { id: 'ielts', name: { uz: 'IELTS', ru: 'IELTS', en: 'IELTS' } },
      { id: 'cefr', name: { uz: 'CEFR', ru: 'CEFR', en: 'CEFR' } },
      { id: 'toefl', name: { uz: 'TOEFL', ru: 'TOEFL', en: 'TOEFL' } },
      { id: 'english', name: { uz: 'Ingliz tili', ru: 'Английский язык', en: 'General English' } },
      { id: 'russian', name: { uz: 'Rus tili', ru: 'Русский язык', en: 'Russian' } },
      { id: 'korean', name: { uz: 'Koreys tili (TOPIK)', ru: 'Корейский (TOPIK)', en: 'Korean (TOPIK)' } },
      { id: 'german', name: { uz: 'Nemis tili', ru: 'Немецкий язык', en: 'German' } },
      { id: 'chinese', name: { uz: 'Xitoy tili (HSK)', ru: 'Китайский (HSK)', en: 'Chinese (HSK)' } },
    ],
  },
  {
    id: 'exact-sciences',
    name: { uz: 'Aniq va tabiiy fanlar', ru: 'Точные и естественные науки', en: 'Exact & Natural Sciences' },
    subcategories: [
      { id: 'math', name: { uz: 'Matematika', ru: 'Математика', en: 'Mathematics' } },
      { id: 'physics', name: { uz: 'Fizika', ru: 'Физика', en: 'Physics' } },
      { id: 'chemistry', name: { uz: 'Kimyo', ru: 'Химия', en: 'Chemistry' } },
      { id: 'biology', name: { uz: 'Biologiya', ru: 'Биология', en: 'Biology' } },
    ],
  },
  {
    id: 'entrance',
    name: { uz: 'OTM va kirish imtihonlari', ru: 'Подготовка к вузам', en: 'Entrance Exam Prep' },
    subcategories: [
      { id: 'dtm', name: { uz: 'DTM tayyorlov', ru: 'Подготовка к ДТМ', en: 'DTM Exam Prep' } },
      { id: 'sat', name: { uz: 'SAT', ru: 'SAT', en: 'SAT' } },
      { id: 'westminster', name: { uz: 'WIUT / INHA / MDIS', ru: 'WIUT / INHA / MDIS', en: 'WIUT / INHA / MDIS' } },
    ],
  },
  {
    id: 'it',
    name: { uz: 'IT va dasturlash', ru: 'IT и программирование', en: 'IT & Programming' },
    subcategories: [
      { id: 'web', name: { uz: 'Web dasturlash', ru: 'Веб-разработка', en: 'Web Development' } },
      { id: 'python', name: { uz: 'Python va Backend', ru: 'Python и Backend', en: 'Python & Backend' } },
      { id: 'design', name: { uz: 'UI/UX va grafik dizayn', ru: 'UI/UX и графический дизайн', en: 'UI/UX & Graphic Design' } },
      { id: 'data', name: { uz: 'Data Science & AI', ru: 'Data Science и AI', en: 'Data Science & AI' } },
    ],
  },
  {
    id: 'kids',
    name: { uz: 'Bolalar va maktab', ru: 'Для детей и школьников', en: 'Kids & School' },
    subcategories: [
      { id: 'kids', name: { uz: 'Bolalar uchun kurslar', ru: 'Курсы для детей', en: 'Kids Programs' } },
      { id: 'mental-math', name: { uz: 'Mental arifmetika', ru: 'Ментальная арифметика', en: 'Mental Arithmetic' } },
    ],
  },
  {
    id: 'creative',
    name: { uz: "San'at va kasbiy ko'nikmalar", ru: 'Творчество и профессии', en: 'Arts & Pro Skills' },
    subcategories: [
      { id: 'arts', name: { uz: 'Rassomlik va musiqa', ru: 'Рисование и музыка', en: 'Arts & Music' } },
      { id: 'accounting', name: { uz: 'Buxgalteriya va moliya', ru: 'Бухгалтерия и финансы', en: 'Accounting & Finance' } },
    ],
  },
];

export const ALL_SUBJECTS = SUBJECT_TAXONOMY.flatMap((cat) =>
  cat.subcategories.map((sub) => ({ ...sub, categoryId: cat.id }))
);

export const QUICK_SUBJECT_CHIPS = [
  'ielts',
  'math',
  'english',
  'dtm',
  'web',
  'sat',
  'russian',
  'korean',
  'kids',
];

export interface FacilityConfig {
  id: import('../types/domain').FacilityId;
  name: LocalizedString;
  description: LocalizedString;
}

export const FACILITIES_CATALOG: FacilityConfig[] = [
  {
    id: 'coworking',
    name: { uz: 'Kovorking hududi', ru: 'Коворкинг-зона', en: 'Coworking Zone' },
    description: {
      uz: "Darsdan tashqari mustaqil tayyorgarlik uchun qulay stol va rozetkalar",
      ru: 'Удобная зона для самостоятельной работы вне уроков',
      en: 'Dedicated study desks and power outlets for self-study',
    },
  },
  {
    id: 'mock_exam_hall',
    name: { uz: 'Mock Exam zali', ru: 'Зал пробных экзаменов', en: 'Mock Exam Lab' },
    description: {
      uz: 'Real IELTS / Digital SAT / DTM sharoitidagi haftalik sinov imtihonlari',
      ru: 'Еженедельные пробные тесты в условиях реального экзамена',
      en: 'Weekly exam-condition IELTS / Digital SAT / DTM mock hall',
    },
  },
  {
    id: 'academic_support',
    name: { uz: 'Academic Support (2-ustoz)', ru: 'Academic Support (2-й учитель)', en: 'Academic Support Tutor' },
    description: {
      uz: "Qoldirilgan mavzular va uy vazifalari bo'yicha bepul yordamchi ustoz",
      ru: 'Второй преподаватель для отработки пропусков и сложных тем',
      en: 'Assistant instructors for makeup lessons and homework help',
    },
  },
  {
    id: 'speaking_club',
    name: { uz: 'Speaking Club & Tadbirlar', ru: 'Speaking Club и ивенты', en: 'Sunday Speaking Clubs' },
    description: {
      uz: 'Yakshanba kungi jonli suhbat klublari, debatlar va kino kunlari',
      ru: 'Воскресные разговорные клубы, дебаты и киновечера',
      en: 'Weekend speaking clubs, debates, and guest seminars',
    },
  },
  {
    id: 'student_app',
    name: { uz: 'Mobil ilova va LMS', ru: 'Мобильное приложение / LMS', en: 'Student App & LMS' },
    description: {
      uz: 'Davomat, uy vazifasi va ballarni kuzatish uchun shaxsiy kabinet',
      ru: 'Приложение для отслеживания посещаемости, ДЗ и прогресса',
      en: 'Digital portal for attendance, homework, and parent tracking',
    },
  },
  {
    id: 'computer_lab',
    name: { uz: 'Kompyuter / iMac xonasi', ru: 'Компьютерный / iMac класс', en: 'Computer / iMac Lab' },
    description: {
      uz: 'Dasturlash, dizayn va kompyuterli imtihonlar uchun zamonaviy texnika',
      ru: 'Современные ПК и iMac для IT-практики и цифровых тестов',
      en: 'Modern workstations for coding, design, and computer-based tests',
    },
  },
  {
    id: 'library',
    name: { uz: 'Kutubxona', ru: 'Библиотека', en: 'Study Library' },
    description: {
      uz: 'Rasmiy Cambridge, Oxford, SAT va DTM darsliklari jamlanmasi',
      ru: 'Официальные учебники Cambridge, Oxford, SAT и ДТМ',
      en: 'Curated library of official Cambridge, SAT, and DTM materials',
    },
  },
  {
    id: 'career_center',
    name: { uz: 'Karyera / Qabul yordami', ru: 'Центр карьеры и поступления', en: 'Admissions & Career Hub' },
    description: {
      uz: 'Xorijiy OTMga hujjat topshirish yoki IT kompaniyalarga ishga joylashish',
      ru: 'Помощь с поступлением в вузы или трудоустройством в IT',
      en: 'University admissions counseling or IT job placement support',
    },
  },
  {
    id: 'wifi',
    name: { uz: 'Tezkor Wi-Fi', ru: 'Высокоскоростной Wi-Fi', en: 'High-Speed Wi-Fi' },
    description: {
      uz: "Barcha sinf xonalari va kovorkingda barqaror internet",
      ru: 'Стабильный интернет во всех аудиториях и коворкинге',
      en: 'Reliable fiber Wi-Fi across classrooms and lounges',
    },
  },
  {
    id: 'ac_classrooms',
    name: { uz: 'Konditsioner va Smart doska', ru: 'Кондиционер и Smart-доска', en: 'AC & Smart Classrooms' },
    description: {
      uz: 'Yorug‘, salqin va interaktiv proyektor/smart-ekranli xonalar',
      ru: 'Светлые аудитории с кондиционерами и интерактивными экранами',
      en: 'Climate-controlled rooms equipped with smart displays',
    },
  },
  {
    id: 'cafe_water',
    name: { uz: 'Kofe-choy va dam olish zonasi', ru: 'Кофе-зона и лаунж', en: 'Coffee & Lounge Area' },
    description: {
      uz: 'Tanaffuslarda ichimlik suv, kofe-point va kutish hududi',
      ru: 'Питьевая вода, кофе-поинт и комфортная зона ожидания',
      en: 'Refreshments, coffee point, and parent waiting lounge',
    },
  },
  {
    id: 'parking',
    name: { uz: 'Metro yaqinida / Parkovka', ru: 'Рядом с метро / Парковка', en: 'Metro Access & Parking' },
    description: {
      uz: 'Metro bekatidan piyoda masofada va qulay avtoturargoh',
      ru: 'В пешей доступности от метро и удобная парковка',
      en: 'Walking distance from metro with convenient parking',
    },
  },
];

