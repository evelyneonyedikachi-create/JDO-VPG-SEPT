import { encodeSvg } from './encodeSvg';

export const SCENE_7_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s7_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="s7_table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="30%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="s7_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s7_shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="s7_blue_piece" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="s7_red_piece" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <filter id="s7_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Playroom / Study Wall -->
  <rect width="600" height="250" fill="url(#s7_wall)"/>
  <!-- Decorative poster / pennant on wall -->
  <g transform="translate(60, 40)" filter="url(#s7_shadow)">
    <rect width="90" height="110" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
    <rect x="10" y="10" width="70" height="90" rx="4" fill="#fef08a"/>
    <circle cx="45" cy="45" r="20" fill="#f59e0b"/>
    <polygon points="45,30 50,42 62,42 52,50 56,62 45,54 34,62 38,50 28,42 40,42" fill="#ffffff"/>
  </g>

  <!-- Wooden Table -->
  <g transform="translate(0, 240)" filter="url(#s7_shadow)">
    <rect width="600" height="30" fill="#fde68a"/>
    <rect y="25" width="600" height="185" fill="url(#s7_table)"/>
  </g>

  <!-- JEDIDIAH SITTING AT TABLE ASSEMBLING THE PUZZLE -->
  <g transform="translate(220, 60)" filter="url(#s7_shadow)">
    <!-- Boy's Body in Signature Green T-Shirt -->
    <path d="M 15 130 L 145 130 L 155 210 L 5 210 Z" fill="url(#s7_shirt)"/>
    <path d="M 60 130 Q 80 145 100 130" stroke="#ffffff" stroke-width="6" fill="none"/>

    <!-- Left Arm & Hand Guiding the Blue Jigsaw Piece -->
    <g transform="translate(25, 135)">
      <path d="M 10 10 Q -10 50 20 80 Q 40 100 70 105" stroke="url(#s7_shirt)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M 60 95 Q 85 105 105 110" stroke="url(#s7_skin)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <!-- Left Hand fingers holding edge of puzzle piece -->
      <circle cx="110" cy="112" r="12" fill="url(#s7_skin)"/>
      <path d="M 105 105 Q 115 108 122 118" stroke="url(#s7_skin)" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Right Arm & Hand Fitting the Interlocking Red Piece -->
    <g transform="translate(135, 135)">
      <path d="M 0 10 Q 20 50 -10 80 Q -30 100 -60 105" stroke="url(#s7_shirt)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M -50 95 Q -75 105 -95 110" stroke="url(#s7_skin)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <!-- Right Hand fingers positioning piece -->
      <circle cx="-100" cy="112" r="12" fill="url(#s7_skin)"/>
      <path d="M -95 105 Q -105 108 -112 118" stroke="url(#s7_skin)" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Neck -->
    <rect x="70" y="110" width="22" height="26" fill="url(#s7_skin)" rx="4"/>

    <!-- HEAD & EXPRESSION: PROUD, DELIGHTED SMILE ("IT FITS!") -->
    <g transform="translate(80, 75)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s7_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s7_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s7_skin)"/>

      <!-- Signature Dark Brown Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>
      <path d="M -28 -15 Q -15 -28 0 -18 Q 15 -30 28 -16 Q 10 -22 -5 -16 Z" fill="#451a03"/>

      <!-- Cheerful Eyebrows -->
      <path d="M -22 -10 Q -14 -17 -6 -10" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 6 -10 Q 14 -17 22 -10" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>

      <!-- Bright Sparkly Eyes Looking at Puzzle -->
      <g transform="translate(-14, -2)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <circle cx="1" cy="2" r="4.5" fill="#451a03"/>
        <circle cx="1" cy="2" r="2.5" fill="#0f172a"/>
        <circle cx="2.5" cy="0.5" r="1.5" fill="#ffffff"/>
      </g>
      <g transform="translate(14, -2)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <circle cx="-1" cy="2" r="4.5" fill="#451a03"/>
        <circle cx="-1" cy="2" r="2.5" fill="#0f172a"/>
        <circle cx="0.5" cy="0.5" r="1.5" fill="#ffffff"/>
      </g>

      <!-- Nose -->
      <path d="M -2 7 Q 0 11 4 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Rosy Happy Cheeks -->
      <ellipse cx="-20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.45"/>
      <ellipse cx="20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.45"/>

      <!-- Big Happy Smile -->
      <path d="M -14 16 Q 0 30 14 16 Z" fill="#991b1b"/>
      <path d="M -12 17 Q 0 22 12 17" stroke="#ffffff" stroke-width="3" fill="none"/>
      <path d="M -6 24 Q 0 28 6 24" fill="#f87171"/>
    </g>
  </g>

  <!-- THE JIGSAW PUZZLE ON THE TABLE (CLEAR LEARNING OBJECT: INTERLOCKING PIECES) -->
  <g transform="translate(230, 275)" filter="url(#s7_shadow)">
    <!-- Base Puzzle Frame / Mat -->
    <rect x="-30" y="-10" width="200" height="130" rx="12" fill="#1e293b" opacity="0.8"/>
    <!-- Yellow assembled puzzle section -->
    <rect x="-20" y="0" width="60" height="50" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
    <!-- Green assembled puzzle section -->
    <rect x="-20" y="55" width="60" height="55" rx="4" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
    <!-- Purple section -->
    <rect x="110" y="0" width="50" height="110" rx="4" fill="#a855f7" stroke="#7e22ce" stroke-width="2"/>

    <!-- THE TWO FITTING PIECES (PROMINENT CENTERPIECE) -->
    <!-- Blue Jigsaw Piece with tab/knob on right -->
    <g transform="translate(45, 10)">
      <path d="M 0 0 L 35 0 C 35 8, 48 8, 48 20 C 48 32, 35 32, 35 40 L 35 60 L 0 60 C 8 60, 8 48, 8 36 C 8 24, 8 24, 0 24 Z" fill="url(#s7_blue_piece)" stroke="#1e40af" stroke-width="2.5"/>
      <circle cx="20" cy="30" r="4" fill="#ffffff" opacity="0.4"/>
    </g>

    <!-- Red Jigsaw Piece with matching hollow socket (Snapping together!) -->
    <g transform="translate(80, 10)">
      <path d="M 0 0 L 30 0 L 30 60 L 0 60 C 0 52, -13 52, -13 40 C -13 28, 0 28, 0 20 Z" fill="url(#s7_red_piece)" stroke="#b91c1c" stroke-width="2.5"/>
      <circle cx="15" cy="30" r="4" fill="#ffffff" opacity="0.4"/>
    </g>

    <!-- Sparkles of Perfection / "It Fits!" -->
    <g transform="translate(80, 30)">
      <path d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" fill="#fef08a"/>
      <circle cx="0" cy="0" r="2" fill="#ffffff"/>
    </g>
    <g transform="translate(95, 12)">
      <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#fef08a"/>
    </g>
  </g>
</svg>
`;

export const SCENE_7_IMAGE = encodeSvg(SCENE_7_SVG);
