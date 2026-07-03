import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45', live: '#e0245e', green: '#2ecc71' };

type StatusFilter = 'all' | 'LIVE' | 'SCHEDULED' | 'ENDED' | 'CANCELLED';

const fmtDuration = (secs?: number) => {
  if (!secs || secs < 0) return '—';
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  LIVE: { label: '🔴 Ao vivo', color: '#e0245e' },
  SCHEDULED: { label: 'Agendada', color: '#c9a84c' },
  ENDED: { label: 'Encerrada', color: '#7b83b0' },
  CANCELLED: { label: 'Cancelada', color: '#4a5075' },
};

export default function Lives() {
  const [lives, setLives] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [details, setDetails] = useState<any | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      const res = await authFetch(`/api/admin/lives?${params}`);
      if (res.ok) { const d = await res.json(); setLives(d.lives || []); setActiveCount(d.activeCount || 0); }
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [status]);

  const filtered = lives.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.title || '').toLowerCase().includes(q) || (l.hostName || '').toLowerCase().includes(q) || (l.communityName || '').toLowerCase().includes(q);
  });

  const forceEnd = async (l: any) => {
    const reason = window.prompt(`Encerrar à força a live "${l.title}"?\nMotivo (será enviado ao host):`);
    if (!reason) return;
    const res = await authFetch(`/api/admin/lives/${l.id}/force-end`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    notify(res.ok ? 'Live encerrada e host notificado.' : 'Erro ao encerrar.');
    fetchList();
  };
  const banHost = async (l: any) => {
    if (!window.confirm(`Banir o host "${l.hostName}" desta live? A live será encerrada e a permissão removida.`)) return;
    const suspend = window.confirm('Suspender também a CONTA do usuário na plataforma? (OK = suspender / Cancelar = apenas banir da live)');
    const reason = window.prompt('Motivo do banimento:') || '';
    const res = await authFetch(`/api/admin/lives/${l.id}/ban-host`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suspend, reason }) });
    const d = await res.json().catch(() => ({}));
    notify(res.ok ? `Host banido${d.suspended ? ' e conta suspensa' : ''}.` : 'Erro ao banir host.');
    fetchList();
  };
  const remove = async (l: any) => {
    if (!window.confirm(`Excluir permanentemente a live "${l.title}" e todo o replay/chat/gorjetas? Esta ação é irreversível.`)) return;
    const res = await authFetch(`/api/admin/lives/${l.id}`, { method: 'DELETE' });
    notify(res.ok ? 'Live excluída.' : 'Erro ao excluir.');
    fetchList();
  };

  const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderBottom: `1px solid ${C.line}` };
  const td: React.CSSProperties = { padding: '9px 10px', fontSize: 12, color: C.text, borderBottom: `1px solid ${C.line}`, verticalAlign: 'middle' };
  const actBtn = (color: string): React.CSSProperties => ({ background: 'transparent', border: `1px solid ${color}55`, color, borderRadius: 7, padding: '4px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 600 });

  return (
    <div style={{ color: C.text }}>
      {/* Header + indicador de ativas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Transmissões ao Vivo — Controle Global</h2>
          <p style={{ fontSize: 11.5, color: C.muted, margin: '4px 0 0' }}>Todas as lives de todas as comunidades. Controle total: encerrar, banir host e excluir.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: activeCount > 0 ? '#e0245e18' : C.card2, border: `1px solid ${activeCount > 0 ? '#e0245e55' : C.line}`, borderRadius: 12, padding: '8px 14px' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: activeCount > 0 ? C.live : C.faint, boxShadow: activeCount > 0 ? '0 0 8px #e0245e' : 'none', animation: activeCount > 0 ? 'pulse 1.5s infinite' : 'none' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: activeCount > 0 ? '#fff' : C.muted }}>{activeCount} ao vivo agora</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'LIVE', 'SCHEDULED', 'ENDED'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{ background: status === s ? C.gold : C.card, color: status === s ? '#000' : C.muted, border: `1px solid ${status === s ? C.gold : C.line}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: status === s ? 600 : 400 }}>
            {s === 'all' ? 'Todas' : STATUS_META[s]?.label || s}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título, host ou comunidade..." style={{ flex: 1, minWidth: 200, background: C.card2, border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 12px', color: C.text, fontSize: 12, outline: 'none' }} />
        <button onClick={fetchList} style={{ background: C.card, color: C.muted, border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>Atualizar</button>
      </div>

      {/* Tabela */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: 30, textAlign: 'center', color: C.faint, fontSize: 13 }}>Carregando lives...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 30, textAlign: 'center', color: C.faint, fontSize: 13 }}>Nenhuma live encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
            <thead><tr>
              <th style={th}>Comunidade</th><th style={th}>Host</th><th style={th}>Título</th><th style={th}>Status</th>
              <th style={th}>Viewers</th><th style={th}>Gorjetas</th><th style={th}>Duração</th><th style={{ ...th, textAlign: 'right' }}>Ações</th>
            </tr></thead>
            <tbody>
              {filtered.map(l => {
                const sm = STATUS_META[l.status] || { label: l.status, color: C.muted };
                const ended = l.status === 'ENDED' || l.status === 'CANCELLED';
                return (
                  <tr key={l.id}>
                    <td style={td}>{l.communityName || '—'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {l.hostAvatar && <img src={l.hostAvatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />}
                        <span>{l.hostName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</span>
                      {l.type === 'PAID' && <span style={{ fontSize: 9, color: C.gold }}>PAGA · {l.price} JT</span>}
                    </td>
                    <td style={td}><span style={{ color: sm.color, fontWeight: 600, fontSize: 11 }}>{sm.label}</span></td>
                    <td style={td}>{l.viewerCount || 0}{l.peakViewers ? <span style={{ color: C.faint, fontSize: 10 }}> (pico {l.peakViewers})</span> : ''}</td>
                    <td style={{ ...td, color: C.gold, fontWeight: 600 }}>{l.totalTips || 0} JT</td>
                    <td style={td}>{fmtDuration(l.durationSeconds)}</td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button onClick={() => setDetails(l)} style={actBtn(C.muted)}>Detalhes</button>
                        {!ended && <button onClick={() => forceEnd(l)} style={actBtn('#e67e22')}>Encerrar</button>}
                        <button onClick={() => banHost(l)} style={actBtn(C.live)}>Banir Host</button>
                        <button onClick={() => remove(l)} style={actBtn('#c0392b')}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalhes */}
      {details && (
        <div onClick={() => setDetails(null)} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, width: '100%', maxWidth: 460 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{details.title}</h3>
            {[
              ['Comunidade', details.communityName], ['Host', details.hostName], ['Status', (STATUS_META[details.status] || {}).label || details.status],
              ['Tipo', details.type === 'PAID' ? `Paga (${details.price} JT)` : 'Gratuita'],
              ['Viewers atuais', details.viewerCount || 0], ['Pico de viewers', details.peakViewers || 0],
              ['Gorjetas', `${details.totalTips || 0} JT`], ['Duração', fmtDuration(details.durationSeconds)],
              ['Início', details.startedAt ? new Date(details.startedAt).toLocaleString('pt-BR') : '—'],
              ['Fim', details.endedAt ? new Date(details.endedAt).toLocaleString('pt-BR') : '—'],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.line}`, fontSize: 12.5 }}>
                <span style={{ color: C.muted }}>{k}</span><span style={{ color: C.text, fontWeight: 500 }}>{String(v)}</span>
              </div>
            ))}
            <button onClick={() => setDetails(null)} style={{ marginTop: 14, width: '100%', background: C.card, border: `1px solid ${C.line}`, color: C.text, borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 20, right: 20, background: C.card, border: `1px solid ${C.gold}55`, color: C.text, borderRadius: 10, padding: '10px 16px', fontSize: 13, zIndex: 80, boxShadow: '0 4px 20px #000a' }}>{toast}</div>}
    </div>
  );
}
