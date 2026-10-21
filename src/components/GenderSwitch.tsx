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

  const containerPadding = size === 'sm' ? 'p-0.5 text-xs' : 'p-1 text-sm';
  const buttonPadding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1.5';

  return (
    <div
      role="group"
      aria-label="Sélection du sexe"
      className={`inline-flex items-center rounded-xl bg-zinc-900 border border-zinc-800 transition-all ${containerPadding}`}
    >
      <button
        type="button"
        onClick={() => onChange('male')}
        className={`relative flex items-center gap-1.5 rounded-lg font-medium transition-all ${buttonPadding} ${
          isMale
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
        }`}
      >
        <span className="text-base leading-none">♂</span>
        <span>Homme</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('female')}
        className={`relative flex items-center gap-1.5 rounded-lg font-medium transition-all ${buttonPadding} ${
          !isMale
            ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
        }`}
      >
        <span className="text-base leading-none">♀</span>
        <span>Femme</span>
      </button>
    </div>
  );
}
