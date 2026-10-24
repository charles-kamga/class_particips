'use client';

import React, { useState } from 'react';
import { Participant, Gender } from '@/types/participant';
import { GenderSwitch } from './GenderSwitch';
import { ParticipantAvatar } from './ParticipantAvatar';
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
  isAdmin?: boolean;
}

export function ParticipantTable({
  participants,
  onUpdate,
  onDelete,
  onOpenAddModal,
  isAdmin = true,
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#F4A91E]/20 text-[#F4A91E] border border-[#F4A91E]/40 shadow-sm shadow-[#F4A91E]/15">
          <Trophy className="w-3.5 h-3.5 text-[#F4A91E]" />
          <span>#1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-300/15 text-slate-100 border border-slate-400/40">
          <Medal className="w-3.5 h-3.5 text-slate-300" />
          <span>#2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#E6392F]/20 text-[#F27A82] border border-[#E6392F]/40">
          <Award className="w-3.5 h-3.5 text-[#E6392F]" />
          <span>#3</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-xs font-mono font-medium text-zinc-300 bg-[#0B1713] border border-[#224438]">
        #{rank}
      </span>
    );
  };

  return (
    <div
      id="participants-table-card"
      data-component="participant-table"
      className="bg-[#11231D] border border-[#224438] rounded-lg overflow-hidden shadow-xl shadow-black/40"
    >
      {/* Barre d'outils du tableau */}
      <div
        id="participants-search-bar"
        data-element="search-toolbar"
        className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#224438] bg-[#0D1B17]"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="input-search-participants"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou pseudo..."
            className="w-full pl-10 pr-9 py-2 bg-[#162E26] border border-[#224438] focus:border-[#00B4D8] rounded-md text-base sm:text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-xs text-zinc-400 hover:text-white"
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-300">
          <span>
            <strong className="text-white font-semibold">{filtered.length}</strong> affiché{filtered.length > 1 ? 's' : ''} sur{' '}
            <strong className="text-white font-semibold">{participants.length}</strong>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#224438] hidden sm:inline" />
          <span className="text-[#00B4D8] font-medium hidden sm:inline">Trié par commits décroissants</span>
        </div>
      </div>

      {/* Contenu : Si aucun participant */}
      {participants.length === 0 ? (
        <div className="p-8 sm:p-14 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-md bg-[#0D1B17] border border-[#224438] flex items-center justify-center text-zinc-400">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              Aucun participant enregistré
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto">
              {isAdmin
                ? "Cliquez sur le bouton « + Nouveau Participant » ou utilisez la touche N pour commencer."
                : "Les organisateurs n'ont pas encore ajouté de participants à cet événement."}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#E6392F] to-[#F4A91E] hover:opacity-95 rounded-md transition-all shadow-lg shadow-[#E6392F]/20 active:scale-95"
            >
              <span>+ Ajouter le premier participant</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* VUE MOBILE (Cartes Bento adaptatives, écran < 768px) */}
          <div id="participants-mobile-view" data-view="mobile-cards" className="md:hidden divide-y divide-[#1C3B31]">
            {filtered.map((participant) => {
              const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1;
              const isEditing = editingId === participant.id;

              return (
                <div
                  key={participant.id}
                  className="p-4 space-y-3 hover:bg-[#162E26]/40 transition-colors"
                >
                  {/* Ligne 1 : Rang + Nom + Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="shrink-0">{getRankBadge(rank)}</div>

                      <ParticipantAvatar
                        avatarUrl={participant.avatarUrl}
                        name={participant.name}
                        gender={participant.gender}
                      />

                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 bg-[#162E26] border border-[#00B4D8] rounded text-white text-sm focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="truncate">
                            <h4 className="font-semibold text-sm text-white truncate">
                              {participant.name}
                            </h4>
                            {participant.githubHandle && (
                              <a
                                href={`https://github.com/${participant.githubHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-[#00B4D8] hover:underline flex items-center gap-1"
                              >
                                <span>@{participant.githubHandle}</span>
                                <ExternalLink className="w-3 h-3 opacity-70" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions de modification / suppression */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(participant.id)}
                              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#10B981] hover:bg-[#10B981]/20 rounded-md transition-colors"
                              aria-label="Valider les modifications"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:bg-[#162E26] rounded-md transition-colors"
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
                              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#162E26] rounded-md transition-colors"
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
                              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-[#E6392F] hover:bg-[#E6392F]/15 rounded-md transition-colors"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ligne 2 : Commits + Toggle Sexe */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1C3B31]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 uppercase font-medium">Commits :</span>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editCommits}
                          onChange={(e) => setEditCommits(parseInt(e.target.value, 10) || 0)}
                          className="w-20 px-2 py-1 bg-[#162E26] border border-[#00B4D8] rounded text-white text-xs font-mono"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0B1713] border border-[#224438] text-white font-mono font-semibold text-xs">
                          <GitCommit className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>{participant.commits}</span>
                        </span>
                      )}
                    </div>

                    {isAdmin ? (
                      <GenderSwitch
                        value={participant.gender}
                        onChange={(newGender: Gender) =>
                          onUpdate(participant.id, { gender: newGender })
                        }
                        size="sm"
                      />
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          participant.gender === 'female'
                            ? 'bg-[#F27A82]/15 text-[#F27A82] border-[#F27A82]/30'
                            : 'bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30'
                        }`}
                      >
                        {participant.gender === 'female' ? 'Femme ♀' : 'Homme ♂'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* VUE TABLETTE & DESKTOP (Tableau complet, écran >= 768px) */}
          <div id="participants-desktop-view" data-view="desktop-table" className="hidden md:block overflow-x-auto">
            <table id="table-participants-ranking" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#224438] bg-[#0D1B17] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-20 text-center">Rang</th>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4 text-center w-44">Commits d&apos;Octobre</th>
                  <th className="py-3.5 px-4 text-center w-52">{isAdmin ? "Sexe (Toggle)" : "Sexe"}</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right w-24">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C3B31] text-xs">
                {filtered.map((participant) => {
                  const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1;
                  const isEditing = editingId === participant.id;

                  return (
                    <tr
                      key={participant.id}
                      className="group hover:bg-[#162E26]/50 transition-colors"
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
                            className="px-2.5 py-1.5 bg-[#162E26] border border-[#00B4D8] rounded-md text-white text-xs w-full max-w-xs focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <ParticipantAvatar
                              avatarUrl={participant.avatarUrl}
                              name={participant.name}
                              gender={participant.gender}
                            />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{participant.name}</span>
                                {participant.githubHandle && (
                                  <a
                                    href={`https://github.com/${participant.githubHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-mono text-[#00B4D8] hover:underline flex items-center gap-0.5"
                                    title="Voir le profil GitHub"
                                  >
                                    <span>@{participant.githubHandle}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
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
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editCommits}
                            onChange={(e) => setEditCommits(parseInt(e.target.value, 10) || 0)}
                            className="px-2 py-1 bg-[#162E26] border border-[#00B4D8] rounded-md text-white text-xs w-20 text-center font-mono focus:outline-none"
                          />
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B1713] border border-[#224438] text-white font-mono font-semibold">
                            <GitCommit className="w-3.5 h-3.5 text-[#10B981]" />
                            <span>{participant.commits}</span>
                          </div>
                        )}
                      </td>

                      {/* Switch Sexe */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isAdmin ? (
                          <GenderSwitch
                            value={participant.gender}
                            onChange={(newGender: Gender) =>
                              onUpdate(participant.id, { gender: newGender })
                            }
                            size="sm"
                          />
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                              participant.gender === 'female'
                                ? 'bg-[#F27A82]/15 text-[#F27A82] border-[#F27A82]/30'
                                : 'bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30'
                            }`}
                          >
                            {participant.gender === 'female' ? 'Femme ♀' : 'Homme ♂'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEdit(participant.id)}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#10B981] hover:bg-[#10B981]/20 rounded-md transition-colors"
                                  title="Valider"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:bg-[#162E26] rounded-md transition-colors"
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
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#162E26] rounded-md transition-colors opacity-70 group-hover:opacity-100"
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
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-[#E6392F] hover:bg-[#E6392F]/15 rounded-md transition-colors opacity-70 group-hover:opacity-100"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
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
