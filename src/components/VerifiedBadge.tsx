import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Info, X } from 'lucide-react';
import { VerificationLevel } from '../types/domain';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';

interface VerifiedBadgeProps {
  level: VerificationLevel;
  interactive?: boolean;
  size?: 'sm' | 'md';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  level,
  interactive = false,
  size = 'sm',
}) => {
  const lang = useAppStore((s) => s.language);
  const t = getDictionary(lang);
  const [open, setOpen] = useState(false);

  const meta = {
    [VerificationLevel.STUDENT_CONFIRMED]: {
      label: t.verification.student_confirmed,
      desc: t.verification.studentDesc,
      Icon: ShieldCheck,
      colorClass: 'text-emerald-700 dark:text-emerald-400',
    },
    [VerificationLevel.DOCUMENT_VERIFIED]: {
      label: t.verification.document_verified,
      desc: t.verification.documentDesc,
      Icon: Shield,
      colorClass: 'text-indigo-700 dark:text-indigo-400',
    },
    [VerificationLevel.UNVERIFIED]: {
      label: t.verification.unverified,
      desc: t.verification.unverifiedDesc,
      Icon: ShieldAlert,
      colorClass: 'text-slate-500 dark:text-slate-400',
    },
  }[level];

  const Icon = meta.Icon;
  const textSize = size === 'md' ? 'text-sm font-semibold' : 'text-xs font-medium';

  if (!interactive) {
    return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${textSize} ${meta.colorClass}`}>
        <Icon className={size === 'md' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'} aria-hidden="true" />
        <span>{meta.label}</span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${textSize} ${meta.colorClass}`}
        aria-expanded={open}
        aria-label={`${meta.label} — ${t.verification.howWeVerify}`}
      >
        <Icon className={size === 'md' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'} aria-hidden="true" />
        <span>{meta.label}</span>
        <Info className="w-3 h-3 opacity-70" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.verification.howWeVerify}
          className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.verification.howWeVerify}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.common.close}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className={`mt-1.5 text-xs font-semibold ${meta.colorClass}`}>{meta.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{meta.desc}</p>
          <p className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {t.verification.methodologyNote}
          </p>
        </div>
      )}
    </span>
  );
};
