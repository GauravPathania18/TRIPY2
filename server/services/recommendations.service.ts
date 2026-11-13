/**
 * Destination-recommendation service: prompt builder and the
 * offline fallback list used when Gemini is unavailable.
 */

export interface RecommendationParams {
  budget?: string;
  days?: number;
  interests?: string[];
}

/** Build the strict-JSON prompt that asks Gemini for 5 destinations. */
export function buildRecommendationsPrompt(params: RecommendationParams): string {
  const { budget, days, interests } = params;

  return `Recommend exactly 5 exceptional travel destinations for a traveller with these preferences:
- Budget level: ${budget || 'flexible'}
- Duration of vacation: ${days || 7} days
- Interests/Vibe: ${interests ? interests.join(', ') : 'relaxing, scenic beaches, historical forts'}

Your response must be a strict, single JSON array containing exactly 5 items. Each item must have:
{
  "name": "Destination name, e.g. Shimla",
  "country": "Country name, e.g. India",
  "description": "A refined, premium 2-sentence description of the luxury vibe and key appeal",
  "vibe": "The core theme (e.g., Romantic, Peaceful, Adventurous, Historic)",
  "climate": "e.g., Cool alpine, 15°C - 20°C",
  "avgCost": "Estimated cost starting value (e.g., ₹20,000)"
}
Output ONLY raw valid JSON. Do not include any markdown fences or wrappers.`;
}

/** Curated fallback recommendations used offline. */
export function createFallbackRecommendations() {
  return [
    { name: 'Gokarna', country: 'India', description: 'A peaceful, less-crowded alternative to northern beaches. Famous for high cliffs overlooking blue waters and clean, sandy shores.', vibe: 'Peaceful', climate: 'Tropical, 28°C', avgCost: '₹12,000' },
    { name: 'Leh Ladakh', country: 'India', description: 'A land of magnificent high mountain passes, emerald lakes, and rich Tibetan Buddhist monasteries.', vibe: 'Adventurous', climate: 'Cool alpine, 12°C', avgCost: '₹35,000' },
    { name: 'Kyoto', country: 'Japan', description: 'Immerse in ancient Japanese heritage with hundreds of pristine temples, bamboo groves, and traditional tea ceremonies.', vibe: 'Cultural', climate: 'Mild spring, 18°C', avgCost: '₹95,000' },
    { name: 'Srinagar', country: 'India', description: 'The Venice of the East, known for wooden houseboats floating on peaceful Dal Lake and royal Mughal flower gardens.', vibe: 'Romantic', climate: 'Cool mountain, 16°C', avgCost: '₹22,000' },
    { name: 'Ooty', country: 'India', description: 'A beautiful colonial-era hill station nestled in Nilgiri Hills, boasting endless rows of emerald-green tea plantations.', vibe: 'Relaxing', climate: 'Mist cool, 15°C', avgCost: '₹15,000' },
  ];
}
