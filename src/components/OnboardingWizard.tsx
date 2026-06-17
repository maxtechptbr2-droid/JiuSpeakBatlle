import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Globe, 
  Target, 
  Sliders, 
  Camera, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Award,
  GraduationCap
} from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingWizardProps {
  user: UserProfile;
  onComplete: (fields: Partial<UserProfile> & { onboardingDone: boolean }) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function OnboardingWizard({ user, onComplete, showToast }: OnboardingWizardProps) {
  const { syncMe } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // wizard states
  const [nativeLanguage, setNativeLanguage] = useState('Português');
  const [learningGoal, setLearningGoal] = useState('Conversação');
  const [englishLevel, setEnglishLevel] = useState('Iniciante');
  const [spanishLevel, setSpanishLevel] = useState('Iniciante');
  const [frenchLevel, setFrenchLevel] = useState('Iniciante');
  const [profilePhoto, setProfilePhoto] = useState(user.avatar || '');

  // Choice maps
  const languagesList = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Japonês', 'Outro'];
  
  const goalsMap = [
    { value: 'Conversação', label: 'Conversação Geral', desc: 'Falar fluentemente com outros faixas pretas e professores à volta do mundo.' },
    { value: 'Viagem', label: 'Viagem de Treinos', desc: 'Conseguir treinar em academias estrangeiras (meca do BJJ na Califórnia, Texas, etc).' },
    { value: 'Trabalho', label: 'Trabalho & Carreira', desc: 'Lecionar Jiu-Jitsu legalmente em academias no exterior com inglês nativo.' },
    { value: 'Negócios', label: 'Negócios & Eventos', desc: 'Negociar patrocínios, seminários, bolsas ou contratos internacionais.' },
    { value: 'Jiu-Jitsu', label: 'Inglês Técnico de Luta', desc: 'Compreender instruções em inglês, arbitrar lutas, seminários internacionais.' },
    { value: 'Competidores', label: 'Entrevistas Pós-Luta', desc: 'Se destacar no microfone do ADCC, campeonatos mundiais da IBJJF.' },
    { value: 'Ensino', label: 'Ministrar Aulas', desc: 'Lecionar seminários em universidades ou ginásios em inglês clássico.' }
  ];

  const levelsList = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast("Insira um arquivo de imagem válido (JPEG, PNG ou WEBP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("A imagem do perfil não pode exceder o limite de 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result as string);
      showToast("Imagem processada para upload!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      
      const payload = {
        nativeLanguage,
        learningGoal,
        englishLevel,
        spanishLevel,
        frenchLevel,
        profilePhoto,
        onboardingDone: true
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        console.log("[PROFILE SAVE RESPONSE]", data);
        showToast("Onboarding concluído com maestria! Bem-vindo ao JiuSpeak.", "success");
        
        // Ensure immediate profile context sync with Postgres
        try {
          await syncMe();
        } catch (syncErr) {
          console.error("[ONBOARDING WIZARD] syncMe failed after finalize:", syncErr);
        }

        onComplete({
          avatar: profilePhoto || user.avatar,
          profilePhoto: profilePhoto || user.profilePhoto || user.avatar,
          nativeLanguage,
          learningGoal,
          englishLevel,
          spanishLevel,
          frenchLevel,
          onboardingDone: true
        });
      } else {
        showToast("Falha ao salvar onboarding no banco.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao finalizar setup do perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      id="onboarding-wizard-overlay"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-violet-900/10 via-transparent to-indigo-900/10 pointer-events-none" />
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />

        {/* Header section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🥋</span>
            <div>
              <h3 className="text-lg font-display font-black text-white leading-none">CONFIGURAÇÃO INICIAL</h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-1">Jiuspeak Onboarding • Passo {step}/5</p>
            </div>
          </div>
          
          {/* Real-time progression bar */}
          <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-violet-500 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Choose Native Language */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-400" /> Qual o seu idioma nativo?
              </h4>
              <p className="text-xs text-slate-400">Escolha o idioma materno para que o sistema adeque as traduções de tutoria.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languagesList.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setNativeLanguage(lang)}
                  className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    nativeLanguage === lang 
                      ? 'bg-violet-600/15 border-violet-500 text-white' 
                      : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{lang}</span>
                  {nativeLanguage === lang && <Check className="w-4 h-4 text-violet-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Objective */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" /> Qual o seu principal objetivo?
              </h4>
              <p className="text-xs text-slate-400">Personalize sua trilha com foco nas terminologias apropriadas.</p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {goalsMap.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setLearningGoal(goal.value)}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 w-full cursor-pointer ${
                    learningGoal === goal.value 
                      ? 'bg-violet-600/15 border-violet-500 text-white' 
                      : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-slate-250 font-display">{goal.label}</span>
                    {learningGoal === goal.value && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal leading-relaxed">{goal.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Language levels */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-400" /> Selecione o nível dos seus idiomas
              </h4>
              <p className="text-xs text-slate-400">Classificação preliminar autorelatada para ajuste de dificuldades.</p>
            </div>

            <div className="space-y-4">
              {/* English */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Nível de Inglês</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {levelsList.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnglishLevel(lvl)}
                      className={`py-1.5 px-3 rounded-lg border text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                        englishLevel === lvl 
                          ? 'bg-violet-600 border-violet-500 text-white' 
                          : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300'
                      }`}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spanish */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Nível de Espanhol</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {levelsList.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpanishLevel(lvl)}
                      className={`py-1.5 px-3 rounded-lg border text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                        spanishLevel === lvl 
                          ? 'bg-violet-600 border-violet-500 text-white' 
                          : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300'
                      }`}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* French */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Nível de Francês</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {levelsList.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFrenchLevel(lvl)}
                      className={`py-1.5 px-3 rounded-lg border text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                        frenchLevel === lvl 
                          ? 'bg-violet-600 border-violet-500 text-white' 
                          : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300'
                      }`}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Choose or Upload Profile Photo */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Camera className="w-5 h-5 text-violet-400" /> Escolha sua foto de perfil
              </h4>
              <p className="text-xs text-slate-400">Carregue sua identidade de tatame para ser visualizado pelos seus parceiros de treino.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Preview do Atleta" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-slate-655 text-4xl">🥋</span>
                  )}
                </div>

                <label className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-mono font-bold text-white cursor-pointer transition-all">
                  Upload Foto
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp" 
                    onChange={handleImageFile}
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="text-center space-y-2">
                <label className="inline-block py-2 px-4 bg-slate-950 border border-slate-800 hover:border-violet-500 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer hover:scale-105 transition-all">
                  Escolher arquivo de imagem
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp" 
                    onChange={handleImageFile}
                    className="hidden" 
                  />
                </label>
                <p className="text-[10px] font-mono text-slate-500">Aceita jpg, png ou webp. Limite máximo 5 Megabytes.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Finalize and celebrate */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-violet-650/20 border-2 border-violet-500 flex items-center justify-center mx-auto text-2xl animate-bounce">
              🏆
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-display font-black text-white uppercase tracking-wider">Tatame Preparado!</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Parabéns, {user.name}! Seus objetivos cosméticos de idiomas e Jiu-Jitsu foram calibrados de forma ótima na nossa base de dados.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-left space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Idioma Nativo:</span>
                <span className="font-bold text-white">{nativeLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span>Meta Primária:</span>
                <span className="font-bold text-white">{learningGoal}</span>
              </div>
              <div className="flex justify-between">
                <span>Dificuldade Calibrada:</span>
                <span className="font-bold text-violet-400">Filtro Técnico Ativo</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="border-t border-slate-800/60 pt-5 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="py-2 px-4 rounded-xl border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-500/10"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-500/15"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4 text-white font-bold" />
              )}
              <span>Finalizar Setup</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
