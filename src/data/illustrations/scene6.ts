import { encodeSvg } from './encodeSvg';

export const SCENE_6_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s6_sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="s6_track" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <linearGradient id="s6_grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="s6_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s6_shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <filter id="s6_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Sky -->
  <rect width="600" height="200" fill="url(#s6_sky)"/>

  <!-- Cheerful Festive Pennant Bunting across Stadium -->
  <g transform="translate(0, 30)">
    <path d="M 0 10 Q 150 40 300 15 Q 450 45 600 20" stroke="#cbd5e1" stroke-width="2" fill="none"/>
    <polygon points="40,20 60,20 50,45" fill="#f59e0b"/>
    <polygon points="90,27 110,27 100,52" fill="#ef4444"/>
    <polygon points="140,31 160,31 150,56" fill="#3b82f6"/>
    <polygon points="190,29 210,29 200,54" fill="#10b981"/>
    <polygon points="240,24 260,24 250,49" fill="#ec4899"/>
    <polygon points="290,17 310,17 300,42" fill="#f59e0b"/>
    <polygon points="340,24 360,24 350,49" fill="#ef4444"/>
    <polygon points="390,30 410,30 400,55" fill="#3b82f6"/>
    <polygon points="440,32 460,32 450,57" fill="#10b981"/>
    <polygon points="490,29 510,29 500,54" fill="#8b5cf6"/>
    <polygon points="540,24 560,24 550,49" fill="#f59e0b"/>
  </g>

  <!-- Grass Infield of Stadium -->
  <rect y="170" width="600" height="70" fill="url(#s6_grass)"/>

  <!-- Red Clay Athletic Running Track -->
  <rect y="230" width="600" height="220" fill="url(#s6_track)"/>

  <!-- Curved Running Track Lane Lines -->
  <g stroke="#ffffff" stroke-width="4.5" opacity="0.9" fill="none">
    <line x1="0" y1="280" x2="600" y2="280"/>
    <line x1="0" y1="340" x2="600" y2="340"/>
    <line x1="0" y1="400" x2="600" y2="400"/>
  </g>

  <!-- BOLD WHITE CHALK STARTING LINE ACROSS TRACK (HIGH VISIBILITY) -->
  <line x1="160" y1="230" x2="160" y2="450" stroke="#ffffff" stroke-width="12" stroke-linecap="square"/>
  <rect x="175" y="240" width="30" height="22" rx="4" fill="#ffffff" opacity="0.8"/>
  <text x="180" y="256" font-size="14" font-weight="900" fill="#dc2626" font-family="sans-serif">START</text>

  <!-- JEDIDIAH CROUCHED IN RUNNING START POSITION (EXPRESSIVE DETERMINATION) -->
  <g transform="translate(110, 150)" filter="url(#s6_shadow)">
    <!-- Back Leg Stretched (Right Leg) -->
    <g transform="translate(-50, 110)">
      <path d="M 40 30 L 10 90 L -30 115" stroke="#1e3a8a" stroke-width="24" stroke-linecap="round" fill="none"/>
      <!-- Red Running Sneaker on Toes -->
      <ellipse cx="-35" cy="120" rx="16" ry="8" fill="#ef4444"/>
      <path d="M -45 124 L -20 124" stroke="#ffffff" stroke-width="3"/>
    </g>

    <!-- Front Bent Sprinting Leg (Left Leg near starting line) -->
    <g transform="translate(20, 110)">
      <path d="M 20 25 Q 55 45 40 90 L 35 125" stroke="#1e3a8a" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Front Sneaker poised right behind the start line -->
      <ellipse cx="38" cy="130" rx="18" ry="9" fill="#ef4444"/>
      <path d="M 26 134 L 50 134" stroke="#ffffff" stroke-width="3"/>
    </g>

    <!-- Boy's Body Leaning Forward in Sprinter's Stance -->
    <g transform="translate(10, 60)">
      <!-- Green Sports Running Singlet -->
      <path d="M 10 15 L 75 10 L 80 80 L 15 80 Z" fill="url(#s6_shirt)"/>

      <!-- START NUMBER BIB: "123" PINNED TO CHEST -->
      <g transform="translate(22, 22)">
        <rect width="45" height="34" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Safety pins in corners -->
        <circle cx="4" cy="4" r="1.5" fill="#64748b"/>
        <circle cx="41" cy="4" r="1.5" fill="#64748b"/>
        <circle cx="4" cy="30" r="1.5" fill="#64748b"/>
        <circle cx="41" cy="30" r="1.5" fill="#64748b"/>
        <!-- Big Number 123 -->
        <text x="7" y="24" font-size="20" font-weight="900" fill="#0f172a" font-family="sans-serif">123</text>
      </g>
    </g>

    <!-- Hands on Track Surface Poised to Sprint (Fingertips touching track behind line) -->
    <!-- Left Hand -->
    <g transform="translate(90, 140)">
      <path d="M -10 -30 Q 15 -10 12 30" stroke="url(#s6_skin)" stroke-width="16" stroke-linecap="round" fill="none"/>
      <!-- Bridge of fingers on track -->
      <circle cx="12" cy="32" r="8" fill="url(#s6_skin)"/>
      <path d="M 6 36 L 16 36" stroke="#475569" stroke-width="3"/>
    </g>
    <!-- Right Hand -->
    <g transform="translate(45, 140)">
      <path d="M -10 -30 Q 15 -10 12 30" stroke="url(#s6_skin)" stroke-width="16" stroke-linecap="round" fill="none"/>
      <circle cx="12" cy="32" r="8" fill="url(#s6_skin)"/>
      <path d="M 6 36 L 16 36" stroke="#475569" stroke-width="3"/>
    </g>

    <!-- Neck Stretched Forward -->
    <rect x="52" y="45" width="20" height="22" fill="url(#s6_skin)" rx="4"/>

    <!-- HEAD & EXPRESSION: FIERCE FOCUS & CONCENTRATION -->
    <g transform="translate(68, 25)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s6_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s6_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s6_skin)"/>

      <!-- Signature Dark Brown Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>

      <!-- Determined Concentrated Eyebrows (Slanted down inward with focus) -->
      <path d="M -22 -6 Q -14 -12 -6 -10" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 6 -10 Q 14 -12 22 -6" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>

      <!-- Sharp Focused Eyes Looking Down Track Towards Finish -->
      <g transform="translate(-14, 0)">
        <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#ffffff"/>
        <circle cx="2" cy="0" r="4.5" fill="#451a03"/>
        <circle cx="2" cy="0" r="2.5" fill="#0f172a"/>
        <circle cx="3.5" cy="-1.5" r="1.5" fill="#ffffff"/>
      </g>
      <g transform="translate(14, 0)">
        <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#ffffff"/>
        <circle cx="2" cy="0" r="4.5" fill="#451a03"/>
        <circle cx="2" cy="0" r="2.5" fill="#0f172a"/>
        <circle cx="3.5" cy="-1.5" r="1.5" fill="#ffffff"/>
      </g>

      <!-- Nose -->
      <path d="M -2 7 Q 0 11 4 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Cheeks Flushed with Adrenaline -->
      <ellipse cx="-20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.5"/>
      <ellipse cx="20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.5"/>

      <!-- Determined, Focused Mouth (Breathing steadily through nose/lips) -->
      <path d="M -10 18 Q 0 20 10 18" stroke="#991b1b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    </g>
  </g>
</svg>
`;

export const SCENE_6_IMAGE = encodeSvg(SCENE_6_SVG);
