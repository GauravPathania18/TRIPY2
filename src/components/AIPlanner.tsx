import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Send, Sparkles, MapPin, Calendar, Users, Heart, Star, ChevronRight, CheckCircle2, CloudSun, AlertCircle, Trash2, ChartBar, PieChart as PieIcon, ClipboardList } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AIPlannerProps {
  setTab: (tab: string) => void;
  user: any | null;
}

export default function AIPlanner({ setTab, user }: AIPlannerProps) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(80000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Culture', 'Food']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Real-time live weather states
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-3.5-flash');

  const interestOptions = ['Beach', 'Culture', 'Food', 'Adventure', 'Shopping', 'Nightlife', 'Anime'];

  const loadingSteps = [
    'Connecting to Gemini travel intelligence node...',
    'Assembling private flight and transit routes...',
    'Predicting climate patterns and seasonal weather...',
    'Sourcing boutique luxury hotel options...',
    'Formulating day-by-day timeline nodes...',
    'Allocating budget percentages and financial brackets...'
  ];

  useEffect(() => {
    if (user) {
      fetchSavedTrips();
    }
  }, [user]);

  // Dynamic real-time weather integration
  useEffect(() => {
    if (result && result.destination) {
      fetchLiveWeather(result.destination);
    } else {
      setWeatherData(null);
    }
  }, [result]);

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
      console.error('Failed to fetch planner live weather', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const fetchSavedTrips = async () => {
    try {
      const res = await fetch('/api/trips', {
        headers: { 'Authorization': `Bearer ${user.id}:user` }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json();
      setSavedTrips(data);
    } catch (err) {
      console.error('Failed to load saved trips', err);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleQuickStarter = (destName: string, budgetAmt: number, days: number, guests: number, interests: string[]) => {
    setDestination(destName);
    setBudget(budgetAmt);
    setDuration(days);
    setTravelers(guests);
    setSelectedInterests(interests);
    setCustomPrompt(`Generate a highly atmospheric trip to ${destName} centering ${interests.join(', ')}.`);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setResult(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/gemini/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration,
          travelers,
          budget,
          interests: selectedInterests,
          prompt: customPrompt,
          model: aiModel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI Generation failed');
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback Seed Data in case key is unconfigured or slow to prevent user from being stuck
      setResult({
        destination: destination,
        duration: duration,
        travelers: travelers,
        budget: budget,
        currency: 'INR',
        itinerary: Array.from({ length: duration }).map((_, idx) => ({
          day: idx + 1,
          title: `Exploring Signature ${destination} Landmarks`,
          activities: [
            `Morning guided private shuttle to local heritage museums and cultural paths.`,
            `Special curated culinary brunch at an award-winning boutique restaurant.`,
            `Afternoon sunset yacht cruise or sightseeing valley tours.`,
            `Evening ambient walk and local hand-made craft shopping.`
          ]
        })),
        budget_breakdown: {
          flight_transit: Math.floor(budget * 0.35),
          lodging: Math.floor(budget * 0.3),
          food_dining: Math.floor(budget * 0.2),
          sightseeing_shopping: Math.floor(budget * 0.15)
        },
        packing_list: ['Valid passport & travel documents', 'All-weather comfortable trail shoes', 'Universal charging adapters', 'Personal lightweight medicine pouch', 'High contrast sunglasses'],
        weather_tips: 'Mild climate expected. Pack light layered clothes for variable evening ocean breezes.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!user) {
      setTab('login');
      return;
    }
    if (!result) return;

    setSaveLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({
          destination: result.destination,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + result.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: result.budget,
          itinerary: result.itinerary,
          packingList: result.packing_list
        })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      if (res.ok) {
        setSaveSuccess(true);
        fetchSavedTrips();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Recharts Chart Colors
  const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#10B981'];

  const getChartData = () => {
    if (!result?.budget_breakdown) return [];
    return [
      { name: 'Flight & Transit', value: result.budget_breakdown.flight_transit },
      { name: 'Lodging & Stays', value: result.budget_breakdown.lodging },
      { name: 'Food & Fine Dining', value: result.budget_breakdown.food_dining },
      { name: 'Sightseeing & Retail', value: result.budget_breakdown.sightseeing_shopping }
    ];
  };

  return (
    <div className="py-24 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100" id="ai-planner-workspace">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: History / Saved Workspace Trips */}
          <div className="lg:col-span-3 space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
                <span>Saved Travel Plans</span>
              </h3>

              {!user ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-slate-400">
                  <p className="mb-2">Sign in to save and sync your travel plans.</p>
                  <button onClick={() => setTab('login')} className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">
                    Login Now
                  </button>
                </div>
              ) : savedTrips.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono py-4">No saved trips yet. Generate your first signature travel plan!</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {savedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => setResult({
                        destination: trip.destination,
                        duration: Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
                        budget: trip.budget,
                        itinerary: trip.itinerary,
                        packing_list: trip.packing_list || ['Comfortable footwear', 'All-weather jackets', 'Identities & Documents'],
                        weather_tips: 'Moderate climate expected. Check live forecasting for daily updates.'
                      })}
                      className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-gray-200/30 dark:border-white/5 rounded-xl transition cursor-pointer text-xs"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{trip.destination}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">₹{trip.budget?.toLocaleString()} Budget</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Starters Widget */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Quick Starters</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => handleQuickStarter('Japan', 140000, 7, 2, ['Culture', 'Anime', 'Food'])}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-blue-500/5 dark:hover:bg-cyan-500/5 border border-gray-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 transition"
                >
                  🌸 Tokyo Cyber-Punk Trail (7d, ₹1.4L)
                </button>
                <button
                  onClick={() => handleQuickStarter('Goa Coastline', 50000, 5, 2, ['Beach', 'Food', 'Nightlife'])}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-blue-500/5 dark:hover:bg-cyan-500/5 border border-gray-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 transition"
                >
                  🏝️ Private South Goa Sunset (5d, ₹50k)
                </button>
                <button
                  onClick={() => handleQuickStarter('Switzerland', 280000, 8, 2, ['Adventure', 'Culture'])}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-blue-500/5 dark:hover:bg-cyan-500/5 border border-gray-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 transition"
                >
                  🏔️ Alpine Scenic Express (8d, ₹2.8L)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Chat Prompt Box and Visual Generation result */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Generation Workspace controls card */}
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
                  {[
                    { id: 'gemini-3.5-flash', label: '3.5 Flash', desc: 'Capable & Free' },
                    { id: 'gemini-3.1-flash-lite', label: '3.1 Flash Lite', desc: 'Speed / Lite' },
                    { id: 'gemini-2.5-flash', label: '2.5 Flash', desc: 'Reliable Standard' },
                    { id: 'gemini-1.5-flash', label: '1.5 Flash', desc: 'High Capacity Backup' },
                    { id: 'simulated-cognitive-node', label: 'Simulated Node', desc: 'Always Free Fallback' }
                  ].map((m) => (
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

              <form onSubmit={handleGenerate} className="space-y-6">
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
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
                    {interestOptions.map((opt) => {
                      const selected = selectedInterests.includes(opt);
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleInterestToggle(opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            selected
                              ? 'bg-blue-600 text-white'
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
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 resize-none h-20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/15 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>{loading ? 'Consulting Travel Nodes...' : 'Generate Custom Travel Plan'}</span>
                </button>
              </form>
            </div>

            {/* Spinner Progress bar during AI generation */}
            {loading && (
              <div className="bg-slate-900 text-white rounded-3xl p-12 text-center border border-white/5 shadow-2xl space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
                <h3 className="text-lg font-display font-medium tracking-tight mt-4">Consulting Travel Intelligence</h3>
                <p className="text-xs font-mono text-cyan-400 max-w-sm mx-auto h-8 animate-pulse">
                  {loadingSteps[loadingStep]}
                </p>
              </div>
            )}

            {/* ITINERARY RESULT VISUALIZATION PAGE */}
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Result header card */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center text-left">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-cyan-400 font-bold uppercase block mb-1">
                      Personalized Travel Plan Ready
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 dark:text-white tracking-tight">
                      {result.destination}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {result.duration} Days • {result.travelers} Guests • Projected budget: ₹{result.budget?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleSaveTrip}
                      disabled={saveLoading || saveSuccess}
                      className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        saveSuccess
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/15'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${saveSuccess ? 'fill-white' : ''}`} />
                      <span>{saveLoading ? 'Saving...' : saveSuccess ? 'Saved to Workspace' : 'Save Travel Plan'}</span>
                    </button>
                  </div>
                </div>

                {/* Weather & packing widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  
                  {/* Climate forecast card */}
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs font-mono text-amber-500 uppercase font-semibold">
                        <CloudSun className="w-5 h-5 text-amber-500" />
                        <span>Climate intelligence forecast</span>
                      </div>
                      {weatherLoading ? (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
                          <span>Live Weather...</span>
                        </div>
                      ) : weatherData ? (
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-blue-600 dark:text-cyan-300">{weatherData.temp}°C</span>
                          <span className="text-[10px] font-mono text-slate-400 block capitalize leading-none mt-0.5">{weatherData.description}</span>
                        </div>
                      ) : null}
                    </div>

                    {weatherData && (
                      <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-slate-950/40 rounded-2xl text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-gray-100 dark:border-white/5">
                        <div>💨 Live Wind: {weatherData.wind_speed} m/s</div>
                        <div>💧 Live Humidity: {weatherData.humidity}%</div>
                      </div>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                      {result.weather_tips}
                    </p>
                  </div>

                  {/* Packing suggestions card */}
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 text-xs font-mono text-blue-600 dark:text-cyan-400 uppercase font-semibold">
                      <ClipboardList className="w-5 h-5" />
                      <span>Custom Packing List</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(result.packing_list || []).map((item: string) => (
                        <span key={item} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 text-xs rounded-lg text-slate-600 dark:text-slate-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Combined Day timeline and Budget allocation Recharts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                  
                  {/* Left timeline section */}
                  <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">EXPEDITION DAY-WISE SCHEDULE</h3>
                    
                    <div className="space-y-6 relative pl-6 border-l border-gray-200/50 dark:border-white/5">
                      {(result.itinerary || []).map((day: any, idx: number) => (
                        <div key={day.day} className="relative space-y-2">
                          
                          {/* Dot connector */}
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 text-white border border-white dark:border-slate-900 flex items-center justify-center font-mono font-bold text-[8px]">
                            {day.day}
                          </div>

                          <h4 className="font-semibold text-base text-slate-900 dark:text-white pt-0.5">
                            Day {day.day}: {day.title}
                          </h4>

                          <ul className="space-y-2.5 pl-3">
                            {(day.activities || []).map((act: string, j: number) => (
                              <li key={j} className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed font-light flex items-start gap-2">
                                <span className="text-cyan-400 font-bold mt-0.5 shrink-0">•</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Pie budget allocations Recharts */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">BUDGET ALLOCATION CHART</h3>
                    
                    <div className="h-64 flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getChartData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {getChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Display Total in Center */}
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">EST. BUDGET</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{result.budget?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Custom Legend */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
                      {getChartData().map((entry, idx) => (
                        <div key={entry.name} className="flex justify-between items-center text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                            <span className="text-slate-500 dark:text-slate-400">{entry.name}</span>
                          </div>
                          <span className="text-slate-800 dark:text-white font-semibold">₹{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
