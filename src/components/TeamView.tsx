'use client';

import React, { useState } from 'react';
import { BalancingResult } from '@/types/participant';
import { ParticipantAvatar } from './ParticipantAvatar';
import {
  Users,
  GitCommit,
  Shuffle,
  Copy,
  Check,
  Download,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeamViewProps {
  result: BalancingResult | null;
  onRegenerate: () => void;
  onExportCSV: () => void;
  isAdmin?: boolean;
}

export function TeamView({ result, onRegenerate, onExportCSV, isAdmin = true }: TeamViewProps) {
  const [copied, setCopied] = useState(false);

  if (!result || result.teams.length === 0) {
    return null;
  }

  const { teams, stats } = result;

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCopyMarkdown = () => {
    let md = `# Composition des Équipes — Hacktoberfest Yaoundé 26\n\n`;
    md += `*Généré avec succès : ${teams.length} équipes (${stats.totalParticipants} participants, écart-type commits : ${stats.standardDeviation})*\n\n`;

    teams.forEach((t) => {
      md += `### ${t.name} (Moyenne : ${t.averageCommits} commits, Total : ${t.totalCommits} commits)\n`;
      t.members.forEach((m) => {
        const icon = m.gender === 'female' ? '👩' : '👨';
        const handle = m.githubHandle ? ` (@${m.githubHandle})` : '';
        md += `- ${icon} **${m.name}**${handle} : ${m.commits} commits\n`;
      });
      md += `\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      triggerConfetti();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="teams-view-container" data-component="team-view" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* En-tête de section Équipes */}
      <div id="teams-summary-header" data-element="teams-header" className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#10231D] via-[#162E26] to-[#10231D] border border-[#224438] shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B4D8]/15 border border-[#00B4D8]/30 text-[#00B4D8] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Équipes Équilibrées Générées</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {teams.length} Équipes créées pour {stats.totalParticipants} participants
          </h2>
          <p className="text-xs text-zinc-300">
            Association optimisée de profils forts, moyens et débutants avec parité de genre
          </p>
        </div>

        {/* Boutons d'export et régénération */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
          {isAdmin && (
            <button
              type="button"
              onClick={onRegenerate}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-xl transition-all active:scale-95 shadow-sm"
              title="Recalculer une variante équilibrée"
            >
              <Shuffle className="w-4 h-4 text-[#00B4D8]" />
              <span>Mélanger à nouveau</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E6392F] hover:bg-[#d62f25] rounded-xl transition-all shadow-lg shadow-[#E6392F]/25 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-200 bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-xl transition-all active:scale-95"
            title="Exporter la composition au format CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Résumé des indicateurs statistiques de qualité de l'équilibrage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 block uppercase font-medium">Écart-type commits</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white">
              ±{stats.standardDeviation} commits
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F4A91E]/15 text-[#F4A91E] border border-[#F4A91E]/30 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 block uppercase font-medium">Équipes mixtes H/F</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white">
              {stats.mixedTeamsPercentage}% des équipes
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11231D] border border-[#224438] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 block uppercase font-medium">Moyenne par équipe</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white">
              {stats.meanTeamCommits} commits
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid des Équipes */}
      <div id="teams-bento-grid" data-element="bento-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, idx) => {
          const isMixed = team.maleCount > 0 && team.femaleCount > 0;

          return (
            <div
              key={team.id}
              className="group relative flex flex-col justify-between p-5 rounded-2xl sm:rounded-3xl bg-[#11231D] border border-[#224438] hover:border-[#00B4D8]/50 transition-all hover:shadow-xl hover:shadow-[#00B4D8]/5"
            >
              <div className="space-y-4">
                {/* En-tête de carte */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30 inline-flex items-center justify-center text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{team.name}</span>
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {team.members.length} membres
                    </span>
                  </div>

                  {/* Badge de parité */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isMixed
                        ? 'bg-[#F27A82]/15 text-[#FF9EAA] border-[#F27A82]/30'
                        : 'bg-[#162E26] text-zinc-400 border-[#224438]'
                    }`}
                  >
                    <span>{team.maleCount} ♂ / {team.femaleCount} ♀</span>
                  </span>
                </div>

                {/* Liste des membres */}
                <div className="space-y-2 pt-1">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#162E26]/70 border border-[#224438]/70 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ParticipantAvatar
                          avatarUrl={member.avatarUrl}
                          name={member.name}
                          gender={member.gender}
                          size="sm"
                          showGenderSymbol={true}
                        />

                        <div className="truncate flex-1">
                          <span className="font-semibold text-white block truncate">
                            {member.name}
                          </span>
                          {member.githubHandle && (
                            <span className="text-[10px] font-mono text-zinc-400 block truncate">
                              @{member.githubHandle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-xs text-white shrink-0 bg-[#0B1713] px-2 py-1 rounded-lg border border-[#224438]">
                        <GitCommit className="w-3 h-3 text-[#10B981]" />
                        <span>{member.commits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pied de carte avec total et moyenne */}
              <div className="mt-5 pt-3.5 border-t border-[#224438] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  Total : <strong className="text-white">{team.totalCommits}</strong>
                </span>
                <span className="text-zinc-400">
                  Moyenne : <strong className="text-[#10B981] font-bold">{team.averageCommits}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
