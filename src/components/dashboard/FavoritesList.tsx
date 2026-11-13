import React from 'react';
import { Heart, Trash2 } from 'lucide-react';

interface FavoritesListProps {
  favorites: any[];
  onRemove: (destinationId: string) => void;
}

export default function FavoritesList({ favorites, onRemove }: FavoritesListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <span>Bookmarked Locations</span>
      </h3>

      {favorites.length === 0 ? (
        <p className="text-xs text-slate-400 font-mono py-4">No bookmarked destinations yet.</p>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200/20 dark:border-white/5 rounded-xl">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{fav.destination_name}</span>
              <button
                onClick={() => onRemove(fav.destination_id)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
