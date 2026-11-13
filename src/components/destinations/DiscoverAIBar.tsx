import React, { useState } from 'react';
import { Destination } from '../../types';

interface DiscoverAIBarProps {
  /** The active search query used as the discovery prompt. */
  query: string;
  /** Called with the freshly created destination once AI discovery succeeds. */
  onDiscovered: (destination: Destination) => void | Promise<void>;
}

/**
 * "Discover with AI" call-to-action shown inside the filter panel while a
 * search query is present. POSTs to /api/gemini/discover-destination, refreshes
 * the destination list and opens the newly persisted record.
 */
export default function DiscoverAIBar({ query, onDiscovered }: DiscoverAIBarProps) {
  const [aiDiscoverLoading, setAiDiscoverLoading] = useState(false);
  const [aiDiscoverError, setAiDiscoverError] = useState('');

  const handleAIDiscover = async () => {
    if (!query.trim()) return;
    setAiDiscoverLoading(true);
    setAiDiscoverError('');
    try {
      const res = await fetch('/api/gemini/discover-destination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to discover destination via AI');
      }
      const data = await res.json();

      // Hand the new destination back so the parent can refresh the list
      // and open the newly discovered destination modal immediately.
      await onDiscovered(data);
    } catch (err: any) {
      console.error('AIDiscover error:', err);
      setAiDiscoverError(err.message || 'AI exploration node failed to respond.');
    } finally {
      setAiDiscoverLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-700/10 border border-amber-500/20 shadow-inner mt-2">
      <div className="flex items-start gap-3">
        <span className="flex h-2.5 w-2.5 relative mt-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <div className="text-sm">
          <span className="font-semibold text-white block sm:inline">Can't find your dream destination?</span>{' '}
          <span className="text-slate-300 block sm:inline">
            Let Gemini AI dynamically explore & build a premium, persisted guide for{' '}
            <span className="font-semibold text-amber-400">"{query}"</span>.
          </span>
          {aiDiscoverError && (
            <p className="text-xs text-red-400 mt-1.5 font-mono">{aiDiscoverError}</p>
          )}
        </div>
      </div>
      <button
        onClick={handleAIDiscover}
        disabled={aiDiscoverLoading}
        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer self-start md:self-auto"
      >
        {aiDiscoverLoading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Exploring Spatially...</span>
          </>
        ) : (
          <>
            <span>Discover with AI ✨</span>
          </>
        )}
      </button>
    </div>
  );
}
