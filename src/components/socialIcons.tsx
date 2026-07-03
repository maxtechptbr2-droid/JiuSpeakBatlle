import React from 'react';
import { Link2 } from 'lucide-react';

// Ícones das marcas (SVG inline). currentColor herda a cor do container.
export const IconWhatsApp = ({ size = 18 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>;
export const IconFacebook = ({ size = 18 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8H16l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/></svg>;
export const IconX = ({ size = 16 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.6l-5.2-6.8L5.3 22H2l7.8-8.9L1.5 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.2 3.9H5.3L17.7 20z"/></svg>;
export const IconTelegram = ({ size = 18 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M22 4.5 2.8 12c-1 .4-1 1 .1 1.3l4.9 1.5 1.9 5.8c.2.5.4.6.9.2l2.7-2 5 3.7c.6.3 1 .1 1.2-.6L23 5.4c.2-.9-.3-1.3-1-.9zM9.5 15.2l-.3 4-1.4-4.4 9.8-6.2c.4-.3.8-.1.5.2l-8.6 6.4z"/></svg>;
export const IconInstagram = ({ size = 18 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M12 2c2.7 0 3 0 4.1.1 1 .1 1.7.2 2.3.5.6.2 1.1.5 1.6 1 .5.5.8 1 1 1.6.2.6.4 1.3.5 2.3.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 1-.2 1.7-.5 2.3-.2.6-.5 1.1-1 1.6-.5.5-1 .8-1.6 1-.6.2-1.3.4-2.3.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1-.1-1.7-.2-2.3-.5-.6-.2-1.1-.5-1.6-1-.5-.5-.8-1-1-1.6-.2-.6-.4-1.3-.5-2.3C2 15 2 14.7 2 12s0-3 .1-4.1c.1-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6.5-.5 1-.8 1.6-1 .6-.2 1.3-.4 2.3-.5C9 2 9.3 2 12 2zm0 1.8c-2.7 0-3 0-4 .1-.9 0-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.3.8-.3 1.7-.1 1-.1 1.3-.1 4s0 3 .1 4c0 .9.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.8.3 1.7.3 1 .1 1.3.1 4 .1s3 0 4-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.3-.8.3-1.7.1-1 .1-1.3.1-4s0-3-.1-4c0-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.3-1.7-.3-1-.1-1.3-.1-4-.1zm0 3.1a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>;
export const IconYouTube = ({ size = 18 }: { size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M23 12s0-3.3-.4-4.9a2.5 2.5 0 0 0-1.8-1.8C19.2 5 12 5 12 5s-7.2 0-8.8.3A2.5 2.5 0 0 0 1.4 7.1C1 8.7 1 12 1 12s0 3.3.4 4.9a2.5 2.5 0 0 0 1.8 1.8C4.8 19 12 19 12 19s7.2 0 8.8-.3a2.5 2.5 0 0 0 1.8-1.8C23 15.3 23 12 23 12zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg>;

export type SocialKind = 'instagram' | 'youtube' | 'x' | 'facebook' | 'whatsapp' | 'telegram' | 'link';

export function detectSocial(url: string): { kind: SocialKind; color: string } {
  const u = (url || '').toLowerCase();
  if (u.includes('instagram.com')) return { kind: 'instagram', color: '#E4405F' };
  if (u.includes('youtube.com') || u.includes('youtu.be')) return { kind: 'youtube', color: '#FF0000' };
  if (u.includes('twitter.com') || u.includes('x.com')) return { kind: 'x', color: '#000000' };
  if (u.includes('facebook.com') || u.includes('fb.com')) return { kind: 'facebook', color: '#1877F2' };
  if (u.includes('wa.me') || u.includes('whatsapp.com')) return { kind: 'whatsapp', color: '#25D366' };
  if (u.includes('t.me') || u.includes('telegram')) return { kind: 'telegram', color: '#229ED9' };
  return { kind: 'link', color: '#c9a84c' };
}

export function SocialIcon({ url, size = 16 }: { url: string; size?: number }) {
  const { kind } = detectSocial(url);
  switch (kind) {
    case 'instagram': return <IconInstagram size={size} />;
    case 'youtube': return <IconYouTube size={size} />;
    case 'x': return <IconX size={size} />;
    case 'facebook': return <IconFacebook size={size} />;
    case 'whatsapp': return <IconWhatsApp size={size} />;
    case 'telegram': return <IconTelegram size={size} />;
    default: return <Link2 size={size} />;
  }
}
