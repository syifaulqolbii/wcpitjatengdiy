"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FlagProps {
  flag: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeMap = {
  sm: 'w-8',
  md: 'w-10 md:w-12',
  lg: 'w-14 md:w-20',
  xl: 'w-24 md:w-36',
  '2xl': 'w-40 md:w-64',
};

// Helper to convert emoji flag or country code to ISO 3166-1 alpha-2
function getCountryCode(flag: string): string {
  if (!flag) return 'id'; // default

  // flagcdn supports UK constituent country codes.
  if (/^gb-(eng|sct|wls)$/i.test(flag)) {
    return flag.toLowerCase();
  }

  // Emoji subdivision flags are not made from regional indicators.
  if (flag === "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}") return 'gb-eng';
  if (flag === "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}") return 'gb-sct';
  if (flag === "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}") return 'gb-wls';
  
  // If it's already a 2-letter country code
  if (flag.length === 2 && /^[a-zA-Z]+$/.test(flag)) {
    return flag.toLowerCase();
  }

  // Convert emoji to country code
  try {
    const code = Array.from(flag)
      .map(char => {
        const codePoint = char.codePointAt(0);
        if (codePoint && codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF) {
          return String.fromCodePoint(codePoint - 0x1F1E6 + 65);
        }
        return '';
      })
      .join('');
    
    return code.length === 2 ? code.toLowerCase() : 'id';
  } catch (e) {
    return 'id';
  }
}

export function Flag({ flag, className, size = 'md' }: FlagProps) {
  const code = getCountryCode(flag);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [flag]);

  return (
    <div className={cn("inline-flex relative overflow-hidden group rounded-[2px]", sizeMap[size], className)}>
      {hasError ? (
        <span className="text-2xl">{flag}</span>
      ) : (
        <img
          src={`https://flagcdn.com/w320/${code}.png`}
          alt={flag}
          referrerPolicy="no-referrer"
          className="animate-flag-wave w-full h-auto block border border-white/10"
          onError={() => setHasError(true)}
        />
      )}

      {/* Shine effect */}
      <div className="flag-shine-effect"></div>

      {/* Cloth Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none mix-blend-multiply"></div>

      {/* Subtle depth shadow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none"></div>
    </div>
  );
}
