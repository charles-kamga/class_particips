'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { PixelStaircaseRibbon } from './PixelStaircaseRibbon';

export function EventHeaderBanner() {
  const [daysLeft, setDaysLeft] = useState<number>(9);

  // Calcul du nombre de jours restants jusqu'au 31 octobre
  useEffect(() => {
    const calculateDaysToGo = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 9, 31, 10, 0, 0); // 31 Octobre à 10:00

      // Si le 31 octobre de cette année est déjà passé, prendre l'année suivante
      if (now.getTime() > targetDate.getTime()) {
        targetDate = new Date(currentYear + 1, 9, 31, 10, 0, 0);
      }

      const diffMs = targetDate.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    };

    calculateDaysToGo();
    const interval = setInterval(calculateDaysToGo, 60000 * 60); // actualisation toutes les heures
    return () => clearInterval(interval);
  }, []);

  const formattedDays = daysLeft < 10 ? `0${daysLeft}` : `${daysLeft}`;

  return (
    <div
      id="event-banner-card"
      data-component="event-header-banner"
      className="relative overflow-hidden rounded-lg bg-[#11231D] border border-[#224438] shadow-2xl transition-all"
    >
      {/* Ruban Pixel Staircase supérieur */}
      <PixelStaircaseRibbon position="top" className="opacity-80" />

      {/* Fond texture calendrier discret */}
      <div className="absolute inset-0 bg-calendar-grid opacity-30 pointer-events-none" />

      {/* Contenu principal */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          
          {/* Bloc Marque & Titre de l'événement */}
          <div id="banner-brand-info" data-element="brand-info" className="flex-1 space-y-3.5">
            {/* Logo Modulis */}
            <div id="banner-modulis-logo" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#00B4D8]/15 border border-[#00B4D8]/40 flex items-center justify-center text-[#00B4D8] font-black text-sm tracking-tighter shadow-sm">
                M
              </div>
              <div>
                <span className="font-extrabold tracking-wider text-xs sm:text-sm text-white uppercase block">
                  MODULIS
                </span>
                <span className="text-[10px] text-[#00B4D8] font-medium block -mt-0.5 tracking-tight">
                  Construisons ensemble vos solutions
                </span>
              </div>
            </div>

            {/* Titre Principal (sans le badge token AI + HACKFEST) */}
            <div id="banner-event-title">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white uppercase leading-tight">
                HACKTOBERFEST <span className="text-[#00B4D8]">YAOUNDÉ</span>{' '}
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#162E26] border border-[#224438] text-[#F4A91E] font-mono text-base sm:text-xl">
                  26
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                Matchmaking intelligent d&apos;équipes de 3 pour le hackathon. Équilibre des commits d&apos;octobre et parité de genre en temps réel.
              </p>
            </div>

            {/* Badges Pratiques (Date, Heure, Lieu) */}
            <div id="banner-practical-details" className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-300">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#162E26] border border-[#224438]">
                <Calendar className="w-3.5 h-3.5 text-[#F4A91E]" />
                <span className="font-medium text-white">Samedi 31 Octobre</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#162E26] border border-[#224438]">
                <Clock className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>10:00 - 16:00</span>
                <span className="text-[10px] text-zinc-400 font-mono">(En présentiel)</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#162E26] border border-[#224438]">
                <MapPin className="w-3.5 h-3.5 text-[#E6392F]" />
                <span>Yaoundé, Centre</span>
              </div>
            </div>
          </div>

          {/* Note Pinned Hack Day Count Down */}
          <div id="banner-countdown-widget" data-element="countdown-widget" className="flex flex-col items-center justify-center shrink-0">
            {/* Badge Titre "Hack day count down" */}
            {/* <div id="countdown-badge-title" className="px-3 py-1 rounded-md bg-[#0D1B17] border border-[#224438] text-white text-[11px] font-bold tracking-wide uppercase shadow-sm mb-[-10px] z-20">
              Hack day count down
            </div> */}

            {/* Papier Post-It blanc avec punaise dorée */}
            <div id="pinned-postit-note" data-element="pinned-postit" className="relative bg-white text-[#11231D] rounded-lg p-4 sm:p-5 w-44 sm:w-48 text-center pinned-card-shadow transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Punaise dorée 📌 */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center drop-shadow-md z-30">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#D98200] via-[#F4A91E] to-[#FFF0A0] shadow-md border border-[#9A5B00] relative">
                  <div className="absolute inset-0.5 rounded-full bg-white/40 blur-[0.5px]" />
                </div>
              </div>

              {/* Chiffre Pixel Art Rouge */}
              <div id="countdown-pixel-days" className="pt-2 font-mono font-black text-4xl sm:text-5xl text-[#E6392F] tracking-tighter leading-none select-none">
                {formattedDays}
              </div>

              {/* Libellé "DAYS TO GO" */}
              <div className="mt-1.5 text-[10px] sm:text-xs font-black tracking-widest text-[#162E26] uppercase">
                DAYS TO GO
              </div>

              <div className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                Avant le Hackathon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
