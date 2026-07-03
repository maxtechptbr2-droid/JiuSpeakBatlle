import React, { useRef, useEffect, useState } from 'react';
import { X, Undo2, Trash2, Check } from 'lucide-react';

const COLORS = ['#e74c3c', '#ffffff', '#111111', '#3498db', '#f1c40f', '#2ecc71'];
const WIDTHS = [{ k: 'fino', v: 3 }, { k: 'médio', v: 7 }, { k: 'grosso', v: 14 }];

interface Stroke { color: string; width: number; points: { x: number; y: number }[]; }

// Modal de desenho livre sobre a mídia. onDone recebe o PNG dataURL (ou null se vazio).
export default function StoryDrawing({ onDone, onClose }: { onDone: (dataUrl: string | null) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#e74c3c');
  const [width, setWidth] = useState(7);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const drawing = useRef(false);
  const cur = useRef<Stroke | null>(null);

  const setup = () => {
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    c.width = rect.width; c.height = rect.height;
    redraw();
  };
  useEffect(() => { setup(); const h = () => setup(); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  useEffect(() => { redraw(); }, [strokes]);

  const redraw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of strokes) {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width;
      ctx.beginPath();
      s.points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
    }
  };

  const pos = (e: React.PointerEvent) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const down = (e: React.PointerEvent) => { drawing.current = true; cur.current = { color, width, points: [pos(e)] }; };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !cur.current) return;
    cur.current.points.push(pos(e));
    // desenha incremental
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = cur.current.color; ctx.lineWidth = cur.current.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pts = cur.current.points; const n = pts.length;
    ctx.beginPath(); ctx.moveTo(pts[n - 2].x, pts[n - 2].y); ctx.lineTo(pts[n - 1].x, pts[n - 1].y); ctx.stroke();
  };
  const up = () => { if (cur.current && cur.current.points.length) setStrokes(s => [...s, cur.current!]); drawing.current = false; cur.current = null; };

  const save = () => {
    if (!strokes.length) { onDone(null); return; }
    const c = canvasRef.current!;
    onDone(c.toDataURL('image/png'));
  };

  const bar: React.CSSProperties = { background: '#000000cc', borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 };
  const ic: React.CSSProperties = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0009', zIndex: 270, display: 'flex', flexDirection: 'column' }}>
      {/* topo: cores + espessura + ações */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={bar}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: color === c ? '2px solid #c9a84c' : '2px solid #ffffff55', cursor: 'pointer' }} />
          ))}
        </div>
        <div style={bar}>
          {WIDTHS.map(w => (
            <button key={w.k} onClick={() => setWidth(w.v)} title={w.k} style={{ ...ic, opacity: width === w.v ? 1 : 0.5 }}>
              <span style={{ width: w.v + 4, height: w.v + 4, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            </button>
          ))}
        </div>
        <div style={bar}>
          <button onClick={() => setStrokes(s => s.slice(0, -1))} title="Desfazer" style={ic}><Undo2 size={18} /></button>
          <button onClick={() => setStrokes([])} title="Limpar" style={ic}><Trash2 size={18} /></button>
          <button onClick={onClose} title="Cancelar" style={ic}><X size={20} /></button>
          <button onClick={save} title="Concluir" style={{ ...ic, color: '#c9a84c' }}><Check size={22} /></button>
        </div>
      </div>
      {/* canvas */}
      <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        style={{ flex: 1, width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
