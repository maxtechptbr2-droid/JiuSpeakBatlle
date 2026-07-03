import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Music2, Volume2, VolumeX } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };
const GENRES = ['Todos', 'BJJ Hype', 'Treino', 'Lo-Fi', 'Hip-Hop', 'Trap', 'Funk Instrumental', 'Eletrônica', 'Pagode Instrumental', 'Motivacional'];

export interface SelectedMusic { id: string; title: string; artist: string; duration: number; coverUrl?: string; }
const fmt = (s: number) => `${Math.floor((s || 0) / 60)}:${String((s || 0) % 60).padStart(2, '0')}`;

// Modal seletor de música (categorias, preview, timeline de início)
export function StoryMusicPicker({ onSelect, onClose }: { onSelect: (m: SelectedMusic, startAt: number) => void; onClose: () => void }) {
  const [genre, setGenre] = useState('Todos');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chosen, setChosen] = useState<any | null>(null);
  const [startAt, setStartAt] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try { const r = await authFetch(`/api/stories/music?genre=${encodeURIComponent(genre)}`); if (r.ok) setList((await r.json()).music || []); } catch {}
      setLoading(false);
    })();
  }, [genre]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const preview = (m: any, from = 0) => {
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(`/api/stories/music/${m.id}/preview`);
    a.currentTime = from;
    a.play().catch(() => {});
    a.onended = () => setPlayingId(null);
    audioRef.current = a;
    setPlayingId(m.id);
  };
  const togglePreview = (m: any) => {
    if (playingId === m.id) { audioRef.current?.pause(); setPlayingId(null); }
    else preview(m, m.id === chosen?.id ? startAt : 0);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg, borderTop: `0.5px solid ${C.line2}`, borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 460, maxHeight: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `0.5px solid ${C.line}` }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}><Music2 size={16} color={C.gold} /> Música</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 14px' }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)} style={{ flexShrink: 0, background: genre === g ? '#c9a84c22' : C.card, border: `0.5px solid ${genre === g ? C.gold : C.line2}`, color: genre === g ? C.gold : C.muted, borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>{g}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
          {loading ? <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: 20 }}>Carregando...</p>
            : list.length === 0 ? <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: 20 }}>Nenhuma música nesta categoria ainda.</p>
              : list.map(m => (
                <div key={m.id} onClick={() => { setChosen(m); setStartAt(0); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 6px', borderBottom: `0.5px solid ${C.line}`, cursor: 'pointer', background: chosen?.id === m.id ? '#c9a84c14' : 'transparent', borderRadius: 8 }}>
                  <button onClick={(e) => { e.stopPropagation(); togglePreview(m); }} style={{ width: 34, height: 34, borderRadius: '50%', background: C.gold, border: 'none', color: '#000', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{playingId === m.id ? <Pause size={15} /> : <Play size={15} />}</button>
                  {m.coverUrl ? <img src={m.coverUrl} style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 38, height: 38, borderRadius: 6, background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={16} color={C.muted} /></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                    <p style={{ fontSize: 11, color: C.faint, margin: 0 }}>{m.artist} · {m.genre} · {fmt(m.duration)}</p>
                  </div>
                  {chosen?.id === m.id && <span style={{ color: C.gold, fontSize: 11 }}>✓</span>}
                </div>
              ))}
        </div>

        {chosen && (
          <div style={{ padding: 14, borderTop: `0.5px solid ${C.line}` }}>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 6px' }}>Início do trecho: <b style={{ color: C.gold }}>{fmt(startAt)}</b></p>
            <input type="range" min={0} max={Math.max(0, (chosen.duration || 15) - 1)} value={startAt}
              onChange={e => { const v = parseInt(e.target.value); setStartAt(v); if (playingId === chosen.id) preview(chosen, v); }}
              style={{ width: '100%', accentColor: C.gold }} />
            <button onClick={() => { audioRef.current?.pause(); onSelect({ id: chosen.id, title: chosen.title, artist: chosen.artist, duration: chosen.duration, coverUrl: chosen.coverUrl }, startAt); }}
              style={{ marginTop: 10, width: '100%', background: C.gold, color: '#000', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Usar música</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Player de áudio para o visualizador (auto-play a partir de startAt, botão mute)
export function StoryAudioPlayer({ musicId, startAt }: { musicId: string; startAt?: number }) {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const a = new Audio(`/api/stories/music/${musicId}/preview`);
    a.loop = true;
    a.currentTime = startAt || 0;
    a.muted = muted;
    a.play().catch(() => {});
    audioRef.current = a;
    return () => { a.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicId, startAt]);
  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted; }, [muted]);
  return (
    <button onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }} title={muted ? 'Ativar som' : 'Silenciar'}
      style={{ position: 'absolute', top: 16, left: 16, zIndex: 12, background: '#000000aa', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      {muted ? <VolumeX size={17} color="#fff" /> : <Volume2 size={17} color="#fff" />}
    </button>
  );
}

// Chip de música selecionada (rodapé da criação / visualização)
export function MusicChip({ title, artist, onRemove }: { title: string; artist: string; onRemove?: () => void }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#000000aa', color: '#fff', borderRadius: 16, padding: '5px 10px', fontSize: 12, maxWidth: 260 }}>
      <Music2 size={13} color={C.gold} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title} — {artist}</span>
      {onRemove && <span onClick={onRemove} style={{ cursor: 'pointer', display: 'flex' }}><X size={13} /></span>}
    </div>
  );
}
