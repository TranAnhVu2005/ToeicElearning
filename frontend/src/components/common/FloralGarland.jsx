import React from 'react';

/**
 * FloralGarland
 * A decorative botanical garland divider with blooming daisy flowers,
 * fresh leafy vines, and a gentle fluttering butterfly.
 * Inspired by classic editorial bookplate illustrations.
 */
const FloralGarland = ({ className = '' }) => {
  return (
    <div
      className={`floral-garland-wrapper w-full overflow-hidden select-none pointer-events-none flex justify-center py-2 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-4xl h-14 sm:h-18 lg:h-20 text-slate-800"
      >
        <defs>
          {/* Gradients for stems and leaves */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#65a30d" />
            <stop offset="50%" stopColor="#4d7c0f" />
            <stop offset="75%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#84cc16" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="60%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#3f6212" />
          </linearGradient>

          <linearGradient id="leafGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="60%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </linearGradient>

          <radialGradient id="flowerCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.12" />
          </filter>

          {/* Reusable Leaf Pair Symbol */}
          <g id="leafPair">
            <path
              d="M0,0 C-10,-12 -18,-10 -20,-3 C-22,4 -10,10 0,0 Z"
              fill="url(#leafGrad)"
            />
            <path
              d="M0,0 C10,-14 20,-12 21,-4 C22,4 10,9 0,0 Z"
              fill="url(#leafGradLight)"
            />
          </g>

          {/* Reusable Daisy Flower Symbol (8 Petals + Golden Core) */}
          <g id="daisyFlower" filter="url(#softGlow)">
            {/* White petals with subtle radial outline */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <path
                key={angle}
                d="M 0 -3 C -3 -10, -3 -15, 0 -17 C 3 -15, 3 -10, 0 -3 Z"
                fill="#FFFFFF"
                stroke="#F1F5F9"
                strokeWidth="0.5"
                transform={`rotate(${angle})`}
              />
            ))}
            {/* Flower Center Pistil */}
            <circle cx="0" cy="0" r="5" fill="url(#flowerCore)" />
            <circle cx="0" cy="0" r="2.5" fill="#B45309" opacity="0.4" />
          </g>
        </defs>

        {/* 1. Main Curved Tendril Vine */}
        <g className="floral-vine-path">
          {/* Side hanging vines at left and right */}
          <path
            d="M 60 38 Q 40 50, 48 64 Q 38 72, 36 80"
            stroke="url(#stemGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 940 38 Q 960 50, 952 64 Q 962 72, 964 80"
            stroke="url(#stemGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Main horizontal vine */}
          <path
            d="M 50 40 Q 180 20, 320 36 T 600 34 T 880 38 Q 930 25, 950 40"
            stroke="url(#stemGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Secondary thin sub-twigs */}
          <path
            d="M 190 32 Q 220 16, 255 20"
            stroke="url(#stemGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 380 35 Q 425 50, 465 46"
            stroke="url(#stemGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 670 34 Q 710 18, 750 22"
            stroke="url(#stemGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 780 37 Q 820 52, 855 48"
            stroke="url(#stemGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* 2. Leaves Distributed Along the Vine */}
        <g className="floral-leaves-group">
          {/* Left hanging leaves */}
          <use href="#leafPair" x="44" y="60" transform="scale(0.7) rotate(60 44 60)" />
          <use href="#leafPair" x="38" y="74" transform="scale(0.55) rotate(80 38 74)" />

          {/* Left section leaves */}
          <use href="#leafPair" x="110" y="32" transform="scale(0.8) rotate(-15 110 32)" />
          <use href="#leafPair" x="200" y="24" transform="scale(0.9) rotate(25 200 24)" />
          <use href="#leafPair" x="245" y="19" transform="scale(0.75) rotate(-20 245 19)" />
          <use href="#leafPair" x="270" y="34" transform="scale(0.85) rotate(15 270 34)" />

          {/* Center section leaves */}
          <use href="#leafPair" x="370" y="36" transform="scale(0.85) rotate(-30 370 36)" />
          <use href="#leafPair" x="430" y="48" transform="scale(0.8) rotate(35 430 48)" />
          <use href="#leafPair" x="510" y="35" transform="scale(0.95) rotate(-10 510 35)" />
          <use href="#leafPair" x="630" y="34" transform="scale(0.9) rotate(20 630 34)" />
          <use href="#leafPair" x="690" y="26" transform="scale(0.8) rotate(-25 690 26)" />

          {/* Right section leaves */}
          <use href="#leafPair" x="795" y="47" transform="scale(0.85) rotate(30 795 47)" />
          <use href="#leafPair" x="840" y="38" transform="scale(0.9) rotate(-15 840 38)" />
          <use href="#leafPair" x="910" y="34" transform="scale(0.8) rotate(20 910 34)" />

          {/* Right hanging leaves */}
          <use href="#leafPair" x="955" y="60" transform="scale(0.7) rotate(-60 955 60)" />
          <use href="#leafPair" x="962" y="74" transform="scale(0.55) rotate(-80 962 74)" />
        </g>

        {/* 3. Animated Blooming Daisy Flowers */}
        <g className="floral-flowers-group">
          {/* Flower 1 - Left Drapery */}
          <g className="floral-bloom floral-bloom-1" transform="translate(54, 46) scale(0.9)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 2 - Left mid */}
          <g className="floral-bloom floral-bloom-2" transform="translate(150, 27) scale(1.05)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 3 - Left branch */}
          <g className="floral-bloom floral-bloom-3" transform="translate(255, 19) scale(0.85)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 4 - Left center */}
          <g className="floral-bloom floral-bloom-4" transform="translate(330, 36) scale(1)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 5 - Centerpiece */}
          <g className="floral-bloom floral-bloom-center" transform="translate(470, 44) scale(1.2)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 6 - Right centerpiece */}
          <g className="floral-bloom floral-bloom-5" transform="translate(580, 33) scale(1.1)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 7 - Right branch */}
          <g className="floral-bloom floral-bloom-6" transform="translate(745, 21) scale(0.9)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 8 - Right mid */}
          <g className="floral-bloom floral-bloom-7" transform="translate(860, 46) scale(1.05)">
            <use href="#daisyFlower" />
          </g>

          {/* Flower 9 - Right Drapery */}
          <g className="floral-bloom floral-bloom-8" transform="translate(946, 46) scale(0.9)">
            <use href="#daisyFlower" />
          </g>
        </g>

        {/* 4. Cute Fluttering Butterfly on the Right Branch (Inspired by reference) */}
        <g className="floral-butterfly" transform="translate(765, 12)">
          {/* Butterfly wings with flap animation */}
          <g className="butterfly-wings">
            {/* Left Forewing */}
            <path
              d="M 0,0 C -6,-10 -14,-8 -12,-2 C -10,3 -4,3 0,0 Z"
              fill="#F59E0B"
              stroke="#18181B"
              strokeWidth="0.8"
            />
            {/* Left Hindwing */}
            <path
              d="M 0,0 C -5,2 -9,7 -6,9 C -3,10 -1,4 0,0 Z"
              fill="#D97706"
              stroke="#18181B"
              strokeWidth="0.6"
            />
            {/* Right Forewing */}
            <path
              d="M 0,0 C 6,-10 14,-8 12,-2 C 10,3 4,3 0,0 Z"
              fill="#FBBF24"
              stroke="#18181B"
              strokeWidth="0.8"
            />
            {/* Right Hindwing */}
            <path
              d="M 0,0 C 5,2 9,7 6,9 C 3,10 1,4 0,0 Z"
              fill="#F59E0B"
              stroke="#18181B"
              strokeWidth="0.6"
            />
          </g>
          {/* Body & Antennae */}
          <ellipse cx="0" cy="1" rx="1.2" ry="4" fill="#18181B" />
          <path d="M -0.5 -3 Q -2 -6 -4 -7 M 0.5 -3 Q 2 -6 4 -7" stroke="#18181B" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default FloralGarland;

