import React, { useState, useEffect } from 'react';
import {
  ConversationGoal,
  Emotion,
  Language,
  PictureScene,
  PlayEnvironment,
  Playmate,
  RealWorldScenario,
  TopicCategory,
  Viseme,
} from '../types';
import {
  RotateCcw,
  Snail,
  Pause,
  Play,
  Trophy,
  Home,
  Sparkles,
  MapPin,
  Lightbulb,
  HelpCircle,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
  Target,
  Image as ImageIcon,
  CheckCircle2,
  Mic,
  Smile,
  MessageCircle,
} from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { MicrophoneControl } from './MicrophoneControl';
import { CONVERSATION_GOALS } from '../data/goals';
import { STARTER_CATEGORIES } from '../data/starters';
import { playChime } from '../utils/soundEffects';

interface ConversationScreenProps {
  language: Language;
  playmate: Playmate;
  environment: PlayEnvironment;
  topic: TopicCategory;
  goal?: ConversationGoal;
  turnCount?: number;
  pictureScene?: PictureScene | null;
  scenario?: RealWorldScenario | null;
  lastPlaymateMessage: string;
  isPlaymateSpeaking: boolean;
  isJDListening?: boolean;
  isJedidiahListening?: boolean;
  voiceState: string;
  currentEmotion: Emotion;
  currentViseme: Viseme;
  interimTranscript: string;
  isSlowVoice: boolean;
  isAudioPaused: boolean;
  volume: number;
  listeningBackEnabled?: boolean;
  lastRecordedAudioUrl?: string | null;
  onToggleMic: () => void;
  onRepeatLastMessage: () => void;
  onToggleSlowVoice: () => void;
  onTogglePauseAudio: () => void;
  onPlayOwnRecording?: () => void;
  onRequestHelpStarter?: (starterText: string) => void;
  onPassTurn?: () => void;
  onNextQuestion?: () => void;
  onChangeTopicRequest?: () => void;
  onFinishSession: () => void;
  onBackToHome: () => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  language,
  playmate,
  environment,
  topic,
  goal = 'just_chat',
  turnCount = 1,
  pictureScene,
  scenario,
  lastPlaymateMessage,
  isPlaymateSpeaking,
  isJDListening,
  isJedidiahListening,
  voiceState,
  currentEmotion,
  currentViseme,
  interimTranscript,
  isSlowVoice,
  isAudioPaused,
  volume,
  listeningBackEnabled = true,
  lastRecordedAudioUrl,
  onToggleMic,
  onRepeatLastMessage,
  onToggleSlowVoice,
  onTogglePauseAudio,
  onPlayOwnRecording,
  onRequestHelpStarter,
  onPassTurn,
  onNextQuestion,
  onChangeTopicRequest,
  onFinishSession,
  onBackToHome,
}) => {
  const listening = isJedidiahListening ?? isJDListening ?? false;
  const [showStartersDrawer, setShowStartersDrawer] = useState<boolean>(false);
  const [selectedStarterCategory, setSelectedStarterCategory] = useState<string>('general');
  const [isPlayingOwnAudio, setIsPlayingOwnAudio] = useState<boolean>(false);

  const goalDef = CONVERSATION_GOALS.find((g) => g.id === goal) || CONVERSATION_GOALS[0];
  const activeCategory = STARTER_CATEGORIES.find((c) => c.id === selectedStarterCategory) || STARTER_CATEGORIES[0];

  // Staged thinking timer for responsive UI feedback
  const [thinkingSeconds, setThinkingSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (voiceState === 'thinking') {
      setThinkingSeconds(0);
      timer = setInterval(() => {
        setThinkingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setThinkingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [voiceState]);

  const handlePlayOwnAudio = () => {
    if (onPlayOwnRecording) {
      onPlayOwnRecording();
      return;
    }
    if (lastRecordedAudioUrl) {
      setIsPlayingOwnAudio(true);
      const audio = new Audio(lastRecordedAudioUrl);
      audio.onended = () => setIsPlayingOwnAudio(false);
      audio.onerror = () => setIsPlayingOwnAudio(false);
      audio.play().catch(() => setIsPlayingOwnAudio(false));
    }
  };

  const handleSelectStarter = (starterText: string) => {
    playChime('click');
    if (onRequestHelpStarter) {
      onRequestHelpStarter(starterText);
    }
    setShowStartersDrawer(false);
  };

  return (
    <div
      id="conversation-screen"
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 my-2 flex flex-col justify-between min-h-[640px] p-4 sm:p-7 text-white select-none animate-fade-in"
      style={{
        backgroundImage: environment.bgImageUrl
          ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.88)), url(${environment.bgImageUrl})`
          : `linear-gradient(to bottom, #0F172A, #1E293B)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Status & Context Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 z-10 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
        {/* Left: Friend & Location Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition-all active:scale-95 border border-white/20"
            title="Zurück zur Auswahl"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'de' ? 'Freunde' : 'Friends'}</span>
          </button>

          <div className="h-6 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <span className="text-xl">{environment.emoji}</span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>{playmate.name}</span>
                <span className="text-indigo-400 font-extrabold">•</span>
                <span className="text-amber-300 font-bold">
                  {language === 'de' ? topic.nameDe : topic.nameEn}
                </span>
              </h3>
              <p className="text-[10px] text-slate-300 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                <span>{language === 'de' ? environment.nameDe : environment.nameEn}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Goal & Turn Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-bold">
          <span>{goalDef.emoji}</span>
          <span className="text-amber-200">{language === 'de' ? goalDef.titleDe : goalDef.titleEn}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">Runde {turnCount}</span>
        </div>

        {/* Right: Finish Adventure Button */}
        <button
          id="btn-finish-adventure"
          onClick={onFinishSession}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg transition-all active:scale-95 border border-amber-300 animate-bounce-subtle"
        >
          <Trophy className="w-4 h-4 fill-current" />
          <span>{language === 'de' ? 'Abenteuer beenden ⭐' : 'Finish Adventure ⭐'}</span>
        </button>
      </div>

      {/* PICTURE PROMPT SCENE BOX (If active) */}
      {pictureScene && (
        <div className="w-full max-w-2xl mx-auto my-2 z-10 rounded-2xl overflow-hidden bg-slate-900/85 backdrop-blur-md border-2 border-teal-400/60 shadow-xl flex items-center gap-3 p-3 animate-slide-up">
          <img
            src={pictureScene.imageUrl}
            alt={pictureScene.titleDe}
            referrerPolicy="no-referrer"
            className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-xl border border-white/20 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-teal-300">
              <ImageIcon className="w-3 h-3" />
              <span>{language === 'de' ? 'Bild-Abenteuer' : 'Picture Scene'}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate">
              {language === 'de' ? pictureScene.titleDe : pictureScene.titleEn}
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
              {language === 'de' ? pictureScene.descriptionDe : pictureScene.descriptionEn}
            </p>
          </div>
        </div>
      )}

      {/* REAL-WORLD ROLEPLAY SCENARIO BANNER (If active) */}
      {scenario && (
        <div className="w-full max-w-2xl mx-auto my-2 z-10 rounded-2xl bg-rose-950/80 backdrop-blur-md border-2 border-rose-400/60 shadow-xl p-3 flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{scenario.emoji}</span>
            <div>
              <div className="text-[10px] font-black uppercase text-rose-300">
                {language === 'de' ? 'Rollenspiel' : 'Roleplay Scenario'}
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                {language === 'de' ? scenario.titleDe : scenario.titleEn}
              </h4>
              <p className="text-[11px] text-rose-200 line-clamp-1">
                🎯 {language === 'de' ? scenario.childGoalDe : scenario.childGoalEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Center Stage: Prominent Lifelike 3D Avatar & Reactive Dialogue */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 z-10 max-w-3xl mx-auto w-full">
        {/* Playmate 3D Digital Human Avatar */}
        <div className="relative my-1 transform transition-transform duration-500">
          <AvatarDisplay
            playmate={playmate}
            emotion={currentEmotion}
            viseme={currentViseme}
            isSpeaking={isPlaymateSpeaking}
            isListening={listening}
            isThinking={voiceState === 'thinking'}
            size="hero"
          />
        </div>

        {/* Playmate Speech Bubble */}
        <div className="relative w-full bg-white/95 backdrop-blur-md text-slate-900 p-5 sm:p-6 rounded-3xl border-4 border-indigo-300 shadow-2xl text-center my-2 transition-all duration-300 animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-black text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{playmate.name}</span>
            </div>

            {/* Staged Thinking Status Indicator (>5s) */}
            {voiceState === 'thinking' && thinkingSeconds >= 5 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs animate-fade-in border border-amber-300">
                <span className="animate-spin text-[10px]">⏳</span>
                <span>{language === 'de' ? 'Einen Moment…' : 'One moment…'}</span>
              </div>
            )}
          </div>

          <p className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {voiceState === 'thinking' && thinkingSeconds >= 2 ? (
              <span className="text-slate-600 inline-flex items-center gap-2 italic">
                <span>{language === 'de' ? `${playmate.name} überlegt` : `${playmate.name} is thinking`}</span>
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
                </span>
              </span>
            ) : (
              `"${lastPlaymateMessage || (language === 'de' ? playmate.greetingDe : playmate.greetingEn)}"`
            )}
          </p>

          {/* Realtime Live Speech Transcript of Jedidiah */}
          {interimTranscript && (
            <div className="mt-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-sm font-bold animate-pulse">
              <span className="text-xs font-black text-indigo-600 uppercase mr-2">Jedidiah:</span>
              <span>"{interimTranscript}"</span>
            </div>
          )}
        </div>
      </div>

      {/* SENTENCE STARTERS & HELP ME SAY IT DRAWER */}
      {showStartersDrawer && (
        <div className="w-full max-w-3xl mx-auto mb-3 z-20 bg-slate-900/95 backdrop-blur-xl border-2 border-amber-400 rounded-3xl p-4 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm">
              <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{language === 'de' ? '💡 Hilf mir beim Anfang / Satz-Starter' : '💡 Help Me Say It / Starters'}</span>
            </div>
            <button
              onClick={() => setShowStartersDrawer(false)}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/10"
            >
              Schließen ✕
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
            {STARTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playChime('click');
                  setSelectedStarterCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedStarterCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                <span>{cat.emoji} </span>
                <span>{language === 'de' ? cat.nameDe : cat.nameEn}</span>
              </button>
            ))}
          </div>

          {/* Starter Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(language === 'de' ? activeCategory.startersDe : activeCategory.startersEn).map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectStarter(starter)}
                className="text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs sm:text-sm transition-all border border-white/15 active:scale-98"
              >
                "{starter}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Control Section: Large Microphone, Assist & No-Pressure Actions */}
      <div className="w-full flex flex-col items-center gap-3 z-10 bg-slate-950/75 backdrop-blur-md p-3 sm:p-5 rounded-3xl border border-white/10 shadow-2xl">
        {/* Large Tactile Microphone Button */}
        <div className="relative flex flex-col items-center">
          <MicrophoneControl
            voiceState={voiceState as any}
            onToggleListening={onToggleMic}
            onFinishSpeaking={onToggleMic}
            interimTranscript={interimTranscript}
            volume={volume}
            disabled={isPlaymateSpeaking}
            language={language}
          />
        </div>

        {/* Row 1: Quick Assist Buttons (Help Me Say It | Replay | Slow | Pause | Listen-Back) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* 💡 Hilf mir beim Anfang (Sentence Starters) */}
          <button
            id="btn-help-starters"
            onClick={() => {
              playChime('click');
              setShowStartersDrawer(!showStartersDrawer);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm border shadow-md transition-all active:scale-95 ${
              showStartersDrawer
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/40'
            }`}
            title="Satz-Anfänge anzeigen"
          >
            <Lightbulb className="w-4 h-4 fill-current" />
            <span>{language === 'de' ? '💡 Hilf mir beim Anfang' : '💡 Help me say it'}</span>
          </button>

          {/* 🔁 Noch einmal (Replay last statement) */}
          <button
            id="btn-repeat-speech"
            onClick={onRepeatLastMessage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs sm:text-sm border border-white/20 shadow-md transition-all active:scale-95"
            title="Satz noch einmal anhören"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>{language === 'de' ? 'Noch einmal 🔁' : 'Again 🔁'}</span>
          </button>

          {/* 👂 Meine Aufnahme hören (Listening-Back Mode if parent allowed) */}
          {listeningBackEnabled && (
            <button
              id="btn-listen-back"
              onClick={handlePlayOwnAudio}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-extrabold text-xs sm:text-sm border shadow-md transition-all active:scale-95 ${
                isPlayingOwnAudio
                  ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                  : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-400/40'
              }`}
              title="Meine eigene Aufnahme anhören"
            >
              <Volume2 className="w-4 h-4 text-purple-300" />
              <span>{language === 'de' ? '👂 Meine Aufnahme' : '👂 Listen to Me'}</span>
            </button>
          )}

          {/* 🐢 Langsamer (Slow Speech Toggle) */}
          <button
            id="btn-slow-speech"
            onClick={onToggleSlowVoice}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-extrabold text-xs sm:text-sm border shadow-md transition-all active:scale-95 ${
              isSlowVoice
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Langsamer sprechen"
          >
            <Snail className="w-4 h-4 text-emerald-300" />
            <span>{language === 'de' ? 'Langsamer 🐢' : 'Slower 🐢'}</span>
          </button>

          {/* ⏸ Pause / Play Toggle */}
          <button
            id="btn-pause-speech"
            onClick={onTogglePauseAudio}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-extrabold text-xs sm:text-sm border shadow-md transition-all active:scale-95 ${
              isAudioPaused
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Kurz pausieren"
          >
            {isAudioPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>
              {isAudioPaused
                ? language === 'de'
                  ? 'Weiter ▶️'
                  : 'Resume ▶️'
                : language === 'de'
                ? 'Pause ⏸️'
                : 'Pause ⏸️'}
            </span>
          </button>
        </div>

        {/* Row 2: No-Pressure Gentle Exit & Skip Options */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-white/10 w-full">
          {/* 🤷 Ich weiß nicht / Pass turn */}
          {onPassTurn && (
            <button
              onClick={() => {
                playChime('click');
                onPassTurn();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all"
            >
              <span>🤷</span>
              <span>{language === 'de' ? 'Ich weiß gerade nicht' : "I'm not sure"}</span>
            </button>
          )}

          {/* ⏩ Nächste Frage */}
          {onNextQuestion && (
            <button
              onClick={() => {
                playChime('click');
                onNextQuestion();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all"
            >
              <SkipForward className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === 'de' ? 'Andere Frage' : 'Next Question'}</span>
            </button>
          )}

          {/* 🔄 Thema wechseln */}
          {onChangeTopicRequest && (
            <button
              onClick={() => {
                playChime('click');
                onChangeTopicRequest();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'de' ? 'Thema wechseln' : 'Change Topic'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

