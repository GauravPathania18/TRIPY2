import React from 'react';

interface TrippyLogoProps {
  className?: string;
  size?: number;
}

export const TrippyLogo: React.FC<TrippyLogoProps> = ({ className = 'w-10 h-10', size }) => {
  const customStyle = size ? { width: size, height: size } : {};
  return (
    <svg 
      className={`${className} shrink-0`} 
      style={customStyle}
      viewBox="0 0 160 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Golden gradients for wing contours and borders */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFBA6B" />
          <stop offset="50%" stopColor="#F5D78E" />
          <stop offset="100%" stopColor="#C19E4F" />
        </linearGradient>
        {/* Deep blue gradient for the letter T body and circular hub */}
        <linearGradient id="navyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E295E" />
          <stop offset="100%" stopColor="#101736" />
        </linearGradient>
      </defs>
      
      {/* Symmetrical wing design representing premium air/travel wings */}
      {/* Left Wing feathers with elegant golden layers */}
      <path d="M72 60 C50 62, 32 50, 20 40 C35 52, 52 58, 70 58" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 60 C46 68, 28 58, 12 48 C28 60, 48 66, 70 64" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 60 C42 74, 24 66, 8 56 C24 68, 44 74, 70 70" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 60 C38 80, 20 74, 4 64 C20 76, 40 82, 70 76" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Right Wing feathers with elegant golden layers */}
      <path d="M88 60 C110 62, 128 50, 140 40 C125 52, 108 58, 90 58" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 60 C114 68, 132 58, 148 48 C132 60, 112 66, 90 64" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 60 C118 74, 136 66, 152 56 C136 68, 116 74, 90 70" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 60 C122 80, 140 74, 156 64 C140 76, 120 82, 90 76" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Elegant Letter T */}
      <g transform="translate(10, 2)">
        {/* T Top Horizontal Bar and Vertical Stem */}
        <path 
          d="M38 30 H102 C102 30, 102 38, 98 40 C94 42, 82 40, 82 46 V90 C82 96, 92 98, 92 100 H48 C48 98, 58 96, 58 90 V46 C58 40, 46 42, 42 40 C38 38, 38 30, 38 30 Z" 
          fill="url(#navyGrad)" 
          stroke="url(#goldGrad)" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
      </g>

      {/* Central golden hub circle */}
      <circle cx="80" cy="62" r="14" fill="url(#navyGrad)" stroke="url(#goldGrad)" strokeWidth="3" />
      <circle cx="80" cy="62" r="9" fill="#141E46" />
    </svg>
  );
};
