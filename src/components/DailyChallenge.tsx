import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../utils/authFetch';
import {
  Flame, BookOpen, MessageSquare, Mic, Target,
  ChevronRight, CheckCircle, Volume2, Trophy, X
} from 'lucide-react';

interface Vocabulary { word: string; translation: string; example: string; pronunciation: string; }
interface Phrase { english: string; portuguese: string; pronunciation_tip: string; context: string; }
interface DialogueLine { role: string; text: string; translation: string; }
interface QuizQuestion { question: string; options: string[]; correct: string; explanation: string; }

interface Challenge {
  id: string;
  theme: string;
  date: string;
  vocabulary: Vocabulary[];
  phrase: Phrase;
  dialogue: DialogueLine[];
  quiz: QuizQuestion[];
  voiceTopic: string;
  completedVocabulary: boolean;
  completedPhrase: boolean;
  completedDialogue: boolean;
  completedQuiz: boolean;
  completedVoice: boolean;
  xpAwarded: number;
  completedAt: string | null;
}

interface Props {
  user: any;
  onXpGain?: (xp: number, reason?: string) => void;
  compact?: boolean;
  onOpenFull?: () => void;
  setCurrentTab?: (tab: string) => void;
}

const SECTIONS = [
  { key: 'vocabulary',  label: 'Vocabulário',   icon: BookOpen,        xp: 20,  field: 'completedVocabulary', color: 'from-blue-600 to-blue-800',     border: 'border-blue-500/20' },
  { key: 'phrase',      label: 'Frase do Dia',  icon: MessageSquare,   xp: 15,  field: 'completedPhrase',     color: 'from-emerald-600 to-emerald-800', border: 'border-emerald-500/20' },
  { key: 'dialogue',    label: 'Diálogo Real',  icon: MessageSquare,   xp: 25,  field: 'completedDialogue',   color: 'from-violet-600 to-violet-800',  border: 'border-violet-500/20' },
  { key: 'quiz',        label: 'Quiz',           icon: Target,          xp: 30,  field: 'completedQuiz',       color: 'from-amber-600 to-amber-800',    border: 'border-amber-500/20' },
  { key: 'voice',       label: 'Voice Sparring', icon: Mic,             xp: 50,  field: 'completedVoice',      color: 'from-rose-600 to-rose-800',      border: 'border-rose-500/20' },
] as const;

const TOTAL_XP = SECTIONS.reduce((s, x) => s + x.xp, 0) + 100;

export default function DailyChallenge({ user, onXpGain, compact = false, onOpenFull, setCurrentTab }: Props) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers]     = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completing, setCompleting]       = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; xp: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { loadChallenge(); }, []);

  const loadChallenge = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/daily-challenge');
      if (res.ok) {
        const data = await res.json();
        setChallenge(data.challenge);
      } else {
        setError('Não foi possível carregar o desafio.');
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const completeSection = async (sectionKey: string) => {
    if (!challenge) return;
    const sec = SECTIONS.find(s => s.key === sectionKey)!;
    if (challenge[sec.field as keyof Challenge]) return;
    setCompleting(sectionKey);
    try {
      const res = await authFetch(`/api/daily-challenge/${challenge.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setChallenge(prev => prev ? {
          ...prev,
          [sec.field]: true,
          xpAwarded: prev.xpAwarded + data.xpGained,
          completedAt: data.allDone ? new Date().toISOString() : prev.completedAt,
        } : prev);
        const msg = data.allDone
          ? '🏆 Desafio completo! Bônus +100 XP!'
          : `${sec.label} concluído!`;
        const xp = data.allDone ? 100 : data.xpGained;
        setToast({ msg, xp });
        onXpGain?.(data.xpGained, `Daily Challenge: ${sec.label}`);
        setTimeout(() => setToast(null), 3500);
      }
    } catch {
      /* silently ignore */
    } finally {
      setCompleting(null);
    }
  };

  const speakText = (text: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const url = `/api/conversational/stream-tts?text=${encodeURIComponent(text)}&voice=thomas`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onerror = () => {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = 0.88;
        window.speechSynthesis.speak(u);
      }
    };
    audio.play().catch(() => {});
  };

  const completedCount = challenge
    ? SECTIONS.filter(s => challenge[s.field as keyof Challenge]).length : 0;
  const progress = Math.round((completedCount / 5) * 100);

  // ── COMPACT CARD (Dashboard) ──────────────────────────────────────────
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Desafio do Dia</p>
              <p className="text-sm font-bold text-white truncate">
                {loading ? 'Gerando com IA...' : error ? 'Erro ao carregar' : (challenge?.theme || '—')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20 flex-shrink-0">
            +{TOTAL_XP} XP
          </span>
        </div>

        {challenge && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{completedCount}/5 seções</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-1 flex-wrap">
              {SECTIONS.map(s => {
                const done = challenge[s.field as keyof Challenge] as boolean;
                return (
                  <span key={s.key} className={`text-xs px-2 py-0.5 rounded-full border ${
                    done
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {done ? '✓' : '○'} {s.label}
                  </span>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={onOpenFull || (() => window.history.pushState(null, '', '/daily-challenge'))}
          className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
        >
          {progress === 100 ? '🏆 Concluído hoje!' : loading ? 'Aguardando IA...' : 'Ver Desafio Completo'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── FULL PAGE ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <div>
          <p className="text-white font-bold text-lg">IA gerando seu desafio...</p>
          <p className="text-slate-400 text-sm mt-1">Personalizado para {user?.belt || 'Faixa Branca'} • Nível {user?.level || 1}</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <p className="text-slate-400">{error || 'Erro desconhecido.'}</p>
        <button onClick={loadChallenge} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">{toast.msg}</p>
            <p className="text-xs text-emerald-400">+{toast.xp} XP ganhos!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/30 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Desafio do Dia</span>
              {challenge.completedAt && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">✓ Completo</span>
              )}
            </div>
            <h1 className="text-xl font-black text-white mt-0.5">{challenge.theme}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(challenge.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{completedCount} de 5 seções concluídas</span>
            <span className="text-amber-400 font-bold">{challenge.xpAwarded} / {TOTAL_XP} XP</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => {
        const isDone    = challenge[section.field as keyof Challenge] as boolean;
        const isActive  = activeSection === section.key;
        const Icon      = section.icon;

        return (
          <div key={section.key} className={`border rounded-2xl overflow-hidden transition-all ${
            isDone ? 'border-emerald-500/25 bg-emerald-950/10' : 'border-slate-800 bg-slate-900/50'
          }`}>
            {/* Accordion header */}
            <button
              onClick={() => setActiveSection(isActive ? null : section.key)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center ${isDone ? 'opacity-60' : ''}`}>
                  {isDone
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <Icon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${isDone ? 'text-emerald-400' : 'text-white'}`}>{section.label}</p>
                  <p className="text-xs text-slate-400">+{section.xp} XP{isDone ? ' • Concluído ✓' : ''}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`} />
            </button>

            {/* Accordion body */}
            {isActive && (
              <div className="border-t border-slate-800 p-4 space-y-4">

                {/* ── VOCABULÁRIO ── */}
                {section.key === 'vocabulary' && (
                  <div className="space-y-3">
                    {(challenge.vocabulary || []).map((v, i) => (
                      <div key={i} className="bg-slate-800/50 rounded-xl p-3 flex gap-3 items-start">
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">{v.word}</span>
                            <span className="text-xs text-slate-400 font-mono">/{v.pronunciation}/</span>
                          </div>
                          <p className="text-sm text-amber-400 font-medium">{v.translation}</p>
                          <p className="text-xs text-slate-300 italic">"{v.example}"</p>
                        </div>
                        <button onClick={() => speakText(v.word)} className="text-slate-500 hover:text-amber-400 transition-colors mt-1 flex-shrink-0">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {!isDone && (
                      <button
                        onClick={() => completeSection('vocabulary')}
                        disabled={!!completing}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      >
                        {completing === 'vocabulary' ? 'Salvando...' : '✓ Estudei o vocabulário (+20 XP)'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── FRASE DO DIA ── */}
                {section.key === 'phrase' && (
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <p className="text-xl font-bold text-white leading-relaxed flex-1">"{challenge.phrase.english}"</p>
                        <button onClick={() => speakText(challenge.phrase.english)} className="text-slate-400 hover:text-amber-400 transition-colors mt-1 flex-shrink-0">
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-amber-400 font-medium">"{challenge.phrase.portuguese}"</p>
                      <div className="border-t border-slate-700 pt-3 space-y-1.5">
                        <p className="text-xs text-slate-300">
                          <span className="text-emerald-400 font-semibold">Como pronunciar: </span>
                          {challenge.phrase.pronunciation_tip}
                        </p>
                        <p className="text-xs text-slate-300">
                          <span className="text-blue-400 font-semibold">Quando usar: </span>
                          {challenge.phrase.context}
                        </p>
                      </div>
                    </div>
                    {!isDone && (
                      <button
                        onClick={() => completeSection('phrase')}
                        disabled={!!completing}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      >
                        {completing === 'phrase' ? 'Salvando...' : '✓ Pratiquei esta frase (+15 XP)'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── DIÁLOGO ── */}
                {section.key === 'dialogue' && (
                  <div className="space-y-3">
                    {(challenge.dialogue || []).map((line, i) => {
                      const isAthlete = line.role === 'Athlete';
                      return (
                        <div key={i} className={`flex gap-2.5 ${isAthlete ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                            isAthlete ? 'bg-amber-600 text-white' : 'bg-violet-600 text-white'
                          }`}>
                            {isAthlete ? 'A' : 'C'}
                          </div>
                          <div className={`flex-1 max-w-[82%] space-y-0.5 ${isAthlete ? 'items-end flex flex-col' : ''}`}>
                            <div className={`rounded-2xl px-3 py-2 inline-block ${
                              isAthlete ? 'bg-violet-900/40 rounded-tr-none' : 'bg-slate-800 rounded-tl-none'
                            }`}>
                              <div className="flex items-start gap-1.5">
                                <p className="text-sm text-white">{line.text}</p>
                                <button onClick={() => speakText(line.text)} className="text-slate-500 hover:text-amber-400 transition-colors flex-shrink-0 mt-0.5">
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 px-1">{line.translation}</p>
                          </div>
                        </div>
                      );
                    })}
                    {!isDone && (
                      <button
                        onClick={() => completeSection('dialogue')}
                        disabled={!!completing}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      >
                        {completing === 'dialogue' ? 'Salvando...' : '✓ Li o diálogo completo (+25 XP)'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── QUIZ ── */}
                {section.key === 'quiz' && (
                  <div className="space-y-4">
                    {(challenge.quiz || []).map((q, qi) => (
                      <div key={qi} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                        <p className="font-bold text-white text-sm">{qi + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const letter = opt[0];
                            const selected = quizAnswers[qi] === letter;
                            const correct  = letter === q.correct;
                            let cls = 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600';
                            if (quizSubmitted) {
                              if (correct) cls = 'border-emerald-500 bg-emerald-950/50 text-emerald-300';
                              else if (selected) cls = 'border-red-500 bg-red-950/50 text-red-300';
                            } else if (selected) {
                              cls = 'border-amber-500 bg-amber-950/30 text-amber-300';
                            }
                            return (
                              <button
                                key={oi}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: letter }))}
                                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${cls}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="text-xs text-slate-300 bg-slate-700/40 rounded-lg px-3 py-2">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length < (challenge.quiz?.length || 3)}
                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                      >
                        Verificar Respostas
                      </button>
                    ) : !isDone && (
                      <button
                        onClick={() => completeSection('quiz')}
                        disabled={!!completing}
                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      >
                        {completing === 'quiz' ? 'Salvando...' : '✓ Concluir Quiz (+30 XP)'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── VOICE SPARRING ── */}
                {section.key === 'voice' && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-rose-950/40 to-pink-950/30 border border-rose-500/20 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-rose-400" />
                        <span className="text-sm font-bold text-white">Cenário de Hoje</span>
                      </div>
                      <p className="text-rose-200 font-medium text-sm">"{challenge.voiceTopic}"</p>
                      <p className="text-xs text-slate-400">
                        Use este cenário no <span className="text-amber-400 font-semibold">Voice Sparring BJJ</span> com qualquer personagem.
                        O tema é baseado em <span className="text-amber-400">{challenge.theme}</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (setCurrentTab) setCurrentTab('pvp');
                        else window.history.pushState(null, '', '/pvp');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Mic className="w-4 h-4" /> Ir para Voice Sparring
                    </button>
                    {!challenge.completedVoice && (
                      <button
                        onClick={() => completeSection('voice')}
                        disabled={!!completing}
                        className="w-full py-3 border border-rose-500/30 text-rose-400 hover:bg-rose-950/20 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      >
                        {completing === 'voice' ? 'Salvando...' : '✓ Completei o Voice Sparring (+50 XP)'}
                      </button>
                    )}
                    {challenge.completedVoice && (
                      <div className="w-full py-3 border border-rose-500/20 text-rose-400/60 rounded-xl font-bold text-sm text-center">
                        ✓ Voice Sparring Completo!
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}

      {/* Bonus banner */}
      <div className="bg-gradient-to-br from-yellow-950/30 to-amber-950/20 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">Complete tudo e ganhe +100 XP bônus!</p>
          <p className="text-xs text-slate-400 mt-0.5">Total: até {TOTAL_XP} XP por dia • Aumenta sua ofensiva de streak</p>
        </div>
        {challenge.completedAt && <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
      </div>
    </div>
  );
}
