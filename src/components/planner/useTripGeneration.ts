import { useState, useEffect } from 'react';

export interface TripGenerationParams {
  destination: string;
  duration: number;
  travelers: number;
  budget: number;
  interests: string[];
  prompt: string;
  model: string;
}

export const LOADING_STEPS = [
  'Connecting to Gemini travel intelligence node...',
  'Assembling private flight and transit routes...',
  'Predicting climate patterns and seasonal weather...',
  'Sourcing boutique luxury hotel options...',
  'Formulating day-by-day timeline nodes...',
  'Allocating budget percentages and financial brackets...'
];

/**
 * Owns the trip generation flow: POST /api/gemini/generate-trip,
 * multi-step loading messages, and the local seed-IT fallback used when the
 * AI call fails (key unconfigured, slow, offline) so the user is never stuck.
 */
export function useTripGeneration() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any | null>(null);

  // Rotate through the loading messages while a generation request is in flight
  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const generateTrip = async (params: TripGenerationParams) => {
    const { destination, duration, travelers, budget, interests, prompt, model } = params;
    if (!destination.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/gemini/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration,
          travelers,
          budget,
          interests,
          prompt,
          model
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

  return { loading, loadingStep, result, setResult, generateTrip };
}

export default useTripGeneration;
