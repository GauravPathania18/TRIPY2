import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface SavedTripItem {
  id: string;
  destination: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  itinerary?: any;
  packing_list?: string[];
}

interface SavedTripsSidebarProps {
  user: any | null;
  setTab: (tab: string) => void;
  savedTrips: SavedTripItem[];
  onSelectTrip: (result: any) => void;
  onDeleteTrip: (id: string) => Promise<boolean>;
  onQuickStarter: (destination: string, budget: number, days: number, guests: number, interests: string[]) => void;
}

export default function SavedTripsSidebar({
  user,
  setTab,
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
  onQuickStarter
}: SavedTripsSidebarProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const errorTimer = useRef<any>(null);

  // Auto-clear the transient delete error message
  useEffect(() => {
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  const showTransientError = (msg: string) => {
    setDeleteError(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setDeleteError(null), 3500);
  };

  const handleDeleteClick = async (e: React.MouseEvent, trip: SavedTripItem) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved trip?')) return;
    const ok = await onDeleteTrip(trip.id);
    if (!ok) {
      showTransientError('Could not delete this trip. Please try again.');
    }
  };

  return (
    <>
      {/* Saved Travel Plans */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
          <span>Saved Travel Plans</span>
        </h3>

        {!user ? (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-slate-400">
            <p className="mb-2">Sign in to save and sync your travel plans.</p>
            <button onClick={() => setTab('login')} className="text-amber-500 font-semibold hover:underline">
              Login Now
            </button>
          </div>
        ) : savedTrips.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-4">No saved trips yet. Generate your first signature travel plan!</p>
        ) : (
          <>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip({
                    destination: trip.destination,
                    duration: Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
                    budget: trip.budget,
                    itinerary: trip.itinerary,
                    packing_list: trip.packing_list || ['Comfortable footwear', 'All-weather jackets', 'Identities & Documents'],
                    weather_tips: 'Moderate climate expected. Check live forecasting for daily updates.'
                  })}
                  className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-gray-200/30 dark:border-white/5 rounded-xl transition cursor-pointer text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{trip.destination}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">₹{trip.budget?.toLocaleString()} Budget</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete saved trip"
                      title="Delete saved trip"
                      onClick={(e) => handleDeleteClick(e, trip)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {deleteError && (
              <p className="mt-2 text-[10px] font-mono text-red-500">{deleteError}</p>
            )}
          </>
        )}
      </div>

      {/* Quick Starters Widget */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Quick Starters</h3>
        <div className="space-y-2.5">
          <button
            onClick={() => onQuickStarter('Japan', 140000, 7, 2, ['Culture', 'Anime', 'Food'])}
            className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-amber-500/5 border border-gray-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 transition"
          >
            🌸 Tokyo Cyber-Punk Trail (7d, ₹1.4L)
          </button>
          <button
            onClick={() => onQuickStarter('Goa Coastline', 50000, 5, 2, ['Beach', 'Food', 'Nightlife'])}
            className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-amber-500/5 border border-gray-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 transition"
          >
            🏝️ Private South Goa Sunset (5d, ₹50k)
          </button>
          <button
            onClick={() => onQuickStarter('Switzerland', 280000, 8, 2, ['Adventure', 'Culture'])}
            className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-amber-500/5 border border-gray-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 transition"
          >
            🏔️ Alpine Scenic Express (8d, ₹2.8L)
          </button>
        </div>
      </div>
    </>
  );
}
