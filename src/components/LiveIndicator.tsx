'use client';

import React from 'react';
import { Lock, Unlock, Wifi, CloudOff, Radio } from 'lucide-react';
import { SyncStatus } from '@/types/sharedSpace';

interface LiveIndicatorProps {
  isAdmin: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt?: number;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export function LiveIndicator({
  isAdmin,
  syncStatus,
  onOpenLogin,
  onLogout,
}: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Badge Temps Réel Live */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
          syncStatus === 'connected'
            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
            : syncStatus === 'syncing'
            ? 'bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30 animate-pulse'
            : syncStatus === 'connecting'
            ? 'bg-[#F4A91E]/15 text-[#F4A91E] border-[#F4A91E]/30'
            : 'bg-[#162E26] text-zinc-400 border-[#224438]'
        }`}
        title={
          syncStatus === 'connected'
            ? 'Connecté à l\'espace partagé Firebase en direct'
            : syncStatus === 'syncing'
            ? 'Synchronisation des modifications...'
            : syncStatus === 'connecting'
            ? 'Connexion au serveur Firebase...'
            : 'Mode hors-ligne / local'
        }
      >
        {syncStatus === 'connected' ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <span className="hidden sm:inline font-mono text-[11px]">LIVE</span>
          </>
        ) : syncStatus === 'syncing' ? (
          <>
            <Radio className="w-3 h-3 text-[#00B4D8] animate-spin" />
            <span className="hidden sm:inline text-[11px]">SYNCHRO</span>
          </>
        ) : syncStatus === 'connecting' ? (
          <>
            <Wifi className="w-3 h-3 text-[#F4A91E] animate-pulse" />
            <span className="hidden sm:inline text-[11px]">CONNEXION</span>
          </>
        ) : (
          <>
            <CloudOff className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline text-[11px]">LOCAL</span>
          </>
        )}
      </div>

      {/* Rôle & Accès Organisateur */}
      {isAdmin ? (
        <div className="flex items-center gap-1.5">
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4A91E]/15 text-[#F4A91E] border border-[#F4A91E]/30 text-[10px] font-bold uppercase tracking-wider">
            👑 Admin
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[36px] inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-md transition-all"
            title="Quitter le mode Organisateur (repasser en spectateur)"
          >
            <Unlock className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden sm:inline text-[11px]">Déconnexion</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenLogin}
          className="min-h-[36px] inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-md transition-all hover:border-[#F4A91E]/50"
          title="Se connecter en tant qu'organisateur"
        >
          <Lock className="w-3.5 h-3.5 text-[#F4A91E]" />
          <span className="text-[11px]">Organisateur</span>
        </button>
      )}
    </div>
  );
}
