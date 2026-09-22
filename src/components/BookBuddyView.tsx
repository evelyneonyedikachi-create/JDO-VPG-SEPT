import React, { useState } from 'react';
import { Language, Playmate, BookInfo } from '../types';
import { BookOpen, Search, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Mic } from 'lucide-react';
import { playChime } from '../utils/soundEffects';

interface BookBuddyViewProps {
  language: Language;
  playmate: Playmate;
  onStartBookChat: (book: BookInfo, initialQuestion: string) => void;
  onBack: () => void;
}

export const BookBuddyView: React.FC<BookBuddyViewProps> = ({
  language,
  playmate,
  onStartBookChat,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const handleSearchBook = async (customQuery?: string) => {
    const q = (customQuery || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    playChime('click');

    try {
      const res = await fetch('/api/book-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language }),
      });
      const data = await res.json();
      setSelectedBook(data);
    } catch (e) {
      console.error(e);
      setSelectedBook({
        title: q,
        author: 'Lieblingsautor',
        summary: 'Ein tolles Buch zum Lesen und Erzählen!',
        levelQuestions: [
          'Level 1: Worum geht es in deinem Buch in einem Satz?',
          'Level 2: Was ist ganz am Anfang der Geschichte passiert?',
          'Level 3: Warum magst du deine Lieblingsfigur so gern?',
          'Level 4: Kannst du mir die spannendste Stelle erzählen?',
          'Level 5: Was würdest du am Ende der Geschichte verändern?',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleBooks = [
    { title: 'Die drei ??? Kids', query: 'Die drei Fragezeichen Kids' },
    { title: 'Harry Potter', query: 'Harry Potter' },
    { title: 'Gregs Tagebuch', query: 'Gregs Tagebuch Diary of a Wimpy Kid' },
    { title: 'Die Schule der magischen Tiere', query: 'Die Schule der magischen Tiere' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-fade-in select-none">
      {/* Header & Back */}
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

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase">
          <BookOpen className="w-4 h-4" />
          <span>Book Buddy</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <span>📚</span>
          <span>{language === 'de' ? 'Dein Bücher-Freund' : 'Your Book Buddy'}</span>
        </h2>
        <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-xl mx-auto">
          {language === 'de'
            ? `Gib den Titel oder Autor deines Buchs ein – und sprich mit ${playmate.name} darüber!`
            : `Enter your book title or author – and talk about it with ${playmate.name}!`}{' '}
        </p>
      </div>

      {/* Book Input & Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              id="input-book-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchBook()}
              placeholder={
                language === 'de'
                  ? 'Buchtitel, Autor oder ISBN eingeben...'
                  : 'Enter book title, author, or ISBN...'
              }
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <button
            id="btn-search-book"
            onClick={() => handleSearchBook()}
            disabled={isLoading || !searchQuery.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold transition-all shadow-sm"
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
            <span>{language === 'de' ? 'Buch finden' : 'Find Book'}</span>
          </button>
        </div>

        {/* Quick Sample Suggestions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">
            {language === 'de' ? 'Oder wähle ein beliebtes Buch:' : 'Or pick a popular book:'}
          </span>
          {sampleBooks.map((b, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(b.title);
                handleSearchBook(b.query);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition-all active:scale-95"
            >
              {b.title}
            </button>
          ))}
        </div>
      </div>

      {/* Book Metadata & 5-Level Challenge Display */}
      {selectedBook && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Book Cover or Badge */}
            {selectedBook.coverUrl ? (
              <img
                src={selectedBook.coverUrl}
                alt={selectedBook.title}
                className="w-32 h-44 object-cover rounded-xl shadow-sm border border-slate-200 mx-auto md:mx-0"
              />
            ) : (
              <div className="w-32 h-44 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center text-indigo-700 p-3 text-center mx-auto md:mx-0 shadow-xs">
                <BookOpen className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="text-xs font-bold line-clamp-3">{selectedBook.title}</span>
              </div>
            )}

            {/* Book Details */}
            <div className="flex-1 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {language === 'de' ? 'Bereit zum Gespräch' : 'Ready to discuss'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {selectedBook.title}
              </h3>
              <p className="text-sm font-semibold text-slate-500 mb-3">
                {language === 'de' ? `Autor: ${selectedBook.author}` : `Author: ${selectedBook.author}`}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {selectedBook.summary}
              </p>
            </div>
          </div>

          {/* 5-Level Challenge Roadmap */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>{language === 'de' ? 'Die 5-Stufen Buch-Challenge' : '5-Level Book Challenge'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(selectedBook.levelQuestions || []).map((q: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2.5"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <p className="font-medium pt-0.5 leading-snug">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-8 flex justify-center">
            <button
              id="btn-start-book-chat"
              onClick={() => {
                playChime('click');
                const initialQ = selectedBook.levelQuestions?.[0] || 'Worum geht es in deinem Buch?';
                onStartBookChat(
                  {
                    title: selectedBook.title,
                    author: selectedBook.author,
                    summary: selectedBook.summary,
                    coverUrl: selectedBook.coverUrl,
                  },
                  initialQ
                );
              }}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base shadow-md transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>
                {language === 'de'
                  ? `Buch-Gespräch mit ${playmate.name} starten 🎙️`
                  : `Start Book Chat with ${playmate.name} 🎙️`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
