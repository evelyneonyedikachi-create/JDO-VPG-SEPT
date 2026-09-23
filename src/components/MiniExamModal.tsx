import React, { useState, useEffect } from 'react';
import { LernwortItem, MiniExamQuestion, MiniExamResult } from '../types/lernwoerter';
import { generateMiniExam } from '../services/exerciseEngine';
import { playChime } from '../utils/soundEffects';
import { speakGerman } from '../services/speechSynthesisService';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Pause,
  Play,
  X,
  Star,
  SkipForward,
} from 'lucide-react';

interface ExamAnswerItem {
  answer: string;
  isCorrect: boolean;
  wordClean: string;
}

interface MiniExamModalProps {
  words: LernwortItem[];
  onClose: () => void;
  onFinishExam: (result: MiniExamResult) => void;
  initialPausedExam?: {
    questionIndex: number;
    answers: Record<string, { answer: string; isCorrect: boolean; wordClean?: string }>;
  } | null;
  onSavePauseState?: (state: {
    questionIndex: number;
    answers: Record<string, { answer: string; isCorrect: boolean; wordClean?: string }>;
  }) => void;
}

export const MiniExamModal: React.FC<MiniExamModalProps> = ({
  words,
  onClose,
  onFinishExam,
  initialPausedExam,
  onSavePauseState,
}) => {
  const [questions, setQuestions] = useState<MiniExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(initialPausedExam?.questionIndex || 0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [hintActive, setHintActive] = useState<boolean>(false);
  const [status, setStatus] = useState<'answering' | 'submitted'>('answering');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, ExamAnswerItem>>(() => {
    if (initialPausedExam?.answers) {
      const recovered: Record<string, ExamAnswerItem> = {};
      const entries = Object.entries(initialPausedExam.answers) as [string, { answer: string; isCorrect: boolean; wordClean?: string }][];
      entries.forEach(([k, v]) => {
        recovered[k] = {
          answer: v.answer || '',
          isCorrect: Boolean(v.isCorrect),
          wordClean: v.wordClean || '',
        };
      });
      return recovered;
    }
    return {};
  });

  useEffect(() => {
    const list = generateMiniExam(words);
    setQuestions(list);
  }, [words]);

  const currentQ = questions[currentIndex];

  const handleSpeak = (text: string) => {
    playChime('click');
    speakGerman(text, { avatarId: 'ben' });
  };

  const handleSubmitAnswer = () => {
    if (!currentQ || status === 'submitted') return;

    const answer = currentQ.options ? selectedOption : textInput.trim();
    if (!answer) {
      alert('Bitte wähle oder tippe zuerst eine Antwort aus!');
      return;
    }

    const cleanAns = answer.toLowerCase().trim();
    const cleanCorrect = currentQ.correctAnswer.toLowerCase().trim();
    const isCorrect = cleanAns === cleanCorrect;

    if (isCorrect) {
      playChime('success');
    } else {
      playChime('whistle');
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        answer,
        isCorrect,
        wordClean: currentQ.wordClean,
      },
    }));

    setStatus('submitted');
  };

  const handleNext = () => {
    playChime('click');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption('');
      setTextInput('');
      setHintActive(false);
      setStatus('answering');
    } else {
      // Finish Exam
      playChime('cheer');
      setIsCompleted(true);

      const answersList = Object.values(userAnswers) as ExamAnswerItem[];
      const totalCorrect = answersList.filter((a) => a.isCorrect).length;

      const correctWords = answersList
        .filter((v) => v.isCorrect)
        .map((v) => v.wordClean);
      const wrongWords = answersList
        .filter((v) => !v.isCorrect)
        .map((v) => v.wordClean);

      const result: MiniExamResult = {
        id: `exam_${Date.now()}`,
        date: new Date().toLocaleDateString('de-DE'),
        timestamp: Date.now(),
        score: totalCorrect,
        totalQuestions: questions.length || 20,
        percentage: Math.round((totalCorrect / (questions.length || 20)) * 100),
        passed: totalCorrect >= 14,
        correctWords: Array.from(new Set(correctWords)),
        wrongWords: Array.from(new Set(wrongWords)),
      };

      onFinishExam(result);
    }
  };

  const handlePauseAndLeave = () => {
    playChime('click');
    if (onSavePauseState) {
      onSavePauseState({
        questionIndex: currentIndex,
        answers: userAnswers,
      });
    }
    alert('Deine Mini-Prüfung wurde pausiert! Du kannst sie jederzeit fortsetzen.');
    onClose();
  };

  const handleSkipQuestion = () => {
    playChime('click');
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        answer: '(Übersprungen)',
        isCorrect: false,
        wordClean: currentQ.wordClean,
      },
    }));
    handleNext();
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  const scoreCount = (Object.values(userAnswers) as ExamAnswerItem[]).filter((a) => a.isCorrect).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-4 sm:p-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🏅
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>4-Wochen-Zyklus Abschluss</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                Große Lernwörter Mini-Prüfung
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                onClick={handlePauseAndLeave}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-white/20"
                title="Prüfung pausieren und später weitermachen"
              >
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Pausieren & später fortsetzen</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {!isCompleted && (
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-indigo-700 uppercase tracking-wider">
                Frage {currentIndex + 1} von {questions.length}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                ({scoreCount} richtig bisher)
              </span>
            </div>

            <div className="flex-1 max-w-xs h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {isCompleted ? (
            /* COMPLETED SUMMARY SCREEN */
            <div className="text-center space-y-6 py-6">
              <div className="w-24 h-24 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-6xl mx-auto shadow-lg animate-bounce-subtle">
                🏆
              </div>

              <div className="space-y-2">
                <h4 className="text-3xl font-black text-slate-900">
                  Prüfung erfolgreich beendet!
                </h4>
                <p className="text-slate-600 font-semibold text-lg max-w-md mx-auto">
                  Du hast die 20 Fragen aus den Lernwörtern der letzten 4 Wochen gemeistert.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                  <div className="text-3xl font-black text-indigo-700">
                    {scoreCount} / {questions.length}
                  </div>
                  <div className="text-xs font-bold uppercase text-indigo-900 mt-1">
                    Richtige Antworten
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-3xl font-black text-emerald-700">
                    {Math.round((scoreCount / questions.length) * 100)}%
                  </div>
                  <div className="text-xs font-bold uppercase text-emerald-900 mt-1">
                    Erfolgsquote
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
                  <div className="text-3xl font-black text-amber-700">
                    {scoreCount >= 18 ? 'Sehr gut! 🌟' : scoreCount >= 14 ? 'Gut! 👍' : 'Weiter so! 💪'}
                  </div>
                  <div className="text-xs font-bold uppercase text-amber-900 mt-1">
                    Bewertung
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => {
                    playChime('click');
                    setCurrentIndex(0);
                    setUserAnswers({});
                    setStatus('answering');
                    setIsCompleted(false);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center gap-2 border border-slate-300"
                >
                  <RotateCcw className="w-5 h-5 text-indigo-600" />
                  <span>Prüfung wiederholen</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl active:scale-95"
                >
                  Zurück zum Dashboard ✨
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE QUESTION CARD */
            currentQ && (
              <div className="space-y-6">
                {/* Visual / Emoji Header */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-slate-50 border border-indigo-100">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-indigo-200 shadow-sm flex items-center justify-center text-4xl shrink-0 select-none">
                    {currentQ.emoji || '📝'}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black uppercase text-indigo-800 tracking-wider">
                      Aufgabenstellung
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {currentQ.prompt}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleSpeak(`${currentQ.prompt}. ${currentQ.sentenceWithBlank}`)}
                    className="p-3 rounded-2xl bg-white hover:bg-indigo-100 text-indigo-600 border border-indigo-200 shadow-xs transition-colors shrink-0"
                    title="Frage vorlesen"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>

                {/* THE SENTENCE WITH BLANK */}
                <div className="p-6 rounded-3xl bg-slate-50 border-2 border-indigo-200/80 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Satz zum Ergänzen
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-relaxed">
                    {currentQ.sentenceWithBlank}
                  </div>
                </div>

                {/* OPTIONS SELECTION OR INPUT */}
                {currentQ.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={oIdx}
                          disabled={status === 'submitted'}
                          onClick={() => {
                            playChime('click');
                            setSelectedOption(opt);
                          }}
                          className={`p-5 rounded-2xl font-black text-lg sm:text-xl transition-all border-2 text-center shadow-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102'
                              : 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      disabled={status === 'submitted'}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmitAnswer();
                      }}
                      placeholder="Deine Antwort hier tippen..."
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                )}

                {/* FEEDBACK BANNER AFTER SUBMISSION */}
                {status === 'submitted' && (
                  <div
                    className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                      userAnswers[currentQ.id]?.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div className="text-3xl shrink-0">
                      {userAnswers[currentQ.id]?.isCorrect ? '🎉' : '💡'}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-black">
                        {userAnswers[currentQ.id]?.isCorrect
                          ? 'Super! Richtig gelöst!'
                          : `Richtige Antwort: „${currentQ.correctAnswer}“`}
                      </div>
                      <p className="text-sm font-semibold">{currentQ.explanation}</p>
                    </div>
                  </div>
                )}

                {/* HINT BANNER */}
                {hintActive && status === 'answering' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-sm font-bold">
                      {currentQ.hint || 'Achte genau auf den Satzbau und die Wortart.'}
                    </span>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    {status === 'answering' && (
                      <>
                        <button
                          onClick={() => setHintActive(true)}
                          className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1.5 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-amber-500" />
                          <span>Tipp anzeigen</span>
                        </button>

                        <button
                          onClick={handleSkipQuestion}
                          className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-1.5 transition-colors"
                        >
                          <SkipForward className="w-4 h-4 text-slate-400" />
                          <span>Überspringen</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    {status === 'answering' ? (
                      <button
                        onClick={handleSubmitAnswer}
                        className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all"
                      >
                        Antwort prüfen ✨
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg active:scale-95 flex items-center gap-2 transition-all"
                      >
                        <span>
                          {currentIndex < questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
