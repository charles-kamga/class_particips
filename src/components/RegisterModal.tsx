'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Gender, Participant } from '@/types/participant';
import { GenderSwitch } from './GenderSwitch';
import { GitHubAutocomplete } from './GitHubAutocomplete';
import {
  X,
  UserPlus,
  GitCommit,
  User,
  Check,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (participant: Omit<Participant, 'id' | 'createdAt'>) => void;
}

export function RegisterModal({ isOpen, onClose, onAdd }: RegisterModalProps) {
  const [githubHandle, setGithubHandle] = useState('');
  const [name, setName] = useState('');
  const [commits, setCommits] = useState<number | ''>(0);
  const [gender, setGender] = useState<Gender>('male');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const [loadingCommits, setLoadingCommits] = useState(false);
  const [commitBadgeInfo, setCommitBadgeInfo] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Réinitialisation à l'ouverture/fermeture
  useEffect(() => {
    if (!isOpen) {
      setGithubHandle('');
      setName('');
      setCommits(0);
      setGender('male');
      setAvatarUrl(undefined);
      setCommitBadgeInfo(null);
      setFeedback(null);
      setLoadingCommits(false);
    }
  }, [isOpen]);

  // Fermeture sur Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Récupération des commits d'octobre
  const fetchOctoberCommits = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) return;

    setLoadingCommits(true);
    setCommitBadgeInfo(null);

    try {
      const res = await fetch(`/api/github/october-commits?username=${encodeURIComponent(cleanUser)}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.commits === 'number') {
          setCommits(data.commits);
          setCommitBadgeInfo(`🗓️ ${data.commits} commit${data.commits > 1 ? 's' : ''} en octobre ${data.year}`);
        }
        if (data.name && (!name || name === cleanUser)) {
          setName(data.name);
        } else if (!name) {
          setName(cleanUser);
        }
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    } catch (err) {
      console.error('Erreur récupération commits octobre :', err);
    } finally {
      setLoadingCommits(false);
    }
  };

  const handleSelectGitHubUser = (user: { login: string; avatar_url: string }) => {
    setGithubHandle(user.login);
    setAvatarUrl(user.avatar_url);
    if (!name || name === githubHandle) {
      setName(user.login);
    }
    fetchOctoberCommits(user.login);
  };

  const handleSubmit = (keepOpen: boolean = false) => {
    const trimmed = name.trim() || githubHandle.trim().replace(/^@/, '');
    if (!trimmed) {
      nameInputRef.current?.focus();
      return;
    }

    const commitVal = typeof commits === 'number' ? Math.max(0, commits) : 0;

    onAdd({
      name: trimmed,
      commits: commitVal,
      gender,
      githubHandle: githubHandle.trim().replace(/^@/, '') || undefined,
      avatarUrl: avatarUrl || (githubHandle ? `https://github.com/${githubHandle.trim().replace(/^@/, '')}.png` : undefined),
    });

    if (keepOpen) {
      setFeedback(`"${trimmed}" ajouté avec succès !`);
      setGithubHandle('');
      setName('');
      setCommits(0);
      setAvatarUrl(undefined);
      setCommitBadgeInfo(null);
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    } else {
      onClose();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(false);
  };

  const addCommits = (amount: number) => {
    const current = typeof commits === 'number' ? commits : 0;
    setCommits(Math.max(0, current + amount));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden transition-all scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <span>Nouveau Participant</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>API GitHub & Octobre</span>
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Saisissez le pseudo GitHub pour remplir directement les commits d&apos;octobre
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800/60 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message éphémère de confirmation (Batch entry) */}
        {feedback && (
          <div className="mx-6 mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Pseudo GitHub avec Auto-complétion */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                <span className="font-mono text-blue-400">@</span>
                <span>Pseudo GitHub (Auto-complétion)</span>
              </label>
              {githubHandle && !loadingCommits && (
                <button
                  type="button"
                  onClick={() => fetchOctoberCommits(githubHandle)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                >
                  Recalculer octobre
                </button>
              )}
            </div>

            <GitHubAutocomplete
              value={githubHandle}
              onChange={setGithubHandle}
              onSelectUser={handleSelectGitHubUser}
              placeholder="Tapez un pseudo (ex: torvalds, alexmartin...)"
              autoFocus={true}
            />
          </div>

          {/* Nom du participant */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Nom complet ou prénom</span>
            </label>
            <div className="flex items-center gap-2">
              {avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-zinc-700 object-cover bg-zinc-800"
                />
              )}
              <input
                ref={nameInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Alex Martin"
                className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Nombre de commits (du mois d'octobre) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Commits (Mois d&apos;Octobre)</span>
              </label>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => addCommits(1)}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => addCommits(5)}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => addCommits(10)}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  +10
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={commits}
                onChange={(e) => {
                  const val = e.target.value;
                  setCommits(val === '' ? '' : parseInt(val, 10));
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
              />
              {loadingCommits && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-blue-400 bg-zinc-900/90 px-2 py-1 rounded-md">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calcul d&apos;octobre...</span>
                </div>
              )}
            </div>

            {/* Information sur le filtre d'octobre */}
            {commitBadgeInfo ? (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{commitBadgeInfo}</span>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-zinc-500" />
                <span>Comptabilise uniquement les commits enregistrés entre le 1er et le 31 octobre.</span>
              </p>
            )}
          </div>

          {/* Sexe (Switch Homme / Femme) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-zinc-300">
              Sexe (pour l&apos;équilibrage paritaire)
            </label>
            <div>
              <GenderSwitch value={gender} onChange={setGender} size="md" />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/60">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Raccourci : <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 border border-zinc-700">Entrée</kbd> pour valider
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter et suivant</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
