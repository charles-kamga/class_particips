'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Participant, BalancingResult } from '@/types/participant';
import { loadParticipants, saveParticipants, loadTeams, saveTeams } from '@/lib/storage';
import { balanceTeams } from '@/lib/algorithm';
import { RegisterModal } from '@/components/RegisterModal';
import { ParticipantTable } from '@/components/ParticipantTable';
import { StatsBar } from '@/components/StatsBar';
import { TeamView } from '@/components/TeamView';
import { ImportExportModal } from '@/components/ImportExportModal';
import {
  UserPlus,
  Users,
  Sparkles,
  Database,
  Trash2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [balancingResult, setBalancingResult] = useState<BalancingResult | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Chargement initial depuis le localStorage (SSR-safe)
  useEffect(() => {
    const loadedParticipants = loadParticipants();
    setParticipants(loadedParticipants);

    const loadedTeamsData = loadTeams<BalancingResult>();
    if (loadedTeamsData) {
      setBalancingResult(loadedTeamsData);
    }
    setIsMounted(true);
  }, []);

  // Sauvegarde automatique à chaque changement de participants
  useEffect(() => {
    if (isMounted) {
      saveParticipants(participants);
    }
  }, [participants, isMounted]);

  // Sauvegarde des équipes générées
  useEffect(() => {
    if (isMounted) {
      saveTeams(balancingResult);
    }
  }, [balancingResult, isMounted]);

  // Raccourci clavier global 'N' pour ouvrir la modale d'enregistrement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si l'utilisateur est déjà en train de taper dans un champ
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsRegisterOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ajout d'un participant
  const handleAddParticipant = (
    data: Omit<Participant, 'id' | 'createdAt'>
  ) => {
    const newParticipant: Participant = {
      ...data,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    setParticipants((prev) => [newParticipant, ...prev]);
  };

  // Mise à jour d'un participant
  const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Suppression d'un participant
  const handleDeleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Import en masse
  const handleImport = (imported: Participant[]) => {
    setParticipants(imported);
    setBalancingResult(null);
  };

  // Réinitialisation de la liste
  const handleClearAll = () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer tous les participants enregistrés ?'
      )
    ) {
      setParticipants([]);
      setBalancingResult(null);
    }
  };

  // Génération des équipes
  const handleGenerateTeams = useCallback(() => {
    if (participants.length < 3) {
      alert('Veuillez enregistrer au moins 3 participants pour former une équipe.');
      return;
    }

    const result = balanceTeams(participants);
    setBalancingResult(result);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, [participants]);

  // Export CSV des équipes
  const handleExportTeamsCSV = () => {
    if (!balancingResult) return;
    const headers = ['Equipe', 'Membre', 'Commits', 'Sexe'];
    const rows: string[] = [];

    balancingResult.teams.forEach((t) => {
      t.members.forEach((m) => {
        rows.push(
          `"${t.name}","${m.name.replace(/"/g, '""')}",${m.commits},${
            m.gender === 'male' ? 'Homme' : 'Femme'
          }`
        );
      });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `equipes_hackathon_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Navigation supérieure */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Titre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">
                  Hackathon Team Balancer
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Vercel Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 hidden sm:block">
                Classement en direct & matchmaking d&apos;équipes de 3
              </p>
            </div>
          </div>

          {/* Boutons d'action rapides */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
              title="Importer ou exporter les participants (CSV/JSON)"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Données</span>
            </button>

            {participants.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Vider la liste des participants"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau</span>
              <kbd className="hidden md:inline px-1.5 py-0.2 bg-blue-700/60 rounded text-[10px] font-mono border border-blue-400/30">
                N
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Statistiques clés */}
        <StatsBar participants={participants} />

        {/* Section Génération d'équipes */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2 justify-center sm:justify-start">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Génération d&apos;Équipes Équilibrées</span>
            </h2>
            <p className="text-xs text-zinc-300">
              Forme des équipes de 3 en associant profils forts et faibles avec mixité de genre
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateTeams}
            disabled={participants.length < 3}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Générer les équipes de 3</span>
          </button>
        </div>

        {/* Vue des équipes générées */}
        {balancingResult && (
          <TeamView
            result={balancingResult}
            onRegenerate={handleGenerateTeams}
            onExportCSV={handleExportTeamsCSV}
          />
        )}

        {/* Tableau interactif des participants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Participants & Classement Commits
            </h2>
          </div>

          <ParticipantTable
            participants={participants}
            onUpdate={handleUpdateParticipant}
            onDelete={handleDeleteParticipant}
            onOpenAddModal={() => setIsRegisterOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-300 space-y-1">
        <p>Hackathon Team Balancer — Application Web Ultra-Rapide pour Vercel</p>
        <p className="text-[11px] text-zinc-300">
          Stockage local 100% offline & algorithme d&apos;équilibrage déterministe
        </p>
      </footer>

      {/* Modale d'enregistrement rapide */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAdd={handleAddParticipant}
      />

      {/* Modale d'import / export */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        participants={participants}
        onImport={handleImport}
      />
    </div>
  );
}
