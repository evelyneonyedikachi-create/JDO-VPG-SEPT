import { encodeSvg } from './encodeSvg';

export const SCENE_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s4_wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="100%" stop-color="#fae8ff"/>
    </linearGradient>
    <linearGradient id="s4_door" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="s4_mom_sweater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
    <linearGradient id="s4_boy_shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="s4_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <filter id="s4_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#581c87" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Warm Hallway Background Wall -->
  <rect width="600" height="360" fill="url(#s4_wall)"/>
  <rect y="350" width="600" height="100" fill="#a16207"/>
  <rect y="342" width="600" height="12" fill="#78350f"/>

  <!-- Hallway Door on Left -->
  <g transform="translate(40, 40)" filter="url(#s4_shadow)">
    <rect width="130" height="310" rx="6" fill="url(#s4_door)" stroke="#94a3b8" stroke-width="4"/>
    <rect x="15" y="20" width="100" height="110" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="15" y="150" width="100" height="135" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Brass Doorknob -->
    <circle cx="115" cy="165" r="8" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
  </g>

  <!-- Warm Little Heart Motif in Sunlight between them -->
  <g transform="translate(305, 120)" opacity="0.85">
    <path d="M 0 -5 C -10 -25, -35 -10, 0 18 C 35 -10, 10 -25, 0 -5 Z" fill="#ec4899" filter="url(#s4_shadow)"/>
    <circle cx="-5" cy="-8" r="3" fill="#ffffff" opacity="0.8"/>
  </g>

  <!-- MOTHER: KIND, LOVING EXPRESSION & POSTURE -->
  <g transform="translate(350, 90)" filter="url(#s4_shadow)">
    <!-- Mother's Body in Cozy Lavender Knit Sweater -->
    <path d="M 10 110 Q 30 75 70 80 Q 110 75 130 110 L 140 260 L 0 260 Z" fill="url(#s4_mom_sweater)"/>
    <!-- Gentle neckline -->
    <path d="M 50 80 Q 70 95 90 80" stroke="#f3e8ff" stroke-width="5" fill="none"/>

    <!-- Mother's Left Arm Gently Resting on Boy's Shoulder -->
    <path d="M 30 95 Q -10 130 -40 160 Q -70 170 -95 180" stroke="url(#s4_mom_sweater)" stroke-width="26" stroke-linecap="round" fill="none"/>
    <!-- Mother's Hand Gently on Boy's Back -->
    <g transform="translate(-105, 185)">
      <circle cx="0" cy="0" r="14" fill="url(#s4_skin)"/>
      <path d="M -6 -8 Q 4 0 10 6" stroke="url(#s4_skin)" stroke-width="8" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Mother's Neck -->
    <rect x="58" y="55" width="24" height="30" fill="url(#s4_skin)" rx="4"/>

    <!-- MOTHER'S HEAD & GENTLE AFFECTIONATE FACE -->
    <g transform="translate(70, 25)">
      <!-- Head -->
      <ellipse cx="0" cy="0" rx="36" ry="42" fill="url(#s4_skin)"/>
      <circle cx="36" cy="4" r="8" fill="url(#s4_skin)"/>

      <!-- Mother's Soft Auburn Hair in Low Wavy Ponytail -->
      <path d="M -38 -15 C -44 -45, -10 -60, 10 -55 C 34 -50, 46 -35, 42 -5 C 38 15, 30 35, 20 45 C 35 60, 45 90, 40 110 C 30 115, 15 105, 15 90 C 15 70, 20 50, 10 40 C -10 40, -30 20, -38 -15 Z" fill="#78350f"/>
      <path d="M -35 -20 Q -5 -40 20 -35 Q 40 -30 35 -10 Q 15 -25 -15 -20 Z" fill="#9a3412"/>

      <!-- Kind Arched Eyebrow -->
      <path d="M -24 -8 Q -15 -16 -6 -9" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Gentle Closed Eye (Smiling with pure affection / bliss) -->
      <path d="M -24 -2 Q -15 -8 -6 -2" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <!-- Soft Eyelashes -->
      <line x1="-24" y1="-2" x2="-28" y2="-5" stroke="#1e293b" stroke-width="2"/>
      <line x1="-6" y1="-2" x2="-2" y2="-5" stroke="#1e293b" stroke-width="2"/>

      <!-- Gentle Nose -->
      <path d="M -3 8 Q 2 13 6 10" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Warm Blushing Cheeks -->
      <ellipse cx="-16" cy="14" rx="10" ry="6" fill="#f472b6" opacity="0.45"/>

      <!-- Tender Loving Smile -->
      <path d="M -16 22 Q 0 32 16 22" stroke="#991b1b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    </g>
  </g>

  <!-- JEDIDIAH GIVING HIS MOTHER A KISS ON THE CHEEK -->
  <g transform="translate(230, 140)" filter="url(#s4_shadow)">
    <!-- Boy's Body in Signature Green T-Shirt (Leaning In Affectionately) -->
    <path d="M 0 110 Q 25 65 65 70 Q 105 65 125 105 L 115 210 L -10 210 Z" fill="url(#s4_boy_shirt)"/>
    <!-- White inner collar -->
    <path d="M 40 70 Q 60 85 80 70" stroke="#ffffff" stroke-width="6" fill="none"/>

    <!-- Boy's Arm Hugging / Resting on Mother's Waist -->
    <path d="M 80 85 Q 120 115 150 120" stroke="url(#s4_boy_shirt)" stroke-width="24" stroke-linecap="round" fill="none"/>
    <circle cx="158" cy="122" r="12" fill="url(#s4_skin)"/>

    <!-- Boy's Neck -->
    <rect x="48" y="45" width="22" height="26" fill="url(#s4_skin)" rx="4"/>

    <!-- BOY'S HEAD & EXPRESSION (GIVING SWEET KISS ON CHEEK) -->
    <g transform="translate(60, 20)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s4_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s4_skin)"/>

      <!-- Signature Dark Brown Hair -->
      <path d="M -36 -12 C -40 -38, -12 -52, 6 -48 C 24 -46, 42 -36, 38 -10 C 34 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>

      <!-- Happy Curved Eyebrow -->
      <path d="M -8 -8 Q 2 -15 12 -8" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>

      <!-- Closed Happy Eye (Smiling kiss expression) -->
      <path d="M -8 -2 Q 2 -8 12 -2" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <line x1="12" y1="-2" x2="16" y2="-5" stroke="#1e293b" stroke-width="2"/>

      <!-- Cute Nose -->
      <path d="M 12 7 Q 16 11 20 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Sweet Rosy Cheek -->
      <ellipse cx="-4" cy="12" rx="9" ry="5" fill="#f87171" opacity="0.5"/>

      <!-- Kissing Lips Pressed to Mother's Cheek -->
      <path d="M 22 16 Q 32 16 35 18 Q 32 22 22 20 Z" fill="#b91c1c"/>
    </g>
  </g>
</svg>
`;

export const SCENE_4_IMAGE = encodeSvg(SCENE_4_SVG);
