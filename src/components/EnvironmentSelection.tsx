import React from 'react';
import { ENVIRONMENTS } from '../data/environments';
import { Language, PlayEnvironment } from '../types';
import { Check, ArrowRight } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface EnvironmentSelectionProps {
  language: Language;
  selectedEnvironment: PlayEnvironment;
  onSelectEnvironment: (env: PlayEnvironment) => void;
  onContinue: () => void;
}

export const EnvironmentSelection: React.FC<EnvironmentSelectionProps> = ({
  language,
  selectedEnvironment,
  onSelectEnvironment,
  onContinue,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in select-none">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'de' ? 'Wo wollen wir heute spielen?' : 'Where should we hang out today?'}
        </h2>
        <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-2xl mx-auto">
          {language === 'de'
            ? 'Die Umgebung beeinflusst euer Gespräch – vom Flutlicht-Stadion bis zum geheimen Baumhaus!'
            : 'The setting shapes your conversation – from a floodlit stadium to a secret treehouse!'}
        </p>
      </div>

      {/* Grid of Environments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {ENVIRONMENTS.map((env) => {
          const isSelected = selectedEnvironment.id === env.id;

          return (
            <div
              key={env.id}
              id={`env-card-${env.id}`}
              onClick={() => {
                playChime('click');
                onSelectEnvironment(env);
              }}
              className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 transform active:scale-98 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-2 border-emerald-600 shadow-md ring-4 ring-emerald-500/15 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Selected Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl sm:text-5xl">{env.emoji}</span>
                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Title & Context */}
              <div className="my-2">
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                  {language === 'de' ? env.nameDe : env.nameEn}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {language === 'de' ? env.promptContextDe : env.promptContextEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center mt-6">
        <button
          id="btn-confirm-environment"
          onClick={() => {
            playChime('click');
            onContinue();
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base shadow-md transition-all"
        >
          <span>
            {language === 'de'
              ? `Im ${selectedEnvironment.nameDe} loslegen`
              : `Go to ${selectedEnvironment.nameEn}`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
