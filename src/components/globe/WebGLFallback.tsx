import type { CountryData } from './data';

export interface WebGLFallbackProps {
  highlightedCountries: CountryData[];
  selectedCountry: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
}

/**
 * 2D radar / constellation UI shown when WebGL context creation fails.
 */
export default function WebGLFallback({
  highlightedCountries,
  selectedCountry,
  onSelectCountry,
}: WebGLFallbackProps) {
  return (
    <div className="relative w-[500px] h-[500px] max-w-full aspect-square rounded-full border border-slate-800/80 bg-[#020617]/90 flex items-center justify-center overflow-hidden shadow-[inset_0_0_50px_rgba(6,182,212,0.15)]">
      {/* Cybernetic Tech Ticks and Latitude Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      
      {/* Concentric Radar Rings */}
      <div className="absolute w-[90%] h-[90%] rounded-full border border-cyan-500/5 animate-[pulse_6s_infinite]"></div>
      <div className="absolute w-[70%] h-[70%] rounded-full border border-cyan-500/5"></div>
      <div className="absolute w-[50%] h-[50%] rounded-full border border-cyan-500/10"></div>
      <div className="absolute w-[30%] h-[30%] rounded-full border border-cyan-500/5"></div>
      <div className="absolute w-[10%] h-[10%] rounded-full border border-cyan-500/20"></div>

      {/* Compass Crosshair lines */}
      <div className="absolute h-full w-px bg-cyan-500/10"></div>
      <div className="absolute w-full h-px bg-cyan-500/10"></div>

      {/* Flat World Contour Vector SVG to give beautiful continental landmarks */}
      <svg viewBox="0 0 1000 500" className="absolute inset-x-4 inset-y-12 opacity-15 text-cyan-500 pointer-events-none select-none" fill="currentColor">
        {/* Minimalist representation of continents for contextual mapping */}
        {/* North America */}
        <path d="M150,120 Q180,90 280,100 T300,160 T250,220 T200,200 Z" />
        {/* South America */}
        <path d="M250,230 Q280,250 300,320 T280,420 T240,400 T220,300 Z" />
        {/* Africa */}
        <path d="M450,220 Q520,200 580,240 T560,350 T480,380 T440,280 Z" />
        {/* Eurasia */}
        <path d="M380,130 Q450,110 550,100 T750,110 T850,150 T880,220 T700,240 T500,200 Z" />
        {/* Australia */}
        <path d="M780,320 Q840,310 880,340 T850,400 T760,380 Z" />
        {/* Greenland */}
        <path d="M320,50 Q360,40 400,60 T350,90 Z" />
      </svg>

      {/* Live Plotting of Pins */}
      <div className="absolute inset-10">
        {highlightedCountries.map((country) => {
          // Map latitude/longitude to flat mercator/equirectangular coordinates
          // lat: -90 to +90 -> y: 100% to 0%
          // lng: -180 to +180 -> x: 0% to 100%
          const x = ((country.lng + 180) / 360) * 100;
          const y = ((90 - country.lat) / 180) * 100;
          const isSelected = selectedCountry?.id === country.id;

          return (
            <button
              key={country.id}
              onClick={() => onSelectCountry(country)}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-20 group active:scale-95 transition-all cursor-pointer"
            >
              {/* Pulse Effect */}
              <span className={`absolute -inset-4 rounded-full transition-all duration-1000 ${
                isSelected 
                  ? 'bg-amber-500/20 animate-ping' 
                  : 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
              }`} />

              {/* Core Dot */}
              <span className={`block w-3 h-3 rounded-full border-2 border-white transition-all shadow-lg ${
                isSelected 
                  ? 'bg-amber-500 scale-125 shadow-amber-500/50' 
                  : 'bg-cyan-400 group-hover:bg-cyan-300'
              }`} />

              {/* Floating Label */}
              <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border whitespace-nowrap transition-all shadow-md ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-400 scale-105 z-30'
                  : 'bg-slate-950/90 text-cyan-300 border-cyan-500/30 group-hover:border-cyan-400'
              }`}>
                {country.name.replace(/ 📍| ☀️| 🌸| ❄️| 🌤️| 🌧️| 🌊| 🌴| 🌲| ⛈️/g, '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Holographic Radar Sweeper Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent origin-center animate-[spin_10s_linear_infinite] pointer-events-none"></div>

      {/* Offline Telemetry Banner */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/20 text-amber-400 text-[10px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>HOLOGRAPHIC CONSTELLATION COURIER ACTIVE (WEBGL FALLBACK)</span>
        </div>
      </div>
    </div>
  );
}
