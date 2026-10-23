'use client';

import React from 'react';
import { Gender } from '@/types/participant';

interface GenderSwitchProps {
  value: Gender;
  onChange: (value: Gender) => void;
  size?: 'sm' | 'md';
}

export function GenderSwitch({ value, onChange, size = 'md' }: GenderSwitchProps) {
  const isMale = value === 'male';

  const containerClass =
    size === 'sm'
      ? 'p-1 text-xs gap-1'
      : 'p-1.5 text-xs sm:text-sm gap-1.5 w-full sm:w-auto';

  const buttonClass =
    size === 'sm'
      ? 'min-h-[34px] px-2.5 py-1'
      : 'min-h-[44px] flex-1 sm:flex-initial px-4 py-2';

  return (
    <div
      role="group"
      aria-label="Sélection du sexe"
      className={`inline-flex items-center rounded-2xl bg-[#0B1713] border border-[#224438] transition-all ${containerClass}`}
    >
      <button
        type="button"
        onClick={() => onChange('male')}
        aria-pressed={isMale}
        className={`relative flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all ${buttonClass} ${
          isMale
            ? 'bg-[#4D7ECE]/25 text-[#73A1F4] border border-[#4D7ECE]/50 shadow-sm shadow-[#4D7ECE]/20'
            : 'text-zinc-400 hover:text-white hover:bg-[#162E26]'
        }`}
      >
        <span className="text-base leading-none">♂</span>
        <span>Homme</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('female')}
        aria-pressed={!isMale}
        className={`relative flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all ${buttonClass} ${
          !isMale
            ? 'bg-[#F27A82]/25 text-[#FF9EAA] border border-[#F27A82]/50 shadow-sm shadow-[#F27A82]/20'
            : 'text-zinc-400 hover:text-white hover:bg-[#162E26]'
        }`}
      >
        <span className="text-base leading-none">♀</span>
        <span>Femme</span>
      </button>
    </div>
  );
}
