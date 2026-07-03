import React, { useState, useRef } from 'react';
import { X, Plus, Minus } from 'lucide-react';

export interface Sticker { id: string; content: string; x: number; y: number; scale: number; }

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };
const BJJ = ['🥋 OSS!', '🏆 Campeão', '🔥 Treino', '💪 Porrada', '🤙 Jiu-Jitsu', '⚔️ Guerra', '🥇 Ouro', '🦁 Leão'];
const EMOJI = ['😀', '😎', '🥲', '😤', '🔥', '💪', '🙏', '🤙', '👊', '🥋', '🏆', '🥇', '⚔️', '🦁', '❤️', '⭐', '💯', '👑', '🇧🇷', '🐍'];

const uid = () => Math.random().toString(36).slice(2, 10);
const nowTime = () => { const d = new Date(); return `🕐 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

// Modal seletor de stickers
export function StickerPicker({ onSelect, onClose }: { onSelect: (content: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'bjj' | 'emoji' | 'texto' | 'info'>('bjj');
  const pick = (c: string) => { onSelect(c); onClose(); };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg, borderTop: `0.5px solid ${C.line2}`, borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 460, maxHeight: '60vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `0.5px solid ${C.line}` }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Adesivos</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '10px 14px' }}>
          {([['bjj', 'BJJ'], ['emoji', 'Emoji'], ['texto', 'Texto'], ['info', 'Hora/Local']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? '#c9a84c22' : C.card, border: `0.5px solid ${tab === id ? C.gold : C.line2}`, color: tab === id ? C.gold : C.muted, borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 16px' }}>
          {tab === 'bjj' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {BJJ.map(s => <button key={s} onClick={() => pick(s)} style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '12px', color: C.text, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{s}</button>)}
            </div>
          )}
          {tab === 'emoji' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {EMOJI.map(e => <button key={e} onClick={() => pick(e)} style={{ background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', padding: 4 }}>{e}</button>)}
            </div>
          )}
          {tab === 'texto' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ color: C.muted, fontSize: 12, margin: '0 0 10px' }}>Adicione um texto personalizado ao story.</p>
              <button onClick={() => { const t = window.prompt('Texto do adesivo:'); if (t && t.trim()) pick(t.trim().slice(0, 40)); }}
                style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Escrever texto</button>
            </div>
          )}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[nowTime(), '📍 Aqui', '🌡️ 25°C', '📅 Hoje'].map(s => <button key={s} onClick={() => pick(s)} style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '12px', color: C.text, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{s}</button>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Overlay editável: stickers arrastáveis + redimensionáveis (seleciona ao tocar)
export function StickerEditor({ stickers, setStickers }: { stickers: Sticker[]; setStickers: (s: Sticker[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<string | null>(null);
  const drag = useRef<string | null>(null);
  const onDown = (id: string) => (e: React.PointerEvent) => { e.stopPropagation(); drag.current = id; setSel(id); try { (e.currentTarget as any).setPointerCapture(e.pointerId); } catch {} };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setStickers(stickers.map(s => s.id === drag.current ? { ...s, x, y } : s));
  };
  const onUp = () => { drag.current = null; };
  const scale = (id: string, d: number) => setStickers(stickers.map(s => s.id === id ? { ...s, scale: Math.min(3, Math.max(0.5, +(s.scale + d).toFixed(2))) } : s));
  const remove = (id: string) => { setStickers(stickers.filter(s => s.id !== id)); setSel(null); };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onClick={() => setSel(null)}
      style={{ position: 'absolute', inset: 0, zIndex: 16, pointerEvents: stickers.length ? 'auto' : 'none' }}>
      {stickers.map(s => (
        <div key={s.id} onPointerDown={onDown(s.id)} onClick={e => { e.stopPropagation(); setSel(s.id); }}
          style={{ position: 'absolute', left: `${s.x * 100}%`, top: `${s.y * 100}%`, transform: `translate(-50%,-50%) scale(${s.scale})`, cursor: 'grab', touchAction: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: '#fff', textShadow: '0 2px 6px #000', display: 'inline-block', border: sel === s.id ? '1px dashed #c9a84c' : 'none', borderRadius: 6, padding: 2 }}>{s.content}</span>
          {sel === s.id && (
            <div onPointerDown={e => e.stopPropagation()} style={{ position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, background: '#000000cc', borderRadius: 16, padding: 3 }}>
              <button onClick={() => scale(s.id, -0.2)} style={btn}><Minus size={14} /></button>
              <button onClick={() => scale(s.id, 0.2)} style={btn}><Plus size={14} /></button>
              <button onClick={() => remove(s.id)} style={btn}><X size={14} /></button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
const btn: React.CSSProperties = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 3 };

export function makeSticker(content: string, index = 0): Sticker {
  return { id: uid(), content, x: 0.5, y: Math.min(0.8, 0.35 + index * 0.05), scale: 1 };
}

// Overlay de visualização (somente exibe)
export function StickerViewer({ stickers }: { stickers: Sticker[] }) {
  if (!stickers?.length) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
      {stickers.map(s => (
        <span key={s.id} style={{ position: 'absolute', left: `${s.x * 100}%`, top: `${s.y * 100}%`, transform: `translate(-50%,-50%) scale(${s.scale})`, fontSize: 30, fontWeight: 700, color: '#fff', textShadow: '0 2px 6px #000', whiteSpace: 'nowrap' }}>{s.content}</span>
      ))}
    </div>
  );
}
