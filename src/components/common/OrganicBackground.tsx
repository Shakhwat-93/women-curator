import React from 'react';

interface OrganicBackgroundProps {
  variant?: 'hero' | 'card-1' | 'card-2' | 'card-3' | 'card-4' | 'editorial' | 'banner' | 'checkout';
  className?: string;
  showDots?: boolean;
  showArc?: boolean;
  showShadows?: boolean;
}

export const OrganicBackground: React.FC<OrganicBackgroundProps> = ({
  variant = 'card-1',
  className = '',
  showDots = true,
  showArc = true,
  showShadows = true
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      {/* 1. Base Warm Atmosphere Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF5EE] via-[#FDFBF7] to-[#F8ECE4] opacity-90" />

      {/* 2. Layered SVG Organic Geometry */}
      <svg
        className="w-full h-full object-cover preserve-3d"
        viewBox="0 0 600 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Coral Main Gradient */}
          <linearGradient id={`coralGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E65844" />
            <stop offset="100%" stopColor="#D94734" />
          </linearGradient>

          {/* Blush Soft Gradient */}
          <linearGradient id={`blushGrad-${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F9BEB1" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F4A999" stopOpacity="0.8" />
          </linearGradient>

          {/* Secondary Peach Tint */}
          <linearGradient id={`peachGrad-${variant}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FCE7DE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F7D7CA" stopOpacity="0.6" />
          </linearGradient>

          {/* Subtle Dot Pattern */}
          <pattern id={`dotPattern-${variant}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.8" fill="#FFFFFF" fillOpacity="0.65" />
          </pattern>
        </defs>

        {/* --- Variant 1 / Exact Reference Product Card Shape --- */}
        {variant === 'card-1' && (
          <>
            {/* Background Soft Blush Blob */}
            <path
              d="M120 180 C 140 70, 480 80, 520 220 C 560 360, 490 560, 360 620 C 230 680, 80 580, 90 440 C 100 300, 100 290, 120 180 Z"
              fill={`url(#blushGrad-${variant})`}
              className="transition-all duration-700"
            />
            {/* Foreground Signature Coral Blob */}
            <path
              d="M180 200 C 220 90, 430 110, 460 250 C 490 390, 470 510, 340 540 C 210 570, 140 460, 150 360 C 160 260, 140 310, 180 200 Z"
              fill={`url(#coralGrad-${variant})`}
              filter="drop-shadow(0px 8px 24px rgba(222, 79, 60, 0.15))"
            />
            {/* White Curved Line Arc */}
            {showArc && (
              <path
                d="M 140 280 Q 320 200 480 340 T 470 560"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeOpacity="0.75"
                fill="none"
              />
            )}
            {/* Left Dotted Matrix (3x2) */}
            {showDots && (
              <rect x="130" y="240" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
            )}
            {/* Right Dotted Matrix (3x2) */}
            {showDots && (
              <rect x="440" y="420" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
            )}
          </>
        )}

        {/* --- Variant 2 / Geometric Tunic Card Shape --- */}
        {variant === 'card-2' && (
          <>
            <path
              d="M100 150 C 180 50, 500 100, 540 260 C 580 420, 460 600, 300 620 C 140 640, 60 500, 70 340 C 80 180, 20 250, 100 150 Z"
              fill={`url(#blushGrad-${variant})`}
            />
            <path
              d="M160 220 C 240 120, 440 140, 470 290 C 500 440, 420 540, 280 530 C 140 520, 130 400, 140 320 C 150 240, 80 320, 160 220 Z"
              fill={`url(#coralGrad-${variant})`}
              filter="drop-shadow(0px 8px 24px rgba(222, 79, 60, 0.15))"
            />
            {showArc && (
              <path
                d="M 110 320 Q 300 210 490 320 T 420 580"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeOpacity="0.75"
                fill="none"
              />
            )}
            {showDots && (
              <>
                <rect x="110" y="260" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
                <rect x="450" y="380" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
              </>
            )}
          </>
        )}

        {/* --- Variant 3 / Peplum Artisan Tunic Card Shape --- */}
        {variant === 'card-3' && (
          <>
            <path
              d="M140 160 C 260 70, 520 120, 530 290 C 540 460, 430 610, 260 590 C 90 570, 80 430, 90 290 C 100 150, 20 250, 140 160 Z"
              fill={`url(#blushGrad-${variant})`}
            />
            <path
              d="M200 210 C 310 130, 460 170, 450 320 C 440 470, 360 540, 220 510 C 80 480, 130 360, 150 280 C 170 200, 90 290, 200 210 Z"
              fill={`url(#coralGrad-${variant})`}
              filter="drop-shadow(0px 8px 24px rgba(222, 79, 60, 0.15))"
            />
            {showArc && (
              <path
                d="M 130 250 Q 280 180 470 290"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeOpacity="0.75"
                fill="none"
              />
            )}
            {showDots && (
              <>
                <rect x="120" y="220" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
                <rect x="430" y="440" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
              </>
            )}
          </>
        )}

        {/* --- Variant 4 / Limited Edition Silk Tunic Card Shape --- */}
        {variant === 'card-4' && (
          <>
            <path
              d="M110 170 C 210 60, 490 90, 510 240 C 530 390, 470 580, 320 610 C 170 640, 70 520, 80 370 C 90 220, 10 280, 110 170 Z"
              fill={`url(#blushGrad-${variant})`}
            />
            <path
              d="M170 210 C 270 110, 440 140, 440 280 C 440 420, 390 520, 250 520 C 110 520, 120 380, 140 290 C 160 200, 70 310, 170 210 Z"
              fill={`url(#coralGrad-${variant})`}
              filter="drop-shadow(0px 8px 24px rgba(222, 79, 60, 0.15))"
            />
            {showArc && (
              <path
                d="M 120 290 Q 310 190 480 310"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeOpacity="0.75"
                fill="none"
              />
            )}
            {showDots && (
              <rect x="440" y="390" width="36" height="54" fill={`url(#dotPattern-${variant})`} />
            )}
          </>
        )}

        {/* --- Hero & Editorial Variations --- */}
        {(variant === 'hero' || variant === 'banner' || variant === 'editorial' || variant === 'checkout') && (
          <>
            {/* Broad Blush Fluid Field */}
            <path
              d="M 80 120 C 250 -40, 550 40, 580 260 C 610 480, 480 660, 260 680 C 40 700, -20 520, 10 340 C 40 160, -90 280, 80 120 Z"
              fill={`url(#blushGrad-${variant})`}
              opacity="0.85"
            />
            {/* Center Dominant Coral Blob */}
            <path
              d="M 190 160 C 340 40, 520 120, 530 320 C 540 520, 420 620, 270 590 C 120 560, 110 420, 130 310 C 150 200, 40 280, 190 160 Z"
              fill={`url(#coralGrad-${variant})`}
              filter="drop-shadow(0px 12px 36px rgba(222, 79, 60, 0.2))"
            />
            {/* Elegant Flowing White Line Arc */}
            {showArc && (
              <path
                d="M 110 320 Q 320 160 520 340 T 480 620"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeOpacity="0.8"
                fill="none"
              />
            )}
            {/* Subtle Scattered Dots */}
            {showDots && (
              <>
                <rect x="140" y="220" width="48" height="64" fill={`url(#dotPattern-${variant})`} />
                <rect x="480" y="440" width="48" height="64" fill={`url(#dotPattern-${variant})`} />
              </>
            )}
          </>
        )}
      </svg>

      {/* 3. Soft Palm Leaf Shadow Overlay (matching reference hero & cards) */}
      {showShadows && (
        <>
          {/* Top Right Palm Shadow */}
          <div
            className="absolute -top-10 -right-10 w-72 h-72 opacity-[0.08] pointer-events-none bg-contain bg-no-repeat rotate-45"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(32, 28, 26, 0.8) 0%, transparent 70%)`
            }}
          />
          {/* Bottom Left Palm Shadow */}
          <div
            className="absolute -bottom-10 -left-10 w-80 h-80 opacity-[0.06] pointer-events-none bg-contain bg-no-repeat -rotate-12"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(32, 28, 26, 0.7) 0%, transparent 70%)`
            }}
          />
        </>
      )}
    </div>
  );
};
