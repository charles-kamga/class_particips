import React from 'react';

interface PixelStaircaseRibbonProps {
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * PixelStaircaseRibbon
 * Reproduit la frise graphique pixel art avec les couleurs exactes de tous.svg :
 * - Rouge : #E53927
 * - Jaune/Or : #F5B726
 * - Bleu doux : #6DA3E0
 * - Rose rétro : #E97B77
 * - Bordeaux profond : #671912
 * - Vert forêt : #1B3B32
 */
export function PixelStaircaseRibbon({
  position = 'top',
  className = '',
}: PixelStaircaseRibbonProps) {
  const blocks = [
    { color: '#E53927', h: 18, offset: 0 },
    { color: '#671912', h: 22, offset: 4 },
    { color: '#E53927', h: 26, offset: 6 },
    { color: '#F5B726', h: 20, offset: 10 },
    { color: '#F5B726', h: 28, offset: 14 },
    { color: '#E97B77', h: 16, offset: 8 },
    { color: '#6DA3E0', h: 24, offset: 16 },
    { color: '#6DA3E0', h: 28, offset: 18 },
    { color: '#1B3B32', h: 18, offset: 12 },
    { color: '#E53927', h: 24, offset: 8 },
    { color: '#671912', h: 20, offset: 6 },
    { color: '#F5B726', h: 22, offset: 12 },
    { color: '#E97B77', h: 26, offset: 16 },
    { color: '#6DA3E0', h: 22, offset: 14 },
    { color: '#E53927', h: 26, offset: 16 },
    { color: '#F5B726', h: 22, offset: 18 },
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
