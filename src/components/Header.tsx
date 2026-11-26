import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, User as UserIcon, X, LogOut, LayoutDashboard } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { UserRole, type Language } from '../types/domain';

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, user, openAuthModal, signOut, compareList } =
    useAppStore();
  const t = getDictionary(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === UserRole.ADMIN
      ? '/admin'
      : user?.role === UserRole.CENTER || user?.role === UserRole.TUTOR
        ? '/dashboard/center'
        : '/dashboard/student';

  const navItems = [
    { to: '/search', label: t.nav.directory },
    { to: '/compare', label: compareList.length > 0 ? `${t.nav.compare} (${compareList.length})` : t.nav.compare },
    { to: '/matchmaker', label: t.nav.matchmaker },
    { to: '/verification', label: t.nav.verification },
    { to: '/for-centers', label: t.nav.forCenters },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Clean single-line brand wordmark */}
        <Link
          to="/"
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 rounded-lg"
          aria-label="Edupick home"
        >
          <BrandLogo />
        </Link>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8 decoration-2'
                    : 'text-slate-600 dark:text-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Language + Theme + Primary Account Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <label className="sr-only" htmlFor="header-lang-select">
            Language
          </label>
          <select
            id="header-lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            aria-label="Language"
            className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-2.5 pr-7 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate(dashboardPath)}
                className="inline-flex items-center gap-2 h-10 rounded-xl bg-[#3B4CCA] px-3.5 text-sm font-semibold text-white hover:bg-[#2E3CA8] transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                title={t.common.logout}
                aria-label={t.common.logout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="hidden sm:inline-flex items-center gap-2 h-10 rounded-xl bg-[#3B4CCA] px-4 text-sm font-semibold text-white hover:bg-[#2E3CA8] transition-colors whitespace-nowrap shrink-0"
            >
              <UserIcon className="h-4 w-4" aria-hidden="true" />
              <span>{t.common.login}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? t.common.close : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pb-5 pt-3 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-xl px-3 text-base font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-xl px-3 text-base font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {t.nav.guides}
            </Link>
          </nav>

          <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#3B4CCA] px-4 text-sm font-semibold text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{user.name} · {t.common.dashboard}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t.common.logout}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#3B4CCA] px-4 text-sm font-semibold text-white"
              >
                <UserIcon className="h-4 w-4" />
                <span>{t.common.login}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
