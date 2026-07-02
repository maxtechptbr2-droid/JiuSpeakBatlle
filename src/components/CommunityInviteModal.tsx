import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Check, Link2, UserPlus } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', red: '#c0392b', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };
const BELT_LABELS: Record<string, string> = { WHITE: 'Branca', BLUE: 'Azul', PURPLE: 'Roxa', BROWN: 'Marrom', BLACK: 'Preta' };

interface Props {
  communityId: string;
  communityName: string;
  slug?: string;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onClose: () => void;
}

// ---- ícones das redes (SVG inline, cores oficiais) ----
const IconWhatsApp = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>;
const IconFacebook = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8H16l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/></svg>;
const IconX = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.6l-5.2-6.8L5.3 22H2l7.8-8.9L1.5 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.2 3.9H5.3L17.7 20z"/></svg>;
const IconTelegram = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M22 4.5 2.8 12c-1 .4-1 1 .1 1.3l4.9 1.5 1.9 5.8c.2.5.4.6.9.2l2.7-2 5 3.7c.6.3 1 .1 1.2-.6L23 5.4c.2-.9-.3-1.3-1-.9zM9.5 15.2l-.3 4-1.4-4.4 9.8-6.2c.4-.3.8-.1.5.2l-8.6 6.4z"/></svg>;
const IconInstagram = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2c2.7 0 3 0 4.1.1 1 .1 1.7.2 2.3.5.6.2 1.1.5 1.6 1 .5.5.8 1 1 1.6.2.6.4 1.3.5 2.3.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 1-.2 1.7-.5 2.3-.2.6-.5 1.1-1 1.6-.5.5-1 .8-1.6 1-.6.2-1.3.4-2.3.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1-.1-1.7-.2-2.3-.5-.6-.2-1.1-.5-1.6-1-.5-.5-.8-1-1-1.6-.2-.6-.4-1.3-.5-2.3C2 15 2 14.7 2 12s0-3 .1-4.1c.1-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6.5-.5 1-.8 1.6-1 .6-.2 1.3-.4 2.3-.5C9 2 9.3 2 12 2zm0 1.8c-2.7 0-3 0-4 .1-.9 0-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.3.8-.3 1.7-.1 1-.1 1.3-.1 4s0 3 .1 4c0 .9.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.8.3 1.7.3 1 .1 1.3.1 4 .1s3 0 4-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.3-.8.3-1.7.1-1 .1-1.3.1-4s0-3-.1-4c0-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.3-1.7-.3-1-.1-1.3-.1-4-.1zm0 3.1a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>;

export default function CommunityInviteModal({ communityId, communityName, slug, showToast, onClose }: Props) {
  const [tab, setTab] = useState<'members' | 'share'>('members');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<any>(null);

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // busca com debounce 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authFetch(`/api/communities/${communityId}/search-users?q=${encodeURIComponent(q)}`);
        if (res.ok) setResults((await res.json()).users || []);
        else setResults([]);
      } catch { setResults([]); }
      setSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, communityId]);

  const handleInvite = async (u: any) => {
    setSending(u.id);
    try {
      const res = await authFetch(`/api/communities/${communityId}/invite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) });
      const data = await res.json();
      if (res.ok) {
        setInvited(prev => new Set(prev).add(u.id));
        showToast(`Convite enviado para ${u.displayName || u.name || 'usuário'}!`, 'success');
      } else {
        // se já convidado/membro, marca como feito para desabilitar
        if (/já/i.test(data.error || '')) setInvited(prev => new Set(prev).add(u.id));
        showToast(data.error || 'Erro ao convidar', 'error');
      }
    } catch { showToast('Erro ao convidar', 'error'); }
    setSending(null);
  };

  const [link, setLink] = useState(`https://jiuspeak.com.br/comunidade/${slug || communityId}`);
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/communities/${communityId}/invite-link`);
        if (res.ok) { const d = await res.json(); if (d.inviteLink) setLink(d.inviteLink); }
      } catch {}
    })();
  }, [communityId]);
  const shareText = `Junte-se à comunidade ${communityName} no JiuSpeak!`;
  const openShare = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const copyLink = async (msg = 'Link copiado!') => {
    try { await navigator.clipboard.writeText(link); setCopied(true); showToast(msg, 'success'); setTimeout(() => setCopied(false), 2000); }
    catch { showToast('Não foi possível copiar. Copie manualmente: ' + link, 'error'); }
  };

  const socials = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: <IconWhatsApp />, onClick: () => openShare(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + link)}`) },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', icon: <IconFacebook />, onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`) },
    { key: 'x', label: 'X', color: '#000000', icon: <IconX />, onClick: () => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`) },
    { key: 'telegram', label: 'Telegram', color: '#229ED9', icon: <IconTelegram />, onClick: () => openShare(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`) },
    { key: 'instagram', label: 'Instagram', gradient: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon: <IconInstagram />, onClick: () => copyLink('Link copiado! Copie e cole no Instagram') },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 200, display: 'flex', alignItems: isDesktop ? 'center' : 'stretch', justifyContent: 'center', padding: isDesktop ? 16 : 0 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bg, border: isDesktop ? `0.5px solid ${C.line2}` : 'none',
        borderRadius: isDesktop ? 16 : 0, width: isDesktop ? 500 : '100%', maxWidth: '100%',
        height: isDesktop ? 'auto' : '100%', maxHeight: isDesktop ? '85vh' : '100%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `0.5px solid ${C.line}` }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Convidar</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', borderBottom: `0.5px solid ${C.line}` }}>
          {([['members', 'Convidar Membros'], ['share', 'Compartilhar']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
              background: 'none', border: 'none', fontWeight: tab === id ? 600 : 400,
              color: tab === id ? C.gold : C.faint, borderBottom: `2px solid ${tab === id ? C.gold : 'transparent'}`
            }}>{label}</button>
          ))}
        </div>

        {/* conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {tab === 'members' && (
            <div>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
                <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome ou @username..."
                  style={{ width: '100%', background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '10px 10px 10px 34px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {searching && <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: '16px 0' }}>Buscando...</p>}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: '20px 0' }}>Nenhum usuário encontrado.</p>
              )}
              {!searching && query.trim().length < 2 && (
                <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: '20px 0' }}>Digite ao menos 2 letras para buscar.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map(u => {
                  const done = invited.has(u.id);
                  const dName = u.displayName || u.name || 'Usuário';
                  return (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '8px 12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.line2, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.avatar ? <img src={u.avatar} style={{ width: 40, height: 40, objectFit: 'cover' }} /> : <span style={{ color: C.gold, fontWeight: 500 }}>{dName[0]?.toUpperCase()}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dName}</p>
                        <p style={{ fontSize: 11, color: C.faint, margin: 0 }}>{u.username ? '@' + u.username : ''}</p>
                      </div>
                      <button onClick={() => !done && handleInvite(u)} disabled={done || sending === u.id} style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: done ? 'default' : 'pointer',
                        border: `0.5px solid ${done ? C.line2 : C.gold}`, background: done ? 'transparent' : C.gold, color: done ? C.muted : '#000'
                      }}>
                        {done ? <><Check size={13} /> Convidado</> : (sending === u.id ? 'Enviando...' : <><UserPlus size={13} /> Convidar</>)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'share' && (
            <div>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 14px', lineHeight: 1.5 }}>Compartilhe a comunidade <b style={{ color: C.text }}>{communityName}</b> com seus amigos:</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 12, marginBottom: 18 }}>
                {socials.map(s => (
                  <button key={s.key} onClick={s.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 52, height: 52, borderRadius: '50%', background: (s as any).gradient || s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: s.color === '#000000' ? `1px solid ${C.line2}` : 'none' }}>{s.icon}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{s.label}</span>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 10, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Link da comunidade</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '10px 12px', fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</div>
                <button onClick={() => copyLink()} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: copied ? '#1e7d3422' : C.gold, border: `0.5px solid ${copied ? '#2ecc71' : C.gold}`, color: copied ? '#2ecc71' : '#000', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  {copied ? <><Check size={14} /> Copiado!</> : <><Link2 size={14} /> Copiar</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
