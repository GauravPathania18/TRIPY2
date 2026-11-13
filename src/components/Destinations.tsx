import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass } from 'lucide-react';
import { Destination } from '../types';
import { fetchWithRetry } from '../utils/api';
import MapModal from './MapModal';
import DestinationFilters from './destinations/DestinationFilters';
import DestinationCard from './destinations/DestinationCard';
import DestinationModal from './destinations/DestinationModal';
import RecommendationsStrip from './destinations/RecommendationsStrip';
import { useInfiniteCarousel } from './destinations/useInfiniteCarousel';
import { useFavorites } from './destinations/useFavorites';

interface DestinationsProps {
  setTab: (tab: string) => void;
  user: any | null;
  isHome?: boolean;
}

export default function Destinations({ setTab, user, isHome = false }: DestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(300000);
  const [activeTravelStyle, setActiveTravelStyle] = useState<string>('all');
  const [activeClimate, setActiveClimate] = useState<string>('all');
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [mapTargetDest, setMapTargetDest] = useState<Destination | null>(null);

  const { favorites, favLoading, toggleFavorite } = useFavorites(user, setTab);

  const {
    containerRef, handleMouseEnter, handleMouseLeave, handleTouchStart, handleContainerClick
  } = useInfiniteCarousel([destinations, searchQuery, activeCategory, maxBudget, activeTravelStyle, activeClimate]);

  useEffect(() => {
    fetchDestinations();
  }, [user]);

  const fetchDestinations = async () => {
    try {
      const res = await fetchWithRetry('/api/destinations');
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      console.error('Failed to fetch destinations', err);
    }
  };

  // AI discovery succeeded → refresh catalogue, then open the new record.
  const handleDiscovered = async (dest: Destination) => {
    await fetchDestinations();
    setSelectedDest(dest);
  };

  // Extract numeric maximum value from budget range string like "₹15,000 - ₹25,000"
  const getBudgetLimit = (rangeStr: string): number => {
    const parts = rangeStr.split(/[-–—]|to/i);
    const targetPart = parts.length > 1 ? parts[1] : parts[0];
    const clean = targetPart.replace(/[^\d]/g, '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? 30000 : num;
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesQuery = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    const matchesBudget = getBudgetLimit(dest.budget_range) <= maxBudget;
    const matchesTravelStyle = activeTravelStyle === 'all' || dest.travel_style === activeTravelStyle;
    const matchesClimate = activeClimate === 'all' || dest.climate === activeClimate;
    return matchesQuery && matchesCategory && matchesBudget && matchesTravelStyle && matchesClimate;
  });

  return (
    <div className={`${isHome ? 'py-12 md:py-16' : 'py-24 min-h-screen'} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100`} id="destinations-explorer">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4 text-slate-900 dark:text-white"
          >
            Explore Masterpiece Locations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-2xl mx-auto text-base"
          >
            Ditch generic search filters. Unveil curated, atmospheric destinations arranged in a fluid masonry feed. Save your favorites directly to your planner workspace.
          </motion.p>
        </div>

        {/* AI Recommendations (rendered above the filter panel) */}
        <RecommendationsStrip />

        {/* Filter Toolbar */}
        <DestinationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          maxBudget={maxBudget}
          setMaxBudget={setMaxBudget}
          activeTravelStyle={activeTravelStyle}
          setActiveTravelStyle={setActiveTravelStyle}
          activeClimate={activeClimate}
          setActiveClimate={setActiveClimate}
          onDiscovered={handleDiscovered}
        />

        {/* Horizontal Auto-Scrolling Row */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No destinations match your filter</h3>
            <p className="text-sm text-slate-400 mt-1">Try broadening your budget ceiling or search phrase.</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onClick={handleContainerClick}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory scroll-smooth"
            id="destinations-horizontal-feed"
          >
            {filteredDestinations.map((dest, idx) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                index={idx}
                isFavorited={favorites.includes(dest.id)}
                isFavLoading={!!favLoading[dest.id]}
                onToggleFavorite={toggleFavorite}
                onSelect={setSelectedDest}
                onMapPin={setMapTargetDest}
              />
            ))}
          </div>
        )}

        {/* Modal: Destination Detailed View Overlay */}
        <AnimatePresence>
          {selectedDest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden max-w-4xl w-full relative max-h-[90vh] flex flex-col shadow-2xl"
              >
                <DestinationModal
                  destination={selectedDest}
                  user={user}
                  setTab={setTab}
                  onMapPin={setMapTargetDest}
                  onClose={() => setSelectedDest(null)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Map Modal Overlay */}
        <AnimatePresence>
          {mapTargetDest && (
            <MapModal
              destination={mapTargetDest}
              onClose={() => setMapTargetDest(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
