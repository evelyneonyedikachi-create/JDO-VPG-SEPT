import React from 'react';
import { PLAYMATES } from '../data/characters';
import { Language, Playmate } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { Volume2, Check, ArrowRight } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface PlaymateSelectionProps {
  language: Language;
  selectedPlaymate: Playmate;
  onSelectPlaymate: (playmate: Playmate) => void;
  onPreviewVoice?: (playmate: Playmate) => void;
  onContinue: () => void;
}

export const PlaymateSelection: React.FC<PlaymateSelectionProps> = ({
  language,
  selectedPlaymate,
  onSelectPlaymate,
  onPreviewVoice,
  onContinue,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in select-none">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'de' ? 'Mit wem möchtest du heute sprechen?' : 'Who do you want to talk to?'}
        </h2>
        <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-2xl mx-auto">
          {language === 'de'
            ? 'Wähle deinen Gesprächs-Freund. Jeder hat andere spannende Interessen!'
            : 'Choose your friendly AI playmate. Each has their own personality and favorite topics!'}
        </p>
      </div>

      {/* Grid of 6 Playmates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
        {PLAYMATES.map((char) => {
          const isSelected = selectedPlaymate.id === char.id;

          return (
            <div
              key={char.id}
              id={`playmate-card-${char.id}`}
              onClick={() => {
                playChime('click');
                onSelectPlaymate(char);
              }}
              className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 transform active:scale-98 flex flex-col items-center text-center ${
                isSelected
                  ? 'bg-white border-2 border-indigo-600 shadow-md ring-4 ring-indigo-500/15 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm font-bold">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Character Avatar */}
              <div className="my-2">
                <AvatarDisplay
                  playmate={char}
                  emotion={isSelected ? 'happy' : 'encouraging'}
                  viseme={isSelected ? 'smile' : 'closed'}
                  isSpeaking={false}
                  isListening={false}
                  size="md"
                />
              </div>

              {/* Name & Tagline */}
              <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
                {char.name}
              </h3>
              <p className="text-sm font-semibold text-indigo-600 my-1">
                {language === 'de' ? char.taglineDe : char.taglineEn}
              </p>

              {/* Bio */}
              <p className="text-xs text-slate-500 mt-1 mb-3 line-clamp-2 px-2 leading-relaxed">
                {language === 'de' ? char.descriptionDe : char.descriptionEn}
              </p>

              {/* Interests Tags */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-auto pt-2">
                {(language === 'de' ? char.interestsDe : char.interestsEn).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Voice Preview Button */}
              {onPreviewVoice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playChime('click');
                    onPreviewVoice(char);
                  }}
                  className="mt-3.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-sky-700 border border-sky-200 transition-all"
                  title={language === 'de' ? 'Stimme anhören' : 'Hear voice'}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'Stimme hören' : 'Preview voice'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="flex justify-center mt-6">
        <button
          id="btn-confirm-playmate"
          onClick={() => {
            playChime('click');
            onContinue();
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base shadow-md transition-all"
        >
          <span>
            {language === 'de' ? `Mit ${selectedPlaymate.name} spielen` : `Talk with ${selectedPlaymate.name}`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
