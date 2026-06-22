import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PrivateMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  receiverBelt: string;
}

export default function PrivateMessageModal({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  receiverAvatar,
  receiverBelt
}: PrivateMessageModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getBeltBadgeColor = (belt: string) => {
    switch (belt?.toUpperCase()) {
      case 'WHITE':
      case 'BRANCA': return 'text-slate-900 bg-slate-100 border-slate-300';
      case 'BLUE':
      case 'AZUL': return 'text-blue-400 bg-blue-950/40 border-blue-900/40';
      case 'PURPLE':
      case 'ROXA': return 'text-purple-400 bg-purple-950/40 border-purple-900/40';
      case 'BROWN':
      case 'MARROM': return 'text-amber-500 bg-amber-950/40 border-amber-900/40';
      case 'BLACK':
      case 'PRETA':
      case 'PRETO': return 'text-red-500 bg-red-950/40 border-red-900/40';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const fetchMessages = async (showLoadingState = false) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const res = await fetch(`/api/social/messages/chat/${receiverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setError(null);
        
        // Mark messages as read dynamically
        if (data.length > 0) {
          const hasUnread = data.some((m: any) => m.senderId === receiverId && !m.isRead);
          if (hasUnread) {
            await fetch('/api/social/messages/read', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ senderId: receiverId })
            });
          }
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erro ao carregar mensagens.');
      }
    } catch (err: any) {
      console.error('Error fetching chat history:', err);
      setError('Erro de rede ao carregar chat.');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/social/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId,
          content: inputText.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data]);
        setInputText('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao enviar mensagem.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Erro de rede ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && receiverId) {
      fetchMessages(true);

      // Setup Polling every 4 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(false);
      }, 4000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isOpen, receiverId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[550px] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              {receiverAvatar ? (
                <img
                  src={receiverAvatar}
                  alt={receiverName}
                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-850"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20 flex items-center justify-center text-sm font-bold">
                  {receiverName ? receiverName[0].toUpperCase() : 'U'}
                </div>
              )}
              {/* Active Badge indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-semibold text-slate-100 text-sm">{receiverName}</span>
                {receiverBelt && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase tracking-wider ${getBeltBadgeColor(receiverBelt)}`}>
                    Faixa {receiverBelt}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Suas mensagens são criptografadas e seguras
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <p className="font-mono text-xs text-slate-500">Recuperando histórico de tatame...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="font-mono text-sm text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded-lg">{error}</p>
              <button
                onClick={() => fetchMessages(true)}
                className="mt-3 px-4 py-1.5 bg-slate-800 text-slate-300 font-bold font-mono text-xs hover:text-white rounded-lg transition-all"
              >
                REENTRAR NO CHAT
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-sans font-semibold text-slate-300 text-sm">Nenhuma mensagem aqui</p>
                <p className="font-mono text-[10px] max-w-[250px] mx-auto mt-1 leading-normal text-slate-500">
                  Cumprimente @{receiverName} com um "Oss!" e inicie seu sparring de diálogos de jiu-jitsu em inglês!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isMe = msg.senderId !== receiverId;
                const date = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 border text-xs shadow-md transition-all ${
                        isMe
                          ? 'bg-violet-650 text-white border-violet-600 rounded-tr-none'
                          : 'bg-slate-850 text-slate-200 border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed font-sans">{msg.content}</p>
                      
                      <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[9px] text-slate-300/60 font-medium">
                        <span>{date}</span>
                        {isMe && (
                          <span>
                            {msg.isRead ? (
                              <span className="text-emerald-400 flex items-center">✓✓</span>
                            ) : (
                              <span className="text-slate-400 flex items-center">✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua mensagem ou cumprimente com 'Oss!'..."
            className="flex-1 bg-slate-950/60 text-slate-100 text-xs border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl py-2.5 px-4 font-sans transition-all"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-2.5 bg-violet-605 disabled:bg-slate-800 text-white disabled:text-slate-500 border border-violet-550 disabled:border-slate-800 rounded-xl hover:bg-violet-500 transition-all cursor-pointer flex items-center justify-center shadow-lg"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
