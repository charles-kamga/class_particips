'use client';

import React from 'react';
import { PixelStaircaseRibbon } from './PixelStaircaseRibbon';
import { Phone, Mail } from 'lucide-react';

export function EventFooter() {
  const sponsors = [
    { name: 'OSS CAMEROON', badge: 'Communauté Open Source' },
    { name: 'TSG', badge: 'Partenaire Tech' },
  ];

  return (
    <footer
      id="event-sponsors-footer"
      data-section="sponsors-footer"
      className="mt-12 border-t border-[#224438] bg-[#0B1713] relative overflow-hidden"
    >
      {/* Ruban Pixel Staircase inversé */}
      <PixelStaircaseRibbon position="bottom" className="opacity-70 mb-6" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-8">
        {/* Section Partenaires & Sponsors */}
        <div id="sponsors-section" data-element="sponsors-list" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Nos Partenaires & Sponsors
            </span>
            <div className="h-px flex-1 bg-[#224438]" />
          </div>

          <div id="sponsors-grid" className="grid grid-cols-2 sm:grid-cols-2 max-w-md gap-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="p-3 rounded-md bg-[#11231D] border border-[#224438] flex flex-col items-center justify-center text-center hover:border-[#00B4D8]/40 transition-colors group"
              >
                <span className="font-bold text-sm text-white group-hover:text-[#00B4D8] transition-colors tracking-wide">
                  {sponsor.name}
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {sponsor.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coordonnées & Informations Modulis Tech */}
        <div className="pt-6 border-t border-[#1C3B31] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          {/* Contacts Modulis */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
            <a
              href="tel:+237691089920"
              className="inline-flex items-center gap-1.5 hover:text-[#00B4D8] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span className="font-mono text-zinc-200">+237 691 089 920</span>
            </a>

            <a
              href="mailto:hello@modulis.tech"
              className="inline-flex items-center gap-1.5 hover:text-[#00B4D8] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span className="font-mono text-zinc-200">hello@modulis.tech</span>
            </a>
          </div>

          {/* Mentions légales & performance */}
          <div className="text-center md:text-right space-y-0.5">
            <p className="text-zinc-300 font-medium flex items-center justify-center md:justify-end gap-1.5">
              <span>Modulis Team Balancer</span>
              <span>•</span>
              <span className="text-[#00B4D8]">Hacktoberfest Yaoundé 26</span>
            </p>
            <p className="text-[11px] text-zinc-400">
              Conçu pour Vercel, offline-first & parité garantie
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
