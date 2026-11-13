import React from 'react';
import { Sparkles, MapPin, Calendar, Users } from 'lucide-react';

const INTEREST_OPTIONS = ['Beach', 'Culture', 'Food', 'Adventure', 'Shopping', 'Nightlife', 'Anime'];

const MODEL_OPTIONS = [
  { id: 'gemini-3.5-flash', label: '3.5 Flash', desc: 'Capable & Free' },
  { id: 'gemini-3.1-flash-lite', label: '3.1 Flash Lite', desc: 'Speed / Lite' },
  { id: 'gemini-2.5-flash', label: '2.5 Flash', desc: 'Reliable Standard' },
  { id: 'gemini-1.5-flash', label: '1.5 Flash', desc: 'High Capacity Backup' },
  { id: 'simulated-cognitive-node', label: 'Simulated Node', desc: 'Always Free Fallback' }
];

interface PlannerFormProps {
  destination: string;
  setDestination: (v: string) => void;
  budget: number;
  setBudget: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  travelers: number;
  setTravelers: (v: number) => void;
  selectedInterests: string[];
  onToggleInterest: (interest: string) => void;
  customPrompt: string;
  setCustomPrompt: (v: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PlannerForm({
  destination,
  setDestination,
  budget,
  setBudget,
  duration,
  setDuration,
  travelers,
  setTravelers,
  selectedInterests,
  onToggleInterest,
  customPrompt,
  setCustomPrompt,
  aiModel,
  setAiModel,
  loading,
  onSubmit
}: PlannerFormProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/15">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">
              AI Travel Workspace
            </h2>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Powered by {aiModel === 'simulated-cognitive-node' ? 'Simulated Offline Node' : 'Live Gemini AI Network'}
            </p>
          </div>
        </div>

        {/* Model Selector Widget */}
        <div className="bg-gray-100 dark:bg-slate-950 p-1 rounded-xl border border-gray-200/50 dark:border-white/10 flex flex-wrap items-center gap-1 self-start md:self-auto">
          {MODEL_OPTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAiModel(m.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                aiModel === m.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title={`${m.label} (${m.desc})`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Destination */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">TARGET DESTINATION</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Japan..."
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">BUDGET ESTIMATE (₹)</label>
            <div className="relative">
              <input
                type="number"
                min="20000"
                max="1000000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs rounded-xl text-slate-900 dark:text-white font-mono font-semibold"
              />
            </div>
          </div>

          {/* Duration Days */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">STAY DURATION</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs rounded-xl text-slate-900 dark:text-white"
              >
                {[3, 4, 5, 7, 10, 14].map((d) => (
                  <option key={d} value={d}>{d} Days</option>
                ))}
              </select>
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">GUESTS / VISITORS</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs rounded-xl text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((t) => (
                  <option key={t} value={t}>{t} traveler{t > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories of interests */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-2.5">Focus Interests</label>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map((opt) => {
              const selected = selectedInterests.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => onToggleInterest(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selected
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                      : 'bg-gray-50 dark:bg-slate-950 text-slate-500 hover:bg-gray-100 border border-gray-200/50 dark:border-white/10'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt box */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Custom Directives (Optional)</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Include vegetarian Goan curry options, focus on beach yoga or private historical temple guides..."
            className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none h-20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
          <span>{loading ? 'Consulting Travel Nodes...' : 'Generate Custom Travel Plan'}</span>
        </button>
      </form>
    </div>
  );
}
