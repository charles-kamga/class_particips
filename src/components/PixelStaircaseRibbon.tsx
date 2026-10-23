import React from 'react';

interface PixelStaircaseRibbonProps {
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * PixelStaircaseRibbon
 * Reproduit la frise graphique pixel art de l'affiche officielle Hacktoberfest Yaoundé 26.
 * Compose un ruban d'escalier de commits avec les couleurs signatures :
 * Rouge brique (#E6392F), Jaune ambre (#F4A91E), Rose rétro (#F27A82), Bleu ardoise (#4D7ECE), Vert forêt (#1E3F35).
 */
export function PixelStaircaseRibbon({
  position = 'top',
  className = '',
}: PixelStaircaseRibbonProps) {
  // Définition de blocs de pixels reproduisant fidèlement l'alternance de la frise de l'affiche
  const blocks = [
    { color: '#E6392F', h: 18, offset: 0 },
    { color: '#E6392F', h: 24, offset: 4 },
    { color: '#F4A91E', h: 20, offset: 8 },
    { color: '#F4A91E', h: 28, offset: 12 },
    { color: '#F27A82', h: 16, offset: 8 },
    { color: '#4D7ECE', h: 22, offset: 14 },
    { color: '#00B4D8', h: 26, offset: 18 },
    { color: '#1B3B32', h: 18, offset: 12 },
    { color: '#E6392F', h: 24, offset: 6 },
    { color: '#F4A91E', h: 20, offset: 10 },
    { color: '#F27A82', h: 28, offset: 16 },
    { color: '#4D7ECE', h: 22, offset: 12 },
    { color: '#00B4D8', h: 18, offset: 8 },
    { color: '#E6392F', h: 26, offset: 14 },
    { color: '#F4A91E', h: 22, offset: 18 },
    { color: '#1B3B32', h: 30, offset: 22 },
  ];

  return (
    <div
      className={`w-full overflow-hidden select-none pointer-events-none flex items-end ${
        position === 'bottom' ? 'rotate-180' : ''
      } ${className}`}
      aria-hidden="true"
    >
      <div className="w-full flex items-end justify-between min-w-[700px] h-8 opacity-90">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col justify-end"
            style={{ height: '32px' }}
          >
            <div
              style={{
                backgroundColor: block.color,
                height: `${block.h}px`,
                marginBottom: `${block.offset}px`,
              }}
              className="w-full transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
