import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };

type SortKey = 'members' | 'jt' | 'expiry';

export default function Communities() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('members');
  const [toast, setToast] = useState<string>('');
  const [editing, setEditing] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const res = await authFetch(`/api/admin/communities?${params}`);
      if (res.ok) setList((await res.json()).communities || []);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchList(); }, [status, search]);

  const sorted = [...list].sort((a, b) => {
    if (sort === 'members') return Number(b.memberCount) - Number(a.memberCount);
    if (sort === 'jt') return Number(b.totalJTArrecadado) - Number(a.totalJTArrecadado);
    const ea = a.paidUntil ? new Date(a.paidUntil).getTime() : 0;
    const eb = b.paidUntil ? new Date(b.paidUntil).getTime() : 0;
    return ea - eb;
  });

  const statusOf = (c: any) => {
    if (c.deletedAt) return { label: 'Excluída', color: '#7b83b0' };
    if (c.isActive === false) return { label: 'Inativa', color: '#e74c3c' };
    return { label: 'Ativa', color: '#2ecc71' };
  };

  const doCharge = async (c: any) => {
    if (!window.confirm(`Cobrar ${Number(c.monthlyFee).toLocaleString()} JT do admin de "${c.name}"?`)) return;
    const res = await authFetch(`/api/admin/communities/${c.id}/charge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const d = await res.json();
    notify(res.ok ? `Cobrado ${d.charged} JT. Novo saldo do admin: ${d.newBalance} JT.` : (d.error || 'Erro'));
    fetchList();
  };
  const doModerate = async (c: any, action: 'warn' | 'suspend' | 'ban') => {
    const reason = window.prompt(`Motivo (${action}) para "${c.name}":`, '') || '';
    const res = await authFetch(`/api/admin/communities/${c.id}/moderate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason }) });
    const d = await res.json();
    notify(res.ok ? `Ação "${action}" aplicada.` : (d.error || 'Erro'));
    fetchList();
  };
  const doDelete = async (c: any) => {
    if (!window.confirm(`Excluir (soft delete) a comunidade "${c.name}"? Os dados NÃO são apagados.`)) return;
    const res = await authFetch(`/api/admin/communities/${c.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Admin' }) });
    const d = await res.json();
    notify(res.ok ? 'Comunidade excluída.' : (d.error || 'Erro'));
    fetchList();
  };
  const saveEdit = async () => {
    const res = await authFetch(`/api/admin/communities/${editing.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: editing.isActive, monthlyFee: Number(editing.monthlyFee), inviteReward: Number(editing.inviteReward), signupReward: Number(editing.signupReward), paidUntil: editing.paidUntil || null })
    });
    const d = await res.json();
    notify(res.ok ? 'Comunidade atualizada.' : (d.error || 'Erro'));
    if (res.ok) { setEditing(null); fetchList(); }
  };
  const openDetails = async (c: any) => {
    setDetails(c); setDetailData(null);
    const res = await authFetch(`/api/communities/${c.id}/admin-dashboard`);
    if (res.ok) setDetailData(await res.json());
  };

  const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, color: C.muted, fontWeight: 500, padding: '8px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td: React.CSSProperties = { fontSize: 12.5, color: C.text, padding: '10px', borderTop: `0.5px solid ${C.line}` };
  const btn: React.CSSProperties = { background: C.card2, border: `0.5px solid ${C.line2}`, color: C.text, borderRadius: 6, padding: '4px 9px', fontSize: 11, cursor: 'pointer' };

  return (
    <div style={{ color: C.text }}>
      <h2 style={{ color: C.gold, fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>Comunidades</h2>
      <p style={{ color: C.muted, fontSize: 12, margin: '0 0 16px' }}>Gestão de monetização, moderação e cobrança de comunidades.</p>

      {toast && <div style={{ background: '#1e7d3422', border: '0.5px solid #2ecc71', color: '#2ecc71', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>{toast}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'active', 'inactive', 'deleted'] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{ background: status === s ? '#c9a84c22' : C.card, border: `0.5px solid ${status === s ? C.gold : C.line2}`, color: status === s ? C.gold : C.muted, borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>
            {s === 'all' ? 'Todas' : s === 'active' ? 'Ativas' : s === 'inactive' ? 'Inativas' : 'Excluídas'}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome..." style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '6px 10px', color: C.text, fontSize: 12, outline: 'none', minWidth: 180 }} />
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '6px 10px', color: C.text, fontSize: 12, outline: 'none' }}>
          <option value="members">Ordenar: Membros</option>
          <option value="jt">Ordenar: JT arrecadado</option>
          <option value="expiry">Ordenar: Vencimento</option>
        </select>
      </div>

      <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead><tr>
            <th style={th}>Status</th><th style={th}>Comunidade</th><th style={th}>Admin</th>
            <th style={th}>Membros</th><th style={th}>Mensalidade</th><th style={th}>Vencimento</th><th style={th}>JT arrecad.</th><th style={th}>Ações</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td style={td} colSpan={8}>Carregando...</td></tr>
              : sorted.length === 0 ? <tr><td style={td} colSpan={8}>Nenhuma comunidade.</td></tr>
                : sorted.map(c => {
                  const st = statusOf(c);
                  return (
                    <tr key={c.id}>
                      <td style={td}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} /> <span style={{ color: st.color, fontSize: 11 }}>{st.label}</span></span></td>
                      <td style={{ ...td, fontWeight: 500 }}>{c.name}<div style={{ fontSize: 10, color: C.faint }}>{c.category}</div></td>
                      <td style={td}>{c.adminName}</td>
                      <td style={td}>{Number(c.memberCount).toLocaleString()}</td>
                      <td style={td}>{Number(c.monthlyFee).toLocaleString()} JT</td>
                      <td style={td}>{c.paidUntil ? new Date(c.paidUntil).toLocaleDateString('pt-BR') : '—'}</td>
                      <td style={{ ...td, color: C.gold }}>{Number(c.totalJTArrecadado).toLocaleString()}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button style={btn} onClick={() => openDetails(c)}>Detalhes</button>
                          <button style={btn} onClick={() => setEditing({ ...c, paidUntil: c.paidUntil ? new Date(c.paidUntil).toISOString().slice(0, 10) : '' })}>Editar</button>
                          <button style={btn} onClick={() => doModerate(c, 'suspend')}>Suspender</button>
                          <button style={btn} onClick={() => doCharge(c)}>Cobrar</button>
                          <button style={{ ...btn, color: '#e74c3c', borderColor: '#c0392b55' }} onClick={() => doDelete(c)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* MODAL EDITAR */}
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `0.5px solid ${C.line2}`, borderRadius: 14, padding: 18, width: 420, maxWidth: '100%' }}>
            <h3 style={{ color: C.gold, fontSize: 15, margin: '0 0 12px' }}>Editar — {editing.name}</h3>
            {[
              { k: 'monthlyFee', label: 'Mensalidade (JT)' },
              { k: 'inviteReward', label: 'Recompensa por convite (JT)' },
              { k: 'signupReward', label: 'Recompensa por cadastro (JT)' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>{f.label}</label>
                <input type="number" value={editing[f.k]} onChange={e => setEditing({ ...editing, [f.k]: e.target.value })} style={{ width: '100%', background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 6, padding: '7px 10px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Pago até</label>
              <input type="date" value={editing.paidUntil} onChange={e => setEditing({ ...editing, paidUntil: e.target.value })} style={{ width: '100%', background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 6, padding: '7px 10px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!editing.isActive} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} /> Comunidade ativa
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btn} onClick={() => setEditing(null)}>Cancelar</button>
              <button style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={saveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {details && (
        <div onClick={() => setDetails(null)} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `0.5px solid ${C.line2}`, borderRadius: 14, padding: 18, width: 520, maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: C.gold, fontSize: 15, margin: '0 0 12px' }}>{details.name}</h3>
            {!detailData ? <p style={{ color: C.muted, fontSize: 12 }}>Carregando...</p> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                  {[['Membros', detailData.totalMembers], ['Convites', detailData.totalInvitesSent], ['Aceitos', detailData.totalInvitesAccepted], ['JT ganhos', detailData.totalRewardsEarned]].map(([l, v]) => (
                    <div key={l as string} style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 16, color: C.gold, fontWeight: 700 }}>{Number(v).toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: C.gold, textTransform: 'uppercase', margin: '0 0 6px' }}>Recompensas recentes</p>
                {(detailData.recentRewards || []).length === 0 ? <p style={{ color: C.faint, fontSize: 12 }}>Nenhuma.</p> :
                  (detailData.recentRewards || []).map((r: any) => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `0.5px solid ${C.line}` }}>
                      <span>{r.userName || 'Usuário'} · {r.reason === 'SIGNUP_COMPLETED' ? 'Cadastro' : 'Convite'}</span>
                      <span style={{ color: '#2ecc71' }}>+{r.amount} JT</span>
                    </div>
                  ))}
                <p style={{ fontSize: 11, color: C.gold, textTransform: 'uppercase', margin: '14px 0 6px' }}>Pagamentos</p>
                {(detailData.paymentHistory || []).length === 0 ? <p style={{ color: C.faint, fontSize: 12 }}>Nenhum.</p> :
                  (detailData.paymentHistory || []).map((p: any) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `0.5px solid ${C.line}` }}>
                      <span>{p.type === 'REACTIVATION' ? 'Reativação' : 'Mensalidade'} · {new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span style={{ color: '#e74c3c' }}>-{p.amount} JT</span>
                    </div>
                  ))}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button style={btn} onClick={() => setDetails(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
