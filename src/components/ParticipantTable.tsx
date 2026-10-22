'use client';

import React, { useState } from 'react';
import { Participant, Gender } from '@/types/participant';
import { GenderSwitch } from './GenderSwitch';
import {
  Trash2,
  GitCommit,
  Search,
  Trophy,
  Medal,
  Award,
  User,
  Edit2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

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
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.githubHandle && p.githubHandle.toLowerCase().includes(search.toLowerCase()))
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>#1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-300/15 text-slate-200 border border-slate-400/30">
          <Medal className="w-3.5 h-3.5 text-slate-300" />
          <span>#2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-700/20 text-amber-400 border border-amber-600/30">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>#3</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-lg text-xs font-mono font-medium text-zinc-400 bg-zinc-900 border border-zinc-800">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-black/40">
      {/* Barre d'outils du tableau */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-800/70 bg-zinc-900/30">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou pseudo..."
            className="w-full pl-10 pr-9 py-2 bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 rounded-xl text-base sm:text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-xs text-zinc-400 hover:text-zinc-200"
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400">
          <span>
            <strong className="text-zinc-200 font-semibold">{filtered.length}</strong> affiché{filtered.length > 1 ? 's' : ''} sur{' '}
            <strong className="text-zinc-200 font-semibold">{participants.length}</strong>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 hidden sm:inline" />
          <span className="text-blue-400 font-medium hidden sm:inline">Trié par commits décroissants</span>
        </div>
      </div>

      {/* Contenu : Si aucun participant */}
      {participants.length === 0 ? (
        <div className="p-8 sm:p-14 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-200">
              Aucun participant enregistré
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              Cliquez sur le bouton « + Nouveau Participant » ou utilisez la touche <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono text-xs">N</kbd> pour commencer.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <span>+ Ajouter le premier participant</span>
          </button>
        </div>
      ) : (
        <>
          {/* VUE MOBILE (Cartes Bento adaptatives, écran < 768px) */}
          <div className="md:hidden divide-y divide-zinc-900">
            {filtered.map((participant) => {
              const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1;
              const isEditing = editingId === participant.id;

              return (
                <div
                  key={participant.id}
                  className="p-4 space-y-3 hover:bg-zinc-900/30 transition-colors"
                >
                  {/* Ligne 1 : Rang + Nom + Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="shrink-0">{getRankBadge(rank)}</div>

                      {participant.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={participant.avatarUrl}
                          alt={participant.name}
                          className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
                            participant.gender === 'female'
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                              : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                          }`}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 bg-zinc-900 border border-blue-500 rounded text-zinc-100 text-sm focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="truncate">
                            <h4 className="font-semibold text-sm text-zinc-100 truncate">
                              {participant.name}
                            </h4>
                            {participant.githubHandle && (
                              <a
                                href={`https://github.com/${participant.githubHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <span>@{participant.githubHandle}</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions de modification / suppression */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(participant.id)}
                            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-emerald-400 hover:bg-emerald-500/15 rounded-xl transition-colors"
                            aria-label="Valider les modifications"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:bg-zinc-800 rounded-xl transition-colors"
                            aria-label="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(participant)}
                            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-xl transition-colors"
                            aria-label="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Supprimer "${participant.name}" de la liste ?`)) {
                                onDelete(participant.id);
                              }
                            }}
                            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ligne 2 : Commits + Toggle Sexe */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900/80">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500 uppercase font-medium">Commits :</span>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editCommits}
                          onChange={(e) => setEditCommits(parseInt(e.target.value, 10) || 0)}
                          className="w-20 px-2 py-1 bg-zinc-900 border border-blue-500 rounded text-zinc-100 text-xs font-mono"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono font-semibold text-xs">
                          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{participant.commits}</span>
                        </span>
                      )}
                    </div>

                    <GenderSwitch
                      value={participant.gender}
                      onChange={(newGender: Gender) =>
                        onUpdate(participant.id, { gender: newGender })
                      }
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* VUE TABLETTE & DESKTOP (Tableau complet, écran >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-20 text-center">Rang</th>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4 text-center w-40">Commits d&apos;Octobre</th>
                  <th className="py-3.5 px-4 text-center w-52">Sexe (Toggle)</th>
                  <th className="py-3.5 px-4 text-right w-24">Actions</th>
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
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getRankBadge(rank)}
                      </td>

                      {/* Nom & Avatar */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2.5 py-1.5 bg-zinc-900 border border-blue-500 rounded-lg text-zinc-100 text-xs w-full max-w-xs focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            {participant.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={participant.avatarUrl}
                                alt={participant.name}
                                className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
                                  participant.gender === 'female'
                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                    : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                                }`}
                              >
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
                                    <span>@{participant.githubHandle}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                  </a>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-500">
                                Inscrit le {new Date(participant.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Commits */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editCommits}
                            onChange={(e) => setEditCommits(parseInt(e.target.value, 10) || 0)}
                            className="px-2 py-1 bg-zinc-900 border border-blue-500 rounded-lg text-zinc-100 text-xs w-20 text-center font-mono focus:outline-none"
                          />
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono font-semibold">
                            <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{participant.commits}</span>
                          </div>
                        )}
                      </td>

                      {/* Switch Sexe */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <GenderSwitch
                          value={participant.gender}
                          onChange={(newGender: Gender) =>
                            onUpdate(participant.id, { gender: newGender })
                          }
                          size="sm"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(participant.id)}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-emerald-400 hover:bg-emerald-500/15 rounded-lg transition-colors"
                                title="Valider"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors"
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
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
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
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
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
        </>
      )}
    </div>
  );
}
