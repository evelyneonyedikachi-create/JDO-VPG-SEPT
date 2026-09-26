import { encodeSvg } from './encodeSvg';

export const SCENE_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s2_sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="s2_water_deep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>
    <linearGradient id="s2_water_surface" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#7dd3fc" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="s2_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s2_hills" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <filter id="s2_drop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="3" stdDeviation="3" flood-color="#075985" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Sky -->
  <rect width="600" height="230" fill="url(#s2_sky)"/>

  <!-- Bright Golden Summer Sun -->
  <g transform="translate(500, 50)">
    <circle cx="0" cy="0" r="45" fill="#fef08a" opacity="0.3"/>
    <circle cx="0" cy="0" r="32" fill="#fde047"/>
    <circle cx="0" cy="0" r="26" fill="#fbbf24"/>
  </g>

  <!-- Gentle Clouds -->
  <g fill="#ffffff" opacity="0.9" filter="url(#s2_drop)">
    <ellipse cx="140" cy="65" rx="55" ry="18"/>
    <ellipse cx="170" cy="55" rx="35" ry="24"/>
    <ellipse cx="115" cy="62" rx="30" ry="16"/>

    <ellipse cx="360" cy="80" rx="45" ry="15"/>
    <ellipse cx="385" cy="72" rx="28" ry="18"/>
  </g>

  <!-- Distant Blue Green Hills -->
  <path d="M 0 190 Q 90 140 210 175 Q 350 130 480 180 Q 550 160 600 175 L 600 230 L 0 230 Z" fill="#6ee7b7" opacity="0.6"/>
  <path d="M 0 205 Q 120 160 260 195 Q 400 165 600 195 L 600 240 L 0 240 Z" fill="url(#s2_hills)"/>

  <!-- Shoreline with lush pine trees & reeds -->
  <g transform="translate(0, 185)">
    <!-- Little wooden jetty / dock on left shore -->
    <rect x="20" y="25" width="90" height="10" rx="2" fill="#92400e" stroke="#78350f" stroke-width="2"/>
    <rect x="35" y="35" width="8" height="25" fill="#78350f"/>
    <rect x="85" y="35" width="8" height="25" fill="#78350f"/>
    <!-- Pine trees on right bank -->
    <polygon points="530,30 520,5 540,5" fill="#14532d"/>
    <polygon points="530,18 515,-5 545,-5" fill="#166534"/>
    <polygon points="560,35 548,10 572,10" fill="#14532d"/>
    <polygon points="560,22 542,-2 578,-2" fill="#166534"/>
  </g>

  <!-- Deep Blue Lake Water -->
  <rect y="225" width="600" height="225" fill="url(#s2_water_deep)"/>

  <!-- Sun Sparkles on Water Surface -->
  <g fill="#ffffff" opacity="0.7">
    <ellipse cx="180" cy="245" rx="35" ry="4"/>
    <ellipse cx="340" cy="240" rx="50" ry="5"/>
    <ellipse cx="480" cy="250" rx="40" ry="4"/>
    <ellipse cx="120" cy="265" rx="25" ry="3"/>
    <ellipse cx="260" cy="275" rx="60" ry="5"/>
    <ellipse cx="450" cy="280" rx="45" ry="4"/>
  </g>

  <!-- Water ripples and lily pad on right -->
  <g transform="translate(460, 360)">
    <ellipse cx="0" cy="0" rx="40" ry="14" fill="#16a34a" stroke="#15803d" stroke-width="2"/>
    <path d="M 0 0 L 25 -10" stroke="#047857" stroke-width="2"/>
    <!-- Little Water Lily Flower -->
    <circle cx="10" cy="-6" r="8" fill="#fda4af"/>
    <circle cx="10" cy="-6" r="4" fill="#fef08a"/>
  </g>

  <!-- JEDIDIAH SWIMMING ACTIVELY IN THE LAKE (CLEAR HUMAN CHARACTER) -->
  <g transform="translate(260, 220)">
    <!-- Right Arm Pulling Through Water (Behind) -->
    <path d="M -60 40 Q -100 20 -115 -10 Q -95 -25 -70 20" fill="url(#s2_skin)" opacity="0.8"/>
    <!-- Water Splashes around left stroke -->
    <ellipse cx="-100" cy="30" rx="24" ry="10" fill="#ffffff" opacity="0.8"/>

    <!-- Boy's Shoulders & Upper Back -->
    <path d="M -45 50 C -40 20, 40 20, 65 50 C 40 65, -20 65, -45 50 Z" fill="url(#s2_skin)"/>

    <!-- Left Arm Crawl Stroke (High out of water, reaching forward!) -->
    <g transform="translate(40, 20)">
      <!-- Upper arm lifting out of water -->
      <path d="M 10 20 Q 40 -15 70 -35 Q 90 -25 80 0 Q 55 15 20 35 Z" fill="url(#s2_skin)"/>
      <!-- Forearm & hand angled forward -->
      <path d="M 70 -35 Q 100 -50 125 -40 Q 115 -20 80 0 Z" fill="url(#s2_skin)"/>
      <!-- Fingers slicing air/water -->
      <path d="M 125 -40 Q 140 -35 135 -25 Q 120 -20 115 -25 Z" fill="url(#s2_skin)"/>
      <!-- Water droplets falling from raised arm -->
      <circle cx="75" cy="-8" r="3.5" fill="#e0f2fe" opacity="0.9"/>
      <circle cx="95" cy="-15" r="4" fill="#e0f2fe" opacity="0.9"/>
      <circle cx="110" cy="-5" r="3" fill="#e0f2fe" opacity="0.9"/>
    </g>

    <!-- NECK & HEAD -->
    <rect x="-10" y="10" width="22" height="25" fill="url(#s2_skin)" rx="4"/>

    <!-- Head with Happy Facial Expression -->
    <g transform="translate(0, -10)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s2_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s2_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s2_skin)"/>

      <!-- Wet Tousled Dark Brown Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>

      <!-- BLUE SWIM GOGGLES (Pushed up on forehead / hair - easily recognizable swimmer gear!) -->
      <g transform="translate(0, -22)">
        <!-- Goggle strap around head -->
        <path d="M -34 6 Q 0 0 34 6" stroke="#0284c7" stroke-width="4.5" fill="none"/>
        <!-- Left Lens Frame -->
        <rect x="-24" y="-8" width="20" height="15" rx="6" fill="#38bdf8" stroke="#0369a1" stroke-width="3" opacity="0.9"/>
        <line x1="-19" y1="-5" x2="-10" y2="4" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
        <!-- Right Lens Frame -->
        <rect x="4" y="-8" width="20" height="15" rx="6" fill="#38bdf8" stroke="#0369a1" stroke-width="3" opacity="0.9"/>
        <line x1="9" y1="-5" x2="18" y2="4" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
        <!-- Bridge -->
        <rect x="-4" y="-3" width="8" height="4" rx="2" fill="#0369a1"/>
      </g>

      <!-- Joyful Eyebrows -->
      <path d="M -22 -6 Q -14 -13 -6 -7" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 6 -7 Q 14 -13 22 -6" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Big Bright Eyes (Looking happily at viewer/water) -->
      <g transform="translate(-14, 0)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <circle cx="1" cy="0" r="4.5" fill="#451a03"/>
        <circle cx="1" cy="0" r="2.5" fill="#0f172a"/>
        <circle cx="2.5" cy="-1.5" r="1.5" fill="#ffffff"/>
      </g>
      <g transform="translate(14, 0)">
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#ffffff"/>
        <circle cx="-1" cy="0" r="4.5" fill="#451a03"/>
        <circle cx="-1" cy="0" r="2.5" fill="#0f172a"/>
        <circle cx="0.5" cy="-1.5" r="1.5" fill="#ffffff"/>
      </g>

      <!-- Cute Nose -->
      <path d="M -2 7 Q 0 11 4 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Cheeks flushed from swimming fun -->
      <ellipse cx="-20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.5"/>
      <ellipse cx="20" cy="11" rx="8" ry="5" fill="#f87171" opacity="0.5"/>

      <!-- Big Excited Open Smile -->
      <path d="M -15 16 Q 0 32 15 16 Z" fill="#991b1b"/>
      <path d="M -13 17 Q 0 22 13 17" stroke="#ffffff" stroke-width="3.5" fill="none"/>
      <path d="M -7 25 Q 0 29 7 25" fill="#f87171"/>
    </g>

    <!-- Water Splash & Bow Wave cutting in front of swimmer's chest -->
    <path d="M -140 55 Q -60 40 0 52 Q 60 40 160 55 L 140 85 Q 0 65 -120 85 Z" fill="url(#s2_water_surface)"/>
    <!-- Foamy white splash crests -->
    <path d="M -80 50 Q -50 35 -20 50 Q 10 38 40 48 Q 70 35 100 52" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <circle cx="-45" cy="42" r="4" fill="#ffffff" opacity="0.9"/>
    <circle cx="-15" cy="38" r="3.5" fill="#ffffff" opacity="0.9"/>
    <circle cx="25" cy="36" r="4.5" fill="#ffffff" opacity="0.9"/>
    <circle cx="55" cy="40" r="3" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>
`;

export const SCENE_2_IMAGE = encodeSvg(SCENE_2_SVG);
