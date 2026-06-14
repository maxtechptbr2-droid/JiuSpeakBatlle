import React from 'react';
import Header from './landing/Header';
import HeroSection from './landing/HeroSection';
import HeroStats from './landing/HeroStats';
import ProgressCards from './ProgressCards';
import StatsSection from './StatsSection';
import { Star, Award, Shield, CheckCircle2, ChevronRight, Play, Volume2, Mic } from 'lucide-react';
import { UserProfile, Course } from '../types';

interface HomePageProps {
  user: UserProfile;
  courses: Course[];
  onOpenAuthModal: (view: 'login' | 'register') => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  showFreeLesson: boolean;
  setShowFreeLesson: (show: boolean) => void;
  trialStep: number;
  setTrialStep: React.Dispatch<React.SetStateAction<number>>;
  trialMicSuccess: boolean | null;
  setTrialMicSuccess: (success: boolean | null) => void;
  trialIsRecording: boolean;
  simulateMicCheck: () => void;
  sampleLessons: any[];
  speakPreviewPhrase: (term: string) => void;
}

export default function HomePage({
  user,
  courses,
  onOpenAuthModal,
  showToast,
  showFreeLesson,
  setShowFreeLesson,
  trialStep,
  setTrialStep,
  trialMicSuccess,
  setTrialMicSuccess,
  trialIsRecording,
  simulateMicCheck,
  sampleLessons,
  speakPreviewPhrase,
}: HomePageProps) {

  const scrollToSection = (id: string) => {
    if (id === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // If it's a specific auth action
        onOpenAuthModal('register');
      }
    }
  };

  return (
    <div className="min-h-screen text-slate-200 bg-[#000814] flex flex-col items-stretch w-full overflow-x-hidden font-sans relative">
      
      {/* NAVBAR */}
      <Header 
        onLoginClick={() => onOpenAuthModal('login')} 
        onRegisterClick={() => onOpenAuthModal('register')} 
        onNavigateToSection={scrollToSection}
        user={user}
      />

      {/* HERO SECTION */}
      <HeroSection 
        onStartClick={() => onOpenAuthModal('register')} 
        onExploreClick={() => scrollToSection('jornada')} 
        showToast={showToast}
        user={user}
      />

      {/* FLOATING HERO STATISTICS CARD OVERLAPPING THE FOLD */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 xl:px-20 -mt-16 sm:-mt-24 mb-12 relative z-30">
        <HeroStats />
      </div>

      {/* 4 PREMIUM ACTIVITY AND PROGRESS CARDS */}
      <ProgressCards 
        user={user} 
        courses={courses} 
        onContinueClass={() => setShowFreeLesson(true)} 
        showToast={showToast}
      />

      {/* DYNAMIC TRIAL FREE LESSON (AULA GRATUITA) */}
      {showFreeLesson && (
        <section className="py-20 bg-gradient-to-b from-[#020617] to-[#050B14] border-t border-b border-blue-900/10 animate-fadeIn" id="free-lesson-interactive">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#030612]/90 rounded-[2.5rem] border border-blue-500/20 p-6 sm:p-8 md:p-12 space-y-8 relative shadow-[0_20px_50px_rgba(0,132,255,0.08)]">
            
            <button 
              onClick={() => setShowFreeLesson(false)}
              className="absolute top-6 right-6 w-9 h-9 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-sm text-slate-400 hover:text-white cursor-pointer hover:border-blue-500/50 transition-all"
            >
              ✕
            </button>

            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-black block">
                ⭐ Experiência Interativa (Modo Demonstrativo)
              </span>
              <h3 className="text-3xl md:text-4xl font-sans font-black text-white uppercase tracking-tight">Sua Primeira Aula Grátis</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Ouça o comando de áudio técnico e treine sua pronúncia na simulação de microfone avaliada por Inteligência Artificial.
              </p>
            </div>

            {/* Trial step layout */}
            <div className="bg-[#00040a] rounded-[2rem] p-6 md:p-8 border border-blue-900/15 space-y-6 shadow-inner">
              <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                <span>TERMO TÉCNICO {trialStep + 1} DE {sampleLessons.length}:</span>
                <span className="font-bold text-blue-400 uppercase tracking-wide bg-blue-950/40 px-3 py-1 rounded-full border border-blue-500/15">FAIXA BRANCA (WHITE BELT)</span>
              </div>

              <div className="py-6 text-center space-y-4">
                <span className="text-4xl md:text-5xl font-sans font-black text-white tracking-tight block uppercase">
                  {sampleLessons[trialStep].term}
                </span>
                <span className="inline-block px-4 py-1.5 bg-blue-950/50 border border-blue-900/30 rounded-full text-blue-400 font-mono text-xs">
                  {sampleLessons[trialStep].pronunciation}
                </span>
                <p className="text-base font-semibold text-slate-205">
                  Definição: {sampleLessons[trialStep].meaning}
                </p>
                <div className="p-3.5 bg-blue-950/20 border border-blue-500/10 rounded-2xl max-w-md mx-auto">
                  <p className="text-xs text-slate-400 leading-normal">
                    💡 <strong className="text-slate-350">Dica Prática:</strong> {sampleLessons[trialStep].tip}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-slate-900/70">
                <button
                  type="button"
                  onClick={() => speakPreviewPhrase(sampleLessons[trialStep].term)}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2 border border-slate-800 cursor-pointer hover:border-blue-500/25 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  Escutar Pronúncia do Mestre
                </button>

                <button
                  type="button"
                  onClick={simulateMicCheck}
                  disabled={trialIsRecording}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    trialIsRecording 
                     ? 'bg-rose-950/20 border border-rose-500/30 text-rose-300 animate-pulse' 
                     : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25'
                  }`}
                >
                  <Mic className="w-4 h-4 text-white" />
                  {trialIsRecording ? 'Escutando você...' : 'Gravar Minha Voz'}
                </button>
              </div>

              {trialMicSuccess !== null && (
                <div className="bg-emerald-950/30 border border-emerald-500/35 rounded-2xl p-4 text-center text-xs text-emerald-300 flex items-center justify-center gap-2 animate-scaleUp">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Pronúncia validada com sucesso! Você está pronto para decolar internacionalmente.</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setTrialStep(prev => prev > 0 ? prev - 1 : sampleLessons.length - 1);
                  setTrialMicSuccess(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                ← Termo Anterior
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrialStep(prev => prev < sampleLessons.length - 1 ? prev + 1 : 0);
                  setTrialMicSuccess(null);
                }}
                className="bg-slate-950 hover:bg-slate-900 px-5 py-2.5 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all"
              >
                Próximo Termo →
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* STATS SECTION */}
      <StatsSection />

      {/* BELT JOURNEY PROGRESSION */}
      <section id="jornada" className="py-24 bg-gradient-to-b from-[#000814] to-[#040815] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-black">
              Estrutura Curricular Prática Certificada
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-black text-white tracking-tight uppercase">
              A Jornada por Faixas
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Assim como no jiu-jítsu nos tatames, você avança gradualmente em complexidade técnica linguística, partindo do vocabulário básico de commands até a liderança máxima de seminários globais.
            </p>
          </div>

          {/* Belt cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* White Belt */}
            <div className="bg-[#030612]/75 border border-slate-900 hover:border-blue-500/20 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-[0_0_15px_rgba(0,132,255,0.05)]">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-md border border-slate-350">
                  ⚪
                </div>
                <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">White Belt</h3>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-[8px] py-[3px] rounded-full border border-slate-800 font-bold uppercase tracking-wider">
                  Faixa Branca
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Learn greetings, tap out safety boundaries, basic commands and muscle groups.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Foque em entender grips (pegadas), escapes de quadril e respeito aos tatames gringos.
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Módulo 1</span>
            </div>

            {/* Blue Belt */}
            <div className="bg-[#030612]/75 border border-slate-900 hover:border-blue-500/35 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-[0_0_15px_rgba(0,132,255,0.05)]">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-xl text-white shadow-md">
                  🔵
                </div>
                <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">Blue Belt</h3>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-950/40 px-[8px] py-[3px] rounded-full border border-blue-500/15 font-bold uppercase tracking-wider">
                  Faixa Azul
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Conduct flow drills, express joint warnings, ask postural training feedbacks.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Aprenda as mecânicas de repetição veloz de posições, convites educados de rola leve e prevenção.
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Módulo 2</span>
            </div>

            {/* Purple Belt */}
            <div className="bg-[#030612]/75 border border-slate-900 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-[0_0_15px_rgba(0,132,255,0.05)]">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-xl text-white shadow-md">
                  🟣
                </div>
                <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">Purple Belt</h3>
                <span className="text-[9px] font-mono text-purple-400 bg-purple-950/40 px-[8px] py-[3px] rounded-full border border-purple-500/15 font-bold uppercase tracking-wider">
                  Faixa Roxa
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Advanced submissions, sweep tactics & active IBJJF arbitrage tournament rules.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Domine os diálogos de torneios no exterior. Proteste pontuação e faltas de amarração (stalling).
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Módulo 3</span>
            </div>

            {/* Brown Belt */}
            <div className="bg-[#030612]/75 border border-slate-900 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-[0_0_15px_rgba(0,132,255,0.05)]">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-900 flex items-center justify-center text-xl text-white shadow-md">
                  🟤
                </div>
                <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">Brown Belt</h3>
                <span className="text-[9px] font-mono text-amber-500 bg-amber-955/40 px-[8px] py-[3px] rounded-full border border-amber-900/15 font-bold uppercase tracking-wider">
                  Faixa Marrom
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Lecione posições de esgrima, conduza aquecimentos intensos e detalhe mecânicas verbais.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Adquira compostura profissional como professor convidado em seminários internacionais liderados na gringa.
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Módulo 4</span>
            </div>

            {/* Black Belt */}
            <div className="bg-[#030612]/75 border border-blue-500/15 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-[0_0_30px_rgba(0,132,255,0.12)]">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border-2 border-red-650 flex items-center justify-center text-xl text-white shadow-md">
                  ⚫
                </div>
                <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">Black Belt</h3>
                <span className="text-[9px] font-mono text-red-500 bg-red-955/40 px-[8px] py-[3px] rounded-full border border-red-550/15 font-bold uppercase tracking-wider">
                  Faixa Preta
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Aura of global respect: podcast interviews, visa negotiations, sponsorships contracts.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Fale com marcas e patrocinadores globais, estruture negócios de afiliação e consagre sua oratória de mestre.
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Módulo 5</span>
            </div>

          </div>
        </div>
      </section>

      {/* CURRICULUM OVERVIEW */}
      <section id="cursos" className="py-24 bg-gradient-to-b from-[#040815] to-[#020617] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-black">
                Módulos Práticos de Alto Impacto
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-black text-white tracking-tight uppercase">
                Estrutura de Ensino
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm">
              Um currículo técnico moldado unicamente para o life-style das artes marciais, eliminando gramática enfadonha tradicional e acelerando diálogos de tatame real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* item 1 */}
            <div className="p-6 rounded-2xl bg-[#030612]/75 border border-slate-900 hover:border-blue-500/20 transition-all duration-300 space-y-4">
              <span className="text-3xl block">📣</span>
              <h3 className="font-sans font-black text-sm text-white uppercase tracking-wider">Comandos de Treino</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Aprenda comandos instantâneos de tatame: início de lutas, controle postural e interrupções seguras por batida rápida (Tap Out).
              </p>
            </div>

            {/* item 2 */}
            <div className="p-6 rounded-2xl bg-[#030612]/75 border border-slate-900 hover:border-blue-500/20 transition-all duration-300 space-y-4">
              <span className="text-3xl block">💬</span>
              <h3 className="font-sans font-black text-sm text-white uppercase tracking-wider">Conversação</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Resenha saudável de tatame para trocar feedbacks técnicos e convidar lutadores internacionais de forma nobre para treinar.
              </p>
            </div>

            {/* item 3 */}
            <div className="p-6 rounded-2xl bg-[#030612]/75 border border-slate-900 hover:border-blue-500/20 transition-all duration-300 space-y-4">
              <span className="text-3xl block">🌎</span>
              <h3 className="font-sans font-black text-sm text-white uppercase tracking-wider">Aulas Globais</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Compreenda explicações táticas de professores estrangeiros de renome nos maiores seminários e academias do mundo.
              </p>
            </div>

            {/* item 4 */}
            <div className="p-6 rounded-2xl bg-[#04081c] border border-blue-900/20 transition-all duration-300 space-y-4">
              <span className="text-3xl block">🏆</span>
              <h3 className="font-sans font-black text-sm text-white uppercase tracking-wider text-blue-400">Torneios Mundiais</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Aprenda as regras de competições na gringa. Dialogue com árbitros para requerer vantagens ou contestações justas em inglês.
              </p>
            </div>

            {/* item 5 */}
            <div className="p-6 rounded-2xl bg-[#030612]/75 border border-slate-900 hover:border-blue-500/20 transition-all duration-300 space-y-4">
              <span className="text-3xl block">🎓</span>
              <h3 className="font-sans font-black text-sm text-white uppercase tracking-wider">Seminários</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Conduza seminários de jiu-jitsu de forma fluente e clara, sabendo detalhar direções corporais de esgrima e distribuição.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="comunidade" className="py-24 bg-gradient-to-b from-[#020617] to-[#000814] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-black">
              Experiências de Combatentes Reais
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-black text-white tracking-tight uppercase">
              Quem Conquistou o Mundo Recomenda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Box 1 */}
            <div className="bg-[#030612]/75 p-8 rounded-[2rem] border border-slate-900 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 text-blue-400 fill-blue-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "O JiuSpeak preenche uma lacuna gigante no esporte. Estar no exterior sabendo se comunicar faz toda a diferença para ministrar seminários, dar entrevistas pós-luta ou orientar alunos de forma profissional."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-6 border-t border-slate-900/60 mt-6 md:mt-8">
                <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center font-sans font-black text-xs border border-blue-500 text-blue-400 shrink-0 uppercase">
                  MS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Marcus "Buchecha" S.</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Faixa Preta 13x Campeão Mundial</span>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-[#04081c] p-8 rounded-[2rem] border border-blue-900/20 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 text-blue-400 fill-blue-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-250 italic leading-relaxed font-semibold">
                  "Melhorei demais meu vocabulário antes de lutar o Europeu e o Pan. Entender os comandos de arbitragem rápida de tap out ou as penalidades aplicadas ao adversário evitou sermos passados de guarda de bobeira. Recomendo muito!"
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-6 border-t border-blue-950/40 mt-6 md:mt-8">
                <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center font-sans font-black text-xs border border-blue-400 text-blue-400 shrink-0 uppercase">
                  JO
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Jessica "Lelê" Oliveira</h4>
                  <span className="text-[10px] text-blue-400 font-mono">Faixa Marrom, Rio de Janeiro</span>
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-[#030612]/75 p-8 rounded-[2rem] border border-slate-900 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 text-blue-400 fill-blue-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-normal">
                  "I highly recommend it. Brazilian athletes who come to my gym with JiuSpeak training learn commands and communicate techniques instantly. It creates fantastic adapters to high intensity classes here in California."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-6 border-t border-slate-900/60 mt-6 md:mt-8">
                <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center font-sans font-black text-xs border border-slate-800 text-slate-500 shrink-0 uppercase">
                  DJ
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Professor David Jenkins</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Alliance Gym California Head</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#010307] border-t border-slate-900/70 py-16 text-slate-550 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="text-xl font-sans font-black text-white tracking-wide uppercase">JIUSPEAK</span>
              <p className="text-[10px] text-slate-500 max-w-sm">
                A plataforma internacional premium de inglês de luta para atletas de Jiu-Jitsu alcançarem destaque global nos campeonatos e dojôs do planeta.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-1.5">
              <p className="text-xs font-mono font-bold text-blue-400 tracking-wide uppercase">
                COORDENAÇÃO TÉCNICA • FLAVIO MARTINS
              </p>
              <p className="text-[10px] text-slate-500">Desenvolvedor & Faixa-Preta de Jiu-Jitsu. Todos os direitos reservados. © 2026</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
