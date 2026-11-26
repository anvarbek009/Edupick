import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Send, Instagram, Phone, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BRAND_CONFIG } from '../config/brand';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { Language } from '../types/domain';

export const Footer: React.FC = () => {
  const { language, setLanguage, requestDataDeletion } = useAppStore();
  const t = getDictionary(language);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <a
                href={BRAND_CONFIG.telegram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href={BRAND_CONFIG.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={`tel:${BRAND_CONFIG.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="tabular-nums">{BRAND_CONFIG.phone}</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.footer.platform}</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/search" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.directory}</Link></li>
              <li><Link to="/compare" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.compare}</Link></li>
              <li><Link to="/matchmaker" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.matchmaker}</Link></li>
              <li>
                <Link to="/ielts/tashkent/chilonzor" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {language === 'ru'
                    ? 'IELTS · Ташкент · Чиланзар'
                    : language === 'en'
                      ? 'IELTS · Tashkent · Chilonzor'
                      : 'IELTS · Toshkent · Chilonzor'}
                </Link>
              </li>
              <li><Link to="/guides" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.guides}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.footer.company}</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/for-centers" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.forCenters}</Link></li>
              <li><Link to="/verification" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.verification}</Link></li>
              <li><Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.footer.about}</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.footer.contact}</Link></li>
              <li><Link to="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.nav.adminPanel}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.footer.legal}</h3>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.footer.privacy}</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t.footer.terms}</Link></li>
              <li>
                <button
                  type="button"
                  onClick={requestDataDeletion}
                  className="text-left hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {t.footer.dataDeletion}
                </button>
              </li>
            </ul>

            {/* Language Switcher & PWA Install Button */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {(['uz', 'ru', 'en'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    language === code
                      ? 'bg-[#3B4CCA] text-white'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            {!isInstalled && (isInstallable || isIOS) && (
              <button
                type="button"
                onClick={() => (isInstallable ? install() : setShowIOSGuide(true))}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.common.installApp}</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND_CONFIG.name}.{' '}
            {language === 'ru'
              ? 'Ташкент, Узбекистан.'
              : language === 'en'
                ? 'Tashkent, Uzbekistan.'
                : 'Toshkent, O‘zbekiston.'}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>{t.verification.methodologyNote}</span>
          </p>
        </div>
      </div>

      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800"
          >
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.common.installApp} (iPhone / iPad)
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'ru' ? (
                <>
                  1. Нажмите кнопку <strong>Поделиться (Share)</strong> внизу Safari.
                  <br />
                  2. Выберите <strong>На экран «Домой»</strong>.
                </>
              ) : language === 'en' ? (
                <>
                  1. Tap the <strong>Share</strong> button in Safari&apos;s bottom bar.
                  <br />
                  2. Select <strong>Add to Home Screen</strong>.
                </>
              ) : (
                <>
                  1. Safari pastki panelidan <strong>Share (Ulashish)</strong> tugmasini bosing.
                  <br />
                  2. <strong>Add to Home Screen</strong> bandini tanlang.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-[#3B4CCA] py-2.5 text-sm font-semibold text-white"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
