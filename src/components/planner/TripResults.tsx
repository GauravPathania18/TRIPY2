import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, CloudSun, ClipboardList } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Recharts Chart Colors
const COLORS = ['#f59e0b', '#d97706', '#b45309', '#facc15'];

interface TripResultsProps {
  result: any;
  user: any | null;
  setTab: (tab: string) => void;
  onSaved: () => void;
}

export default function TripResults({ result, user, setTab, onSaved }: TripResultsProps) {
  // Real-time live weather states
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Save-trip flow state
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        onSaved();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Result header card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center text-left">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase block mb-1">
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
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
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
                <span className="text-sm font-bold font-mono text-amber-500">{weatherData.temp}°C</span>
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
          <div className="flex items-center gap-2.5 text-xs font-mono text-amber-500 uppercase font-semibold">
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
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 border border-white dark:border-slate-900 flex items-center justify-center font-mono font-bold text-[8px]">
                  {day.day}
                </div>

                <h4 className="font-semibold text-base text-slate-900 dark:text-white pt-0.5">
                  Day {day.day}: {day.title}
                </h4>

                <ul className="space-y-2.5 pl-3">
                  {(day.activities || []).map((act: string, j: number) => (
                    <li key={j} className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed font-light flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5 shrink-0">•</span>
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
  );
}
