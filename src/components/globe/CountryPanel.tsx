import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, CloudSun, MapPin, Plane, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { fetchWithRetry } from '../../utils/api';
import type { CountryData } from './data';

export interface CountryPanelProps {
  selectedCountry: CountryData | null;
  isLocating: boolean;
  locationError: string | null;
  onLocateUser: () => void;
}

/**
 * "LOCATE ME" trigger button + error message, shown underneath the globe canvas.
 */
export function LocateMeButton({
  onClick,
  isLocating,
  locationError,
}: {
  onClick: () => void;
  isLocating: boolean;
  locationError: string | null;
}) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={isLocating}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-bold tracking-wider shadow-2xl hover:shadow-cyan-500/10 hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
        id="globe-locate-me-button"
      >
        <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce text-cyan-400' : 'text-cyan-400'}`} />
        <span>{isLocating ? 'DETERMINING GEOLOCATION...' : 'LOCATE ME'}</span>
      </button>
      {locationError && (
        <p className="text-rose-400 text-xs mt-1 font-mono border border-rose-500/10 bg-rose-500/5 px-3 py-1 rounded-full">{locationError}</p>
      )}
    </div>
  );
}

/**
 * Right-hand telemetry panel: live weather card, cities, attractions,
 * tour packages, flight price rows, plus the empty-state locate prompt.
 */
export default function CountryPanel({
  selectedCountry,
  isLocating,
  locationError,
  onLocateUser,
}: CountryPanelProps) {
  // Live weather states for selected country on the globe
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch real-time live weather when selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      const fetchCountryWeather = async () => {
        setWeatherLoading(true);
        setWeatherData(null);
        try {
          // Use first city if available, otherwise country name
          const city = selectedCountry.cities && selectedCountry.cities.length > 0 
            ? selectedCountry.cities[0] 
            : selectedCountry.name;
          const lat = selectedCountry.lat;
          const lon = selectedCountry.lng;
          const res = await fetchWithRetry(`/api/weather?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setWeatherData(data);
          }
        } catch (err) {
          console.error("Failed to fetch globe country weather", err);
        } finally {
          setWeatherLoading(false);
        }
      };
      fetchCountryWeather();
    } else {
      setWeatherData(null);
    }
  }, [selectedCountry?.id]);

  return (
    <AnimatePresence mode="wait">
      {selectedCountry ? (
        <motion.div
          key={selectedCountry.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
          id={`country-panel-${selectedCountry.id}`}
        >
          <div className="flex items-center justify-between gap-3 mb-6 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-white">{selectedCountry.name}</h3>
                <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">Target Focus Location</p>
              </div>
            </div>
            <div className="opacity-15 pointer-events-none shrink-0 pr-1">
              <Globe className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>

          {/* Weather Intelligence widget */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-slate-300 font-display block">Live Weather Intelligence</span>
                  {weatherLoading ? (
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5 animate-pulse">
                      Locating real-time coordinate feed...
                    </span>
                  ) : weatherData ? (
                    <span className="text-[10px] text-cyan-400/90 font-mono block mt-0.5">
                      Real-time data for: <strong className="text-slate-200 font-medium">{weatherData.city || selectedCountry.name}</strong>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      Seasonal average climate overview
                    </span>
                  )}
                </div>
              </div>
              {weatherLoading ? (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
                  <span>Live...</span>
                </div>
              ) : weatherData ? (
                <span className="text-sm font-mono font-semibold text-white bg-slate-900 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shrink-0">
                  <span className="text-cyan-400 font-bold">{weatherData.temp}°C</span>
                  <span className="text-slate-600">|</span>
                  <span className="capitalize text-slate-200">{weatherData.description}</span>
                  <span>
                    {(() => {
                      const desc = weatherData.description.toLowerCase();
                      if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
                      if (desc.includes('snow') || desc.includes('ice') || desc.includes('freeze')) return '❄️';
                      if (desc.includes('cloud') || desc.includes('overcast')) return '☁️';
                      if (desc.includes('clear') || desc.includes('sun') || desc.includes('warm')) return '☀️';
                      if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
                      if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
                      return '🌤️';
                    })()}
                  </span>
                </span>
              ) : (
                <span className="text-sm font-mono font-medium text-white bg-slate-900 px-3 py-1 rounded-full border border-white/10 shrink-0">
                  {selectedCountry.weather}
                </span>
              )}
            </div>
            {/* Secondary real-time details */}
            {weatherData && (
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2 mt-2">
                <span className="flex items-center gap-1">💨 Wind Speed: <strong className="text-slate-200">{weatherData.wind_speed} m/s</strong></span>
                <span className="flex items-center gap-1">💧 Live Humidity: <strong className="text-slate-200">{weatherData.humidity}%</strong></span>
              </div>
            )}
          </div>

          {/* Prime Hubs / Cities */}
          <div className="mb-6">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Prime Hubs & Cities</h4>
            <div className="flex flex-wrap gap-2">
              {(selectedCountry.cities || []).map((city) => (
                <a
                  key={city}
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${city}, ${selectedCountry.name || ''} best places, what is importance of that place, best time and things related to be known before go to travel there`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 flex items-center gap-1.5 hover:border-cyan-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  {city}
                </a>
              ))}
            </div>
          </div>

          {/* Famous Travel Spots / Attractions */}
          <div className="mb-6">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Famous Travel Spots</h4>
            <div className="flex flex-wrap gap-2">
              {(selectedCountry.attractions || []).map((spot) => (
                <a
                  key={spot}
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${spot}, ${selectedCountry.name || ''} best places, what is importance of that place, best time and things related to be known before go to travel there`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-cyan-300 flex items-center gap-1.5 hover:border-cyan-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {spot}
                </a>
              ))}
            </div>
          </div>

          {/* Custom Tour Packages */}
          <div className="mb-6">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Custom Tour Packages</h4>
            <div className="space-y-2">
              {(selectedCountry.packages || []).map((pkg) => (
                <div key={pkg} className="flex items-center gap-2.5 text-sm text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-white/5 hover:bg-slate-950 transition">
                  <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{pkg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Flights */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Live flight estimations</h4>
            <div className="space-y-2">
              {(selectedCountry.flights || []).map((flight) => (
                <div key={flight} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Plane className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
                    <span>Transit</span>
                  </div>
                  <span className="text-white font-medium">{flight}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 sm:p-12 text-center text-slate-400 backdrop-blur-sm shadow-xl flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-cyan-500/80 mb-4 animate-pulse" />
          <p className="mb-6 text-sm sm:text-base text-slate-300 leading-relaxed">
            Click on a country on the rotating globe to display curated travel plans, flight estimates, and live climate forecasts.
          </p>
          
          <div className="w-full h-px bg-white/10 my-4" />
          
          <p className="text-[10px] text-slate-500 mb-4 uppercase font-mono tracking-wider">Or explore your local surroundings</p>
          
          <button
            onClick={onLocateUser}
            disabled={isLocating}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>{isLocating ? 'Locating...' : 'Detect My Location'}</span>
          </button>

          {locationError && (
            <p className="text-rose-400 text-xs mt-3 font-mono border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 rounded-lg max-w-xs">{locationError}</p>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
