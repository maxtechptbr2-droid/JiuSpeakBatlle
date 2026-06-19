import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, BeltRank } from '../types';
import { authFetch } from '../utils/authFetch';

export interface AuthContextType {
  user: UserProfile | null;
  authReady: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: 'athlete' | 'professor' | 'admin';
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: { accessToken: string; refreshToken: string; user: any }) => Promise<void>;
  logout: () => Promise<void>;
  syncMe: () => Promise<boolean>;
  updateUser: (fields: Partial<UserProfile>) => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('jiuspeak_user_profile_v2');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          console.log('[PROFILE READ]', parsed);
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse cached profile", e);
      }
    }
    return null;
  });
  const [authReady, setAuthReady] = useState(false);
  const [accessToken, setAccessTokenState] = useState<string | null>(() => localStorage.getItem('jiuspeak_access_token'));
  const [refreshToken, setRefreshTokenState] = useState<string | null>(() => localStorage.getItem('jiuspeak_refresh_token'));

  // Sync token state changes with localStorage
  const setAccessToken = (val: string | null) => {
    if (val) {
      localStorage.setItem('jiuspeak_access_token', val);
      localStorage.setItem('token', val);
      localStorage.setItem('accessToken', val);
    } else {
      localStorage.removeItem('jiuspeak_access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
    }
    setAccessTokenState(val);
  };

  const setRefreshToken = (val: string | null) => {
    if (val) {
      localStorage.setItem('jiuspeak_refresh_token', val);
    } else {
      localStorage.removeItem('jiuspeak_refresh_token');
    }
    setRefreshTokenState(val);
  };

  const mapApiUserToUserProfile = (apiUser: any): UserProfile => {
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
      else if (raw === 'RED') beltString = 'Preto'; // Default boundary
    }

    let resolvedAvatar = apiUser.profilePhoto || apiUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
    let resolvedProfilePhoto = apiUser.profilePhoto || apiUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      avatar: resolvedAvatar,
      level: apiUser.level || 1,
      xp: apiUser.xp || 0,
      xpNextLevel: 1000,
      belt: beltString,
      stripes: apiUser.stripes || 0,
      coins: apiUser.coins !== undefined && apiUser.coins !== null ? apiUser.coins : 600,
      elo: apiUser.elo || 1050,
      winCount: apiUser.winCount || 0,
      lossCount: apiUser.lossCount || 0,
      streak: apiUser.streak || 0,
      lastActiveDate: apiUser.lastActiveDate || new Date().toISOString(),
      academy: apiUser.academy || '',
      category: apiUser.category || 'Pena (-70kg)',
      guardsPreference: apiUser.guardsPreference || 'Guarda Fechada de Aço',
      submitsPreference: apiUser.submitsPreference || 'Estrangulamento Cruzado',
      inventory: apiUser.inventory || [],
      enrolledCourses: apiUser.enrolledCourses || ['course_fundamentals'],
      unlockedAchievements: apiUser.unlockedAchievements || [],
      subscription: apiUser.subscription || { type: 'Gratuito', priceBRL: 0 },
      role: mappedRole,
      balanceBRL: apiUser.balanceAvailableBRL !== undefined ? apiUser.balanceAvailableBRL : (apiUser.balanceBRL || 0.0),
      balanceAvailableBRL: apiUser.balanceAvailableBRL !== undefined ? apiUser.balanceAvailableBRL : 0.0,
      balancePendingBRL: apiUser.balancePendingBRL !== undefined ? apiUser.balancePendingBRL : 0.0,
      totalEarnedBRL: apiUser.totalEarnedBRL !== undefined ? apiUser.totalEarnedBRL : 0.0,
      totalWithdrawnBRL: apiUser.totalWithdrawnBRL !== undefined ? apiUser.totalWithdrawnBRL : 0.0,
      equippedFrame: apiUser.equippedFrame || null,
      onboardingDone: apiUser.onboardingDone,
      bio: apiUser.bio || "",
      city: apiUser.city || "",
      country: apiUser.country || "",
      nativeLanguage: apiUser.nativeLanguage || "Português",
      learningGoal: apiUser.learningGoal || "",
      profilePhoto: resolvedProfilePhoto,
      coverPhoto: apiUser.coverPhoto || "",
      instagram: apiUser.instagram || "",
      youtube: apiUser.youtube || "",
      facebook: apiUser.facebook || "",
      website: apiUser.website || "",
      birthDate: apiUser.birthDate || "",
      phone: apiUser.phone || "",
      englishLevel: apiUser.englishLevel || "Iniciante",
      spanishLevel: apiUser.spanishLevel || "Iniciante",
      frenchLevel: apiUser.frenchLevel || "Iniciante",
      username: apiUser.username || "",
      beltRank: apiUser.beltRank || "Faixa Branca",
      favoriteTechnique: apiUser.favoriteTechnique || "",
      favoriteAthlete: apiUser.favoriteAthlete || "",
      privacyLevel: apiUser.privacyLevel || "public",
      themeColor: apiUser.themeColor || "",
      avatarFrame: apiUser.avatarFrame || "",
      followersCount: apiUser.followersCount || 0,
      followingCount: apiUser.followingCount || 0
    };
  };

  const syncMe = async (): Promise<boolean> => {
    const token = localStorage.getItem('jiuspeak_access_token') || accessToken;
    if (!token) return false;

    try {
      const res = await authFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const profile = mapApiUserToUserProfile(data.user);
          setUser(profile);
          const currentProfile = JSON.parse(localStorage.getItem('jiuspeak_user_profile_v2') || '{}');
          const cleanUser: any = {};
          Object.keys(profile).forEach(key => {
            const val = (profile as any)[key];
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
          const mergedProfile = { ...currentProfile, ...cleanUser };
          localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(mergedProfile));
          console.log('[PROFILE WRITE]', mergedProfile);
          return true;
        }
      }
    } catch (e) {
      console.error("[AuthProvider] Profile sync failed:", e);
    }
    return false;
  };

  const login = async (data: { accessToken: string; refreshToken: string; user: any }) => {
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    
    const profile = mapApiUserToUserProfile(data.user);
    setUser(profile);
    const currentProfile = JSON.parse(localStorage.getItem('jiuspeak_user_profile_v2') || '{}');
    const cleanUser: any = {};
    Object.keys(profile).forEach(key => {
      const val = (profile as any)[key];
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
    const mergedProfile = { ...currentProfile, ...cleanUser };
    localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(mergedProfile));
    console.log('[PROFILE WRITE]', mergedProfile);
  };

  const logout = async () => {
    const rToken = localStorage.getItem('jiuspeak_refresh_token') || refreshToken;
    if (rToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rToken })
        });
      } catch (e) {
        console.error("[AuthProvider] Logout request failed:", e);
      }
    }
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('jiuspeak_user_profile_v2');
    setUser(null);
  };

  const refreshSession = async (): Promise<boolean> => {
    const rToken = localStorage.getItem('jiuspeak_refresh_token') || refreshToken;
    if (!rToken) {
      await logout();
      return false;
    }
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rToken })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          if (data.refreshToken) {
            setRefreshToken(data.refreshToken);
          }
          await syncMe();
          return true;
        }
      }
    } catch (err) {
      console.error("[AuthProvider] refreshSession failed:", err);
    }
    await logout();
    return false;
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      const currentProfile = JSON.parse(localStorage.getItem('jiuspeak_user_profile_v2') || '{}');
      const cleanUser: any = {};
      Object.keys(updated).forEach(key => {
        const val = (updated as any)[key];
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
      const mergedProfile = { ...currentProfile, ...cleanUser };
      localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(mergedProfile));
      console.log('[PROFILE WRITE]', mergedProfile);
      return updated;
    });
  };

  // Run initial session check
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('jiuspeak_access_token') || accessToken;
      const rToken = localStorage.getItem('jiuspeak_refresh_token') || refreshToken;

      if (token && rToken) {
        const success = await syncMe();
        if (!success) {
          await refreshSession();
        }
      }
      setAuthReady(true);
    };

    initSession();

    // Listen to global logout requests from authFetch failure
    const handleLogoutGlobal = () => {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    };
    window.addEventListener('auth-logout-required', handleLogoutGlobal);
    return () => {
      window.removeEventListener('auth-logout-required', handleLogoutGlobal);
    };
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const role = user?.role || 'athlete';

  console.log("[AUTH CONTEXT USER]", user);

  return (
    <AuthContext.Provider value={{
      user,
      authReady,
      isAuthenticated,
      isAdmin,
      role,
      accessToken,
      refreshToken,
      login,
      logout,
      syncMe,
      updateUser,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
