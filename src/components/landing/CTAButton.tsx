import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  id?: string;
  className?: string;
}

export default function CTAButton({ label, onClick, id, className = '' }: CTAButtonProps) {
  return (
    <button
      id={id || 'cta-button-sports'}
      onClick={onClick}
      className={`relative group px-10 py-4.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-sans font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-between sm:justify-center gap-3 cursor-pointer shadow-[0_4px_25px_rgba(0,132,255,0.35)] hover:shadow-[0_0_35px_rgba(0,191,255,0.6)] hover:scale-[1.01] active:scale-[0.98] ${className}`}
    >
      <span className="tracking-widest font-extrabold">{label}</span>
      <ChevronRight className="w-5 h-5 text-white stroke-[3] transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
