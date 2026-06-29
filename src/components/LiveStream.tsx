import React, { useState, useEffect, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Users, MessageCircle,
  Radio, X, Send, Eye, Play, Square
} from 'lucide-react';

interface LiveStreamProps {
  user: any;
  showToast: (msg: string, type?: string) => void;
  onNavigate?: (tab: string) => void;
}

interface LiveSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  category: string;
  viewerCount: number;
  startedAt: string;
  sessionId: string;
}

interface ChatMessage {
  id: string;
  userName: string;
  message: string;
}

const CATEGORIES = [
  { id: 'treino', label: '🥋 Treino ao Vivo' },
  { id: 'aula', label: '📚 Aula de Inglês BJJ' },
  { id: 'tecnica', label: '🎯 Técnica' },
  { id: 'conversa', label: '💬 Bate-papo' },
];

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token') || '';
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } });

export default function LiveStream({ user, showToast, onNavigate }: LiveStreamProps) {
  const [view, setView] = useState<'feed' | 'broadcast' | 'watch'>('feed');
  const [lives, setLives] = useState<LiveSession[]>([]);
  const [selectedLive, setSelectedLive] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('treino');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const canBroadcast = ['PRO','ELITE','ADMIN','INSTRUCTOR'].includes(user?.subscription || user?.role) || user?.isInstructor || user?.isVerified || user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'TEACHER';

  useEffect(() => { fetchLives(); const i = setInterval(fetchLives, 10000); return () => clearInterval(i); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchLives = async () => {
    try {
      const res = await fetch('/api/live/sessions');
      if (res.ok) { const d = await res.json(); setLives(d.sessions || []); }
    } catch (e) {}
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch { showToast('Erro ao acessar câmera. Verifique as permissões.', 'error'); return null; }
  };

  const startBroadcast = async () => {
    if (!title.trim()) { showToast('Defina um título!', 'error'); return; }
    setConnecting(true);
    const stream = await startCamera();
    if (!stream) { setConnecting(false); return; }
    try {
      const res = await authFetch('/api/live/create', { method: 'POST', body: JSON.stringify({ title, category }) });
      const data = await res.json();
      if (!data.success) { showToast(data.error || 'Erro ao criar live', 'error'); setConnecting(false); return; }
      setSessionId(data.sessionId);
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const offerRes = await authFetch('/api/live/offer', { method: 'POST', body: JSON.stringify({ sessionId: data.sessionId, sdp: offer.sdp }) });
      const offerData = await offerRes.json();
      if (offerData.answer) await pc.setRemoteDescription({ type: 'answer', sdp: offerData.answer });
      connectWS(data.sessionId);
      setIsLive(true); setConnecting(false);
      showToast('🔴 Live iniciada!', 'success'); fetchLives();
    } catch (err: any) { showToast('Erro ao iniciar live.', 'error'); setConnecting(false); }
  };

  const stopBroadcast = async () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close(); wsRef.current?.close();
    if (sessionId) await authFetch('/api/live/end', { method: 'POST', body: JSON.stringify({ sessionId }) });
    setIsLive(false); setSessionId(''); setViewerCount(0); setChatMessages([]);
    showToast('Live encerrada!', 'info'); fetchLives();
  };

  const watchLive = async (live: LiveSession) => {
    setSelectedLive(live); setView('watch');
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] });
      peerConnectionRef.current = pc;
      pc.ontrack = (e) => { if (remoteVideoRef.current && e.streams[0]) remoteVideoRef.current.srcObject = e.streams[0]; };
      const res = await authFetch(`/api/live/join/${live.sessionId}`);
      const data = await res.json();
      if (data.offer) {
        await pc.setRemoteDescription({ type: 'offer', sdp: data.offer });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await authFetch('/api/live/answer', { method: 'POST', body: JSON.stringify({ sessionId: live.sessionId, sdp: answer.sdp, viewerSessionId: data.viewerSessionId }) });
      }
      connectWS(live.sessionId);
    } catch (err) { console.error('[WATCH]', err); }
  };

  const connectWS = (sid: string) => {
    try {
      const ws = new WebSocket(`wss://${window.location.host}/api/live/ws/${sid}?userId=${user.id}&userName=${encodeURIComponent(user.name || 'Atleta')}`);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'chat') setChatMessages(p => [...p.slice(-100), msg]);
          if (msg.type === 'viewers') setViewerCount(msg.count);
          if (msg.type === 'ended') { showToast('Live encerrada pelo transmissor.', 'info'); setView('feed'); }
        } catch {}
      };
    } catch {}
  };

  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', id: Date.now().toString(), userId: user.id, userName: user.name || 'Atleta', message: chatInput.trim() }));
    setChatInput('');
  };

  if (view === 'feed') return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-white text-xl flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Lives da Comunidade
          </h2>
          <p className="text-xs text-slate-500 font-mono">{lives.length} live{lives.length !== 1 ? 's' : ''} ao vivo agora</p>
        </div>
        {canBroadcast ? (
          <button onClick={() => setView('broadcast')} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-red-500/20">
            <Radio className="w-4 h-4" /> Iniciar Live
          </button>
        ) : (
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500 font-mono">🔒 Apenas PRO</div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-900/50 rounded-3xl h-56 animate-pulse border border-slate-800" />)}
        </div>
      ) : lives.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">📡</div>
          <h3 className="font-black text-white text-lg">Nenhuma live agora</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Seja o primeiro a transmitir para a comunidade JiuSpeak!</p>
          {canBroadcast && (
            <button onClick={() => setView('broadcast')} className="mx-auto flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl transition-all">
              <Radio className="w-4 h-4" /> Iniciar Live
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lives.map(live => (
            <div key={live.id} onClick={() => watchLive(live)} className="bg-slate-900/60 border border-slate-800 hover:border-red-500/30 rounded-3xl overflow-hidden cursor-pointer transition-all group">
              <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                <span className="text-4xl">🥋</span>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white">AO VIVO</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl">
                  <Eye className="w-3 h-3 text-white" /><span className="text-[10px] text-white font-mono">{live.viewerCount}</span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"><Play className="w-6 h-6 text-white ml-1" /></div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-sm">
                    {live.userAvatar ? <img src={live.userAvatar} className="w-full h-full object-cover" /> : '🥋'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{live.title}</p>
                    <p className="text-xs text-slate-500 truncate">{live.userName}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
                  {CATEGORIES.find(c => c.id === live.category)?.label || live.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (view === 'broadcast') return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <button onClick={() => { if (isLive) stopBroadcast(); setView('feed'); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-mono transition-colors">← Voltar</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video border border-slate-800">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!isLive && !connecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <div className="text-center space-y-2"><Video className="w-12 h-12 text-slate-600 mx-auto" /><p className="text-slate-500 text-sm">Câmera ativa ao iniciar</p></div>
              </div>
            )}
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-black text-white">AO VIVO</span>
                <span className="text-xs text-red-200 font-mono">{viewerCount} assistindo</span>
              </div>
            )}
            {connecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <div className="text-center space-y-3"><div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto" /><p className="text-white font-bold text-sm">Conectando...</p></div>
              </div>
            )}
          </div>
          {isLive ? (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { const t = localStreamRef.current?.getVideoTracks()[0]; if(t){t.enabled=!videoEnabled;setVideoEnabled(!videoEnabled);} }} className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${videoEnabled?'bg-slate-800 border-slate-700 text-white':'bg-red-900/40 border-red-500/40 text-red-400'}`}>
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button onClick={() => { const t = localStreamRef.current?.getAudioTracks()[0]; if(t){t.enabled=!audioEnabled;setAudioEnabled(!audioEnabled);} }} className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${audioEnabled?'bg-slate-800 border-slate-700 text-white':'bg-red-900/40 border-red-500/40 text-red-400'}`}>
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button onClick={stopBroadcast} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl transition-all">
                <Square className="w-4 h-4" /> Encerrar Live
              </button>
            </div>
          ) : (
            <div className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-5">
              <h3 className="font-black text-white">Configure sua live</h3>
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Título *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Treino de guarda ao vivo!" className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)} className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${category===cat.id?'bg-red-600/20 border-red-500/40 text-white':'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={startBroadcast} disabled={connecting || !title.trim()} className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2">
                <Radio className="w-5 h-5" /> {connecting ? 'Iniciando...' : 'Iniciar Live 🔴'}
              </button>
            </div>
          )}
        </div>
        {isLive && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col h-96 lg:h-auto">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-slate-400" /><span className="text-xs font-mono font-bold text-slate-300 uppercase">Chat</span></div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-mono"><Users className="w-3 h-3" />{viewerCount}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex gap-2 text-xs">
                  <span className="font-bold text-violet-400 shrink-0">{msg.userName}:</span>
                  <span className="text-slate-300">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendChat()} placeholder="Mensagem..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              <button onClick={sendChat} className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center"><Send className="w-3.5 h-3.5 text-white" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (view === 'watch' && selectedLive) return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <button onClick={() => { peerConnectionRef.current?.close(); wsRef.current?.close(); setView('feed'); setSelectedLive(null); setChatMessages([]); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-mono transition-colors">← Voltar</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video border border-slate-800">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" /><span className="text-xs font-black text-white">AO VIVO</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 px-2.5 py-1.5 rounded-xl">
              <Eye className="w-3.5 h-3.5 text-white" /><span className="text-xs text-white font-mono">{viewerCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center text-lg">
              {selectedLive.userAvatar ? <img src={selectedLive.userAvatar} className="w-full h-full object-cover" /> : '🥋'}
            </div>
            <div>
              <p className="font-black text-white">{selectedLive.title}</p>
              <p className="text-xs text-slate-500">{selectedLive.userName} • {CATEGORIES.find(c=>c.id===selectedLive.category)?.label}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col h-96 lg:h-auto">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-slate-400" /><span className="text-xs font-mono font-bold text-slate-300 uppercase">Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {chatMessages.length === 0 && <p className="text-xs text-slate-600 text-center mt-4">Seja o primeiro a comentar!</p>}
            {chatMessages.map(msg => (
              <div key={msg.id} className="flex gap-2 text-xs">
                <span className="font-bold text-violet-400 shrink-0">{msg.userName}:</span>
                <span className="text-slate-300">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-slate-800 flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendChat()} placeholder="Mensagem..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
            <button onClick={sendChat} className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center"><Send className="w-3.5 h-3.5 text-white" /></button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}
