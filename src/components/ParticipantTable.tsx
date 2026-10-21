'use client';

import React, { useState } from 'react';
import { Participant, Gender } from '@/types/participant';
import { GenderSwitch } from './GenderSwitch';
import { Trash2, GitCommit, Search, Trophy, Medal, Award, User, AlertCircle, Edit2, Check, X } from 'lucide-react';

interface ParticipantTableProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export function ParticipantTable({
  participants,
  onUpdate,
  onDelete,
  onOpenAddModal,
}: ParticipantTableProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCommits, setEditCommits] = useState<number>(0);

  // Le tableau est systématiquement ordonné par nombre de commits décroissant
  const sortedParticipants = [...participants].sort((a, b) => {
    if (b.commits !== a.commits) {
      return b.commits - a.commits;
    }
    return a.name.localeCompare(b.name);
  });

  const filtered = sortedParticipants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditCommits(p.commits);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdate(id, {
        name: editName.trim(),
        commits: Math.max(0, editCommits),
      });
    }
    setEditingId(null);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>#1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-300/10 text-slate-300 border border-slate-400/30">
          <Medal className="w-3.5 h-3.5 text-slate-300" />
          <span>#2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-700/10 text-amber-600 border border-amber-600/30">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>#3</span>
        </span>
      );
    }
    return <span className="text-xs font-mono text-zinc-300">#{rank}</span>;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
      {/* Barre d'outils du tableau */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/70 bg-zinc-900/30">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un participant..."
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-zinc-300 hover:text-zinc-100"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-300 self-end sm:self-center">
          <span>
            <strong className="text-zinc-200">{filtered.length}</strong> affiché{filtered.length > 1 ? 's' : ''} sur{' '}
            <strong className="text-zinc-200">{participants.length}</strong>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          <span className="text-blue-400 font-medium">Trié par commits décroissants</span>
        </div>
      </div>

      {/* Contenu du tableau */}
      {participants.length === 0 ? (
        <div className="p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">
              Aucun participant enregistré
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto">
              Cliquez sur le bouton « + Nouveau Participant » ou appuyez sur la touche <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200">N</kbd> pour commencer la saisie.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <span>+ Ajouter le premier participant</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/60 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Rang</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4 text-center w-36">Commits GitHub</th>
                <th className="py-3 px-4 text-center w-48">Sexe (Toggle)</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {filtered.map((participant) => {
                const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1;
                const isEditing = editingId === participant.id;

                return (
                  <tr
                    key={participant.id}
                    className="group hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Rang */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getRankBadge(rank)}
                    </td>

                    {/* Nom */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 bg-zinc-900 border border-blue-500 rounded text-zinc-100 text-xs w-full max-w-xs focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          {participant.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={participant.avatarUrl}
                              alt={participant.name}
                              className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border ${
                              participant.gender === 'female'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-zinc-100 flex items-center gap-2">
                              <span>{participant.name}</span>
                              {participant.githubHandle && (
                                <a
                                  href={`https://github.com/${participant.githubHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-0.5"
                                  title="Voir le profil GitHub"
                                >
                                  @{participant.githubHandle}
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400">
                              Inscrit le {new Date(participant.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Commits */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editCommits}
                          onChange={(e) => setEditCommits(parseInt(e.target.value, 10) || 0)}
                          className="px-2 py-1 bg-zinc-900 border border-blue-500 rounded text-zinc-100 text-xs w-20 text-center font-mono focus:outline-none"
                        />
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono font-medium">
                          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{participant.commits}</span>
                        </div>
                      )}
                    </td>

                    {/* Switch Sexe (directement modifiable dans la ligne) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <GenderSwitch
                        value={participant.gender}
                        onChange={(newGender: Gender) =>
                          onUpdate(participant.id, { gender: newGender })
                        }
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(participant.id)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Valider"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-1.5 text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(participant)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                              title="Modifier"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Supprimer "${participant.name}" de la liste ?`)) {
                                  onDelete(participant.id);
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
