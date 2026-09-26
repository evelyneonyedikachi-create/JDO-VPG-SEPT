import { encodeSvg } from './encodeSvg';

export const SCENE_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s3_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="s3_counter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="25%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="s3_board" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="50%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
    <linearGradient id="s3_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s3_shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="s3_apple" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="40%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <filter id="s3_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Kitchen Wall with subtle tile grid -->
  <rect width="600" height="260" fill="url(#s3_wall)"/>
  <g stroke="#cbd5e1" stroke-width="1.5" opacity="0.6">
    <line x1="0" y1="65" x2="600" y2="65"/>
    <line x1="0" y1="130" x2="600" y2="130"/>
    <line x1="0" y1="195" x2="600" y2="195"/>
    <!-- Vertical tile seams -->
    <line x1="80" y1="0" x2="80" y2="65"/>
    <line x1="160" y1="65" x2="160" y2="130"/>
    <line x1="240" y1="0" x2="240" y2="65"/>
    <line x1="320" y1="65" x2="320" y2="130"/>
    <line x1="400" y1="0" x2="400" y2="65"/>
    <line x1="480" y1="65" x2="480" y2="130"/>
    <line x1="560" y1="0" x2="560" y2="65"/>
  </g>

  <!-- Kitchen Shelf on Wall -->
  <g transform="translate(60, 45)" filter="url(#s3_shadow)">
    <rect width="180" height="12" rx="3" fill="#92400e"/>
    <!-- Glass Spice Jars -->
    <rect x="25" y="-22" width="22" height="22" rx="4" fill="#e0f2fe" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="27" y="-28" width="18" height="6" rx="2" fill="#d97706"/>
    <rect x="65" y="-26" width="24" height="26" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" opacity="0.8"/>
    <rect x="68" y="-32" width="18" height="6" rx="2" fill="#d97706"/>
    <rect x="110" y="-20" width="26" height="20" rx="4" fill="#fbcfe8" stroke="#db2777" stroke-width="1.5" opacity="0.8"/>
    <rect x="114" y="-26" width="18" height="6" rx="2" fill="#d97706"/>
  </g>

  <!-- Wooden Kitchen Counter -->
  <g transform="translate(0, 240)" filter="url(#s3_shadow)">
    <rect width="600" height="30" fill="#f59e0b"/>
    <rect y="25" width="600" height="185" fill="url(#s3_counter)"/>
    <!-- Cabinet seams -->
    <line x1="200" y1="40" x2="200" y2="210" stroke="#451a03" stroke-width="2.5"/>
    <line x1="400" y1="40" x2="400" y2="210" stroke="#451a03" stroke-width="2.5"/>
    <circle cx="185" cy="110" r="5" fill="#fef3c7"/>
    <circle cx="215" cy="110" r="5" fill="#fef3c7"/>
  </g>

  <!-- Large Wooden Chopping Board in Center Foreground -->
  <g transform="translate(190, 245)" filter="url(#s3_shadow)">
    <rect width="230" height="130" rx="16" fill="url(#s3_board)" stroke="#b45309" stroke-width="3"/>
    <rect x="12" y="10" width="206" height="110" rx="10" fill="none" stroke="#fed7aa" stroke-width="2" opacity="0.6"/>
    <!-- Little handle hole -->
    <circle cx="28" cy="65" r="10" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
  </g>

  <!-- JEDIDIAH STANDING AT COUNTER SLICING THE APPLE (CLEAR ACTION & EMOTION) -->
  <g transform="translate(220, 75)">
    <!-- Boy's Torso in Signature Green T-Shirt -->
    <path d="M 25 125 L 145 125 L 155 200 L 15 200 Z" fill="url(#s3_shirt)"/>
    <!-- White Inner Collar -->
    <path d="M 65 125 Q 85 142 105 125" stroke="#ffffff" stroke-width="6" fill="none"/>

    <!-- Left Arm & Hand Holding Apple Steadily -->
    <g transform="translate(30, 130)">
      <path d="M 0 10 Q -15 50 15 75" stroke="url(#s3_shirt)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Forearm extending down to board -->
      <path d="M 12 70 Q 30 100 55 105" stroke="url(#s3_skin)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <!-- Hand gently bracing the apple -->
      <g transform="translate(60, 110)">
        <circle cx="0" cy="0" r="13" fill="url(#s3_skin)"/>
        <!-- Curved fingers holding top of apple -->
        <path d="M -8 -4 Q 0 8 10 12" stroke="url(#s3_skin)" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M -2 -8 Q 6 4 16 8" stroke="url(#s3_skin)" stroke-width="7" stroke-linecap="round" fill="none"/>
      </g>
    </g>

    <!-- Right Arm & Hand Holding Kitchen Knife Carefully -->
    <g transform="translate(135, 130)">
      <path d="M 0 10 Q 20 45 -5 75" stroke="url(#s3_shirt)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Forearm reaching towards apple -->
      <path d="M -5 70 Q -25 95 -50 100" stroke="url(#s3_skin)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <!-- Hand gripping knife handle -->
      <g transform="translate(-55, 102)">
        <circle cx="0" cy="0" r="13" fill="url(#s3_skin)"/>
        <path d="M -6 -6 Q 0 6 8 8" stroke="url(#s3_skin)" stroke-width="8" stroke-linecap="round" fill="none"/>

        <!-- THE KITCHEN KNIFE (Silver blade slicing down into apple) -->
        <g transform="rotate(-15)">
          <!-- Wooden/Black Handle -->
          <rect x="-18" y="-7" width="24" height="14" rx="4" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="-10" cy="0" r="2" fill="#cbd5e1"/>
          <!-- Shiny Steel Blade -->
          <path d="M 6 -6 L 75 -6 Q 85 0 75 8 L 6 8 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="12" y1="-3" x2="70" y2="-3" stroke="#ffffff" stroke-width="2"/>
        </g>
      </g>
    </g>

    <!-- NECK & HEAD LEANING FORWARD ATTENTIVELY -->
    <rect x="75" y="105" width="22" height="26" fill="url(#s3_skin)" rx="4"/>

    <g transform="translate(85, 75)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s3_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s3_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s3_skin)"/>

      <!-- Signature Tousled Dark Brown Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>
      <path d="M -28 -15 Q -15 -28 0 -18 Q 15 -30 28 -16 Q 10 -22 -5 -16 Z" fill="#451a03"/>

      <!-- Attentive, Concentrating Eyebrows (slanted slightly down in careful focus) -->
      <path d="M -22 -6 Q -14 -10 -6 -8" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 6 -8 Q 14 -10 22 -6" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Expressive Eyes Looking Down at the Cutting Board -->
      <g transform="translate(-14, 0)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <!-- Pupil focused downward towards hands -->
        <circle cx="0" cy="2" r="4.5" fill="#451a03"/>
        <circle cx="0" cy="2.5" r="2.5" fill="#0f172a"/>
        <circle cx="1.5" cy="0.5" r="1.5" fill="#ffffff"/>
      </g>
      <g transform="translate(14, 0)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <!-- Pupil focused downward towards hands -->
        <circle cx="0" cy="2" r="4.5" fill="#451a03"/>
        <circle cx="0" cy="2.5" r="2.5" fill="#0f172a"/>
        <circle cx="1.5" cy="0.5" r="1.5" fill="#ffffff"/>
      </g>

      <!-- Nose -->
      <path d="M -2 7 Q 0 11 4 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Soft Pink Cheeks -->
      <ellipse cx="-20" cy="12" rx="8" ry="5" fill="#f87171" opacity="0.45"/>
      <ellipse cx="20" cy="12" rx="8" ry="5" fill="#f87171" opacity="0.45"/>

      <!-- Gentle Focused Smile (Proud of cutting safely) -->
      <path d="M -10 18 Q 0 26 10 18" stroke="#991b1b" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
  </g>

  <!-- THE RED APPLE & SLICES ON THE CHOPPING BOARD (PROMINENT LEARNING OBJECT) -->
  <g transform="translate(290, 290)" filter="url(#s3_shadow)">
    <!-- Red Apple Half Being Sliced -->
    <ellipse cx="0" cy="0" rx="22" ry="20" fill="url(#s3_apple)"/>
    <path d="M -2 -20 Q 2 -26 6 -24" stroke="#78350f" stroke-width="3" fill="none"/>
    <!-- Little green leaf on stem -->
    <path d="M 0 -22 Q 10 -26 14 -20 Q 6 -18 0 -22 Z" fill="#22c55e"/>
    <!-- Pale yellow juicy apple flesh inside slice -->
    <ellipse cx="6" cy="2" rx="14" ry="16" fill="#fef9c3"/>
    <circle cx="6" cy="2" r="2.5" fill="#78350f"/>

    <!-- Cut Apple Wedge 1 Beside It -->
    <g transform="translate(45, -5) rotate(25)">
      <path d="M -8 -16 Q 16 0 -8 16 Q -4 0 -8 -16 Z" fill="url(#s3_apple)"/>
      <path d="M -6 -13 Q 12 0 -6 13 Q -2 0 -6 -13 Z" fill="#fef9c3"/>
    </g>

    <!-- Cut Apple Wedge 2 Beside It -->
    <g transform="translate(65, 15) rotate(45)">
      <path d="M -8 -16 Q 16 0 -8 16 Q -4 0 -8 -16 Z" fill="url(#s3_apple)"/>
      <path d="M -6 -13 Q 12 0 -6 13 Q -2 0 -6 -13 Z" fill="#fef9c3"/>
    </g>
  </g>
</svg>
`;

export const SCENE_3_IMAGE = encodeSvg(SCENE_3_SVG);
