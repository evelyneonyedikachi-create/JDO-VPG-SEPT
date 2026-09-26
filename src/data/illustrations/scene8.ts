import { encodeSvg } from './encodeSvg';

export const SCENE_8_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s8_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="s8_floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="s8_mirror" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="50%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#7dd3fc"/>
    </linearGradient>
    <linearGradient id="s8_jacket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="40%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="s8_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <filter id="s8_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#78350f" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Wall & Floor -->
  <rect width="600" height="340" fill="url(#s8_wall)"/>
  <rect y="334" width="600" height="12" fill="#92400e"/>
  <rect y="346" width="600" height="104" fill="url(#s8_floor)"/>

  <!-- Warm Striped Area Rug on Floor -->
  <ellipse cx="280" cy="400" rx="220" ry="36" fill="#fbcfe8" opacity="0.8"/>
  <ellipse cx="280" cy="400" rx="180" ry="28" fill="#f472b6" opacity="0.6"/>

  <!-- FULL-LENGTH DRESSING MIRROR ON THE LEFT -->
  <g transform="translate(60, 45)" filter="url(#s8_shadow)">
    <!-- Wooden Mirror Frame & Stand -->
    <rect width="140" height="320" rx="20" fill="#92400e" stroke="#78350f" stroke-width="4"/>
    <!-- Mirror Glass Reflecting Bright Light -->
    <rect x="12" y="14" width="116" height="292" rx="12" fill="url(#s8_mirror)"/>
    <!-- Diagonal Glass Glare Reflection -->
    <polygon points="20,30 60,30 30,280 15,280" fill="#ffffff" opacity="0.5"/>
    <polygon points="75,30 95,30 55,280 40,280" fill="#ffffff" opacity="0.4"/>

    <!-- Boy's Reflection in the Mirror -->
    <g transform="translate(70, 70) scale(0.85)" opacity="0.85">
      <!-- Reflected Yellow Jacket -->
      <path d="M -30 70 L 30 70 L 35 150 L -35 150 Z" fill="url(#s8_jacket)"/>
      <line x1="0" y1="70" x2="0" y2="150" stroke="#78350f" stroke-width="3"/>
      <!-- Reflected Head -->
      <circle cx="0" cy="20" r="28" fill="url(#s8_skin)"/>
      <path d="M -30 10 C -34 -15, 20 -20, 30 10" fill="#451a03"/>
      <!-- Reflected Thumbs up -->
      <circle cx="45" cy="90" r="8" fill="url(#s8_skin)"/>
      <line x1="45" y1="90" x2="45" y2="76" stroke="url(#s8_skin)" stroke-width="6" stroke-linecap="round"/>
    </g>

    <!-- Mirror Stand Feet -->
    <path d="M -8 300 L 15 320" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
    <path d="M 148 300 L 125 320" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- JEDIDIAH STANDING PROUDLY IN HIS NEW YELLOW JACKET (CLEAR ACTION & EMOTION) -->
  <g transform="translate(320, 80)" filter="url(#s8_shadow)">
    <!-- Denim Pants & Shoes -->
    <g transform="translate(35, 230)">
      <rect x="0" y="0" width="28" height="85" rx="5" fill="#1e3a8a"/>
      <rect x="36" y="0" width="28" height="85" rx="5" fill="#1e3a8a"/>
      <!-- Shoes -->
      <ellipse cx="14" cy="88" rx="18" ry="10" fill="#ef4444"/>
      <ellipse cx="50" cy="88" rx="18" ry="10" fill="#ef4444"/>
    </g>

    <!-- THE BRAND NEW YELLOW JACKET (VIBRANT, SNUG FIT, REALISTIC DETAILS) -->
    <g transform="translate(15, 95)">
      <!-- Main Coat Body -->
      <path d="M 10 15 L 95 15 L 105 145 L 0 145 Z" fill="url(#s8_jacket)"/>

      <!-- Jacket Collar / Hood Folded Back -->
      <path d="M 5 15 Q 52 -5 100 15 Q 52 30 5 15 Z" fill="#ca8a04" stroke="#854d0e" stroke-width="2"/>
      <path d="M 25 15 Q 52 32 80 15" stroke="#fef08a" stroke-width="3" fill="none"/>

      <!-- Center Zipper with Silver Slider -->
      <line x1="52" y1="15" x2="52" y2="145" stroke="#78350f" stroke-width="3.5"/>
      <rect x="49" y="45" width="6" height="10" rx="1.5" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>

      <!-- Two Slanted Front Jacket Pockets -->
      <line x1="16" y1="100" x2="38" y2="110" stroke="#854d0e" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="88" y1="100" x2="66" y2="110" stroke="#854d0e" stroke-width="3.5" stroke-linecap="round"/>

      <!-- Snug Cuffs -->
      <rect x="-8" y="95" width="18" height="10" rx="3" fill="#ca8a04"/>
      <rect x="94" y="95" width="18" height="10" rx="3" fill="#ca8a04"/>
    </g>

    <!-- Right Arm Holding Jacket Hem (Admiring the clean fit) -->
    <g transform="translate(15, 110)">
      <path d="M 15 10 Q -5 45 10 95" stroke="url(#s8_jacket)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Hand holding jacket lapel -->
      <circle cx="12" cy="100" r="12" fill="url(#s8_skin)"/>
      <path d="M 12 95 Q 18 100 24 105" stroke="url(#s8_skin)" stroke-width="6" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Left Arm Giving PROUD THUMBS-UP GESTURE! (CLEAR PROUD CONFIDENCE) -->
    <g transform="translate(110, 110)">
      <!-- Arm bent up with confidence -->
      <path d="M 10 10 Q 40 40 45 75 Q 35 90 20 85" stroke="url(#s8_jacket)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- The Thumbs Up Hand -->
      <g transform="translate(25, 80)">
        <circle cx="0" cy="0" r="14" fill="url(#s8_skin)"/>
        <!-- Thumb pointing straight up! -->
        <path d="M 0 -2 L 0 -18 Q 4 -22 8 -18 L 8 -2 Z" fill="url(#s8_skin)" stroke="#c27848" stroke-width="1.5"/>
        <!-- Folded fingers in fist -->
        <ellipse cx="6" cy="3" rx="7" ry="5" fill="url(#s8_skin)"/>
        <line x1="0" y1="3" x2="12" y2="3" stroke="#c27848" stroke-width="1.5"/>
      </g>
    </g>

    <!-- Neck -->
    <rect x="58" y="75" width="22" height="26" fill="url(#s8_skin)" rx="4"/>

    <!-- HEAD & EXPRESSION: PROUD, DELIGHTED, CONFIDENT ("PASST PERFEKT!") -->
    <g transform="translate(68, 45)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s8_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s8_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s8_skin)"/>

      <!-- Signature Dark Brown Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>
      <path d="M -28 -15 Q -15 -28 0 -18 Q 15 -30 28 -16 Q 10 -22 -5 -16 Z" fill="#451a03"/>

      <!-- Proud Confident Eyebrows -->
      <path d="M -22 -10 Q -14 -16 -6 -10" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 6 -10 Q 14 -16 22 -10" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>

      <!-- Sparkling Happy Eyes Looking Towards Mirror Reflection -->
      <g transform="translate(-14, -2)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <!-- Pupils looking left at the mirror -->
        <circle cx="-2" cy="0" r="4.5" fill="#451a03"/>
        <circle cx="-2" cy="0" r="2.5" fill="#0f172a"/>
        <circle cx="-0.5" cy="-1.5" r="1.5" fill="#ffffff"/>
      </g>
      <g transform="translate(14, -2)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <!-- Pupils looking left at mirror -->
        <circle cx="-2" cy="0" r="4.5" fill="#451a03"/>
        <circle cx="-2" cy="0" r="2.5" fill="#0f172a"/>
        <circle cx="-0.5" cy="-1.5" r="1.5" fill="#ffffff"/>
      </g>

      <!-- Nose -->
      <path d="M -2 7 Q 0 11 4 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="-20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.45"/>
      <ellipse cx="20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.45"/>

      <!-- Proud, Delighted Smile -->
      <path d="M -14 16 Q 0 30 14 16 Z" fill="#991b1b"/>
      <path d="M -12 17 Q 0 22 12 17" stroke="#ffffff" stroke-width="3" fill="none"/>
      <path d="M -6 24 Q 0 28 6 24" fill="#f87171"/>
    </g>
  </g>
</svg>
`;

export const SCENE_8_IMAGE = encodeSvg(SCENE_8_SVG);
