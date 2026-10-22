'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AtSign, Loader2, Sparkles, Check } from 'lucide-react';

export interface GitHubUserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectUser: (user: GitHubUserSummary) => void;
  onSubmit?: () => void;
  onOpenStateChange?: (isOpen: boolean) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function GitHubAutocomplete({
  value,
  onChange,
  onSelectUser,
  onSubmit,
  onOpenStateChange,
  placeholder = 'ex: torvalds, alexmartin...',
  autoFocus = false,
}: GitHubAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GitHubUserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [rateLimited, setRateLimited] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateIsOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenStateChange?.(open);
  };

  // Debounced search
  useEffect(() => {
    const trimmed = value.trim().replace(/^@/, '');
    if (trimmed.length < 2) {
      setSuggestions([]);
      updateIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
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
            setSuggestions(users);
            updateIsOpen(users.length > 0);
            setSelectedIndex(-1);
          }
        }
      } catch (err) {
        console.error('Erreur autocomplétion GitHub :', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  // Fermeture lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        updateIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
          return;
        } else if (suggestions.length > 0) {
          // Si aucune suggestion n'est activement sélectionnée, sélectionner la première
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

    // Si les suggestions ne sont pas affichées et que l'utilisateur appuie sur Entrée : déclencher la soumission du formulaire !
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
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
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
          placeholder={placeholder}
          aria-label="Pseudo GitHub"
          className="w-full pl-9 pr-9 py-2.5 sm:py-2.5 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono"
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
            className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-200 transition-colors rounded-md"
            aria-label="Effacer le pseudo"
          >
            <span className="text-base leading-none">×</span>
          </button>
        )}
      </div>

      {/* Menu déroulant des suggestions (Accessible & Mobile Touch Friendly) */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-zinc-800/60 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Profils GitHub suggérés</span>
            <span className="text-[10px] text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Entrée pour choisir</span>
            </span>
          </div>

          <ul className="max-h-60 overflow-y-auto divide-y divide-zinc-900/80">
            {suggestions.map((user, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <li key={user.login}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className={`w-full min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500 pl-3'
                        : 'hover:bg-zinc-900/70 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-7 h-7 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-100 font-mono">
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
        <p className="mt-1 text-[11px] text-amber-400/90 font-sans">
          Quota GitHub temporairement restreint. Vous pouvez continuer la saisie manuelle.
        </p>
      )}
    </div>
  );
}
