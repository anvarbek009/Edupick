import React from 'react';
import { BRAND_CONFIG } from '../config/brand';

interface BrandLogoProps {
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="30"
        height="30"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="10" fill="#3B4CCA" />
        <path
          d="M18 6.5L28 10.6V18.8C28 24.7 23.7 29.6 18 31.4C12.3 29.6 8 24.7 8 18.8V10.6L18 6.5Z"
          fill="#FFFFFF"
          fillOpacity="0.14"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 18.7L16.7 21.8L23 15.2"
          stroke="#4ADE80"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          {BRAND_CONFIG.name}
        </span>
      )}
    </span>
  );
};
