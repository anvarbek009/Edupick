import React from 'react';
import { CheckCircle2, Info, AlertCircle, X, WifiOff, SearchX } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAppStore();
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed right-4 top-20 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const accent =
          toast.type === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : toast.type === 'error'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-indigo-600 dark:text-indigo-400';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 shadow-lg"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`} aria-hidden="true" />
            <p className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {toast.text}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const language = useAppStore((s) => s.language);
  const t = getDictionary(language);
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>{t.common.offlineBanner}</span>
    </div>
  );
};

export const CookieBanner: React.FC = () => {
  const { cookieAccepted, acceptCookies, language } = useAppStore();
  const t = getDictionary(language);
  if (cookieAccepted) return null;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/95 px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-600 dark:text-slate-300">{t.footer.cookieText}</p>
        <button
          type="button"
          onClick={acceptCookies}
          className="rounded-lg bg-slate-900 dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-slate-900 whitespace-nowrap shrink-0"
        >
          {t.footer.cookieAccept}
        </button>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">
      <SearchX className="h-6 w-6" aria-hidden="true" />
    </div>
    <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 h-10 rounded-xl bg-[#3B4CCA] px-5 text-xs font-semibold text-white hover:bg-[#2E3CA8]"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
      >
        <div className="h-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/70" />
      </div>
    ))}
  </div>
);
