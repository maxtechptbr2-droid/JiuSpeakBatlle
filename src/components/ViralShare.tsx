import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Smartphone, 
  Instagram, 
  MessageSquare, 
  Award, 
  Trophy, 
  Sword, 
  Flame, 
  Coins, 
  RefreshCw, 
  QrCode, 
  ChevronRight,
  ExternalLink,
  Volume2,
  Facebook,
  Twitter,
  Linkedin,
  Send
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';

export interface ShareConquest {
  type: 'nova_faixa' | 'novo_nivel' | 'top_ranking' | 'avatar_raro' | 'moldura_lendaria' | 'vitoria_pvp' | 'nova_conquista';
  title: string;
  description: string;
  badge: string; // Emoji or short code
  highlightColor: string; // indigo, amber, emerald, etc.
}

interface ViralShareProps {
  user: UserProfile;
  onClose?: () => void; // Optional if displayed as modal
  isModalStyle?: boolean;
  preselectedConquest?: {
    type: ShareConquest['type'];
    customTitle?: string;
  } | null;
}

const CONQUEST_TEMPLATES: Record<ShareConquest['type'], ShareConquest> = {
  nova_faixa: {
    type: 'nova_faixa',
    title: 'PROMOÇÃO DE FAIXA!',
    description: 'Novo manto de combate conquistado com dedicação e muito suor nos tatames de conversação!',
    badge: '🥋',
    highlightColor: '#8b5cf6', // Violet
  },
  novo_nivel: {
    type: 'novo_nivel',
    title: 'NOVO NÍVEL ALCANÇADO!',
    description: 'A evolução intelectual e técnica corre pelas veias. Mais forte a cada treino!',
    badge: '⚡',
    highlightColor: '#f59e0b', // Amber
  },
  top_ranking: {
    type: 'top_ranking',
    title: 'NO TOP DO RANKING!',
    description: 'Elite absoluta! Consistência lendária que me destaca entre os melhores atletas da academia.',
    badge: '🏆',
    highlightColor: '#3b82f6', // Blue
  },
  avatar_raro: {
    type: 'avatar_raro',
    title: 'AVATAR COLECIONÁVEL DESBLOQUEADO!',
    description: 'Skin ultra-exclusiva equipada na mochila. Estilo imbatível consolidado!',
    badge: '✨',
    highlightColor: '#ec4899', // Pink
  },
  moldura_lendaria: {
    type: 'moldura_lendaria',
    title: 'MOLDURA LENDÁRIA ATIVADA!',
    description: 'Selo de honra que protege e ostenta minha imagem de guerreiro no feed principal.',
    badge: '🔥',
    highlightColor: '#d97706', // Yellowish Orange
  },
  vitoria_pvp: {
    type: 'vitoria_pvp',
    title: 'VITÓRIA NA ARENA PVP SPARRING!',
    description: 'Desafio em inglês finalizado via Chave de Braço perfeita! Sem dar chances pro adversário.',
    badge: '⚔️',
    highlightColor: '#10b981', // Emerald
  },
  nova_conquista: {
    type: 'nova_conquista',
    title: 'CONQUISTA DESTRAVADA!',
    description: 'Mais um marco histórico superado com maestria nos tatames virtuais de conversação!',
    badge: '🎖️',
    highlightColor: '#f43f5e', // Rose
  }
};

type CardFormat = 'instagram' | 'story' | 'whatsapp';

interface FormatConfig {
  width: number;
  height: number;
  name: string;
  icon: any;
  ratio: string;
}

const FORMAT_CONFIGS: Record<CardFormat, FormatConfig> = {
  instagram: {
    width: 1080,
    height: 1080,
    name: 'Instagram Feed (Quadrado)',
    icon: Instagram,
    ratio: '1:1 (1080x1080)',
  },
  story: {
    width: 1080,
    height: 1920,
    name: 'Instagram Story (Vertical)',
    icon: Smartphone,
    ratio: '9:16 (1080x1920)',
  },
  whatsapp: {
    width: 1200,
    height: 630,
    name: 'WhatsApp/Facebook (Paisagem)',
    icon: MessageSquare,
    ratio: '1.91:1 (1200x630)',
  }
};

export const ViralShare: React.FC<ViralShareProps> = ({
  user,
  onClose,
  isModalStyle = false,
  preselectedConquest = null,
}) => {
  // State for customizing card parameters
  const [conquestType, setConquestType] = useState<ShareConquest['type']>(
    preselectedConquest?.type || 'vitoria_pvp'
  );
  const [cardFormat, setCardFormat] = useState<CardFormat>('instagram');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [instaStoriesModal, setInstaStoriesModal] = useState(false);
  
  // Editable fields to allow tailoring custom shares
  const [customName, setCustomName] = useState(user.name);
  const [customBelt, setCustomBelt] = useState<BeltRank>(user.belt || 'Branca');
  const [customLevel, setCustomLevel] = useState(user.level);
  const [customElo, setCustomElo] = useState(user.elo || 1500);
  const [customXP, setCustomXP] = useState(user.xp || 500);
  const [customTitle, setCustomTitle] = useState('');
  
  // Image URL state for the canvas rendering
  const [isRendering, setIsRendering] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string>('');

  // Audio Fanfare synthesizer
  const playSoundFanfare = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) return;

      // Primary synth sound setup
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(0.2, start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = audioCtx.currentTime;
      // Jiu-Jitsu epic chord triad fanfare
      playTone(392.00, now, 0.4, 'triangle'); // G4
      playTone(493.88, now + 0.15, 0.4, 'triangle'); // B4
      playTone(587.33, now + 0.30, 0.4, 'triangle'); // D5
      playTone(783.99, now + 0.45, 0.8, 'sine'); // G5 (epic top sustain)
      playTone(783.99, now + 0.45, 0.8, 'triangle'); // G5 fat support
    } catch (e) {
      console.warn("WebAudio fanfare blocked or unsupported", e);
    }
  };

  // Play sound on mount if opened as an automated popup
  useEffect(() => {
    if (isModalStyle) {
      playSoundFanfare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalStyle]);

  // Synchronize initial overrides when active user profile fluctuates
  useEffect(() => {
    setCustomName(user.name);
    setCustomBelt(user.belt || 'Branca');
    setCustomLevel(user.level);
    setCustomElo(user.elo || 1500);
    setCustomXP(user.xp || 500);
  }, [user]);

  // Generate shareable link
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    const query = new URLSearchParams({
      share: 'true',
      name: customName,
      belt: customBelt,
      level: customLevel.toString(),
      elo: customElo.toString(),
      achievement: preselectedConquest?.customTitle || CONQUEST_TEMPLATES[conquestType].title,
      type: conquestType,
      xp: customXP.toString(),
      avatar: user.avatar,
      frame: user.equippedFrame?.name || 'none'
    });
    return `${baseUrl}/?${query.toString()}`;
  };

  // Copy helpers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // QR Code Image URL based on Free secure QR Server API
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=ffffff&bgcolor=0a122c&data=${encodeURIComponent(getShareUrl())}`;

  // MAIN HTML5 CANVAS RENDER CONTROLLER
  const renderCanvas = async () => {
    try {
      setIsRendering(true);
      setCanvasError(null);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const format = FORMAT_CONFIGS[cardFormat];
      canvas.width = format.width;
      canvas.height = format.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not instantiate canvas 2D execution context");

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const template = CONQUEST_TEMPLATES[conquestType];
      const activeTitle = customTitle || template.title;
      const highlightHex = template.highlightColor;

      // 1. Draw Deep Cyber Space background gradient
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
      );
      bgGrad.addColorStop(0, '#121a36'); // Luminous deep blue
      bgGrad.addColorStop(0.5, '#070a14'); // Charcoal dark blue
      bgGrad.addColorStop(1, '#020307'); // Absolute darkness matrix
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Decorative Cyber Tatame Line Patterns
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.08)'; // Semi-invisible purple
      ctx.lineWidth = 2;
      // Draw grid lines
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw concentric BJJ sparring center mat circles
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 350, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, Math.PI * 2);
      ctx.stroke();

      // Draw outer glowing neon border
      ctx.strokeStyle = highlightHex;
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
      
      // Draw inner sub-border for premium finish
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // 3. Render Title & Certificate Header
      // Define flexible scaling coordinate structures depending on format
      let avatarY = canvas.height * 0.38;
      let titleY = canvas.height * 0.16;
      let metaY = canvas.height * 0.68;
      let badgeY = canvas.height * 0.81;
      let qrX = canvas.width - 160;
      let qrY = canvas.height - 160;

      if (cardFormat === 'story') {
        titleY = canvas.height * 0.22;
        avatarY = canvas.height * 0.44;
        metaY = canvas.height * 0.70;
        badgeY = canvas.height * 0.80;
        qrX = canvas.width / 2 - 70;
        qrY = canvas.height * 0.85;
      } else if (cardFormat === 'whatsapp') {
        titleY = canvas.height * 0.18;
        avatarY = canvas.height * 0.48;
        metaY = canvas.height * 0.78;
        badgeY = canvas.height * 0.88;
        qrX = canvas.width - 240;
        qrY = canvas.height * 0.40;
      }

      // Draw "JIUSPEAK ACADEMY" watermark
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText("JIUSPEAK ATAMA VIRTUAL", canvas.width / 2, titleY - 60);

      // Draw Conquest Major Badge (Emoji in background)
      ctx.font = '140px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillText(template.badge, canvas.width / 2, avatarY - 80);

      // Draw Main Title with heavy drop shadow
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 6;
      ctx.strokeText(activeTitle, canvas.width / 2, titleY);
      
      const titleGrad = ctx.createLinearGradient(0, titleY - 30, 0, titleY + 10);
      titleGrad.addColorStop(0, '#ffffff');
      titleGrad.addColorStop(1, highlightHex);
      ctx.fillStyle = titleGrad;
      ctx.fillText(activeTitle, canvas.width / 2, titleY);

      // Draw Description under title
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#9cb3f9';
      ctx.textAlign = 'center';
      wrapText(ctx, template.description, canvas.width / 2, titleY + 45, canvas.width - 200, 30);

      // 4. LOAD AND DRAW ATHLETE AVATAR & FRAME
      // Draw black shield circle background back of avatar
      const avatarRadius = 110;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, avatarY, avatarRadius + 18, 0, Math.PI * 2);
      ctx.fillStyle = '#060a14';
      ctx.fill();

      // Render actual Unsplash/Dicebear avatar of candidate
      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      
      // Setup loading promises for avatar & qr
      const loadImage = (img: HTMLImageElement, src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image resource from ${src}`));
          img.src = src;
        });
      };

      try {
        // Fallback-aware loader
        await loadImage(avatarImg, user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customName)}`);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          avatarImg,
          (canvas.width / 2) - avatarRadius,
          avatarY - avatarRadius,
          avatarRadius * 2,
          avatarRadius * 2
        );
        ctx.restore();
      } catch (avatarError) {
        console.warn("Could not render Unsplash/Dicebear CORS avatar on canvas, drawing high-quality fallback silhouette.", avatarError);
        // Fallback premium graphic drawing vector silhouette of a fighter
        ctx.beginPath();
        ctx.arc(canvas.width / 2, avatarY, avatarRadius, 0, Math.PI * 2);
        const gradSilhouette = ctx.createLinearGradient(0, avatarY - avatarRadius, 0, avatarY + avatarRadius);
        gradSilhouette.addColorStop(0, '#312e81');
        gradSilhouette.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = gradSilhouette;
        ctx.fill();

        // Initial characters of Athlete name
        ctx.font = 'bold 74px Arial';
        ctx.fillStyle = '#818cf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(customName.substring(0, 2).toUpperCase(), canvas.width / 2, avatarY);
      }

      // Draw Equipped Cosméticos Frame Border with glow depending on rarity rank
      const frameGrad = ctx.createLinearGradient(
        (canvas.width / 2) - avatarRadius, avatarY - avatarRadius,
        (canvas.width / 2) + avatarRadius, avatarY + avatarRadius
      );

      const frameCheck = user.equippedFrame?.name?.toLowerCase() || 'none';
      if (frameCheck.includes('lend') || frameCheck.includes('legen') || conquestType === 'moldura_lendaria') {
        // Ultra-Epic Legendary Frame Gradient
        frameGrad.addColorStop(0, '#a855f7'); // Violet
        frameGrad.addColorStop(0.5, '#ec4899'); // Fuchsia
        frameGrad.addColorStop(1, '#fbbf24'); // Amber gold
        ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
        ctx.shadowBlur = 30;
      } else if (frameCheck.includes('ouro') || frameCheck.includes('gold')) {
        frameGrad.addColorStop(0, '#d97706');
        frameGrad.addColorStop(0.5, '#fbbf24');
        frameGrad.addColorStop(1, '#b45309');
        ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
        ctx.shadowBlur = 20;
      } else if (frameCheck.includes('prata') || frameCheck.includes('silver')) {
        frameGrad.addColorStop(0, '#94a3b8');
        frameGrad.addColorStop(0.5, '#f1f5f9');
        frameGrad.addColorStop(1, '#475569');
        ctx.shadowColor = 'rgba(148, 163, 184, 0.4)';
        ctx.shadowBlur = 12;
      } else if (frameCheck.includes('diamante') || frameCheck.includes('diamond')) {
        frameGrad.addColorStop(0, '#06b6d4'); // Cyan
        frameGrad.addColorStop(0.5, '#ffffff');
        frameGrad.addColorStop(1, '#3b82f6'); // Blue
        ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
        ctx.shadowBlur = 24;
      } else {
        // Base Martial Artist Steel Frame
        frameGrad.addColorStop(0, '#4f46e5');
        frameGrad.addColorStop(1, '#06b6d4');
        ctx.shadowColor = highlightHex;
        ctx.shadowBlur = 15;
      }

      ctx.strokeStyle = frameGrad;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, avatarY, avatarRadius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // Restore standard shadow blur

      // Draw sparkles particles near frame ring
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const starX = (canvas.width / 2) + Math.cos(angle) * (avatarRadius + 22);
        const starY = avatarY + Math.sin(angle) * (avatarRadius + 22);
        ctx.beginPath();
        ctx.arc(starX, starY, i % 2 === 0 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. DRAW ATHLETE NAME AND REAL BJJ STRIPED BELT
      ctx.font = 'bold 38px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(customName, canvas.width / 2, metaY - 50);

      // Draw Martial Arts physically correct belt stripe vector
      const beltW = 340;
      const beltH = 34;
      const beltX = (canvas.width / 2) - (beltW / 2);
      const beltY = metaY - 35;

      // Draw Main Belt background
      let beltHex = '#ffffff'; // White belt
      let stripeCount = user.stripes || 0;
      
      switch (customBelt) {
        case 'Azul': beltHex = '#1e40af'; break;
        case 'Roxa': beltHex = '#6b21a8'; break;
        case 'Marrom': beltHex = '#78350f'; break;
        case 'Preto': beltHex = '#0f172a'; break;
        default: beltHex = '#e2e8f0'; break;
      }

      ctx.fillStyle = beltHex;
      ctx.beginPath();
      ctx.roundRect(beltX, beltY, beltW, beltH, 6);
      ctx.fill();

      // Belt black tip section (BJJ system)
      const tipW = 85;
      const tipX = beltX + beltW - tipW - 10;
      ctx.fillStyle = customBelt === 'Preto' ? '#dc2626' : '#1e293b'; // Red tip for black belt, black for rest
      ctx.fillRect(tipX, beltY, tipW, beltH);

      // Draw stripes on tip
      ctx.fillStyle = '#ffffff';
      const stripeW = 6;
      const stripeSpace = 10;
      const initialStripeX = tipX + 15;
      for (let j = 0; j < stripeCount; j++) {
        ctx.fillRect(initialStripeX + (j * (stripeW + stripeSpace)), beltY + 2, stripeW, beltH - 4);
      }

      // Draw simple belt border outline for crispness
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(beltX, beltY, beltW, beltH, 6);
      ctx.stroke();

      // 6. STATS PANELS (LEVEL, XP, ELO LEAGUE SHIELD)
      const statsPanelW = 540;
      const statsPanelH = 95;
      const statsPanelX = (canvas.width / 2) - (statsPanelW / 2);
      const statsPanelY = metaY + 20;

      ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(statsPanelX, statsPanelY, statsPanelW, statsPanelH, 12);
      ctx.fill();
      ctx.stroke();

      // Stat 1: LEVEL
      ctx.font = 'bold 15px Arial';
      ctx.fillStyle = '#6366f1';
      ctx.fillText("NÍVEL", statsPanelX + 90, statsPanelY + 35);
      ctx.font = 'extrabold 32px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${customLevel}`, statsPanelX + 90, statsPanelY + 75);

      // Separator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(statsPanelX + 180, statsPanelY + 20);
      ctx.lineTo(statsPanelX + 180, statsPanelY + statsPanelH - 20);
      ctx.stroke();

      // Stat 2: EXP / TRACK
      ctx.font = 'bold 15px Arial';
      ctx.fillStyle = '#eab308';
      ctx.fillText("XP TOTAL", statsPanelX + 270, statsPanelY + 35);
      ctx.font = 'extrabold 24px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${customXP} XP`, statsPanelX + 270, statsPanelY + 72);

      // Separator line
      ctx.beginPath();
      ctx.moveTo(statsPanelX + 360, statsPanelY + 20);
      ctx.lineTo(statsPanelX + 360, statsPanelY + statsPanelH - 20);
      ctx.stroke();

      // Stat 3: ELO WARRIOR RANK
      ctx.font = 'bold 15px Arial';
      ctx.fillStyle = '#10b981';
      ctx.fillText("ARENA ELO", statsPanelX + 450, statsPanelY + 35);
      ctx.font = 'extrabold 28px sans-serif';
      ctx.fillStyle = '#ffffff';
      
      let league = 'Platina 💎';
      if (customElo >= 2200) league = 'Lendário 🥋';
      else if (customElo >= 1800) league = 'Diamante 💎';
      else if (customElo >= 1400) league = 'Ouro 🏆';
      else if (customElo >= 1000) league = 'Prata 🥈';
      else if (customElo >= 600) league = 'Bronze 🥉';
      
      ctx.fillText(`${customElo} ELO`, statsPanelX + 450, statsPanelY + 74);

      // 7. SECURE SCANABLE QR-CODE AND APP DOWNLOAD BRANDING
      // Draw actual QR-code loaded or vector simulation grid if blocked
      const qrCodeImg = new Image();
      qrCodeImg.crossOrigin = 'anonymous';

      const scanLabelX = cardFormat === 'whatsapp' ? qrX - 170 : canvas.width / 2;
      const scanLabelY = cardFormat === 'story' ? qrY - 20 : (cardFormat === 'whatsapp' ? qrY + 50 : canvas.height - 50);

      // Draw CTA text
      ctx.font = 'normal 17px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = cardFormat === 'whatsapp' ? 'right' : 'center';
      ctx.fillText("Escaneie o QR Code e venha treinar Sparring em Inglês!", scanLabelX, scanLabelY);

      try {
        await loadImage(qrCodeImg, qrCodeImageUrl);
        
        // Draw round corner border under QR Code
        ctx.fillStyle = '#0a122c';
        ctx.beginPath();
        ctx.roundRect(qrX - 10, qrY - 10, 140, 140, 12);
        ctx.fill();
        ctx.drawImage(qrCodeImg, qrX, qrY, 120, 120);

      } catch (qrErr) {
        console.warn("Could not loaded QR from server, drawing simulated matrix QR on canvas.", qrErr);
        // Fallback gorgeous simulated QR grid code vectors
        ctx.fillStyle = '#0a122c';
        ctx.beginPath();
        ctx.roundRect(qrX - 10, qrY - 10, 140, 140, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        // Draw three corners anchor squares
        ctx.fillRect(qrX + 5, qrY + 5, 30, 30);
        ctx.fillStyle = '#0a122c';
        ctx.fillRect(qrX + 12, qrY + 12, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX + 16, qrY + 16, 8, 8);

        ctx.fillRect(qrX + 85, qrY + 5, 30, 30);
        ctx.fillStyle = '#0a122c';
        ctx.fillRect(qrX + 92, qrY + 12, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX + 96, qrY + 16, 8, 8);

        ctx.fillRect(qrX + 5, qrY + 85, 30, 30);
        ctx.fillStyle = '#0a122c';
        ctx.fillRect(qrX + 12, qrY + 92, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX + 16, qrY + 96, 8, 8);

        // Simulated noise dots in middle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            if (Math.random() > 0.4) {
              ctx.fillRect(qrX + 45 + (c * 7), qrY + 45 + (r * 7), 5, 5);
            }
          }
        }
      }

      // 8. Output file
      const finalUrl = canvas.toDataURL('image/png');
      setRenderedImageUrl(finalUrl);

    } catch (err: any) {
      console.error("Canvas fatal compilation error", err);
      setCanvasError(err?.message || "Erro inesperado ao compilar arte em Canvas");
    } finally {
      setIsRendering(false);
    }
  };

  // Helper text wrap function for deep description handling on canvases
  function wrapText(
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number
  ) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Trigger re-render whenever configs mutate
  useEffect(() => {
    const timeout = setTimeout(() => {
      renderCanvas();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conquestType, cardFormat, customName, customBelt, customLevel, customElo, customXP, customTitle, user.avatar, user.equippedFrame]);

  // Handle immediate manual download of compiled high-res asset
  const handleDownloadImage = () => {
    if (!renderedImageUrl) return;
    const format = FORMAT_CONFIGS[cardFormat];
    const link = document.createElement('a');
    link.download = `jiuspeak_viral_conquest_${conquestType}_${cardFormat}.png`;
    link.href = renderedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className={`bg-slate-950/80 border border-slate-900 rounded-3xl ${
        isModalStyle 
          ? 'fixed inset-4 md:inset-10 lg:inset-x-32 max-w-5xl mx-auto z-50 shadow-2xl p-6 md:p-8 overflow-y-auto bg-slate-950/95 animate-scaleUp' 
          : 'p-6 space-y-6'
      }`}
      id="viral-share-container"
    >
      {/* Visual Header / Close controls */}
      <div className="flex justify-between items-start pb-4 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-600/15 text-violet-400 rounded-2xl border border-violet-500/10">
            <Share2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-violet-500 uppercase tracking-widest block">Estúdio Viral JiuSpeak</span>
            <h2 className="font-display font-extrabold text-xl text-white tracking-tight">
              Gerador de Compartilhamento Viral
            </h2>
            <p className="text-xs text-slate-400">
              Gere automaticamente stories, posts para feed e cards para WhatsApp com suas glórias nos tatames!
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl hover:bg-slate-850 cursor-pointer"
          >
            ✕ Fechar
          </button>
        )}
      </div>

      {/* Fanfare button for preview */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-violet-950/20 p-3.5 rounded-xl border border-violet-500/10">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-slate-300 font-mono">Simulador de Fanfare Ativa</span>
        </div>
        <button 
          onClick={playSoundFanfare}
          className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-indigo-600/10"
        >
          🔊 Disparar Fanfarra Sonora (Web Audio)
        </button>
      </div>

      {/* Grid container splitting workspace view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (Control Panel) - ColSpan 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Step 1: Select Conquest Type */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" /> 1. Escolha a Conquista Ativa
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CONQUEST_TEMPLATES).map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => {
                    setConquestType(tmpl.type);
                    setCustomTitle(''); // Reset to default
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 group cursor-pointer ${
                    conquestType === tmpl.type 
                      ? 'border-violet-600 bg-violet-950/20 text-white font-extrabold shadow-lg shadow-violet-500/5' 
                      : 'border-slate-900 bg-slate-900/40 text-slate-400 hover:border-slate-800 hover:bg-slate-900/70'
                  }`}
                >
                  <span className="text-xl">{tmpl.badge}</span>
                  <span className="text-[10.5px] uppercase font-bold tracking-wide mt-1 block group-hover:text-slate-200">
                    {tmpl.type.replace('_', ' ')}
                  </span>
                  
                  {/* Selected check ring indicator */}
                  {conquestType === tmpl.type && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-violet-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Banner Size / Standard ratio limits */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" /> 2. Formato do Card Automático
            </h4>
            <div className="space-y-2">
              {Object.keys(FORMAT_CONFIGS).map((fmtKey) => {
                const conf = FORMAT_CONFIGS[fmtKey as CardFormat];
                const Icon = conf.icon;
                return (
                  <button
                    key={fmtKey}
                    onClick={() => setCardFormat(fmtKey as CardFormat)}
                    className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      cardFormat === fmtKey 
                        ? 'border-amber-500 bg-amber-505/10 text-white font-semibold' 
                        : 'border-slate-900 bg-slate-900/30 text-slate-400 hover:border-slate-850 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${cardFormat === fmtKey ? 'text-amber-500' : 'text-slate-500'}`} />
                      <div className="text-left">
                        <span className="text-xs block text-slate-100">{conf.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{conf.ratio}</span>
                      </div>
                    </div>
                    {cardFormat === fmtKey && (
                      <span className="text-[10px] uppercase font-mono bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Fast Sandbox Overrides */}
          <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-900">
            <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Editor Sandbox de Testes
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Nome Atleta</label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-violet-600 outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Faixa Desejada</label>
                  <select
                    value={customBelt}
                    onChange={(e) => setCustomBelt(e.target.value as BeltRank)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-violet-600 outline-none cursor-pointer"
                  >
                    <option value="Branca">Faixa Branca 🥋</option>
                    <option value="Azul">Faixa Azul 🥋</option>
                    <option value="Roxa">Faixa Roxa 🥋</option>
                    <option value="Marrom">Faixa Marrom 🥋</option>
                    <option value="Preto">Faixa Preta ⭐</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Nível</label>
                  <input 
                    type="number" 
                    value={customLevel}
                    onChange={(e) => setCustomLevel(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">XP</label>
                  <input 
                    type="number" 
                    value={customXP}
                    onChange={(e) => setCustomXP(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">ELO Arena</label>
                  <input 
                    type="number" 
                    value={customElo}
                    onChange={(e) => setCustomElo(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Título Personalizado da Conquista</label>
                <input 
                  type="text" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={CONQUEST_TEMPLATES[conquestType].title}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs placeholder-slate-600 outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Live Preview, Downloads & Links) - ColSpan 7 */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Dynamic Render Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Pré-visualização do Card Viral (Canvas Ativo)</span>
              {isRendering ? (
                <span className="text-yellow-500 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Renderizando...
                </span>
              ) : (
                <span className="text-emerald-500">✓ Canvas Sincronizado</span>
              )}
            </div>

            {/* Hidden HTML5 Canvas behind the scenes */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Real scale container mimicking Card aspect */}
            <div className="bg-[#090e1c] border border-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative p-3 group">
              {renderedImageUrl ? (
                <img 
                  src={renderedImageUrl} 
                  alt="Generated JiuSpeak Viral Card"
                  className={`w-full max-h-[500px] object-contain rounded-lg border border-slate-800 shadow-2xl transition-all duration-300 ${
                    cardFormat === 'story' ? 'max-w-[280px]' : (cardFormat === 'whatsapp' ? 'max-w-xl' : 'max-w-md')
                  }`}
                />
              ) : (
                <div className="py-24 text-slate-500 text-xs text-center flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-700 animate-spin" />
                  Carregando renderizador gráfico...
                </div>
              )}

              {/* Error overlay */}
              {canvasError && (
                <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-6 text-center text-xs text-red-200">
                  <p className="font-bold text-red-400">Falha na renderização de imagem:</p>
                  <p>{canvasError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Download & Social Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Action 1: Instant download PNG */}
            <button 
              onClick={handleDownloadImage}
              disabled={isRendering || !!canvasError || !renderedImageUrl}
              className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="w-5 h-5" />
              <span>Baixar PNG ({FORMAT_CONFIGS[cardFormat].ratio})</span>
            </button>

            {/* Action 2: Shareable link copying */}
            <button
              onClick={handleCopyLink}
              className="p-4 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white rounded-2xl font-bold border border-slate-840 hover:border-slate-700 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copiar Link Viral</span>
                </>
              )}
            </button>

          </div>

          {/* Tatame Conectado: Social Media Share Integration */}
          <div className="bg-slate-900/50 border border-slate-850 p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-violet-400 animate-pulse" />
              <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                Compartilhar no Tatame Conectado
              </h4>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Escolha a rede social abaixo para publicar sua arte e chamar a galera para o tatame. Seus dados e QR code serão atualizados em tempo real!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* WhatsApp */}
              <button
                onClick={() => {
                  const titleStr = customTitle || CONQUEST_TEMPLATES[conquestType].title;
                  const shareText = `Olha só o que conquistei no *Tatame Conectado* do JiuSpeak! 🥋🔥\n\n🏆 *${titleStr}*\n_"${CONQUEST_TEMPLATES[conquestType].description}"_\n\n👉 Confira meu perfil com dados dinâmicos em tempo real e venha rolar no inglês comigo:`;
                  const url = getShareUrl();
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + url)}`, '_blank');
                }}
                className="p-3 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-white rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                id="social-share-whatsapp"
              >
                <div className="p-2 bg-[#25D366] rounded-lg text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">WhatsApp</span>
              </button>

              {/* Instagram Stories */}
              <button
                onClick={() => {
                  setCardFormat('story');
                  setInstaStoriesModal(prev => !prev);
                }}
                className="p-3 bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-[#ee2a7b]/20 hover:from-[#f9ce34]/20 hover:to-[#6228d7]/20 text-white rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                id="social-share-instagram"
              >
                <div className="p-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-lg text-white">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Insta Stories</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => {
                  const url = getShareUrl();
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="p-3 bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 text-white rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                id="social-share-facebook"
              >
                <div className="p-2 bg-[#1877F2] rounded-lg text-white">
                  <Facebook className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Facebook</span>
              </button>

              {/* Telegram */}
              <button
                onClick={() => {
                  const titleStr = customTitle || CONQUEST_TEMPLATES[conquestType].title;
                  const shareText = `Olha só o que eu conquistei no Tatame Conectado do JiuSpeak! 🥋🔥\n\n🏆 ${titleStr}\n\nConfira meu perfil verificado em tempo real:`;
                  const url = getShareUrl();
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
                }}
                className="p-3 bg-[#0088cc]/10 border border-[#0088cc]/20 hover:bg-[#0088cc]/20 text-white rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                id="social-share-telegram"
              >
                <div className="p-2 bg-[#0088cc] rounded-lg text-white">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Telegram</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={() => {
                  const titleStr = customTitle || CONQUEST_TEMPLATES[conquestType].title;
                  const shareText = `Olha só o que conquistei no @JiuSpeak Tatame Conectado! 🥋🚀\n\n🔥 ${titleStr}\n\nConfira meu perfil:`;
                  const url = getShareUrl();
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
                }}
                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                id="social-share-x"
              >
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white">
                  <Twitter className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">X (Twitter)</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => {
                  const url = getShareUrl();
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="p-3 bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 text-white rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                id="social-share-linkedin"
              >
                <div className="p-2 bg-[#0A66C2] rounded-lg text-white">
                  <Linkedin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">LinkedIn</span>
              </button>
            </div>

            {/* Instagram Stories step-by-step assistant */}
            {instaStoriesModal && (
              <div className="mt-4 p-4 bg-gradient-to-tr from-[#ee2a7b]/10 to-[#6228d7]/10 rounded-2xl border border-[#ee2a7b]/15 space-y-3 animate-fadeIn">
                <span className="text-[9px] font-mono text-fuchsia-400 block uppercase tracking-widest font-black">Guia de Customização: Instagram Stories 📸</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para publicar nos Stories com qualidade máxima:
                </p>
                <ol className="text-[11px] text-slate-400 list-decimal list-inside space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                  <li>O formato <strong>Story (Vertical)</strong> foi ativado na visualização.</li>
                  <li>Clique no botão <span className="font-bold text-white">"Baixar PNG"</span> acima para salvar a arte oficial.</li>
                  <li>Copie o link usando o botão <span className="font-bold text-white">"Copiar Link Viral"</span>.</li>
                  <li>Abra o Instagram Stories e escolha a imagem salva.</li>
                  <li>Adicione a figurinha de <strong>Link</strong> no Story colando o link copiado!</li>
                </ol>
                <button
                  onClick={() => window.open('https://instagram.com', '_blank')}
                  className="w-full py-2 bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-[#ee2a7b]/10 animate-pulse"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Salvar Arte e Abrir Instagram</span>
                </button>
              </div>
            )}
          </div>

          {/* High-tech QR code integration specs */}
          <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-900 flex flex-col sm:flex-row gap-5 items-center justify-between">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block">QR Code Integrado</span>
              <h5 className="font-display font-black text-sm text-white flex items-center justify-center sm:justify-start gap-1">
                <QrCode className="w-4 h-4 text-slate-400" /> Seu Código de Convite Ativo
              </h5>
              <p className="text-xs text-slate-400 max-w-sm">
                Ao escanear este código, seus contatos abrem JiuSpeak e veem este card interativo montado em tempo real com seu convite!
              </p>
              
              <div className="pt-2 text-left">
                <a 
                  href={getShareUrl()} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1"
                >
                  Ver landing page de teste <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Small QR simulation housing */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-center relative w-28 h-28 group">
              <img 
                src={qrCodeImageUrl} 
                alt="Viral Share QR Code" 
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  // Fallback simulation in UI if offline
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Fallback pattern */}
              <div className="absolute inset-2 bg-indigo-950/20 grid grid-cols-4 gap-1 pointer-events-none opacity-50 select-none">
                <div className="bg-white rounded-sm w-3 h-3" />
                <div className="bg-white rounded-sm w-3 h-3 col-start-4" />
                <div className="bg-white rounded-sm w-3 h-3 row-start-4" />
                <div className="bg-white rounded-sm w-3 h-3 row-start-4 col-start-4" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ViralShare;
