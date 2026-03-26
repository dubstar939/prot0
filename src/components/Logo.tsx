import React from 'react';

/**
 * @fileoverview Application Logo Component.
 */

interface LogoProps {
  /** Optional CSS class name for the logo container. */
  className?: string;
  /** If true, renders a smaller, condensed version of the logo. */
  condensed?: boolean;
}

/**
 * Renders the Prot0 Creative Suite logo.
 * 
 * @param {LogoProps} props - Component props.
 * @returns {JSX.Element} The rendered logo.
 * @example
 * <Logo condensed={true} />
 */
export const Logo: React.FC<LogoProps> = ({ className = "", condensed = false }) => (
  <div className={`flex items-center gap-3 ${className} group`}>
    <div className={`${condensed ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-xl'} relative bg-gradient-to-br from-[#ff0080] via-[#d9007e] to-[#920054] flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0 transition-all duration-500`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      <svg viewBox="0 0 100 100" className={`${condensed ? 'w-5 h-5' : 'w-7 h-7'} text-white fill-current drop-shadow-lg`}>
        <path d="M50 5L36.2 30.3H63.8L50 5Z" />
        <path d="M70.3 12.3L54.1 40.3L78.1 54.1L94.3 26.1L70.3 12.3Z" />
        <path d="M87.7 50L63.8 50L63.8 77.7L87.7 77.7L87.7 50Z" opacity="0.9" />
        <path d="M70.3 87.7L50 72.3L29.7 87.7L50 97.5L70.3 87.7Z" opacity="0.8" />
        <path d="M29.7 87.7L45.9 59.7L21.9 45.9L5.7 73.9L29.7 87.7Z" />
        <path d="M12.3 50L36.2 50L36.2 22.3L12.3 22.3L12.3 50Z" opacity="0.9" />
      </svg>
    </div>
    {!condensed && (
      <div className="flex flex-col text-white font-sans">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tighter leading-none">Prot0</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400">Creative</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-0.5">939PRO APPS</div>
      </div>
    )}
  </div>
);
