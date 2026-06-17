export function removeFakeUsers<T extends { name?: string; email?: string; id?: string; username?: string; [key: string]: any }>(users: T[]): T[] {
  if (!Array.isArray(users)) return [];
  const forbiddenPatterns = ["fighter_", "bot_", "npc_", "player_", "fake", "test", "demo", "mock"];
  return users.filter((u) => {
    const nameLower = String(u.name || u.username || "").toLowerCase();
    const emailLower = String(u.email || "").toLowerCase();
    
    const isForbidden = forbiddenPatterns.some(pat => {
      if (pat.endsWith("_")) {
        return nameLower.startsWith(pat) || emailLower.startsWith(pat) || nameLower.includes(pat) || emailLower.includes(pat);
      }
      return nameLower.includes(pat) || emailLower.includes(pat);
    });
    return !isForbidden;
  });
}

/**
 * Complete clear/purge function for Zustand, Redux and general Local/Session Storage caches
 */
export function clearStorageCaches() {
  try {
    const keysToClean = ["bjj-ultimate-leaderboards", "rankings", "leaderboard", "arena-matchmaking", "tatame-users"];
    for (const key of keysToClean) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }

    // Purge any storage keys containing string signs of fake patterns
    const forbidden = ["fighter_", "bot_", "npc_", "player_", "fake", "test", "demo", "mock"];
    
    const keysToPurgeLS: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        if (val) {
          const valLower = val.toLowerCase();
          const matches = forbidden.some(f => valLower.includes(f));
          if (matches) {
            keysToPurgeLS.push(key);
          }
        }
      }
    }
    keysToPurgeLS.forEach(k => localStorage.removeItem(k));

    const keysToPurgeSS: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const val = sessionStorage.getItem(key);
        if (val) {
          const valLower = val.toLowerCase();
          const matches = forbidden.some(f => valLower.includes(f));
          if (matches) {
            keysToPurgeSS.push(key);
          }
        }
      }
    }
    keysToPurgeSS.forEach(k => sessionStorage.removeItem(k));
  } catch (err) {
    console.warn("Could not completely clear client storages:", err);
  }
}
