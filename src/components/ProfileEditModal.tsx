import React, { useState, useRef } from 'react';
import { X, Camera, Plus, Trash2 } from 'lucide-react';
import { authFetch } from '../utils/authFetch';
import { SocialIcon, detectSocial } from './socialIcons';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };
const BELT_LABELS: Record<string, string> = { WHITE: 'Branca', BLUE: 'Azul', PURPLE: 'Roxa', BROWN: 'Marrom', BLACK: 'Preta' };
const BELT_COLORS: Record<string, string> = { WHITE: '#e5e7eb', BLUE: '#1a5aad', PURPLE: '#6b21a8', BROWN: '#78350f', BLACK: '#111' };

interface Props {
  profile: any;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onClose: () => void;
  onSaved: (updated: any) => void;
}

const isValidUrl = (u: string) => {
  const s = (u || '').trim();
  if (!s) return false;
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(s);
};

export default function ProfileEditModal({ profile, showToast, onClose, onSaved }: Props) {
  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState(profile.city || '');
  const [academy, setAcademy] = useState(profile.academy || '');
  const [goals, setGoals] = useState(profile.learningGoal || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [links, setLinks] = useState<any[]>(Array.isArray(profile.links) ? profile.links : (() => { try { return JSON.parse(profile.links || '[]'); } catch { return []; } })());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches); mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const usernameValid = username === '' || /^[a-zA-Z0-9_]{3,30}$/.test(username);

  const uploadAvatar = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('media', file);
    try {
      const res = await authFetch('/api/social/upload-media', { method: 'POST', body: fd });
      const d = await res.json();
      if (res.ok && d.url) { setAvatar(d.url); showToast('Foto enviada!', 'success'); }
      else showToast(d.error || 'Erro no upload', 'error');
    } catch { showToast('Erro no upload', 'error'); }
    setUploading(false);
  };

  const addLink = () => { if (links.length < 5) setLinks([...links, { title: '', url: '' }]); };
  const updateLink = (i: number, key: 'title' | 'url', val: string) => setLinks(links.map((l, j) => j === i ? { ...l, [key]: val } : l));
  const removeLink = (i: number) => setLinks(links.filter((_, j) => j !== i));

  const save = async () => {
    if (!name.trim()) { showToast('O nome não pode ficar vazio.', 'error'); return; }
    if (!usernameValid) { showToast('Username inválido: 3 a 30 caracteres (letras, números e _).', 'error'); return; }
    const badLink = links.find(l => (l.url || '').trim() && !isValidUrl(l.url));
    if (badLink) { showToast('Há um link com URL inválida.', 'error'); return; }
    const cleanLinks = links.filter(l => (l.url || '').trim()).map(l => ({ title: (l.title || '').trim() || 'Link', url: l.url.trim() }));

    setSaving(true);
    try {
      const res = await authFetch('/api/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), username: username.trim() || null, bio, city, academy, learningGoal: goals, links: cleanLinks, avatar })
      });
      const d = await res.json();
      if (res.ok) {
        showToast('Perfil atualizado!', 'success');
        onSaved({ ...profile, name: name.trim(), username: username.trim() || null, bio, city, academy, learningGoal: goals, links: cleanLinks, avatar });
        onClose();
      } else {
        showToast(d.error || 'Erro ao salvar', 'error');
      }
    } catch { showToast('Erro ao salvar', 'error'); }
    setSaving(false);
  };

  const label: React.CSSProperties = { fontSize: 11, color: C.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const input: React.CSSProperties = { width: '100%', background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '9px 11px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 200, display: 'flex', alignItems: isDesktop ? 'center' : 'stretch', justifyContent: 'center', padding: isDesktop ? 16 : 0 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: isDesktop ? `0.5px solid ${C.line2}` : 'none', borderRadius: isDesktop ? 16 : 0, width: isDesktop ? 500 : '100%', maxWidth: '100%', height: isDesktop ? 'auto' : '100%', maxHeight: isDesktop ? '90vh' : '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `0.5px solid ${C.line}` }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Editar Perfil</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div onClick={() => avatarInputRef.current?.click()} style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', background: C.card, border: `3px solid ${C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatar ? <img src={avatar} style={{ width: 92, height: 92, objectFit: 'cover' }} /> : <span style={{ fontSize: 30, color: C.gold, fontWeight: 600 }}>{(name || '?')[0]?.toUpperCase()}</span>}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: C.gold, border: `2px solid ${C.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={15} color="#000" />
              </div>
              {uploading && <div style={{ position: 'absolute', inset: 0, background: '#000a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>Enviando...</div>}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ''; }} />
          </div>

          {/* nome */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Nome completo</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={60} style={input} placeholder="Seu nome" />
          </div>

          {/* username */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Username</label>
            <div style={{ display: 'flex', alignItems: 'center', background: C.card2, border: `0.5px solid ${usernameValid ? C.line2 : '#c0392b'}`, borderRadius: 8, padding: '0 11px' }}>
              <span style={{ color: C.faint, fontSize: 13 }}>@</span>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ''))} maxLength={30} style={{ ...input, background: 'transparent', border: 'none', padding: '9px 6px' }} placeholder="username" />
            </div>
            {!usernameValid && <p style={{ fontSize: 10.5, color: '#e07a72', margin: '4px 0 0' }}>3 a 30 caracteres: letras, números e underscore.</p>}
          </div>

          {/* bio */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 300))} rows={3} style={{ ...input, resize: 'none' }} placeholder="Fale sobre você..." />
            <div style={{ textAlign: 'right', fontSize: 10, color: bio.length >= 300 ? '#e07a72' : C.faint, marginTop: 2 }}>{bio.length}/300</div>
          </div>

          {/* localização */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Localização</label>
            <input value={city} onChange={e => setCity(e.target.value)} maxLength={80} style={input} placeholder="Cidade, Estado, País" />
          </div>

          {/* academia/team */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Academia / Team</label>
            <input value={academy} onChange={e => setAcademy(e.target.value)} maxLength={80} style={input} placeholder="Sua academia ou equipe" />
          </div>

          {/* faixa (somente exibição) */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Faixa</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: BELT_COLORS[profile.belt] || '#333', color: profile.belt === 'WHITE' ? '#000' : '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 500 }}>{BELT_LABELS[profile.belt] || profile.belt || 'Branca'}</span>
              <span style={{ fontSize: 10.5, color: C.faint }}>Alterada apenas por validação de professor.</span>
            </div>
          </div>

          {/* objetivos */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Objetivos no Jiu-Jítsu</label>
            <textarea value={goals} onChange={e => setGoals(e.target.value.slice(0, 300))} rows={2} style={{ ...input, resize: 'none' }} placeholder="Ex: Competir internacionalmente e entender seminários..." />
          </div>

          {/* links */}
          <div style={{ marginBottom: 8 }}>
            <label style={label}>Links externos ({links.length}/5)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 7, background: C.card2, border: `0.5px solid ${C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: detectSocial(l.url).color, flexShrink: 0 }}>
                    <SocialIcon url={l.url} size={15} />
                  </span>
                  <input value={l.title} onChange={e => updateLink(i, 'title', e.target.value)} maxLength={40} placeholder="Título" style={{ ...input, flex: '0 0 34%', padding: '8px 9px' }} />
                  <input value={l.url} onChange={e => updateLink(i, 'url', e.target.value)} maxLength={300} placeholder="https://..." style={{ ...input, flex: 1, padding: '8px 9px' }} />
                  <button onClick={() => removeLink(i)} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', flexShrink: 0 }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            {links.length < 5 && (
              <button onClick={addLink} style={{ marginTop: 8, background: 'none', border: `0.5px dashed ${C.line2}`, borderRadius: 8, padding: '8px', color: C.muted, fontSize: 12, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Plus size={14} /> Adicionar link
              </button>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 16px', borderTop: `0.5px solid ${C.line}` }}>
          <button onClick={onClose} style={{ background: 'none', border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '8px 16px', color: C.muted, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={save} disabled={saving || uploading} style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving || uploading ? 0.5 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}
