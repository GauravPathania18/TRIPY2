import React from 'react';
import { Search } from 'lucide-react';
import { Destination } from '../../types';
import DiscoverAIBar from './DiscoverAIBar';

interface DestinationFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
  maxBudget: number;
  setMaxBudget: (value: number) => void;
  activeTravelStyle: string;
  setActiveTravelStyle: (value: string) => void;
  activeClimate: string;
  setActiveClimate: (value: string) => void;
  /** Called with the newly discovered destination (opens its modal). */
  onDiscovered: (destination: Destination) => void | Promise<void>;
}

/**
 * The dark filter toolbar: search, category chips, budget slider,
 * travel-style / climate selectors and the "Discover with AI" call-to-action.
 */
export default function DestinationFilters({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  maxBudget,
  setMaxBudget,
  activeTravelStyle,
  setActiveTravelStyle,
  activeClimate,
  setActiveClimate,
  onDiscovered,
}: DestinationFiltersProps) {
  return (
    <div className="bg-[#0b1329] border border-slate-800/80 rounded-[28px] p-8 shadow-2xl mb-12 text-white" id="trippy-filter-panel">
      {/* Custom Slider Thumb Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        #trippy-budget-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f59e0b;
          border: 3px solid #ffffff;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        #trippy-budget-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.8);
        }
        #trippy-budget-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f59e0b;
          border: 3px solid #ffffff;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        #trippy-budget-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.8);
        }
      `}} />

      <div className="flex flex-col gap-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country, city, or coast..."
            className="w-full pl-14 pr-5 py-4 bg-[#030712] border border-slate-800/60 rounded-2xl text-base text-white placeholder-slate-500 transition focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />
        </div>

        {/* Category selection */}
        <div className="flex flex-wrap gap-2.5">
          {['all', 'beach', 'mountains', 'adventure', 'family'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
                  : 'bg-[#0e172a] hover:bg-slate-800 border border-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Budget Range Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono tracking-wider text-slate-400">
            <span>MAX BUDGET</span>
            <span className="text-amber-400 font-bold text-sm">₹{maxBudget.toLocaleString('en-IN')}</span>
          </div>
          <div className="relative flex items-center h-6">
            <input
              id="trippy-budget-slider"
              type="range"
              min="15000"
              max="300000"
              step="5000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((maxBudget - 15000) / (300000 - 15000)) * 100}%, #ffffff ${((maxBudget - 15000) / (300000 - 15000)) * 100}%, #ffffff 100%)`
              }}
              className="w-full h-[6px] rounded-full appearance-none cursor-pointer focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Row Divider */}
        <div className="border-t border-slate-800/80 my-1"></div>

        {/* Travel Style Selector */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <span className="w-32 flex-shrink-0 text-xs font-mono text-slate-400 uppercase tracking-widest">Travel Style:</span>
          <div className="flex flex-wrap gap-2.5">
            {[
              { value: 'all', label: 'All Styles' },
              { value: 'luxury', label: 'Luxury ✨' },
              { value: 'adventure', label: 'Adventure 🧭' },
              { value: 'budget', label: 'Budget 💰' }
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setActiveTravelStyle(style.value)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTravelStyle === style.value
                    ? style.value === 'all'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/10'
                      : 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-[#0e172a] hover:bg-slate-800 border border-slate-800/40 text-slate-300'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Climate Selector */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <span className="w-32 flex-shrink-0 text-xs font-mono text-slate-400 uppercase tracking-widest">Climate Zone:</span>
          <div className="flex flex-wrap gap-2.5">
            {[
              { value: 'all', label: 'All Climates' },
              { value: 'tropical', label: 'Tropical 🌴' },
              { value: 'alpine', label: 'Alpine 🏔️' },
              { value: 'moderate', label: 'Moderate 🌤️' },
              { value: 'desert', label: 'Desert 🌵' }
            ].map((climate) => (
              <button
                key={climate.value}
                onClick={() => setActiveClimate(climate.value)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeClimate === climate.value
                    ? climate.value === 'all'
                      ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-500/10'
                      : 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-[#0e172a] hover:bg-slate-800 border border-slate-800/40 text-slate-300'
                }`}
              >
                {climate.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini AI Discover Destination Assistant */}
        {searchQuery.trim() && (
          <DiscoverAIBar query={searchQuery} onDiscovered={onDiscovered} />
        )}
      </div>
    </div>
  );
}
