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
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify'>('login');
  
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
  
  // Password Recovery / Verification fields
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>([]);

  // Interactive FREE LESSON mock state
  const [showFreeLesson, setShowFreeLesson] = useState(false);
  const [trialStep, setTrialStep] = useState(0);
  const [trialMicSuccess, setTrialMicSuccess] = useState<boolean | null>(null);
  const [trialIsRecording, setTrialIsRecording] = useState(false);

  // Periodically fetch simulated emails so user is never lost
  const fetchSimulatedEmails = async () => {
    try {
      const res = await fetch('/api/dev/emails');
      if (res.ok) {
        const data = await res.json();
        setSimulatedEmails(data.emails || []);
      }
    } catch (e) {
      console.warn('Sandbox simulated email loader API is not accessible yet.', e);
    }
  };

  useEffect(() => {
    fetchSimulatedEmails();
    const timer = setInterval(fetchSimulatedEmails, 5000);
    return () => clearInterval(timer);
  }, [view]);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
        academy: bjjAcademy || "Atama Virtual Team",
        professor: bjjProfessor || "Nenhum",
        belt: bjjBelt,
        stripes: 0,
        trainingTime: bjjTrainingTime || "Iniciante",
        goalsBjj: bjjObjective || "Aprender as técnicas em inglês",
        realPhoto: selectedInitialAvatar || "",
        cefrLevel: cefrLevel || "A1",
        diagnosticScore: scoreDiagnostico || 0,
        achievements: ["first_armlock_onboarding"]
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
          isEmailVerified: true
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

      setSuccessMsg('Instruções de redefinição foram simuladas para a sua caixa postal abaixo.');
      showToast('E-mail de redefinição enviado para a outbox!', 'success');
      setView('reset');
      fetchSimulatedEmails();
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

  // Submit direct e-mail verification token
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Por favor, informe o token de verificação.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetchWithCsrf('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Token inválido.');
      }

      setSuccessMsg(data.message || 'E-mail verificado com sucesso!');
      showToast('Conta ativada com sucesso! Oss.', 'success');
      setToken('');
      setView('login');
    } catch (err: any) {
      setErrorMsg(err.message);
      showToast('Erro na ativação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fast evaluation helper: clicking on simulated outgoing email logs instantly fills tokens!
  const handleApplySimulatedEmail = (sim: SimulatedEmail) => {
    if (sim.subject.includes('Confirme')) {
      setView('verify');
      setToken(sim.token);
      showToast('Token de confirmação de e-mail copiado da caixa postal simulada!', 'info');
    } else if (sim.subject.includes('Recuperação')) {
      setView('reset');
      setToken(sim.token);
      showToast('Token de redefinição de senha copiado com sucesso!', 'info');
    }
  };

  const handleClearInbox = async () => {
    await fetch('/api/dev/emails/clear', { method: 'POST' });
    setSimulatedEmails([]);
    showToast('Caixa de correio simulada esvaziada.', 'info');
  };

  // Play audio TTS for the Free Lesson Preview
  const speakPreviewPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      showToast("Fale o termo logo após escutar!", "info");
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

  // Scroll to Auth widget
  const scrollToRegister = () => {
    const el = document.getElementById('auth-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setView('register');
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById('auth-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setView('login');
    }
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

  return (
    <div className="w-full flex flex-col items-stretch min-h-screen" id="home-landing-page">
      
      {/* BRAND HEADER NAVIGATION BAR */}
      <nav className="bg-slate-950/85 backdrop-blur-md border-b border-indigo-950/40 py-4 px-6 md:px-12 sticky top-0 z-50 flex items-center justify-between" id="landing-navbar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/35 flex items-center justify-center text-xl">
            🥋
          </div>
          <div>
            <span className="text-xl font-display font-extrabold text-white tracking-tight">JiuSpeak</span>
            <span className="ml-1.5 px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[9px] font-mono font-bold tracking-widest uppercase">
              English Platform
            </span>
          </div>
        </div>

        {/* Anchors links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#como-funciona" className="hover:text-violet-400 transition-colors">Como Funciona</a>
          <a href="#o-que-aprender" className="hover:text-violet-400 transition-colors">O que você vai aprender</a>
          <a href="#depoimentos" className="hover:text-violet-400 transition-colors">Depoimentos</a>
          <a href="#planos" className="hover:text-violet-400 transition-colors">Planos</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={scrollToLogin}
            className="text-xs font-semibold px-4 py-2 hover:text-white text-slate-300 transition-all cursor-pointer"
          >
            Entrar
          </button>
          <button 
            onClick={scrollToRegister}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-violet-500/10 cursor-pointer"
          >
            Criar Conta
          </button>
        </div>
      </nav>

      {/* HERO SECTION CONTAINER */}
      <section className="relative py-12 md:py-24 px-6 md:px-12 xl:px-20 bg-gradient-to-br from-[#060912] via-[#090d1c] to-[#04060b] overflow-hidden" id="hero-section">
        
        {/* Animated ambient backdrop glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-505/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero info text column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              <span>O Primeiro Método Gamificado de Inglês Marcial</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-[1.1] tracking-tight">
              Learn <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-white">
                Jiu-Jitsu English.
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Aprenda o inglês usado em academias, seminários e campeonatos internacionais. Desenvolva conversação real de tatame e conquiste respeito no exterior.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button 
                onClick={() => {
                  setShowFreeLesson(true);
                  // scroll to lesson section
                  setTimeout(() => {
                    document.getElementById('free-lesson-interactive')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-violet-500/20 text-violet-300 hover:text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-violet-400" />
                Aula Gratuita
              </button>

              <button 
                onClick={scrollToRegister}
                className="px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                Começar Agora
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg border-t border-slate-900 text-center sm:text-left">
              <div>
                <span className="block text-2xl font-black text-white">5 Níveis</span>
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Do Branco ao Preto</span>
              </div>
              <div className="border-x border-slate-900/60 px-4">
                <span className="block text-2xl font-black text-white">300+ Termos</span>
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Vocabulários Técnicos</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">100% Real</span>
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Áudio e Pronúncia</span>
              </div>
            </div>
          </div>

          {/* Right Hero login/registration component column (Preserving All Logic) */}
          <div className="lg:col-span-5" id="auth-section">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl" />

              {/* View Selection Headers */}
              <div className="flex items-center bg-slate-900/50 p-1 rounded-xl mb-6 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setView('login'); clearFormMessages(); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    view === 'login' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setView('register'); clearFormMessages(); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    view === 'register' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* User notifications block */}
              {/* User notifications block */}
              {errorMsg && (
                <div className="p-4 mb-5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-200 text-sm leading-snug">
                        {errorMsg}
                      </p>
                      <p className="text-[11px] text-red-300/80 mt-1 leading-snug">
                        {errorMsg.toLowerCase() === 'usuário não encontrado' && (
                          <span>O e-mail digitado não está registrado. Deseja criar uma conta rápida clicando na aba <strong>Criar Conta</strong>?</span>
                        )}
                        {errorMsg.toLowerCase() === 'senha incorreta' && (
                          <span>A senha fornecida está incorreta para este usuário. Se você esqueceu, clique em <strong>Esqueci minha senha</strong> abaixo.</span>
                        )}
                        {errorMsg.toLowerCase() === 'conta bloqueada' && (
                          <span>Esta conta está suspensa ou bloqueada permanentemente pelos administradores da plataforma por violações de termos ou segurança.</span>
                        )}
                        {errorMsg.toLowerCase() === 'conta suspensa' && (
                          <span>Esta conta está suspensa temporariamente por infração das diretrizes da comunidade. Favor entrar em contato.</span>
                        )}
                        {errorMsg.toLowerCase() === 'banco indisponível' && (
                          <span>Incapaz de estabelecer conexão com nosso banco de dados PostgreSQL. Por favor, tente novamente em alguns segundos ou contate o suporte.</span>
                        )}
                        {errorMsg.toLowerCase() === 'csrf inválido' && (
                          <span>Sua assinatura de segurança Anti-CSRF expirou por inatividade. A página tentará revalidar sua sessão automaticamente.</span>
                        )}
                        {errorMsg.toLowerCase() === 'token expirado' && (
                          <span>Sua sessão de acesso expirou. Por favor, digite suas credenciais para segurança.</span>
                        )}
                        {!['usuário não encontrado', 'senha incorreta', 'conta bloqueada', 'conta suspensa', 'banco indisponível', 'csrf inválido', 'token expirado'].includes(errorMsg.toLowerCase()) && (
                          <span>Ocorreu uma inconsistência ao processar sua solicitação de autenticação. Por favor, verifique os dados digitados ou tente recarregar.</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Premium SaaS Contextual Call-to-actions based on error states */}
                  {errorMsg.toLowerCase() === 'usuário não encontrado' && (
                    <button
                      onClick={() => { setView('register'); clearFormMessages(); }}
                      type="button"
                      className="mt-1 self-start px-2.5 py-1 text-[10px] uppercase font-bold text-violet-400 border border-violet-500/30 hover:bg-violet-950/40 rounded transition-all cursor-pointer"
                    >
                      Ir para Registro
                    </button>
                  )}
                  {errorMsg.toLowerCase() === 'senha incorreta' && (
                    <button
                      onClick={() => { setView('forgot'); clearFormMessages(); }}
                      type="button"
                      className="mt-1 self-start px-2.5 py-1 text-[10px] uppercase font-bold text-amber-400 border border-amber-500/30 hover:bg-amber-950/40 rounded transition-all cursor-pointer"
                    >
                      Recuperar Minha Senha
                    </button>
                  )}
                  {errorMsg.toLowerCase() === 'banco indisponível' && (
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const testRes = await fetch('/api/health');
                          if (testRes.ok) {
                            showToast('Conexão restabelecida! Tente seu login novamente.', 'success');
                            clearFormMessages();
                          } else {
                            showToast('O banco continua respondendo de forma limitada.', 'error');
                          }
                        } catch (e) {
                          showToast('Sem conexão de infraestrutura.', 'error');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      type="button"
                      className="mt-1 self-start px-2.5 py-1 text-[10px] uppercase font-bold text-sky-400 border border-sky-500/30 hover:bg-sky-950/40 rounded transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" /> Testar Status de Instabilidade
                    </button>
                  )}
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 mb-5 rounded-xl bg-emerald-955/35 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="font-medium leading-snug">{successMsg}</p>
                </div>
              )}

              {/* VIEW 1: LOGIN */}
              {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço de E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-[9px] font-mono text-violet-400 hover:text-violet-300 cursor-pointer"
                      >
                        Esqueceu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Sua senha secreta de acesso"
                        className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-10 py-2.5 text-xs text-white focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-violet-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <>Log In para Treinar <ArrowRight className="w-4.5 h-4.5" /></>}
                  </button>


                </form>
              )}

              {/* VIEW 2: REGISTER (5-STAGE PREMIUM ONBOARDING WIZARD) */}
              {view === 'register' && (
                <div className="space-y-5" id="onboarding-wizard-container">
                  {/* Progress tracker */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase">
                      <span>Etapa {registerStep} de 5</span>
                      <span className="text-violet-400 font-extrabold">
                        {registerStep === 1 && "Criar Conta Mestra"}
                        {registerStep === 2 && "Perfil de Estudante"}
                        {registerStep === 3 && "Identidade de Jiu-Jitsu"}
                        {registerStep === 4 && "Escolha o seu Avatar"}
                        {registerStep === 5 && "Diagnóstico de Idioma"}
                      </span>
                    </div>
                    {/* Visual Segmented Progress Bar */}
                    <div className="grid grid-cols-5 gap-1.5 h-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`h-full rounded-full transition-all duration-300 ${
                            s <= registerStep ? 'bg-violet-500 shadow-sm shadow-violet-500/20' : 'bg-slate-900'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* STEP 1: CREATE ACCOUNT */}
                  {registerStep === 1 && (
                    <div className="space-y-4 animate-fadeIn" id="step-1-account">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={name}
                            onChange={e => {
                              setName(e.target.value);
                              // Auto sync initial publicName
                              setPublicName(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                            }}
                            placeholder="Ex: Pedro Silva Gracie"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-600 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço de E-mail</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="exemplo@jiuspeak.com"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-600 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sua Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Mínimo de 6 caracteres"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-10 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-650 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* REACTIVE STRENGTH INDICATOR */}
                        {password.length > 0 && (
                          <div className="mt-2 space-y-1.5 animate-fadeIn">
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>Segurança da Senha:</span>
                              <span className={`font-black uppercase tracking-wider ${
                                password.length < 6 ? 'text-rose-400' :
                                password.length < 9 ? 'text-amber-405' : 'text-emerald-450'
                              }`}>
                                {password.length < 6 ? 'Fraca (Muito Curta)' :
                                 password.length < 9 ? 'Média (Aceitável)' : 'Forte (Excelente)'}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 h-1">
                              <div className={`h-full rounded-full ${password.length >= 1 ? 'bg-rose-500' : 'bg-slate-900'}`} />
                              <div className={`h-full rounded-full ${password.length >= 6 ? 'bg-amber-400' : 'bg-slate-900'}`} />
                              <div className={`h-full rounded-full ${password.length >= 9 ? 'bg-emerald-400' : 'bg-slate-900'}`} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirmar Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repita sua senha exatamente"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-600 font-medium"
                          />
                        </div>
                      </div>

                      {/* Terms check */}
                      <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={e => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 rounded accent-violet-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-400 leading-tight group-hover:text-slate-350 transition-colors">
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
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-violet-500/15"
                      >
                        Próxima Etapa <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: STUDENT PROFILE */}
                  {registerStep === 2 && (
                    <div className="space-y-4 animate-fadeIn" id="step-2-student">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome de Perfil Público (URL única)</label>
                        <div className="relative">
                          <span className="absolute left-3 py-2 text-xs text-slate-500 font-mono">/profile/</span>
                          <input
                            type="text"
                            value={publicName}
                            onChange={e => setPublicName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="pedro-silva"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-20 pr-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Este identificador será o seu link público no dojo jiuspeak.com.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">País</label>
                          <input
                            type="text"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cidade</label>
                          <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Idioma Nativo</label>
                          <input
                            type="text"
                            value={nativeLanguage}
                            onChange={e => setNativeLanguage(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Idioma para Praticar</label>
                          <select
                            value={targetLanguage}
                            onChange={e => setTargetLanguage(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none cursor-pointer"
                          >
                            <option value="Inglês">Inglês (Conexão IBJJF & USA)</option>
                            <option value="Espanhol">Espanhol (Campeonatos Americanos)</option>
                            <option value="Japonês">Japonês (Dojo Raiz do Jiu-Jitsu)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Seu Perfil / Bio Curta (Resumo Acadêmico)</label>
                        <textarea
                          rows={2}
                          value={mainGoal}
                          onChange={e => setMainGoal(e.target.value)}
                          placeholder="Qual o seu objetivo conectando esportes e novos idiomas?"
                          className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-white focus:outline-none placeholder:text-slate-600"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(1)}
                          className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!publicName) {
                              showToast("Escolha um identificador público de perfil.", "error");
                              return;
                            }
                            setRegisterStep(3);
                          }}
                          className="flex-1 py-2.5 bg-violet-650 hover:bg-violet-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Avançar para Jiu-Jitsu <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: JIU-JITSU PROFILE */}
                  {registerStep === 3 && (
                    <div className="space-y-4 animate-fadeIn" id="step-3-jiujitsu">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sua Faixa Atual (Jiu-Jitsu Belt)</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setBjjBelt(f)}
                              className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center border ${
                                bjjBelt === f
                                  ? 'bg-violet-950/40 border-violet-500 text-violet-300 ring-1 ring-violet-500/20'
                                  : 'bg-slate-950/70 border-slate-900 text-slate-400 hover:border-slate-800'
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

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academia / Dojo</label>
                          <input
                            type="text"
                            value={bjjAcademy}
                            onChange={e => setBjjAcademy(e.target.value)}
                            placeholder="Alliance, Gracie Barra..."
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Professor Responsável</label>
                          <input
                            type="text"
                            value={bjjProfessor}
                            onChange={e => setBjjProfessor(e.target.value)}
                            placeholder="Mestre / Sensei"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tempo de Prática</label>
                          <input
                            type="text"
                            value={bjjTrainingTime}
                            onChange={e => setBjjTrainingTime(e.target.value)}
                            placeholder="Ex: 3 anos"
                            className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estilo Desejado</label>
                          <select
                            value={bjjObjective}
                            onChange={e => setBjjObjective(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-800 text-xs text-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none cursor-pointer"
                          >
                            <option value="Guardião Flexível">Guardião (Guarda Fechada, Berimbolo)</option>
                            <option value="Passador de Pressão">Passador (Passagem de Pressão, Cruzada)</option>
                            <option value="Quedas & Wrestling">Quedas (Judô, Wrestling)</option>
                            <option value="Completo e Defensivo">Completo / Híbrido</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(2)}
                          className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterStep(4)}
                          className="flex-1 py-2.5 bg-violet-650 hover:bg-violet-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Escolher Avatar <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: CHOOSE INITIAL AVATAR */}
                  {registerStep === 4 && (
                    <div className="space-y-4 animate-fadeIn" id="step-4-avatar">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] uppercase font-mono font-black text-violet-400 tracking-wider block">Selecione o seu Avatar Inicial</span>
                        <p className="text-[11px] text-slate-400">Escolha o visual que ilustrará sua jornada nos rankings e no chat.</p>
                      </div>

                      {/* Unified selection grid displaying avatars */}
                      <div className="bg-[#040810] border border-slate-900 rounded-2xl p-3">
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-56 overflow-y-auto pr-1">
                          {avatarMappingList && avatarMappingList.map((av, index) => {
                            const isSelected = selectedInitialAvatar === av.image;
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedInitialAvatar(av.image)}
                                className={`aspect-square p-1 rounded-xl transition-all relative flex flex-col items-center justify-center cursor-pointer border ${
                                  isSelected 
                                    ? 'bg-violet-950/50 border-violet-500 shadow-md shadow-violet-500/20 scale-105' 
                                    : 'bg-slate-900/30 border-slate-850 hover:border-slate-800'
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1 text-[11px] animate-bounce">🛡️</span>
                                )}
                                <img
                                  src={av.image}
                                  alt={av.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover select-none"
                                />
                                <span className="text-[8px] mt-1 text-slate-400 truncate max-w-full block text-center font-mono">{av.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Preview selected avatar info */}
                      {selectedInitialAvatar && (
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-violet-950/25 border border-violet-500/15 animate-fadeIn">
                          <img
                            src={selectedInitialAvatar}
                            alt="Visual"
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500/30"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Equipamento Selecionado</span>
                            <span className="text-[10px] text-violet-400 font-mono">Este avatar será ativado imediatamente após o diagnóstico de nível.</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(3)}
                          className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterStep(5)}
                          className="flex-1 py-2.5 bg-violet-650 hover:bg-violet-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Ir para Nivelamento <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: LANGUAGE DIAGNOSIS */}
                  {registerStep === 5 && (
                    <div className="space-y-4 animate-fadeIn" id="step-5-diagnosis">
                      <div className="text-center space-y-1 bg-violet-950/20 border border-violet-900/30 rounded-2xl p-3">
                        <span className="text-[10px] uppercase font-mono font-black text-violet-400 tracking-wider block">📋 Diagnóstico de Inglês para Tatame</span>
                        <h4 className="text-xs font-bold text-white">Descubra sua classificação no padrão internacional CEFR</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Responda a este teste rápido de vocabulário técnico aplicados em torneios gringos.
                        </p>
                      </div>

                      {/* Diagnóstico Questions */}
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                        {/* Q1 */}
                        <div className="space-y-2 border-b border-slate-900 pb-3">
                          <p className="text-[11px] font-bold text-slate-300">
                            Q1: Como você diz "Bater em desistência" para sua segurança no exterior?
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {['Tap Out / I tap', 'Pull guard', 'Sweep them', 'Stack pass'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setDiagQ1(opt)}
                                className={`p-2 rounded-lg text-[10px] text-left transition-all font-sans cursor-pointer ${
                                  diagQ1 === opt
                                    ? 'bg-violet-900/40 border border-violet-500 text-violet-300 font-semibold'
                                    : 'bg-slate-950/50 border border-slate-900 text-slate-400 hover:border-slate-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Q2 */}
                        <div className="space-y-2 border-b border-slate-900 pb-3">
                          <p className="text-[11px] font-bold text-slate-300">
                            Q2: O que "Underhook" representa durante uma aula internacional?
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {['Fuga de quadril', 'Pegada esgrimando o braço', 'Chave de calcanhar', 'Montada lateral'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setDiagQ2(opt)}
                                className={`p-2 rounded-lg text-[10px] text-left transition-all font-sans cursor-pointer ${
                                  diagQ2 === opt
                                    ? 'bg-violet-900/40 border border-violet-500 text-violet-300 font-semibold'
                                    : 'bg-slate-950/50 border border-slate-900 text-slate-400 hover:border-slate-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Q3 */}
                        <div className="space-y-2 pb-1">
                          <p className="text-[11px] font-bold text-slate-300">
                            Q3: Qual a correspondência perfeita de "Pull Guard"?
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {['Passar a guarda', 'Chispar das pernas', 'Puxar para a guarda', 'Fazer pegada nas costas'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setDiagQ3(opt)}
                                className={`p-2 rounded-lg text-[10px] text-left transition-all font-sans cursor-pointer ${
                                  diagQ3 === opt
                                    ? 'bg-violet-900/40 border border-violet-500 text-violet-300 font-semibold'
                                    : 'bg-slate-950/50 border border-slate-900 text-slate-400 hover:border-slate-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Display Computed Score and CEFR Level */}
                      {diagQ1 && diagQ2 && diagQ3 && (
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/35 rounded-2xl animate-scaleUp text-center space-y-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">🎯 Classificação Técnica Computada</span>
                          <h5 className="text-lg font-black text-white">
                            {(() => {
                              let count = 0;
                              if (diagQ1 === 'Tap Out / I tap') count++;
                              if (diagQ2 === 'Pegada esgrimando o braço') count++;
                              if (diagQ3 === 'Puxar para a guarda') count++;
                              
                              let bjjCefr = 'A1';
                              let bjjExp = 'White Belt do Inglês (Básico)';
                              if (count === 3) {
                                bjjCefr = 'C1';
                                bjjExp = 'Black Belt do Inglês (Avançado)';
                              } else if (count >= 1) {
                                bjjCefr = 'B1';
                                bjjExp = 'Purple Belt do Inglês (Intermediário)';
                              }
                              
                              if (cefrLevel !== bjjCefr) {
                                setCefrLevel(bjjCefr);
                                setScoreDiagnostico(count);
                              }
                              return (
                                <span className="flex flex-col items-center gap-1">
                                  <span className="text-2xl tracking-widest text-[#10b981] font-black">{bjjCefr}</span>
                                  <span className="text-xs font-semibold text-slate-300 italic">"{bjjExp}"</span>
                                </span>
                              );
                            })()}
                          </h5>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(4)}
                          className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={handleRegister}
                          disabled={loading || !diagQ1 || !diagQ2 || !diagQ3}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <>Ativar Aluno & Entrar no Dojô ⚡</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Switch to login */}
                  <div className="text-center pt-2.5 border-t border-slate-900/60">
                    <span className="text-xs text-slate-400">Já possui uma conta de atleta? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        clearFormMessages();
                      }}
                      className="text-xs font-bold text-violet-400 hover:text-violet-300 ml-1 transition-all"
                    >
                      Login
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: FORGOT PASSWORD */}
              {view === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/40 text-[11px] text-violet-300">
                    <p className="font-bold mb-1">Recuperação de Acesso</p>
                    Insira seu e-mail cadastrado para gerar um token seguro de restauração imediata na outbox simulada do painel.
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Seu E-mail Cadastrado</label>
                    <div className="relative font-medium">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="nome@provedor.com"
                        className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      Avançar
                    </button>
                  </div>
                </form>
              )}

              {/* VIEW 4: RESET PASSWORD WITH TOKEN */}
              {view === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="p-3 rounded-xl bg-violet-955/20 border border-violet-550/20 text-[11px] text-violet-300">
                    Digite o token recebido e redefina os parâmetros da sua chave de produção.
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Código de Token</label>
                    <input
                      type="text"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      placeholder="v_xxx ou reset_xxx da outbox fictícia"
                      className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                  >
                    Confirmar Nova Senha
                  </button>
                </form>
              )}

              {/* VIEW 5: VERIFY EMAIL */}
              {view === 'verify' && (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/20 text-[11px] text-violet-200">
                    <p className="font-bold text-violet-400 mb-1">📬 Verificação Obrigatória</p>
                    Copie o link ou token de ativação na outbox simulada (rodapé) para liberar o seu login.
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Token de Confirmação</label>
                    <div className="relative">
                      <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="text"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="Informe o token 'v_xxx...'"
                        className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-violet-500 rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="py-2.5 px-4 bg-slate-900 border border-slate-850 text-slate-400 rounded-xl text-xs font-bold"
                    >
                      Login
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-550 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Ativar Atleta ⚡
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* INTERACTIVE MOCK MINI LESS-PLAY "AULA GRATUITA" */}
      {showFreeLesson && (
        <section className="py-12 px-6 md:px-12 bg-slate-950/90 border-t border-b border-indigo-950/60" id="free-lesson-interactive">
          <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl border border-violet-500/30 p-6 md:p-8 space-y-6 relative">
            <button 
              onClick={() => setShowFreeLesson(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-wider font-extrabold block">
                ⭐ Experiência Interativa (Modo Demonstrativo)
              </span>
              <h3 className="text-2xl font-black text-white">Sua Primeira Aula Grátis</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Ouça o comando de áudio técnico gravado e teste sua pronúncia na caixa simulada agora.
              </p>
            </div>

            {/* Trial step layout */}
            <div className="bg-[#080d19] rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>TERMO TÉCNICO {trialStep + 1} DE {sampleLessons.length}:</span>
                <span className="font-bold text-violet-400">FAIXA BRANCA (WHITE BELT)</span>
              </div>

              <div className="py-4 text-center space-y-3">
                <span className="text-3xl font-display font-black text-white tracking-tight block">
                  {sampleLessons[trialStep].term}
                </span>
                <span className="inline-block px-3 py-1 bg-violet-950/50 border border-violet-900/30 rounded-full text-violet-300 font-mono text-xs">
                  {sampleLessons[trialStep].pronunciation}
                </span>
                <p className="text-sm font-semibold text-slate-250">
                  Definição: {sampleLessons[trialStep].meaning}
                </p>
                <p className="text-xs text-slate-450 italic max-w-md mx-auto">
                  💡 {sampleLessons[trialStep].tip}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-3 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => speakPreviewPhrase(sampleLessons[trialStep].term)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <Volume2 className="w-4.5 h-4.5 text-violet-400" />
                  Escutar Pronúncia do Mestre
                </button>

                <button
                  type="button"
                  onClick={simulateMicCheck}
                  disabled={trialIsRecording}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    trialIsRecording 
                     ? 'bg-rose-950/20 border border-rose-500/30 text-rose-300 animate-pulse' 
                     : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}
                >
                  <Mic className="w-4.5 h-4.5 text-white" />
                  {trialIsRecording ? 'Escutando você...' : 'Gravar Minha Voz'}
                </button>
              </div>

              {trialMicSuccess !== null && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
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
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                ← Voltar Termo
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrialStep(prev => prev < sampleLessons.length - 1 ? prev + 1 : 0);
                  setTrialMicSuccess(null);
                }}
                className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white"
              >
                Próximo Termo →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO: COMO FUNCIONA (PROGRESSÃO DAS FAIXAS / JIU-JITSU BELT EXPERIENCE) */}
      <section className="py-20 px-6 md:px-12 bg-[#05070e]" id="como-funciona">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-black">
              Estrutura Curricular Prática
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
              Como Funciona a Progressão
            </h2>
            <p className="text-slate-405 text-sm md:text-base max-w-2xl mx-auto">
              Assim como no jiu-jítsu real, você começa de cima, mas na Faixa Branca de conhecimento técnico de conversação e avança gradualmente até a Faixa Preta.
            </p>
          </div>

          {/* Belt Journey Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* White Belt Card */}
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-5 hover:border-slate-350 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                  ⚪
                </div>
                <h3 className="font-display font-extrabold text-base text-white">White Belt</h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded font-black">
                  Faixa Branca
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Greetings, Numbers, Directions, Body Parts & Basic Commands.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Foque em entender pegadas polidas de combate ("grips"), fuga de quadril e o cumprimento de respeito para rolar solto em qualquer país.
                </p>
              </div>
              <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">Módulo 1</span>
            </div>

            {/* Blue Belt Card */}
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-5 hover:border-blue-600 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-lg text-white shadow-sm">
                  🔵
                </div>
                <h3 className="font-display font-extrabold text-base text-white">Blue Belt</h3>
                <span className="text-[10px] font-mono text-blue-400 uppercase bg-blue-950 px-2 py-0.5 rounded font-black">
                  Faixa Azul
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Drills, Corrections & Postural Training Conversations.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Aprenda as mecânicas de repetição veloz de posições, convites educados de sparring leve ("flow roll") e prevenção coordenada de lesões de punho.
                </p>
              </div>
              <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">Módulo 2</span>
            </div>

            {/* Purple Belt Card */}
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-5 hover:border-purple-600 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-lg text-white shadow-sm">
                  🟣
                </div>
                <h3 className="font-display font-extrabold text-base text-white">Purple Belt</h3>
                <span className="text-[10px] font-mono text-purple-400 uppercase bg-purple-950 px-2 py-0.5 rounded font-black">
                  Faixa Roxa
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Advanced Techniques, Strategy & IBJJF Arbitrage Language.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Domine a língua dos campeonatos estrangeiros. Saiba as regras de pontuação oficial, faltas de amarração ("stalling") ou falsas amarras técnicas.
                </p>
              </div>
              <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">Módulo 3</span>
            </div>

            {/* Brown Belt Card */}
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-5 hover:border-amber-800 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-900 flex items-center justify-center text-lg text-white shadow-sm">
                  🟤
                </div>
                <h3 className="font-display font-extrabold text-base text-white">Brown Belt</h3>
                <span className="text-[10px] font-mono text-amber-500 uppercase bg-amber-950 px-2 py-0.5 rounded font-black">
                  Faixa Marrom
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Teaching Classes, Conducting Warm-ups & Giving Instructions.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Adquira postura com aulas inteiras lecionadas na gringa. Comande aquecimentos, ensine mecânicas de esgrima de braço e peso sobre o queixo.
                </p>
              </div>
              <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">Módulo 4</span>
            </div>

            {/* Black Belt Card */}
            <div className="bg-slate-950/65 border border-slate-900 rounded-2xl p-5 hover:border-red-600 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-red-950 flex items-center justify-center text-lg text-white shadow-sm">
                  ⚫
                </div>
                <h3 className="font-display font-extrabold text-base text-white">Black Belt</h3>
                <span className="text-[10px] font-mono text-red-500 uppercase bg-slate-950 px-2 py-0.5 rounded font-black">
                  Faixa Preta
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Professional Fluency, Podcasts Interviews, Visas & Treaties.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Consagre seu discursos para jornalistas internacionais. Converse com patrocinadores de marcas, negucie vistos de trabalho ou afiliações.
                </p>
              </div>
              <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">Módulo 5</span>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO: O QUE VOCÊ VAI APRENDER */}
      <section className="py-20 px-6 md:px-12 bg-slate-950" id="o-que-aprender">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-black">
                Destaques Do Planejamento Prático
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
                O que você vai aprender
              </h2>
            </div>
            <p className="text-slate-405 text-xs md:text-sm max-w-sm">
              Um currículo focado 100% no estilo de vida do praticante de artes marciais, sem enrolação gramatical chata de livros tradicionais.
            </p>
          </div>

          {/* Grid de 5 aprendizados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* 1. Comandos de treino */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 hover:bg-[#090f23] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl text-violet-400">
                📣
              </div>
              <h3 className="font-display font-extrabold text-sm text-white">Comandos de treino</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Aprenda comandos instantâneos de tatame: início de lutas, controle postural e interrupções seguras por batida rápida (*tap out*).
              </p>
            </div>

            {/* 2. Conversação */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 hover:bg-[#090f23] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl text-violet-400">
                💬
              </div>
              <h3 className="font-display font-extrabold text-sm text-white">Conversação</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Resenha saudável de tatame para trocar feedbacks técnicos polidos de pesos passíveis e convidar lutadores gringos de forma nobre.
              </p>
            </div>

            {/* 3. Aulas internacionais */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 hover:bg-[#090f23] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl text-violet-400">
                🌎
              </div>
              <h3 className="font-display font-extrabold text-sm text-white">Aulas internacionais</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Compreenda a fundo as orientações de seminários e explicações técnicas rápidas de professores nativos ingleses de renome.
              </p>
            </div>

            {/* 4. Campeonatos */}
            <div className="p-6 rounded-2xl bg-[#090f23]/60 border border-violet-950/40 hover:bg-[#0d1533] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-xl text-violet-300">
                🏆
              </div>
              <h3 className="font-display font-extrabold text-sm text-white">Campeonatos</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Regras oficiais em campeonatos estrangeiros. Saiba dialogar para requerer vantagens de raspagens ou contestar de forma justa em inglês.
              </p>
            </div>

            {/* 5. Seminários */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 hover:bg-[#090f23] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl text-violet-400">
                🎓
              </div>
              <h3 className="font-display font-extrabold text-sm text-white">Seminários</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Conduza seminários de forma fluente e clara, sabendo detalhar direções corporais de esgrima lateral e distribuição perfeita de peso.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO: DEPOIMENTOS DE COMBATENTES (TESTIMONIALS) */}
      <section className="py-20 px-6 md:px-12 bg-[#05070e]" id="depoimentos">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-black">
              Experiências Reais No Exterior
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
              Testemunhos do Tatame
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-slate-900 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "O JiuSpeak preenche uma lacuna gigante no esporte. Estar no exterior sabendo se comunicar faz toda a diferença para ministrar seminários, dar entrevistas polidas pós-luta ou orientar alunos de forma profissional."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-900 mt-6">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-display font-extrabold text-xs border border-violet-500 text-violet-400">
                  MS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Marcus "Buchecha" S.</h4>
                  <span className="text-[10px] text-slate-450">Faixa Preta 13x Campeão Mundial</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#090d1f] p-6 rounded-3xl border border-violet-950/40 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed font-medium">
                  "Melhorei demais meu vocabulário antes de lutar o Europeu e o Pan. Entender os comandos de arbitragem rápida de tap out ou penalidade contra o adversário evitou sermos passados de guarda de bobeira. Recomendo muito!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-900/60 mt-6 font-medium">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-display font-extrabold text-xs border border-violet-400 text-violet-300">
                  JO
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Jessica "Lelê" Oliveira</h4>
                  <span className="text-[10px] text-violet-400">Faixa Marrom, Rio de Janeiro</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-slate-900 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "I highly recommend it. Brazilian athletes who come to my gym with JiuSpeak training learn commands and communicate techniques instantly. It creates fantastic adapters to high intensity classes here in California."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-900 mt-6">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-display font-bold text-xs border border-slate-700 text-slate-400">
                  DJ
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Professor David Jenkins</h4>
                  <span className="text-[10px] text-slate-450">Alliance Gym California Head</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PLANOS SECTION (CORES INTEGRATION & RETENTION) */}
      <section className="py-20 px-6 md:px-12 bg-slate-950" id="planos">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-black">
              Tabela De Matrículas Do Tatame
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
              Planos Amigáveis
            </h2>
            <p className="text-slate-405 text-xs md:text-sm max-w-lg mx-auto">
              Selecione o plano ideal para decolar a sua carreira no universo do Jiu-Jítsu internacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            
            {/* Gratuito */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                  Acesso Inicial
                </span>
                <h3 className="text-xl font-display font-extrabold text-white">Plano Gratuito</h3>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-3xl font-black">R$ 0</span>
                  <span className="text-xs text-slate-500 font-mono">/ mensal</span>
                </div>
                <p className="text-xs text-slate-400">
                  Aprenda as saudações básicas de etiqueta e comandos essenciais de treino.
                </p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-350">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Língua de Faixa Branca desbloqueada</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-350">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Experiências interativas de vocabulário</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-350">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Painel do Atleta e registro básico</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={scrollToRegister}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-xs font-bold font-mono transition-all border border-slate-800 cursor-pointer"
              >
                Matricular Grátis
              </button>
            </div>

            {/* Premium VIP */}
            <div className="bg-[#090e24] border border-violet-500/35 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 relative shadow-lg shadow-violet-500/5">
              <div className="absolute top-4 right-4 bg-violet-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                RECOMENDADO ⭐
              </div>
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-violet-950 text-violet-300 px-2 py-0.5 rounded">
                  Acesso Total Ilimitado
                </span>
                <h3 className="text-xl font-display font-extrabold text-white">JiuSpeak VIP Premium</h3>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-3xl font-black">R$ 49,90</span>
                  <span className="text-xs text-violet-450 font-mono">/ pagamento único via Pix</span>
                </div>
                <p className="text-xs text-slate-350 font-medium">
                  Desbloqueie todo o material de estudo das faixas Azul, Roxa, Marrom e Preta com pontuações de regras reais de arbitragem.
                </p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-3 text-xs text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Desbloqueio de TODAS as 5 faixas</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Gravações e avaliações de pronúncia por voz</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Arena PvP de testes marciais com moedas de ouro</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Certificado de Proficiência e Auditoria</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={scrollToRegister}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-violet-500/20 cursor-pointer"
              >
                Adquirir Passe VIP Agora
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC DEV OUTBOX INBOX PREVIEW LOGS (RODAPÉ) */}
      <footer className="bg-[#03050a] border-t border-slate-900 py-12 px-6 md:px-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-sm font-extrabold text-white">JiuSpeak</span>
              <p className="text-[10px] text-slate-450">English Training Solution for Brazilian Jiu-Jitsu Fighters. © 2026</p>
            </div>
            <p className="text-[10px] font-mono text-slate-600">
               PostgreSQL & JWT Sessions • Sandbox Mode Active
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-violet-500" /> Outbox de E-mail de Desenvolvimento (Fictício)
              </h4>
              {simulatedEmails.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearInbox}
                  className="text-[9px] font-mono text-slate-500 hover:text-red-400 cursor-pointer"
                >
                  Limpar Caixa
                </button>
              )}
            </div>

            {simulatedEmails.length === 0 ? (
              <p className="text-slate-600 text-[10px] py-1">
                E-mails mockados aparecem aqui em tempo real durante cadastro ou esquecimento de senha.
              </p>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {simulatedEmails.map(sim => (
                  <div
                    key={sim.id}
                    onClick={() => handleApplySimulatedEmail(sim)}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 cursor-pointer transition-all text-xs font-mono space-y-1 relative group"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-violet-400 font-bold">Para: {sim.to}</span>
                      <span className="text-slate-500">{new Date(sim.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200 font-semibold text-[11px]">{sim.subject}</p>
                    <p className="text-slate-400 text-[10px] line-clamp-1">{sim.body}</p>
                    <div className="text-[9px] bg-[#0c1122] border border-violet-950/40 p-1 px-2.5 rounded text-violet-300 font-bold block mt-1 break-all truncate font-mono">
                      Clique para auto-preencher Token: <span className="text-white underline">{sim.token}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </footer>

    </div>
  );
}
