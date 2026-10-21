'use client';

import React from 'react';
import { Participant } from '@/types/participant';
import { Users, GitCommit, Calculator, UserCheck } from 'lucide-react';

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

  // Calcul estimation équipes de 3
  const potentialTeams = Math.floor(total / 3);
  const remainder = total % 3;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Participants */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-300 block">Participants</span>
          <span className="text-xl font-bold font-mono text-zinc-100">{total}</span>
        </div>
      </div>

      {/* Total Commits */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <GitCommit className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-300 block">Commits Totaux</span>
          <span className="text-xl font-bold font-mono text-zinc-100">
            {totalCommits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Moyenne commits */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-sm flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-300 block">Moyenne Commits</span>
          <span className="text-xl font-bold font-mono text-zinc-100">{avgCommits}</span>
        </div>
      </div>

      {/* Répartition de genre */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-sm flex flex-col justify-center space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-blue-400 font-medium">♂ {maleCount} ({malePercentage}%)</span>
          <span className="text-rose-400 font-medium">♀ {femaleCount} ({femalePercentage}%)</span>
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
