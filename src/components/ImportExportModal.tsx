'use client';

import React, { useRef, useState } from 'react';
import { Participant } from '@/types/participant';
import { exportToCSV, exportToJSON, parseCSV } from '@/lib/storage';
import { X, Download, Upload, FileText, Database, Sparkles, AlertCircle, Check } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onImport: (newParticipants: Participant[]) => void;
}

const DEMO_PARTICIPANTS: Omit<Participant, 'id' | 'createdAt'>[] = [
  { name: 'Alexandre Dumas', commits: 145, gender: 'male' },
  { name: 'Sarah Connor', commits: 138, gender: 'female' },
  { name: 'Thomas Anderson', commits: 120, gender: 'male' },
  { name: 'Ada Lovelace', commits: 115, gender: 'female' },
  { name: 'Lucas Scott', commits: 98, gender: 'male' },
  { name: 'Camille Claudel', commits: 92, gender: 'female' },
  { name: 'David Bowie', commits: 84, gender: 'male' },
  { name: 'Marie Curie', commits: 76, gender: 'female' },
  { name: 'Antoine Saint-Exupéry', commits: 68, gender: 'male' },
  { name: 'Emma Watson', commits: 62, gender: 'female' },
  { name: 'Maxime Valette', commits: 54, gender: 'male' },
  { name: 'Inès Reg', commits: 48, gender: 'female' },
  { name: 'Julien Doré', commits: 39, gender: 'male' },
  { name: 'Clara Luciani', commits: 31, gender: 'female' },
  { name: 'Nicolas Dupont', commits: 24, gender: 'male' },
  { name: 'Jade Foret', commits: 18, gender: 'female' },
  { name: 'Paul Mirabel', commits: 12, gender: 'male' },
  { name: 'Lucie Bernard', commits: 7, gender: 'female' },
];

export function ImportExportModal({
  isOpen,
  onClose,
  participants,
  onImport,
}: ImportExportModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        let imported: Participant[] = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            imported = parsed.map((item, idx) => ({
              id: item.id || `imported-${Date.now()}-${idx}`,
              name: item.name || `Participant ${idx + 1}`,
              commits: typeof item.commits === 'number' ? item.commits : 0,
              gender: item.gender === 'female' ? 'female' : 'male',
              createdAt: item.createdAt || Date.now() + idx,
            }));
          }
        } else {
          imported = parseCSV(text);
        }

        if (imported.length === 0) {
          setError('Aucun participant valide détecté dans le fichier.');
          return;
        }

        onImport(imported);
        setSuccess(`${imported.length} participants importés avec succès !`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err) {
        setError("Erreur lors de la lecture du fichier. Vérifiez le format.");
      }
    };

    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    const generated: Participant[] = DEMO_PARTICIPANTS.map((item, idx) => ({
      ...item,
      id: `demo-${idx + 1}-${Date.now()}`,
      createdAt: Date.now() + idx,
    }));
    onImport(generated);
    setSuccess('18 participants de démonstration chargés !');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/70 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Import & Export de Données
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mx-5 mt-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-5 mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Exporter */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Exporter les données
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportToCSV(participants)}
                disabled={participants.length === 0}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Format CSV</span>
              </button>
              <button
                type="button"
                onClick={() => exportToJSON(participants)}
                disabled={participants.length === 0}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Format JSON</span>
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4 space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Importer depuis un fichier
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-blue-500 text-xs font-medium text-zinc-200 transition-all"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Choisir un fichier CSV ou JSON...</span>
            </button>
            <p className="text-[11px] text-zinc-300 text-center">
              Format CSV accepté : <code>Nom,Commits,Sexe</code>
            </p>
          </div>

          {/* Démo */}
          <div className="border-t border-zinc-800/60 pt-4">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 hover:border-blue-500/40 text-xs font-medium text-blue-300 transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Charger 18 participants d'exemple (Démo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
