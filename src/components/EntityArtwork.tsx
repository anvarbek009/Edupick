import React, { useEffect, useState } from 'react';
import { BookOpen, Code2, Calculator, Globe2, GraduationCap, Palette } from 'lucide-react';
import type { CampusPhotoKey } from '../types/domain';
import { CAMPUS_PHOTO_MAP, getOfficialPhotosForSlug } from '../utils/campusMedia';
import { CenterLogo } from './CenterLogo';

interface EntityArtworkProps {
  name: string;
  slug?: string;
  accentColor: string;
  category?: string;
  subtitle?: string;
  variant?: 'card' | 'cover' | 'avatar';
  initials?: string;
  photoKey?: CampusPhotoKey;
  logoDomain?: string;
  website?: string;
  className?: string;
}

export const EntityArtwork: React.FC<EntityArtworkProps> = ({
  name,
  slug,
  accentColor,
  category = 'languages',
  subtitle,
  variant = 'card',
  initials,
  photoKey,
  logoDomain,
  website,
  className = '',
}) => {
  const abbr =
    initials ||
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const Icon =
    category === 'it'
      ? Code2
      : category === 'exact-sciences'
        ? Calculator
        : category === 'entrance'
          ? GraduationCap
          : category === 'creative'
            ? Palette
            : category === 'languages'
              ? Globe2
              : BookOpen;

  const officialLeadPhoto = slug ? getOfficialPhotosForSlug(slug)[0] : undefined;
  const fallbackPhoto = photoKey ? CAMPUS_PHOTO_MAP[photoKey] : undefined;
  const primarySrc = officialLeadPhoto || fallbackPhoto?.src;

  const [imgSrc, setImgSrc] = useState<string | undefined>(primarySrc);

  useEffect(() => {
    setImgSrc(primarySrc);
  }, [primarySrc]);

  if (variant === 'avatar') {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl text-white font-display font-bold select-none shrink-0 ${className}`}
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, #1E293B 100%)`,
        }}
        aria-hidden="true"
      >
        <svg className="absolute inset-0 h-full w-full opacity-15" viewBox="0 0 100 100" fill="none">
          <circle cx="82" cy="18" r="28" stroke="white" strokeWidth="2" />
          <circle cx="14" cy="88" r="24" stroke="white" strokeWidth="1.5" />
        </svg>
        <span className="relative z-10 tracking-tight">{abbr}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden select-none ${
        variant === 'cover' ? 'h-52 sm:h-64 w-full rounded-2xl' : 'h-40 w-full rounded-xl'
      } ${className}`}
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, #0F172A 100%)`,
      }}
    >
      {imgSrc ? (
        <>
          <img
            src={imgSrc}
            alt={`${name} — ${fallbackPhoto?.caption.en || 'campus'}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => {
              if (fallbackPhoto && imgSrc !== fallbackPhoto.src) {
                setImgSrc(fallbackPhoto.src);
              } else {
                setImgSrc(undefined);
              }
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/15" />
        </>
      ) : (
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id={`grid-${abbr}`} width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="400" height="200" fill={`url(#grid-${abbr})`} />
          <circle cx="340" cy="40" r="88" fill="white" fillOpacity="0.12" />
          <circle cx="55" cy="175" r="64" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />
          <path d="M210 200 L290 80 L400 140 L400 200 Z" fill="white" fillOpacity="0.08" />
        </svg>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between p-3.5 sm:p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CenterLogo
              name={name}
              slug={slug}
              website={website}
              logoDomain={logoDomain}
              accentColor={accentColor}
              size={variant === 'cover' ? 'lg' : 'md'}
              className="shadow-md"
            />
            {variant === 'card' && !imgSrc && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/25 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-white/90" aria-hidden="true" />
              </div>
            )}
          </div>
          {variant === 'cover' && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/40 backdrop-blur-sm border border-white/15">
              <Icon className="h-4 w-4 text-white/95" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="drop-shadow-sm">
          <p className="font-display text-base sm:text-xl font-bold leading-snug tracking-tight line-clamp-1">
            {name}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs sm:text-sm text-white/85 line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
