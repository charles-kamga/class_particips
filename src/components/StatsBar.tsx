'use client';

import React from 'react';
import { Participant } from '@/types/participant';
import { Users, GitCommit, Calculator } from 'lucide-react';

interface StatsBarProps {
  participants: Participant[];
}

export function StatsBar({ participants }: StatsBarProps) {
  const total = participants.length;
  const totalCommits = participants.reduce((sum, p) => sum + p.commits, 0);
  const avgCommits = total > 0 ? Math.round((totalCommits / total) * 10) / 10 : 0;

  const maleCount = participants.filter((p) => p.gender === 'male').length;
  const femaleCount = total - maleCount;

  const malePercentage = total > 0 ? Math.round((maleCount / total) * 100) : 50;
  const femalePercentage = total > 0 ? 100 - malePercentage : 50;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Total Participants */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-sm flex items-center gap-3 hover:border-zinc-700/80 transition-all">
        <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block truncate">
            Participants
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
            {total}
          </span>
        </div>
      </div>

      {/* Total Commits */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-sm flex items-center gap-3 hover:border-zinc-700/80 transition-all">
        <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          <GitCommit className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block truncate">
            Commits Octobre
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
            {totalCommits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Moyenne commits */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-sm flex items-center gap-3 hover:border-zinc-700/80 transition-all">
        <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block truncate">
            Moyenne / pers.
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
            {avgCommits}
          </span>
        </div>
      </div>

      {/* Répartition de genre */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-sm flex flex-col justify-center space-y-1.5 sm:space-y-2 col-span-2 lg:col-span-1 hover:border-zinc-700/80 transition-all">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-blue-400 flex items-center gap-1">
            <span>♂ {maleCount}</span>
            <span className="text-[10px] text-zinc-500">({malePercentage}%)</span>
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            <span>♀ {femaleCount}</span>
            <span className="text-[10px] text-zinc-500">({femalePercentage}%)</span>
          </span>
        </div>
        {/* Barre de proportion */}
        <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${malePercentage}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${femalePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
