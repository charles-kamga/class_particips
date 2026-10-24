'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, KeyRound, Eye, EyeOff, Loader2, Check, AlertCircle, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setPassword('');
    setShowPassword(false);
    setIsLoading(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, []);

  const handleModalClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Focus automatique à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Fermeture sur Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleModalClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Veuillez renseigner le mot de passe organisateur.');
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Accès accordé !');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hackathon_admin_token', data.token || 'true');
        }
        setTimeout(() => {
          onSuccess();
          handleModalClose();
        }, 500);
      } else {
        setErrorMsg(data.error || 'Mot de passe incorrect.');
        inputRef.current?.focus();
      }
    } catch {
      setErrorMsg('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#11231D] border border-[#224438] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/95 overflow-hidden transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[#224438] bg-[#0D1B17]">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#F4A91E]/15 border border-[#F4A91E]/30 text-[#F4A91E]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="admin-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Accès Organisateur</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-300">
                Déverrouille les droits d&apos;ajout, de modification et de tirage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white rounded-xl hover:bg-[#162E26] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#E6392F]/15 border border-[#E6392F]/30 text-[#F27A82] text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E6392F]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-[#10B981]" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <KeyRound className="w-3.5 h-3.5 text-[#F4A91E]" />
              <span>Mot de passe administrateur</span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isLoading}
                placeholder="Entrez le mot de passe..."
                className="w-full px-4 py-2.5 pr-11 bg-[#162E26] border border-[#224438] focus:border-[#F4A91E] rounded-xl text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A91E]/20 transition-all font-mono"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-zinc-400">
              Le mot de passe par défaut est configuré via <code className="text-[#00B4D8]">ADMIN_PASSWORD</code>.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-xl transition-all"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="min-h-[40px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#F4A91E] to-[#E6392F] hover:opacity-95 rounded-xl shadow-lg shadow-[#F4A91E]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Déverrouiller</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
