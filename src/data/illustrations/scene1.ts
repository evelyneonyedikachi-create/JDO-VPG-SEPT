import { encodeSvg } from './encodeSvg';

export const SCENE_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s1_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="60%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
    <linearGradient id="s1_floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="s1_sunbeam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#fde047" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="s1_bedwood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="s1_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s1_quilt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="s1_sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
    <filter id="s1_soft_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#78350f" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Background Wall & Baseboard -->
  <rect width="600" height="340" fill="url(#s1_wall)"/>
  <rect y="334" width="600" height="12" fill="#92400e"/>
  <!-- Hardwood Floor with planks -->
  <rect y="346" width="600" height="104" fill="url(#s1_floor)"/>
  <line x1="120" y1="346" x2="80" y2="450" stroke="#92400e" stroke-width="1.5" opacity="0.6"/>
  <line x1="280" y1="346" x2="250" y2="450" stroke="#92400e" stroke-width="1.5" opacity="0.6"/>
  <line x1="440" y1="346" x2="420" y2="450" stroke="#92400e" stroke-width="1.5" opacity="0.6"/>

  <!-- Morning Window with Sunlight -->
  <g transform="translate(40, 30)" filter="url(#s1_soft_shadow)">
    <!-- Outside Sky & Morning Warmth -->
    <rect x="10" y="10" width="140" height="180" rx="12" fill="url(#s1_sky)"/>
    <!-- Rising Sun & Cloud -->
    <circle cx="110" cy="50" r="32" fill="#fde047" opacity="0.9"/>
    <ellipse cx="60" cy="80" rx="35" ry="14" fill="#ffffff" opacity="0.85"/>
    <ellipse cx="80" cy="74" rx="22" ry="16" fill="#ffffff" opacity="0.85"/>
    <path d="M 120 160 Q 135 150 150 160" stroke="#22c55e" stroke-width="16" fill="none" opacity="0.5"/>
    <!-- White Window Frame -->
    <rect width="160" height="200" rx="14" fill="none" stroke="#ffffff" stroke-width="12"/>
    <line x1="80" y1="6" x2="80" y2="194" stroke="#ffffff" stroke-width="6"/>
    <line x1="6" y1="100" x2="154" y2="100" stroke="#ffffff" stroke-width="6"/>
    <!-- Window Sill -->
    <rect x="-10" y="194" width="180" height="14" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Soft Curtain -->
    <path d="M 6 6 Q 30 90 10 190 Q -2 90 6 6 Z" fill="#fef08a" opacity="0.75"/>
    <path d="M 154 6 Q 130 90 150 190 Q 162 90 154 6 Z" fill="#fef08a" opacity="0.75"/>
  </g>

  <!-- Golden Sunbeam streaming across the room -->
  <polygon points="120,60 210,60 520,380 340,430" fill="url(#s1_sunbeam)"/>

  <!-- Small Nightstand with Alarm Clock -->
  <g transform="translate(170, 240)" filter="url(#s1_soft_shadow)">
    <rect width="70" height="100" rx="6" fill="#fcd34d" stroke="#d97706" stroke-width="3"/>
    <rect x="6" y="8" width="58" height="38" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
    <circle cx="35" cy="27" r="4" fill="#b45309"/>
    <!-- Clock -->
    <circle cx="35" cy="-14" r="16" fill="#ffffff" stroke="#ef4444" stroke-width="3.5"/>
    <circle cx="35" cy="-14" r="2.5" fill="#1e293b"/>
    <line x1="35" y1="-14" x2="35" y2="-23" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="35" y1="-14" x2="42" y2="-14" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    <circle cx="23" cy="-28" r="5" fill="#f87171"/>
    <circle cx="47" cy="-28" r="5" fill="#f87171"/>
  </g>

  <!-- Big Cozy Bed with Headboard -->
  <g transform="translate(230, 150)" filter="url(#s1_soft_shadow)">
    <!-- Wooden Headboard -->
    <rect x="10" y="30" width="310" height="140" rx="14" fill="url(#s1_bedwood)"/>
    <rect x="25" y="45" width="280" height="110" rx="8" fill="#b45309" opacity="0.5"/>

    <!-- Fluffy White Pillows with Shading -->
    <ellipse cx="110" cy="140" rx="55" ry="24" fill="#e2e8f0"/>
    <ellipse cx="110" cy="136" rx="52" ry="22" fill="#ffffff"/>
    <ellipse cx="220" cy="140" rx="55" ry="24" fill="#e2e8f0"/>
    <ellipse cx="220" cy="136" rx="52" ry="22" fill="#ffffff"/>

    <!-- THE BOY: JEDIDIAH (WAKING UP HAPPY & STRETCHING) -->
    <!-- Torso in Blue Striped Pajamas -->
    <g transform="translate(110, 50)">
      <!-- Left Stretching Arm (raised high & wide) -->
      <path d="M 25 70 Q -25 20 -40 -15" stroke="#93c5fd" stroke-width="24" stroke-linecap="round" fill="none"/>
      <!-- Left Hand Open in Stretch -->
      <circle cx="-42" cy="-18" r="13" fill="url(#s1_skin)"/>
      <path d="M -48 -22 Q -54 -30 -48 -34 Q -42 -30 -40 -20" fill="url(#s1_skin)"/>
      <path d="M -40 -24 Q -38 -36 -32 -34 Q -32 -26 -35 -18" fill="url(#s1_skin)"/>

      <!-- Right Stretching Arm (raised high & wide) -->
      <path d="M 95 70 Q 145 20 160 -15" stroke="#93c5fd" stroke-width="24" stroke-linecap="round" fill="none"/>
      <!-- Right Hand Open in Stretch -->
      <circle cx="162" cy="-18" r="13" fill="url(#s1_skin)"/>
      <path d="M 168 -22 Q 174 -30 168 -34 Q 162 -30 160 -20" fill="url(#s1_skin)"/>
      <path d="M 160 -24 Q 158 -36 152 -34 Q 152 -26 155 -18" fill="url(#s1_skin)"/>

      <!-- Pajama Body with Stripes -->
      <path d="M 25 65 L 95 65 L 105 135 L 15 135 Z" fill="#60a5fa"/>
      <!-- Vertical white pajama stripes -->
      <line x1="38" y1="65" x2="33" y2="135" stroke="#ffffff" stroke-width="4" opacity="0.7"/>
      <line x1="60" y1="65" x2="60" y2="135" stroke="#ffffff" stroke-width="4" opacity="0.7"/>
      <line x1="82" y1="65" x2="87" y2="135" stroke="#ffffff" stroke-width="4" opacity="0.7"/>
      <!-- Collar -->
      <path d="M 45 65 Q 60 78 75 65" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Neck -->
      <rect x="50" y="44" width="20" height="24" fill="url(#s1_skin)" rx="4"/>

      <!-- HEAD & EXPRESSIVE WAKING UP FACE -->
      <g transform="translate(60, 20)">
        <!-- Head Contour -->
        <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s1_skin)"/>
        <!-- Soft Ears -->
        <circle cx="-34" cy="2" r="9" fill="url(#s1_skin)"/>
        <circle cx="34" cy="2" r="9" fill="url(#s1_skin)"/>

        <!-- Tousled Brown Hair with Volume & Strands -->
        <path d="M -36 -12 C -42 -40, -10 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 35 -18, 20 -28, 5 -26 C -12 -25, -28 -18, -36 -12 Z" fill="#451a03"/>
        <path d="M -25 -28 Q -8 -45 10 -40 Q 28 -35 25 -22 Q 10 -30 -10 -28 Z" fill="#78350f"/>
        <!-- Forehead bangs -->
        <path d="M -28 -15 Q -15 -28 0 -18 Q 15 -30 28 -16 Q 10 -22 -5 -16 Z" fill="#451a03"/>

        <!-- Cheerful Arched Eyebrows (happy morning expression) -->
        <path d="M -22 -12 Q -14 -18 -6 -12" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M 6 -12 Q 14 -18 22 -12" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>

        <!-- Happy Crinkled Morning Eyes (expressive semi-realistic curved eyelids with lashes) -->
        <path d="M -22 -4 Q -14 -12 -6 -4" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M 6 -4 Q 14 -12 22 -4" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Soft eyelashes -->
        <line x1="-22" y1="-4" x2="-26" y2="-7" stroke="#1e293b" stroke-width="2"/>
        <line x1="22" y1="-4" x2="26" y2="-7" stroke="#1e293b" stroke-width="2"/>

        <!-- Cute Nose -->
        <path d="M -2 4 Q 0 8 4 6" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

        <!-- Rosy Cheeks -->
        <ellipse cx="-20" cy="8" rx="8" ry="5" fill="#f87171" opacity="0.45"/>
        <ellipse cx="20" cy="8" rx="8" ry="5" fill="#f87171" opacity="0.45"/>

        <!-- Big Bright Smile (Yawning / Cheerful Stretch) -->
        <path d="M -14 14 Q 0 28 14 14 Z" fill="#b91c1c"/>
        <path d="M -12 15 Q 0 20 12 15" stroke="#ffffff" stroke-width="3" fill="none"/>
        <path d="M -6 22 Q 0 26 6 22" fill="#f87171"/>
      </g>
    </g>

    <!-- Warm Blue Quilt / Blanket Folded over legs -->
    <path d="M 10 135 Q 160 115 310 135 L 310 210 Q 160 225 10 210 Z" fill="url(#s1_quilt)"/>
    <path d="M 10 135 Q 160 120 310 135 L 310 155 Q 160 140 10 155 Z" fill="#93c5fd" opacity="0.6"/>
    <!-- Quilt stitching details -->
    <path d="M 40 160 Q 160 145 280 160" stroke="#1e40af" stroke-width="2" stroke-dasharray="6,6" fill="none" opacity="0.6"/>
    <path d="M 40 185 Q 160 170 280 185" stroke="#1e40af" stroke-width="2" stroke-dasharray="6,6" fill="none" opacity="0.6"/>
  </g>
</svg>
`;

export const SCENE_1_IMAGE = encodeSvg(SCENE_1_SVG);
