import React from 'react';

interface TeddyBearProps {
  variant?: 'grad-cap' | 'heading' | 'empty' | 'footer' | 'cute-face' | 'sparkle';
  size?: number | string;
  className?: string;
  animated?: boolean;
}

export const TeddyBear: React.FC<TeddyBearProps> = ({
  variant = 'heading',
  size = 32,
  className = '',
  animated = false,
}) => {
  const animClass = animated ? 'animate-teddy-float' : '';

  if (variant === 'heading') {
    return (
      <span className={`inline-flex items-center justify-center align-middle shrink-0 ${animClass} ${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Ears */}
          <circle cx="10" cy="11" r="7" fill="#F4AEC2" stroke="#8F2547" strokeWidth="1.6" />
          <circle cx="10" cy="11" r="4.2" fill="#FAD6E1" />
          <circle cx="30" cy="11" r="7" fill="#F4AEC2" stroke="#8F2547" strokeWidth="1.6" />
          <circle cx="30" cy="11" r="4.2" fill="#FAD6E1" />

          {/* Head */}
          <circle cx="20" cy="21" r="14.5" fill="#F7B9CB" stroke="#8F2547" strokeWidth="1.8" />
          
          {/* Cheeks */}
          <ellipse cx="12" cy="25" rx="3" ry="1.8" fill="#E86A8D" opacity="0.6" />
          <ellipse cx="28" cy="25" rx="3" ry="1.8" fill="#E86A8D" opacity="0.6" />

          {/* Eyes */}
          <ellipse cx="14.5" cy="18" rx="2" ry="2.6" fill="#3A0F05" />
          <circle cx="15.2" cy="17" r="0.8" fill="#FFFFFF" />
          
          <ellipse cx="25.5" cy="18" rx="2" ry="2.6" fill="#3A0F05" />
          <circle cx="26.2" cy="17" r="0.8" fill="#FFFFFF" />

          {/* Snout */}
          <ellipse cx="20" cy="24.5" rx="5.5" ry="4" fill="#FFF0F5" />
          
          {/* Nose */}
          <path d="M18.2 23C18.2 23 19.1 24.3 20 24.3C20.9 24.3 21.8 23 21.8 23C21.8 23 21.2 25.2 20 25.2C18.8 25.2 18.2 23 18.2 23Z" fill="#8F2547" />
          
          {/* Mouth */}
          <path d="M20 25.2V27.2M18 26.6C18.6 27.2 19.4 27.5 20 27.5C20.6 27.5 21.4 27.2 22 26.6" stroke="#8F2547" strokeWidth="1.4" strokeLinecap="round" />

          {/* Little hair tuft / heart bow */}
          <path d="M19.5 8C19 6.8 17.5 6.5 16.5 7.5C15.5 8.5 16 10 19.5 11.5C23 10 23.5 8.5 22.5 7.5C21.5 6.5 20 6.8 19.5 8Z" fill="#C9577B" />
        </svg>
      </span>
    );
  }

  if (variant === 'empty') {
    return (
      <div className={`relative flex flex-col items-center justify-center ${animClass} ${className}`}>
        <svg width="130" height="130" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          {/* Body */}
          <ellipse cx="60" cy="85" rx="30" ry="26" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2.5" />
          <ellipse cx="60" cy="86" rx="18" ry="15" fill="#FCE5ED" />

          {/* Ears */}
          <circle cx="34" cy="34" r="14" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2.5" />
          <circle cx="34" cy="34" r="8" fill="#FCE5ED" />
          
          <circle cx="86" cy="34" r="14" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2.5" />
          <circle cx="86" cy="34" r="8" fill="#FCE5ED" />

          {/* Head */}
          <circle cx="60" cy="50" r="28" fill="#F7B9CB" stroke="#8F2547" strokeWidth="2.5" />

          {/* Cheeks */}
          <ellipse cx="45" cy="57" rx="6" ry="3.5" fill="#E86A8D" opacity="0.65" />
          <ellipse cx="75" cy="57" rx="6" ry="3.5" fill="#E86A8D" opacity="0.65" />

          {/* Eyes - blinking gentle curiosity */}
          <ellipse cx="49" cy="46" rx="3.5" ry="4.5" fill="#3A0F05" />
          <circle cx="50.5" cy="44.5" r="1.5" fill="#FFFFFF" />

          <ellipse cx="71" cy="46" rx="3.5" ry="4.5" fill="#3A0F05" />
          <circle cx="72.5" cy="44.5" r="1.5" fill="#FFFFFF" />

          {/* Snout */}
          <ellipse cx="60" cy="56" rx="10.5" ry="7.5" fill="#FFF0F5" />
          <path d="M56 53.5C56 53.5 58 56 60 56C62 56 64 53.5 64 53.5C64 53.5 63 57.5 60 57.5C57 57.5 56 53.5 56 53.5Z" fill="#8F2547" />
          <path d="M60 57.5V60.5M56.5 59.5C57.5 60.5 59 61 60 61C61 61 62.5 60.5 63.5 59.5" stroke="#8F2547" strokeWidth="2" strokeLinecap="round" />

          {/* Paws resting on cute ribbon */}
          <ellipse cx="44" cy="88" rx="8" ry="6.5" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2" transform="rotate(-15 44 88)" />
          <ellipse cx="76" cy="88" rx="8" ry="6.5" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2" transform="rotate(15 76 88)" />

          {/* Cute ribbon bow */}
          <path d="M52 74C46 70 42 75 46 80C50 82 55 77 55 77L60 78L65 77C65 77 70 82 74 80C78 75 74 70 68 74L60 76L52 74Z" fill="#A93A5C" />
          <circle cx="60" cy="76" r="3.5" fill="#8F2547" />
        </svg>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${animClass} ${className}`}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ears */}
          <circle cx="8" cy="9" r="5" fill="#F4AEC2" stroke="#8F2547" strokeWidth="1.4" />
          <circle cx="8" cy="9" r="3" fill="#FAD6E1" />
          <circle cx="24" cy="9" r="5" fill="#F4AEC2" stroke="#8F2547" strokeWidth="1.4" />
          <circle cx="24" cy="9" r="3" fill="#FAD6E1" />

          {/* Head */}
          <circle cx="16" cy="17" r="11" fill="#F7B9CB" stroke="#8F2547" strokeWidth="1.5" />
          
          {/* Cheeks */}
          <circle cx="11" cy="20" r="2" fill="#E86A8D" opacity="0.6" />
          <circle cx="21" cy="20" r="2" fill="#E86A8D" opacity="0.6" />

          {/* Eyes */}
          <ellipse cx="12.5" cy="15" rx="1.5" ry="2" fill="#3A0F05" />
          <ellipse cx="19.5" cy="15" rx="1.5" ry="2" fill="#3A0F05" />

          {/* Snout & nose */}
          <ellipse cx="16" cy="19.5" rx="4.5" ry="3.2" fill="#FFF0F5" />
          <circle cx="16" cy="18.8" r="1.3" fill="#8F2547" />
          <path d="M14.8 20.8C15.4 21.4 16.6 21.4 17.2 20.8" stroke="#8F2547" strokeWidth="1.2" strokeLinecap="round" />

          {/* Little waving paw */}
          <circle cx="27" cy="15" r="3" fill="#F4AEC2" stroke="#8F2547" strokeWidth="1.3" />
        </svg>
      </span>
    );
  }

  // Default: Grad cap vector teddy
  return (
    <div className={`relative flex items-center justify-center ${animClass} ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
        {/* Ears */}
        <circle cx="26" cy="34" r="12" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2" />
        <circle cx="26" cy="34" r="7" fill="#FAD6E1" />
        
        <circle cx="74" cy="34" r="12" fill="#F4AEC2" stroke="#8F2547" strokeWidth="2" />
        <circle cx="74" cy="34" r="7" fill="#FAD6E1" />

        {/* Head */}
        <circle cx="50" cy="50" r="26" fill="#F7B9CB" stroke="#8F2547" strokeWidth="2.2" />

        {/* Cheeks */}
        <ellipse cx="36" cy="58" rx="5" ry="3" fill="#E86A8D" opacity="0.65" />
        <ellipse cx="64" cy="58" rx="5" ry="3" fill="#E86A8D" opacity="0.65" />

        {/* Eyes */}
        <ellipse cx="39" cy="47" rx="3.2" ry="4" fill="#3A0F05" />
        <circle cx="40.5" cy="45.5" r="1.3" fill="#FFFFFF" />
        
        <ellipse cx="61" cy="47" rx="3.2" ry="4" fill="#3A0F05" />
        <circle cx="62.5" cy="45.5" r="1.3" fill="#FFFFFF" />

        {/* Snout */}
        <ellipse cx="50" cy="56" rx="9" ry="6.5" fill="#FFF0F5" />
        <path d="M46.5 54C46.5 54 48.5 56.5 50 56.5C51.5 56.5 53.5 54 53.5 54C53.5 54 52.5 58 50 58C47.5 58 46.5 54 46.5 54Z" fill="#8F2547" />
        <path d="M50 58V60.5M47 59.5C48 60.5 49 61 50 61C51 61 52 60.5 53 59.5" stroke="#8F2547" strokeWidth="1.8" strokeLinecap="round" />

        {/* Graduation Cap */}
        <path d="M50 12L82 24L50 36L18 24L50 12Z" fill="#1C1826" stroke="#3A0F05" strokeWidth="1.5" />
        {/* Cap skull cap base */}
        <path d="M32 28.5V36C32 40 40 43 50 43C60 43 68 40 68 36V28.5" fill="#2A2438" />
        {/* Gold button on cap */}
        <circle cx="50" cy="24" r="3" fill="#F5C042" stroke="#C98818" strokeWidth="1" />
        {/* Gold tassel */}
        <path d="M50 24C60 26 72 32 75 42" stroke="#E6A820" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="73" y="41" width="4.5" height="10" rx="1.5" fill="#E6A820" />
      </svg>
    </div>
  );
};

// Wax-seal badge decoration around profile photo
export const WaxSealBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        {/* Organic scalloped wax seal boundary */}
        <path
          d="M22 2C24.5 2 26.5 4 29 4.5C31.5 5 34 4 36 5.5C38 7 38.5 9.5 40 11.5C41.5 13.5 43.5 15 44 17.5C44.5 20 43 22 43 24.5C43 27 44.5 29 44 31.5C43.5 34 41.5 35.5 40 37.5C38.5 39.5 38 42 36 43.5C34 45 31.5 44 29 44.5C26.5 45 24.5 47 22 47C19.5 47 17.5 45 15 44.5C12.5 44 10 45 8 43.5C6 42 5.5 39.5 4 37.5C2.5 35.5 0.5 34 0 31.5C-0.5 29 1 27 1 24.5C1 22 -0.5 20 0 17.5C0.5 15 2.5 13.5 4 11.5C5.5 9.5 6 7 8 5.5C10 4 12.5 5 15 4.5C17.5 4 19.5 2 22 2Z"
          fill="#8F2547"
          transform="scale(0.9) translate(2, 0)"
        />
        {/* Inner ring */}
        <circle cx="22" cy="22" r="14" fill="#A93A5C" stroke="#D4688A" strokeWidth="1.5" />
        {/* Seal icon - Monogram / Heart */}
        <path
          d="M22 26.5L20.8 25.4C16.8 21.8 14.2 19.4 14.2 16.5C14.2 14.1 16.1 12.2 18.5 12.2C19.9 12.2 21.2 12.8 22 13.8C22.8 12.8 24.1 12.2 25.5 12.2C27.9 12.2 29.8 14.1 29.8 16.5C29.8 19.4 27.2 21.8 23.2 25.4L22 26.5Z"
          fill="#FFF0F5"
        />
      </svg>
    </div>
  );
};

// Flower sprig decoration
export const FlowerSprig: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Stem */}
      <path d="M8 34C14 26 22 18 32 10" stroke="#7A8E6A" strokeWidth="2" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M16 25C13 22 13 18 17 18C17 22 19 23 16 25Z" fill="#9DB88B" />
      <path d="M23 18C25 14 29 14 28 18C25 19 24 19 23 18Z" fill="#9DB88B" />
      {/* Rose buds */}
      <circle cx="32" cy="10" r="5" fill="#C9577B" stroke="#8F2547" strokeWidth="1" />
      <circle cx="32" cy="10" r="2.5" fill="#FCE5ED" />
      <circle cx="20" cy="22" r="3.5" fill="#E08FA7" />
    </svg>
  );
};
