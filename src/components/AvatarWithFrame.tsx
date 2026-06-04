import React, { useState } from 'react';

export interface AvatarFrame {
  id: string;
  name: string;
  rarity: string;
  description?: string;
  imageUrl?: string;
}

interface AvatarWithFrameProps {
  avatarUrl?: string;
  userName?: string;
  frame?: AvatarFrame | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  avatarUrl,
  userName = 'Atleta',
  frame,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Fallback avatar image
  const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`;
  const src = imageError || !avatarUrl ? defaultAvatar : avatarUrl;

  // Derive frame tier
  const nameLower = frame?.name?.toLowerCase() || '';
  const rarityLower = frame?.rarity?.toLowerCase() || '';

  let tier: 'none' | 'bronze' | 'prata' | 'ouro' | 'diamante' | 'mestre' | 'lendaria' | 'mitica' = 'none';

  if (frame) {
    if (nameLower.includes('mític') || rarityLower === 'mythic' || nameLower.includes('dragão')) {
      tier = 'mitica';
    } else if (nameLower.includes('lendár') || rarityLower === 'legendary') {
      tier = 'lendaria';
    } else if (nameLower.includes('mestre') || nameLower.includes('master') || nameLower.includes('coral')) {
      tier = 'mestre';
    } else if (nameLower.includes('diamante') || nameLower.includes('diamond')) {
      tier = 'diamante';
    } else if (nameLower.includes('ouro') || nameLower.includes('gold') || rarityLower === 'epic') {
      tier = 'ouro';
    } else if (nameLower.includes('prata') || nameLower.includes('silver') || rarityLower === 'rare') {
      tier = 'prata';
    } else if (nameLower.includes('bronze') || rarityLower === 'common') {
      tier = 'bronze';
    } else {
      // Fallback base frame tier if category matches but unknown name
      tier = 'bronze';
    }
  }

  // Size dimensions mappings
  // Outer container padding determines frame width
  const dims = {
    xs: {
      container: 'w-[32px] h-[32px]',
      avatar: 'w-[26px] h-[26px]',
      padding: 'p-[3px]',
      glow: 'shadow-sm',
    },
    sm: {
      container: 'w-[52px] h-[52px]',
      avatar: 'w-[42px] h-[42px]',
      padding: 'p-[5px]',
      glow: 'shadow-md',
    },
    md: {
      container: 'w-[64px] h-[64px]',
      avatar: 'w-[52px] h-[52px]',
      padding: 'p-[6px]',
      glow: 'shadow-lg',
    },
    lg: {
      container: 'w-[84px] h-[84px]',
      avatar: 'w-[68px] h-[68px]',
      padding: 'p-[8px]',
      glow: 'shadow-xl',
    },
    xl: {
      container: 'w-[172px] h-[172px]',
      avatar: 'w-[140px] h-[140px]',
      padding: 'p-[16px]',
      glow: 'shadow-2xl',
    },
  }[size];

  // Specific Frame Styles Definition
  let frameBackgroundClass = '';
  let shadowColorClass = '';
  let particles: React.ReactNode[] = [];
  let isShimmerActive = false;

  switch (tier) {
    case 'mitica':
      frameBackgroundClass = 'bg-gradient-to-tr from-rose-500 via-yellow-400 via-green-400 via-sky-400 via-violet-500 to-rose-500 animate-chroma';
      shadowColorClass = 'shadow-[0_0_15px_rgba(239,68,68,0.6)] border-rose-500/40';
      isShimmerActive = true;
      particles = [
        <div key="mit-1" className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-yellow-300 particle-float-1 z-20" />,
        <div key="mit-2" className="absolute bottom-2 left-1 w-2 h-2 rounded-full bg-sky-300 particle-float-2 z-20" />,
        <div key="mit-3" className="absolute bottom-1 right-3 w-1 h-1 rounded-full bg-rose-300 particle-float-3 z-20" />,
      ];
      break;

    case 'lendaria':
      frameBackgroundClass = 'bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400';
      shadowColorClass = 'shadow-[0_0_12px_rgba(168,85,247,0.5)] border-violet-500/40';
      particles = [
        <div key="len-1" className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full bg-violet-300 particle-float-1 z-20" />,
        <div key="len-2" className="absolute bottom-3 right-1 w-1 h-1 rounded-full bg-fuchsia-300 particle-float-3 z-20" />,
      ];
      break;

    case 'mestre':
      frameBackgroundClass = 'bg-gradient-to-tr from-red-600 via-red-500 to-slate-900 border border-red-500/20';
      shadowColorClass = 'shadow-[0_0_10px_rgba(220,38,38,0.4)]';
      break;

    case 'diamante':
      frameBackgroundClass = 'bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500';
      shadowColorClass = 'shadow-[0_0_8px_rgba(34,211,238,0.35)]';
      particles = [
        <div key="dia-1" className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-200 particle-float-2 z-20" />,
      ];
      break;

    case 'ouro':
      frameBackgroundClass = 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border border-yellow-300/30';
      shadowColorClass = 'shadow-[0_0_6px_rgba(245,158,11,0.3)]';
      isShimmerActive = true;
      break;

    case 'prata':
      frameBackgroundClass = 'bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border border-slate-300/20';
      shadowColorClass = 'shadow-[0_0_4px_rgba(148,163,184,0.25)]';
      break;

    case 'bronze':
      frameBackgroundClass = 'bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-900 border border-amber-800/20';
      shadowColorClass = 'shadow-[0_0_3px_rgba(120,53,4,0.2)]';
      break;

    default:
      // Base minimalist dark ring design for non-framed avatars
      frameBackgroundClass = 'bg-slate-800';
      break;
  }

  // Base styled wrapper
  return (
    <div 
      className={`relative rounded-full flex items-center justify-center select-none ${dims.container} ${frameBackgroundClass} ${shadowColorClass} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Dynamic Animated Particles for premium high rarity items */}
      {size !== 'xs' && particles}

      {/* Shimmer sweep overlays */}
      {isShimmerActive && (
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-shimmer-linear animate-shimmer-bar" />
        </div>
      )}

      {/* Inner Avatar housing with dark background to pop contrast */}
      <div 
        className="relative bg-slate-950 rounded-full flex items-center justify-center overflow-hidden w-full h-full"
        style={{ padding: dims.padding, boxSizing: 'border-box' }}
      >
        <img
          src={src}
          alt={userName}
          onError={() => setImageError(true)}
          className={`rounded-full object-cover w-full h-full relative z-20 transition-transform hover:scale-105 duration-300`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default AvatarWithFrame;
