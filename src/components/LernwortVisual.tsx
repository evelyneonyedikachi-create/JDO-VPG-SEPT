import React from 'react';
import type { LernwortItem } from '../types/lernwoerter';

type VisualSpec = {
  icons: string[];
  sky?: string;
  ground?: string;
};

const VISUALS: Record<string, VisualSpec> = {
  w1_zimmer: { icons: ['🛏️', '🪟', '🧸'], sky: '#eef6ff', ground: '#f4dfc2' },
  w1_schwimmen: { icons: ['🏊‍♂️', '🌊', '☀️'], sky: '#dff4ff', ground: '#7dd3fc' },
  w1_messer: { icons: ['🍎', '🔪', '🍽️'], sky: '#fff7ed', ground: '#fed7aa' },
  w1_kuss: { icons: ['👩‍👦', '💗', '😊'], sky: '#fff1f2', ground: '#fecdd3' },
  w1_rennen: { icons: ['🏃‍♂️', '🏁', '👟'], sky: '#eff6ff', ground: '#bbf7d0' },
  w1_passen: { icons: ['👕', '✅', '👖'], sky: '#f5f3ff', ground: '#ddd6fe' },
  w1_duenn: { icons: ['🧵', '📏', '✏️'], sky: '#f8fafc', ground: '#e2e8f0' },

  w1_brennen: { icons: ['🔥', '🪵', '🏠'], sky: '#fff7ed', ground: '#fdba74' },
  w1_schloss: { icons: ['🏰', '🌳', '☁️'], sky: '#e0f2fe', ground: '#bbf7d0' },
  w1_kennen: { icons: ['👦', '🤝', '👧'], sky: '#ecfeff', ground: '#a5f3fc' },
  w1_nummer: { icons: ['1️⃣', '2️⃣', '3️⃣'], sky: '#eef2ff', ground: '#c7d2fe' },
  w1_schlimm: { icons: ['🤕', '⚠️', '🩹'], sky: '#fff1f2', ground: '#fecaca' },
  w1_beginnen: { icons: ['🟢', '🏁', '▶️'], sky: '#f0fdf4', ground: '#bbf7d0' },
  w1_bissig: { icons: ['🐕', '⚠️', '🦷'], sky: '#fff7ed', ground: '#fed7aa' },

  w3_schiff: { icons: ['🚢', '🌊', '⚓'], sky: '#e0f2fe', ground: '#7dd3fc' },
  w3_billig: { icons: ['🏷️', '⬇️', '🪙'], sky: '#fefce8', ground: '#fde68a' },
  w3_wetter: { icons: ['☀️', '🌧️', '🌈'], sky: '#e0f2fe', ground: '#bae6fd' },
  w3_still: { icons: ['🤫', '📚', '🪶'], sky: '#f8fafc', ground: '#e2e8f0' },
  w3_unfall: { icons: ['🚗', '💥', '🚑'], sky: '#fff1f2', ground: '#fecaca' },
  w3_mitte: { icons: ['⬅️', '🎯', '➡️'], sky: '#eef2ff', ground: '#c7d2fe' },
  w3_retten: { icons: ['🛟', '🤝', '🚒'], sky: '#ecfeff', ground: '#a5f3fc' },

  w4_schuetteln: { icons: ['🥤', '↔️', '💦'], sky: '#ecfeff', ground: '#bae6fd' },
  w4_hoffen: { icons: ['🤞', '⭐', '🙏'], sky: '#faf5ff', ground: '#e9d5ff' },
  w4_muell: { icons: ['🗑️', '♻️', '🧴'], sky: '#f0fdf4', ground: '#bbf7d0' },
  w4_stellen: { icons: ['📦', '⬇️', '🪑'], sky: '#fff7ed', ground: '#fed7aa' },
  w4_gewitter: { icons: ['⛈️', '⚡', '🌧️'], sky: '#e2e8f0', ground: '#94a3b8' },
  w4_sollen: { icons: ['📋', '➡️', '🧒'], sky: '#eef2ff', ground: '#c7d2fe' },
  w4_futter: { icons: ['🐕', '🥣', '🦴'], sky: '#f0fdf4', ground: '#bbf7d0' },

  w5_gluecklich: { icons: ['😊', '🎉', '⭐'], sky: '#fefce8', ground: '#fde68a' },
  w5_erschrecken: { icons: ['😱', '⚡', '👻'], sky: '#faf5ff', ground: '#e9d5ff' },
  w5_packen: { icons: ['🎒', '👕', '📚'], sky: '#eff6ff', ground: '#bfdbfe' },
  w5_stueck: { icons: ['🍰', '🔪', '🍽️'], sky: '#fff7ed', ground: '#fed7aa' },
  w5_trocken: { icons: ['☀️', '👕', '🌬️'], sky: '#fefce8', ground: '#fde68a' },
  w5_gepaeck: { icons: ['🧳', '✈️', '🎒'], sky: '#e0f2fe', ground: '#bae6fd' },
  w5_schmecken: { icons: ['🥣', '👅', '😋'], sky: '#fff7ed', ground: '#fed7aa' },
};

function VisualScene({ spec }: { spec: VisualSpec }) {
  const [a, b, c] = spec.icons;
  return (
    <div
      className="relative w-full max-w-[340px] aspect-[4/3] overflow-hidden rounded-[28px] border-2 border-white shadow-lg"
      style={{ background: spec.sky || '#f8fafc' }}
      role="img"
      aria-label="Bildhinweis"
    >
      <div className="absolute left-0 right-0 bottom-0 h-[34%]" style={{ background: spec.ground || '#e2e8f0' }} />
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/45" />
      <div className="absolute top-[14%] left-[9%] w-16 h-16 rounded-full bg-white/35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[78px] sm:text-[92px] leading-none drop-shadow-md select-none">{a}</span>
      </div>
      {b && (
        <div className="absolute right-[12%] bottom-[16%] w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 border border-white shadow-md flex items-center justify-center">
          <span className="text-4xl sm:text-5xl leading-none select-none">{b}</span>
        </div>
      )}
      {c && (
        <div className="absolute left-[10%] bottom-[13%] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/85 border border-white shadow-md flex items-center justify-center">
          <span className="text-3xl sm:text-4xl leading-none select-none">{c}</span>
        </div>
      )}
    </div>
  );
}

export default function LernwortVisual({ word, compact = false }: { word: LernwortItem; compact?: boolean }) {
  const spec = VISUALS[word.id];
  if (!spec) {
    return <div className={compact ? 'text-5xl' : 'text-7xl sm:text-8xl'} aria-label="Bildhinweis">{word.emoji}</div>;
  }
  if (compact) {
    return (
      <div className="w-20 h-16 overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-white">
        <div className="origin-top-left scale-[0.235] w-[340px]">
          <VisualScene spec={spec} />
        </div>
      </div>
    );
  }
  return <VisualScene spec={spec} />;
}
