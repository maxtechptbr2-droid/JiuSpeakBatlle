import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeaturePillProps {
  label: string;
  icon: React.ComponentType<any>;
  id?: string;
  key?: any;
}

export default function FeaturePill({ label, icon: Icon, id }: FeaturePillProps) {
  return (
    <div
      id={id || `feature-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#030712]/30 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,191,255,0.06)] backdrop-blur-md group cursor-pointer select-none"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-[#00bfff] group-hover:border-[#00bfff]/50 transition-all duration-300 shadow-[0_0_10px_rgba(0,132,255,0.1)]">
        <Icon className="w-4 h-4 stroke-[1.8]" />
      </div>
      <span className="text-xs uppercase tracking-widest font-black text-slate-300 group-hover:text-white transition-colors duration-300 font-sans">
        {label}
      </span>
    </div>
  );
}
