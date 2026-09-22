import React, { useState } from 'react';
import { Language, Playmate } from '../../types';
import { playChime } from '../../utils/soundEffects';
import { VoiceFootballGame } from './VoiceFootballGame';
import { VoiceGuideMeGame } from './VoiceGuideMeGame';
import { VoiceBasketballGame } from './VoiceBasketballGame';
import { VoiceRacingGame } from './VoiceRacingGame';
import { MicrophoneCalibrationModal } from '../MicrophoneCalibrationModal';
import { VoiceEngine } from '../../services/voiceEngine';
import {
  Gamepad2,
  Trophy,
  ArrowLeft,
  Sparkles,
  Compass,
  Zap,
  Flame,
  Award,
  Star,
  CheckCircle2,
  Play,
  Sliders,
} from 'lucide-react';

interface VoiceGamesHubProps {
  language: Language;
  playmate: Playmate;
  voiceEngineRef: React.MutableRefObject<VoiceEngine | null>;
  onBack: () => void;
  onRewardStars: (count: number, reason: string) => void;
}

type ActiveGame = 'hub' | 'football' | 'guide_me' | 'basketball' | 'racing';

export const VoiceGamesHub: React.FC<VoiceGamesHubProps> = ({
  language,
  playmate,
  voiceEngineRef,
  onBack,
  onRewardStars,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('hub');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  // Badges Earned State
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([
    'goal_master',
    'super_navigator',
    'clear_commander',
  ]);

  const BADGES = [
    { id: 'goal_master', emoji: '⚽', titleDe: 'Tor-Meister', titleEn: 'Goal Master', descDe: 'Traumtore mit der Stimme erzielt' },
    { id: 'team_captain', emoji: '🎙️', titleDe: 'Team-Kapitän', titleEn: 'Team Captain', descDe: 'Perfekte Taktikbefehle gegeben' },
    { id: 'super_navigator', emoji: '🧭', titleDe: 'Super-Navigator', titleEn: 'Super Navigator', descDe: 'Sicher durch das Labyrinth geführt' },
    { id: 'court_commander', emoji: '🏀', titleDe: 'Korb-König', titleEn: 'Court Commander', descDe: 'Drei-Punkte-Würfe verwandelt' },
    { id: 'racing_strategist', emoji: '🏎️', titleDe: 'Renn-Stratege', titleEn: 'Racing Strategist', descDe: 'Zuerst bremsen, danach Vollgas' },
    { id: 'full_sentence_star', emoji: '⭐', titleDe: 'Satz-Meister', titleEn: 'Full Sentence Star', descDe: 'Ganze Befehlssätze gesprochen' },
  ];

  const GAMES = [
    {
      id: 'football',
      emoji: '⚽',
      color: 'from-emerald-500 via-teal-600 to-emerald-700',
      borderColor: 'border-emerald-300',
      badgeDe: 'Neu • 5 Level',
      badgeEn: 'New • 5 Levels',
      titleDe: 'Voice Football • Sprach-Fußball',
      titleEn: 'Voice Football • Match Arena',
      descDe: 'Steuere Pässe zu Ben & Leo, schlage Flanken und schieße Traumtore ins Kreuzeck — allein mit deiner Stimme!',
      descEn: 'Command passes to Ben & Leo, cross into the box, and score screamers — purely using your voice!',
      commandsDe: ['"Pass nach links"', '"Spiel den Ball zu Ben"', '"Schieß aufs Tor!"'],
      commandsEn: ['"Pass to the left"', '"Give ball to Ben"', '"Shoot at the goal!"'],
    },
    {
      id: 'guide_me',
      emoji: '🧭',
      color: 'from-blue-500 via-indigo-600 to-blue-700',
      borderColor: 'border-blue-300',
      badgeDe: 'Top-Empfehlung',
      badgeEn: 'Featured Pick',
      titleDe: 'Guide Me! • Der Entdecker-Pfad',
      titleEn: 'Guide Me! • Explorer Maze',
      descDe: 'Führe deinen Spielfreund durch Hindernisse, über Holzbrücken und durch Höhlentunnel bis zum roten Schatz-Tor!',
      descEn: 'Guide your playmate through obstacles, over bridges, and through tunnels straight to the red treasure door!',
      commandsDe: ['"Gehe zwei Schritte vor"', '"Dreh dich nach links"', '"Geh zur roten Tür"'],
      commandsEn: ['"Move two steps forward"', '"Turn to the left"', '"Go to the red door"'],
    },
    {
      id: 'basketball',
      emoji: '🏀',
      color: 'from-orange-500 via-amber-600 to-orange-700',
      borderColor: 'border-orange-300',
      badgeDe: 'Buzzer Beater',
      badgeEn: 'Buzzer Beater',
      titleDe: 'Voice Basketball • Korb-Action',
      titleEn: 'Voice Basketball • Slam & Three',
      descDe: 'Entscheide in den letzten 5 Sekunden: Pass zu Mia oder zieh zum Korb für den 3-Punkte-Wurf!',
      descEn: 'Decide in the clutch final 5 seconds: Pass to open Mia or pull up for the game-winning 3-pointer!',
      commandsDe: ['"Pass zu Mia"', '"Dribbel nach rechts"', '"Wirf den Ball!"'],
      commandsEn: ['"Pass to Mia"', '"Dribble right"', '"Shoot the ball!"'],
    },
    {
      id: 'racing',
      emoji: '🏎️',
      color: 'from-red-600 via-rose-600 to-red-800',
      borderColor: 'border-red-300',
      badgeDe: 'Sequenz-Training',
      badgeEn: 'Sequencing Action',
      titleDe: 'Voice Racing GP • Renn-Taktik',
      titleEn: 'Voice Racing GP • Grand Prix',
      descDe: 'Übe Sequenz-Befehle: "Brems zuerst vor der Kurve und beschleunige danach zum Überholen des roten Autos!"',
      descEn: 'Practice multi-step sequencing: "First brake before the turn, then accelerate to overtake the red car!"',
      commandsDe: ['"Brems vor der Kurve"', '"Zuerst links, dann überholen"', '"Vollgas!"'],
      commandsEn: ['"Brake before turn"', '"First left, then overtake"', '"Full throttle!"'],
    },
  ];

  if (activeGame === 'football') {
    return (
      <VoiceFootballGame
        language={language}
        playmate={playmate}
        voiceEngineRef={voiceEngineRef}
        onBack={() => setActiveGame('hub')}
        onRewardStars={onRewardStars}
      />
    );
  }

  if (activeGame === 'guide_me') {
    return (
      <VoiceGuideMeGame
        language={language}
        playmate={playmate}
        voiceEngineRef={voiceEngineRef}
        onBack={() => setActiveGame('hub')}
        onRewardStars={onRewardStars}
      />
    );
  }

  if (activeGame === 'basketball') {
    return (
      <VoiceBasketballGame
        language={language}
        playmate={playmate}
        voiceEngineRef={voiceEngineRef}
        onBack={() => setActiveGame('hub')}
        onRewardStars={onRewardStars}
      />
    );
  }

  if (activeGame === 'racing') {
    return (
      <VoiceRacingGame
        language={language}
        playmate={playmate}
        voiceEngineRef={voiceEngineRef}
        onBack={() => setActiveGame('hub')}
        onRewardStars={onRewardStars}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={() => {
            playChime('click');
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Zurück zur Übersicht' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-extrabold text-xs sm:text-sm">
          <Gamepad2 className="w-4 h-4 text-indigo-600" />
          <span>{language === 'de' ? 'Sprach-Gesteuerte Spiele' : 'Voice-Controlled Games'}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="text-center mb-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs mb-2 border border-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {language === 'de'
              ? 'Deine Stimme steuert die Welt • Reden macht Spaß & bringt Action!'
              : 'Your voice controls the world • Speaking is fun and causes action!'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          🎮 {language === 'de' ? 'Die großen Sprach-Spiele' : 'The Voice Games'}
        </h1>

        <p className="text-slate-600 text-base sm:text-lg font-medium mt-2">
          {language === 'de'
            ? 'Keine Tasten, keine Pfeile — sprich einfach ins Mikrofon und sieh zu, wie deine Spielfreunde Pässe spielen, Tore schießen und Rennen gewinnen!'
            : 'No keyboards, no arrows — just speak into the microphone and watch your playmates pass, score goals, and win races!'}
        </p>
      </div>

      {/* 4 Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-10">
        {GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              playChime('click');
              setActiveGame(game.id as ActiveGame);
            }}
            className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-white border-3 ${game.borderColor} shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-200 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {game.emoji}
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-sm">
                  {language === 'de' ? game.badgeDe : game.badgeEn}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                {language === 'de' ? game.titleDe : game.titleEn}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4 leading-relaxed">
                {language === 'de' ? game.descDe : game.descEn}
              </p>

              {/* Sample Spoken Commands */}
              <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                  <span>🎙️</span>
                  <span>{language === 'de' ? 'Typische Sprach-Befehle:' : 'Voice Commands:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(language === 'de' ? game.commandsDe : game.commandsEn).map((cmd, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white text-slate-800 text-[11px] font-bold border border-slate-200 shadow-2xs"
                    >
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playChime('click');
                setActiveGame(game.id as ActiveGame);
              }}
              className={`w-full py-3 rounded-2xl bg-gradient-to-r ${game.color} text-white font-black text-sm shadow-md group-hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{language === 'de' ? 'Jetzt mit Stimme spielen' : 'Play With Voice Now'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* TROPHY & BADGES SECTION */}
      <div className="bg-white rounded-3xl p-6 border-3 border-amber-200 shadow-lg">
        <div className="flex items-center gap-2.5 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-black text-slate-900">
            {language === 'de' ? '🏆 Deine Sprach-Abzeichen & Erfolge' : '🏆 Your Voice Badges & Achievements'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BADGES.map((b) => {
            const isUnlocked = unlockedBadges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <span className="text-3xl mb-1.5">{b.emoji}</span>
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {language === 'de' ? b.titleDe : b.titleEn}
                </span>
                <span className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-2">
                  {b.descDe}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
