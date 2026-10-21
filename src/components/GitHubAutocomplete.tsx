'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AtSign, Loader2, Check, ExternalLink, Sparkles } from 'lucide-react';

interface GitHubUserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectUser: (user: GitHubUserSummary) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function GitHubAutocomplete({
  value,
  onChange,
  onSelectUser,
  placeholder = 'ex: torvalds, alexmartin...',
  autoFocus = false,
}: GitHubAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GitHubUserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = value.trim().replace(/^@/, '');
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
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
          } else {
            setRateLimited(false);
            setSuggestions(data.users || []);
            setIsOpen((data.users || []).length > 0);
          }
        }
      } catch (err) {
        console.error('Erreur autocomplétion GitHub :', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Fermeture lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user: GitHubUserSummary) => {
    onChange(user.login);
    onSelectUser(user);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-zinc-500 flex items-center pointer-events-none">
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
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 text-xs text-zinc-500 hover:text-zinc-300 p-1"
          >
            ×
          </button>
        )}
      </div>

      {/* Menu déroulant des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800/60 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Profils GitHub suggérés</span>
            <span className="text-[10px] text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Octobre auto-rempli</span>
            </span>
          </div>

          <ul className="max-h-60 overflow-y-auto divide-y divide-zinc-900">
            {suggestions.map((user) => (
              <li key={user.login}>
                <button
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center justify-between p-2.5 text-left hover:bg-blue-600/10 hover:border-l-2 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-7 h-7 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                        @{user.login}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300">
                    Sélectionner →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rateLimited && (
        <p className="mt-1 text-[11px] text-amber-400/90">
          Quota GitHub temporairement restreint. Vous pouvez continuer la saisie manuelle.
        </p>
      )}
    </div>
  );
}
