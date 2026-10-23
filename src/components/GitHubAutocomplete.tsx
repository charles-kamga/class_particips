'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AtSign, Loader2, Sparkles } from 'lucide-react';

export interface GitHubUserSummary {
  login: string;
  avatar_url: string;
}

interface GitHubAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectUser: (user: GitHubUserSummary) => void;
  onSubmit?: () => void;
  onOpenStateChange?: (isOpen: boolean) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// Cache local en mémoire (0ms de latence pour les recherches déjà faites)
const clientSearchCache = new Map<string, GitHubUserSummary[]>();

// Pré-chargement silencieux des commits d'octobre
function prefetchOctoberCommits(username: string) {
  if (!username) return;
  const clean = username.trim().replace(/^@/, '');
  if (!clean) return;
  fetch(`/api/github/october-commits?username=${encodeURIComponent(clean)}`).catch(() => {});
}

export function GitHubAutocomplete({
  value,
  onChange,
  onSelectUser,
  onSubmit,
  onOpenStateChange,
  onBlur,
  placeholder = 'Rechercher un pseudo...',
  autoFocus = false,
}: GitHubAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GitHubUserSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [rateLimited, setRateLimited] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateIsOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenStateChange?.(open);
    },
    [onOpenStateChange]
  );

  // Recherche optimisée avec Debounce (140ms) & Cache 0ms
  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = value.trim().replace(/^@/, '');
      if (trimmed.length < 2) {
        setSuggestions([]);
        updateIsOpen(false);
        setSelectedIndex(-1);
        return;
      }

      const cacheKey = trimmed.toLowerCase();
      if (clientSearchCache.has(cacheKey)) {
        const cachedUsers = clientSearchCache.get(cacheKey)!;
        setSuggestions(cachedUsers);
        updateIsOpen(cachedUsers.length > 0);
        setSelectedIndex(-1);
        setLoading(false);
        if (cachedUsers.length > 0) {
          prefetchOctoberCommits(cachedUsers[0].login);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/github/search-users?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.rateLimited) {
            setRateLimited(true);
            setSuggestions([]);
            updateIsOpen(false);
          } else {
            setRateLimited(false);
            const users: GitHubUserSummary[] = data.users || [];
            clientSearchCache.set(cacheKey, users);
            setSuggestions(users);
            updateIsOpen(users.length > 0);
            setSelectedIndex(-1);

            if (users.length > 0) {
              prefetchOctoberCommits(users[0].login);
            }
          }
        }
      } catch (err) {
        console.error('Erreur autocomplétion GitHub :', err);
      } finally {
        setLoading(false);
      }
    }, 140);

    return () => clearTimeout(timer);
  }, [value, updateIsOpen]);

  // Fermeture lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        updateIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [updateIsOpen]);

  const handleSelect = (user: GitHubUserSummary) => {
    onChange(user.login);
    onSelectUser(user);
    updateIsOpen(false);
    setSelectedIndex(-1);
  };

  // Navigation clavier dans les suggestions et soumission par Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(nextIndex);
        prefetchOctoberCommits(suggestions[nextIndex].login);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
        setSelectedIndex(prevIndex);
        prefetchOctoberCommits(suggestions[prevIndex].login);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
          return;
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        updateIsOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-zinc-400 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#00B4D8]" />
          ) : (
            <AtSign className="w-4 h-4 text-zinc-400" />
          )}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) updateIsOpen(true);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-label="Pseudo GitHub"
          className="w-full pl-9 pr-9 py-2.5 bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] focus:border-[#00B4D8] rounded-xl text-white placeholder:text-zinc-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 transition-all font-mono"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              updateIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 text-zinc-400 hover:text-white transition-colors rounded-md"
            aria-label="Effacer le pseudo"
          >
            <span className="text-base leading-none">×</span>
          </button>
        )}
      </div>

      {/* Menu déroulant des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#11231D] backdrop-blur-xl border border-[#224438] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 bg-[#0D1B17] border-b border-[#224438] text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Profils GitHub suggérés</span>
            <span className="text-[10px] text-[#00B4D8] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F4A91E]" />
              <span>Entrée pour choisir</span>
            </span>
          </div>

          <ul className="max-h-60 overflow-y-auto divide-y divide-[#1C3B31]">
            {suggestions.map((user, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <li
                  key={user.login}
                  onMouseEnter={() => prefetchOctoberCommits(user.login)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className={`w-full min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-[#00B4D8]/20 text-[#00B4D8] border-l-4 border-[#00B4D8] pl-3'
                        : 'hover:bg-[#162E26] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-7 h-7 rounded-full border border-[#224438] bg-[#162E26] object-cover shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-white font-mono">
                          @{user.login}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-sans">
                      <span>Sélectionner</span>
                      <span className="text-zinc-500">↵</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {rateLimited && (
        <p className="mt-1 text-[11px] text-[#F4A91E] font-sans">
          Quota GitHub temporairement restreint. Vous pouvez continuer la saisie manuelle.
        </p>
      )}
    </div>
  );
}
