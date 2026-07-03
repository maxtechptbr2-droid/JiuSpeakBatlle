import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { authFetch } from '../utils/authFetch';
import {
  Radio, Video, VideoOff, Mic, MicOff, X, Send, Trash2, Users, Gift,
  ChevronLeft, Circle, Clock, PlayCircle, ShieldAlert, Plus, KeyRound
} from 'lucide-react';

// STUN público (sem Cloudflare, sem custo, sem relay de mídia por terceiros)
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
const TOKEN_KEY = 'jiuspeak_access_token';
const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token') || '';

const C = {
  bg: '#080a12', card: '#1a1d2e', card2: '#0d0f1a', gold: '#c9a84c',
  text: '#c0c5e0', muted: '#7a80a0', faint: '#565b7a', line: '#242840',
  live: '#e0245e', green: '#2ecc71',
};

interface Props {
  community: any;
  user: any;
  canModerate: boolean;
  isOwner: boolean;
  myRole: string | null;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// ==================================================================
// COMPONENTE PRINCIPAL — lista de lives + navegação studio/viewer
// ==================================================================
export default function CommunityLives({ community, user, canModerate, isOwner, myRole, showToast }: Props) {
  const communityId = community?.id;
  const [view, setView] = useState<'list' | 'studio' | 'viewer'>('list');
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'FREE', price: '', scheduledAt: '' });
  const [creating, setCreating] = useState(false);

  const canHost = isOwner || myRole === 'moderator' || user.role === 'ADMIN';

  const fetchLives = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const res = await authFetch(`/api/communities/${communityId}/lives`);
      if (res.ok) { const d = await res.json(); setLives(d.lives || []); }
    } catch { /* ignore */ }
    setLoading(false);
  }, [communityId]);

  useEffect(() => { fetchLives(); }, [fetchLives]);

  const handleCreate = async () => {
    if (!form.title.trim()) { showToast('Dê um título à sua live.', 'error'); return; }
    if (form.type === 'PAID' && (!form.price || Number(form.price) <= 0)) { showToast('Defina o preço em JT.', 'error'); return; }
    setCreating(true);
    try {
      const body: any = { title: form.title.trim(), description: form.description, type: form.type };
      if (form.type === 'PAID') body.price = Number(form.price);
      if (form.scheduledAt) body.scheduledAt = new Date(form.scheduledAt).toISOString();
      const res = await authFetch(`/api/communities/${communityId}/lives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: '', description: '', type: 'FREE', price: '', scheduledAt: '' });
        if (d.live.status === 'LIVE') { setActive(d.live); setView('studio'); }
        else { showToast('Live agendada!', 'success'); fetchLives(); }
      } else showToast(d.error || 'Erro ao criar live.', 'error');
    } catch { showToast('Erro de conexão.', 'error'); }
    setCreating(false);
  };

  const handleRequest = async () => {
    const title = prompt('Qual o tema da sua live?');
    if (!title) return;
    const reason = prompt('Por que você quer transmitir?') || '';
    try {
      const res = await authFetch(`/api/communities/${communityId}/live-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, reason }) });
      if (res.ok) showToast('Solicitação enviada ao admin da comunidade!', 'success');
      else showToast('Erro ao enviar solicitação.', 'error');
    } catch { showToast('Erro de conexão.', 'error'); }
  };

  const openLive = (live: any) => {
    if (live.status === 'LIVE') {
      if (live.hostId === user.id) { setActive(live); setView('studio'); }
      else { setActive(live); setView('viewer'); }
    } else if (live.status === 'ENDED') {
      showToast(live.replayUrl ? 'Abrindo replay...' : 'Replay indisponível para esta live.', 'info');
    }
  };

  if (view === 'studio' && active) {
    return <LiveStudio live={active} communityId={communityId} user={user} showToast={showToast} onExit={() => { setActive(null); setView('list'); fetchLives(); }} />;
  }
  if (view === 'viewer' && active) {
    return <LiveViewer live={active} communityId={communityId} user={user} canModerate={canModerate} showToast={showToast} onExit={() => { setActive(null); setView('list'); fetchLives(); }} />;
  }

  const liveNow = lives.filter(l => l.status === 'LIVE');
  const scheduled = lives.filter(l => l.status === 'SCHEDULED');
  const replays = lives.filter(l => l.status === 'ENDED');

  return (
    <div style={{ padding: '14px 4px 28px', maxWidth: 760, margin: '0 auto' }}>
      {/* Ações do topo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio size={18} style={{ color: C.gold }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Transmissões ao Vivo</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canHost && <button onClick={() => setShowPerms(true)} style={btnGhost}><KeyRound size={13} /> Permissões</button>}
          {canHost
            ? <button onClick={() => setShowCreate(true)} style={btnGold}><Plus size={14} /> Nova Live</button>
            : <button onClick={handleRequest} style={btnGhost}><Radio size={13} /> Solicitar transmissão</button>}
        </div>
      </div>

      {loading ? (
        <p style={{ color: C.faint, fontSize: 13, textAlign: 'center', padding: 30 }}>Carregando lives...</p>
      ) : lives.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.faint }}>
          <Video size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Nenhuma transmissão ainda. {canHost ? 'Que tal começar a sua?' : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {liveNow.length > 0 && <Section title="🔴 Ao vivo agora">{liveNow.map(l => <LiveCard key={l.id} live={l} onOpen={openLive} />)}</Section>}
          {scheduled.length > 0 && <Section title="Agendadas">{scheduled.map(l => <LiveCard key={l.id} live={l} onOpen={openLive} />)}</Section>}
          {replays.length > 0 && <Section title="Encerradas">{replays.map(l => <LiveCard key={l.id} live={l} onOpen={openLive} />)}</Section>}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Nova transmissão">
          <Field label="Título"><input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Treino de raspagem" /></Field>
          <Field label="Descrição"><textarea style={{ ...inp, resize: 'none', height: 60 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Tipo">
            <div style={{ display: 'flex', gap: 8 }}>
              {['FREE', 'PAID'].map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} style={{ ...chip, ...(form.type === t ? chipOn : {}) }}>{t === 'FREE' ? 'Gratuita' : 'Paga (JT)'}</button>
              ))}
            </div>
          </Field>
          {form.type === 'PAID' && <Field label="Preço do ingresso (JT)"><input style={inp} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Ex.: 100" /></Field>}
          <Field label="Agendar (opcional)"><input style={inp} type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} /></Field>
          <button onClick={handleCreate} disabled={creating} style={{ ...btnGold, width: '100%', justifyContent: 'center', marginTop: 6, opacity: creating ? 0.5 : 1 }}>
            {creating ? 'Criando...' : form.scheduledAt ? 'Agendar live' : 'Iniciar transmissão agora'}
          </button>
        </Modal>
      )}

      {showPerms && <PermissionsPanel communityId={communityId} showToast={showToast} onClose={() => setShowPerms(false)} />}
    </div>
  );
}

// ==================================================================
// STUDIO (host) — getUserMedia + WebRTC broadcast (1 PC por viewer)
// ==================================================================
function LiveStudio({ live, communityId, user, showToast, onExit }: any) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, { pc: RTCPeerConnection; ice: RTCIceCandidateInit[] }>>(new Map());
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [totalTips, setTotalTips] = useState(live.totalTips || 0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [ending, setEnding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    let cancelled = false;
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    let authed = false;
    let streamReady = false;
    // host-online só depois de autenticar (o servidor bloqueia eventos de socket não-autenticado)
    // E com a câmera pronta (a oferta ao viewer usa o stream local).
    const maybeGoLive = () => { if (authed && streamReady) socket.emit('live:host-online', { liveId: live.id }); };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (localVideoRef.current) { localVideoRef.current.srcObject = stream; }
        setReady(true);
        streamReady = true;
        maybeGoLive();
      } catch (err) {
        showToast('Não foi possível acessar câmera/microfone. Verifique as permissões.', 'error');
      }
    };

    socket.on('connect', () => { socket.emit('auth:register', { token: getToken() }); start(); });
    socket.on('auth:success', () => { authed = true; maybeGoLive(); });

    // Novo viewer pronto → cria PeerConnection e envia offer
    socket.on('live:viewer-ready', async ({ viewerSocketId }: any) => {
      if (!streamRef.current || pcsRef.current.has(viewerSocketId)) return;
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcsRef.current.set(viewerSocketId, { pc, ice: [] });
      streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current!));
      pc.onicecandidate = (e) => { if (e.candidate) socket.emit('live:signal', { to: viewerSocketId, data: { type: 'ice', candidate: e.candidate } }); };
      pc.onconnectionstatechange = () => { if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) { pc.close(); pcsRef.current.delete(viewerSocketId); } };
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('live:signal', { to: viewerSocketId, data: { type: 'offer', sdp: pc.localDescription } });
      } catch { /* ignore */ }
    });

    // Respostas/ICE dos viewers
    socket.on('live:signal', async ({ from, data }: any) => {
      const entry = pcsRef.current.get(from);
      if (!entry) return;
      try {
        if (data.type === 'answer') {
          await entry.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          for (const c of entry.ice) { try { await entry.pc.addIceCandidate(c); } catch {} }
          entry.ice = [];
        } else if (data.type === 'ice') {
          if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(data.candidate);
          else entry.ice.push(data.candidate);
        }
      } catch { /* ignore */ }
    });

    socket.on('live:viewer-joined', ({ viewerCount }: any) => setViewerCount(viewerCount));
    socket.on('live:viewer-left', ({ viewerCount }: any) => setViewerCount(viewerCount));
    socket.on('live:chat-message', (m: any) => setMessages(prev => [...prev.slice(-80), { ...m, kind: 'chat' }]));
    socket.on('live:tip-received', (t: any) => { setMessages(prev => [...prev.slice(-80), { ...t, kind: 'tip' }]); setTotalTips((x: number) => x + (t.amount || 0)); });

    return () => {
      cancelled = true;
      try { socket.emit('live:host-offline', { liveId: live.id }); } catch {}
      pcsRef.current.forEach(({ pc }) => pc.close());
      pcsRef.current.clear();
      streamRef.current?.getTracks().forEach(t => t.stop());
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.id]);

  const toggleMic = () => { const t = streamRef.current?.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); } };
  const toggleCam = () => { const t = streamRef.current?.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; setCamOn(t.enabled); } };

  const endLive = async () => {
    if (!confirm('Encerrar a transmissão?')) return;
    setEnding(true);
    try { await authFetch(`/api/communities/${communityId}/lives/${live.id}/end`, { method: 'DELETE' }); } catch {}
    showToast('Transmissão encerrada.', 'success');
    onExit();
  };

  return (
    <div style={{ padding: '10px 4px 24px', maxWidth: 1080, margin: '0 auto' }}>
      <button onClick={endLive} style={{ ...btnGhost, marginBottom: 10 }}><ChevronLeft size={14} /> Encerrar e voltar</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} className="lg:grid-cols-[1fr_320px]">
          {/* Player local */}
          <div>
            <div style={{ position: 'relative', background: '#000', borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9' }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={liveBadge}><Circle size={8} fill="#fff" /> AO VIVO</span>
                <span style={countBadge}><Users size={11} /> {viewerCount}</span>
              </div>
              {!ready && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>Iniciando câmera...</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={toggleMic} style={{ ...ctrlBtn, ...(micOn ? {} : ctrlOff) }}>{micOn ? <Mic size={16} /> : <MicOff size={16} />}</button>
              <button onClick={toggleCam} style={{ ...ctrlBtn, ...(camOn ? {} : ctrlOff) }}>{camOn ? <Video size={16} /> : <VideoOff size={16} />}</button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}><Gift size={12} /> {totalTips} JT em gorjetas</span>
              <button onClick={endLive} disabled={ending} style={{ ...btnDanger, opacity: ending ? 0.5 : 1 }}>Encerrar Live</button>
            </div>
            <p style={{ fontSize: 15, color: C.text, fontWeight: 600, margin: '12px 0 2px' }}>{live.title}</p>
            {live.description && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{live.description}</p>}
          </div>
          {/* Chat */}
          <ChatPanel messages={messages} chatEndRef={chatEndRef} socket={socketRef.current} liveId={live.id} communityId={communityId} canModerate user={user} showToast={showToast} canTip={false} />
        </div>
      </div>
    </div>
  );
}

// ==================================================================
// VIEWER — recebe stream via WebRTC + chat + gorjetas
// ==================================================================
function LiveViewer({ live, communityId, user, canModerate, showToast, onExit }: any) {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const [gate, setGate] = useState<'loading' | 'pay' | 'ok'>('loading');
  const [price, setPrice] = useState(live.price || 0);
  const [viewerCount, setViewerCount] = useState(live.viewerCount || 0);
  const [messages, setMessages] = useState<any[]>([]);
  const [muted, setMuted] = useState(true);
  const [hostOnline, setHostOnline] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 1) Verifica gate de pagamento
  useEffect(() => {
    let done = false;
    (async () => {
      try {
        const res = await authFetch(`/api/communities/${communityId}/lives/${live.id}`);
        const d = await res.json();
        if (done) return;
        if (d.requiresPayment) { setPrice(d.price); setGate('pay'); }
        else { await joinLive(); }
      } catch { showToast('Erro ao carregar a live.', 'error'); onExit(); }
    })();
    return () => { done = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinLive = async () => {
    try {
      const res = await authFetch(`/api/communities/${communityId}/lives/${live.id}/join`, { method: 'POST' });
      const d = await res.json();
      if (!res.ok) { showToast(d.error || 'Não foi possível entrar.', 'error'); if (d.required) return; onExit(); return; }
      setViewerCount(d.viewerCount || 0);
      setGate('ok');
    } catch { showToast('Erro de conexão.', 'error'); }
  };

  // 2) Conecta WebRTC quando o gate liberar
  useEffect(() => {
    if (gate !== 'ok') return;
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const announce = () => socket.emit('live:viewer-ready', { liveId: live.id });

    // O servidor bloqueia eventos de socket não-autenticado: espera auth:success.
    socket.on('connect', () => { socket.emit('auth:register', { token: getToken() }); });
    socket.on('auth:success', () => { socket.emit('live:join', { liveId: live.id }); announce(); });
    socket.on('live:host-online', () => { setHostOnline(true); announce(); });
    socket.on('live:host-offline', () => { setHostOnline(false); });

    socket.on('live:signal', async ({ from, data }: any) => {
      try {
        if (data.type === 'offer') {
          const pc = new RTCPeerConnection(RTC_CONFIG);
          pcRef.current = pc;
          pc.ontrack = (e) => { if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0]; setHostOnline(true); } };
          pc.onicecandidate = (ev) => { if (ev.candidate) socket.emit('live:signal', { to: from, data: { type: 'ice', candidate: ev.candidate } }); };
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          for (const c of pendingIce.current) { try { await pc.addIceCandidate(c); } catch {} }
          pendingIce.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('live:signal', { to: from, data: { type: 'answer', sdp: pc.localDescription } });
        } else if (data.type === 'ice') {
          if (pcRef.current?.remoteDescription) await pcRef.current.addIceCandidate(data.candidate);
          else pendingIce.current.push(data.candidate);
        }
      } catch { /* ignore */ }
    });

    socket.on('live:viewer-joined', ({ viewerCount }: any) => setViewerCount(viewerCount));
    socket.on('live:viewer-left', ({ viewerCount }: any) => setViewerCount(viewerCount));
    socket.on('live:chat-message', (m: any) => setMessages(prev => [...prev.slice(-80), { ...m, kind: 'chat' }]));
    socket.on('live:tip-received', (t: any) => setMessages(prev => [...prev.slice(-80), { ...t, kind: 'tip' }]));
    socket.on('live:ended', () => { showToast('A transmissão foi encerrada.', 'info'); cleanupAndExit(); });
    socket.on('live:force-ended', ({ reason }: any) => { showToast(`Live encerrada: ${reason || 'pela administração'}.`, 'info'); cleanupAndExit(); });

    const cleanupAndExit = () => { onExit(); };

    return () => {
      try { authFetch(`/api/communities/${communityId}/lives/${live.id}/leave`, { method: 'POST' }); } catch {}
      pcRef.current?.close();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate]);

  const toggleMute = () => { const v = remoteVideoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } };

  const endAsMod = async () => {
    if (!confirm('Encerrar esta live?')) return;
    try { await authFetch(`/api/communities/${communityId}/lives/${live.id}/end`, { method: 'DELETE' }); showToast('Live encerrada.', 'success'); onExit(); } catch {}
  };
  const forceEnd = async () => {
    const reason = prompt('Motivo do encerramento forçado (ADMIN):');
    if (!reason) return;
    try { await authFetch(`/api/admin/lives/${live.id}/force-end`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }); showToast('Live forçada a encerrar.', 'success'); onExit(); } catch {}
  };

  if (gate === 'loading') return <div style={{ padding: 40, textAlign: 'center', color: C.faint }}>Carregando transmissão...</div>;
  if (gate === 'pay') {
    return (
      <div style={{ padding: 40, textAlign: 'center', maxWidth: 380, margin: '0 auto' }}>
        <PlayCircle size={44} style={{ color: C.gold, margin: '0 auto 12px' }} />
        <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{live.title}</p>
        <p style={{ color: C.muted, fontSize: 13, margin: '0 0 16px' }}>Esta é uma live paga. Ingresso: <b style={{ color: C.gold }}>{price} JT</b>.</p>
        <button onClick={joinLive} style={{ ...btnGold, width: '100%', justifyContent: 'center' }}>Pagar {price} JT e assistir</button>
        <button onClick={onExit} style={{ ...btnGhost, width: '100%', justifyContent: 'center', marginTop: 8 }}>Voltar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 4px 24px', maxWidth: 1080, margin: '0 auto' }}>
      <button onClick={onExit} style={{ ...btnGhost, marginBottom: 10 }}><ChevronLeft size={14} /> Voltar</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} className="lg:grid-cols-[1fr_320px]">
        <div>
          <div style={{ position: 'relative', background: '#000', borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9' }}>
            <video ref={remoteVideoRef} autoPlay playsInline muted={muted} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8 }}>
              <span style={liveBadge}><Circle size={8} fill="#fff" /> AO VIVO</span>
              <span style={countBadge}><Users size={11} /> {viewerCount}</span>
            </div>
            {!hostOnline && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, textAlign: 'center', padding: 20 }}>Aguardando o transmissor conectar...</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={toggleMute} style={ctrlBtn}>{muted ? <MicOff size={16} /> : <Mic size={16} />}</button>
            <button onClick={() => setShowTip(true)} style={btnGold}><Gift size={14} /> Enviar Gorjeta</button>
            <div style={{ flex: 1 }} />
            {canModerate && <button onClick={endAsMod} style={btnDanger}>Encerrar Live</button>}
            {user.role === 'ADMIN' && <button onClick={forceEnd} style={{ ...btnDanger, background: '#c0392b' }}><ShieldAlert size={13} /> Forçar</button>}
          </div>
          <p style={{ fontSize: 15, color: C.text, fontWeight: 600, margin: '12px 0 2px' }}>{live.title}</p>
          {live.hostName && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>por {live.hostName}</p>}
        </div>
        <ChatPanel messages={messages} chatEndRef={chatEndRef} socket={socketRef.current} liveId={live.id} communityId={communityId} canModerate={canModerate} user={user} showToast={showToast} canTip />
      </div>

      {showTip && <TipModal price={price} onClose={() => setShowTip(false)} onSend={async (amount, message) => {
        try {
          const res = await authFetch(`/api/communities/${communityId}/lives/${live.id}/tip`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, message }) });
          const d = await res.json();
          if (res.ok) { showToast(`Gorjeta de ${amount} JT enviada!`, 'success'); setShowTip(false); }
          else showToast(d.error || 'Erro ao enviar gorjeta.', 'error');
        } catch { showToast('Erro de conexão.', 'error'); }
      }} />}
    </div>
  );
}

// ==================================================================
// CHAT (compartilhado entre studio e viewer)
// ==================================================================
function ChatPanel({ messages, chatEndRef, socket, liveId, communityId, canModerate, user, showToast, canTip }: any) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim() || !socket) return;
    socket.emit('live:send-chat', { liveId, content: text.trim() });
    setText('');
  };
  const del = async (msgId: string) => {
    try { await authFetch(`/api/communities/${communityId}/lives/${liveId}/chat/${msgId}`, { method: 'DELETE' }); } catch {}
  };
  return (
    <div style={{ background: C.card2, border: `0.5px solid ${C.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column', height: 420, minHeight: 300 }}>
      <div style={{ padding: '10px 12px', borderBottom: `0.5px solid ${C.line}`, fontSize: 12, fontWeight: 600, color: C.text }}>Chat ao vivo</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 && <p style={{ fontSize: 12, color: C.faint, textAlign: 'center', marginTop: 20 }}>Seja o primeiro a comentar!</p>}
        {messages.map((m: any, i: number) => m.kind === 'tip' ? (
          <div key={i} style={{ background: 'linear-gradient(90deg, #c9a84c22, #c9a84c05)', border: `0.5px solid ${C.gold}55`, borderRadius: 10, padding: '6px 10px' }}>
            <span style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}><Gift size={11} /> {m.senderName} enviou {m.amount} JT!</span>
            {m.message && <p style={{ fontSize: 12, color: C.text, margin: '2px 0 0' }}>{m.message}</p>}
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, color: C.gold, fontWeight: 600, flexShrink: 0 }}>{m.username}:</span>
            <span style={{ fontSize: 12, color: C.text, wordBreak: 'break-word' }}>{m.content}</span>
            {canModerate && m.msgId && <button onClick={() => del(m.msgId)} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}><Trash2 size={12} /></button>}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 6, padding: 8, borderTop: `0.5px solid ${C.line}` }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} maxLength={300} placeholder="Diga algo..." style={{ ...inp, flex: 1, padding: '7px 10px' }} />
        <button onClick={send} style={{ ...btnGold, padding: '7px 12px' }}><Send size={14} /></button>
      </div>
    </div>
  );
}

// ==================================================================
// Modal de gorjeta
// ==================================================================
function TipModal({ onClose, onSend }: any) {
  const [amount, setAmount] = useState(50);
  const [message, setMessage] = useState('');
  const presets = [10, 50, 100, 500];
  return (
    <Modal onClose={onClose} title="Enviar Gorjeta 💰">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {presets.map(p => <button key={p} onClick={() => setAmount(p)} style={{ ...chip, ...(amount === p ? chipOn : {}) }}>{p} JT</button>)}
      </div>
      <Field label="Valor personalizado (mín. 10 JT)"><input style={inp} type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={10} /></Field>
      <Field label="Mensagem (opcional)"><input style={inp} value={message} onChange={e => setMessage(e.target.value)} maxLength={200} placeholder="Boa aula, professor!" /></Field>
      <button onClick={() => { if (amount < 10) return; onSend(amount, message); }} style={{ ...btnGold, width: '100%', justifyContent: 'center', marginTop: 6 }}>Enviar {amount} JT</button>
    </Modal>
  );
}

// ==================================================================
// Painel de permissões de live (owner/moderador)
// ==================================================================
function PermissionsPanel({ communityId, showToast, onClose }: any) {
  const [perms, setPerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try { const res = await authFetch(`/api/communities/${communityId}/live-permissions`); if (res.ok) { const d = await res.json(); setPerms(d.permissions || []); } } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const search = async (term: string) => {
    setQ(term);
    if (term.length < 2) { setResults([]); return; }
    try { const res = await authFetch(`/api/communities/${communityId}/search-users?q=${encodeURIComponent(term)}`); if (res.ok) { const d = await res.json(); setResults(d.users || d.results || []); } } catch {}
  };
  const grant = async (userId: string, type: string) => {
    try {
      const res = await authFetch(`/api/communities/${communityId}/live-permissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, type }) });
      if (res.ok) { showToast('Permissão concedida!', 'success'); setQ(''); setResults([]); load(); }
      else showToast('Erro ao conceder.', 'error');
    } catch { showToast('Erro de conexão.', 'error'); }
  };
  const revoke = async (userId: string) => {
    try { await authFetch(`/api/communities/${communityId}/live-permissions/${userId}`, { method: 'DELETE' }); load(); } catch {}
  };

  return (
    <Modal onClose={onClose} title="Quem pode transmitir">
      <Field label="Buscar membro para autorizar">
        <input style={inp} value={q} onChange={e => search(e.target.value)} placeholder="Nome do membro..." />
      </Field>
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {results.map((u: any) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: C.card, borderRadius: 8, padding: '6px 8px' }}>
              <span style={{ fontSize: 12, color: C.text }}>{u.name}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => grant(u.id, 'TEMPORARY')} style={{ ...chip, fontSize: 10, padding: '4px 8px' }}>24h</button>
                <button onClick={() => grant(u.id, 'PERMANENT')} style={{ ...chip, ...chipOn, fontSize: 10, padding: '4px 8px' }}>Permanente</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 11, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 6px' }}>Autorizados</p>
      {loading ? <p style={{ fontSize: 12, color: C.faint }}>Carregando...</p> : perms.length === 0 ? <p style={{ fontSize: 12, color: C.faint }}>Ninguém autorizado ainda.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {perms.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: C.card, borderRadius: 8, padding: '6px 8px' }}>
              <div>
                <span style={{ fontSize: 12, color: C.text }}>{p.name}</span>
                <span style={{ fontSize: 10, color: C.faint, marginLeft: 6 }}>{p.type === 'PERMANENT' ? 'Permanente' : `Até ${p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('pt-BR') : '-'}`}</span>
              </div>
              <button onClick={() => revoke(p.userId)} style={{ background: 'none', border: 'none', color: C.live, cursor: 'pointer' }}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ==================================================================
// Pequenos componentes de UI
// ==================================================================
function LiveCard({ live, onOpen }: any) {
  const isLive = live.status === 'LIVE';
  const isScheduled = live.status === 'SCHEDULED';
  return (
    <div onClick={() => onOpen(live)} style={{ display: 'flex', gap: 12, alignItems: 'center', background: C.card, border: `0.5px solid ${isLive ? C.live + '66' : C.line}`, borderRadius: 12, padding: 12, cursor: isLive ? 'pointer' : 'default' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isLive ? <Radio size={20} style={{ color: C.live }} /> : isScheduled ? <Clock size={20} style={{ color: C.gold }} /> : <PlayCircle size={20} style={{ color: C.muted }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ fontSize: 13.5, color: C.text, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{live.title}</p>
          {isLive && <span style={{ ...liveBadge, position: 'static', padding: '2px 6px', fontSize: 9 }}>AO VIVO</span>}
          {live.type === 'PAID' && <span style={{ fontSize: 9, color: C.gold, border: `0.5px solid ${C.gold}55`, borderRadius: 6, padding: '1px 5px' }}>{live.price} JT</span>}
        </div>
        <p style={{ fontSize: 11, color: C.faint, margin: '2px 0 0' }}>
          {live.hostName ? `por ${live.hostName}` : ''}
          {isLive ? ` · ${live.viewerCount || 0} assistindo` : isScheduled && live.scheduledAt ? ` · ${new Date(live.scheduledAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
        </p>
      </div>
      {isLive && <button style={{ ...btnGold, padding: '6px 12px' }}>Assistir</button>}
    </div>
  );
}

const Section = ({ title, children }: any) => (
  <div>
    <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontWeight: 600 }}>{title}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
  </div>
);

const Field = ({ label, children }: any) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>{label}</label>
    {children}
  </div>
);

const Modal = ({ title, children, onClose }: any) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `0.5px solid ${C.line}`, borderRadius: 16, padding: 18, width: '100%', maxWidth: 400, maxHeight: '85vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

// estilos
const inp: React.CSSProperties = { width: '100%', background: C.card2, border: `0.5px solid ${C.line}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none' };
const btnGold: React.CSSProperties = { background: C.gold, color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 };
const btnGhost: React.CSSProperties = { background: C.card, color: C.muted, border: `0.5px solid ${C.line}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 };
const btnDanger: React.CSSProperties = { background: C.live, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 };
const chip: React.CSSProperties = { background: C.card, color: C.muted, border: `0.5px solid ${C.line}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' };
const chipOn: React.CSSProperties = { background: C.gold, color: '#000', border: `0.5px solid ${C.gold}`, fontWeight: 600 };
const ctrlBtn: React.CSSProperties = { background: C.card, color: C.text, border: `0.5px solid ${C.line}`, borderRadius: 10, width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const ctrlOff: React.CSSProperties = { background: C.live, color: '#fff', border: 'none' };
const liveBadge: React.CSSProperties = { background: C.live, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '3px 7px', display: 'inline-flex', alignItems: 'center', gap: 4 };
const countBadge: React.CSSProperties = { background: '#000a', color: '#fff', fontSize: 11, borderRadius: 6, padding: '3px 7px', display: 'inline-flex', alignItems: 'center', gap: 4 };
