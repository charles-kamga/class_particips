'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface OctoberCommitsResponse {
  commits?: number;
  year?: number;
  userExists?: boolean;
  name?: string;
  avatar_url?: string;
  message?: string;
}

// Cache mémoire côté client pour les calculs de commits (0ms en rappel)
const clientCommitsCache = new Map<string, OctoberCommitsResponse>();

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

  const resetForm = useCallback(() => {
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
  }, []);

  const handleModalClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Fermeture sur Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, handleModalClose]);

  if (!isOpen) return null;

  // Récupération des commits d'octobre (avec cache mémoire client 0ms)
  const applyCommitData = (data: OctoberCommitsResponse, cleanUser: string) => {
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
      setCommitBadgeInfo(`🗓️ ${data.commits} commit${data.commits > 1 ? 's' : ''} en octobre ${data.year || ''}`);
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
      const cached = clientCommitsCache.get(cacheKey);
      if (cached) applyCommitData(cached, cleanUser);
      return;
    }

    setLoadingCommits(true);
    setCommitBadgeInfo(null);

    try {
      const res = await fetch(`/api/github/october-commits?username=${encodeURIComponent(cleanUser)}`);
      if (res.ok) {
        const data: OctoberCommitsResponse = await res.json();
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
      handleModalClose();
    }
  };

  // Gestion des touches Entrée et raccourcis sur le formulaire
  const handleKeyDownForm = (e: React.KeyboardEvent) => {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-[#11231D] border border-[#224438] rounded-t-lg sm:rounded-lg shadow-2xl shadow-black/95 max-h-[92dvh] flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[#224438] bg-[#0D1B17] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-md bg-[#00B4D8]/15 border border-[#00B4D8]/30 text-[#00B4D8]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Nouveau Participant</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E6392F]/15 text-[#F27A82] border border-[#E6392F]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F4A91E]" />
                  <span>Hacktoberfest 26</span>
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-300">
                Saisissez le pseudo pour remplir automatiquement les commits d&apos;octobre
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-md hover:bg-[#162E26] transition-colors"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps déroulant */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Notifications d'état */}
          {errorMsg && (
            <div className="p-3 rounded-md bg-[#E6392F]/15 border border-[#E6392F]/30 text-[#F27A82] text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E6392F]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {feedback && (
            <div className="p-3 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-[#10B981]" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Formulaire avec gestionnaire clavier onKeyDown */}
          <div onKeyDown={handleKeyDownForm} className="space-y-4">
            {/* Pseudo GitHub avec Auto-complétion */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <span className="font-mono text-[#00B4D8]">@</span>
                  <span>Pseudo GitHub (Auto-complétion)</span>
                </label>
                {githubHandle && !loadingCommits && (
                  <button
                    type="button"
                    onClick={() => fetchOctoberCommits(githubHandle)}
                    className="text-[11px] text-[#00B4D8] hover:underline font-medium"
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
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Nom complet ou prénom</span>
              </label>
              <div className="flex items-center gap-2">
                {avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border border-[#224438] object-cover bg-[#162E26] shrink-0"
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
                  className="w-full px-4 py-2.5 bg-[#162E26] border border-[#224438] focus:border-[#00B4D8] rounded-md text-white placeholder:text-zinc-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 transition-all"
                />
              </div>
            </div>

            {/* Nombre de commits (du mois d'octobre) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <GitCommit className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Commits (Mois d&apos;Octobre)</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => addCommits(1)}
                    className="min-h-[32px] px-2.5 py-1 text-xs rounded-md bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] text-white transition-colors"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommits(5)}
                    className="min-h-[32px] px-2.5 py-1 text-xs rounded-md bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] text-white transition-colors"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommits(10)}
                    className="min-h-[32px] px-2.5 py-1 text-xs rounded-md bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] text-white transition-colors"
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
                  className="w-full px-4 py-2.5 bg-[#162E26] border border-[#224438] focus:border-[#00B4D8] rounded-md text-white placeholder:text-zinc-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 transition-all font-mono"
                />
                {loadingCommits && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-[#00B4D8] bg-[#0D1B17] px-2.5 py-1 rounded-md border border-[#00B4D8]/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calcul d&apos;octobre...</span>
                  </div>
                )}
              </div>

              {/* Information sur le filtre d'octobre */}
              {commitBadgeInfo ? (
                <div className="p-2.5 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2 animate-in fade-in">
                  <Calendar className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span className="font-semibold">{commitBadgeInfo}</span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Comptabilise uniquement les commits entre le 1er et le 31 octobre.</span>
                </p>
              )}
            </div>

            {/* Sexe (Switch Homme / Femme) */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-zinc-200">
                Sexe (pour l&apos;équilibrage paritaire)
              </label>
              <div>
                <GenderSwitch value={gender} onChange={setGender} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action en pied de modale */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#224438] bg-[#0D1B17] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Touche <kbd className="px-1.5 py-0.5 bg-[#162E26] rounded-sm text-white border border-[#224438]">Entrée</kbd> pour valider
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-200 bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter & suivant</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#E6392F] to-[#F4A91E] hover:opacity-95 rounded-md shadow-lg shadow-[#E6392F]/25 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer</span>
              <span className="sm:hidden text-white">↵</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
