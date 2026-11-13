/**
 * AI trip-planning service: prompt construction, response normalization
 * and the structured offline fallback used when Gemini is unavailable.
 */

export interface TripParams {
  destination: string;
  budget?: string | number;
  days?: number;
  travelers?: number;
  interests?: string[];
  specialRequirements?: string;
}

/** Build the strict-JSON prompt for itinerary generation. */
export function buildTripPrompt(params: TripParams): string {
  const { destination, budget, days, travelers, interests, specialRequirements } = params;

  return `Create a fully tailored travel itinerary with the following parameters:
- Destination: ${destination}
- Budget/Cost limit: ${budget || 'flexible'}
- Duration of Stay: ${days || 5} days
- Number of Travelers: ${travelers || 2}
- Specific Interests: ${interests ? interests.join(', ') : 'sightseeing, local food'}
- Special Requirements/Dietary Notes: ${specialRequirements || 'none'}

Your response must be a strict, single, fully valid JSON object that adheres strictly to the following Schema structure (do not include markdown syntax, outside wrappers, or backticks; output ONLY raw JSON):
{
  "tripName": "A bespoke descriptive name for the travel experience",
  "destination": "The primary destination location",
  "duration": ${days || 5},
  "estimatedCostRange": "e.g., ₹25,000 - ₹30,000",
  "costBreakdown": {
    "accommodation": 8000,
    "flights": 12000,
    "food": 3500,
    "activities": 2500,
    "localTransport": 2000
  },
  "dayByDay": [
    {
      "day": 1,
      "title": "Morning arrival & afternoon beach vibes",
      "activities": [
        "Check-in at luxurious beachfront resort",
        "Sunbathing and local seafood lunch",
        "Scenic sunset beach photography walk"
      ],
      "accommodation": "Premium Heritage Hotel / Resort"
    }
  ],
  "packingChecklist": [
    "UV blocking high-SPF sunblock",
    "Light linen shirts and shorts",
    "Waterproof action camera/gears"
  ],
  "visaGuidance": "A short brief on visa rules for this destination (e.g. visa free, eVisa, or visa-on-arrival guidance)",
  "weatherIntelligence": "Current seasonal expectations (e.g., Warm & sunny, temperature 26°C-31°C, low rain probability)"
}
Ensure there are exactly ${days || 5} days in the dayByDay array. Ensure the costBreakdown values match the budget constraints provided.`;
}

/**
 * Normalize the raw Gemini payload into the shape the frontend expects,
 * supporting BOTH the AI schema (dayByDay / costBreakdown) and the
 * frontend schema (itinerary / budget_breakdown).
 */
export function normalizeTripResponse(
  parsed: any,
  params: TripParams
): Record<string, any> {
  const { destination, days, travelers, budget } = params;
  const numericBudget = Number(budget);

  return {
    ...parsed,
    destination: parsed.destination || destination,
    duration: Number(parsed.duration || days || 5),
    travelers: Number(parsed.travelers || travelers || 2),
    budget: Number(parsed.budget || budget || 30000),

    // Map both schemas to ensure frontend rendering works perfectly:
    weather_tips:
      parsed.weather_tips ||
      parsed.weatherIntelligence ||
      'Pleasant local conditions. Layering recommended.',
    packing_list: parsed.packing_list || parsed.packingChecklist || [
      'Travel documents',
      'All-weather footwear',
    ],
    itinerary: (parsed.itinerary || parsed.dayByDay || []).map((day: any) => ({
      day: Number(day.day),
      title: day.title || 'Sightseeing & Exploration',
      activities: day.activities || [],
    })),
    budget_breakdown: parsed.budget_breakdown || {
      flight_transit: Number(
        (parsed.costBreakdown && parsed.costBreakdown.flights) ||
          (budget ? Math.floor(numericBudget * 0.35) : 10000)
      ),
      lodging: Number(
        (parsed.costBreakdown && parsed.costBreakdown.accommodation) ||
          (budget ? Math.floor(numericBudget * 0.30) : 9000)
      ),
      food_dining: Number(
        (parsed.costBreakdown && parsed.costBreakdown.food) ||
          (budget ? Math.floor(numericBudget * 0.20) : 6000)
      ),
      sightseeing_shopping: Number(
        (parsed.costBreakdown && parsed.costBreakdown.activities) ||
          (budget ? Math.floor(numericBudget * 0.15) : 5000)
      ),
    },
  };
}

/** Structured offline itinerary returned whenever Gemini cannot answer. */
export function createFallbackTrip(dest: string, days: number, errMsg = '') {
  const dayList = [];
  for (let i = 1; i <= days; i++) {
    dayList.push({
      day: i,
      title: `Explore beautiful ${dest} - Day ${i}`,
      activities: [
        `Start day with luxury local breakfast session`,
        `Explore iconic sightseeing spots and cultural landmarks in ${dest}`,
        `Evening fine dining curated experience and beach/mountain sunset observation`,
      ],
      accommodation: `Premium 4-Star Resort in ${dest}`,
    });
  }
  return {
    tripName: `Elite Curated Escape to ${dest}`,
    destination: dest,
    duration: days,
    estimatedCostRange: '₹25,000 - ₹35,000',
    costBreakdown: {
      accommodation: 10000,
      flights: 12000,
      food: 4000,
      activities: 3000,
      localTransport: 2000,
    },
    dayByDay: dayList,
    packingChecklist: [
      'Comfortable high-quality walking shoes',
      'Local travel electrical adapter',
      'Essential documents and light jackets',
    ],
    visaGuidance: 'Visa-on-arrival or easy eVisa application is recommended for tourists.',
    weatherIntelligence: 'Pleasant local weather with clear, eye-safe sunny skies.',

    // Frontend compatibility keys:
    weather_tips: 'Pleasant local weather with clear, eye-safe sunny skies.',
    packing_list: [
      'Comfortable high-quality walking shoes',
      'Local travel electrical adapter',
      'Essential documents and light jackets',
    ],
    itinerary: dayList,
    budget_breakdown: {
      flight_transit: 12000,
      lodging: 10000,
      food_dining: 4000,
      sightseeing_shopping: 5000,
    },
    budget: 31000,
    travelers: 2,
    _fallback: true,
    _error: errMsg,
  };
}
