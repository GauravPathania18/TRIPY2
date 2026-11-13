import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Heart } from 'lucide-react';
import { Destination } from '../../types';

interface DestinationCardProps {
  /**
   * React key supplied by the list renderer. Declared explicitly because this
   * project ships without @types/react (JSX.IntrinsicAttributes has no `key`).
   */
  key?: string;
  destination: Destination;
  index: number;
  isFavorited: boolean;
  isFavLoading: boolean;
  onToggleFavorite: (destId: string, e: React.MouseEvent) => void;
  onSelect: (destination: Destination) => void;
  onMapPin: (destination: Destination) => void;
}

/**
 * Single card inside the horizontal auto-scrolling destination carousel.
 */
export default function DestinationCard({
  destination: dest,
  index,
  isFavorited,
  isFavLoading,
  onToggleFavorite,
  onSelect,
  onMapPin,
}: DestinationCardProps) {
  return (
    <motion.div
      layoutId={`dest-card-${dest.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(dest)}
      className="w-[280px] sm:w-[350px] md:w-[380px] flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-gray-200/30 dark:border-white/5 rounded-2xl overflow-hidden group shadow-md shadow-gray-200/5 dark:shadow-none cursor-pointer relative"
    >
      {/* Photo container */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <img
          src={dest.image_url}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
        {/* Visual vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90"></div>

        {/* Quick Badges inside cards */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[75%]">
          <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider uppercase font-semibold bg-white/10 border border-white/25 backdrop-blur-md text-white">
            {dest.category}
          </span>
          {dest.travel_style && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider uppercase font-semibold bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md text-emerald-200">
              {dest.travel_style}
            </span>
          )}
          {dest.climate && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider uppercase font-semibold bg-orange-500/20 border border-orange-400/30 backdrop-blur-md text-orange-200">
              {dest.climate}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          {/* Pin on Map Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMapPin(dest);
            }}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white hover:text-amber-400 transition active:scale-95"
            title="Pin on Map"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Favorite Button (Heart) */}
          <button
            onClick={(e) => onToggleFavorite(dest.id, e)}
            disabled={isFavLoading}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white hover:text-red-500 transition active:scale-95 disabled:opacity-50"
            title="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Bottom overlay texts */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-center gap-1 text-xs text-slate-300 font-mono mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{dest.city}, {dest.country}</span>
          </div>
          <h3 className="text-xl font-display font-medium mb-1 tracking-tight">{dest.name}</h3>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
            <span>Best: {dest.best_season}</span>
            <span className="text-amber-400 font-bold">{dest.budget_range.split('-')[0]}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
