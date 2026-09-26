import { encodeSvg } from './encodeSvg';

export const SCENE_5_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s5_sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="s5_hill_far" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="s5_hill_near" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="s5_stone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="s5_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s5_shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <filter id="s5_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#1e293b" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Sky with Golden Sunset/Afternoon Glow -->
  <rect width="600" height="280" fill="url(#s5_sky)"/>

  <!-- Distant Mountains -->
  <path d="M 0 180 L 120 120 L 240 170 L 380 110 L 520 160 L 600 130 L 600 280 L 0 280 Z" fill="#93c5fd" opacity="0.4"/>

  <!-- Rolling Green Hill supporting the Castle on right -->
  <path d="M 180 260 Q 380 140 600 190 L 600 360 L 180 360 Z" fill="url(#s5_hill_far)"/>

  <!-- THE ANCIENT MEDIEVAL CASTLE (IMPRESSIVE, DETAILED STONE TOWERS) -->
  <g transform="translate(360, 80)" filter="url(#s5_shadow)">
    <!-- Central Castle Wall & Battlements -->
    <rect x="50" y="70" width="110" height="90" fill="url(#s5_stone)"/>
    <!-- Castle Wall Battlements (Zinnen) -->
    <path d="M 50 70 L 50 58 L 65 58 L 65 70 L 80 70 L 80 58 L 95 58 L 95 70 L 110 70 L 110 58 L 125 58 L 125 70 L 140 70 L 140 58 L 155 58 L 155 70 Z" fill="#475569"/>

    <!-- High Watchtower on Left with Arched Window -->
    <rect x="25" y="30" width="45" height="130" fill="url(#s5_stone)"/>
    <path d="M 22 30 L 22 20 L 33 20 L 33 30 L 44 30 L 44 20 L 55 20 L 55 30 L 66 30 L 66 20 L 73 20 L 73 30 Z" fill="#334155"/>
    <!-- Conical Tower Roof -->
    <polygon points="47,-15 15,22 80,22" fill="#b91c1c"/>
    <!-- Fluttering Red Pennant / Flag on Tower -->
    <line x1="47" y1="-15" x2="47" y2="-30" stroke="#78350f" stroke-width="2"/>
    <polygon points="47,-30 68,-22 47,-16" fill="#ef4444"/>
    <!-- Arched Castle Window -->
    <path d="M 40 60 Q 47 50 54 60 L 54 75 L 40 75 Z" fill="#0f172a"/>

    <!-- Tall Grand Keep / Tower on Right -->
    <rect x="135" y="15" width="55" height="145" fill="url(#s5_stone)"/>
    <path d="M 130 15 L 130 5 L 144 5 L 144 15 L 158 15 L 158 5 L 172 5 L 172 15 L 186 15 L 186 5 L 195 5 L 195 15 Z" fill="#334155"/>
    <!-- Conical Roof -->
    <polygon points="162,-30 125,7 200,7" fill="#b91c1c"/>
    <line x1="162" y1="-30" x2="162" y2="-45" stroke="#78350f" stroke-width="2"/>
    <polygon points="162,-45 185,-37 162,-30" fill="#ef4444"/>
    <!-- Windows -->
    <path d="M 155 45 Q 162 36 170 45 L 170 60 L 155 60 Z" fill="#0f172a"/>
    <path d="M 155 85 Q 162 76 170 85 L 170 100 L 155 100 Z" fill="#0f172a"/>

    <!-- Large Arched Castle Gate / Portcullis -->
    <path d="M 85 160 Q 105 130 125 160 Z" fill="#0f172a"/>
    <!-- Wooden Gate Details -->
    <rect x="88" y="142" width="34" height="18" fill="#78350f"/>
    <line x1="105" y1="135" x2="105" y2="160" stroke="#0f172a" stroke-width="2"/>
  </g>

  <!-- Foreground Green Meadow & Cobblestone Path -->
  <path d="M 0 280 Q 250 240 600 320 L 600 450 L 0 450 Z" fill="url(#s5_hill_near)"/>

  <!-- Cobblestone Hiking Path Leading Towards Castle -->
  <path d="M 40 450 Q 140 370 240 340 Q 360 300 440 270 L 460 275 Q 380 308 260 350 Q 170 385 80 450 Z" fill="#d6d3d1"/>
  <!-- Little Stone Texture Marks -->
  <g fill="#a8a29e" opacity="0.7">
    <ellipse cx="120" cy="415" rx="8" ry="4"/>
    <ellipse cx="150" cy="395" rx="7" ry="3"/>
    <ellipse cx="210" cy="365" rx="6" ry="3"/>
    <ellipse cx="280" cy="340" rx="6" ry="2.5"/>
    <ellipse cx="360" cy="310" rx="5" ry="2"/>
  </g>

  <!-- JEDIDIAH HIKING & POINTING IN WONDER (CLEAR BODY GESTURE & EMOTION) -->
  <g transform="translate(100, 200)" filter="url(#s5_shadow)">
    <!-- Blue Backpack on Back -->
    <g transform="translate(-18, 90)">
      <rect width="28" height="42" rx="10" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
      <rect x="4" y="8" width="20" height="22" rx="4" fill="#3b82f6"/>
      <!-- Straps over shoulder -->
      <path d="M 12 8 Q 25 15 32 30" stroke="#1d4ed8" stroke-width="4.5" fill="none"/>
    </g>

    <!-- Boy's Body in Signature Green T-Shirt (Turned slightly, looking up) -->
    <path d="M 10 95 L 75 95 L 85 165 L 15 165 Z" fill="url(#s5_shirt)"/>
    <path d="M 35 95 Q 50 108 65 95" stroke="#ffffff" stroke-width="5" fill="none"/>

    <!-- Left Arm & Hand Raised High, Pointing Forward at Castle! -->
    <g transform="translate(60, 95)">
      <path d="M 10 15 Q 50 5 95 -15" stroke="url(#s5_shirt)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <!-- Forearm and Extended Index Finger -->
      <path d="M 85 -10 Q 115 -25 140 -35" stroke="url(#s5_skin)" stroke-width="18" stroke-linecap="round" fill="none"/>
      <!-- Pointing Hand & Finger -->
      <circle cx="140" cy="-35" r="10" fill="url(#s5_skin)"/>
      <line x1="140" y1="-35" x2="162" y2="-45" stroke="url(#s5_skin)" stroke-width="7" stroke-linecap="round"/>
    </g>

    <!-- Denim Jeans & Sturdy Shoes -->
    <g transform="translate(20, 165)">
      <rect x="0" y="0" width="24" height="50" rx="4" fill="#1e3a8a"/>
      <rect x="30" y="0" width="24" height="50" rx="4" fill="#1e3a8a"/>
      <!-- Shoes -->
      <ellipse cx="10" cy="52" rx="15" ry="8" fill="#dc2626"/>
      <ellipse cx="44" cy="52" rx="15" ry="8" fill="#dc2626"/>
    </g>

    <!-- Neck -->
    <rect x="42" y="75" width="20" height="24" fill="url(#s5_skin)" rx="4"/>

    <!-- HEAD & EXPRESSION: AWESTRUCK, EXCITED WONDER -->
    <g transform="translate(52, 45)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s5_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s5_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s5_skin)"/>

      <!-- Signature Tousled Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>
      <path d="M -28 -15 Q -15 -28 0 -18 Q 15 -30 28 -16 Q 10 -22 -5 -16 Z" fill="#451a03"/>

      <!-- High Raised Eyebrows (Awe & Astonishment!) -->
      <path d="M -22 -14 Q -14 -22 -6 -15" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 6 -15 Q 14 -22 22 -14" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>

      <!-- Wide Open Astonished Eyes (Looking up at Castle) -->
      <g transform="translate(-14, -4)">
        <ellipse cx="0" cy="0" rx="8" ry="7.5" fill="#ffffff"/>
        <circle cx="2" cy="-1" r="5" fill="#451a03"/>
        <circle cx="2" cy="-1" r="2.8" fill="#0f172a"/>
        <circle cx="3.5" cy="-2.5" r="1.8" fill="#ffffff"/>
      </g>
      <g transform="translate(14, -4)">
        <ellipse cx="0" cy="0" rx="8" ry="7.5" fill="#ffffff"/>
        <circle cx="2" cy="-1" r="5" fill="#451a03"/>
        <circle cx="2" cy="-1" r="2.8" fill="#0f172a"/>
        <circle cx="3.5" cy="-2.5" r="1.8" fill="#ffffff"/>
      </g>

      <!-- Nose -->
      <path d="M -2 5 Q 0 9 4 7" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Rosy Cheeks from Hike -->
      <ellipse cx="-20" cy="10" rx="8" ry="5" fill="#f87171" opacity="0.45"/>
      <ellipse cx="20" cy="10" rx="8" ry="5" fill="#f87171" opacity="0.45"/>

      <!-- Wide Open Excited Mouth ("WOW! Look at that castle!") -->
      <ellipse cx="0" cy="19" rx="10" ry="12" fill="#991b1b"/>
      <path d="M -8 15 Q 0 18 8 15" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <ellipse cx="0" cy="24" rx="6" ry="4" fill="#f87171"/>
    </g>
  </g>
</svg>
`;

export const SCENE_5_IMAGE = encodeSvg(SCENE_5_SVG);
