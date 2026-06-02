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
  Compass
} from 'lucide-react';

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

export default function AuthPortal({ onLoginSuccess, showToast }: AuthPortalProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ATHLETE' | 'ADMIN'>('ATHLETE');
  
  // Password Recovery / Verification fields
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>([]);

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
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      setSuccessMsg(data.message || 'Cadastro concluído! Por favor, verifique o seu e-mail.');
      showToast('Conta criada com sucesso! Verifique seu e-mail simulado.', 'success');
      
      // Auto transition to verify view or login
      setView('verify');
      setEmail('');
      setPassword('');
      fetchSimulatedEmails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Houve um erro de conexão com o servidor.');
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      showToast('Token de confirmação de e-mail copiado da caixa postal simulated!', 'info');
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

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch justify-center w-full max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn" id="auth-portal">
      
      {/* Visual Welcome Board */}
      <div className="flex-1 rounded-3xl p-6 md:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden" id="auth-branding">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-lg">
              🥋
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">JiuSpeak</h1>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Língua do Tatame & Autenticação</p>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-black text-white/95 leading-tight tracking-tight mb-4">
            Aprimore seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Jiu-Jitsu</span> com Gamificação de elite.
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Aprenda posições, lute na Arena PvP de regras esportivas, controle sua academia, resgate recompensas lendárias e gerencie sua carreira em um ecossistema com auditoria de segurança militar e controle completo de funções JWT.
          </p>

          <div className="space-y-3.5 pr-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400">✓</div>
              <p className="text-xs text-slate-300 font-medium">Bcrypt password hashing de alta complexidade em produção</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400">✓</div>
              <p className="text-xs text-slate-300 font-medium">Roda de Refresh Tokens seguras para evitar sessões expiradas inesperadas</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400">✓</div>
              <p className="text-xs text-slate-300 font-medium">Verificação por email obrigatória e tokens de recuperação criptográficos</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900/65 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-[11px] font-mono text-slate-400">JWT Token Security Standard v2.1</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 px-2 py-0.5 rounded">
            PostgreSQL Ready
          </span>
        </div>
      </div>

      {/* Main Interactive Interactive Authentication Portal Card */}
      <div className="flex-1 bg-slate-900/60 border border-slate-805 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative" id="auth-form-card">
        <div>
          {/* View Selection Headers */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-850">
            <button
              onClick={() => { setView('login'); clearFormMessages(); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                view === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              onClick={() => { setView('register'); clearFormMessages(); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                view === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* User notifications block */}
          {errorMsg && (
            <div className="p-3.5 mb-5 rounded-xl bg-red-955/35 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-5 rounded-xl bg-emerald-955/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{successMsg}</p>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Senha Secreta</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Sua senha secreta de produção"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-10 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
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
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Entrar no Tatame <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500">
                  Deseja validar o fluxo sem cadastro? Use <button type="button" onClick={() => { setEmail('admin@jiuspeak.com'); setPassword('admin123'); }} className="text-indigo-400 underline cursor-pointer">admin@jiuspeak.com</button> (admin123)
                </span>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome de Lutador</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Gustavo 'Gavião'"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="lutador@jiuspeak.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Definir Senha Forte</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-10 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
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

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Função (Role)</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="ATHLETE">Lutador Atleta (Role: USER)</option>
                  <option value="ADMIN">Administrador de Lançamentos (Role: ADMIN)</option>
                </select>
                <p className="mt-1 text-[10px] text-slate-500">
                  Defina ADMIN se quiser testar a visão do painel administrativo imediatamente após confirmar o e-mail!
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Registrar Atleta <Key className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD REQUEST */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3 mb-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
                <p className="font-semibold mb-1">Recuperação de Acesso</p>
                Insira o seu e-mail cadastrado. Um link e um código de verificação criptografados serão gerados para atualizar a sua credencial.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="flex-1 py-3 px-4 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-800 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Avançar'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: RESET PASSWORD VERIFICATION & UPDATE */}
          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 mb-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300">
                <p className="font-semibold mb-1">Redefinir Senha</p>
                Utilize o token/código gerado e digite a sua nova senha de login abaixo.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Token de Redefinição</label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Copie o token 'reset_xxxx...' da caixa postal"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nova Senha Secreta</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="py-3 px-4 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirmar Nova Senha'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 5: VERIFY EMAIL SCREEN */}
          {view === 'verify' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="p-3.5 mb-2 rounded-xl bg-indigo-950/40 border border-indigo-805 text-xs text-slate-200">
                <p className="font-bold text-indigo-400 mb-1">📬 Confirme o seu E-mail</p>
                Para entrar em sua conta pela primeira vez, insira o código de validação enviado por e-mail (disponível na caixa fictícia abaixo).
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Token ou Código de Verificação</label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Insira o código 'v_xxx...'"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10.5 pr-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-650"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="py-3 px-4 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-800 cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Dynamic Dev Mail Outbox Panel inside portal */}
        <div className="mt-8 pt-6 border-t border-slate-850">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-emerald-500" /> Outbox de E-mail de Desenvolvimento (Fictício)
            </h4>
            {simulatedEmails.length > 0 && (
              <button
                type="button"
                onClick={handleClearInbox}
                className="text-[10px] font-mono text-slate-500 hover:text-red-400 cursor-pointer"
              >
                Limpar Caixa
              </button>
            )}
          </div>

          {simulatedEmails.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-center text-slate-500 text-[11px] tracking-wide py-5">
              Nenhum e-mail disparado nesta sessão. 
              <span className="block text-[10px] text-slate-600 mt-1">
                Ao criar conta ou solicitar redefinição de senha, os e-mails com os tokens JWT serão mostrados aqui em tempo real.
              </span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {simulatedEmails.map(sim => (
                <div
                  key={sim.id}
                  onClick={() => handleApplySimulatedEmail(sim)}
                  className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-850/80 hover:border-indigo-500/80 hover:bg-slate-900/60 cursor-pointer transition-all text-xs font-mono space-y-1 relative group"
                >
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-emerald-400 font-bold">Para: {sim.to}</span>
                    <span className="text-slate-500 text-[9px]">{new Date(sim.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200 font-semibold text-[11px]">{sim.subject}</p>
                  <p className="text-slate-400 text-[10px] line-clamp-1">{sim.body}</p>
                  
                  <div className="text-[10px] bg-slate-900 border border-slate-800 p-1 px-2.5 rounded text-indigo-300 font-bold block mt-1 break-all truncate">
                    Clique para auto-preencher Token: <span className="text-white underline font-mono">{sim.token}</span>
                  </div>

                  <span className="absolute right-2 bottom-2 text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Usar Código ⚡
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
