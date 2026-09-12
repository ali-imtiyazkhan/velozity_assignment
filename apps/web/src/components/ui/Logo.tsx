'use client';

const ORANGE = '#ef4d23';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7 sm:h-8 sm:w-8',
    lg: 'h-10 w-10',
  };

  return (
    <svg
      viewBox="0 0 32 32"
      className={`${sizeClasses[size]} ${className}`}
      role="img"
      aria-label="Velozity logo"
    >
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4;
        return (
          <circle
            key={i}
            cx={16 + 10 * Math.cos(angle)}
            cy={16 + 10 * Math.sin(angle)}
            r={3.5}
            fill={ORANGE}
          />
        );
      })}
      <circle cx={16} cy={16} r={3.5} fill={ORANGE} />
    </svg>
  );
}

export function LogoWithText({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span className={`font-bold text-gray-900 dark:text-white ${sizeClasses[size]}`}>
        Velozity
      </span>
    </div>
  );
}