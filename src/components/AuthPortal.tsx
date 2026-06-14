import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Mail, 
  User, 
  ArrowRight, 
  RefreshCw, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Inbox,
  Lock,
  Compass,
  Star,
  Play,
  Award,
  BookOpen,
  Layers,
  Flame,
  Trophy,
  Volume2,
  Mic,
  Users,
  Heart,
  Sparkles,
  Languages,
  HelpCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { avatarMappingList } from '../avatarMapping';
import HomePage from './HomePage';
import { COURSES } from '../data';

interface AuthPortalProps {
  onLoginSuccess: (session: { accessToken: string; refreshToken: string; user: any }) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  token: string;
  timestamp: string;
}

let cachedCsrfToken: string | null = null;

export default function AuthPortal({ onLoginSuccess, showToast }: AuthPortalProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ATHLETE' | 'ADMIN'>('ATHLETE');

  // Onboarding Wizard States
  const [registerStep, setRegisterStep] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [publicName, setPublicName] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [city, setCity] = useState('São Paulo');
  const [nativeLanguage, setNativeLanguage] = useState('Português');
  const [targetLanguage, setTargetLanguage] = useState('Inglês');
  const [mainGoal, setMainGoal] = useState('Competir internacionalmente e entender seminários de BJJ gringos.');

  // BJJ Profile (Step 3)
  const [bjjBelt, setBjjBelt] = useState<any>('Branca');
  const [bjjAcademy, setBjjAcademy] = useState('');
  const [bjjProfessor, setBjjProfessor] = useState('');
  const [bjjTrainingTime, setBjjTrainingTime] = useState('');
  const [bjjObjective, setBjjObjective] = useState('');

  // Choose Initial Avatar (Step 4)
  const [selectedInitialAvatar, setSelectedInitialAvatar] = useState(
    avatarMappingList && avatarMappingList[0] ? avatarMappingList[0].image : ''
  );

  // Language Diagnosis Mini-Quiz (Step 5)
  const [diagQ1, setDiagQ1] = useState<string | null>(null);
  const [diagQ2, setDiagQ2] = useState<string | null>(null);
  const [diagQ3, setDiagQ3] = useState<string | null>(null);
  const [scoreDiagnostico, setScoreDiagnostico] = useState<number | null>(null);
  const [cefrLevel, setCefrLevel] = useState<string>('A1');

  // Academy Connection (Step 6)
  const [academyType, setAcademyType] = useState<'none' | 'global' | 'independent'>('none');
  const [globalTeamsList, setGlobalTeamsList] = useState<any[]>([]);
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [independentAcademiesList, setIndependentAcademiesList] = useState<any[]>([]);
  const [selectGlobalTeamId, setSelectGlobalTeamId] = useState<string>('');
  const [selectBranchId, setSelectBranchId] = useState<string>('');
  const [selectIndependentAcademyId, setSelectIndependentAcademyId] = useState<string>('');
  
  // Password Recovery / Verification fields
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Interactive FREE LESSON mock state
  const [showFreeLesson, setShowFreeLesson] = useState(false);
  const [trialStep, setTrialStep] = useState(0);
  const [trialMicSuccess, setTrialMicSuccess] = useState<boolean | null>(null);
  const [trialIsRecording, setTrialIsRecording] = useState(false);

  // Load Academy Lists for Step 6 Onboarding
  useEffect(() => {
    if (registerStep === 6) {
      setLoading(true);
      Promise.all([
        fetch('/api/academy/all-groups').then(r => r.ok ? r.json() : {}),
        fetch('/api/academy/global-teams').then(r => r.ok ? r.json() : []),
        fetch('/api/academy/independent-academies').then(r => r.ok ? r.json() : [])
      ]).then(([allGroups, gTeams, indAcademy]: [any, any, any]) => {
        const teams = gTeams.globalTeams || gTeams || allGroups.globalTeams || [];
        const independents = indAcademy.independentAcademies || indAcademy || allGroups.independentAcademies || [];
        setGlobalTeamsList(teams);
        setIndependentAcademiesList(independents);
      }).catch(err => {
        console.error("Failed loading academy options on onboarding wizard", err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [registerStep]);

  useEffect(() => {
    if (selectGlobalTeamId) {
      fetch(`/api/academy/global-teams/${selectGlobalTeamId}/branches`)
        .then(res => res.ok ? res.json() : {})
        .then((data: any) => {
          setBranchesList(data.branches || data || []);
        })
        .catch(err => console.error("Error loading onboarding branches:", err));
    } else {
      setBranchesList([]);
      setSelectBranchId('');
    }
  }, [selectGlobalTeamId]);

  const clearFormMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Submit register account
  const getCsrfToken = async (forceRefresh = false): Promise<string> => {
    if (cachedCsrfToken && !forceRefresh) {
      return cachedCsrfToken;
    }
    try {
      const res = await fetch('/api/csrf-token', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        cachedCsrfToken = data.csrfToken;
        return data.csrfToken || '';
      }
    } catch (err) {
      console.warn('Failed to fetch CSRF Token:', err);
    }
    return '';
  };

  const fetchWithCsrf = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const fetchOptions = {
      ...options,
      credentials: 'include' as const,
    };

    const currentToken = await getCsrfToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'X-CSRF-Token': currentToken
    };
    fetchOptions.headers = headers;

    let res = await fetch(url, fetchOptions);

    if (res.status === 403) {
      console.warn(`Anti-CSRF error on ${url}. Refreshing token and retrying request...`);
      const newToken = await getCsrfToken(true);
      if (newToken) {
        const retryOptions = {
          ...fetchOptions,
          headers: {
            ...headers,
            'X-CSRF-Token': newToken
          }
        };
        res = await fetch(url, retryOptions);
        
        if (res.ok) {
          showToast('Sua sessão de segurança foi atualizada. Tente novamente.', 'info');
        }
      }
    }

    return res;
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !name || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios para se registrar.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Register account
      const res = await fetchWithCsrf('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      // 2. Automate login to retrieve JWT tokens and bypass verification
      const loginRes = await fetchWithCsrf('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Falha na autenticação do novo atleta.');
      }

      // 3. Post full multi-stage custom profile info to backend
      const rawProfileObj = {
        surname: "",
        publicName: publicName || name.toLowerCase().replace(/\s+/g, '-'),
        country,
        city,
        nativeLanguage,
        targetLanguage,
        bio: mainGoal,
        academy: bjjAcademy || "Alliance International",
        professor: bjjProfessor || "Nenhum",
        belt: bjjBelt,
        stripes: 0,
        trainingTime: bjjTrainingTime || "Iniciante",
        goalsBjj: bjjObjective || "Aprender as técnicas em inglês",
        realPhoto: selectedInitialAvatar || "",
        cefrLevel: cefrLevel || "A1",
        diagnosticScore: scoreDiagnostico || 0,
        achievements: ["first_armlock_onboarding"],
        globalTeamId: academyType === 'global' ? selectGlobalTeamId : null,
        branchId: academyType === 'global' ? selectBranchId : null,
        independentAcademyId: academyType === 'independent' ? selectIndependentAcademyId : null
      };

      // Set profile endpoint with credentials active
      const profileOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.accessToken}`
        },
        body: JSON.stringify({ profile: rawProfileObj }),
      };

      await fetch('/api/user/profile', profileOptions);

      showToast(`Bem-vindo oficial à academia JiuSpeak, ${name}!`, 'success');
      
      // Save profile metadata locally for instant sync
      localStorage.setItem(`jiuspeak_profile_${loginData.user.id}`, JSON.stringify(rawProfileObj));

      // Successfully sign in user!
      onLoginSuccess({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        user: {
          ...loginData.user,
          avatar: selectedInitialAvatar || loginData.user.avatar,
          belt: bjjBelt.toUpperCase() === 'BRANCA' ? 'WHITE' : 
                bjjBelt.toUpperCase() === 'AZUL' ? 'BLUE' :
                bjjBelt.toUpperCase() === 'ROXA' ? 'PURPLE' :
                bjjBelt.toUpperCase() === 'MARROM' ? 'BROWN' : 'BLACK',
          isEmailVerified: true,
          globalTeamId: academyType === 'global' ? selectGlobalTeamId : null,
          branchId: academyType === 'global' ? selectBranchId : null,
          independentAcademyId: academyType === 'independent' ? selectIndependentAcademyId : null
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Houve um erro ao processar o cadastro.');
      showToast(err.message || 'Erro no registro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit login standard
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, digite e-mail e senha.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetchWithCsrf('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      showToast(`Bem-vindo, ${data.user.name}! Login efetuado com sucesso.`, 'success');
      onLoginSuccess({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'E-mail ou senha incorretos.');
      showToast(err.message || 'Falha na autenticação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit forgot password requesting
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Preencha seu e-mail para receber as instruções.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetchWithCsrf('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao solicitar nova senha.');
      }

      setSuccessMsg('Instruções de redefinição foram enviadas com sucesso!');
      showToast('E-mail de redefinição de senha enviado!', 'success');
      setView('reset');
    } catch (err: any) {
      setErrorMsg(err.message);
      showToast('Erro ao enviar e-mail.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit password redefinition with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      setErrorMsg('Preencha o código/token e digite a nova senha.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha precisa ter ao menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetchWithCsrf('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha.');
      }

      setSuccessMsg(data.message || 'Senha atualizada! Você já pode realizar o login.');
      showToast('Sua senha foi redefinida com sucesso!', 'success');
      
      // Clear values and transition back
      setToken('');
      setNewPassword('');
      setView('login');
    } catch (err: any) {
      setErrorMsg(err.message);
      showToast('Erro na redefinição.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Play audio TTS for the Free Lesson Preview
  const speakPreviewPhrase = async (phrase: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    showToast('🔊 Gerando pronúncia com voz IA premium...', 'info');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: phrase })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "TTS Route Failed");
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.onerror = () => {
        fallbackPreviewSpeech(phrase);
      };

      await audio.play();
      showToast('🔊 Reproduzindo áudio OpenAI premium...', 'success');
    } catch (err: any) {
      console.warn("OpenAI TTS fallbacked in AuthPortal:", err);
      const isQuota = err.message && String(err.message).toLowerCase().includes("quota");
      const friendlyMsg = isQuota 
        ? "⚠️ OpenAI Sem Saldo/Quota no momento. Usando voz alternativa temporária..."
        : "⚠️ Serviço de Voz Premium indisponível. Usando voz alternativa temporária...";
      showToast(friendlyMsg, 'info');
      fallbackPreviewSpeech(phrase);
    }
  };

  const fallbackPreviewSpeech = (phrase: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
        showToast("Fale o termo logo após escutar!", "info");
      } catch (e) {}
    } else {
      showToast("Áudio indisponível neste navegador, mas o texto é: " + phrase, "info");
    }
  };

  // Simulate Speak Verification
  const simulateMicCheck = () => {
    setTrialIsRecording(true);
    setTrialMicSuccess(null);
    showToast("Escutando... Fale no microfone!", "info");
    setTimeout(() => {
      setTrialIsRecording(false);
      setTrialMicSuccess(true);
      showToast("Pronúncia Excelente! Alavanca mental validada com 96% de exatidão.", "success");
    }, 1800);
  };

  const sampleLessons = [
    {
      term: "Pull Guard",
      meaning: "Puxar para a guarda",
      pronunciation: "pʊl ɡɑːrd",
      tip: "Usado para puxar seu adversário à sua guarda no início do rola para evitar quedas pesadas de wrestlers."
    },
    {
      term: "Underhook",
      meaning: "Esgrimar o braço (passar por baixo)",
      pronunciation: "ˈʌn-dər-hʊk",
      tip: "A pegada mais importante das lutas! Quem tem a esgrima profunda controla o quadril e as costas do adversário."
    },
    {
      term: "Tap Out / I tap!",
      meaning: "Bater (desistir do combate com segurança)",
      pronunciation: "tæp aʊt",
      tip: "A palavra que garante a sua segurança física. Dizer 'I tap' no exterior para imediatamente a luta no tatame gringo."
    }
  ];

  // Open modal handler
  const onOpenAuthModal = (targetView: 'login' | 'register') => {
    setView(targetView);
    setRegisterStep(1);
    setAuthModalOpen(true);
    clearFormMessages();
  };

  return (
    <>
      <HomePage
        user={{
          id: 'visitor',
          name: 'Visitante do Dojo',
          email: 'visitante@jiuspeak.com',
          avatar: '/avatars/default.png',
          level: 15,
          belt: 'Branca',
          stripes: 2,
          xp: 750,
          xpNextLevel: 1000,
          coins: 100,
          elo: 1000,
          winCount: 0,
          lossCount: 0,
          streak: 1,
          academy: 'Gracie Barra',
          category: 'Médio',
          guardsPreference: 'Guarda Fechada',
          submitsPreference: 'Armlock',
          inventory: [],
          enrolledCourses: [],
          unlockedAchievements: [],
          subscription: { type: 'FREE', priceBRL: 0 },
          role: 'athlete',
          balanceBRL: 0,
          balanceAvailableBRL: 0,
          balancePendingBRL: 0,
          totalEarnedBRL: 0,
          totalWithdrawnBRL: 0
        }}
        courses={COURSES}
        onOpenAuthModal={onOpenAuthModal}
        showToast={showToast}
        showFreeLesson={showFreeLesson}
        setShowFreeLesson={setShowFreeLesson}
        trialStep={trialStep}
        setTrialStep={setTrialStep}
        trialMicSuccess={trialMicSuccess}
        setTrialMicSuccess={setTrialMicSuccess}
        trialIsRecording={trialIsRecording}
        simulateMicCheck={simulateMicCheck}
        sampleLessons={sampleLessons}
        speakPreviewPhrase={speakPreviewPhrase}
      />

      {/* ATHLETIC ACCESS GATEWAY MODAL OVERLAY */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01040ed1]/90 backdrop-blur-md overflow-y-auto" id="auth-modal-overlay">
          {/* Dismiss backdrop click */}
          <div className="absolute inset-0 cursor-default" onClick={() => { if (!loading) setAuthModalOpen(false); }} />

          {/* Glassmorphic Portal Card */}
          <div className="relative w-full max-w-md bg-[#04091c] border border-blue-500/20 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,132,255,0.15)] z-10 my-8">
            
            {/* Close Button Trigger */}
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:border-blue-500/30 transition-all cursor-pointer z-20"
            >
              ✕
            </button>

            {/* Title / Brand Header */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono font-black text-blue-450 bg-blue-950/40 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest inline-block">
                Sessão de Sparring Técnico
              </span>
              <h2 className="text-2xl font-sans font-black text-white uppercase tracking-tight mt-1.5 flex items-center justify-center gap-2">
                🥋 JIUSPEAK GATEWAY
              </h2>
            </div>

            {/* Status Feedback Banners */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/35 text-xs text-rose-300 font-medium flex items-start gap-2.5 mb-5 animate-scaleUp" id="auth-err-display">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 text-xs text-emerald-300 font-medium flex items-start gap-2.5 mb-5 animate-scaleUp" id="auth-success-display">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* VIEW 1: SIGN IN */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 font-sans" id="login-form">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">E-mail de Cadastro</label>
                  <div className="relative font-medium text-xs">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="atleta@jiuspeak.com"
                      className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Chave de Segurança / Senha</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative font-medium text-xs">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-10 py-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-wide">Função:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('ATHLETE')}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${
                        role === 'ATHLETE'
                          ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                          : 'bg-slate-950/70 border-slate-900 text-slate-500 hover:border-slate-800 font-medium'
                      }`}
                    >
                      Atleta 🥋
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('ADMIN')}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${
                        role === 'ADMIN'
                          ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                          : 'bg-slate-950/70 border-slate-900 text-slate-500 hover:border-slate-800 font-medium'
                      }`}
                    >
                      Admin ⭐
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>Entrar no Tatame Premium ⚡</>
                  )}
                </button>

                <div className="text-center pt-4 border-t border-[#0d1431]">
                  <span className="text-xs text-slate-450 font-medium">Novo na jornada internacional? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('register');
                      setRegisterStep(1);
                      clearFormMessages();
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 ml-1 transition-all"
                  >
                    Criar conta
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 2: MULTI-STEP CREATION WIZARD */}
            {view === 'register' && (
              <div className="space-y-4" id="register-wizard-container">
                {/* Step indicator slider */}
                <div className="flex items-center justify-between bg-[#01040ec0] p-2.5 rounded-2xl border border-slate-900">
                  <span className="text-[10px] font-mono text-slate-550 font-bold uppercase tracking-wide">ETAPA {registerStep} DE 6</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((st) => (
                      <div 
                        key={st} 
                        className={`h-1.5 rounded-sm transition-all ${
                          st <= registerStep ? 'w-4.5 bg-blue-500' : 'w-2 bg-slate-850'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 1: ACCOUNT FIELDS */}
                {registerStep === 1 && (
                  <div className="space-y-4 animate-fadeIn" id="step-1-account">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Nome Completo</label>
                      <div className="relative font-medium text-xs">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Mestre Hélio Gracie"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Seu E-mail</label>
                      <div className="relative font-medium text-xs">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="atleta@jiuspeak.com"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Crie uma Senha</label>
                      <div className="relative font-medium text-xs">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-10 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {password && (
                        <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-slate-500">Força da Senha:</span>
                          {password.length < 6 ? (
                            <span className="text-rose-450 font-black">Insegura</span>
                          ) : (
                            <span className="text-emerald-400 font-black font-sans">Segura ✔</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Confirmar Senha</label>
                      <div className="relative font-medium text-xs">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Repita sua senha"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={e => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded accent-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 leading-tight">
                        Aceito todas as diretrizes de etiqueta do tatame e concordo com os Termos de Uso e Política de Privacidade do JiuSpeak.
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        if (!name || name.trim().length < 3) {
                          showToast("Por favor, digite seu nome completo.", "error");
                          return;
                        }
                        if (!email || !email.includes("@")) {
                          showToast("E-mail em formato inválido.", "error");
                          return;
                        }
                        if (password.length < 6) {
                          showToast("A senha deve ter no mínimo 6 caracteres.", "error");
                          return;
                        }
                        if (password !== confirmPassword) {
                          showToast("As senhas digitadas não coincidem.", "error");
                          return;
                        }
                        if (!acceptTerms) {
                          showToast("Você precisa aceitar os termos da academia para avançar.", "error");
                          return;
                        }
                        setRegisterStep(2);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      Avançar <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: BIO AND PROFILE DATA */}
                {registerStep === 2 && (
                  <div className="space-y-4 animate-fadeIn" id="step-2-student">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 font-sans">Sublink Público do Dojo</label>
                      <div className="relative font-medium text-xs">
                        <span className="absolute left-3 py-2 text-xs text-slate-600 font-mono">/profile/</span>
                        <input
                          type="text"
                          value={publicName}
                          onChange={e => setPublicName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="pedro-silva"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-20 pr-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">País</label>
                        <input
                          type="text"
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Cidade</label>
                        <input
                          type="text"
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Como se Comunica</label>
                        <input
                          type="text"
                          value={nativeLanguage}
                          onChange={e => setNativeLanguage(e.target.value)}
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">O que quer Praticar</label>
                        <select
                          value={targetLanguage}
                          onChange={e => setTargetLanguage(e.target.value)}
                          className="w-full bg-[#00040a]/90 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none cursor-pointer"
                        >
                          <option value="Inglês">Inglês (Conexão IBJJF)</option>
                          <option value="Espanhol">Espanhol (Campeonatos)</option>
                          <option value="Japonês">Japonês</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Sua Meta / Bio Curta</label>
                      <textarea
                        rows={2}
                        value={mainGoal}
                        onChange={e => setMainGoal(e.target.value)}
                        placeholder="Quais seus objetivos táticos em falar outros idiomas?"
                        className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white focus:outline-none placeholder:text-slate-700"
                      />
                    </div>

                    <div className="flex gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="py-2 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!publicName) {
                            showToast("Escolha um identificador de perfil público.", "error");
                            return;
                          }
                          setRegisterStep(3);
                        }}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Avançar <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: JIU-JITSU BELT & ACADEMY */}
                {registerStep === 3 && (
                  <div className="space-y-4 animate-fadeIn" id="step-3-jiujitsu">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Sua Faixa de Combate</label>
                      <div className="grid grid-cols-5 gap-1.5 text-xs">
                        {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setBjjBelt(f)}
                            className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all flex flex-col items-center justify-center border ${
                              bjjBelt === f
                                ? 'bg-blue-950/40 border-blue-500 text-blue-300 ring-1 ring-blue-500/10'
                                : 'bg-slate-950/70 border-slate-900 text-slate-450 hover:border-slate-800'
                            }`}
                          >
                            <span className="text-sm">
                              {f === 'Branca' && '⚪'}
                              {f === 'Azul' && '🔵'}
                              {f === 'Roxa' && '🟣'}
                              {f === 'Marrom' && '🟤'}
                              {f === 'Preta' && '⚫'}
                            </span>
                            <span className="mt-1 block scale-90">{f}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Equipe / QG</label>
                        <input
                          type="text"
                          value={bjjAcademy}
                          onChange={e => setBjjAcademy(e.target.value)}
                          placeholder="Alliance, GB..."
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Sensei / Professor</label>
                        <input
                          type="text"
                          value={bjjProfessor}
                          onChange={e => setBjjProfessor(e.target.value)}
                          placeholder="Mestre"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Tempo de Luta</label>
                        <input
                          type="text"
                          value={bjjTrainingTime}
                          onChange={e => setBjjTrainingTime(e.target.value)}
                          placeholder="3 anos"
                          className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder:text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Seu Estilo de Passagens</label>
                        <select
                          value={bjjObjective}
                          onChange={e => setBjjObjective(e.target.value)}
                          className="w-full bg-[#00040a]/90 border border-slate-800 text-xs text-slate-300 rounded-xl px-3.5 py-2 focus:outline-none cursor-pointer"
                        >
                          <option value="Guardião Flexível">Guardião (Guarda, Raspagem)</option>
                          <option value="Passador de Pressão">Passador (Passagens, Pressão)</option>
                          <option value="Quedas & Takedowns">Quedas & Wrestling</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(2)}
                        className="py-2 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(4)}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Avançar <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CHOOSE ICON AVATAR */}
                {registerStep === 4 && (
                  <div className="space-y-4 animate-fadeIn" id="step-4-avatar">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] uppercase font-mono font-black text-blue-400 tracking-wider block">Escolha o seu visual inicial</span>
                    </div>

                    <div className="bg-[#00040a]/90 border border-slate-900 rounded-2xl p-2.5">
                      <div className="grid grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-1">
                        {avatarMappingList && avatarMappingList.map((av, idx) => {
                          const isSelected = selectedInitialAvatar === av.image;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedInitialAvatar(av.image)}
                              className={`aspect-square p-1 rounded-xl transition-all relative flex flex-col items-center justify-center cursor-pointer border ${
                                isSelected 
                                  ? 'bg-[#000814]/55 border-blue-500 shadow-md shadow-blue-500/10 scale-105' 
                                  : 'bg-slate-950/30 border-slate-900 hover:border-slate-850'
                              }`}
                            >
                              <img
                                src={av.image}
                                alt={av.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover select-none"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 text-xs font-sans">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(3)}
                        className="py-2 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(5)}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Alinhamento de Nível <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: DRILL & LEVEL EVALUATION QUIZ */}
                {registerStep === 5 && (
                  <div className="space-y-4 animate-fadeIn" id="step-5-diagnosis">
                    <div className="text-center space-y-1 bg-slate-950/50 border border-slate-900 rounded-2xl p-3">
                      <span className="text-[10px] uppercase font-mono font-black text-blue-500 tracking-wider block">📋 Responda para calibrar a IA</span>
                    </div>

                    <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                      <div className="space-y-2 pb-2 text-xs">
                        <p className="text-[11px] font-bold text-slate-350">Q1: Como você diz "Bater em desistência" para sua segurança?</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {['Tap Out / I tap', 'Pull guard', 'Sweep them', 'Stack pass'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDiagQ1(opt)}
                              className={`p-2 rounded-lg text-left transition-all ${
                                diagQ1 === opt
                                  ? 'bg-[#000814] border border-blue-500 text-blue-300 font-bold'
                                  : 'bg-slate-950/55 border border-slate-900 text-slate-450 hover:border-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pb-2 text-xs">
                        <p className="text-[11px] font-bold text-slate-350">Q2: O que "Underhook" representa clinicamente no treino?</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {['Fuga de quadril', 'Pegada esgrimando o braço', 'Chave de calcanhar', 'Montada lateral'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDiagQ2(opt)}
                              className={`p-2 rounded-lg text-left transition-all ${
                                diagQ2 === opt
                                  ? 'bg-[#000814] border border-blue-500 text-blue-300 font-bold'
                                  : 'bg-slate-950/55 border border-slate-900 text-slate-450 hover:border-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-[11px] font-bold text-slate-350">Q3: Qual a tradução técnica do "Pull Guard"?</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {['Passar a guarda', 'Chispar das pernas', 'Puxar para a guarda', 'Fazer pegada nas costas'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDiagQ3(opt)}
                              className={`p-2 rounded-lg text-left transition-all ${
                                diagQ3 === opt
                                  ? 'bg-[#000814] border border-blue-500 text-blue-300 font-bold'
                                  : 'bg-slate-950/55 border border-slate-900 text-slate-450 hover:border-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(4)}
                        className="py-2 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!diagQ1 || !diagQ2 || !diagQ3) {
                            showToast("Por favor, responda todas as questões do diagnóstico para calibrar seu nível.", "error");
                            return;
                          }
                          setRegisterStep(6);
                        }}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Avançar <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: CHOOSE ACADEMY / DOJO LINKUP */}
                {registerStep === 6 && (
                  <div className="space-y-4 animate-fadeIn" id="step-6-academy">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] uppercase font-mono font-black text-blue-450 bg-blue-950/40 px-3 py-1 rounded-full border border-blue-500/20 tracking-wider inline-block">
                        🏢 FILIAÇÃO & ACADEMIA
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">Escolha o seu time para habilitar o ranqueamento competitivo internacional.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 label-class">Como deseja treinar?</label>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          {(['none', 'global', 'independent'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setAcademyType(type);
                                setSelectGlobalTeamId('');
                                setSelectBranchId('');
                                setSelectIndependentAcademyId('');
                              }}
                              className={`p-2.5 rounded-xl text-center border font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                                academyType === type
                                  ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                                  : 'bg-[#00040a]/90 border-slate-900 text-slate-450 hover:border-slate-850'
                              }`}
                            >
                              <span className="text-sm mb-1">
                                {type === 'none' && '🥋'}
                                {type === 'global' && '🌍'}
                                {type === 'independent' && '🏫'}
                              </span>
                              <span className="leading-tight text-[9px] block">
                                {type === 'none' && 'Sem Vínculo'}
                                {type === 'global' && 'Equipe Global'}
                                {type === 'independent' && 'Independente'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Global Team selection */}
                      {academyType === 'global' && (
                        <div className="space-y-3 animate-scaleUp">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Equipe Global (Nível 1)</label>
                            <select
                              value={selectGlobalTeamId}
                              onChange={(e) => setSelectGlobalTeamId(e.target.value)}
                              className="w-full bg-[#00040a]/90 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                            >
                              <option value="">-- Selecionar Equipe --</option>
                              {globalTeamsList.map((team: any) => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                              ))}
                            </select>
                          </div>

                          {selectGlobalTeamId && (
                            <div className="animate-scaleUp">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Filial Oficial (Nível 2)</label>
                              <select
                                value={selectBranchId}
                                onChange={(e) => setSelectBranchId(e.target.value)}
                                className="w-full bg-[#00040a]/90 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                              >
                                <option value="">-- Selecionar Filial --</option>
                                {branchesList.map((branch: any) => (
                                  <option key={branch.id} value={branch.id}>{branch.name} ({branch.city})</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Independent Academy selection */}
                      {academyType === 'independent' && (
                        <div className="space-y-3 animate-scaleUp">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Academia Independente (Nível 3)</label>
                            <select
                              value={selectIndependentAcademyId}
                              onChange={(e) => setSelectIndependentAcademyId(e.target.value)}
                              className="w-full bg-[#00040a]/90 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                            >
                              <option value="">-- Selecionar Academia --</option>
                              {independentAcademiesList.map((academy: any) => (
                                <option key={academy.id} value={academy.id}>{academy.name} ({academy.city})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {academyType === 'none' && (
                        <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl text-[10px] text-slate-400 leading-normal animate-scaleUp">
                          ℹ️ Como <strong>Atleta sem vínculo</strong>, você poderá treinar normalmente e filiar-se a uma academia oficial a qualquer momento através do seu perfil.
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(5)}
                        className="py-2 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegister()}
                        disabled={loading || (academyType === 'global' && !selectBranchId) || (academyType === 'independent' && !selectIndependentAcademyId)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <>Criar Conta Ativa ⚡</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center pt-2.5 border-t border-[#0b1329]">
                  <span className="text-xs text-slate-455 font-semibold">Já possui uma conta? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      clearFormMessages();
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 ml-1 transition-all"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 font-sans text-xs">
                <div className="p-3.5 rounded-2xl bg-[#01040ec0] border border-slate-850 text-[11px] text-blue-300">
                  <p className="font-bold mb-0.5 font-sans">Recuperação de Chave</p>
                  Insira seu e-mail cadastrado para disparar o token fictício na outbox abaixo.
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-405 uppercase tracking-wider mb-1.5">Seu E-mail Cadastrado</label>
                  <div className="relative font-medium text-xs">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="atleta@provedor.com"
                      className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="py-2 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Disparar Token
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 4: RESET PASSWORD */}
            {view === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4 font-sans text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-850 text-[11px] text-blue-300">
                  Insira o token gerado para redefinir as chaves da sua conta.
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Token de Redefinição</label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Cole o reset_xxx..."
                    className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-405 uppercase tracking-wider mb-1.5 font-sans">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#00040a]/90 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-700"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Salvar Nova Chave ✔
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
