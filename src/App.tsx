/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Flame, 
  Coins, 
  Sparkles, 
  UserCheck, 
  Terminal,
  LogOut,
  Award,
  BookOpen,
  Sword,
  Store,
  Users,
  ShieldAlert,
  Bell
} from 'lucide-react';
import { UserProfile, Course, Achievement, AuditLog, BeltRank } from './types';
import { COURSES, ACHIEVEMENTS, INITIAL_AUDIT_LOGS } from './data';
import Sidebar from './components/Sidebar';

// Lazy loading views for optimized chunk loading and quick response times under high-load
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Lessons = React.lazy(() => import('./components/Lessons'));
const PvPArena = React.lazy(() => import('./components/PvPArena'));
const StoreMarket = React.lazy(() => import('./components/StoreMarket'));
const SocialFeed = React.lazy(() => import('./components/SocialFeed'));
const CreatorPanel = React.lazy(() => import('./components/CreatorPanel'));
const AdminPanel = React.lazy(() => import('./admin'));
const AuthPortal = React.lazy(() => import('./components/AuthPortal'));
const FinancePanel = React.lazy(() => import('./components/FinancePanel'));
const SubscriptionPanel = React.lazy(() => import('./components/SubscriptionPanel'));

// Spinner skeleton screen for lazy-loaded route transitions 
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-slate-400 gap-3" id="loading-fallback">
    <div className="w-10 h-10 border-4 border-slate-700/50 border-t-yellow-500 rounded-full animate-spin"></div>
    <span className="text-xs font-mono text-slate-500 tracking-wider uppercase">Carregando Tatame Virtual...</span>
  </div>
);

export default function App() {
  
  // JWT & Session state hooks
  const [session, setSession] = useState<{ accessToken: string; refreshToken: string } | null>(() => {
    const accessToken = localStorage.getItem('jiuspeak_access_token');
    const refreshToken = localStorage.getItem('jiuspeak_refresh_token');
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  });

  // 1. Initial State Loaders (Offline-First / Local Storage cache synchronization)
  const [user, setUser] = useState<UserProfile & { isEmailVerified?: boolean }>(() => {
    const cached = localStorage.getItem('jiuspeak_user_profile_v2');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* fallback */ }
    }
    return {
      id: 'atleta_7339',
      name: 'Gustavo "Lobo Guará"',
      email: 'maxtechptbr9@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      level: 1,
      xp: 120,
      xpNextLevel: 1000,
      belt: 'Branca',
      stripes: 0,
      coins: 600,
      elo: 1050,
      winCount: 3,
      lossCount: 2,
      streak: 2,
      lastActiveDate: new Date().toISOString(),
      academy: 'Atama Virtual Team',
      category: 'Pena (-70kg)',
      guardsPreference: 'Guarda Fechada de Aço',
      submitsPreference: 'Estrangulamento Cruzado',
      inventory: [],
      enrolledCourses: ['course_fundamentals'],
      unlockedAchievements: [],
      subscription: { type: 'Gratuito', priceBRL: 0 },
      role: 'athlete',
      balanceBRL: 420.00,
      balanceAvailableBRL: 420.00,
      balancePendingBRL: 155.00,
      totalEarnedBRL: 575.00,
      totalWithdrawnBRL: 0.00,
      isEmailVerified: false
    };
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const cached = localStorage.getItem('jiuspeak_courses');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }
    return COURSES;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const cached = localStorage.getItem('jiuspeak_achievements');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }
    return ACHIEVEMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem('jiuspeak_audit_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [cheatModalOpen, setCheatModalOpen] = useState<boolean>(false);

  // Custom Inline Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; visible: boolean } | null>(null);

  // 2. State Auto-Persist Effect triggers
  useEffect(() => {
    localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sync user profile from JWT payload dynamically via auth security endpoints
  const syncMe = async (accessTokenString: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${accessTokenString}` }
      });
      if (res.ok) {
        const data = await res.json();
        const apiUser = data.user;
        
        let mappedRole: 'athlete' | 'professor' | 'admin' = 'athlete';
        if (apiUser.role === 'ADMIN') mappedRole = 'admin';
        else if (apiUser.role === 'INSTRUCTOR') mappedRole = 'professor';

        let beltString: BeltRank = 'Branca';
        if (apiUser.belt) {
          const raw = apiUser.belt.toUpperCase();
          if (raw === 'BLUE') beltString = 'Azul';
          else if (raw === 'PURPLE') beltString = 'Roxa';
          else if (raw === 'BROWN') beltString = 'Marrom';
          else if (raw === 'BLACK') beltString = 'Preto';
        }

        setUser({
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          level: apiUser.level || 1,
          xp: apiUser.xp || 0,
          xpNextLevel: 1000,
          belt: beltString,
          stripes: apiUser.stripes || 0,
          coins: apiUser.coins || 600,
          elo: apiUser.elo || 1050,
          winCount: apiUser.winCount || 3,
          lossCount: apiUser.lossCount || 2,
          streak: apiUser.streak || 2,
          lastActiveDate: apiUser.lastActiveDate || new Date().toISOString(),
          academy: apiUser.academy || 'Atama Virtual Team',
          category: apiUser.category || 'Pena (-70kg)',
          guardsPreference: apiUser.guardsPreference || 'Guarda Fechada de Aço',
          submitsPreference: apiUser.submitsPreference || 'Estrangulamento Cruzado',
          inventory: apiUser.inventory || [],
          enrolledCourses: apiUser.enrolledCourses || ['course_fundamentals'],
          unlockedAchievements: apiUser.unlockedAchievements || [],
          subscription: apiUser.subscription || { type: 'Gratuito', priceBRL: 0 },
          role: mappedRole,
          balanceBRL: apiUser.balanceAvailableBRL !== undefined ? apiUser.balanceAvailableBRL : (apiUser.balanceBRL || 420.00),
          balanceAvailableBRL: apiUser.balanceAvailableBRL !== undefined ? apiUser.balanceAvailableBRL : 420.00,
          balancePendingBRL: apiUser.balancePendingBRL !== undefined ? apiUser.balancePendingBRL : 155.00,
          totalEarnedBRL: apiUser.totalEarnedBRL !== undefined ? apiUser.totalEarnedBRL : 575.00,
          totalWithdrawnBRL: apiUser.totalWithdrawnBRL !== undefined ? apiUser.totalWithdrawnBRL : 0.00,
          isEmailVerified: apiUser.isEmailVerified
        });
        return true;
      }
    } catch (e) {
      console.error("Erro ao sincronizar profile com o servidor", e);
    }
    return false;
  };

  // JWT refresh token rotation cycle
  const handleLogout = async () => {
    const rToken = localStorage.getItem('jiuspeak_refresh_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rToken })
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('jiuspeak_access_token');
    localStorage.removeItem('jiuspeak_refresh_token');
    localStorage.removeItem('jiuspeak_user_profile_v2');
    setSession(null);
    showToast("Dispositivo desconectado do sistema.", "info");
  };

  const handleLoginSuccess = (data: { accessToken: string; refreshToken: string; user: any }) => {
    localStorage.setItem('jiuspeak_access_token', data.accessToken);
    localStorage.setItem('jiuspeak_refresh_token', data.refreshToken);
    setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    syncMe(data.accessToken);
  };

  useEffect(() => {
    const initAuth = async () => {
      const access = localStorage.getItem('jiuspeak_access_token');
      const refresh = localStorage.getItem('jiuspeak_refresh_token');
      if (!access || !refresh) return;

      const success = await syncMe(access);
      if (!success) {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refresh })
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('jiuspeak_access_token', data.accessToken);
            setSession({ accessToken: data.accessToken, refreshToken: refresh });
            await syncMe(data.accessToken);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error("Refresh token failure", err);
        }
      }
    };
    initAuth();
  }, [session?.accessToken]);

  // Toast notifier triggers
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    
    // Auto erase toast
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
    }, 4000);
  };

  // 3. XP & Currency Experience upgrades
  const addXp = (amount: number, reason: string) => {
    const currentXp = user.xp + amount;
    let finalXp = currentXp;
    let finalLvl = user.level;
    let finalBelt = user.belt;
    let finalStripes = user.stripes;

    if (currentXp >= user.xpNextLevel) {
      finalXp = currentXp - user.xpNextLevel;
      finalLvl += 1;
      
      // Auto upgrade belt stripe or rank based on BJJ rules
      if (finalLvl >= 30) {
        finalBelt = 'Preto';
        finalStripes = 4;
      } else if (finalLvl >= 20) {
        finalBelt = 'Marrom';
        finalStripes = Math.min(4, Math.floor((finalLvl - 20) / 2.5));
      } else if (finalLvl >= 12) {
        finalBelt = 'Roxa';
        finalStripes = Math.min(4, Math.floor((finalLvl - 12) / 2));
      } else if (finalLvl >= 5) {
        finalBelt = 'Azul';
        finalStripes = Math.min(4, Math.floor((finalLvl - 5) / 1.75));
      } else {
        finalStripes = Math.min(4, finalLvl - 1);
        finalBelt = 'Branca';
      }

      showToast(`🏆 PARABÉNS! Nível subido! Agora você está no Nível ${finalLvl}!`, 'success');
      
      // Add achievement stripe check progress
      updateAchievementProgress('stripe_unlocked', finalLvl);
    }

    setUser(prev => ({
      ...prev,
      xp: finalXp,
      level: finalLvl,
      belt: finalBelt,
      stripes: finalStripes,
      lastActiveDate: new Date().toISOString()
    }));
  };

  const addCoins = (amount: number, reason: string) => {
    const updatedCoins = user.coins + amount;
    setUser(prev => ({
      ...prev,
      coins: updatedCoins
    }));

    updateAchievementProgress('millionaire', updatedCoins);
  };

  // 4. Achievement System milestones checks
  const updateAchievementProgress = (id: string, currentVal: number) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === id) {
        return {
          ...ach,
          progressCurrent: Math.min(ach.progressMax || 1, currentVal)
        };
      }
      return ach;
    }));
  };

  const claimAchievement = (id: string) => {
    const found = achievements.find(a => a.id === id);
    if (!found || found.isUnlocked) return;

    // Set Unlocked
    setAchievements(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, isUnlocked: true };
      }
      return a;
    }));

    // Unlock payouts
    addXp(found.xpReward, `Conquista completada: ${found.title}`);
    addCoins(found.coinReward, `Conquista completada: ${found.title}`);

    // Log transaction
    addAuditLog(
      'lesson_completed',
      `Premiação: Lutador resgatou recompensa da conquista "${found.title}" (+${found.xpReward} XP / +${found.coinReward} KC).`,
      undefined,
      found.coinReward
    );

    showToast(`Conquista "${found.title}" resgatada! +${found.xpReward} XP e +${found.coinReward} Kimono Coins salvos!`, 'success');
  };

  // 5. Centralized Security Audit logger
  const addAuditLog = (
    type: 'security_alert' | 'pix_deposit' | 'withdrawal' | 'market_trade' | 'lesson_completed',
    description: string,
    amountBRL?: number,
    amountKC?: number
  ) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.name,
      type,
      description,
      amountBRL,
      amountKC,
      status: 'Aprovado',
      timestamp: new Date().toISOString()
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAddNewCourse = (newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
  };

  const handleUpdateUserProfile = (fields: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...fields }));
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    showToast("Eventos de auditoria limpos com sucesso!", "info");
  };

  // Master BJJ belt style helpers
  const getBeltBg = (belt: BeltRank) => {
    switch (belt) {
      case 'Branca': return 'bg-white text-slate-800 border border-slate-350';
      case 'Azul': return 'bg-blue-600 text-white';
      case 'Roxa': return 'bg-purple-700 text-white';
      case 'Marrom': return 'bg-amber-900 text-white';
      case 'Preto': return 'bg-slate-900 border border-red-500 text-red-505';
      default: return 'bg-white text-slate-800';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen text-slate-200 bg-[#070a13] flex flex-col items-stretch w-full overflow-x-hidden" id="app-wrapper">
        {toast && toast.visible && (
          <div className="fixed top-4 right-4 z-50 animate-bounce cursor-pointer max-w-sm w-full">
            <div className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-250 shadow-emerald-500/10' 
                : (toast.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-250 shadow-red-500/10' : 'bg-slate-900/90 border-indigo-500 text-indigo-250 shadow-indigo-500/10')
            }`}>
              <span className="text-lg">
                {toast.type === 'success' ? '🥋' : (toast.type === 'error' ? '🚨' : '⚡')}
              </span>
              <p className="text-xs font-semibold leading-snug">{toast.message}</p>
            </div>
          </div>
        )}
        <React.Suspense fallback={<LoadingFallback />}>
          <AuthPortal onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative text-slate-200 bg-[#070a13]" id="app-wrapper">
      
      {/* 1. Global Custom Slide-In Toast Notification */}
      {toast && toast.visible && (
        <div className="fixed top-4 right-4 z-50 animate-bounce cursor-pointer max-w-sm w-full">
          <div className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-250 shadow-emerald-500/10' 
              : (toast.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-250 shadow-red-500/10' : 'bg-slate-900/90 border-indigo-500 text-indigo-250 shadow-indigo-500/10')
          }`}>
            <span className="text-lg">
              {toast.type === 'success' ? '🥋' : (toast.type === 'error' ? '🚨' : '⚡')}
            </span>
            <p className="text-xs font-semibold leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 2. Responsive Mobile Header */}
      <header className="lg:hidden bg-slate-950 border-b border-slate-850 p-4 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🥋</span>
          <h1 className="font-display font-extrabold text-lg text-white">JiuSpeak</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            🔥 {user.streak}d
          </span>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[65px] left-0 right-0 z-30 bg-slate-950 border-b border-slate-800 p-4 animate-fadeIn space-y-4 shadow-2xl">
          <Sidebar 
            user={user} 
            currentTab={currentTab} 
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              setMobileMenuOpen(false);
            }} 
            onOpenCheatModal={() => setCheatModalOpen(true)}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* 3. Main Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <Sidebar 
          user={user} 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          onOpenCheatModal={() => setCheatModalOpen(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* 4. Main Tab Container body */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden min-h-[calc(100vh-65px)] lg:min-h-screen">
        
        {/* Upper Segmented quick-look profile ribbon */}
        <div className="hidden md:flex justify-between items-center pb-4 border-b border-slate-900/60 text-xs">
          
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono">Bem-vindo(a) de volta!</span>
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 px-2.5 rounded-full border border-slate-850">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">Controle de Clientes OK</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-md font-mono text-[10px]">
              <Coins className="w-3.5 h-3.5" />
              <span>{user.coins} KC</span>
            </div>
            
            <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-md font-mono text-[10px]">
              <Flame className="w-3.5 h-3.5" />
              <span>{user.streak} Dias</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-md font-mono text-[10px] text-slate-350">
              <span className={`w-2.5 h-2.5 rounded-sm ${
                user.belt === 'Branca' ? 'bg-white' : 
                user.belt === 'Azul' ? 'bg-blue-600' : 
                user.belt === 'Roxa' ? 'bg-purple-700' : 
                user.belt === 'Marrom' ? 'bg-amber-900' : 'bg-slate-900'
              }`} />
              <span className="uppercase">Faixa {user.belt}</span>
            </div>
            
            {/* Quick role-swap */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-500 font-mono text-[10px] uppercase">Função:</span>
              <select
                value={user.role}
                onChange={(e) => {
                  setUser(prev => ({ ...prev, role: e.target.value as any }));
                  showToast(`Chave de Função: perfil migrado para modo [${e.target.value}]!`, "info");
                  
                  addAuditLog(
                     'security_alert',
                     `Nível de Acesso Modificado: Perfil alterou seu papel para [${e.target.value}].`,
                     undefined,
                     undefined
                  );
                }}
                className="bg-slate-900/80 border border-slate-800 text-slate-300 rounded font-mono text-[10px] p-1 cursor-pointer"
              >
                <option value="athlete">Atleta 🥋</option>
                <option value="professor">Professor/Creator 🎓</option>
                <option value="admin">Administrador 🛠️</option>
              </select>
            </div>
          </div>

        </div>

        {/* Mounted Views Router */}
        <React.Suspense fallback={<LoadingFallback />}>
          {currentTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              achievements={achievements} 
              updateUser={handleUpdateUserProfile} 
              claimAchievement={claimAchievement}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'lessons' && (
            <Lessons 
              user={user} 
              courses={courses} 
              updateUser={handleUpdateUserProfile} 
              onAddAuditLog={addAuditLog}
              addXp={addXp}
              addCoins={addCoins}
              showToast={showToast}
            />
          )}

          {currentTab === 'pvp' && (
            <PvPArena 
              user={user} 
              updateUser={handleUpdateUserProfile} 
              onAddAuditLog={addAuditLog}
              addXp={addXp}
              addCoins={addCoins}
              showToast={showToast}
            />
          )}

          {currentTab === 'market' && (
            <StoreMarket 
              user={user} 
              updateUser={handleUpdateUserProfile} 
              onAddAuditLog={addAuditLog}
              showToast={showToast}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'social' && (
            <SocialFeed 
              user={user} 
              showToast={showToast}
            />
          )}

          {currentTab === 'finance' && (
            <FinancePanel 
              user={user} 
              updateUser={handleUpdateUserProfile} 
              onAddAuditLog={addAuditLog}
              showToast={showToast}
            />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionPanel 
              user={user} 
              updateUser={handleUpdateUserProfile} 
              showToast={showToast}
            />
          )}

          {currentTab === 'creator' && (
            <CreatorPanel 
              user={user} 
              courses={courses} 
              updateUser={handleUpdateUserProfile} 
              onAddNewCourse={handleAddNewCourse}
              onAddAuditLog={addAuditLog}
              showToast={showToast}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanel 
              user={user} 
              auditLogs={auditLogs} 
              updateUser={handleUpdateUserProfile} 
              onClearLogs={clearAuditLogs}
              showToast={showToast}
            />
          )}
        </React.Suspense>

      </main>

      {/* Floating Cheat Modal Window (Triggered from Sidebar button) */}
      {cheatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl text-center">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-805">
              <h5 className="font-display font-extrabold text-sm text-yellow-500 tracking-wide flex items-center gap-1.5">
                ⚡ JiuSpeak Debug Console
              </h5>
              <button 
                onClick={() => setCheatModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Injete recursos instantâneos ou pule para o Black Belt de testes para avaliar as stripe graphics e todas as mecânicas.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => {
                  const val = user.coins + 1500;
                  setUser(prev => ({ ...prev, coins: val }));
                  showToast("+1500 Kimono Coins injetados!", "success");
                  addAuditLog('lesson_completed', `Cheat: Developer injetou +1500 Kimono Coins.`, undefined, 1500);
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white rounded-lg transition-all cursor-pointer font-bold"
              >
                🪙 +1.500 Coins
              </button>
              
              <button 
                onClick={() => {
                  addXp(600, 'Cheat developer');
                  showToast("+600 XP Injetados!", "success");
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-355 hover:text-white rounded-lg transition-all cursor-pointer font-bold"
              >
                ✨ +600 XP Game
              </button>
              
              <button 
                onClick={() => {
                  setUser(prev => ({ ...prev, belt: 'Preto', level: 30, stripes: 4 }));
                  showToast("Promovido para Faixa-Preta de testes!", "success");
                  addAuditLog('security_alert', `Cheat: Perfil promoveu-se manualmente para Mestre Faixa Preta.`, undefined, undefined);
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-red-400 hover:text-red-300 rounded-lg transition-all cursor-pointer font-bold col-span-2"
              >
                🥋 Promover: Faixa Preta
              </button>
            </div>

            <button
              onClick={() => setCheatModalOpen(false)}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-lg transition-all cursor-pointer uppercase font-mono font-bold"
            >
              Fechar Debugger
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
