'use client';

import React, { useState, useRef } from 'react';
import { Participant } from '@/types/participant';
import { exportToCSV, exportToJSON, parseCSV, parseJSON, DEMO_PARTICIPANTS } from '@/lib/storage';
import {
  Download,
  Upload,
  Database,
  X,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onImport: (participants: Participant[]) => void;
}

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
      const text = event.target?.result as string;
      if (!text) return;

      try {
        let imported: Participant[] = [];
        if (file.name.endsWith('.json')) {
          const raw = parseJSON(text);
          if (Array.isArray(raw)) {
            imported = raw.map((item, idx) => ({
              id: item.id || `imported-${Date.now()}-${idx}`,
              name: String(item.name || 'Participant'),
              commits: Number(item.commits) || 0,
              gender: item.gender === 'female' ? 'female' : 'male',
              githubHandle: item.githubHandle,
              avatarUrl: item.avatarUrl,
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
      } catch {
        setError('Erreur lors de la lecture du fichier. Vérifiez le format.');
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#11231D] border border-[#224438] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#224438] bg-[#0D1B17] shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#00B4D8]" />
            <h2 className="text-sm font-bold text-white">
              Import & Export de Données
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white rounded-xl hover:bg-[#162E26] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#E6392F]/15 border border-[#E6392F]/30 text-[#F27A82] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E6392F]" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Exporter */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider block">
              Exporter les données
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportToCSV(participants)}
                disabled={participants.length === 0}
                className="min-h-[44px] flex items-center justify-center gap-2 p-3 rounded-xl bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] text-xs font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Format CSV</span>
              </button>
              <button
                type="button"
                onClick={() => exportToJSON(participants)}
                disabled={participants.length === 0}
                className="min-h-[44px] flex items-center justify-center gap-2 p-3 rounded-xl bg-[#162E26] hover:bg-[#1C3B31] border border-[#224438] text-xs font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>Format JSON</span>
              </button>
            </div>
          </div>

          <div className="border-t border-[#224438] pt-4 space-y-2">
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider block">
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
              className="min-h-[46px] w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#162E26] hover:bg-[#1C3B31] border border-dashed border-[#224438] hover:border-[#00B4D8] text-xs font-medium text-white transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-[#00B4D8]" />
              <span>Choisir un fichier CSV ou JSON...</span>
            </button>
            <p className="text-[11px] text-zinc-400 text-center">
              Format CSV accepté : <code>Nom,Commits,Sexe</code>
            </p>
          </div>

          {/* Démo */}
          <div className="border-t border-[#224438] pt-4">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#00B4D8]/10 border border-[#00B4D8]/25 hover:border-[#00B4D8]/50 text-xs font-semibold text-[#00B4D8] transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#F4A91E]" />
              <span>Charger 18 participants d&apos;exemple (Démo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
