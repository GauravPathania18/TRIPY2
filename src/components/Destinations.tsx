import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, CloudSun, Calendar, CreditCard, Heart, Eye, ArrowLeft, Utensils, Compass } from 'lucide-react';
import { Destination, DestinationCategory } from '../types';

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favLoading, setFavLoading] = useState<Record<string, boolean>>({});

  // Real-time weather and AI Discovery states
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aiDiscoverLoading, setAiDiscoverLoading] = useState(false);
  const [aiDiscoverError, setAiDiscoverError] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isMouseOverRef = useRef<boolean>(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const speed = 0.8;

    const animateScroll = () => {
      if (container && !isPausedRef.current) {
        container.scrollLeft += speed;
        
        // Loop back to the start if we have scrolled to the absolute end
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScrollLeft - 1) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [destinations, searchQuery, activeCategory, maxBudget, activeTravelStyle, activeClimate]);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (!isMouseOverRef.current) {
        isPausedRef.current = false;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  const handleMouseEnter = () => {
    isMouseOverRef.current = true;
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isMouseOverRef.current = false;
    isPausedRef.current = false;
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
  };

  const handleContainerClick = () => {
    isPausedRef.current = true;
  };

  useEffect(() => {
    fetchDestinations();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Automatically fetch live weather when selectedDest changes
  useEffect(() => {
    if (selectedDest) {
      fetchLiveWeather(selectedDest.city || selectedDest.name);
    } else {
      setWeatherData(null);
    }
  }, [selectedDest]);

  const fetchLiveWeather = async (city: string) => {
    setWeatherLoading(true);
    setWeatherData(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Failed to fetch live weather', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleAIDiscover = async () => {
    if (!searchQuery.trim()) return;
    setAiDiscoverLoading(true);
    setAiDiscoverError('');
    try {
      const res = await fetch('/api/gemini/discover-destination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to discover destination via AI');
      }
      const data = await res.json();
      
      // Refresh destinations from server to include this new one
      await fetchDestinations();
      
      // Clear the query and open the newly discovered destination modal immediately
      setSelectedDest(data);
    } catch (err: any) {
      console.error('AIDiscover error:', err);
      setAiDiscoverError(err.message || 'AI exploration node failed to respond.');
    } finally {
      setAiDiscoverLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/destinations');
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      console.error('Failed to fetch destinations', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${user.id}:user` }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFavorites(data.map((f: any) => f.destination_id));
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Failed to fetch favorites', err);
      setFavorites([]);
    }
  };

  const handleToggleFavorite = async (destId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setTab('login');
      return;
    }

    setFavLoading(prev => ({ ...prev, [destId]: true }));
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ destinationId: destId })
      });
      const data = await res.json();
      if (data.favorited) {
        setFavorites(prev => [...prev, destId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== destId));
      }
    } catch (err) {
      console.error('Favorite toggle failed', err);
    } finally {
      setFavLoading(prev => ({ ...prev, [destId]: false }));
    }
  };

  // Extract numeric maximum value from budget range string like "₹15,000 - ₹25,000" or "₹1,50,000 - ₹2,50,000"
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

        {/* Filter Toolbar */}
        <div className="bg-[#0b1329] border border-slate-800/80 rounded-[28px] p-8 shadow-2xl mb-12 text-white" id="trippy-filter-panel">
          {/* Custom Slider Thumb Styles */}
          <style dangerouslySetInnerHTML={{__html: `
            #trippy-budget-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563eb;
              border: 3px solid #ffffff;
              box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
              cursor: pointer;
              transition: all 0.15s ease-in-out;
            }
            #trippy-budget-slider::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 0 14px rgba(37, 99, 235, 0.8);
            }
            #trippy-budget-slider::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563eb;
              border: 3px solid #ffffff;
              box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
              cursor: pointer;
              transition: all 0.15s ease-in-out;
            }
            #trippy-budget-slider::-moz-range-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 0 14px rgba(37, 99, 235, 0.8);
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
                className="w-full pl-14 pr-5 py-4 bg-[#030712] border border-slate-800/60 rounded-2xl text-base text-white placeholder-slate-500 transition focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20'
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
                <span className="text-cyan-400 font-bold text-sm">₹{maxBudget.toLocaleString('en-IN')}</span>
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
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((maxBudget - 15000) / (300000 - 15000)) * 100}%, #ffffff ${((maxBudget - 15000) / (300000 - 15000)) * 100}%, #ffffff 100%)`
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
                          : 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10'
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
                          : 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10'
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/20 shadow-inner mt-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-2.5 w-2.5 relative mt-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <div className="text-sm">
                    <span className="font-semibold text-white block sm:inline">Can't find your dream destination?</span>{' '}
                    <span className="text-slate-300 block sm:inline">
                      Let Gemini AI dynamically explore & build a premium, persisted guide for{' '}
                      <span className="font-semibold text-cyan-400">"{searchQuery}"</span>.
                    </span>
                    {aiDiscoverError && (
                      <p className="text-xs text-red-400 mt-1.5 font-mono">{aiDiscoverError}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAIDiscover}
                  disabled={aiDiscoverLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer self-start md:self-auto"
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
            )}
          </div>
        </div>

        {/* Horizontal Auto-Scrolling Row */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No destinations match your filter</h3>
            <p className="text-sm text-slate-400 mt-1">Try broadening your budget ceiling or search phrase.</p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onClick={handleContainerClick}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory scroll-smooth" 
            id="destinations-horizontal-feed"
          >
            {filteredDestinations.map((dest, idx) => {
              const isFavorited = favorites.includes(dest.id);
              const isLoading = favLoading[dest.id];

              return (
                <motion.div
                  key={dest.id}
                  layoutId={`dest-card-${dest.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedDest(dest)}
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

                    {/* Favorite Button (Heart) */}
                    <button
                      onClick={(e) => handleToggleFavorite(dest.id, e)}
                      disabled={isLoading}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white hover:text-red-500 transition active:scale-95 disabled:opacity-50"
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Bottom overlay texts */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-mono mb-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{dest.city}, {dest.country}</span>
                      </div>
                      <h3 className="text-xl font-display font-medium mb-1 tracking-tight">{dest.name}</h3>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
                        <span>Best: {dest.best_season}</span>
                        <span className="text-cyan-400 font-bold">{dest.budget_range.split('-')[0]}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
                {/* Scrollable Container */}
                <div className="overflow-y-auto p-0">
                  
                  {/* Hero banner inside modal */}
                  <div className="relative h-64 sm:h-96 w-full">
                    <img
                      src={selectedDest.image_url}
                      alt={selectedDest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent"></div>
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedDest(null)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/60 border border-white/20 text-white transition cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Detail title inside banner */}
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono mb-1">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{selectedDest.city}, {selectedDest.country}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">{selectedDest.name}</h2>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
                    <div className="md:col-span-8 space-y-6">
                      
                      {/* Description */}
                      <div>
                        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Atmosphere & Overview</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                          {selectedDest.description}
                        </p>
                      </div>

                      {/* Attractions (Mocked) */}
                      <div>
                        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Principal Attractions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {selectedDest.id === 'dest-goa' ? (
                            <>
                              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                                <span className="font-semibold block text-slate-900 dark:text-white mb-1">Baga Beach</span>
                                <span className="text-xs text-slate-400">Famous for active ocean parasailing, seafood cabanas & night bazars.</span>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                                <span className="font-semibold block text-slate-900 dark:text-white mb-1">Basilica of Bom Jesus</span>
                                <span className="text-xs text-slate-400">Unesco heritage site containing beautiful Portuguese architecture.</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                                <span className="font-semibold block text-slate-900 dark:text-white mb-1">Scenic Valley Sightseeing</span>
                                <span className="text-xs text-slate-400">Pristine pine forests, snow resort valleys and rushing rivers.</span>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                                <span className="font-semibold block text-slate-900 dark:text-white mb-1">Historic Town Monasteries</span>
                                <span className="text-xs text-slate-400">Quiet spiritual paths, local hand-woven artifacts and hot springs.</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Local Cuisine (Mocked) */}
                      <div>
                        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Utensils className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Local Gastronomy Selection</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {['Goan Spiced Fish Curry', 'Todd Vinegar Pork Vindaloo', 'Feni & Cashew Drinks', 'Sweet Bebinca Cake', 'Steaming hot local Momos', 'Rawa Fried Pomfret'].map((food) => (
                            <span key={food} className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/15 rounded-lg text-xs font-medium text-blue-600 dark:text-cyan-400">
                              {food}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Quick Details Sidebar widget */}
                    <div className="md:col-span-4 space-y-4">
                      
                      {/* Weather widget */}
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-cyan-400">
                        <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase mb-1">
                          <CloudSun className="w-4 h-4 text-amber-500" />
                          <span>Real-Time Weather</span>
                        </div>
                        {weatherLoading ? (
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1">
                            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Fetching live weather...</span>
                          </div>
                        ) : weatherData ? (
                          <div className="space-y-1 mt-1 text-slate-800 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold font-mono text-blue-600 dark:text-cyan-300">{weatherData.temp}°C</span>
                              <span className="text-xs font-mono font-medium capitalize px-2 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-300">
                                {weatherData.description}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                              <span>💨 Wind: {weatherData.wind_speed} m/s</span>
                              <span>💧 Humid: {weatherData.humidity}%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-base font-semibold text-slate-800 dark:text-white block mt-1">
                            {selectedDest.best_season.includes('October') ? '28°C - Sunny Coast' : '15°C - Misty Mountain'} ☀️
                          </span>
                        )}
                      </div>

                      {/* Best Season */}
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>Recommended Period</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white block">{selectedDest.best_season}</span>
                      </div>

                      {/* Travel Style Widget */}
                      {selectedDest.travel_style && (
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                            <Compass className="w-4 h-4 text-emerald-500" />
                            <span>Travel Style</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-white block capitalize">{selectedDest.travel_style}</span>
                        </div>
                      )}

                      {/* Climate Widget */}
                      {selectedDest.climate && (
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                            <CloudSun className="w-4 h-4 text-orange-500" />
                            <span>Climate Zone</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-white block capitalize">{selectedDest.climate}</span>
                        </div>
                      )}

                      {/* Budget */}
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                          <CreditCard className="w-4 h-4" />
                          <span>Estimated Cost Bracket</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white block">{selectedDest.budget_range}</span>
                      </div>

                      {/* Travel Action */}
                      <button
                        onClick={() => {
                          setSelectedDest(null);
                          setTab('packages');
                        }}
                        className="w-full py-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Compass className="w-4 h-4 animate-spin" />
                        <span>Explore Curated Tours</span>
                      </button>

                    </div>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
