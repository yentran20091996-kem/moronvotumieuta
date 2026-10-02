import React from 'react';

interface SageAvatarProps {
  mood?: 'greeting' | 'thinking' | 'happy' | 'sparkle';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SageAvatar: React.FC<SageAvatarProps> = ({
  mood = 'greeting',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-teal-300 opacity-60 blur-md animate-pulse-soft" />

      {/* SVG Avatar Container */}
      <div className="relative w-full h-full rounded-full bg-white/90 p-1 shadow-md border-2 border-pink-200 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="cosmicBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="sageHat" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>

          {/* Space Helmet / Head Aura */}
          <circle cx="50" cy="50" r="42" fill="#eff6ff" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="38" fill="url(#cosmicBody)" opacity="0.15" />

          {/* Cute Ears / Antenna */}
          <path d="M 32 30 L 24 16 L 38 24 Z" fill="#f472b6" />
          <path d="M 68 30 L 76 16 L 62 24 Z" fill="#38bdf8" />

          {/* Star Antenna with Wand Tip */}
          <line x1="50" y1="20" x2="50" y2="8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="8" r="4" fill="url(#starGlow)" className="animate-sparkle" />

          {/* Round Fluffy Face */}
          <circle cx="50" cy="54" r="30" fill="#ffffff" />
          {/* Pastel Cheeks */}
          <circle cx="34" cy="62" r="5" fill="#fbcfe8" />
          <circle cx="66" cy="62" r="5" fill="#fbcfe8" />

          {/* Cute Eyes based on mood */}
          {mood === 'happy' ? (
            // Smiling arched eyes
            <>
              <path d="M 32 52 Q 38 45 44 52" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 56 52 Q 62 45 68 52" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : mood === 'thinking' ? (
            // Thinking wide eyes looking up
            <>
              <circle cx="38" cy="49" r="4.5" fill="#334155" />
              <circle cx="39.5" cy="47.5" r="1.5" fill="#ffffff" />
              <circle cx="62" cy="49" r="4.5" fill="#334155" />
              <circle cx="63.5" cy="47.5" r="1.5" fill="#ffffff" />
            </>
          ) : (
            // Normal sparkling cosmic eyes
            <>
              <circle cx="38" cy="52" r="5" fill="#334155" />
              <circle cx="39.5" cy="50" r="1.8" fill="#ffffff" />
              <circle cx="36.5" cy="53.5" r="0.8" fill="#ffffff" />

              <circle cx="62" cy="52" r="5" fill="#334155" />
              <circle cx="63.5" cy="50" r="1.8" fill="#ffffff" />
              <circle cx="60.5" cy="53.5" r="0.8" fill="#ffffff" />
            </>
          )}

          {/* Small Heart/Cat Nose */}
          <path d="M 48 58 Q 50 56 52 58 Q 50 61 48 58 Z" fill="#ec4899" />

          {/* Cute Smile */}
          <path
            d="M 44 63 Q 50 67 56 63"
            stroke="#475569"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Tiny Cosmic Sparkles on Visor */}
          <path d="M 28 40 L 30 36 L 32 40 L 30 44 Z" fill="#fde047" opacity="0.8" />
          <path d="M 70 42 L 71.5 39 L 73 42 L 71.5 45 Z" fill="#67e8f9" opacity="0.8" />
        </svg>
      </div>

      {/* Floating Mini Wand Star */}
      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-xs shadow text-white font-bold animate-bounce">
        ✨
      </span>
    </div>
  );
};
