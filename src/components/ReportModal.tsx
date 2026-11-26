import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';

const REPORT_REASONS = {
  uz: [
    'Natija yoki sertifikat shubhali',
    'Narx amalda boshqacha',
    'Soxta sharh shubhasi',
    'Manzil yoki aloqa noto‘g‘ri',
  ],
  ru: [
    'Сомнительный результат или сертификат',
    'Фактическая цена отличается',
    'Подозрение на фейковый отзыв',
    'Неверный адрес или контакты',
  ],
  en: [
    'Suspicious outcome claim or certificate',
    'Actual pricing differs from listed price',
    'Suspected fake review',
    'Incorrect address or contact details',
  ],
} as const;

export const ReportModal: React.FC = () => {
  const { reportTarget, closeReportModal, submitReport, language } = useAppStore();
  const t = getDictionary(language);
  const reasons = REPORT_REASONS[language];
  const [reason, setReason] = useState<string>(reasons[0]);
  const [details, setDetails] = useState('');

  useEffect(() => {
    setReason(REPORT_REASONS[language][0]);
  }, [language]);

  useEffect(() => {
    if (!reportTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeReportModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reportTarget, closeReportModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 5) return;
    submitReport(reason, details.trim());
    setDetails('');
  };

  return (
    <AnimatePresence>
      {reportTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={closeReportModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeReportModal}
              aria-label={t.common.close}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h2 id="report-modal-title" className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {t.common.report}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{reportTarget.entityLabel}</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="report-reason" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ru' ? 'Причина' : language === 'en' ? 'Reason' : 'Sabab'}
                </label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="report-details" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ru' ? 'Подробности' : language === 'en' ? 'Details' : 'Batafsil izoh'}
                </label>
                <textarea
                  id="report-details"
                  required
                  minLength={5}
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    language === 'ru'
                      ? 'Какое несоответствие вы заметили?'
                      : language === 'en'
                        ? 'What inaccuracy did you notice?'
                        : 'Qanday nomuvofiqlikni payqadingiz?'
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-amber-600 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  {t.common.submit}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
