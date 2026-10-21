'use client';

import React, { useState } from 'react';
import { BalancingResult, Team } from '@/types/participant';
import {
  Users,
  GitCommit,
  Shuffle,
  Copy,
  Check,
  Download,
  Flame,
  Award,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeamViewProps {
  result: BalancingResult | null;
  onRegenerate: () => void;
  onExportCSV: () => void;
}

export function TeamView({ result, onRegenerate, onExportCSV }: TeamViewProps) {
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
    let md = `# Composition des Équipes — Hackathon\n\n`;
    md += `*Généré avec succès : ${teams.length} équipes (${stats.totalParticipants} participants, écart-type commits : ${stats.standardDeviation})*\n\n`;

    teams.forEach((t) => {
      md += `### ${t.name} (Moyenne : ${t.averageCommits} commits, Total : ${t.totalCommits} commits)\n`;
      t.members.forEach((m) => {
        const icon = m.gender === 'female' ? '👩' : '👨';
        md += `- ${icon} **${m.name}** : ${m.commits} commits\n`;
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* En-tête de section Équipes */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-950 to-purple-950/30 border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Équipes Équilibrées Générées</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            {teams.length} Équipes créées pour {stats.totalParticipants} participants
          </h2>
          <p className="text-xs text-zinc-300">
            Association optimisée de profils forts, intermédiaires et débutants avec mixité de genre
          </p>
        </div>

        {/* Boutons d'export et régénération */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Recalculer une variante équilibrée"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-400" />
            <span>Mélanger à nouveau</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier la liste (Markdown)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
            title="Exporter la composition au format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Résumé des indicateurs statistiques de qualité de l'équilibrage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-300 block uppercase font-medium">Écart-type des commits</span>
            <span className="text-sm font-bold font-mono text-zinc-100">
              ±{stats.standardDeviation} commits
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-300 block uppercase font-medium">Équipes mixtes H/F</span>
            <span className="text-sm font-bold font-mono text-zinc-100">
              {stats.mixedTeamsPercentage}% des équipes
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-300 block uppercase font-medium">Moyenne globale par équipe</span>
            <span className="text-sm font-bold font-mono text-zinc-100">
              {stats.meanTeamCommits} commits
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid des Équipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, idx) => {
          const isMixed = team.maleCount > 0 && team.femaleCount > 0;

          return (
            <div
              key={team.id}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-950/10"
            >
              <div className="space-y-4">
                {/* En-tête de carte */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center justify-center text-xs font-mono">
                        {idx + 1}
                      </span>
                      <span>{team.name}</span>
                    </h3>
                    <span className="text-[11px] text-zinc-300">
                      {team.members.length} membres
                    </span>
                  </div>

                  {/* Badge de parité */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      isMixed
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <span>{team.maleCount} ♂ / {team.femaleCount} ♀</span>
                  </span>
                </div>

                {/* Liste des membres */}
                <div className="space-y-2 pt-1">
                  {team.members.map((member, mIdx) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            member.gender === 'female'
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                              : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                          }`}
                        >
                          {member.gender === 'female' ? '♀' : '♂'}
                        </span>
                        <span className="font-medium text-zinc-200">
                          {member.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-300">
                        <GitCommit className="w-3 h-3 text-emerald-400" />
                        <span>{member.commits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pied de carte avec total et moyenne */}
              <div className="mt-5 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">
                  Total : <strong className="text-zinc-200">{team.totalCommits}</strong>
                </span>
                <span className="text-zinc-300">
                  Moyenne : <strong className="text-emerald-400">{team.averageCommits}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
