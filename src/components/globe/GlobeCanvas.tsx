import type { CountryData } from './data';

export interface GlobeCanvasProps {
  canvasRef: { current: HTMLCanvasElement | null };
  highlightedCountries: CountryData[];
  selectedCountry: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
  onHoverChange: (hovered: boolean) => void;
}

/**
 * The WebGL globe canvas plus the absolutely-positioned HTML country labels
 * that the scene module projects onto every frame.
 */
export default function GlobeCanvas({
  canvasRef,
  highlightedCountries,
  selectedCountry,
  onSelectCountry,
  onHoverChange,
}: GlobeCanvasProps) {
  return (
    <div 
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className="relative p-4 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.15)]"
    >
      <canvas
        id="globe-canvas"
        ref={canvasRef}
        width={500}
        height={500}
        className="cursor-grab active:cursor-grabbing max-w-full rounded-full touch-none"
        title="Drag to rotate, click country pins to explore"
      />
      
      {/* Absolute high-performance overlay container for projected pin badges */}
      <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden m-4">
        {highlightedCountries.map((country) => {
          const isSelected = selectedCountry?.id === country.id;
          return (
            <div
              key={country.id}
              id={`globe-pin-label-${country.id}`}
              style={{ position: 'absolute', left: 0, top: 0, opacity: 0, transition: 'opacity 0.25s' }}
              className="pointer-events-none"
            >
              <button
                onClick={() => onSelectCountry(country)}
                className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-tight shadow-2xl transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white border border-amber-400 scale-110 z-20 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900/90 text-cyan-300 border border-cyan-500/30 hover:bg-slate-800 hover:border-cyan-400 scale-100 hover:scale-105 z-10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-cyan-400'}`}></span>
                {country.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
