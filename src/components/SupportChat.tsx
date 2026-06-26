import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, X, Send, Bot, User, Minimize2,
  Maximize2, RefreshCw, ChevronDown, Sparkles,
  BookOpen, CreditCard, HelpCircle, Globe, Trophy
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SupportChatProps {
  user?: any;
  initialOpen?: boolean;
}

const QUICK_QUESTIONS = [
  { icon: BookOpen, label: 'Como acessar as aulas?', q: 'Como posso acessar as aulas do curso?' },
  { icon: CreditCard, label: 'Planos e preços', q: 'Quais são os planos disponíveis e quanto custa?' },
  { icon: Globe, label: 'Inglês para competir', q: 'Como o JiuSpeak me ajuda a competir internacionalmente?' },
  { icon: Trophy, label: 'Sistema de faixas', q: 'Como funciona o sistema de módulos por faixa?' },
  { icon: HelpCircle, label: 'Problemas técnicos', q: 'Estou com problemas para acessar o site, o que faço?' },
];

const SYSTEM_PROMPT = `Você é o assistente oficial do JiuSpeak, a plataforma de inglês para praticantes de Jiu-Jitsu Brasileiro.

SOBRE O JIUSPEAK:
- Plataforma de ensino de inglês especializada em BJJ (Brazilian Jiu-Jitsu)
- 5 módulos por faixa: Branca, Azul, Roxa, Marrom e Preta
- Cada módulo tem 20 aulas com: vídeo, podcast, apostila, quiz (5 questões) e flashcards (10 cards)
- Vocabulário técnico de BJJ em inglês: posições, finalizações, comandos, etiqueta
- Módulo 1 (Faixa Branca) é gratuito para visualização
- Possui Voice Sparring (treino de conversação por voz)
- Stand Parceiros (loja de produtos físicos de BJJ em BRL)
- Sistema de pontos JiuTickets (JT) e gamificação
- Suporte via email: suporte@jiuspeak.com.br
- Site: jiuspeak.com.br

COMO RESPONDER:
- Seja amigável, use linguagem do BJJ quando apropriado (OSS!, tatame, etc)
- Respostas curtas e diretas (máximo 3 parágrafos)
- Se não souber algo específico, indique o email de suporte
- Para problemas técnicos sérios, sempre forneça suporte@jiuspeak.com.br
- Fale em português brasileiro
- Use emojis com moderação 🥋`;

const getToken = () => 
  localStorage.getItem('jiuspeak_access_token') || 
  localStorage.getItem('token') || '';

export default function SupportChat({ user, initialOpen = false }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Olá${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋 Sou o assistente do **JiuSpeak**.

Posso te ajudar com dúvidas sobre as aulas, planos, acesso ao sistema, inglês para BJJ e muito mais.

Como posso te ajudar hoje? OSS! 🥋`,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    setInput('');
    setShowQuick(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...history,
            { role: 'user', content }
          ],
          userInfo: { name: user?.name, email: user?.email }
        })
      });

      const data = await response.json();
      const reply = data.content || 'Desculpe, não consegui processar sua mensagem. Tente novamente ou entre em contato via suporte@jiuspeak.com.br';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (!isOpen) setUnreadCount(prev => prev + 1);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ops! Tive um problema de conexão. Para suporte imediato, entre em contato via **suporte@jiuspeak.com.br** 🥋',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      content: `Chat reiniciado! Como posso te ajudar? OSS! 🥋`,
      timestamp: new Date(),
    }]);
    setShowQuick(true);
    setInput('');
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* BOLHA FLUTUANTE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-2xl shadow-violet-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Suporte JiuSpeak"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* JANELA DO CHAT */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl shadow-violet-500/10 flex flex-col transition-all duration-300 ${
          isMinimized ? 'w-72 h-16' : 'w-80 sm:w-96 h-[580px]'
        }`}>
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-950/80 to-slate-950 border-b border-slate-800 rounded-t-3xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-lg">🥋</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>
              <div>
                <p className="text-sm font-black text-white">JiuSpeak Suporte</p>
                <p className="text-[10px] text-emerald-400 font-mono">● Online agora</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={resetChat} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all" title="Reiniciar chat">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* MENSAGENS */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-sm ${
                      msg.role === 'user' 
                        ? 'bg-violet-600/20 border border-violet-500/30' 
                        : 'bg-slate-800 border border-slate-700'
                    }`}>
                      {msg.role === 'user' ? (
                        user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-xl object-cover" /> : <User className="w-3.5 h-3.5 text-violet-400" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                      )}
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    }`}>
                      <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                      <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-violet-300' : 'text-slate-600'}`}>
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* PERGUNTAS RÁPIDAS */}
              {showQuick && messages.length <= 1 && (
                <div className="px-4 pb-2 space-y-1.5 shrink-0">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Perguntas frequentes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.q)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/40 rounded-xl text-[11px] text-slate-300 hover:text-white transition-all font-mono"
                      >
                        <q.icon className="w-3 h-3 text-violet-400" />
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT */}
              <div className="p-3 border-t border-slate-800 shrink-0">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-violet-500/50 rounded-2xl px-3 py-2 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Digite sua dúvida..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-7 h-7 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-700 font-mono text-center mt-1.5">
                  Powered by Claude AI • JiuSpeak
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
