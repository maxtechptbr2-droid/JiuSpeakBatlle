/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  Check, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Play, 
  ChevronRight, 
  Lock, 
  QrCode, 
  Copy,
  CheckCircle,
  Brain
} from 'lucide-react';
import { UserProfile, Course, Lesson, QuizQuestion } from '../types';

interface LessonsProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Lessons({ 
  user, 
  courses, 
  updateUser, 
  onAddAuditLog, 
  addXp, 
  addCoins, 
  showToast 
}: LessonsProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [hasCompletedLesson, setHasCompletedLesson] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  // checkout modal states
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'qr' | 'success'>('details');

  const handleEnroll = (course: Course) => {
    const enrolled = user.enrolledCourses.includes(course.id);
    
    if (!enrolled && course.priceBRL > 0) {
      // Must buy premium course
      setCheckoutCourse(course);
      setCheckoutStep('details');
      return;
    }

    // Free or already purchased: go inside
    setSelectedCourse(course);
    setActiveLesson(null);
    setHasCompletedLesson(false);
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setHasCompletedLesson(false);
    setCorrectAnswersCount(0);
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    
    if (activeLesson) {
      const isCorrect = selectedAnswer === activeLesson.quiz[currentQuestionIndex].correctOptionIndex;
      if (isCorrect) {
        setCorrectAnswersCount(prev => prev + 1);
        showToast("Resposta Correta! Oss!", "success");
      } else {
        showToast("Resposta errada. Leia a explicação e tente entender as forças de apoio.", "error");
      }
    }
  };

  const handleNextQuestion = () => {
    if (!activeLesson) return;
    
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < activeLesson.quiz.length) {
      setCurrentQuestionIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Completion page
      setHasCompletedLesson(true);
      
      // Calculate reward bonuses
      const earnedXp = 100 + (correctAnswersCount * 40);
      const earnedCoins = 50 + (correctAnswersCount * 20);

      addXp(earnedXp, `Conclusão da lição: ${activeLesson.title}`);
      addCoins(earnedCoins, `Prêmio de estudo: ${activeLesson.title}`);
      
      // Increment user streak active calendar
      const currentStreak = user.streak + 1;
      updateUser({ 
        streak: currentStreak,
        lastActiveDate: new Date().toISOString()
      });

      // Log in Audits
      onAddAuditLog(
        'lesson_completed', 
        `Atleta concluiu lição "${activeLesson.title}" respondendo ${correctAnswersCount}/${activeLesson.quiz.length} corretas. Streak subiu para ${currentStreak} dias.`,
        undefined,
        earnedCoins
      );

      showToast(`Lição Concluída! Você ganhou +${earnedXp} XP e +${earnedCoins} Kimono Coins!`, "success");
    }
  };

  // Simulates purchasing the course via PIX Code
  const handleConfirmPixPayment = () => {
    if (!checkoutCourse) return;
    setCheckoutStep('success');
    
    // Unlock course
    const newEnrolled = [...user.enrolledCourses, checkoutCourse.id];
    updateUser({
      enrolledCourses: newEnrolled
    });

    onAddAuditLog(
      'pix_deposit',
      `Inscrição Premium Course: Adquiriu o curso "${checkoutCourse.title}" via depósito Pix.`,
      checkoutCourse.priceBRL
    );

    showToast(`Curso "${checkoutCourse.title}" foi desbloqueado com sucesso!`, 'success');
  };

  const copyPixCode = () => {
    setPixCopiado(true);
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136e0886bd6-86de-4fbf-862d-a1c2293816jiuspeakqrcodepixprod520400005303986540549.905802BR5925JiuSpeak%20Saas%20Gamificado6009SAO%20PAULO62070503***6304ED24");
    showToast("Código Copilado! Insira no aplicativo do seu Banco para simular.", "info");
    setTimeout(() => {
      setPixCopiado(false);
    }, 2000);
  };

  return (
    <div className="space-y-6" id="bjj-lessons">
      
      {/* Active Study Lesson Dashboard */}
      {activeLesson ? (
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs text-violet-400 font-mono font-bold uppercase block mb-1">
                AULA ATIVA • {selectedCourse?.title}
              </span>
              <h3 className="text-xl font-display font-extrabold text-white">{activeLesson.title}</h3>
            </div>
            <button
              onClick={() => setActiveLesson(null)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-350 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              ⬅ Voltar ao curso
            </button>
          </div>

          {!hasCompletedLesson ? (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Question UI and interactive checkboxes (Col span 2) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* ProgressBar indicator */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1.5">
                    <span>Progresso do Questionário</span>
                    <span>Questão {currentQuestionIndex + 1} de {activeLesson.quiz.length}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-350"
                      style={{ width: `${((currentQuestionIndex) / activeLesson.quiz.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* The actual question */}
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                  <span className="inline-block bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase mb-3">
                    Estudo de Caso Teórico
                  </span>
                  <h4 className="text-base font-semibold text-slate-200">
                    {activeLesson.quiz[currentQuestionIndex].question}
                  </h4>
                </div>

                {/* Answers list choice */}
                <div className="space-y-2.5">
                  {activeLesson.quiz[currentQuestionIndex].options.map((opt, sIdx) => {
                    const isSelected = selectedAnswer === sIdx;
                    const correctIdx = activeLesson.quiz[currentQuestionIndex].correctOptionIndex;
                    
                    let cardStyle = 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                    if (isSelected) {
                      cardStyle = 'bg-violet-950/20 border-violet-500 text-violet-200 ring-1 ring-violet-500/20';
                    }
                    if (isAnswered) {
                      if (sIdx === correctIdx) {
                        cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/10';
                      } else if (isSelected && sIdx !== correctIdx) {
                        cardStyle = 'bg-red-950/40 border-red-500 text-red-200 ring-2 ring-red-500/10';
                      } else {
                        cardStyle = 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={sIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectAnswer(sIdx)}
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left text-xs transition-all cursor-pointer select-none ${cardStyle}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] ${
                          isSelected 
                            ? 'bg-violet-500 text-slate-950' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + sIdx)}
                        </div>
                        <span className="flex-1 font-medium">{opt}</span>
                        {isAnswered && sIdx === correctIdx && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation text showing after submit */}
                {isAnswered && (
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 animate-fadeIn">
                    <h5 className="font-display font-bold text-xs text-slate-300 flex items-center gap-1.5 mb-11">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      Análise Tática do Mestre (Explicação)
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                      {activeLesson.quiz[currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Submitting controller button */}
                <div className="pt-2 flex justify-end">
                  {!isAnswered ? (
                    <button
                      disabled={selectedAnswer === null}
                      onClick={handleSubmitAnswer}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                        selectedAnswer !== null
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-505 text-white active:scale-95 shadow-lg shadow-violet-500/10'
                          : 'bg-slate-800 text-slate-500 border border-slate-800/80 cursor-not-allowed'
                      }`}
                    >
                      ✔ Registrar Resposta
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl uppercase tracking-wide transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                    >
                      {currentQuestionIndex + 1 < activeLesson.quiz.length ? 'Próxima Questão ➡️' : 'Concluir Aula 🎉'}
                    </button>
                  )}
                </div>

              </div>

              {/* Right Side AI Coach Instructions Advisor Block */}
              <div className="space-y-4">
                
                {/* Sensei Avatar widget */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 relative">
                  <div className="absolute top-3 right-3 text-yellow-500 animate-pulse text-xs font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-yellow-500" /> AI Coach
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-2xl shadow-md border border-violet-500">
                      👴
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-slate-200">Sensei JiuSpeak</h4>
                      <span className="text-[9px] text-slate-500 font-mono">Orientador Oficial da Escola</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 italic bg-slate-950/50 p-3 rounded-lg border border-slate-800 leading-relaxed font-semibold">
                    {activeLesson.quiz[currentQuestionIndex].avatarInstruction || '"Sempre postura e calma. Toda pegada oponente que você ignora, vira um ponto de ataque mais à frente."'}
                  </p>

                  <div className="mt-4 text-[10px] text-slate-500 font-mono space-y-1 bg-slate-950/20 p-2.5 rounded border border-slate-850">
                    <div>• Dificuldade: Moderada</div>
                    <div>• Recompensa recomendada: +100 XP</div>
                    <div>• Foco Técnico: Defesa de Guarda</div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 mb-2 font-bold text-slate-350">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span>Benefício da Ofensiva</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mb-1">
                    Ao terminar esta lição hoje, você prorroga sua ofensiva diária por mais 24 horas, acumulando Kimono Coins cruciais de bonificação tática!
                  </p>
                </div>

              </div>

            </div>
          ) : (
            /* Lesson Accomplished page */
            <div className="py-12 text-center max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-4xl mx-auto float-effect">
                🥋
              </div>
              
              <div className="space-y-1">
                <h4 className="text-2xl font-display font-extrabold text-white">Excelente Trabalho, Oss!</h4>
                <p className="text-xs text-slate-400">
                  Você dominou o conteúdo de <strong>{activeLesson.title}</strong> com {correctAnswersCount} acertos táticos.
                </p>
              </div>

              {/* Status metrics summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-center">
                  <span className="block text-[10px] text-slate-500 font-mono">XP CONQUISTADO</span>
                  <span className="text-xl font-bold text-violet-400">+{100 + (correctAnswersCount * 40)} XP</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-slate-500 font-mono">KIMONO COINS</span>
                  <span className="text-xl font-bold text-yellow-500">+{50 + (correctAnswersCount * 20)} KC</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveLesson(null)}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-md shadow-violet-500/10 cursor-pointer"
                >
                  Continuar Aprendizado
                </button>
              </div>
            </div>
          )}

        </div>
      ) : selectedCourse ? (
        
        /* Inside Course Lessons syllabus view */
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-805">
            <div>
              <span className="text-xs text-violet-400 font-mono uppercase font-bold block mb-1">Grade Curricular</span>
              <h3 className="text-xl font-display font-bold text-white">{selectedCourse.title}</h3>
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-705 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              ⬅ Escolher Outro Curso
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lessons List on Left */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-300">Aulas do Módulo:</h4>
              
              {selectedCourse.lessons.map((les, index) => (
                <div 
                  key={les.id}
                  className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between hover:bg-slate-900/80 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center font-display font-extrabold text-sm text-indigo-400 group-hover:scale-105 transition-all">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-200 group-hover:text-white transition-all truncate">{les.title}</p>
                      <span className="text-[10.5px] text-slate-500 block truncate mt-0.5">{les.description}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      <Clock className="w-3 h-3" /> {les.duration}
                    </span>
                    <button
                      onClick={() => startLesson(les)}
                      className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all shadow shadow-violet-650/10 cursor-pointer"
                      title="Iniciar Teste"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Course Summary Instructor Bio */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Instrutor Oficial</span>
                <p className="text-sm font-semibold font-display text-slate-205 mt-0.5">{selectedCourse.creatorName}</p>
                <div className="inline-block bg-slate-800 text-slate-300 px-1.5 py-0.5 font-bold rounded text-[9px] uppercase mt-1">
                  Faixa {selectedCourse.creatorBadge}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Conteúdo Teórico</span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
                  Cada módulo inclui um questionário de multiplas escolhas baseado em diagramas do esporte. Responder corretamente recompensa com Kimono Coins (KC) que você pode gastar na Loja ou no Marketplace com outros atletas.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span>Inscritos Ativos:</span>
                  <span className="text-slate-202 font-bold">{selectedCourse.studentCount} atletas</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono mt-1.5">
                  <span>Classificação:</span>
                  <span className="text-yellow-500 font-bold">⭐ {selectedCourse.rating} / 5.0</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        
        /* Lessons Grid Landing List */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5.5 h-5.5 text-violet-400" />
                <span>Módulos de Lições Gamificadas (Syllabus)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Escolha uma grade curada por mestres campeões e domine a parte tática antes de esmagar na arena.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const enrolled = user.enrolledCourses.includes(course.id);
              const isPremium = course.priceBRL > 0;
              
              return (
                <div 
                  key={course.id}
                  className="bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-violet-950/5 transition-all group"
                >
                  {/* Card Banner with Overlay */}
                  <div className="h-44 bg-slate-900 relative overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 opacity-60"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badges overlay */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {isPremium ? (
                        <span className="bg-yellow-500 text-slate-950 text-[10px] px-2 py-0.5 rounded font-black font-display uppercase tracking-wider block shadow">
                          PREMIUM SENSEI
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-black font-display uppercase tracking-wider block shadow">
                          CURSO GRATUITO
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-mono border border-slate-850 flex items-center gap-1">
                      ⭐ {course.rating} ({course.reviews || 45})
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-sm text-slate-100 group-hover:text-white transition-all">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-3">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-1.5 mt-3 text-[10.5px] text-slate-500 font-mono">
                        <span>Professor:</span>
                        <span className="text-slate-300 font-bold">{course.creatorName}</span>
                        <span className="text-[9px] px-1 bg-slate-800 rounded font-bold uppercase">Mestre</span>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center">
                      <div className="leading-none">
                        <span className="block text-[9px] text-slate-500 font-mono uppercase">Preço de Inscrição</span>
                        <span className="text-base font-extrabold text-white mt-0.5">
                          {isPremium ? `R$ ${course.priceBRL.toFixed(2)}` : 'Sempre Grátis'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleEnroll(course)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                          enrolled 
                            ? 'bg-slate-900 border border-slate-750 text-emerald-400' 
                            : (isPremium ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/10' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/10')
                        }`}
                      >
                        {enrolled ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Estudar Grade
                          </>
                        ) : (
                          <>
                            {isPremium ? <Lock className="w-3 h-3" /> : null}
                            {isPremium ? 'Comprar via PIX' : 'Matricular-se'}
                          </>
                        )}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Checkout PIX simulation Dialog Modal */}
      {checkoutCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp shadow-2xl">
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono text-yellow-500 uppercase font-black block tracking-widest">
                  Processamento Hotmart PIX
                </span>
                <h4 className="font-display font-extrabold text-lg text-white">Comprar Licença do Curso</h4>
              </div>
              <button 
                onClick={() => setCheckoutCourse(null)}
                className="text-slate-500 hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            {checkoutStep === 'details' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-xl shrink-0">
                    🥋
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs text-slate-200">{checkoutCourse.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Instrutor: {checkoutCourse.creatorName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Emissão de Grau:</span>
                    <span>Grátis</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Anunciante:</span>
                    <span>JiuSpeak Creators SP</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-2 border-t border-slate-800">
                    <span>Valor Total (BRL):</span>
                    <span className="text-base text-yellow-405">R$ {checkoutCourse.priceBRL.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep('qr')}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/15 cursor-pointer"
                >
                  ⚡ Gerar QR Code PIX
                </button>
              </div>
            )}

            {checkoutStep === 'qr' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-350">
                  Escaneie o QR Code ou copie o código abaixo para completar o pagamento fictício no simulador:
                </p>

                {/* Simulated QR Code Canvas box */}
                <div className="bg-white p-3 rounded-xl inline-block border-2 border-slate-800 mx-auto">
                  <QrCode className="w-32 h-32 text-slate-950" />
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between gap-4 text-left">
                  <code className="text-[9px] text-emerald-400 font-mono select-all truncate flex-1">
                    00020126580014BR.GOV.BCB.PIX0136e0886bd6-86de-4fbf-862d-a1c2293816jiuspeakqrcodepixprod520400005303986540549.905802BR5925JiuSpeak%20Saas%20Gamificado6009SAO%20PAULO62070503***6304ED24
                  </code>
                  <button
                    onClick={copyPixCode}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-300 self-stretch flex items-center shadow cursor-pointer text-xs"
                    title="Copiar PIX Copia e Cola"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    Retroceder
                  </button>
                  <button
                    onClick={handleConfirmPixPayment}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Simular Pagamento ✔
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto float-effect">
                  ✔
                </div>
                <div>
                  <h5 className="font-display font-extrabold text-base text-white">Inscrição Aprovada!</h5>
                  <p className="text-xs text-slate-400 mt-1">
                    Seu Pix de <strong>R$ {checkoutCourse.priceBRL.toFixed(2)}</strong> foi compensado na rede de testes JiuSpeak instantaneamente.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCheckoutCourse(null);
                    setSelectedCourse(checkoutCourse);
                  }}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Entrar no Curso 🎓
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
