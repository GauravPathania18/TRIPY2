import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import PlannerForm from './planner/PlannerForm';
import TripResults from './planner/TripResults';
import SavedTripsSidebar from './planner/SavedTripsSidebar';
import { useTripGeneration, LOADING_STEPS } from './planner/useTripGeneration';

interface AIPlannerProps {
  setTab: (tab: string) => void;
  user: any | null;
}

export default function AIPlanner({ setTab, user }: AIPlannerProps) {
  // Generation form state
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(80000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Culture', 'Food']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiModel, setAiModel] = useState('gemini-3.5-flash');

  // Saved plans state
  const [savedTrips, setSavedTrips] = useState<any[]>([]);

  // Trip generation flow (loading, loading steps, result, fallback seed data)
  const { loading, loadingStep, result, setResult, generateTrip } = useTripGeneration();

  useEffect(() => {
    if (user) {
      fetchSavedTrips();
    }
  }, [user]);

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

  // DELETE /api/trips/:id — returns true only when the item was removed from the list
  const handleDeleteTrip = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.id}:user` }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return false;
      }
      if (!res.ok) {
        console.error(`Failed to delete saved trip ${id} (${res.status})`);
        return false;
      }
      setSavedTrips((prev) => prev.filter((trip) => trip.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete saved trip', err);
      return false;
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

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    generateTrip({
      destination,
      duration,
      travelers,
      budget,
      interests: selectedInterests,
      prompt: customPrompt,
      model: aiModel
    });
  };

  return (
    <div className="py-24 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100" id="ai-planner-workspace">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: History / Saved Workspace Trips */}
          <div className="lg:col-span-3 space-y-6 text-left">
            <SavedTripsSidebar
              user={user}
              setTab={setTab}
              savedTrips={savedTrips}
              onSelectTrip={setResult}
              onDeleteTrip={handleDeleteTrip}
              onQuickStarter={handleQuickStarter}
            />
          </div>

          {/* RIGHT COLUMN: Chat Prompt Box and Visual Generation result */}
          <div className="lg:col-span-9 space-y-8">

            {/* Generation Workspace controls card */}
            <PlannerForm
              destination={destination}
              setDestination={setDestination}
              budget={budget}
              setBudget={setBudget}
              duration={duration}
              setDuration={setDuration}
              travelers={travelers}
              setTravelers={setTravelers}
              selectedInterests={selectedInterests}
              onToggleInterest={handleInterestToggle}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              aiModel={aiModel}
              setAiModel={setAiModel}
              loading={loading}
              onSubmit={handleGenerate}
            />

            {/* Spinner Progress bar during AI generation */}
            <AnimatePresence>
              {loading && (
                <div className="bg-slate-900 text-white rounded-3xl p-12 text-center border border-white/5 shadow-2xl space-y-4">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-amber-300 rounded-full animate-spin mx-auto"></div>
                  <h3 className="text-lg font-display font-medium tracking-tight mt-4">Consulting Travel Intelligence</h3>
                  <p className="text-xs font-mono text-amber-400 max-w-sm mx-auto h-8 animate-pulse">
                    {LOADING_STEPS[loadingStep]}
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* ITINERARY RESULT VISUALIZATION PAGE */}
            <AnimatePresence>
              {!loading && result && (
                <TripResults
                  result={result}
                  user={user}
                  setTab={setTab}
                  onSaved={fetchSavedTrips}
                />
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
}
