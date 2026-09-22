import React from 'react';
import { TOPICS } from '../data/topics';
import { Language, ParentSettings, TopicCategory } from '../types';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface TopicSelectionProps {
  language: Language;
  selectedTopic: TopicCategory;
  parentSettings: ParentSettings;
  onSelectTopic: (topic: TopicCategory, subModeId?: string) => void;
  onContinue: () => void;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({
  language,
  selectedTopic,
  parentSettings,
  onSelectTopic,
  onContinue,
}) => {
  // Filter topics based on parent enabled settings
  const visibleTopics = TOPICS.filter((t) => parentSettings.enabledTopics[t.id] !== false);

  // Sort high priority topics to front
  const sortedTopics = [...visibleTopics].sort((a, b) => {
    const pA = parentSettings.topicPriorities[a.id] === 'high' ? 1 : 0;
    const pB = parentSettings.topicPriorities[b.id] === 'high' ? 1 : 0;
    return pB - pA;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in select-none">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'de' ? 'Worüber möchtest du heute sprechen?' : 'What do you feel like talking about?'}
        </h2>
        <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-2xl mx-auto">
          {language === 'de'
            ? 'Wähle ein Thema aus, das dir richtig Spaß macht. Du kannst alles erzählen!'
            : 'Pick any topic you love. You can share stories, ideas, and games!'}
        </p>
      </div>

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {sortedTopics.map((topic) => {
          const isSelected = selectedTopic.id === topic.id;
          const isHighPriority = parentSettings.topicPriorities[topic.id] === 'high';

          return (
            <div
              key={topic.id}
              id={`topic-card-${topic.id}`}
              onClick={() => {
                playChime('click');
                onSelectTopic(topic);
              }}
              className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 transform active:scale-98 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-2 border-indigo-600 shadow-md ring-4 ring-indigo-500/15 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Priority or Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl sm:text-5xl">{topic.emoji}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : isHighPriority
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {topic.badge}
                </span>
              </div>

              {/* Topic Name & Description */}
              <div className="my-2">
                <h3 className="text-xl font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <span>{language === 'de' ? topic.nameDe : topic.nameEn}</span>
                  {isSelected && <Check className="w-5 h-5 text-indigo-600 ml-auto" />}
                </h3>
                <p className="text-sm line-clamp-2 text-slate-500 leading-relaxed">
                  {language === 'de' ? topic.descriptionDe : topic.descriptionEn}
                </p>
              </div>

              {/* Sub-Activities Pills */}
              {topic.subModes && topic.subModes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {topic.subModes.slice(0, 3).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        playChime('click');
                        onSelectTopic(topic, sub.id);
                        onContinue();
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      {language === 'de' ? sub.nameDe : sub.nameEn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-6">
        <button
          id="btn-start-topic"
          onClick={() => {
            playChime('click');
            onContinue();
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base shadow-md transition-all"
        >
          <span>
            {language === 'de'
              ? `Mit ${selectedTopic.nameDe} starten`
              : `Start talking about ${selectedTopic.nameEn}`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
