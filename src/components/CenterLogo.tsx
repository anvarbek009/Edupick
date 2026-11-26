import React, { useEffect, useState } from 'react';
import { getOfficialLogoUrl } from '../utils/campusMedia';

interface CenterLogoProps {
  name: string;
  slug?: string;
  website?: string;
  logoDomain?: string;
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CenterLogo: React.FC<CenterLogoProps> = ({
  name,
  slug,
  website,
  logoDomain,
  accentColor,
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const logoUrl = getOfficialLogoUrl(website, logoDomain, slug);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const abbr = name
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const dims =
    size === 'sm'
      ? 'h-9 w-9 rounded-lg text-xs'
      : size === 'lg'
        ? 'h-14 w-14 rounded-2xl text-base'
        : 'h-11 w-11 rounded-xl text-sm';

  if (logoUrl && !failed) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-white border border-slate-200/90 dark:border-slate-700 shadow-xs p-1 ${dims} ${className}`}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
              setFailed(true);
            }
          }}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain rounded-[6px]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden font-display font-extrabold text-white shadow-xs select-none border border-white/20 ${dims} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, #0F172A 100%)`,
      }}
      aria-hidden="true"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" viewBox="0 0 48 48" fill="none">
        <circle cx="40" cy="8" r="14" stroke="white" strokeWidth="1.5" />
        <path d="M0 36 L14 48" stroke="white" strokeWidth="1.5" />
      </svg>
      <span className="relative z-10 tracking-tight">{abbr}</span>
    </div>
  );
};
