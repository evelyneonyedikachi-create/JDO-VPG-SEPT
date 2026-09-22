import React, { useState } from 'react';
import { ConversationGoal, DailyMission, Language, PictureScene, Playmate, RealWorldScenario } from '../types';
import { Volume2, Sparkles, Mic, ArrowRight, Target, Compass, Image, MessageSquare, Play, Flame, ShieldAlert, Award } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { CONVERSATION_GOALS } from '../data/goals';
import { DAILY_MISSIONS } from '../data/missions';
import { PICTURE_SCENES } from '../data/pictures';
import { REAL_WORLD_SCENARIOS } from '../data/scenarios';
import playgroundBg from '../assets/images/playground_bg_1787570993565.jpg';
import { playChime } from '../utils/soundEffects';

interface WelcomeScreenProps {
  language: Language;
  playmates: Playmate[];
  selectedPlaymate: Playmate;
  selectedGoal: ConversationGoal;
  isListeningForVoiceNav: boolean;
  onSelectPlaymate: (playmate: Playmate) => void;
  onSelectGoal: (goal: ConversationGoal) => void;
  onLaunchMission: (mission: DailyMission) => void;
  onLaunchPictureScene: (scene: PictureScene, playmate: Playmate) => void;
  onLaunchScenario: (scenario: RealWorldScenario, playmate: Playmate) => void;
  onOpenVoiceGames: () => void;
  onPreviewVoice: (playmate: Playmate) => void;
  onToggleVoiceNav: () => void;
  starsCount: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  playmates,
  selectedPlaymate,
  selectedGoal,
  isListeningForVoiceNav,
  onSelectPlaymate,
  onSelectGoal,
  onLaunchMission,
  onLaunchPictureScene,
  onLaunchScenario,
  onOpenVoiceGames,
  onPreviewVoice,
  onToggleVoiceNav,
  starsCount,
}) => {
  const [hoveredPlaymateId, setHoveredPlaymateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'missions' | 'pictures' | 'scenarios'>('friends');

  // Focus on top 4 primary characters (Ben, Mia, Leo, Sophie)
  const primaryPlaymates = playmates.filter((p) =>
    ['ben', 'mia', 'leo', 'sophie'].includes(p.id)
  );

  const todaysFeaturedMission = DAILY_MISSIONS[0];

  return (
    <div
      id="welcome-screen"
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 my-2 flex flex-col items-center justify-between min-h-[600px] p-5 sm:p-8 text-slate-900 animate-fade-in select-none"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.82), rgba(241, 245, 249, 0.94)), url(${playgroundBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Welcome Title & Greeting Banner */}
      <div className="w-full flex flex-col items-center text-center z-10 space-y-2 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-amber-200 shadow-sm text-amber-900 font-extrabold text-xs sm:text-sm animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>
            {language === 'de'
              ? 'Jedidiahs Sprach-Spielplatz • Sprechen mit Freude & ohne Druck'
              : 'Jedidiah’s Voice Playground • Speaking with confidence & joy'}
          </span>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center gap-1">
            ⭐ {starsCount}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
          {language === 'de' ? 'Hallo Jedidiah! 👋' : 'Hello Jedidiah! 👋'}
        </h1>

        <p className="text-base sm:text-xl font-bold text-indigo-900/90 max-w-2xl">
          {language === 'de'
            ? 'Wähle einen Freund, eine Tages-Mission oder starte ein spannendes Rollenspiel!'
            : 'Pick a friend, start today’s mission, or try an exciting roleplay!'}
        </p>

        {/* Voice Navigation Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onToggleVoiceNav}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-sm ${
              isListeningForVoiceNav
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 animate-pulse'
                : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
            }`}
            title="Sage einfach z.B. 'Ben' oder 'Mia'!"
          >
            <Mic className={`w-3.5 h-3.5 ${isListeningForVoiceNav ? 'animate-ping' : 'text-indigo-600'}`} />
            <span>
              {isListeningForVoiceNav
                ? language === 'de'
                  ? '🎤 Ich höre zu... Sag z.B. "Ben", "Mia", "Leo" oder "Sophie"'
                  : '🎤 Listening... Say e.g. "Ben", "Mia", "Leo" or "Sophie"'
                : language === 'de'
                ? 'Mit Stimme steuern 🎙️'
                : 'Voice Navigation 🎙️'}
            </span>
          </button>
        </div>
      </div>

      {/* VOICE-CONTROLLED GAMES FEATURE BANNER */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-4 sm:p-5 text-white shadow-2xl my-2 z-10 border-2 border-indigo-300 flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-in">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0 animate-bounce-subtle">
            🎮
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/50 text-amber-300 font-black text-[11px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>{language === 'de' ? 'Neu • Sprach-Spiele' : 'New • Voice Games'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black leading-tight">
              {language === 'de' ? '🎮 Voice Football, Guide Me, Basketball & Racing!' : '🎮 Voice Football, Guide Me, Basketball & Racing!'}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium line-clamp-1 mt-0.5">
              {language === 'de'
                ? 'Steuere das Spielgeschehen in Echtzeit nur mit deiner Stimme — Pässe, Tore, Richtungen & Taktik!'
                : 'Control gameplay in real time purely with your voice — passes, goals, directions & strategy!'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playChime('unlock_fanfare');
            onOpenVoiceGames();
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm shadow-xl active:scale-95 transition-all shrink-0"
        >
          <Play className="w-4 h-4 fill-slate-900" />
          <span>{language === 'de' ? 'Spiele öffnen 🚀' : 'Open Games 🚀'}</span>
        </button>
      </div>

      {/* TODAY'S MISSION HIGHLIGHT BANNER */}
      {todaysFeaturedMission && (
        <div className="w-full max-w-4xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl my-4 z-10 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
              {todaysFeaturedMission.icon}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-900/40 text-amber-100 font-extrabold text-[11px] uppercase tracking-wider mb-1">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>{language === 'de' ? "Heutige Mission" : "Today's Mission"}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'de' ? todaysFeaturedMission.titleDe : todaysFeaturedMission.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-medium line-clamp-1 mt-0.5">
                {language === 'de' ? todaysFeaturedMission.descriptionDe : todaysFeaturedMission.descriptionEn}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('click');
              onLaunchMission(todaysFeaturedMission);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-amber-50 font-black text-sm shadow-lg active:scale-95 transition-all shrink-0"
          >
            <Play className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span>{language === 'de' ? 'Mission starten' : 'Start Mission'}</span>
          </button>
        </div>
      )}

      {/* CONVERSATION GOAL PICKER BAR */}
      <div className="w-full max-w-4xl z-10 my-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            {language === 'de' ? 'Sitzungs-Ziel wählen:' : 'Choose Conversation Goal:'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CONVERSATION_GOALS.slice(0, 6).map((g) => {
            const isSelected = selectedGoal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  playChime('click');
                  onSelectGoal(g.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shadow-xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 scale-105'
                    : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                <span>{g.emoji}</span>
                <span>{language === 'de' ? g.titleDe : g.titleEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION TABS (Freunde | Missionen | Bild-Abenteuer | Echtes Leben) */}
      <div className="w-full max-w-4xl z-10 flex items-center justify-center gap-2 my-2 border-b border-slate-200/80 pb-2">
        {[
          { id: 'friends', labelDe: 'Spielfreunde 🧑‍🤝‍🧑', labelEn: 'Playmates 🧑‍🤝‍🧑' },
          { id: 'missions', labelDe: 'Alle Missionen 🎯', labelEn: 'All Missions 🎯' },
          { id: 'pictures', labelDe: 'Bild-Abenteuer 🖼️', labelEn: 'Picture Prompts 🖼️' },
          { id: 'scenarios', labelDe: 'Echtes Leben 🎭', labelEn: 'Real-World 🎭' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playChime('click');
              setActiveTab(tab.id as any);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/60'
            }`}
          >
            {language === 'de' ? tab.labelDe : tab.labelEn}
          </button>
        ))}
      </div>

      {/* TAB 1: 4 Digital Child Playmates Grid */}
      {activeTab === 'friends' && (
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 my-3 z-10 max-w-5xl">
          {primaryPlaymates.map((playmate) => {
            const isSelected = selectedPlaymate.id === playmate.id;
            const isHovered = hoveredPlaymateId === playmate.id;

            return (
              <div
                key={playmate.id}
                id={`card-playmate-${playmate.id}`}
                onMouseEnter={() => setHoveredPlaymateId(playmate.id)}
                onMouseLeave={() => setHoveredPlaymateId(null)}
                onClick={() => onSelectPlaymate(playmate)}
                className={`group relative flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border-4 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 active:scale-95 ${
                  isSelected
                    ? 'border-indigo-500 ring-4 ring-indigo-200 bg-white'
                    : 'border-slate-100 hover:border-indigo-300'
                }`}
              >
                {/* Voice Preview Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewVoice(playmate);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 shadow-xs transition-all active:scale-90 z-20"
                  title={`${playmate.name}s Stimme anhören`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                {/* Avatar */}
                <div className="relative my-2 transform transition-transform duration-300 group-hover:scale-105">
                  <AvatarDisplay
                    playmate={playmate}
                    emotion={isHovered ? 'cheering' : 'happy'}
                    viseme={isHovered ? 'smile' : 'closed'}
                    isSpeaking={false}
                    isListening={false}
                    size="lg"
                  />
                </div>

                {/* Name & Identity */}
                <div className="text-center mt-2 space-y-1 w-full">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {playmate.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-xl">
                    {language === 'de' ? playmate.taglineDe : playmate.taglineEn}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 line-clamp-1">
                    🎙️ {language === 'de'
                      ? playmate.vocalArchetype === 'warm_thoughtful' ? 'Warme, aufmerksame Stimme'
                        : playmate.vocalArchetype === 'energetic_sporty' ? 'Sportliche, lebendige Stimme'
                        : playmate.vocalArchetype === 'calm_curious' ? 'Ruhige, forschende Stimme'
                        : 'Helle, verspielte Stimme'
                      : playmate.vocalArchetype === 'warm_thoughtful' ? 'Warm & expressive voice'
                        : playmate.vocalArchetype === 'energetic_sporty' ? 'Energetic & upbeat voice'
                        : playmate.vocalArchetype === 'calm_curious' ? 'Calm & curious voice'
                        : 'Bright & playful voice'}
                  </p>
                </div>

                {/* Play Action */}
                <div className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-xs shadow-md group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all">
                  <span>{language === 'de' ? `Mit ${playmate.name} spielen` : `Play with ${playmate.name}`}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: All Missions */}
      {activeTab === 'missions' && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 z-10 max-w-4xl">
          {DAILY_MISSIONS.map((mission) => {
            const assignedPlaymate = playmates.find((p) => p.id === mission.targetPlaymateId) || primaryPlaymates[0];
            return (
              <div
                key={mission.id}
                onClick={() => onLaunchMission(mission)}
                className="group p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-200/80 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                    {mission.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-600">
                      {language === 'de' ? mission.titleDe : mission.titleEn}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {language === 'de' ? mission.descriptionDe : mission.descriptionEn}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Mit {assignedPlaymate.name} • 🏆 {language === 'de' ? mission.badgeDe : mission.badgeEn}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Picture Prompts */}
      {activeTab === 'pictures' && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-3 z-10 max-w-4xl">
          {PICTURE_SCENES.slice(0, 3).map((scene) => (
            <div
              key={scene.id}
              onClick={() => onLaunchPictureScene(scene, selectedPlaymate)}
              className="group rounded-3xl overflow-hidden bg-white/95 border-2 border-slate-200/80 hover:border-teal-400 hover:shadow-xl transition-all cursor-pointer flex flex-col active:scale-98 shadow-md"
            >
              <div className="h-28 w-full overflow-hidden relative">
                <img
                  src={scene.imageUrl}
                  alt={scene.titleDe}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold">
                  {language === 'de' ? 'Bild-Abenteuer' : 'Picture Scene'}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-teal-600">
                    {language === 'de' ? scene.titleDe : scene.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {language === 'de' ? scene.descriptionDe : scene.descriptionEn}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-black text-teal-600">
                  <span>{language === 'de' ? 'Mit Bild erzählen' : 'Explore with picture'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Real-World Scenarios */}
      {activeTab === 'scenarios' && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 z-10 max-w-4xl">
          {REAL_WORLD_SCENARIOS.slice(0, 4).map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onLaunchScenario(scenario, selectedPlaymate)}
              className="group p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-200/80 hover:border-rose-400 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl shrink-0">
                  {scenario.emoji}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-rose-600">
                    {language === 'de' ? scenario.titleDe : scenario.titleEn}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {language === 'de' ? scenario.descriptionDe : scenario.descriptionEn}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Rolle: {language === 'de' ? scenario.avatarRoleDe : scenario.avatarRoleEn}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transform group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Bottom Friendly Prompt */}
      <div className="z-10 text-center text-xs font-bold text-slate-600 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 shadow-xs">
        {language === 'de'
          ? 'Tippe auf einen Freund oder sag seinen Namen in dein Mikrofon!'
          : 'Tap on a friend or say their name into your microphone!'}
      </div>
    </div>
  );
};

