import React from 'react';
import { Language, Playmate } from '../types';
import { Radio, Mic, Trophy, Users, Shield, ArrowLeft } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface FootballZoneViewProps {
  language: Language;
  playmate: Playmate;
  onSelectSubActivity: (subModeId: string, initialPrompt?: string) => void;
  onBack: () => void;
}

export const FootballZoneView: React.FC<FootballZoneViewProps> = ({
  language,
  playmate,
  onSelectSubActivity,
  onBack,
}) => {
  const activities = [
    {
      id: 'commentator',
      icon: Radio,
      color: 'from-amber-500 to-orange-600',
      badge: 'Action!',
      titleDe: '🎙️ Sei der Live-Kommentator!',
      titleEn: '🎙️ Be the Match Commentator!',
      descDe: '89. Minute, Champions League Finale! Beschreibe live ins Mikrofon, was auf dem Rasen passiert!',
      descEn: '89th minute, Champions League Final! Describe live on the microphone what happens on the pitch!',
      starterDe: 'JD, du bist jetzt live am Mikrofon! 89. Minute, Champions-League-Finale, es steht 1:1. Dein Team hat einen Eckball. Was passiert jetzt? Du bist dran!',
      starterEn: 'JD, you are live in the commentary booth! 89th minute, 1-1 in the final! Your team has a corner. What happens next? Take it away!',
    },
    {
      id: 'interview',
      icon: Mic,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Interview',
      titleDe: '🎤 Star-Interview nach dem 3:2 Sieg',
      titleEn: '🎤 Post-Match Star Interview',
      descDe: 'Du bist der gefeierte Matchwinner! Der Sportreporter stellt dir Fragen zum entscheidenden Tor.',
      descEn: 'You are the celebrated match winner! The sports reporter interviews you about your winning goal.',
      starterDe: 'Guten Tag, Herr Starspieler JD! Herzlichen Glückwunsch zum spektakulären 3:2 Sieg! Wie fühlst du dich nach diesem harten Spiel?',
      starterEn: 'Good day, superstar JD! Huge congratulations on the spectacular 3-2 win! How are you feeling after that intense game?',
    },
    {
      id: 'dream_team',
      icon: Shield,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Taktik',
      titleDe: '🛡️ Baue deine Traum-Elf',
      titleEn: '🛡️ Build Your Dream Team',
      descDe: 'Du bist der Cheftrainer! Wähle Torwart, Abwehrchef, Mittelfeld-Motor & Stürmer aus und erkläre, warum.',
      descEn: 'You are the head coach! Select your goalkeeper, defensive captain, midfielders & strikers and explain why.',
      starterDe: 'JD, du bist heute der Cheftrainer! Wen stellst du als allererstes ins Tor und wer wird dein Kapitän?',
      starterEn: 'JD, you are the head coach today! Who is the very first player you put in goal, and who is your team captain?',
    },
    {
      id: 'team_and_player',
      icon: Trophy,
      color: 'from-purple-600 to-pink-600',
      badge: 'Mein Verein',
      titleDe: '⭐ Mein Lieblingsteam & bester Spieler',
      titleEn: '⭐ My Favourite Team & Star Player',
      descDe: 'Erzähle, welche Mannschaft du anfeuerst, wer dein Lieblingsspieler ist und was ihn so stark macht.',
      descEn: 'Tell about the team you support, your idol player, and what special skills make him amazing.',
      starterDe: 'Hey JD! Welche Fußballmannschaft feuerst du am meisten an und wer ist dein absoluter Lieblingsspieler?',
      starterEn: 'Hey JD! Which football team do you support the most, and who is your all-time favourite player?',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in select-none">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            playChime('click');
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Themen-Übersicht' : 'All Topics'}</span>
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase">
          <Trophy className="w-4 h-4" />
          <span>{language === 'de' ? 'Fußball-Zentrale' : 'Football HQ'}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <span>⚽</span>
          <span>{language === 'de' ? 'Die große Fußball-Zone' : 'The Great Football Zone'}</span>
        </h2>
        <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-2xl mx-auto">
          {language === 'de'
            ? `Wähle ein Fußball-Spiel aus, das du mit ${playmate.name} spielen möchtest!`
            : `Choose an exciting football activity to play with ${playmate.name}!`}
        </p>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              id={`football-act-${act.id}`}
              onClick={() => {
                playChime('click');
                onSelectSubActivity(act.id, language === 'de' ? act.starterDe : act.starterEn);
              }}
              className="relative rounded-2xl p-6 cursor-pointer transition-all duration-200 transform active:scale-98 flex flex-col justify-between bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200/60">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/60">
                  {act.badge}
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                  {language === 'de' ? act.titleDe : act.titleEn}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {language === 'de' ? act.descDe : act.descEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-600">
                <span>{language === 'de' ? 'Jetzt starten 🎙️' : 'Start now 🎙️'}</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
