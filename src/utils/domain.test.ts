import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePricePerLesson,
  computeCompareRadarScore,
  DEFAULT_FILTERS,
  detectDuplicateReview,
  filterAndSortCenters,
  formatUzPhone,
  formatUzs,
  generateBookingIcs,
  haversineDistanceKm,
  isValidUzPhone,
} from './format';
import { VerificationLevel } from '../types/domain';
import { buildSeedDataset } from '../data/seed';

test('formatUzs formats UZS with thin spaces and localized suffix', () => {
  assert.equal(formatUzs(1200000, 'uz'), "1\u2009200\u2009000 so'm");
  assert.equal(formatUzs(850000, 'ru'), '850\u2009000 сум');
  assert.equal(formatUzs(950000, 'en'), '950\u2009000 UZS');
});

test('calculatePricePerLesson divides monthly price by monthly lessons', () => {
  assert.equal(calculatePricePerLesson(1200000, 3), 100000);
  assert.equal(calculatePricePerLesson(960000, 4), 60000);
});

test('formatUzPhone masks digits into +998 XX XXX XX XX and validates properly', () => {
  const masked = formatUzPhone('998901234567');
  assert.equal(masked, '+998 90 123 45 67');
  assert.equal(isValidUzPhone(masked), true);
  assert.equal(isValidUzPhone('+998 90 123'), false);
});

test('haversineDistanceKm returns realistic distance between Chilonzor and Yunusobod', () => {
  const km = haversineDistanceKm(41.2752, 69.2036, 41.3665, 69.2889);
  assert.ok(km > 10 && km < 15, `Expected 10-15 km, got ${km}`);
});

test('computeCompareRadarScore rewards verified high outcomes and reasonable pricing', () => {
  const score = computeCompareRadarScore({
    verificationLevel: VerificationLevel.STUDENT_CONFIRMED,
    successRatePercent: 86,
    monthlyPriceUzs: 1100000,
    hasTopCertifiedTeachers: true,
    rating: 4.8,
    reviewCount: 42,
    branchCount: 2,
  });
  assert.ok(score.results >= 85);
  assert.ok(score.teachers >= 90);
  assert.ok(score.reviews >= 90);
});

test('generateBookingIcs produces valid VCALENDAR payload', () => {
  const ics = generateBookingIcs({
    id: 'bk-1',
    title: 'IELTS Trial Lesson',
    location: 'Chilonzor, Tashkent',
    date: '2026-12-01',
    timeSlot: '18:30',
    description: 'Trial lesson via Edupick',
  });
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('DTSTART:20261201T183000'));
  assert.ok(ics.includes('SUMMARY:IELTS Trial Lesson'));
});

test('detectDuplicateReview identifies duplicate review copy regardless of punctuation', () => {
  assert.equal(
    detectDuplicateReview(['Great IELTS teachers and clear mock tests!'], 'great ielts teachers and clear mock tests'),
    true
  );
  assert.equal(
    detectDuplicateReview(['Great IELTS teachers and clear mock tests!'], 'Completely different honest student review here.'),
    false
  );
});

test('filterAndSortCenters finds real Uzbekistan LCs via multi-token aliases and filters by facilities', () => {
  const { centers } = buildSeedDataset();
  assert.ok(centers.length >= 35, `Expected at least 35 real Uzbekistan LCs, got ${centers.length}`);

  const satMatches = filterAndSortCenters(centers, { ...DEFAULT_FILTERS, q: 'sat tashkent' });
  assert.ok(
    satMatches.some((c) => c.slug === 'satashkent'),
    'Expected "sat tashkent" query to match SATashkent'
  );

  const cambridgeMatches = filterAndSortCenters(centers, { ...DEFAULT_FILTERS, q: 'cambridge' });
  assert.ok(
    cambridgeMatches.some((c) => c.slug === 'cambridge-learning-centre'),
    'Expected "cambridge" query to match Cambridge Learning Centre'
  );

  const registonMatches = filterAndSortCenters(centers, { ...DEFAULT_FILTERS, q: 'registan' });
  assert.ok(
    registonMatches.some((c) => c.slug === 'registon-oquv-markazi'),
    'Expected "registan" alias query to match Registon O\'quv Markazi'
  );

  const coworkingCenters = filterAndSortCenters(centers, { ...DEFAULT_FILTERS, facility: 'coworking' });
  assert.ok(coworkingCenters.length > 0);
  assert.ok(coworkingCenters.every((c) => c.facilities.includes('coworking')));
});

test('dataset covers all 14 Uzbekistan viloyatlar, 2022-2026 metrics, 3 campus photos, and authoritative ranking', () => {
  const { centers, results } = buildSeedDataset();
  assert.ok(centers.length >= 65, `Expected at least 65 real LCs, got ${centers.length}`);

  const expectedRegions = [
    'tashkent',
    'tashkent-region',
    'samarkand',
    'bukhara',
    'andijan',
    'fergana',
    'namangan',
    'qashqadaryo',
    'surxondaryo',
    'xorazm',
    'navoiy',
    'jizzax',
    'sirdaryo',
    'nukus',
  ];
  for (const regionId of expectedRegions) {
    const regional = filterAndSortCenters(centers, { ...DEFAULT_FILTERS, city: regionId });
    assert.ok(regional.length > 0, `Expected at least 1 LC in region "${regionId}"`);
  }

  for (const c of centers) {
    assert.equal(c.campusPhotos.length, 3, `Expected 3 campus photos for ${c.name}`);
    assert.deepEqual(
      c.yearlyMetrics.map((m) => m.year),
      [2022, 2023, 2024, 2025, 2026],
      `Expected 2022-2026 yearlyMetrics for ${c.name}`
    );
    assert.ok(c.authorityScore >= 65 && c.authorityScore <= 100);
    assert.ok(c.googleRating >= 4.5 && c.googleRating <= 5.0);
  }

  const ranked = filterAndSortCenters(centers, DEFAULT_FILTERS);
  const top5Slugs = ranked.slice(0, 5).map((c) => c.slug);
  assert.ok(
    top5Slugs.includes('cambridge-learning-centre') ||
      top5Slugs.includes('inter-nation-english-school') ||
      top5Slugs.includes('registon-oquv-markazi'),
    `Expected top authoritative flagship LCs in top 5, got: ${top5Slugs.join(', ')}`
  );

  const yearsPresent = new Set(results.map((r) => r.cohortYear));
  for (const y of [2022, 2023, 2024, 2025, 2026]) {
    assert.ok(yearsPresent.has(y), `Expected verified result entries for year ${y}`);
  }
});

