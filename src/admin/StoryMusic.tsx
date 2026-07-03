import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };
const GENRES = ['BJJ Hype', 'Treino', 'Lo-Fi', 'Hip-Hop', 'Trap', 'Funk Instrumental', 'Eletrônica', 'Pagode Instrumental', 'Motivacional'];
const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');

export default function StoryMusic() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', genre: 'BJJ Hype', coverUrl: '' });
  const [file, setFile] = useState<File | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const fetchList = async () => {
    setLoading(true);
    try { const r = await authFetch('/api/admin/stories/music'); if (r.ok) setList((await r.json()).music || []); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, []);

  const upload = async () => {
    if (!file) { notify('Selecione um arquivo de áudio.'); return; }
    if (!form.title || !form.artist) { notify('Preencha título e artista.'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('audio', file);
    fd.append('title', form.title); fd.append('artist', form.artist); fd.append('genre', form.genre);
    if (form.coverUrl) fd.append('coverUrl', form.coverUrl);
    try {
      const res = await fetch('/api/admin/stories/music', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
      const d = await res.json();
      if (res.ok) { notify('Música adicionada!'); setForm({ title: '', artist: '', genre: 'BJJ Hype', coverUrl: '' }); setFile(null); if (fileRef.current) fileRef.current.value = ''; fetchList(); }
      else notify(d.error || 'Erro no upload');
    } catch { notify('Erro no upload'); }
    setUploading(false);
  };

  const toggleActive = async (m: any) => {
    const res = await authFetch(`/api/admin/stories/music/${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !m.isActive }) });
    if (res.ok) fetchList();
  };
  const del = async (m: any) => {
    if (!window.confirm(`Excluir "${m.title}"?`)) return;
    const res = await authFetch(`/api/admin/stories/music/${m.id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) { notify('Música removida.'); fetchList(); }
  };
  const preview = (m: any) => {
    if (playingId === m.id) { audioRef.current?.pause(); setPlayingId(null); return; }
    if (audioRef.current) { audioRef.current.pause(); }
    const a = new Audio(`/api/stories/music/${m.id}/preview`);
    a.play().catch(() => notify('Não foi possível reproduzir.'));
    a.onended = () => setPlayingId(null);
    audioRef.current = a;
    setPlayingId(m.id);
  };

  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const input: React.CSSProperties = { background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none' };

  return (
    <div style={{ color: C.text }}>
      <h2 style={{ color: C.gold, fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>Músicas dos Stories</h2>
      <p style={{ color: C.muted, fontSize: 12, margin: '0 0 16px' }}>Biblioteca royalty-free. Faça upload de trechos curtos (15–30s) que os usuários poderão adicionar aos stories.</p>
      {toast && <div style={{ background: '#1e7d3422', border: '0.5px solid #2ecc71', color: '#2ecc71', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>{toast}</div>}

      {/* Upload */}
      <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>Adicionar música</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
          <input placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={input} />
          <input placeholder="Artista / Produtor" value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} style={input} />
          <select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} style={input}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input placeholder="URL da capa (opcional)" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} style={input} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input ref={fileRef} type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 12, color: C.muted }} />
          <button onClick={upload} disabled={uploading} style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>{uploading ? 'Enviando...' : 'Enviar'}</button>
          <span style={{ fontSize: 11, color: C.faint }}>Formatos: mp3/wav/ogg/m4a · máx 15MB · duração detectada automaticamente</span>
        </div>
      </div>

      {/* Lista */}
      <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
        {loading ? <p style={{ padding: 20, color: C.faint, fontSize: 13 }}>Carregando...</p>
          : list.length === 0 ? <p style={{ padding: 20, color: C.faint, fontSize: 13 }}>Nenhuma música cadastrada ainda. Faça o primeiro upload acima.</p>
            : list.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: `0.5px solid ${C.line}` }}>
                <button onClick={() => preview(m)} style={{ width: 34, height: 34, borderRadius: '50%', background: C.gold, border: 'none', color: '#000', cursor: 'pointer', flexShrink: 0, fontSize: 14 }}>{playingId === m.id ? '❚❚' : '▶'}</button>
                {m.coverUrl ? <img src={m.coverUrl} style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 34, height: 34, borderRadius: 6, background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>{m.title}</p>
                  <p style={{ fontSize: 11, color: C.faint, margin: 0 }}>{m.artist} · {m.genre} · {fmtDur(m.duration || 0)}</p>
                </div>
                <button onClick={() => toggleActive(m)} style={{ background: m.isActive ? '#1e7d3422' : C.card2, border: `0.5px solid ${m.isActive ? '#2ecc71' : C.line2}`, color: m.isActive ? '#2ecc71' : C.muted, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>{m.isActive ? 'Ativa' : 'Inativa'}</button>
                <button onClick={() => del(m)} style={{ background: 'none', border: `0.5px solid #c0392b55`, color: '#e74c3c', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Excluir</button>
              </div>
            ))}
      </div>
    </div>
  );
}
