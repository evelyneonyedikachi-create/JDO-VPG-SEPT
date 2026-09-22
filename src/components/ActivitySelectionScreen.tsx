import React from 'react';
import { Language, PlayEnvironment, Playmate, PlaymateActivity } from '../types';
import { ArrowLeft, Sparkles, Mic, MapPin } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import playgroundBg from '../assets/images/playground_bg_1787570993565.jpg';

interface ActivitySelectionScreenProps {
  language: Language;
  playmate: Playmate;
  environments: PlayEnvironment[];
  selectedEnvironment: PlayEnvironment;
  isListeningForVoiceNav: boolean;
  onSelectActivity: (activity: PlaymateActivity) => void;
  onSelectEnvironment: (env: PlayEnvironment) => void;
  onOpenVoiceGames?: () => void;
  onBackToPlaymates: () => void;
  onToggleVoiceNav: () => void;
}

export const ActivitySelectionScreen: React.FC<ActivitySelectionScreenProps> = ({
  language,
  playmate,
  environments,
  selectedEnvironment,
  isListeningForVoiceNav,
  onSelectActivity,
  onSelectEnvironment,
  onOpenVoiceGames,
  onBackToPlaymates,
  onToggleVoiceNav,
}) => {
  const activities = playmate.customActivities || [];

  return (
    <div
      id="activity-selection-screen"
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 my-2 flex flex-col items-center justify-between min-h-[580px] p-6 sm:p-8 text-slate-900 animate-fade-in select-none"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(241, 245, 249, 0.92)), url(${playgroundBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Bar with Back Button & Environment Switcher */}
      <div className="w-full flex items-center justify-between z-10 gap-3">
        <button
          onClick={onBackToPlaymates}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Freunde wechseln' : 'Change Friend'}</span>
        </button>

        {/* Selected World / Environment Picker */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          <MapPin className="w-4 h-4 text-indigo-600 ml-1" />
          <span className="hidden sm:inline text-slate-500">
            {language === 'de' ? 'Ort:' : 'Place:'}
          </span>
          <select
            value={selectedEnvironment.id}
            onChange={(e) => {
              const found = environments.find((env) => env.id === e.target.value);
              if (found) onSelectEnvironment(found);
            }}
            className="bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold py-1 px-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.emoji} {language === 'de' ? env.nameDe : env.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Character & Question Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 my-4 z-10 max-w-4xl">
        {/* Prominent Playmate Avatar */}
        <div className="relative">
          <AvatarDisplay
            playmate={playmate}
            emotion="cheering"
            viseme="smile"
            isSpeaking={false}
            isListening={false}
            size="xl"
          />
        </div>

        {/* Speech Greeting Cloud */}
        <div className="relative flex-1 bg-white/95 backdrop-blur-md p-5 sm:p-7 rounded-3xl border-3 border-indigo-200 shadow-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-black text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{playmate.name} {language === 'de' ? 'freut sich riesig!' : 'is super excited!'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'de'
              ? `Hey Jedidiah! Was wollen wir heute machen?`
              : `Hey Jedidiah! What should we do today?`}
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">
            {language === 'de'
              ? `Wähle ein Abenteuer oder sprich einfach frei drauflos!`
              : `Choose an activity or just start talking!`}
          </p>

          {/* Voice Prompt toggle button */}
          <div className="mt-3">
            <button
              onClick={onToggleVoiceNav}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all ${
                isListeningForVoiceNav
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>
                {isListeningForVoiceNav
                  ? language === 'de'
                    ? '🎤 Ich höre zu... Sag z.B. "Fußball"'
                    : '🎤 Listening... Say e.g. "Football"'
                  : language === 'de'
                  ? 'Mit Stimme auswählen 🎙️'
                  : 'Select with Voice 🎙️'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Activity Cards Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 my-2 z-10 max-w-5xl">
        {/* Featured Voice Games Card */}
        {onOpenVoiceGames && (
          <button
            id="activity-voice-games"
            onClick={onOpenVoiceGames}
            className="group relative flex flex-col items-start p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white border-3 border-indigo-300 hover:shadow-2xl hover:-translate-y-1.5 transition-all text-left active:scale-95 shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform mb-3">
              <span>🎮</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {language === 'de' ? '🎮 Sprach-Spiele' : '🎮 Voice Games'}
            </h3>

            <p className="text-xs font-bold text-indigo-100 mt-1 line-clamp-1">
              {language === 'de' ? 'Fußball, Labyrinth, Basketball & Racing' : 'Football, Maze, Basketball & Racing'}
            </p>

            <div className="mt-3 w-full flex items-center justify-between text-[11px] font-black text-slate-900 bg-amber-400 px-2.5 py-1 rounded-xl shadow-xs">
              <span>{language === 'de' ? 'Jetzt spielen ⚽' : 'Play Now ⚽'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        )}

        {activities.map((activity) => (
          <button
            key={activity.id}
            id={`activity-${activity.id}`}
            onClick={() => onSelectActivity(activity)}
            className="group relative flex flex-col items-start p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border-3 border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1.5 transition-all text-left active:scale-95 shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform mb-3">
              <span>{activity.emoji}</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
              {language === 'de' ? activity.titleDe : activity.titleEn}
            </h3>

            <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">
              {language === 'de' ? activity.subtitleDe : activity.subtitleEn}
            </p>

            <div className="mt-3 w-full flex items-center justify-between text-[11px] font-black text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-xl">
              <span>{language === 'de' ? 'Starten 🚀' : 'Start 🚀'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Footer Tip */}
      <div className="z-10 text-center text-xs font-bold text-slate-600 bg-white/80 backdrop-blur-md px-5 py-1.5 rounded-full border border-slate-200 shadow-xs mt-2">
        {language === 'de'
          ? 'Tippe auf eine Aktivität, um das Gespräch zu starten!'
          : 'Tap on an activity to start talking!'}
      </div>
    </div>
  );
};
