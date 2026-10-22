'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Gender, Participant } from '@/types/participant';
import { GenderSwitch } from './GenderSwitch';
import { GitHubAutocomplete, GitHubUserSummary } from './GitHubAutocomplete';
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
  AlertCircle,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (participant: Omit<Participant, 'id' | 'createdAt'>) => void;
}

// Cache mémoire côté client pour les calculs de commits (0ms en rappel ou préchargement)
const clientCommitsCache = new Map<string, any>();

export function RegisterModal({ isOpen, onClose, onAdd }: RegisterModalProps) {
  const [githubHandle, setGithubHandle] = useState('');
  const [name, setName] = useState('');
  const [commits, setCommits] = useState<number | ''>(0);
  const [gender, setGender] = useState<Gender>('male');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const [loadingCommits, setLoadingCommits] = useState(false);
  const [commitBadgeInfo, setCommitBadgeInfo] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const commitsInputRef = useRef<HTMLInputElement>(null);

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
      setErrorMsg(null);
      setLoadingCommits(false);
      setIsAutocompleteOpen(false);
    }
  }, [isOpen]);

  // Fermeture sur Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Récupération des commits d'octobre (avec cache mémoire client 0ms)
  const applyCommitData = (data: any, cleanUser: string) => {
    // Si l'utilisateur n'existe pas sur GitHub
    if (data.userExists === false) {
      setErrorMsg(data.message || `Le profil GitHub "@${cleanUser}" est introuvable.`);
      setCommitBadgeInfo(null);
      setCommits(0);
      setAvatarUrl(undefined);
      return;
    }

    if (typeof data.commits === 'number') {
      setCommits(data.commits);
      setCommitBadgeInfo(`🗓️ ${data.commits} commit${data.commits > 1 ? 's' : ''} en octobre ${data.year}`);
      setErrorMsg(null);
    }
    if (data.name && (!name || name === cleanUser)) {
      setName(data.name);
    } else if (!name) {
      setName(cleanUser);
    }
    if (data.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const fetchOctoberCommits = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) return;

    const cacheKey = cleanUser.toLowerCase();
    if (clientCommitsCache.has(cacheKey)) {
      applyCommitData(clientCommitsCache.get(cacheKey), cleanUser);
      return;
    }

    setLoadingCommits(true);
    setCommitBadgeInfo(null);

    try {
      const res = await fetch(`/api/github/october-commits?username=${encodeURIComponent(cleanUser)}`);
      if (res.ok) {
        const data = await res.json();
        clientCommitsCache.set(cacheKey, data);
        applyCommitData(data, cleanUser);
      }
    } catch (err) {
      console.error('Erreur récupération commits octobre :', err);
    } finally {
      setLoadingCommits(false);
    }
  };

  const handleSelectGitHubUser = (user: GitHubUserSummary) => {
    setGithubHandle(user.login);
    setAvatarUrl(user.avatar_url);
    if (!name || name === githubHandle) {
      setName(user.login);
    }
    fetchOctoberCommits(user.login);
  };

  const handleSubmit = (keepOpen: boolean = false) => {
    const trimmedName = name.trim();
    const trimmedGithub = githubHandle.trim().replace(/^@/, '');
    const finalName = trimmedName || trimmedGithub;

    if (!finalName) {
      setErrorMsg('Veuillez renseigner le nom ou le pseudo GitHub.');
      nameInputRef.current?.focus();
      return;
    }

    setErrorMsg(null);
    const commitVal = typeof commits === 'number' ? Math.max(0, commits) : 0;

    onAdd({
      name: finalName,
      commits: commitVal,
      gender,
      githubHandle: trimmedGithub || undefined,
      avatarUrl: errorMsg
        ? undefined
        : avatarUrl || (trimmedGithub ? `https://github.com/${trimmedGithub}.png` : undefined),
    });

    if (keepOpen) {
      setFeedback(`"${finalName}" enregistré !`);
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

  // Gestion des touches Entrée et raccourcis sur le formulaire
  const handleKeyDownForm = (e: React.KeyboardEvent) => {
    // Si l'autocomplétion est ouverte avec ses suggestions, la touche Entrée sert à choisir
    if (isAutocompleteOpen) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      // Ctrl+Entrée ou Cmd+Entrée = Ajouter et suivant
      if (e.ctrlKey || e.metaKey) {
        handleSubmit(true);
      } else {
        handleSubmit(false);
      }
    }
  };

  const addCommits = (amount: number) => {
    const current = typeof commits === 'number' ? commits : 0;
    setCommits(Math.max(0, current + amount));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/95 max-h-[92dvh] flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800/60 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <span>Nouveau Participant</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>GitHub & Octobre</span>
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Saisissez le pseudo pour remplir automatiquement les commits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/60 transition-colors"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps déroulant (safe scroll pour mobile) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Notifications d'état */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Formulaire avec gestionnaire clavier onKeyDown */}
          <div onKeyDown={handleKeyDownForm} className="space-y-4">
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
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    Recalculer octobre
                  </button>
                )}
              </div>

              <GitHubAutocomplete
                value={githubHandle}
                onChange={(val) => {
                  setGithubHandle(val);
                  setErrorMsg(null);
                }}
                onSelectUser={handleSelectGitHubUser}
                onSubmit={() => handleSubmit(false)}
                onOpenStateChange={setIsAutocompleteOpen}
                onBlur={() => {
                  const trimmed = githubHandle.trim().replace(/^@/, '');
                  if (trimmed && !loadingCommits && !avatarUrl) {
                    fetchOctoberCommits(trimmed);
                  }
                }}
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
                    className="w-9 h-9 rounded-full border border-zinc-700 object-cover bg-zinc-800 shrink-0"
                    onError={() => setAvatarUrl(undefined)}
                  />
                )}
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="ex: Alex Martin"
                  className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
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
                    className="min-h-[32px] px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommits(5)}
                    className="min-h-[32px] px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommits(10)}
                    className="min-h-[32px] px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  ref={commitsInputRef}
                  type="number"
                  min="0"
                  value={commits}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCommits(val === '' ? '' : parseInt(val, 10));
                  }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono"
                />
                {loadingCommits && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-blue-400 bg-zinc-900/95 px-2.5 py-1 rounded-lg border border-blue-500/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calcul d&apos;octobre...</span>
                  </div>
                )}
              </div>

              {/* Information sur le filtre d'octobre */}
              {commitBadgeInfo ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{commitBadgeInfo}</span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Comptabilise uniquement les commits entre le 1er et le 31 octobre.</span>
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
          </div>
        </div>

        {/* Boutons d'action en pied de modale (Responsive & accessible) */}
        <div className="px-5 sm:px-6 py-4 border-t border-zinc-800/70 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Touche <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 border border-zinc-700">Entrée</kbd> pour valider directement
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter & suivant</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer</span>
              <span className="sm:hidden text-blue-200">↵</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
