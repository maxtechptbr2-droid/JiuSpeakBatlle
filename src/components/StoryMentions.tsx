import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

export interface Mention { userId: string; username: string; x: number; y: number; displayName?: string; avatar?: string; }

// Modal de busca de usuários para mencionar (debounce 300ms)
export function MentionSearchModal({ onSelect, onClose, existing }: { onSelect: (u: any) => void; onClose: () => void; existing: string[] }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dref = useRef<any>(null);
  useEffect(() => {
    if (dref.current) clearTimeout(dref.current);
    const s = q.trim();
    if (s.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    dref.current = setTimeout(async () => {
      try { const r = await authFetch(`/api/users/search?q=${encodeURIComponent(s)}`); if (r.ok) setResults((await r.json()).users || []); } catch {}
      setLoading(false);
    }, 300);
    return () => { if (dref.current) clearTimeout(dref.current); };
  }, [q]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 260, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 16px 16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#080a12', border: '0.5px solid #2a2d45', borderRadius: 14, width: 420, maxWidth: '100%', maxHeight: '60vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '0.5px solid #1e2235' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#c0c5e0' }}>Marcar pessoas</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7b83b0', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 14, overflowY: 'auto' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4a5075' }} />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar @username ou nome..."
              style={{ width: '100%', background: '#12152a', border: '0.5px solid #2a2d45', borderRadius: 10, padding: '10px 10px 10px 34px', color: '#c0c5e0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {loading && <p style={{ textAlign: 'center', color: '#4a5075', fontSize: 12, padding: '8px 0' }}>Buscando...</p>}
          {!loading && q.trim().length >= 2 && results.length === 0 && <p style={{ textAlign: 'center', color: '#4a5075', fontSize: 12, padding: '8px 0' }}>Nenhum usuário encontrado.</p>}
          {results.map(u => {
            const already = existing.includes(u.id);
            return (
              <button key={u.id} disabled={already} onClick={() => onSelect(u)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', borderBottom: '0.5px solid #1e2235', padding: '8px 4px', cursor: already ? 'default' : 'pointer', opacity: already ? 0.45 : 1, textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {u.avatar ? <img src={u.avatar} style={{ width: 36, height: 36, objectFit: 'cover' }} /> : <span style={{ color: '#c9a84c' }}>{(u.displayName || '?')[0]?.toUpperCase()}</span>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: '#c0c5e0', margin: 0 }}>{u.displayName}</p>
                  <p style={{ fontSize: 11, color: '#4a5075', margin: 0 }}>{u.username ? '@' + u.username : ''}{already ? ' · já marcado' : ''}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Overlay editável: tags arrastáveis sobre a mídia (posições em % 0..1)
export function MentionEditor({ mentions, setMentions }: { mentions: Mention[]; setMentions: (m: Mention[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragIdx = useRef<number | null>(null);
  const onDown = (i: number) => (e: React.PointerEvent) => { e.stopPropagation(); dragIdx.current = i; try { (e.currentTarget as any).setPointerCapture(e.pointerId); } catch {} };
  const onMove = (e: React.PointerEvent) => {
    if (dragIdx.current === null || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setMentions(mentions.map((m, j) => j === dragIdx.current ? { ...m, x, y } : m));
  };
  const onUp = () => { dragIdx.current = null; };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
      style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: mentions.length ? 'auto' : 'none' }}>
      {mentions.map((m, i) => (
        <div key={i} onPointerDown={onDown(i)}
          style={{ position: 'absolute', left: `${m.x * 100}%`, top: `${m.y * 100}%`, transform: 'translate(-50%,-50%)', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#000000bb', color: '#fff', borderRadius: 16, padding: '4px 6px 4px 10px', fontSize: 12, fontWeight: 600, cursor: 'grab', touchAction: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}>
          @{m.username || m.displayName}
          <span onPointerDown={e => e.stopPropagation()} onClick={() => setMentions(mentions.filter((_, j) => j !== i))} style={{ display: 'flex', cursor: 'pointer' }}><X size={13} /></span>
        </div>
      ))}
    </div>
  );
}

// Overlay de visualização: fade-in após 1s, some após 4s; tap na tag abre o perfil
export function MentionViewer({ mentions, onOpenProfile }: { mentions: Mention[]; onOpenProfile: (userId: string, username?: string) => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!mentions?.length) return;
    const t1 = setTimeout(() => setShow(true), 1000);
    const t2 = setTimeout(() => setShow(false), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mentions]);
  if (!mentions?.length) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
      {mentions.map((m, i) => (
        <button key={i} onClick={(e) => { e.stopPropagation(); onOpenProfile(m.userId, m.username); }}
          style={{ position: 'absolute', left: `${m.x * 100}%`, top: `${m.y * 100}%`, transform: 'translate(-50%,-50%)', pointerEvents: show ? 'auto' : 'none', opacity: show ? 1 : 0, transition: 'opacity 0.4s', background: '#000000aa', color: '#fff', border: 'none', borderRadius: 16, padding: '5px 11px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          @{m.username || m.displayName}
        </button>
      ))}
    </div>
  );
}
