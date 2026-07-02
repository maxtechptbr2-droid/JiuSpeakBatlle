import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, LogIn, Lock } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };

interface Props {
  code: string;
  currentUser: any;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate: (tab: string) => void;
}

export default function CommunityInviteAccept({ code, showToast, onNavigate }: Props) {
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('jiuspeak_access_token');
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<any | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await authFetch(`/api/communities/invite/${code}`);
        if (res.ok) {
          const d = await res.json();
          if (alive) { setCommunity(d.community); setLoading(false); }
          return;
        }
        // Não é um convite de comunidade válido → tratar como código de indicação (legado)
        try { localStorage.setItem('jiuspeak_referrer', code); } catch {}
        onNavigate(isLoggedIn ? 'dashboard' : 'landing');
      } catch {
        onNavigate(isLoggedIn ? 'dashboard' : 'landing');
      }
    })();
    return () => { alive = false; };
  }, [code]);

  const accept = async () => {
    if (!isLoggedIn) {
      try { localStorage.setItem('jiuspeak_pending_invite', code); } catch {}
      showToast('Entre ou crie sua conta para aceitar o convite.', 'info');
      onNavigate('landing');
      return;
    }
    setAccepting(true);
    try {
      const res = await authFetch(`/api/communities/invite/${code}/accept`, { method: 'POST' });
      const d = await res.json();
      if (res.ok) {
        setDone(true);
        try { localStorage.removeItem('jiuspeak_pending_invite'); } catch {}
        showToast(d.alreadyMember ? 'Você já faz parte desta comunidade!' : 'Convite aceito! Bem-vindo à comunidade.', 'success');
        setTimeout(() => { window.history.pushState(null, '', '/community'); onNavigate('community'); }, 900);
      } else showToast(d.error || 'Erro ao aceitar convite', 'error');
    } catch { showToast('Erro ao aceitar convite', 'error'); }
    setAccepting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.faint, fontSize: 13 }}>Carregando convite...</div>
        ) : community && (
          <>
            <div style={{ height: 110, background: community.coverImage ? `url(${community.coverImage}) center/cover` : 'linear-gradient(135deg, #1a1030, #0d1033)' }} />
            <div style={{ padding: '0 20px 22px', marginTop: -34, textAlign: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', margin: '0 auto', border: '3px solid #0d0f1a', background: C.gold, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#000', fontWeight: 600 }}>
                {community.avatar ? <img src={community.avatar} style={{ width: 68, height: 68, objectFit: 'cover' }} /> : (community.name || '?')[0]?.toUpperCase()}
              </div>
              <p style={{ fontSize: 12, color: C.gold, margin: '12px 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Convite para comunidade</p>
              <h2 style={{ fontSize: 20, color: C.text, fontWeight: 600, margin: '0 0 4px' }}>{community.name}</h2>
              <p style={{ fontSize: 12, color: C.muted, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Users size={13} /> {Number(community.memberCount || 0).toLocaleString()} membros · {community.category}
              </p>
              {community.description && (
                <p style={{ fontSize: 12.5, color: C.muted, margin: '12px 0 0', lineHeight: 1.5, maxHeight: 84, overflow: 'hidden' }}>{community.description}</p>
              )}
              {community.ownerName && <p style={{ fontSize: 11, color: C.faint, margin: '10px 0 0' }}>Administrada por {community.ownerName}</p>}

              {community.isActive === false && (
                <div style={{ marginTop: 14, background: '#c0392b1a', border: '0.5px solid #c0392b55', borderRadius: 10, padding: '8px 12px', fontSize: 11.5, color: '#e8b4b0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={13} /> Comunidade temporariamente inativa
                </div>
              )}

              <button onClick={accept} disabled={accepting || done}
                style={{ marginTop: 18, width: '100%', background: done ? '#1e7d3422' : C.gold, color: done ? '#2ecc71' : '#000', border: `0.5px solid ${done ? '#2ecc71' : C.gold}`, borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: accepting || done ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: accepting ? 0.6 : 1 }}>
                {done ? <><CheckCircle size={16} /> Convite aceito!</>
                  : accepting ? 'Processando...'
                  : isLoggedIn ? <><CheckCircle size={16} /> Aceitar convite</>
                  : <><LogIn size={16} /> Entrar para aceitar</>}
              </button>

              {!isLoggedIn && <p style={{ fontSize: 11, color: C.faint, margin: '10px 0 0' }}>Você precisa entrar ou criar uma conta no JiuSpeak.</p>}

              <button onClick={() => onNavigate(isLoggedIn ? 'community' : 'landing')} style={{ marginTop: 10, background: 'none', border: 'none', color: C.muted, fontSize: 12, cursor: 'pointer' }}>
                {isLoggedIn ? 'Ver comunidades' : 'Voltar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
