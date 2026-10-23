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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Participants */}
      <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] shadow-sm flex items-center gap-3.5 hover:border-[#00B4D8]/40 transition-all">
        <div className="p-2.5 rounded-xl bg-[#00B4D8]/15 border border-[#00B4D8]/30 text-[#00B4D8] shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Participants
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-white">
            {total}
          </span>
        </div>
      </div>

      {/* Total Commits */}
      <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] shadow-sm flex items-center gap-3.5 hover:border-[#10B981]/40 transition-all">
        <div className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] shrink-0">
          <GitCommit className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Commits Octobre
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-white">
            {totalCommits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Moyenne commits */}
      <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] shadow-sm flex items-center gap-3.5 hover:border-[#F4A91E]/40 transition-all">
        <div className="p-2.5 rounded-xl bg-[#F4A91E]/15 border border-[#F4A91E]/30 text-[#F4A91E] shrink-0">
          <Calculator className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Moyenne / pers.
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-white">
            {avgCommits}
          </span>
        </div>
      </div>

      {/* Répartition de genre */}
      <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] shadow-sm flex flex-col justify-center space-y-2 col-span-2 lg:col-span-1 hover:border-[#2E5A4B] transition-all">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#4D7ECE] flex items-center gap-1">
            <span>♂ {maleCount}</span>
            <span className="text-[10px] text-zinc-400 font-normal">({malePercentage}%)</span>
          </span>
          <span className="text-[#F27A82] flex items-center gap-1">
            <span>♀ {femaleCount}</span>
            <span className="text-[10px] text-zinc-400 font-normal">({femalePercentage}%)</span>
          </span>
        </div>
        {/* Barre de proportion */}
        <div className="w-full h-2.5 rounded-full bg-[#0B1713] border border-[#224438] overflow-hidden flex">
          <div
            className="h-full bg-[#4D7ECE] transition-all duration-300"
            style={{ width: `${malePercentage}%` }}
            title={`Hommes: ${malePercentage}%`}
          />
          <div
            className="h-full bg-[#F27A82] transition-all duration-300"
            style={{ width: `${femalePercentage}%` }}
            title={`Femmes: ${femalePercentage}%`}
          />
        </div>
      </div>
    </div>
  );
}
