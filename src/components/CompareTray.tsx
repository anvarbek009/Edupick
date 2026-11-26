import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';

export const CompareTray: React.FC = () => {
  const { compareList, centers, tutors, removeCompare, clearCompare, language } = useAppStore();
  const t = getDictionary(language);
  const navigate = useNavigate();
  const location = useLocation();

  const isHiddenRoute =
    location.pathname === '/' ||
    location.pathname === '/compare' ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/for-centers' ||
    location.pathname === '/verification' ||
    location.pathname === '/guides' ||
    location.pathname === '/about' ||
    location.pathname === '/contact' ||
    location.pathname === '/privacy' ||
    location.pathname === '/terms';

  const resolved = compareList
    .map((item) => {
      if (item.type === 'center') {
        const c = centers.find((x) => x.id === item.id);
        return c ? { id: c.id, name: c.name } : null;
      }
      const tut = tutors.find((x) => x.id === item.id);
      return tut ? { id: tut.id, name: tut.name } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string }>;

  const visible = resolved.length > 0 && !isHiddenRoute;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="compare-tray"
          initial={{ y: 84, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 84, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-3 left-3 right-3 z-30 mx-auto max-w-4xl"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0 overflow-x-auto">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-[#3B4CCA] dark:text-indigo-300">
                <Scale className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                {resolved.length}/4 {t.compare.traySelected}
              </span>
              <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                {resolved.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 max-w-[140px]"
                  >
                    <span className="truncate">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => removeCompare(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCompare}
                className="hidden sm:inline-flex text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5"
              >
                {t.common.clearAll}
              </button>
              <button
                type="button"
                onClick={() => navigate('/compare')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#3B4CCA] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2E3CA8] transition-colors whitespace-nowrap"
              >
                <span>{t.compare.trayOpen}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
