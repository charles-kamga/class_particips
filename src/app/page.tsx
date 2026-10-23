'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Participant, BalancingResult } from '@/types/participant';
import { loadParticipants, saveParticipants, loadTeams, saveTeams } from '@/lib/storage';
import { balanceTeams } from '@/lib/algorithm';
import { EventHeaderBanner } from '@/components/EventHeaderBanner';
import { EventFooter } from '@/components/EventFooter';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [balancingResult, setBalancingResult] = useState<BalancingResult | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Chargement initial depuis le localStorage sans blocage SSR ni warning ESLint
  useEffect(() => {
    const timer = setTimeout(() => {
      const loadedParticipants = loadParticipants();
      setParticipants(loadedParticipants);

      const loadedTeamsData = loadTeams<BalancingResult>();
      if (loadedTeamsData) {
        setBalancingResult(loadedTeamsData);
      }
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
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
      colors: ['#E6392F', '#F4A91E', '#00B4D8', '#10B981', '#F27A82'],
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
      `equipes_hacktoberfest_yaounde_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-[#0B1713] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#E6392F]/30 selection:text-white overflow-x-hidden">
      {/* Navigation supérieure */}
      <header className="sticky top-0 z-30 border-b border-[#224438] bg-[#0B1713]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5">
          {/* Logo & Titre Modulis */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00B4D8] to-[#10B981] flex items-center justify-center text-[#0B1713] font-black shadow-lg shadow-[#00B4D8]/20 shrink-0">
              <span className="text-base tracking-tighter">M</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase truncate">
                  MODULIS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6392F]/15 text-[#F27A82] border border-[#E6392F]/30 shrink-0">
                  Hacktoberfest 26
                </span>
              </div>
              <p className="text-[11px] text-[#00B4D8] hidden sm:block truncate font-medium">
                Team Balancer • AI + Hackfest Yaoundé
              </p>
            </div>
          </div>

          {/* Boutons d'action rapides */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsImportExportOpen(true)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] rounded-xl transition-colors"
              title="Importer ou exporter les participants (CSV/JSON)"
            >
              <Database className="w-4 h-4 text-[#00B4D8]" />
              <span className="hidden sm:inline">Données</span>
            </button>

            {participants.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-[#E6392F] hover:bg-[#E6392F]/15 rounded-xl transition-colors"
                title="Vider la liste des participants"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="min-h-[40px] inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#E6392F] to-[#F4A91E] hover:opacity-95 rounded-xl shadow-lg shadow-[#E6392F]/25 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 bg-black/25 rounded text-[10px] font-mono border border-white/20">
                N
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Banner officiel de l'événement avec compte à rebours */}
        <EventHeaderBanner />

        {/* Statistiques clés */}
        <StatsBar participants={participants} />

        {/* Section Génération d'équipes */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#11231D] border border-[#224438] shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <Users className="w-4 h-4 text-[#00B4D8]" />
              <span>Génération d&apos;Équipes Équilibrées</span>
            </h2>
            <p className="text-xs text-zinc-300">
              Associe profils forts, moyens et débutants avec répartition paritaire Homme / Femme
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateTeams}
            disabled={participants.length < 3}
            className="min-h-[46px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E6392F] via-[#F4A91E] to-[#00B4D8] hover:opacity-95 rounded-xl shadow-lg shadow-[#E6392F]/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Sparkles className="w-4 h-4 text-white" />
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
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
              Participants & Classement Commits Octobre
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

      {/* Footer officiel de l'événement avec sponsors et coordonnées */}
      <EventFooter />

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
