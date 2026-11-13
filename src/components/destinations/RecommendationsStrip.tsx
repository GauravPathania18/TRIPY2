import React, { useState } from 'react';
import { Sparkles, MapPin, CloudSun, Wallet } from 'lucide-react';

interface AIRecommendation {
  name: string;
  country: string;
  description: string;
  vibe: string;
  climate: string;
  avgCost: string;
}

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-friendly' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'premium', label: 'Premium' },
];

const DURATION_OPTIONS = ['3', '5', '7', '10'];

/**
 * AI recommendations strip rendered above the filter panel.
 * POST /api/gemini/recommendations (server ships its own offline fallback,
 * so this only surfaces an inline error for genuinely broken responses).
 */
export default function RecommendationsStrip() {
  const [budget, setBudget] = useState('mid');
  const [days, setDays] = useState('5');
  const [picks, setPicks] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetPicks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, days: Number(days) }),
      });
      if (!res.ok) {
        throw new Error(`Recommendation service responded with ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No recommendations returned. Please try again.');
      }
      setPicks(data.slice(0, 5));
    } catch (err: any) {
      console.error('AI recommendations failed', err);
      setPicks([]);
      setError(err.message || 'AI concierge is unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="bg-[#0b1329] border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-2xl mb-8 text-white"
      id="trippy-ai-recommendations"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">AI Curated Picks</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your budget and trip length — the concierge returns five destinations matched to you.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Budget</span>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-[#030712] border border-slate-800/60 rounded-xl text-sm text-white px-4 py-2.5 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Duration</span>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="bg-[#030712] border border-slate-800/60 rounded-xl text-sm text-white px-4 py-2.5 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} days</option>
              ))}
            </select>
          </label>

          <button
            onClick={handleGetPicks}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 mt-auto text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Curating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get AI Picks</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs font-mono text-red-400 mb-4">{error}</p>
      )}

      {/* Loading skeleton / animated dots */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" aria-busy="true">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0e172a] border border-slate-800/60 p-5 space-y-3 animate-pulse"
            >
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
              <div className="h-3 bg-slate-800/70 rounded w-1/2"></div>
              <div className="h-3 bg-slate-800/50 rounded w-full"></div>
              <div className="h-3 bg-slate-800/50 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && picks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {picks.map((pick, idx) => (
            <RecommendationCard key={`${pick.name}-${idx}`} pick={pick} />
          ))}
        </div>
      )}

      {!loading && picks.length === 0 && !error && (
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
          Awaiting your preferences to curate five destinations
        </p>
      )}
    </section>
  );
}

function RecommendationCard({
  pick,
}: {
  pick: AIRecommendation;
  /** Declared explicitly: no @types/react in this project (no JSX `key` support). */
  key?: string;
}) {
  return (
    <article className="rounded-2xl bg-[#0e172a] border border-slate-800/60 p-5 flex flex-col gap-2 hover:border-amber-500/40 transition">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white leading-snug">{pick.name}</h3>
        <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono uppercase tracking-wider bg-amber-500/15 border border-amber-500/25 text-amber-400 flex-shrink-0">
          {pick.vibe}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
        <MapPin className="w-3 h-3 text-amber-500" />
        <span>{pick.country}</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
        <CloudSun className="w-3 h-3 text-orange-400" />
        <span>{pick.climate}</span>
      </div>
      <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
        <Wallet className="w-3 h-3" />
        <span>{pick.avgCost}</span>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-400 mt-1">{pick.description}</p>
    </article>
  );
}
