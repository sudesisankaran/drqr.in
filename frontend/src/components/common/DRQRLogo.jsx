import React from 'react';

export const DRQRMark = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 64 64"
    className={`${className} flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="drqr-icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="50%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="drqr-icon-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <filter id="drqr-icon-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#042f2e" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Outer Rounded Tile */}
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="14"
      fill="url(#drqr-icon-bg)"
      stroke="#2dd4bf"
      strokeWidth="1.5"
      filter="url(#drqr-icon-shadow)"
    />

    {/* Inner Dark Badge */}
    <rect x="7" y="7" width="50" height="50" rx="10" fill="#042f2e" fillOpacity="0.88" />

    {/* QR Corner Reticles */}
    <path d="M12 21 V 15 A 3 3 0 0 1 15 12 H 21" stroke="url(#drqr-icon-glow)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M43 12 H 49 A 3 3 0 0 1 52 15 V 21" stroke="url(#drqr-glow)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 43 V 49 A 3 3 0 0 0 15 52 H 21" stroke="url(#drqr-glow)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M43 52 H 49 A 3 3 0 0 0 52 49 V 43" stroke="url(#drqr-glow)" strokeWidth="2.5" strokeLinecap="round" />

    {/* Central Medical Cross */}
    <g filter="url(#drqr-icon-shadow)">
      <rect x="27" y="19" width="10" height="26" rx="3" fill="#ffffff" />
      <rect x="19" y="27" width="26" height="10" rx="3" fill="#ffffff" />
      <circle cx="32" cy="32" r="3" fill="#0d9488" />
    </g>

    {/* Corner QR Matrix Accents */}
    <rect x="16" y="16" width="3.5" height="3.5" rx="1" fill="#5eead4" />
    <rect x="44.5" y="16" width="3.5" height="3.5" rx="1" fill="#5eead4" />
    <rect x="16" y="44.5" width="3.5" height="3.5" rx="1" fill="#5eead4" />
    <rect x="44.5" y="44.5" width="3.5" height="3.5" rx="1" fill="#5eead4" />
  </svg>
);

const DRQRLogo = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  subtitle = 'Medical QR & Healthcare',
  className = '',
}) => {
  const sizeMap = {
    sm: { mark: 'w-8 h-8', text: 'text-xl', sub: 'text-[10px]' },
    md: { mark: 'w-10 h-10 sm:w-11 sm:h-11', text: 'text-2xl sm:text-[26px]', sub: 'text-[11px]' },
    lg: { mark: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-3xl sm:text-4xl', sub: 'text-xs' },
    xl: { mark: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-4xl sm:text-5xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <DRQRMark className={currentSize.mark} />
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`font-black ${currentSize.text} tracking-tight text-white leading-none`}>
              DR<span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">QR</span>
            </span>
          </div>
          {showSubtitle && (
            <p className={`${currentSize.sub} text-slate-400 font-medium tracking-wide mt-1 leading-none`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DRQRLogo;
