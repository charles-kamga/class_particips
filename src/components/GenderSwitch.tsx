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
      className={`inline-flex items-center rounded-2xl bg-zinc-900/90 border border-zinc-800 transition-all ${containerClass}`}
    >
      <button
        type="button"
        onClick={() => onChange('male')}
        aria-pressed={isMale}
        className={`relative flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all ${buttonClass} ${
          isMale
            ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
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
            ? 'bg-rose-600/25 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
        }`}
      >
        <span className="text-base leading-none">♀</span>
        <span>Femme</span>
      </button>
    </div>
  );
}
