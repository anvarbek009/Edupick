import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { UserRole } from '../types/domain';
import { getLocalized } from '../utils/format';
import { useSEO } from '../hooks/useSEO';

export const ForCentersPage: React.FC = () => {
  const { language, quickDemoLogin } = useAppStore();
  const t = getDictionary(language);
  useSEO({ title: t.nav.forCenters, description: t.landing.b2bDesc });

  const b2bEyebrow =
    language === 'ru'
      ? `${BRAND_CONFIG.name} B2B · Для учебных центров и репетиторов`
      : language === 'en'
        ? `${BRAND_CONFIG.name} B2B · For learning centers and tutors`
        : `${BRAND_CONFIG.name} B2B · O‘quv markazlari va repetitorlar uchun`;

  const pillars =
    language === 'ru'
      ? [
          {
            title: '01. Доверие через подтверждённые результаты',
            desc: 'Реклама в Instagram дорожает. Реальные сертификаты IELTS, SAT и ДТМ завоевывают доверие родителей в 3 раза быстрее.',
          },
          {
            title: '02. Осознанные обращения от учеников',
            desc: 'Абитуриенты, заранее изучившие цены, филиалы и результаты, приходят готовыми к обучению.',
          },
          {
            title: '03. Кабинет центра и рыночная аналитика',
            desc: 'Управляйте профилем, публикуйте подтверждённые сертификаты и сравнивайте показатели по региону.',
          },
        ]
      : language === 'en'
        ? [
            {
              title: '01. Trust built on verified outcomes',
              desc: 'Instagram ads keep getting pricier. Document-verified IELTS, SAT, and DTM results earn parent trust 3x faster.',
            },
            {
              title: '02. High-intent student inquiries',
              desc: 'Students and parents who review prices, branches, and score distributions upfront convert much better.',
            },
            {
              title: '03. Center portal & market benchmarks',
              desc: 'Manage your public profile, upload cohort proofs, and benchmark tuition against your district.',
            },
          ]
        : [
            {
              title: '01. Tasdiqlangan natijalar ishonchi',
              desc: 'Instagram reklamasi qimmatlashmoqda. Real IELTS/SAT/DTM sertifikatlari ota-onalar ishonchini 3 barobar tezroq qozonadi.',
            },
            {
              title: '02. Onali va tayyor murojaatlar',
              desc: 'Narx, manzil va natijalarni oldindan ko‘rib kelgan o‘quvchilar bilan konversiya ancha yuqori bo‘ladi.',
            },
            {
              title: '03. Markaz kabineti va bozor analitikasi',
              desc: 'Profil, kurslar va tasdiqlangan natijalarni bitta oynada boshqaring hamda tumaningiz bozorini kuzating.',
            },
          ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="rounded-3xl bg-[#3B4CCA] p-8 sm:p-12 text-white space-y-4">
        <p className="text-xs font-semibold text-indigo-200">{b2bEyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
          {t.landing.b2bTitle}
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-indigo-100 leading-relaxed">
          {t.landing.b2bDesc}
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/dashboard/center"
            onClick={() => quickDemoLogin(UserRole.CENTER)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#3B4CCA] hover:bg-indigo-50 transition-colors"
          >
            <span>{t.landing.b2bCta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"
          >
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">{item.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VerificationPage: React.FC = () => {
  const { language } = useAppStore();
  const t = getDictionary(language);
  useSEO({ title: t.nav.verification, description: t.landing.trustSubtitle });

  const antiFakeTitle =
    language === 'ru'
      ? 'Наши анти-фейк принципы:'
      : language === 'en'
        ? 'Our anti-fake principles:'
        : 'Anti-fake tamoyillarimiz:';

  const rule2 =
    language === 'ru'
      ? 'Учебные центры не могут удалять негативные отзывы — они могут лишь опубликовать официальный ответ или подать апелляцию.'
      : language === 'en'
        ? 'Learning centers cannot delete critical reviews — they can only post an official reply or file a moderation review.'
        : 'O‘quv markazlari salbiy sharhlarni o‘chira olmaydi — faqat rasmiy javob yozishi yoki shikoyat yuborishi mumkin.';

  const rule3 =
    language === 'ru'
      ? 'Личные данные несовершеннолетних учеников защищены, а публикация имени полностью добровольна.'
      : language === 'en'
        ? 'Minor students’ personal information is protected and displaying full names is strictly optional.'
        : 'Voyaga yetmagan talabalarning shaxsiy ma’lumotlari himoyalanadi va ism ko‘rsatish ixtiyoriy.';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.verification.howWeVerify}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{t.landing.trustSubtitle}</p>
      </div>

      <div className="space-y-4">
        {[
          { Icon: ShieldCheck, color: 'text-emerald-600', title: t.verification.student_confirmed, desc: t.verification.studentDesc },
          { Icon: Shield, color: 'text-[#3B4CCA]', title: t.verification.document_verified, desc: t.verification.documentDesc },
          { Icon: ShieldAlert, color: 'text-slate-500', title: t.verification.unverified, desc: t.verification.unverifiedDesc },
        ].map((tier) => (
          <div
            key={tier.title}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-start gap-4"
          >
            <tier.Icon className={`h-7 w-7 shrink-0 ${tier.color}`} />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{tier.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{tier.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-6 text-sm text-slate-700 dark:text-slate-300 space-y-2">
        <p className="font-bold text-slate-900 dark:text-white">{antiFakeTitle}</p>
        <ul className="space-y-1.5 text-xs sm:text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{t.verification.methodologyNote}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{rule2}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{rule3}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export const GuidesPage: React.FC = () => {
  const { language, guides } = useAppStore();
  const t = getDictionary(language);
  const [selectedId, setSelectedId] = useState(guides[0]?.id);
  useSEO({ title: t.nav.guides, description: t.landing.heroSubtitle });

  const active = guides.find((g) => g.id === selectedId) || guides[0];

  const subtitle =
    language === 'ru'
      ? 'Независимые руководства для абитуриентов и родителей Узбекистана.'
      : language === 'en'
        ? 'Unbiased selection guides for students and parents across Uzbekistan.'
        : 'O‘zbekistondagi abituriyentlar va ota-onalar uchun xolis tanlov qo‘llanmalari.';

  const ctaLabel =
    language === 'ru'
      ? 'Смотреть проверенные центры'
      : language === 'en'
        ? 'Browse verified centers'
        : 'Tasdiqlangan markazlarni ko‘rish';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.nav.guides}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-3">
          {guides.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedId(g.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                active.id === g.id
                  ? 'border-[#3B4CCA] bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <p className="text-[11px] font-semibold text-[#3B4CCA] dark:text-indigo-400">
                {getLocalized(g.category, language)} · {g.readMinutes} min
              </p>
              <h2 className="mt-1 font-display text-sm font-bold text-slate-900 dark:text-white">
                {getLocalized(g.title, language)}
              </h2>
            </button>
          ))}
        </div>

        <article className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
          <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {getLocalized(active.category, language)} · {active.publishedAt}
          </p>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {getLocalized(active.title, language)}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {getLocalized(active.excerpt, language)}
          </p>
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {active.sections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {getLocalized(sec.heading, language)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {getLocalized(sec.body, language)}
                </p>
              </div>
            ))}
          </div>
          <Link
            to="/search?subject=ielts"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#3B4CCA] hover:bg-[#3140b0] px-4 text-xs font-semibold text-white transition-colors"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      </div>
    </div>
  );
};

export const StaticInfoPage: React.FC<{ page: 'about' | 'contact' | 'privacy' | 'terms' }> = ({ page }) => {
  const { language, pushToast, requestDataDeletion } = useAppStore();
  const t = getDictionary(language);
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');

  const titles = {
    about: t.footer.about,
    contact: t.footer.contact,
    privacy: t.footer.privacy,
    terms: t.footer.terms,
  };

  useSEO({ title: titles[page], description: t.footer.tagline });

  const copy = {
    about1:
      language === 'ru'
        ? `${BRAND_CONFIG.name} — независимая платформа для выбора учебных центров и репетиторов Узбекистана по подтверждённым результатам учеников, а не по рекламе.`
        : language === 'en'
          ? `${BRAND_CONFIG.name} is an independent platform for choosing learning centers and tutors in Uzbekistan using verified student outcomes instead of ads.`
          : `${BRAND_CONFIG.name} — O‘zbekistondagi o‘quv markazlari va mustaqil repetitorlarni reklama emas, haqiqiy tasdiqlangan talaba natijalari bo‘yicha tanlash imkonini beruvchi mustaqil platforma.`,
    about2:
      language === 'ru'
        ? 'Мы объединили прозрачные цены в UZS, расчёт стоимости одного занятия и проверенную статистику IELTS, SAT, IT и ДТМ по всем 14 регионам Узбекистана.'
        : language === 'en'
          ? 'We bring together transparent UZS tuition, price-per-lesson calculators, and verified IELTS, SAT, IT, and DTM statistics across all 14 regions of Uzbekistan.'
          : 'Biz Toshkent va barcha 14 viloyat bo‘ylab shaffof UZS narxlari, 1 dars narxi hisobi va tasdiqlangan IELTS/SAT/IT/DTM statistikalarini bir joyga jamladik.',
    phoneLabel: language === 'ru' ? 'Телефон' : language === 'en' ? 'Phone' : 'Telefon',
    emailPh: language === 'ru' ? 'Email или Telegram' : language === 'en' ? 'Email or Telegram' : 'Email yoki Telegram',
    msgPh:
      language === 'ru'
        ? 'Ваш вопрос или предложение о сотрудничестве...'
        : language === 'en'
          ? 'Your question or partnership inquiry...'
          : 'Savolingiz yoki hamkorlik taklifingiz...',
    sentToast:
      language === 'ru'
        ? 'Сообщение получено. Ответим в течение 1 рабочего дня!'
        : language === 'en'
          ? 'Message received. We will reply within 1 business day!'
          : 'Xabaringiz qabul qilindi. 1 ish kuni ichida javob beramiz!',
    legal1:
      language === 'ru'
        ? 'Номера телефонов пользователей и данные несовершеннолетних учеников не передаются третьим лицам. Имена в таблицах результатов публикуются только с согласия.'
        : language === 'en'
          ? 'User phone numbers and minor students’ personal data are never sold to third parties. Student names appear in outcome records only with explicit consent.'
          : 'Foydalanuvchilarning telefon raqamlari va voyaga yetmagan talabalar ma’lumotlari uchinchi shaxslarga sotilmaydi. Natijalar jadvalida talaba ismi faqat ochiq rozilik asosida ko‘rsatiladi.',
    legal2:
      language === 'ru'
        ? 'Рейтинги и уровни верификации присваиваются на основе независимого аудита. Платные размещения всегда помечаются как реклама.'
        : language === 'en'
          ? 'Ratings and verification badges are assigned via independent audits. Sponsored placements are always clearly labeled.'
          : 'Platformadagi reytinglar va tasdiqlash darajalari mustaqil audit asosida beriladi. Pulli reklama joylashuvlari doimo ‘Reklama’ yorlig‘i bilan belgilanadi.',
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
        {titles[page]}
      </h1>

      {page === 'about' && (
        <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>{copy.about1}</p>
          <p>{copy.about2}</p>
        </div>
      )}

      {page === 'contact' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!msg.trim()) return;
            pushToast(copy.sentToast, 'success');
            setMsg('');
            setEmail('');
          }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {copy.phoneLabel}: <strong className="font-mono text-slate-900 dark:text-white">{BRAND_CONFIG.phone}</strong> · Email:{' '}
            <strong className="text-slate-900 dark:text-white">{BRAND_CONFIG.email}</strong>
          </p>
          <input
            required
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.emailPh}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <textarea
            required
            rows={4}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={copy.msgPh}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="h-10 rounded-xl bg-[#3B4CCA] hover:bg-[#3140b0] px-5 text-xs font-semibold text-white transition-colors"
          >
            {t.common.submit}
          </button>
        </form>
      )}

      {(page === 'privacy' || page === 'terms') && (
        <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>{copy.legal1}</p>
          <p>{copy.legal2}</p>
          {page === 'privacy' && (
            <button
              type="button"
              onClick={requestDataDeletion}
              className="h-10 rounded-xl border border-rose-300 dark:border-rose-800 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              {t.footer.dataDeletion}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  const { language } = useAppStore();
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center space-y-4">
      <p className="font-mono text-4xl font-extrabold text-[#3B4CCA]">404</p>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        {language === 'ru' ? 'Страница не найдена' : language === 'en' ? 'Page not found' : 'Sahifa topilmadi'}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {language === 'ru'
          ? 'Запрошенная страница перемещена или не существует.'
          : language === 'en'
            ? 'The page you are looking for has been moved or does not exist.'
            : 'Siz izlayotgan sahifa ko‘chirilgan yoki mavjud emas.'}
      </p>
      <Link
        to="/"
        className="inline-flex h-11 items-center rounded-xl bg-[#3B4CCA] hover:bg-[#3140b0] px-6 text-sm font-semibold text-white transition-colors"
      >
        {language === 'ru' ? 'На главную' : language === 'en' ? 'Back to Home' : 'Bosh sahifaga qaytish'}
      </Link>
    </div>
  );
};
