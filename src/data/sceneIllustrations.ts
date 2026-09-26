// High-quality SVG Storybook Illustrations for the 9 Bildgeschichte Scenes
// Clean 4:3 ratio (600x450), vibrant colors, child-friendly 2nd/3rd grade primary school art style.

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const SCENE_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="blanket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Wall & Floor -->
  <rect width="600" height="340" fill="url(#wall)"/>
  <rect y="340" width="600" height="110" fill="url(#floor)"/>
  <rect y="335" width="600" height="8" fill="#92400e"/>

  <!-- Window with Morning Sun -->
  <g transform="translate(60, 40)" filter="url(#shadow)">
    <!-- Window Frame -->
    <rect width="160" height="200" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="6"/>
    <rect x="8" y="8" width="144" height="184" rx="10" fill="url(#sky)"/>
    <!-- Rising Sun & Rays -->
    <circle cx="120" cy="50" r="34" fill="#fbbf24"/>
    <circle cx="120" cy="50" r="42" fill="#fde047" opacity="0.3"/>
    <!-- Gentle Cloud -->
    <ellipse cx="60" cy="80" rx="35" ry="16" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="80" cy="74" rx="24" ry="18" fill="#ffffff" opacity="0.9"/>
    <!-- Window Cross Panes -->
    <line x1="80" y1="8" x2="80" y2="192" stroke="#ffffff" stroke-width="6"/>
    <line x1="8" y1="100" x2="152" y2="100" stroke="#ffffff" stroke-width="6"/>
    <!-- Window Sill -->
    <rect x="-8" y="196" width="176" height="14" rx="4" fill="#f1f5f9"/>
  </g>

  <!-- Picture Frame on Wall -->
  <g transform="translate(470, 50)" filter="url(#shadow)">
    <rect width="80" height="90" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="4"/>
    <rect x="8" y="8" width="64" height="74" fill="#ecfdf5"/>
    <circle cx="40" cy="35" r="14" fill="#34d399"/>
    <polygon points="20,70 40,45 60,70" fill="#059669"/>
  </g>

  <!-- Bed Frame -->
  <g transform="translate(230, 180)" filter="url(#shadow)">
    <!-- Headboard -->
    <rect x="0" y="0" width="28" height="180" rx="8" fill="#d97706"/>
    <rect x="250" y="50" width="24" height="130" rx="6" fill="#d97706"/>
    <rect x="20" y="110" width="240" height="24" rx="4" fill="#b45309"/>
    <!-- Legs -->
    <rect x="6" y="170" width="16" height="35" rx="3" fill="#92400e"/>
    <rect x="254" y="170" width="16" height="35" rx="3" fill="#92400e"/>

    <!-- Mattress -->
    <rect x="24" y="90" width="234" height="30" rx="6" fill="#f8fafc"/>

    <!-- Fluffy Pillow -->
    <rect x="36" y="66" width="70" height="36" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Cheerful Boy Stretching in Bed -->
    <!-- Torso (Striped Pajamas) -->
    <rect x="90" y="60" width="56" height="50" rx="10" fill="#38bdf8"/>
    <line x1="90" y1="72" x2="146" y2="72" stroke="#ffffff" stroke-width="3"/>
    <line x1="90" y1="86" x2="146" y2="86" stroke="#ffffff" stroke-width="3"/>
    <line x1="90" y1="100" x2="146" y2="100" stroke="#ffffff" stroke-width="3"/>

    <!-- Boy's Head -->
    <circle cx="118" cy="40" r="22" fill="#fcd34d"/>
    <!-- Hair -->
    <path d="M 96 35 C 96 16, 140 16, 140 35 C 132 25, 108 25, 96 35 Z" fill="#78350f"/>
    <!-- Face Expression (Waking Up Happy) -->
    <!-- Eyes (Curved Smiling Eyes) -->
    <path d="M 108 38 Q 112 34 116 38" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 122 38 Q 126 34 130 38" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Big Smile -->
    <path d="M 112 47 Q 119 54 126 47" stroke="#dc2626" stroke-width="2.5" fill="#fca5a5" stroke-linecap="round"/>
    <!-- Rosy Cheeks -->
    <circle cx="106" cy="44" r="4" fill="#f87171" opacity="0.6"/>
    <circle cx="132" cy="44" r="4" fill="#f87171" opacity="0.6"/>

    <!-- Stretching Arms Up -->
    <path d="M 90 70 Q 70 45 74 25" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" fill="none"/>
    <circle cx="74" cy="24" r="7" fill="#fcd34d"/>
    <path d="M 146 70 Q 166 45 162 25" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" fill="none"/>
    <circle cx="162" cy="24" r="7" fill="#fcd34d"/>

    <!-- Cozy Blue Blanket Draped Over Bed -->
    <path d="M 50 96 C 80 86, 140 92, 170 96 L 255 106 L 255 140 L 40 140 Z" fill="url(#blanket)"/>
    <path d="M 50 96 C 80 86, 140 92, 170 96" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
  </g>

  <!-- Bedside Table with Alarm Clock -->
  <g transform="translate(130, 260)" filter="url(#shadow)">
    <!-- Small Nightstand -->
    <rect width="65" height="95" rx="8" fill="#d97706" stroke="#92400e" stroke-width="2"/>
    <rect x="8" y="12" width="49" height="30" rx="4" fill="#b45309"/>
    <circle cx="32" cy="27" r="4" fill="#fcd34d"/>
    <rect x="8" y="52" width="49" height="30" rx="4" fill="#b45309"/>
    <circle cx="32" cy="67" r="4" fill="#fcd34d"/>

    <!-- Round Alarm Clock (7:00) -->
    <circle cx="32" cy="-14" r="20" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
    <!-- Bells & Feet -->
    <circle cx="18" cy="-30" r="7" fill="#f59e0b"/>
    <circle cx="46" cy="-30" r="7" fill="#f59e0b"/>
    <line x1="22" y1="4" x2="16" y2="10" stroke="#b91c1c" stroke-width="3" stroke-linecap="round"/>
    <line x1="42" y1="4" x2="48" y2="10" stroke="#b91c1c" stroke-width="3" stroke-linecap="round"/>
    <!-- Clock Face -->
    <circle cx="32" cy="-14" r="14" fill="#ffffff"/>
    <line x1="32" y1="-14" x2="32" y2="-23" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
    <line x1="32" y1="-14" x2="39" y2="-14" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- Bedroom Rug on Floor -->
  <ellipse cx="360" cy="410" rx="140" ry="25" fill="#f43f5e" opacity="0.85"/>
  <ellipse cx="360" cy="410" rx="120" ry="20" fill="#fb7185" opacity="0.6"/>
  <!-- Cozy Bedroom Slippers -->
  <ellipse cx="260" cy="410" rx="12" ry="7" fill="#3b82f6"/>
  <ellipse cx="280" cy="408" rx="12" ry="7" fill="#3b82f6"/>
</svg>
`;

export const SCENE_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="40%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>
    <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="230" fill="url(#sky2)"/>

  <!-- Warm Summer Sun -->
  <circle cx="500" cy="60" r="42" fill="#fbbf24"/>
  <circle cx="500" cy="60" r="54" fill="#fde047" opacity="0.35"/>
  <!-- Sunbeams -->
  <path d="M 500 0 L 500 12 M 500 108 L 500 120 M 440 60 L 452 60 M 548 60 L 560 60" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>

  <!-- Friendly Fluffy Clouds -->
  <ellipse cx="140" cy="60" rx="45" ry="20" fill="#ffffff" opacity="0.95"/>
  <ellipse cx="170" cy="52" rx="35" ry="22" fill="#ffffff" opacity="0.95"/>
  <ellipse cx="320" cy="80" rx="35" ry="16" fill="#ffffff" opacity="0.85"/>

  <!-- Rolling Green Hills & Lake Shore -->
  <path d="M 0 200 Q 150 140 320 180 Q 480 150 600 190 L 600 240 L 0 240 Z" fill="url(#hills)"/>
  <!-- Shore Trees -->
  <circle cx="90" cy="165" r="22" fill="#166534"/>
  <circle cx="120" cy="160" r="18" fill="#15803d"/>
  <circle cx="450" cy="168" r="20" fill="#166534"/>
  <circle cx="475" cy="164" r="16" fill="#15803d"/>

  <!-- Sparkling Lake Water -->
  <rect y="210" width="600" height="240" fill="url(#water)"/>

  <!-- Water Highlights / Ripples -->
  <path d="M 40 240 Q 90 235 140 240 M 200 250 Q 260 245 320 250 M 400 238 Q 460 234 520 238" stroke="#7dd3fc" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path d="M 80 290 Q 150 284 220 290 M 340 295 Q 420 290 500 295 M 50 360 Q 130 355 210 360" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M 280 370 Q 370 364 460 370 M 160 415 Q 260 410 360 415" stroke="#bae6fd" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>

  <!-- Friendly Little Fish in Lake -->
  <g transform="translate(120, 320)">
    <ellipse cx="0" cy="0" rx="16" ry="9" fill="#f97316"/>
    <polygon points="12,0 24,-8 24,8" fill="#ea580c"/>
    <circle cx="-8" cy="-2" r="2.5" fill="#ffffff"/>
    <circle cx="-9" cy="-2" r="1.2" fill="#000000"/>
  </g>
  <g transform="translate(460, 340)">
    <ellipse cx="0" cy="0" rx="14" ry="8" fill="#fbbf24"/>
    <polygon points="10,0 20,-6 20,6" fill="#f59e0b"/>
    <circle cx="-6" cy="-2" r="2" fill="#ffffff"/>
    <circle cx="-7" cy="-2" r="1" fill="#000000"/>
  </g>

  <!-- Water Splash around Swimmer -->
  <ellipse cx="300" cy="305" rx="70" ry="16" fill="#bae6fd" opacity="0.6"/>
  <circle cx="240" cy="290" r="4" fill="#ffffff"/>
  <circle cx="250" cy="285" r="3" fill="#ffffff"/>
  <circle cx="355" cy="288" r="4" fill="#ffffff"/>
  <circle cx="365" cy="294" r="3" fill="#ffffff"/>

  <!-- The Boy Swimming with Diving Goggles & Snorkel -->
  <g transform="translate(300, 270)">
    <!-- Swimmer's Back / Shoulders in Water -->
    <ellipse cx="0" cy="20" rx="42" ry="18" fill="#fcd34d"/>
    <!-- Swimming Trunks visible in clear water -->
    <path d="M -30 24 Q 0 35 30 24 Q 25 45 0 42 Q -25 45 -30 24 Z" fill="#ef4444" opacity="0.75"/>

    <!-- Arms Splashing Forward -->
    <path d="M -28 14 Q -55 -10 -40 -20" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" fill="none"/>
    <circle cx="-40" cy="-20" r="7" fill="#fcd34d"/>
    <path d="M 28 14 Q 55 5 65 20" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" fill="none"/>
    <circle cx="65" cy="20" r="7" fill="#fcd34d"/>

    <!-- Head -->
    <circle cx="0" cy="-10" r="24" fill="#fcd34d"/>
    <!-- Wet Brown Hair -->
    <path d="M -24 -15 C -24 -36, 24 -36, 24 -15 C 16 -25, -12 -25, -24 -15 Z" fill="#78350f"/>

    <!-- Blue Diving Goggles (Taucherbrille) -->
    <rect x="-20" y="-18" width="40" height="15" rx="7" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
    <ellipse cx="-10" cy="-10" rx="8" ry="5" fill="#e0f2fe" opacity="0.9"/>
    <ellipse cx="10" cy="-10" rx="8" ry="5" fill="#e0f2fe" opacity="0.9"/>
    <line x1="-24" y1="-10" x2="-20" y2="-10" stroke="#0284c7" stroke-width="3"/>
    <line x1="20" y1="-10" x2="24" y2="-10" stroke="#0284c7" stroke-width="3"/>

    <!-- Cheerful Open Mouth (Breathing) -->
    <ellipse cx="0" cy="3" rx="7" ry="5" fill="#dc2626"/>
    <!-- Yellow Snorkel Tube -->
    <path d="M 14 0 Q 32 4 30 -28 L 30 -38" stroke="#facc15" stroke-width="5" stroke-linecap="round" fill="none"/>
    <rect x="26" y="-40" width="8" height="6" rx="2" fill="#ef4444"/>
  </g>
</svg>
`;

export const SCENE_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="kitchenWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="counter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="board" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="apple" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="60%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>

  <!-- Kitchen Tiled Wall -->
  <rect width="600" height="230" fill="url(#kitchenWall)"/>
  <!-- Subway Tiles -->
  <g stroke="#cbd5e1" stroke-width="1.5" opacity="0.6">
    <line x1="0" y1="40" x2="600" y2="40"/>
    <line x1="0" y1="80" x2="600" y2="80"/>
    <line x1="0" y1="120" x2="600" y2="120"/>
    <line x1="0" y1="160" x2="600" y2="160"/>
    <line x1="0" y1="200" x2="600" y2="200"/>
    <!-- Vertical lines offset -->
    <line x1="80" y1="0" x2="80" y2="40"/><line x1="200" y1="0" x2="200" y2="40"/><line x1="320" y1="0" x2="320" y2="40"/><line x1="440" y1="0" x2="440" y2="40"/><line x1="560" y1="0" x2="560" y2="40"/>
    <line x1="140" y1="40" x2="140" y2="80"/><line x1="260" y1="40" x2="260" y2="80"/><line x1="380" y1="40" x2="380" y2="80"/><line x1="500" y1="40" x2="500" y2="80"/>
    <line x1="80" y1="80" x2="80" y2="120"/><line x1="200" y1="80" x2="200" y2="120"/><line x1="320" y1="80" x2="320" y2="120"/><line x1="440" y1="80" x2="440" y2="120"/>
  </g>

  <!-- Fresh Herb Pot on Counter -->
  <g transform="translate(480, 140)">
    <rect x="0" y="30" width="60" height="50" rx="4" fill="#ea580c"/>
    <ellipse cx="30" cy="30" rx="30" ry="8" fill="#c2410c"/>
    <!-- Basil Leaves -->
    <ellipse cx="20" cy="18" rx="14" ry="18" fill="#22c55e" transform="rotate(-20, 20, 18)"/>
    <ellipse cx="40" cy="16" rx="14" ry="18" fill="#16a34a" transform="rotate(20, 40, 16)"/>
    <ellipse cx="30" cy="5" rx="12" ry="16" fill="#4ade80"/>
  </g>

  <!-- Fruit Bowl in Background -->
  <g transform="translate(60, 150)">
    <ellipse cx="50" cy="60" rx="55" ry="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="35" cy="45" r="16" fill="#f97316"/>
    <path d="M 40 45 Q 65 30 85 45" stroke="#facc15" stroke-width="12" stroke-linecap="round" fill="none"/>
  </g>

  <!-- Granite Countertop -->
  <rect y="220" width="600" height="230" fill="url(#counter)"/>
  <rect y="220" width="600" height="12" fill="#64748b"/>

  <!-- Wooden Cutting Board (Holzbrett) -->
  <g transform="translate(100, 250)">
    <!-- Board Shadow -->
    <rect x="8" y="12" width="400" height="160" rx="20" fill="#1e293b" opacity="0.4"/>
    <!-- Wood Board -->
    <rect width="400" height="160" rx="20" fill="url(#board)" stroke="#78350f" stroke-width="3"/>
    <!-- Wood Grains -->
    <path d="M 30 40 Q 150 48 370 38 M 20 80 Q 200 88 380 78 M 35 120 Q 180 128 365 118" stroke="#78350f" stroke-width="1.5" fill="none" opacity="0.4"/>
    <!-- Board Handle Hole -->
    <ellipse cx="40" cy="80" rx="10" ry="16" fill="#334155" stroke="#78350f" stroke-width="2"/>

    <!-- Whole Red Apple -->
    <g transform="translate(150, 40)">
      <!-- Apple Shadow -->
      <ellipse cx="40" cy="72" rx="36" ry="10" fill="#581c87" opacity="0.3"/>
      <!-- Apple Body -->
      <path d="M 40 18 C 15 10, 0 35, 10 65 C 20 85, 38 88, 40 86 C 42 88, 60 85, 70 65 C 80 35, 65 10, 40 18 Z" fill="url(#apple)"/>
      <!-- Apple Highlight -->
      <ellipse cx="25" cy="40" rx="10" ry="20" fill="#ffffff" opacity="0.3" transform="rotate(-20, 25, 40)"/>
      <!-- Stem -->
      <path d="M 40 18 Q 44 2 50 -2" stroke="#5c2605" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Green Leaf -->
      <ellipse cx="52" cy="5" rx="10" ry="6" fill="#22c55e" transform="rotate(-30, 52, 5)"/>
    </g>

    <!-- Thin Slice of Apple (Dünne Scheibe Apfel) -->
    <g transform="translate(235, 75)">
      <!-- Slice Shadow -->
      <ellipse cx="25" cy="38" rx="28" ry="8" fill="#581c87" opacity="0.25"/>
      <!-- Crescent Slice -->
      <path d="M 0 30 Q 25 0 50 30 Q 25 15 0 30 Z" fill="#fef08a" stroke="#dc2626" stroke-width="3"/>
      <circle cx="25" cy="22" r="2" fill="#78350f"/>
    </g>

    <!-- Sharp Kitchen Knife (Scharfes Messer) -->
    <g transform="translate(260, 45)">
      <!-- Knife Shadow -->
      <polygon points="10,25 125,50 120,65 5,40" fill="#1e293b" opacity="0.3"/>
      <!-- Steel Blade -->
      <polygon points="0,20 120,44 116,60 0,34" fill="url(#blade)" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Shiny Blade Edge -->
      <line x1="0" y1="34" x2="116" y2="60" stroke="#ffffff" stroke-width="2"/>
      <!-- Knife Handle -->
      <rect x="-45" y="10" width="45" height="18" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="-35" cy="19" r="2.5" fill="#f8fafc"/>
      <circle cx="-15" cy="19" r="2.5" fill="#f8fafc"/>
      <!-- Steel Bolster -->
      <rect x="0" y="10" width="6" height="24" rx="2" fill="#94a3b8"/>
    </g>
  </g>
</svg>
`;

export const SCENE_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="hallWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf2f8"/>
      <stop offset="100%" stop-color="#fce7f3"/>
    </linearGradient>
    <linearGradient id="hallFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="door" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
  </defs>

  <!-- Hallway Wall & Wood Floor -->
  <rect width="600" height="340" fill="url(#hallWall)"/>
  <rect y="340" width="600" height="110" fill="url(#hallFloor)"/>
  <rect y="335" width="600" height="8" fill="#78350f"/>

  <!-- Front Door Frame (in background) -->
  <rect x="50" y="40" width="140" height="300" rx="8" fill="url(#door)" stroke="#b45309" stroke-width="6"/>
  <rect x="65" y="60" width="110" height="110" rx="4" fill="#92400e"/>
  <rect x="65" y="190" width="110" height="130" rx="4" fill="#92400e"/>
  <circle cx="160" cy="180" r="7" fill="#fbbf24"/>

  <!-- Coat Rack with Boy's Backpack -->
  <g transform="translate(500, 80)">
    <rect x="25" y="0" width="8" height="260" fill="#78350f" rx="3"/>
    <line x1="10" y1="30" x2="48" y2="20" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>
    <!-- Blue Backpack Hanging -->
    <rect x="0" y="35" width="46" height="60" rx="10" fill="#3b82f6"/>
    <rect x="8" y="55" width="30" height="30" rx="6" fill="#1d4ed8"/>
    <circle cx="23" cy="70" r="3" fill="#fbbf24"/>
  </g>

  <!-- Floating Warm Hearts (Love & Affection) -->
  <g fill="#ec4899">
    <path d="M 330 90 C 330 80, 315 75, 310 85 C 305 75, 290 80, 290 90 C 290 105, 310 115, 310 120 C 310 115, 330 105, 330 90 Z" opacity="0.8"/>
    <path d="M 270 120 C 270 112, 258 108, 254 116 C 250 108, 238 112, 238 120 C 238 132, 254 140, 254 144 C 254 140, 270 132, 270 120 Z" opacity="0.6"/>
    <path d="M 360 130 C 360 124, 350 120, 347 126 C 344 120, 334 124, 334 130 C 334 140, 347 146, 347 150 C 347 146, 360 140, 360 130 Z" opacity="0.65"/>
  </g>

  <!-- MOTHER (Bending down warmly) -->
  <g transform="translate(320, 120)">
    <!-- Mother's Body / Purple Dress -->
    <path d="M 30 110 C 20 80, 50 60, 65 60 C 80 60, 110 80, 100 110 L 120 220 L 10 220 Z" fill="#9333ea"/>
    <!-- Mother's Head (Tilted kindly towards boy) -->
    <circle cx="50" cy="30" r="28" fill="#fcd34d"/>
    <!-- Long Brown Hair -->
    <path d="M 26 25 C 26 -5, 80 -5, 80 25 C 85 50, 75 70, 75 90 C 65 85, 60 70, 60 55 C 40 45, 30 40, 26 25 Z" fill="#581c87"/>
    <!-- Smiling Happy Eyes -->
    <path d="M 36 28 Q 42 24 48 28" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Kind Smile -->
    <path d="M 36 42 Q 44 48 52 42" stroke="#dc2626" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Rosy Cheek -->
    <circle cx="38" cy="36" r="5" fill="#f472b6" opacity="0.7"/>

    <!-- Mother's Gentle Arms hugging boy -->
    <path d="M 40 75 Q 0 85, -20 100" stroke="#fcd34d" stroke-width="14" stroke-linecap="round" fill="none"/>
  </g>

  <!-- THE BOY (Standing on tiptoes, kissing mother on cheek) -->
  <g transform="translate(230, 170)">
    <!-- Legs in Denim Pants -->
    <rect x="25" y="110" width="16" height="65" rx="6" fill="#1e40af"/>
    <rect x="45" y="110" width="16" height="65" rx="6" fill="#1e40af"/>
    <!-- Red Sneakers -->
    <rect x="18" y="165" width="26" height="12" rx="4" fill="#ef4444"/>
    <rect x="42" y="165" width="26" height="12" rx="4" fill="#ef4444"/>

    <!-- Striped Green T-Shirt -->
    <rect x="20" y="45" width="48" height="68" rx="10" fill="#22c55e"/>
    <line x1="20" y1="60" x2="68" y2="60" stroke="#ffffff" stroke-width="4"/>
    <line x1="20" y1="78" x2="68" y2="78" stroke="#ffffff" stroke-width="4"/>
    <line x1="20" y1="96" x2="68" y2="96" stroke="#ffffff" stroke-width="4"/>

    <!-- Boy's Head -->
    <circle cx="50" cy="18" r="24" fill="#fcd34d"/>
    <!-- Brown Hair -->
    <path d="M 28 15 C 28 -5, 72 -5, 72 15 C 65 5, 40 5, 28 15 Z" fill="#78350f"/>
    <!-- Closed Happy Kissing Eyes -->
    <path d="M 52 14 Q 58 10 64 14" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Puckered Kissing Mouth toward Mother -->
    <ellipse cx="72" cy="24" rx="4" ry="3" fill="#dc2626"/>
    <!-- Rosy Cheek -->
    <circle cx="56" cy="24" r="5" fill="#f87171" opacity="0.7"/>

    <!-- Boy's Arms hugging mother -->
    <path d="M 50 55 Q 75 50 95 65" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`;

export const SCENE_5_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0fdf4"/>
    </linearGradient>
    <linearGradient id="stoneWall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <linearGradient id="path" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="260" fill="url(#sky5)"/>
  <!-- Sun & Clouds -->
  <circle cx="80" cy="60" r="32" fill="#fbbf24"/>
  <ellipse cx="450" cy="50" rx="40" ry="16" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="480" cy="44" rx="30" ry="18" fill="#ffffff" opacity="0.9"/>

  <!-- Rolling Green Hills -->
  <path d="M 0 240 Q 200 160 400 210 Q 520 180 600 220 L 600 450 L 0 450 Z" fill="#22c55e"/>
  <path d="M 0 280 Q 250 220 600 270 L 600 450 L 0 450 Z" fill="#16a34a"/>

  <!-- THE GRAND HISTORIC CASTLE (Das alte Schloss) -->
  <g transform="translate(260, 70)">
    <!-- Central Fortress Wall -->
    <rect x="60" y="90" width="140" height="90" fill="url(#stoneWall)" stroke="#475569" stroke-width="2"/>
    <!-- Battlements / Merlons -->
    <rect x="60" y="75" width="20" height="15" fill="#94a3b8"/>
    <rect x="90" y="75" width="20" height="15" fill="#94a3b8"/>
    <rect x="120" y="75" width="20" height="15" fill="#94a3b8"/>
    <rect x="150" y="75" width="20" height="15" fill="#94a3b8"/>
    <rect x="180" y="75" width="20" height="15" fill="#94a3b8"/>

    <!-- Main Arched Wooden Gate -->
    <path d="M 110 180 L 110 135 A 20 20 0 0 1 150 135 L 150 180 Z" fill="#78350f" stroke="#451a03" stroke-width="3"/>
    <line x1="130" y1="130" x2="130" y2="180" stroke="#451a03" stroke-width="2"/>

    <!-- Left Round Tower -->
    <rect x="25" y="45" width="45" height="135" rx="4" fill="url(#stoneWall)" stroke="#475569" stroke-width="2"/>
    <!-- Left Conical Red Roof -->
    <polygon points="47,-5 15,48 80,48" fill="url(#roof)"/>
    <!-- Left Flag Flapping in Wind -->
    <line x1="47" y1="-5" x2="47" y2="-25" stroke="#334155" stroke-width="2.5"/>
    <polygon points="47,-25 75,-16 47,-8" fill="#3b82f6"/>
    <!-- Tower Windows -->
    <rect x="42" y="70" width="12" height="18" rx="6" fill="#1e293b"/>
    <rect x="42" y="110" width="12" height="18" rx="6" fill="#1e293b"/>

    <!-- Right Round Tower -->
    <rect x="190" y="45" width="45" height="135" rx="4" fill="url(#stoneWall)" stroke="#475569" stroke-width="2"/>
    <!-- Right Conical Red Roof -->
    <polygon points="212,-5 180,48 245,48" fill="url(#roof)"/>
    <!-- Right Flag Flapping in Wind -->
    <line x1="212" y1="-5" x2="212" y2="-25" stroke="#334155" stroke-width="2.5"/>
    <polygon points="212,-25 240,-16 212,-8" fill="#eab308"/>
    <!-- Tower Windows -->
    <rect x="207" y="70" width="12" height="18" rx="6" fill="#1e293b"/>
    <rect x="207" y="110" width="12" height="18" rx="6" fill="#1e293b"/>

    <!-- Tall Central Spire Tower -->
    <rect x="110" y="20" width="40" height="70" fill="url(#stoneWall)"/>
    <polygon points="130,-25 105,20 155,20" fill="url(#roof)"/>
    <line x1="130" y1="-25" x2="130" y2="-45" stroke="#334155" stroke-width="2.5"/>
    <polygon points="130,-45 160,-35 130,-25" fill="#ef4444"/>
    <rect x="124" y="38" width="12" height="20" rx="6" fill="#1e293b"/>
  </g>

  <!-- Winding Path Leading to Castle (Pfad zum Schloss) -->
  <path d="M 0 450 Q 150 420 220 360 Q 280 300 370 250 L 410 250 Q 320 320 270 380 Q 200 450 60 450 Z" fill="url(#path)"/>

  <!-- The Boy Walking on the Path with Backpack -->
  <g transform="translate(140, 310)">
    <!-- Blue Backpack -->
    <rect x="-8" y="20" width="16" height="30" rx="6" fill="#0284c7"/>

    <!-- Boy's Body -->
    <rect x="4" y="15" width="26" height="42" rx="8" fill="#ea580c"/>
    <!-- Denim Pants & Shoes Walking -->
    <rect x="6" y="55" width="10" height="35" rx="4" fill="#1e3a8a"/>
    <rect x="18" y="55" width="10" height="35" rx="4" fill="#1e3a8a"/>
    <rect x="4" y="85" width="16" height="8" rx="3" fill="#334155"/>
    <rect x="20" y="85" width="16" height="8" rx="3" fill="#334155"/>

    <!-- Head & Cap -->
    <circle cx="18" cy="2" r="14" fill="#fcd34d"/>
    <!-- Red Baseball Cap -->
    <path d="M 6 -2 C 6 -14, 30 -14, 30 -2 Z" fill="#ef4444"/>
    <polygon points="26,-4 42,-4 38,0 26,0" fill="#ef4444"/>
    <!-- Arm Pointing Towards Castle -->
    <path d="M 22 25 L 48 12" stroke="#ea580c" stroke-width="8" stroke-linecap="round"/>
    <circle cx="50" cy="11" r="4.5" fill="#fcd34d"/>
  </g>
</svg>
`;

export const SCENE_6_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="track" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="180" fill="url(#sky6)"/>
  <circle cx="520" cy="50" r="36" fill="#fbbf24"/>

  <!-- Stadium Field / Green Grass -->
  <rect y="160" width="600" height="60" fill="#16a34a"/>
  <!-- Colorful Pennant Bunting (Wimpelkette) -->
  <g stroke="#94a3b8" stroke-width="2">
    <path d="M 0 50 Q 150 90 300 60 Q 450 90 600 50" fill="none"/>
    <polygon points="40,65 60,65 50,85" fill="#ef4444"/>
    <polygon points="90,72 110,72 100,92" fill="#3b82f6"/>
    <polygon points="140,78 160,78 150,98" fill="#eab308"/>
    <polygon points="190,75 210,75 200,95" fill="#10b981"/>
    <polygon points="240,68 260,68 250,88" fill="#8b5cf6"/>
    <polygon points="290,62 310,62 300,82" fill="#ef4444"/>
    <polygon points="350,68 370,68 360,88" fill="#3b82f6"/>
    <polygon points="410,76 430,76 420,96" fill="#eab308"/>
    <polygon points="470,72 490,72 480,92" fill="#10b981"/>
  </g>

  <!-- Running Track (Laufbahn) -->
  <rect y="210" width="600" height="240" fill="url(#track)"/>

  <!-- White Running Track Lane Lines -->
  <line x1="0" y1="280" x2="600" y2="280" stroke="#ffffff" stroke-width="5" stroke-dasharray="25 15" opacity="0.8"/>
  <line x1="0" y1="360" x2="600" y2="360" stroke="#ffffff" stroke-width="5" stroke-dasharray="25 15" opacity="0.8"/>

  <!-- THE PROMINENT WHITE START LINE (Startlinie) -->
  <g transform="translate(180, 210)">
    <rect x="0" y="0" width="22" height="240" fill="#ffffff" filter="drop-shadow(2px 0px 3px rgba(0,0,0,0.2))"/>
    <text x="-60" y="50" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" transform="rotate(-90, -60, 50)" letter-spacing="4">
      START
    </text>
  </g>

  <!-- Checked Race Flag (Zielflagge / Startflagge) in background -->
  <g transform="translate(480, 150)">
    <line x1="0" y1="0" x2="0" y2="100" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
    <rect x="0" y="0" width="50" height="36" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    <rect x="0" y="0" width="25" height="18" fill="#000000"/>
    <rect x="25" y="18" width="25" height="18" fill="#000000"/>
  </g>

  <!-- BOY AT START LINE WITH START NUMBER 123 (Startposition) -->
  <g transform="translate(220, 250)">
    <!-- Shadow under runner -->
    <ellipse cx="60" cy="145" rx="75" ry="18" fill="#7c2d12" opacity="0.4"/>

    <!-- Starting Blocks (Startblöcke) -->
    <polygon points="-25,130 -10,110 -5,130" fill="#475569"/>
    <polygon points="-5,140 10,120 15,140" fill="#475569"/>

    <!-- Left Leg (Knee bent forward) -->
    <path d="M 30 75 L 75 95 L 70 140" stroke="#1d4ed8" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Right Leg (Back stretched on block) -->
    <path d="M 20 75 L -10 100 L -18 135" stroke="#1e40af" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

    <!-- Running Shoes (Sneakers) -->
    <rect x="60" y="132" width="30" height="14" rx="5" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
    <rect x="-30" y="128" width="24" height="14" rx="5" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>

    <!-- Torso Crouched in Ready Position (Athletic Red/White Shirt) -->
    <path d="M 15 35 L 60 45 L 45 85 L 10 75 Z" fill="#ef4444"/>

    <!-- PROMINENT BIB NUMBER "123" ON ATHLETIC SHIRT -->
    <g transform="translate(20, 42)">
      <rect width="36" height="26" rx="4" fill="#ffffff" stroke="#1e293b" stroke-width="1.5"/>
      <text x="18" y="19" font-family="sans-serif" font-weight="900" font-size="16" fill="#1e293b" text-anchor="middle">
        123
      </text>
    </g>

    <!-- Arms in Ready Sprinter Position -->
    <!-- Left Arm Forward -->
    <path d="M 50 42 L 80 65 L 85 100" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="85" cy="102" r="6" fill="#fcd34d"/>
    <!-- Right Arm Back -->
    <path d="M 25 40 L 0 55 L -15 80" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="-15" cy="82" r="6" fill="#fcd34d"/>

    <!-- Focused Determined Head Looking Forward -->
    <circle cx="68" cy="22" r="20" fill="#fcd34d"/>
    <!-- Athletic Sweatband (Stirnband) -->
    <rect x="52" y="10" width="32" height="8" rx="3" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>
    <!-- Hair -->
    <path d="M 48 16 C 48 0, 84 0, 84 16 Z" fill="#78350f"/>
    <!-- Focused Eyes looking at the track ahead -->
    <ellipse cx="76" cy="24" rx="3" ry="2" fill="#1e293b"/>
    <!-- Confident Determined Smile -->
    <path d="M 72 32 Q 78 36 84 32" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
</svg>
`;

export const SCENE_7_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="puzzleBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="tableTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="bluePiece" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="redPiece" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <filter id="pieceShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="6" dy="10" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background Wall -->
  <rect width="600" height="150" fill="url(#puzzleBg)"/>
  <!-- Table Surface -->
  <rect y="150" width="600" height="300" fill="url(#tableTop)"/>
  <!-- Wood Grains on Table -->
  <path d="M 0 200 Q 250 215 600 195 M 0 270 Q 300 290 600 265 M 0 350 Q 280 370 600 345" stroke="#b45309" stroke-width="2" fill="none" opacity="0.25"/>

  <!-- Magic Sparkles Showing Perfect Fit (Die Teile passen perfekt) -->
  <g fill="#facc15" stroke="#ca8a04" stroke-width="1">
    <!-- Star 1 -->
    <path d="M 300 160 L 305 175 L 320 180 L 305 185 L 300 200 L 295 185 L 280 180 L 295 175 Z"/>
    <!-- Star 2 -->
    <path d="M 310 330 L 314 340 L 325 344 L 314 348 L 310 358 L 306 348 L 295 344 L 306 340 Z"/>
    <!-- Star 3 -->
    <path d="M 440 210 L 443 218 L 452 221 L 443 224 L 440 232 L 437 224 L 428 221 L 437 218 Z"/>
    <!-- Star 4 -->
    <path d="M 160 220 L 163 228 L 172 231 L 163 234 L 160 242 L 157 234 L 148 231 L 157 228 Z"/>
  </g>

  <!-- TWO INTERLOCKING JIGSAW PUZZLE PIECES (Zwei Teile passen zusammen) -->
  <!-- Left Blue Piece with Tab -->
  <g filter="url(#pieceShadow)">
    <path d="
      M 160 170
      L 290 170
      C 290 195, 275 205, 275 220
      C 275 245, 345 245, 345 220
      C 345 205, 330 195, 330 170
      L 330 170
      L 330 330
      C 305 330, 295 345, 280 345
      C 255 345, 255 275, 280 275
      C 295 275, 305 290, 330 290
      L 160 330
      L 160 170
      Z
    " fill="url(#bluePiece)" stroke="#1e40af" stroke-width="4"/>
    <!-- Embossed Highlight on Blue Piece -->
    <rect x="175" y="185" width="80" height="120" rx="12" fill="#ffffff" opacity="0.15"/>
    <text x="215" y="260" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" opacity="0.9">
      🧩
    </text>
  </g>

  <!-- Right Red Piece with Matching Socket -->
  <g filter="url(#pieceShadow)">
    <path d="
      M 330 170
      L 460 170
      L 460 330
      L 330 330
      L 330 260
      C 305 260, 295 245, 280 245
      C 255 245, 255 195, 280 195
      C 295 195, 305 210, 330 210
      L 330 170
      Z
    " fill="url(#redPiece)" stroke="#991b1b" stroke-width="4"/>
    <!-- Embossed Highlight on Red Piece -->
    <rect x="360" y="185" width="80" height="120" rx="12" fill="#ffffff" opacity="0.15"/>
    <text x="400" y="260" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" opacity="0.9">
      🧩
    </text>
  </g>

  <!-- Caption Tag: "passen perfekt" -->
  <g transform="translate(230, 380)">
    <rect width="140" height="38" rx="19" fill="#1e293b" opacity="0.8"/>
    <text x="70" y="24" font-family="sans-serif" font-weight="800" font-size="16" fill="#facc15" text-anchor="middle">
      Passen! ✨
    </text>
  </g>
</svg>
`;

export const SCENE_8_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="roomWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="roomFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="50%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="yellowJacket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
  </defs>

  <!-- Wall & Floor -->
  <rect width="600" height="330" fill="url(#roomWall)"/>
  <rect y="330" width="600" height="120" fill="url(#roomFloor)"/>
  <rect y="325" width="600" height="8" fill="#78350f"/>

  <!-- Oval Floor Rug -->
  <ellipse cx="280" cy="380" rx="180" ry="35" fill="#3b82f6" opacity="0.3"/>

  <!-- FULL-LENGTH STANDING MIRROR (Vor dem Spiegel) -->
  <g transform="translate(60, 50)">
    <!-- Mirror Shadow -->
    <rect x="10" y="10" width="150" height="310" rx="20" fill="#1e293b" opacity="0.15"/>
    <!-- Mirror Frame -->
    <rect width="150" height="310" rx="20" fill="#78350f" stroke="#b45309" stroke-width="6"/>
    <!-- Mirror Glass Surface -->
    <rect x="12" y="12" width="126" height="286" rx="12" fill="url(#mirrorGlass)"/>
    <!-- Glass Glare Lines -->
    <polygon points="20,12 50,12 18,290 12,290" fill="#ffffff" opacity="0.4"/>
    <polygon points="65,12 80,12 35,290 20,290" fill="#ffffff" opacity="0.25"/>

    <!-- Reflection of Boy in Mirror (Subtle Outline) -->
    <g transform="translate(75, 160)" opacity="0.65">
      <circle cx="0" cy="-60" r="18" fill="#fcd34d"/>
      <rect x="-22" y="-35" width="44" height="65" rx="10" fill="#facc15"/>
      <rect x="-18" y="30" width="14" height="50" rx="4" fill="#1e3a8a"/>
      <rect x="4" y="30" width="14" height="50" rx="4" fill="#1e3a8a"/>
    </g>
  </g>

  <!-- THE BOY IN HIS NEW YELLOW JACKET (Die neue Jacke) -->
  <g transform="translate(350, 110)">
    <!-- Boy's Shadow -->
    <ellipse cx="0" cy="275" rx="55" ry="14" fill="#78350f" opacity="0.35"/>

    <!-- Jeans Pants -->
    <rect x="-24" y="170" width="20" height="95" rx="6" fill="#1e40af"/>
    <rect x="4" y="170" width="20" height="95" rx="6" fill="#1e40af"/>
    <!-- Clean Blue Sneakers -->
    <rect x="-32" y="255" width="30" height="15" rx="5" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
    <rect x="2" y="255" width="30" height="15" rx="5" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>

    <!-- BRIGHT YELLOW JACKET BODY (Die gelbe Jacke) -->
    <path d="M -35 60 C -35 50, 35 50, 35 60 L 40 175 L -40 175 Z" fill="url(#yellowJacket)" stroke="#ca8a04" stroke-width="3"/>
    <!-- High Stylish Collar -->
    <path d="M -30 60 Q 0 45 30 60 Q 0 70 -30 60 Z" fill="#eab308"/>
    <!-- Center Silver Zipper (Reißverschluss) -->
    <line x1="0" y1="60" x2="0" y2="175" stroke="#64748b" stroke-width="4"/>
    <rect x="-4" y="80" width="8" height="14" rx="2" fill="#94a3b8"/>
    <!-- Jacket Side Pockets -->
    <line x1="-30" y1="130" x2="-10" y2="140" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>
    <line x1="30" y1="130" x2="10" y2="140" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>

    <!-- Left Arm Zipping / Adjusting Jacket -->
    <path d="M -35 65 Q -55 100 -12 85" stroke="url(#yellowJacket)" stroke-width="18" stroke-linecap="round" fill="none"/>
    <circle cx="-8" cy="85" r="7" fill="#fcd34d"/>

    <!-- Right Arm: Confident Thumbs Up! (Die Jacke passt perfekt!) -->
    <path d="M 35 65 Q 65 95 60 75" stroke="url(#yellowJacket)" stroke-width="18" stroke-linecap="round" fill="none"/>
    <!-- Hand with Thumbs Up -->
    <g transform="translate(62, 70)">
      <circle cx="0" cy="0" r="8" fill="#fcd34d"/>
      <path d="M 0 0 L 0 -12" stroke="#fcd34d" stroke-width="6" stroke-linecap="round"/>
    </g>

    <!-- Boy's Smiling Face -->
    <circle cx="0" cy="20" r="28" fill="#fcd34d"/>
    <!-- Hair -->
    <path d="M -26 15 C -26 -12, 26 -12, 26 15 C 15 2, -10 2, -26 15 Z" fill="#78350f"/>
    <!-- Cheerful Eyes -->
    <circle cx="-10" cy="18" r="3.5" fill="#1e293b"/>
    <circle cx="10" cy="18" r="3.5" fill="#1e293b"/>
    <!-- Happy Proud Smile -->
    <path d="M -12 28 Q 0 40 12 28" stroke="#dc2626" stroke-width="3" fill="#fca5a5" stroke-linecap="round"/>
    <!-- Rosy Cheeks -->
    <circle cx="-16" cy="25" r="5" fill="#f87171" opacity="0.6"/>
    <circle cx="16" cy="25" r="5" fill="#f87171" opacity="0.6"/>
  </g>
</svg>
`;

export const SCENE_9_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="sky9" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="street" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="dogFur" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a16207"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
  </defs>

  <!-- Sky & Ground -->
  <rect width="600" height="220" fill="url(#sky9)"/>
  <rect y="220" width="600" height="230" fill="url(#street)"/>
  <!-- Sidewalk Curb (Bürgersteig) -->
  <rect y="215" width="600" height="12" fill="#cbd5e1"/>

  <!-- Green Garden Hedge in Background -->
  <rect x="0" y="100" width="280" height="120" rx="10" fill="#15803d"/>
  <circle cx="40" cy="110" r="30" fill="#16a34a"/>
  <circle cx="100" cy="105" r="35" fill="#16a34a"/>
  <circle cx="170" cy="110" r="32" fill="#16a34a"/>
  <circle cx="230" cy="105" r="30" fill="#16a34a"/>

  <!-- Wooden Garden Fence (Gartenzaun) -->
  <g stroke="#78350f" stroke-width="2">
    <!-- Horizontal Crossbars -->
    <rect x="0" y="145" width="270" height="12" fill="#b45309"/>
    <rect x="0" y="190" width="270" height="12" fill="#b45309"/>
    <!-- Vertical Pointed Slats (Zaunlatten) -->
    <path d="M 20 220 L 20 130 L 28 115 L 36 130 L 36 220 Z" fill="#d97706"/>
    <path d="M 60 220 L 60 130 L 68 115 L 76 130 L 76 220 Z" fill="#d97706"/>
    <path d="M 100 220 L 100 130 L 108 115 L 116 130 L 116 220 Z" fill="#d97706"/>
    <path d="M 140 220 L 140 130 L 148 115 L 156 130 L 156 220 Z" fill="#d97706"/>
    <path d="M 180 220 L 180 130 L 188 115 L 196 130 L 196 220 Z" fill="#d97706"/>
    <path d="M 220 220 L 220 130 L 228 115 L 236 130 L 236 220 Z" fill="#d97706"/>
  </g>

  <!-- BARKING DOG AT THE FENCE (Der bissige Hund bellt wütend) -->
  <g transform="translate(130, 160)">
    <!-- Dog Body -->
    <ellipse cx="40" cy="65" rx="45" ry="30" fill="url(#dogFur)"/>
    <!-- Tail Wagging Up / Alert -->
    <path d="M -5 55 Q -25 35 -15 20" stroke="#713f12" stroke-width="12" stroke-linecap="round" fill="none"/>
    <!-- Paws on Ground -->
    <rect x="15" y="80" width="14" height="40" rx="6" fill="#713f12"/>
    <rect x="55" y="80" width="14" height="40" rx="6" fill="#713f12"/>

    <!-- Dog Head Barks -->
    <circle cx="75" cy="35" r="26" fill="url(#dogFur)"/>
    <!-- Floppy Brown Ears -->
    <path d="M 65 15 C 50 15, 45 40, 50 50" stroke="#451a03" stroke-width="10" stroke-linecap="round" fill="none"/>
    <!-- Snout Opening with Bark (Offene Schnauze) -->
    <path d="M 85 28 L 120 22 L 110 48 L 85 45 Z" fill="#713f12"/>
    <!-- Sharp Teeth (Bissig) -->
    <polygon points="95,30 100,38 105,30" fill="#ffffff"/>
    <polygon points="95,45 100,38 105,45" fill="#ffffff"/>
    <!-- Red Tongue -->
    <ellipse cx="102" cy="40" rx="7" ry="4" fill="#ef4444"/>
    <circle cx="118" cy="24" r="5" fill="#1e293b"/>
    <!-- Fierce Alert Eye -->
    <circle cx="82" cy="25" r="4" fill="#ffffff"/>
    <circle cx="84" cy="25" r="2" fill="#000000"/>

    <!-- Barking Comic Sound Waves "WUFF! WUFF!" -->
    <g transform="translate(130, 5)">
      <path d="M 0 10 Q 15 20 0 30" stroke="#f59e0b" stroke-width="3" fill="none"/>
      <path d="M 12 5 Q 32 20 12 35" stroke="#ea580c" stroke-width="3" fill="none"/>
      <rect x="15" y="-15" width="70" height="24" rx="6" fill="#ef4444"/>
      <text x="50" y="2" font-family="sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle">
        WUFF!
      </text>
    </g>
  </g>

  <!-- BOY SPRINTING AWAY FAST (Der Junge rennt schnell weg) -->
  <g transform="translate(420, 210)">
    <!-- Speed Motion Lines behind boy -->
    <g stroke="#ffffff" stroke-width="3" opacity="0.8" stroke-linecap="round">
      <line x1="-70" y1="60" x2="-20" y2="60"/>
      <line x1="-85" y1="80" x2="-35" y2="80"/>
      <line x1="-60" y1="100" x2="-15" y2="100"/>
    </g>

    <!-- Shadow -->
    <ellipse cx="20" cy="180" rx="45" ry="12" fill="#334155" opacity="0.4"/>

    <!-- Legs in High Running Motion -->
    <!-- Front Leg (Stretching forward) -->
    <path d="M 15 105 L 55 125 L 75 160" stroke="#1d4ed8" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="68" y="155" width="26" height="12" rx="4" fill="#ef4444"/>
    <!-- Back Leg (Kicking back high) -->
    <path d="M 5 105 L -35 125 L -55 100" stroke="#1e40af" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="-68" y="92" width="24" height="12" rx="4" fill="#ef4444"/>

    <!-- Green Running T-Shirt Leaning Forward -->
    <path d="M 0 50 L 35 45 L 20 110 L -15 105 Z" fill="#22c55e"/>

    <!-- Pumping Arms (Running Form) -->
    <path d="M 25 55 L 60 70 L 45 95" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M -5 55 L -35 70 L -45 50" stroke="#fcd34d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

    <!-- Head Looking Back Cautiously While Running -->
    <circle cx="15" cy="24" r="22" fill="#fcd34d"/>
    <!-- Hair Blowing in Wind -->
    <path d="M -6 18 C -6 -4, 38 -4, 38 18 C 30 5, 0 5, -6 18 Z" fill="#78350f"/>
    <!-- Surprised/Alert Eye Looking Back at Dog -->
    <ellipse cx="2" cy="22" rx="4" ry="5" fill="#ffffff"/>
    <circle cx="0" cy="22" r="2.5" fill="#000000"/>
    <!-- Open Mouth Gasping / Breathing Hard -->
    <ellipse cx="14" cy="34" rx="4" ry="6" fill="#dc2626"/>
    <!-- Sweat Drop (Angst / Anstrengung) -->
    <path d="M -12 12 Q -16 6 -12 2 Q -8 6 -12 12 Z" fill="#38bdf8"/>
  </g>
</svg>
`;

export const SCENE_ILLUSTRATIONS: Record<number, string> = {
  1: encodeSvg(SCENE_1_SVG),
  2: encodeSvg(SCENE_2_SVG),
  3: encodeSvg(SCENE_3_SVG),
  4: encodeSvg(SCENE_4_SVG),
  5: encodeSvg(SCENE_5_SVG),
  6: encodeSvg(SCENE_6_SVG),
  7: encodeSvg(SCENE_7_SVG),
  8: encodeSvg(SCENE_8_SVG),
  9: encodeSvg(SCENE_9_SVG),
};

export function getSceneImage(sceneId: number): string {
  return SCENE_ILLUSTRATIONS[sceneId] || SCENE_ILLUSTRATIONS[1];
}
