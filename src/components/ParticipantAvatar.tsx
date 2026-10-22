'use client';

import React, { useState } from 'react';
import { Gender } from '@/types/participant';

interface ParticipantAvatarProps {
  readonly avatarUrl?: string;
  readonly name: string;
  readonly gender: Gender;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showGenderSymbol?: boolean;
  readonly className?: string;
}

export function ParticipantAvatar({
  avatarUrl,
  name,
  gender,
  size = 'md',
  showGenderSymbol = false,
  className = '',
}: ParticipantAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  }[size];

  if (avatarUrl && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses} rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0 ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  const isFemale = gender === 'female';
  const label = showGenderSymbol ? (isFemale ? '♀' : '♂') : (name ? name.charAt(0).toUpperCase() : '?');

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold border shrink-0 ${
        isFemale
          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
      } ${className}`}
      aria-label={`${name} (${gender})`}
    >
      {label}
    </div>
  );
}
