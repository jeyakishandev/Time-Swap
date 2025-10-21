import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cercle extérieur */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="#4A5C6A" 
          stroke="#9BA8AB" 
          strokeWidth="2"
        />
        
        {/* Marqueurs d'horloge */}
        <line x1="50" y1="10" x2="50" y2="20" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
        <line x1="90" y1="50" x2="80" y2="50" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="90" x2="50" y2="80" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
        <line x1="10" y1="50" x2="20" y2="50" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
        
        {/* Symbole central - T */}
        <text 
          x="50" 
          y="45" 
          textAnchor="middle" 
          fontSize="24" 
          fontWeight="bold" 
          fill="#CCD0CF"
          fontFamily="Arial, sans-serif"
        >
          T
        </text>
        
        {/* Symbole central - S */}
        <text 
          x="50" 
          y="70" 
          textAnchor="middle" 
          fontSize="24" 
          fontWeight="bold" 
          fill="#CCD0CF"
          fontFamily="Arial, sans-serif"
        >
          S
        </text>
      </svg>
    </div>
  );
}
