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
  Bell,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Course, Achievement, AuditLog, BeltRank } from './types';
const COURSES: Course[] = [];
const ACHIEVEMENTS: Achievement[] = [];
const INITIAL_AUDIT_LOGS: AuditLog[] = [];
import Sidebar from './components/Sidebar';
import { ViralShare } from './components/ViralShare';

// Lazy loading views for optimized chunk loading and quick response times under high-load
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Lessons = React.lazy(() => import('./components/Lessons'));
const PvPArena = React.lazy(() => import('./components/PvPArena'));
const StoreMarket = React.lazy(() => import('./components/StoreMarket'));
const InventoryPanel = React.lazy(() => import('./components/InventoryPanel'));
const SocialFeed = React.lazy(() => import('./components/SocialFeed'));
const Community = React.lazy(() => import('./components/Community'));
const CreatorPanel = React.lazy(() => import('./components/CreatorPanel'));
const AdminPanel = React.lazy(() => import('./admin'));
const AuthPortal = React.lazy(() => import('./components/AuthPortal'));
const FinancePanel = React.lazy(() => import('./components/FinancePanel'));
const SubscriptionPanel = React.lazy(() => import('./components/SubscriptionPanel'));
const AcademiesCommunities = React.lazy(() => import('./components/AcademiesCommunities'));
const JiuSpeakAcademy = React.lazy(() => import('./components/JiuSpeakAcademy'));
const ProfilePanel = React.lazy(() => import('./components/ProfilePanel'));
const PartnerStore = React.lazy(() => import('./components/PartnerStore'));
const PartnerDashboard = React.lazy(() => import('./components/PartnerDashboard'));
const SupportChat = React.lazy(() => import('./components/SupportChat'));
const LiveStream = React.lazy(() => import('./components/LiveStream'));
const PublicProfileView = React.lazy(() => import('./components/PublicProfileView'));
const PublicCertificateView = React.lazy(() => import('./components/PublicCertificateView'));
const OnboardingWizard = React.lazy(() => import('./components/OnboardingWizard'));
const HomePage = React.lazy(() => import('./components/HomePage'));
const DailyChallengePage = React.lazy(() => import('./components/DailyChallenge'));

// Spinner skeleton screen for lazy-loaded route transitions 
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-slate-400 gap-3" id="loading-fallback">
    <div className="w-10 h-10 border-4 border-slate-700/50 border-t-yellow-500 rounded-full animate-spin"></div>
    <span className="text-xs font-mono text-slate-500 tracking-wider uppercase">Carregando Tatame Virtual...</span>
  </div>
);

const AccessDenied403 = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-center max-w-lg mx-auto" id="403-access-denied-app">
    <div className="w-16 h-16 rounded-2xl bg-red-950/45 border border-red-500/20 flex items-center justify-center text-red-500 text-2xl mb-4 animate-bounce">
      🛡️
    </div>
    <h3 className="font-display font-extrabold text-xl text-white mb-2">403 - Acesso Negado</h3>
    <p className="text-xs text-slate-400 leading-relaxed font-sans">{message}</p>
  </div>
);

import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user: authUser, authReady, login, logout, updateUser, syncMe: syncMeAuth } = useAuth();

  const user = authUser || {
    id: 'guest',
    name: 'Atleta',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    level: 1,
    xp: 0,
    xpNextLevel: 1000,
    belt: 'Branca',
    stripes: 0,
    coins: 0,
    elo: 1000,
    winCount: 0,
    lossCount: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString(),
    academy: '',
    category: 'Absoluto',
    guardsPreference: '',
    submitsPreference: '',
    inventory: [],
    enrolledCourses: [],
    unlockedAchievements: [],
    subscription: { type: 'Gratuito', priceBRL: 0.00 },
    role: 'athlete',
    balanceBRL: 0.00,
    balanceAvailableBRL: 0.00,
    balancePendingBRL: 0.00,
    totalEarnedBRL: 0.00,
    totalWithdrawnBRL: 0.00,
    isEmailVerified: true
  } as any;

  const setUser = (updater: any) => {
    if (typeof updater === 'function') {
      const updated = updater(user);
      updateUser(updated);
    } else {
      updateUser(updater);
    }
  };

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
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const cachedProfile = localStorage.getItem('jiuspeak_user_profile_v2');
      const cachedToken = localStorage.getItem('jiuspeak_access_token');
      const isLoggedIn = !!(cachedProfile && cachedToken);

      if (path === '/' || path === '/login' || path === '/register') {
        return isLoggedIn ? 'dashboard' : 'landing';
      }
      if (path === '/academy' || path.startsWith('/academy/') || path.startsWith('/belt-path/') || path.startsWith('/learning-path/') || path === '/modules') {
        window.history.replaceState(null, '', '/modules');
        return 'lessons';
      }
      if (path === '/dashboard') {
        return 'dashboard';
      }
      if (path === '/community' || path === '/comunidade') {
        return 'community';
      }
      if (path === '/academies' || path === '/academias-bjj' || path === '/academias') {
        return 'academies';
      }
      if (path === '/professor') {
        return 'creator';
      }
      if (path === '/admin') {
        return 'admin';
      }
      if (path === '/store') {
        return 'market';
      }
      if (path === '/inventory') {
        return 'inventory';
      }
      if (path === '/daily-challenge') {
        return 'daily-challenge';
      }
      if (path === '/dashboard/profile') {
        return 'profile-settings';
      }
      if (path.startsWith('/profile/')) {
        const username = path.split('/profile/')[2] || path.split('/profile/')[1];
        if (username) {
          return `profile-public-${username}`;
        }
      }
      if (path.startsWith('/u/')) {
        const username = path.split('/u/')[1];
        if (username) {
          return `profile-public-${username}`;
        }
      }
      if (path.startsWith('/certificate/')) {
        const hash = path.split('/certificate/')[1];
        if (hash) {
          return `certificate-public-${hash}`;
        }
      }
      if (path.startsWith('/invite/')) {
        const referrer = path.split('/invite/')[1];
        if (referrer) {
          localStorage.setItem('jiuspeak_referrer', referrer.trim());
        }
        return isLoggedIn ? 'dashboard' : 'landing';
      }
    }
    return 'landing';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [cheatModalOpen, setCheatModalOpen] = useState<boolean>(false);
  const [activeViralConquest, setActiveViralConquest] = useState<any | null>(null);

  // 1.5 Global Event Interceptor for Viral Sharing Popups (No prop-drilling)
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveViralConquest(customEvent.detail);
      }
    };
    window.addEventListener('trigger-viral-share', handleTrigger);
    return () => window.removeEventListener('trigger-viral-share', handleTrigger);
  }, []);

  // Synchronize tabs with browser address bar (Vanilla SPA Routing)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const isLoggedIn = !!authUser;
      if (path === '/' || path === '/login' || path === '/register') {
        setCurrentTab(isLoggedIn ? 'dashboard' : 'landing');
      } else if (path === '/academy' || path.startsWith('/academy/') || path.startsWith('/belt-path/') || path.startsWith('/learning-path/') || path === '/modules') {
        window.history.replaceState(null, '', '/modules');
        setCurrentTab('lessons');
      } else if (path === '/daily-challenge') {
        setCurrentTab('daily-challenge');
      } else if (path === '/dashboard') {
        setCurrentTab('dashboard');
      } else if (path === '/community' || path === '/comunidade') {
        setCurrentTab('community');
      } else if (path === '/academies' || path === '/academias-bjj' || path === '/academias') {
        setCurrentTab('academies');
      } else if (path === '/professor') {
        setCurrentTab('creator');
      } else if (path === '/admin') {
        setCurrentTab('admin');
      } else if (path === '/store') {
        setCurrentTab('market');
      } else if (path === '/inventory') {
        setCurrentTab('inventory');
      } else if (path === '/dashboard/profile') {
        setCurrentTab('profile-settings');
      } else if (path.startsWith('/profile/')) {
        const username = path.split('/profile/')[2] || path.split('/profile/')[1];
        if (username) {
          setCurrentTab(`profile-public-${username}`);
        }
      } else if (path.startsWith('/u/')) {
        const username = path.split('/u/')[1];
        if (username) {
          setCurrentTab(`profile-public-${username}`);
        }
      } else if (path.startsWith('/certificate/')) {
        const hash = path.split('/certificate/')[1];
        if (hash) {
          setCurrentTab(`certificate-public-${hash}`);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [authUser]);

  useEffect(() => {
    if (localStorage.getItem('jiuspeak_referrer') && window.location.pathname.startsWith('/invite/')) {
      const referrer = localStorage.getItem('jiuspeak_referrer');
      showToast(`Você foi convidado por @${referrer}! Registre-se para resgatar sua Recompensa em JT!`, 'success');
      window.history.pushState(null, '', '/');
    }
  }, []);

  // Badge de notificação do Desafio do Dia
  const [hasDailyChallenge, setHasDailyChallenge] = useState(false);

  // Gerar desafio do dia no background ao logar + polling de notificações
  useEffect(() => {
    if (!authUser) return;

    const token = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');

    // Gerar/buscar desafio do dia imediatamente ao logar (em background, sem bloquear UI)
    const triggerDailyChallenge = async () => {
      try {
        const res = await fetch('/api/daily-challenge', {
          headers: { 'Authorization': `Bearer ${token()}` }
        });
        if (res.ok) {
          // Desafio gerado — agora verificar se há notificação não lida
          const notifRes = await fetch('/api/social/notifications', {
            headers: { 'Authorization': `Bearer ${token()}` }
          });
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            const hasUnread = (notifData.notifications || []).some(
              (n: any) => n.type === 'DAILY_CHALLENGE' && !n.isRead
            );
            setHasDailyChallenge(hasUnread);
          }
        }
      } catch { /* Silently fail */ }
    };

    // Polling de mensagens não lidas a cada 30 segundos
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/social/messages/recent', {
          headers: { 'Authorization': `Bearer ${token()}` }
        });
        if (res.ok) {
          const conversations = await res.json();
          const total = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
          setUnreadMessagesCount(total);
        }
      } catch { /* Silently fail */ }
    };

    // Executar imediatamente ao logar
    triggerDailyChallenge();
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [authUser]);

  useEffect(() => {
    if (currentTab === 'profile-settings') setUnreadMessagesCount(0);
  }, [currentTab]);

  // Synchronize URL with active tab
  useEffect(() => {
    if (currentTab === 'landing') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.history.pushState(null, '', '/');
      }
    } else if (currentTab === 'dashboard') {
      if (window.location.pathname !== '/dashboard') {
        window.history.pushState(null, '', '/dashboard');
      }
    } else if (currentTab === 'creator') {
      if (window.location.pathname !== '/professor') {
        window.history.pushState(null, '', '/professor');
      }
    } else if (currentTab === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else if (currentTab === 'daily-challenge') {
      if (window.location.pathname !== '/daily-challenge') {
        window.history.pushState(null, '', '/daily-challenge');
      }
    } else if (currentTab === 'market') {
      if (window.location.pathname !== '/store') {
        window.history.pushState(null, '', '/store');
      }
    } else if (currentTab === 'inventory') {
      if (window.location.pathname !== '/inventory') {
        window.history.pushState(null, '', '/inventory');
      }
    } else if (currentTab === 'profile-settings') {
      if (window.location.pathname !== '/dashboard/profile') {
        window.history.pushState(null, '', '/dashboard/profile');
      }
    } else if (currentTab === 'social') {
      if (window.location.pathname !== '/community' && window.location.pathname !== '/comunidade') {
        window.history.pushState(null, '', '/community');
      }
    } else if (currentTab === 'lessons') {
      if (window.location.pathname !== '/modules') {
        window.history.pushState(null, '', '/modules');
      }
    } else if (currentTab === 'academies') {
      if (window.location.pathname !== '/academies' && window.location.pathname !== '/academias-bjj' && window.location.pathname !== '/academias') {
        window.history.pushState(null, '', '/academies');
      }
    } else if (currentTab.startsWith('profile-public-')) {
      const username = currentTab.replace('profile-public-', '');
      if (window.location.pathname !== `/u/${username}`) {
        window.history.pushState(null, '', `/u/${username}`);
      }
    } else if (currentTab.startsWith('certificate-public-')) {
      const hash = currentTab.replace('certificate-public-', '');
      if (window.location.pathname !== `/certificate/${hash}`) {
        window.history.pushState(null, '', `/certificate/${hash}`);
      }
    } else {
      if (
        window.location.pathname === '/store' || 
        window.location.pathname === '/inventory' || 
        window.location.pathname === '/dashboard/profile' ||
        window.location.pathname.startsWith('/profile/') ||
        window.location.pathname.startsWith('/u/') ||
        window.location.pathname.startsWith('/certificate/')
      ) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentTab]);

  // Coordinate tab redirects based on authenticated user state
  useEffect(() => {
    if (authReady) {
      if (authUser) {
        if (currentTab === 'landing') {
          setCurrentTab('dashboard');
        }
      } else {
        if (currentTab !== 'landing' && 
            !currentTab.startsWith('profile-public-') && 
            !currentTab.startsWith('certificate-public-')) {
          setCurrentTab('landing');
        }
      }
    }
  }, [authUser, authReady, currentTab]);

  // Custom Inline Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; visible: boolean } | null>(null);

  // Dynamic Trial states for Landing Page
  const [showFreeLesson, setShowFreeLesson] = useState(false);
  const [trialStep, setTrialStep] = useState(0);
  const [trialMicSuccess, setTrialMicSuccess] = useState<boolean | null>(null);
  const [trialIsRecording, setTrialIsRecording] = useState(false);

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

  const speakPreviewPhrase = (phrase: string) => {
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
      showToast("Áudio indisponível neste navegador, mas o termo é: " + phrase, "info");
    }
  };

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

  // 2. State Auto-Persist Effect triggers
  useEffect(() => {
    if (user) {
      console.log(
        "[AVATAR DEBUG]",
        {
          profilePhoto: user?.profilePhoto,
          avatar: user?.avatar
        }
      );
    }
  }, [user]);

  useEffect(() => {
    const currentProfile = JSON.parse(localStorage.getItem('jiuspeak_user_profile_v2') || '{}');
    const cleanUser: any = {};
    if (user) {
      Object.keys(user).forEach(key => {
        const val = user[key];
        const prevVal = currentProfile[key];
        if (val !== undefined && val !== null) {
          if (typeof val === 'string' && val.trim() === '' && prevVal && prevVal.trim() !== '') {
            const preservedFields = ['profilePhoto', 'coverPhoto', 'username', 'beltRank', 'bio', 'city', 'country', 'instagram', 'youtube', 'facebook', 'website', 'favoriteTechnique', 'favoriteAthlete'];
            if (preservedFields.includes(key)) {
              cleanUser[key] = prevVal;
              return;
            }
          }
          cleanUser[key] = val;
        }
      });
    }
    const mergedProfile = {
      ...currentProfile,
      ...cleanUser
    };
    localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(mergedProfile));
    console.log('[PROFILE WRITE]', mergedProfile);
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
        else if (apiUser.role === 'INSTRUCTOR' || apiUser.role === 'TEACHER' || apiUser.role === 'teacher') mappedRole = 'professor';

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
          coins: apiUser.coins || 0,
          elo: apiUser.elo || 1000,
          winCount: apiUser.winCount || 0,
          lossCount: apiUser.lossCount || 0,
          streak: apiUser.streak || 0,
          lastActiveDate: apiUser.lastActiveDate || new Date().toISOString(),
          academy: apiUser.academy || '',
          category: apiUser.category || 'Absoluto',
          guardsPreference: apiUser.guardsPreference || '',
          submitsPreference: apiUser.submitsPreference || '',
          inventory: apiUser.inventory || [],
          enrolledCourses: apiUser.enrolledCourses || [],
          unlockedAchievements: apiUser.unlockedAchievements || [],
          subscription: apiUser.subscription || { type: 'Gratuito', priceBRL: 0 },
          role: mappedRole,
          balanceBRL: apiUser.balanceAvailableBRL !== undefined ? apiUser.balanceAvailableBRL : (apiUser.balanceBRL || 0.00),
          balanceAvailableBRL: apiUser.balanceAvailableBRL !== undefined ? apiUser.balanceAvailableBRL : 0.00,
          balancePendingBRL: apiUser.balancePendingBRL !== undefined ? apiUser.balancePendingBRL : 0.00,
          totalEarnedBRL: apiUser.totalEarnedBRL !== undefined ? apiUser.totalEarnedBRL : 0.00,
          totalWithdrawnBRL: apiUser.totalWithdrawnBRL !== undefined ? apiUser.totalWithdrawnBRL : 0.00,
          isEmailVerified: apiUser.isEmailVerified,
          equippedFrame: apiUser.equippedFrame || null,
          onboardingDone: apiUser.onboardingDone
        });
        return true;
      }
    } catch (e) {
      console.error("Erro ao sincronizar profile com o servidor", e);
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    showToast("Dispositivo desconectado do sistema.", "info");
  };

  const handleLoginSuccess = (data: { accessToken: string; refreshToken: string; user: any }) => {
    login(data);
    setCurrentTab('dashboard');
    showToast("Autenticado com sucesso!", "success");
  };

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
    let currentXp = user.xp + amount;
    let finalLvl = user.level;
    let finalBelt = user.belt;
    let finalStripes = user.stripes;

    // Helper to calculate realistic, slower progression thresholds (SaaS standard)
    const getXpThresholdForLevel = (lvl: number) => {
      if (lvl < 5) return 500;       // Nível 1 -> 5: progressão rápida
      if (lvl < 15) return 1500;     // Nível 5 -> 15: moderada
      if (lvl < 30) return 3000;     // Nível 15 -> 30: lenta
      return 6000;                   // Nível 30+: difícil (SaaS premium retention)
    };

    let nextLvlXp = getXpThresholdForLevel(finalLvl);

    while (currentXp >= nextLvlXp) {
      currentXp -= nextLvlXp;
      finalLvl += 1;
      nextLvlXp = getXpThresholdForLevel(finalLvl);
      
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

      // Trigger automatic viral share congratulations overlay
      const hasBeltPromoted = finalBelt !== user.belt;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-viral-share', {
          detail: {
            type: hasBeltPromoted ? 'nova_faixa' : 'novo_nivel',
            customTitle: hasBeltPromoted 
              ? `PROMOVIDO A FAIXA ${finalBelt.toUpperCase()}!` 
              : `NOVO NÍVEL ${finalLvl} CONQUISTADO!`
          }
        }));
      }, 1200);
    }

    setUser(prev => ({
      ...prev,
      xp: currentXp,
      level: finalLvl,
      xpNextLevel: nextLvlXp,
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

    // Log transaction
    addAuditLog(
      'lesson_completed',
      `Premiação: Lutador resgatou recompensa da conquista "${found.title}" (+${found.xpReward} XP).`,
      undefined,
      0
    );

    showToast(`Conquista "${found.title}" resgatada! +${found.xpReward} XP salvos!`, 'success');

    // Trigger automatic viral share congratulations overlay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-viral-share', {
        detail: {
          type: 'nova_conquista',
          customTitle: `CONQUISTA ATINGIDA: ${found.title.toUpperCase()}!`
        }
      }));
    }, 1250);
  };

  // 5. Centralized Security Audit logger
  const addAuditLog = (
    type: 'security_alert' | 'pix_deposit' | 'withdrawal' | 'market_trade' | 'lesson_completed',
    description: string,
    amountBRL?: number,
    amountJT?: number
  ) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.name,
      type,
      description,
      amountBRL,
      amountJT,
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

  // Intercept shared public landing URLs before demanding standard authentication gate
  const isUrlShared = typeof window !== 'undefined' && window.location.search.includes('share=true');
  if (isUrlShared) {
    const params = new URLSearchParams(window.location.search);
    const shareName = params.get('name') || 'Atleta JiuSpeak';
    const shareBelt = (params.get('belt') as BeltRank) || 'Branca';
    const shareLevel = parseInt(params.get('level') || '1', 10);
    const shareElo = parseInt(params.get('elo') || '1000', 10);
    const shareXp = parseInt(params.get('xp') || '0', 10);
    const shareAchievement = params.get('achievement') || 'NOVA VITÓRIA REVELADA!';
    const shareType = params.get('type') || 'vitoria_pvp';
    const shareAvatar = params.get('avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
    const shareFrame = params.get('frame') || 'none';

    const mockShareUser = {
      id: 'shared_profile',
      name: shareName,
      email: '',
      avatar: shareAvatar,
      level: shareLevel,
      xp: shareXp,
      xpNextLevel: 1000,
      belt: shareBelt,
      stripes: Math.min(4, Math.floor(shareLevel / 6)),
      coins: 0,
      elo: shareElo,
      winCount: 0,
      lossCount: 0,
      streak: 0,
      academy: '',
      category: 'Absoluto',
      guardsPreference: '',
      submitsPreference: '',
      inventory: [],
      enrolledCourses: [],
      unlockedAchievements: [],
      subscription: { type: 'FREE', priceBRL: 0 },
      role: 'athlete',
      balanceBRL: 0,
      balanceAvailableBRL: 0,
      balancePendingBRL: 0,
      totalEarnedBRL: 0,
      totalWithdrawnBRL: 0,
      equippedFrame: shareFrame !== 'none' ? { id: 'frame', name: shareFrame, rarity: 'Lendário' } : null
    } as any;

    return (
      <div className="min-h-screen text-slate-200 bg-[#070a13] flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto" id="public-share-gate">
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800">
            <span className="text-2xl">🥋</span>
            <span className="font-display font-extrabold text-lg text-white tracking-widest uppercase">JiuSpeak</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            A plataforma gamificada brasileira nº 1 para treinar Sparring de Inglês para Jiu-Jitsu!
          </p>
        </div>

        <div className="w-full max-w-4xl bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="text-center">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/15">
              Conquista de Atleta Auditada e Verificada
            </span>
          </div>

          <ViralShare 
            user={mockShareUser} 
            isModalStyle={false} 
            preselectedConquest={{
              type: shareType as any,
              customTitle: shareAchievement
            }}
          />

          <div className="text-center pt-4 border-t border-slate-900 space-y-4">
            <div className="space-y-1">
              <h4 className="font-display font-black text-white text-md">Quer aprender de verdade a falar Inglês nos Tatames?</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Desbloqueie diálogos reais de seminários, arbitragem, sparrings e viagens internacionais com o JiuSpeak.
              </p>
            </div>
            
            <button 
              onClick={() => {
                window.history.pushState(null, '', '/');
                window.location.reload();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg shadow-violet-500/20"
            >
              🥋 Conhecer Desafio JiuSpeak Grátis
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 font-mono mt-6">
          © 2026 JiuSpeak • Hash de Integridade: {Math.random().toString(16).substring(2, 10).toUpperCase()}
        </p>
      </div>
    );
  }

  if (!authReady) {
    return <LoadingFallback />;
  }

  if (!authUser) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
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

  // Render direct HomePage if authenticated but exploring the root public landing page tab


  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen text-slate-200 bg-[#000814] flex flex-col items-stretch w-full overflow-x-hidden font-sans relative" id="app-wrapper-landing">
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
          <HomePage
            user={user}
            courses={courses}
            onOpenAuthModal={(v) => {
              // Redirect to corresponding profile depending on user's role
              if (user.role === 'admin') setCurrentTab('admin');
              else if (user.role === 'professor') setCurrentTab('creator');
              else setCurrentTab('dashboard');
            }}
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
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative text-slate-200 bg-[#070a13]" id="app-wrapper">
      
      {/* 0. Onboarding Setup Flow for Initial Registrants */}
      {user && user.onboardingDone === false && (
        <React.Suspense fallback={<LoadingFallback />}>
          <OnboardingWizard
            user={user}
            onComplete={(fields) => {
              handleUpdateUserProfile(fields);
            }}
            showToast={showToast}
          />
        </React.Suspense>
      )}
      
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
      <header className="lg:hidden bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60 px-4 py-3 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{mixBlendMode:'lighten' as any}}>
            <img src="/brand/jiuspeak-logo-main.png" alt="JiuSpeak" className="w-full h-full object-contain" style={{mixBlendMode:'lighten'}} />
          </div>
          <h1 className="font-extrabold text-lg tracking-tight">
            <span style={{color:'#84cc16'}}>Jiu</span><span className="text-white">Speak</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-mono font-bold text-slate-200">{user.streak}d</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-mono font-bold text-slate-200">{user.coins} JT</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 hover:text-white transition-colors"
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
              if (tab === 'daily-challenge') setHasDailyChallenge(false);
            }} 
            onOpenCheatModal={() => setCheatModalOpen(true)}
            onLogout={handleLogout}
            unreadMessagesCount={unreadMessagesCount}
            hasDailyChallenge={hasDailyChallenge}
          />
        </div>
      )}

      {/* 3. Main Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <Sidebar 
          user={user} 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'daily-challenge') setHasDailyChallenge(false);
          }}
          onOpenCheatModal={() => setCheatModalOpen(true)}
          onLogout={handleLogout}
          unreadMessagesCount={unreadMessagesCount}
          hasDailyChallenge={hasDailyChallenge}
        />
      </div>

      {/* 4. Main Tab Container body */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden min-h-[calc(100vh-65px)] lg:min-h-screen">
        
        {/* Upper Segmented quick-look profile ribbon */}
        <div className="hidden md:flex justify-between items-center pb-4 border-b border-slate-900/60 text-xs">
          
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono">Bem-vindo(a) de volta!</span>
            {user.role === 'admin' && (
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 px-2.5 rounded-full border border-slate-850">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-mono">Controle de Clientes OK</span>
              </div>
            )}
            {hasDailyChallenge && (
              <button
                onClick={() => {
                  setCurrentTab('daily-challenge');
                  setHasDailyChallenge(false);
                }}
                className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-1 rounded-full transition-all cursor-pointer group"
              >
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-300 font-mono font-bold">Você tem um novo desafio!</span>
                <ChevronRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-md font-mono text-[10px]">
              <Coins className="w-3.5 h-3.5" />
              <span>{user.coins} JT</span>
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
            
            {/* Quick role-swap (restricted dynamically to actual administrators only) */}
            {user.role === 'admin' ? (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Visão:</span>
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
            ) : (
              <div className="flex items-center gap-1.5 ml-2 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px] text-slate-400">
                <span className="uppercase">Função:</span>
                <span className="text-slate-300 font-bold uppercase">
                  {user.role === 'professor' ? 'Professor 🎓' : 'Atleta 🥋'}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Mounted Views Router */}
        <React.Suspense fallback={<LoadingFallback />}>
          {(() => {
            const hasPermission = (featureKey: string): boolean => {
              if (user.role === 'admin') return true;
              
              if (featureKey === 'conversationalSection') {
                // Allow if has active subscription
                if (user.aiConversationExpiresAt) {
                  const expiry = new Date(user.aiConversationExpiresAt);
                  if (expiry.getTime() > Date.now()) return true;
                }
                // Allow if still has free trial matches (< 3 used)
                const pvpUsed = (user as any).pvpFreeMatchesUsed || 0;
                if (pvpUsed < 3) return true;
                // Allow professors
                if (user.role === 'professor' || user.role === 'instructor') return true;
                return false;
              }
              
              // All other modules, store, academies and backpack features are fully unlocked for JT economy!
              return true;
            };

            const hasAcademy = hasPermission('bjjAcademies');
            const hasConversacao = hasPermission('conversationalSection');

            if (currentTab.startsWith('academy')) {
              return (
                <JiuSpeakAcademy 
                  activeSubTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  user={user}
                  updateUser={handleUpdateUserProfile}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'viral') {
              return <ViralShare user={user} />;
            }

            if (currentTab === 'dashboard') {
              return (
                <Dashboard 
                  user={user} 
                  achievements={achievements} 
                  updateUser={handleUpdateUserProfile} 
                  claimAchievement={claimAchievement}
                  onNavigate={(tab) => {
                    setCurrentTab(tab);
                    if (tab === 'daily-challenge') setHasDailyChallenge(false);
                  }}
                  courses={courses}
                  hasDailyChallenge={hasDailyChallenge}
                />
              );
            }

            if (currentTab === 'lessons') {
              return (
                <Lessons 
                  user={user} 
                  courses={courses} 
                  updateUser={handleUpdateUserProfile} 
                  onAddAuditLog={addAuditLog}
                  addXp={addXp}
                  addCoins={addCoins}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'pvp') {
              if (!hasConversacao) {
                return (
                  <div className="flex flex-col items-center justify-center p-8 sm:p-12 min-h-[450px] text-center max-w-xl mx-auto space-y-6" id="403-access-denied-conv">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                      🤖
                    </div>
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase">
                        Sessão Desativada
                      </span>
                      <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">Treino de Conversação com IA</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        A Seção de Conversação Avançada com IA e sparrings virtuais requer ativação por JiuTickets. Ative ou renove seu passe de 30 dias por 5.000 JT na Central de JiuTickets.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-sm justify-center">
                      <button 
                        onClick={() => setCurrentTab('subscriptions')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        Ir para a Central de JiuTickets
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <PvPArena 
                  user={user} 
                  updateUser={handleUpdateUserProfile}
                  syncMe={syncMeAuth}
                  onAddAuditLog={addAuditLog}
                  addXp={addXp}
                  addCoins={addCoins}
                  showToast={showToast}
                  setCurrentTab={setCurrentTab}
                />
              );
            }

            if (currentTab === 'partner-dashboard') {
              return (
                <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /></div>}>
                  <PartnerDashboard user={user} showToast={showToast} />
                </React.Suspense>
              );
            }

            if (currentTab === 'live') {
              return (
                <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>}>
                  <LiveStream user={user} showToast={showToast} onNavigate={setCurrentTab} />
                </React.Suspense>
              );
            }

            if (currentTab === 'partner-store') {
              return (
                <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /></div>}>
                  <PartnerStore user={user} showToast={showToast} onNavigate={setCurrentTab} />
                </React.Suspense>
              );
            }

            if (currentTab === 'daily-challenge') {
              return (
                <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /></div>}>
                  <div className="p-4 md:p-6 max-w-2xl mx-auto">
                    <DailyChallengePage
                      user={user}
                      onXpGain={(xp: number) => {
                        handleUpdateUserProfile({ xp: (user.xp || 0) + xp });
                      }}
                      setCurrentTab={(tab: string) => {
                        setCurrentTab(tab);
                        if (tab === 'daily-challenge') setHasDailyChallenge(false);
                      }}
                    />
                  </div>
                </React.Suspense>
              );
            }

            if (currentTab === 'market') {
              return (
                <StoreMarket 
                  user={user} 
                  updateUser={handleUpdateUserProfile} 
                  onAddAuditLog={addAuditLog}
                  showToast={showToast}
                  setCurrentTab={setCurrentTab}
                />
              );
            }

            if (currentTab === 'inventory') {
              return (
                <InventoryPanel 
                  user={user} 
                  updateUser={handleUpdateUserProfile} 
                  onAddAuditLog={addAuditLog}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'profile-settings') {
              return (
                <ProfilePanel 
                  user={user} 
                  updateUser={handleUpdateUserProfile} 
                  showToast={showToast}
                  onNavigate={setCurrentTab}
                />
              );
            }

            if (currentTab.startsWith('profile-public-')) {
              const username = currentTab.replace('profile-public-', '');
              return (
                <PublicProfileView 
                  username={username}
                  currentUser={user}
                  showToast={showToast}
                  onNavigate={setCurrentTab}
                />
              );
            }

            if (currentTab.startsWith('certificate-public-')) {
              const hash = currentTab.replace('certificate-public-', '');
              return (
                <PublicCertificateView 
                  hash={hash}
                  onNavigate={setCurrentTab}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'social') {
              return (
                <SocialFeed 
                  user={user} 
                  showToast={showToast}
                  onNavigate={setCurrentTab}
                />
              );
            }
            if (currentTab === 'community') {
              return (
                <Community
                  user={user}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'academies') {
              if (!hasAcademy) {
                return (
                  <AccessDenied403 
                    message="403 - Acesso Negado. O acesso às Academias BJJ é exclusivo para os planos PRO e MASTER. Faça o upgrade para fazer parte de equipes virtuais e treinar com professores parceiros!" 
                  />
                );
              }
              return (
                <AcademiesCommunities 
                  user={user} 
                  updateUser={handleUpdateUserProfile} 
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'finance') {
              if (user.role !== 'admin') {
                return (
                  <AccessDenied403 
                    message="403 - Acesso Negado. Esta seção de finanças, carteira e relatórios contábeis é restrita exclusivamente a administradores do ecossistema JiuSpeak." 
                  />
                );
              }
              return (
                <FinancePanel 
                  user={user} 
                  updateUser={handleUpdateUserProfile} 
                  onAddAuditLog={addAuditLog}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'subscriptions') {
              return (
                <SubscriptionPanel 
                  user={user} 
                  updateUser={handleUpdateUserProfile} 
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'marketplace') {
              const isDocente = user.role === 'admin' || user.role === 'professor' || user.role === 'INSTRUCTOR' || user.role === 'TEACHER' || user.role === 'ADMIN';
              if (!isDocente) {
                return (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto px-4">
                    <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-4xl">🎓</div>
                    <div>
                      <h2 className="font-black text-white text-xl mb-2">Seja um Docente JiuSpeak</h2>
                      <p className="text-slate-400 text-sm leading-relaxed">O painel de docente é restrito a professores aprovados pela equipe JiuSpeak. Envie sua candidatura e faça parte do nosso time de instrutores.</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 w-full text-left space-y-3">
                      <p className="text-xs font-mono text-violet-400 uppercase font-bold">Requisitos:</p>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>✅ Faixa Preta ou Marrom de BJJ</li>
                        <li>✅ Experiência em ensino de Inglês ou BJJ</li>
                        <li>✅ Perfil completo na plataforma</li>
                      </ul>
                    </div>
                    <a href="mailto:suporte@jiuspeak.com.br?subject=Candidatura%20Docente%20JiuSpeak"
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl transition-all text-center block">
                      📩 Enviar Candidatura
                    </a>
                  </div>
                );
              }
              return (
                <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" /></div>}>
                  <CreatorPanel
                    user={user}
                    courses={courses}
                    updateUser={handleUpdateUserProfile}
                    onAddNewCourse={handleAddNewCourse}
                    onAddAuditLog={addAuditLog}
                    showToast={showToast}
                  />
                </React.Suspense>
              );
            }
            if (currentTab === 'creator') {
              if (user.role !== 'admin' && user.role !== 'professor') {
                return (
                  <AccessDenied403 
                    message="403 - Acesso Negado. Esta seção de criação de grade e gerenciamento de docência é de acesso restrito a professores e acadêmicos homologados." 
                  />
                );
              }
              return (
                <CreatorPanel 
                  user={user} 
                  courses={courses} 
                  updateUser={handleUpdateUserProfile} 
                  onAddNewCourse={handleAddNewCourse}
                  onAddAuditLog={addAuditLog}
                  showToast={showToast}
                />
              );
            }

            if (currentTab === 'admin') {
              if (user.role !== 'admin') {
                return (
                  <AccessDenied403 
                    message="403 - Acesso Negado. Esta seção é restrita exclusivamente a administradores gerais do ecossistema JiuSpeak." 
                  />
                );
              }
              return (
                <AdminPanel 
                  user={user} 
                  auditLogs={auditLogs} 
                  updateUser={handleUpdateUserProfile} 
                  onClearLogs={clearAuditLogs}
                  showToast={showToast}
                />
              );
            }

            return null;
          })()}
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
                  showToast("+1500 JiuTickets injetados!", "success");
                  addAuditLog('lesson_completed', `Cheat: Developer injetou +1500 JiuTickets.`, undefined, 1500);
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

      {/* CHAT DE SUPORTE IA — aparece em todas as páginas */}
      <React.Suspense fallback={null}>
        <SupportChat user={user} />
      </React.Suspense>

      {activeViralConquest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <ViralShare 
            user={user} 
            isModalStyle={true} 
            onClose={() => setActiveViralConquest(null)}
            preselectedConquest={activeViralConquest}
          />
        </div>
      )}


      {/* BOTTOM NAV MOBILE */}
      {authUser && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800/60 flex items-center justify-around px-1 py-1">
          {[
            { tab: "dashboard", icon: "🏠", label: "Início" },
            { tab: "lessons", icon: "📚", label: "Módulos" },
            { tab: "daily-challenge", icon: "🔥", label: "Desafio" },
            { tab: "pvp", icon: "⚔️", label: "PvP" },
            { tab: "social", icon: "👥", label: "Social" },
            { tab: "profile-settings", icon: "👤", label: "Perfil" },
            { tab: "academies", icon: "🏫", label: "Mais" },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer min-w-[44px] ${
                currentTab === item.tab
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.tab === "profile-settings" ? (
                <img
                  src={user.profilePhoto || user.avatar}
                  alt="perfil"
                  className={`w-6 h-6 rounded-full object-cover border-2 ${currentTab === "profile-settings" ? "border-violet-400" : "border-slate-700"}`}
                />
              ) : (
                <span className="text-lg leading-none">{item.icon}</span>
              )}
              <span className="text-[9px] font-mono font-bold uppercase tracking-wide leading-none">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
