import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { logo: 'w-20 h-auto', name: 'text-[9px]', tagline: 'text-[7px]' },
    md: { logo: 'w-28 h-auto', name: 'text-[11px]', tagline: 'text-[8px]' },
    lg: { logo: 'w-36 h-auto', name: 'text-sm', tagline: 'text-[10px]' },
    xl: { logo: 'w-52 h-auto', name: 'text-base', tagline: 'text-xs' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`select-none ${className}`}>
      <img
        src="/logo.png"
        alt="YBGP logo"
        className={`${currentSize.logo} object-contain ${variant === 'light' ? 'shadow-sm' : ''}`}
        width={size === 'sm' ? 80 : size === 'md' ? 112 : size === 'lg' ? 144 : 208}
        height={size === 'sm' ? 32 : size === 'md' ? 45 : size === 'lg' ? 57 : 83}
        style={{ background: 'transparent' }}
      />
      {showSubtitle && (
        <div className="min-w-0 leading-tight">
          <div className={`font-bold font-heading ${currentSize.name} ${variant === 'light' ? 'text-white' : 'text-[#0E2B22]'}`}>
            {`Your Business Growth Partner`}
          </div>
          <div className={`mt-0.5 font-medium ${currentSize.tagline} ${variant === 'light' ? 'text-[#C89B2B]' : 'text-[#888888]'}`}>
            From Idea to a Profitable Business.
          </div>
        </div>
      )}
    </div>
  );
};
