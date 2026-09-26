import { encodeSvg } from './encodeSvg';

export const SCENE_9_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="s9_sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="s9_street" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="30%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="s9_fence" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="s9_dog" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a16207"/>
      <stop offset="50%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="s9_skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd3b8"/>
      <stop offset="100%" stop-color="#e8a882"/>
    </linearGradient>
    <linearGradient id="s9_shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <filter id="s9_shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Sky -->
  <rect width="600" height="240" fill="url(#s9_sky)"/>

  <!-- Green Garden Hedge Behind Fence -->
  <path d="M 0 160 Q 60 140 140 155 Q 240 135 340 150 Q 450 130 600 155 L 600 240 L 0 240 Z" fill="#166534"/>
  <path d="M 0 175 Q 80 150 180 170 Q 300 150 420 165 Q 520 150 600 168 L 600 240 L 0 240 Z" fill="#22c55e" opacity="0.8"/>

  <!-- Picket Fence along sidewalk -->
  <g transform="translate(0, 150)">
    <!-- Horizontal rails -->
    <rect y="30" width="300" height="12" fill="url(#s9_fence)"/>
    <rect y="70" width="300" height="12" fill="url(#s9_fence)"/>
    <!-- Vertical fence posts with pointed tops -->
    <polygon points="20,10 32,0 44,10 44,110 20,110" fill="url(#s9_fence)"/>
    <polygon points="60,10 72,0 84,10 84,110 60,110" fill="url(#s9_fence)"/>
    <polygon points="100,10 112,0 124,10 124,110 100,110" fill="url(#s9_fence)"/>
    <polygon points="140,10 152,0 164,10 164,110 140,110" fill="url(#s9_fence)"/>
    <polygon points="180,10 192,0 204,10 204,110 180,110" fill="url(#s9_fence)"/>
    <polygon points="220,10 232,0 244,10 244,110 220,110" fill="url(#s9_fence)"/>
    <polygon points="260,10 272,0 284,10 284,110 260,110" fill="url(#s9_fence)"/>
  </g>

  <!-- Sidewalk & Asphalt Street -->
  <rect y="240" width="600" height="40" fill="#e2e8f0"/>
  <line x1="0" y1="280" x2="600" y2="280" stroke="#94a3b8" stroke-width="4"/>
  <rect y="280" width="600" height="170" fill="url(#s9_street)"/>

  <!-- Speed Dust Clouds under sprinting feet -->
  <g fill="#f1f5f9" opacity="0.85">
    <circle cx="280" cy="380" r="14"/>
    <circle cx="260" cy="385" r="10"/>
    <circle cx="295" cy="388" r="8"/>
    <!-- Speed motion lines -->
    <line x1="240" y1="365" x2="190" y2="365" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <line x1="250" y1="345" x2="210" y2="345" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <line x1="230" y1="385" x2="170" y2="385" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
  </g>

  <!-- THE BARKING DOG (ENERGETIC, MOUTH WIDE OPEN, SHARP TEETH, ALERT EARS) -->
  <g transform="translate(60, 160)" filter="url(#s9_shadow)">
    <!-- Dog Body (Paws on ground leaning forward barking) -->
    <ellipse cx="60" cy="70" rx="45" ry="32" fill="url(#s9_dog)"/>
    <!-- Tail raised high with excitement -->
    <path d="M 15 55 Q -10 30 -5 10" stroke="#78350f" stroke-width="12" stroke-linecap="round" fill="none"/>

    <!-- Hind Legs -->
    <path d="M 30 80 L 20 120 L 35 125" stroke="#78350f" stroke-width="14" stroke-linecap="round" fill="none"/>
    <!-- Front Legs stiff in aggressive stance -->
    <path d="M 85 85 L 105 125 L 120 125" stroke="#78350f" stroke-width="14" stroke-linecap="round" fill="none"/>

    <!-- Red Collar with Gold Tag -->
    <path d="M 80 50 Q 95 65 110 50" stroke="#dc2626" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="95" cy="62" r="5" fill="#facc15"/>

    <!-- Dog Head & Snout (Loud barking open mouth) -->
    <g transform="translate(95, 20)">
      <circle cx="0" cy="0" r="26" fill="url(#s9_dog)"/>
      <!-- Pointed Alert Dog Ears -->
      <polygon points="-12,-20 -20,-48 0,-25" fill="#451a03"/>
      <polygon points="12,-20 20,-48 0,-25" fill="#451a03"/>

      <!-- Wide Alert Dark Dog Eyes -->
      <circle cx="8" cy="-5" r="5.5" fill="#ffffff"/>
      <circle cx="9" cy="-5" r="3.5" fill="#000000"/>
      <circle cx="10" cy="-6" r="1.5" fill="#ffffff"/>

      <!-- Snout & Wide Open Barking Mouth -->
      <path d="M 15 -10 L 45 -4 Q 50 15 35 25 L 10 20 Z" fill="url(#s9_dog)"/>
      <!-- Black Nose -->
      <ellipse cx="44" cy="-3" rx="5" ry="4" fill="#000000"/>

      <!-- Open Mouth with Red Tongue & White Sharp Teeth -->
      <path d="M 22 2 L 40 4 Q 38 18 20 14 Z" fill="#991b1b"/>
      <!-- Upper sharp fangs -->
      <polygon points="26,2 30,8 34,2" fill="#ffffff"/>
      <!-- Lower sharp teeth -->
      <polygon points="28,14 32,8 36,14" fill="#ffffff"/>
      <!-- Pink Tongue Panting -->
      <path d="M 30 10 Q 42 16 38 24 Q 30 20 30 10 Z" fill="#f472b6"/>
    </g>

    <!-- Barking Sound Effect Waves (Visual sound radiating towards boy) -->
    <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85">
      <path d="M 145 15 Q 160 30 145 45"/>
      <path d="M 155 8 Q 175 30 155 52"/>
      <path d="M 165 0 Q 190 30 165 60"/>
    </g>
  </g>

  <!-- JEDIDIAH SPRINTING FORWARD AT FULL SPEED, LOOKING BACK IN SURPRISE & URGENCY! -->
  <g transform="translate(360, 110)" filter="url(#s9_shadow)">
    <!-- Back Leg Kicked High Behind in Dynamic Sprint -->
    <g transform="translate(-40, 130)">
      <path d="M 30 20 L -25 35 L -60 15" stroke="#1e3a8a" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Red Sneaker flying high in air -->
      <g transform="translate(-65, 12) rotate(25)">
        <ellipse cx="0" cy="0" rx="18" ry="9" fill="#ef4444"/>
        <line x1="-12" y1="4" x2="12" y2="4" stroke="#ffffff" stroke-width="3"/>
      </g>
    </g>

    <!-- Front Leg Leaping Forward -->
    <g transform="translate(40, 140)">
      <path d="M 0 10 Q 30 40 45 85 L 55 125" stroke="#1e3a8a" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Red Sneaker hitting ground forward -->
      <g transform="translate(58, 130)">
        <ellipse cx="0" cy="0" rx="18" ry="9" fill="#ef4444"/>
        <line x1="-12" y1="4" x2="12" y2="4" stroke="#ffffff" stroke-width="3"/>
      </g>
    </g>

    <!-- Torso Leaning Forward in Urgent Sprint (Signature Green T-Shirt) -->
    <g transform="translate(15, 60)">
      <path d="M 10 10 L 75 5 L 85 85 L 15 90 Z" fill="url(#s9_shirt)"/>
      <path d="M 30 8 Q 45 20 60 8" stroke="#ffffff" stroke-width="5" fill="none"/>
    </g>

    <!-- Pumping Running Arms (High speed gesture) -->
    <!-- Right Arm reaching forward -->
    <g transform="translate(70, 75)">
      <path d="M 0 10 Q 30 0 55 -15" stroke="url(#s9_shirt)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <path d="M 45 -10 Q 75 -25 85 -10" stroke="url(#s9_skin)" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="88" cy="-8" r="11" fill="url(#s9_skin)"/>
    </g>
    <!-- Left Arm pumping back -->
    <g transform="translate(15, 75)">
      <path d="M 0 10 Q -25 35 -50 30" stroke="url(#s9_shirt)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <path d="M -45 30 Q -65 25 -70 45" stroke="url(#s9_skin)" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="-70" cy="48" r="11" fill="url(#s9_skin)"/>
    </g>

    <!-- Neck -->
    <rect x="42" y="45" width="20" height="24" fill="url(#s9_skin)" rx="4"/>

    <!-- HEAD & EXPRESSION: SURPRISED, ALARMED, LOOKING BACK OVER SHOULDER! -->
    <g transform="translate(48, 15)">
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="url(#s9_skin)"/>
      <circle cx="-34" cy="2" r="8.5" fill="url(#s9_skin)"/>
      <circle cx="34" cy="2" r="8.5" fill="url(#s9_skin)"/>

      <!-- Signature Dark Brown Hair Flying in the Wind -->
      <path d="M -36 -12 C -45 -30, -30 -52, -10 -50 C 15 -48, 45 -36, 42 -10 C 38 -18, 20 -24, 6 -24 C -12 -24, -28 -18, -36 -12 Z" fill="#451a03"/>
      <path d="M -20 -25 Q -5 -40 12 -38 Q 28 -35 24 -20 Q 8 -28 -8 -26 Z" fill="#78350f"/>
      <path d="M 20 -20 Q 40 -35 48 -15 Q 35 -15 25 -10 Z" fill="#451a03"/>

      <!-- Alarmed Eyebrows Raised In Surprise / Urgency -->
      <path d="M -22 -12 Q -14 -18 -6 -14" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 6 -14 Q 14 -18 22 -12" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>

      <!-- Wide Open Eyes Looking BACK Towards the Barking Dog! -->
      <g transform="translate(-14, -2)">
        <ellipse cx="0" cy="0" rx="8" ry="7.5" fill="#ffffff"/>
        <!-- Pupils looking far left back at the dog -->
        <circle cx="-3" cy="0" r="5" fill="#451a03"/>
        <circle cx="-3" cy="0" r="2.8" fill="#0f172a"/>
        <circle cx="-1.5" cy="-1.5" r="1.8" fill="#ffffff"/>
      </g>
      <g transform="translate(14, -2)">
        <ellipse cx="0" cy="0" rx="8" ry="7.5" fill="#ffffff"/>
        <circle cx="-3" cy="0" r="5" fill="#451a03"/>
        <circle cx="-3" cy="0" r="2.8" fill="#0f172a"/>
        <circle cx="-1.5" cy="-1.5" r="1.8" fill="#ffffff"/>
      </g>

      <!-- Sweat Drop on Brow (Exertion & Surprise!) -->
      <path d="M 24 -16 Q 26 -24 24 -26 Q 20 -24 22 -16 Z" fill="#38bdf8"/>

      <!-- Nose -->
      <path d="M -2 7 Q 0 11 4 9" stroke="#c27848" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Flushed Cheeks from Sprinting -->
      <ellipse cx="-20" cy="12" rx="8" ry="5" fill="#f87171" opacity="0.5"/>
      <ellipse cx="20" cy="12" rx="8" ry="5" fill="#f87171" opacity="0.5"/>

      <!-- Open Gasping Mouth (Running Fast, Breathing Hard!) -->
      <ellipse cx="0" cy="20" rx="9" ry="11" fill="#991b1b"/>
      <path d="M -6 16 Q 0 19 6 16" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <ellipse cx="0" cy="24" rx="5" ry="3.5" fill="#f87171"/>
    </g>
  </g>
</svg>
`;

export const SCENE_9_IMAGE = encodeSvg(SCENE_9_SVG);
