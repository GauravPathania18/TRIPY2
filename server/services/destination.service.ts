/**
 * Destination service: AI discovery prompt/schema, simulated offline
 * destinations, and category-based image selection.
 */
import { Type } from '@google/genai';

/** Strict JSON schema used by the Gemini destination-discovery call. */
export const DISCOVER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Display name of the destination' },
    city: { type: Type.STRING, description: 'Primary city or hub name' },
    country: { type: Type.STRING, description: 'Country name' },
    description: {
      type: Type.STRING,
      description: 'Atmospheric, premium description of the place (3-4 sentences)',
    },
    latitude: { type: Type.NUMBER, description: 'Approximate latitude coordinate' },
    longitude: { type: Type.NUMBER, description: 'Approximate longitude coordinate' },
    budget_range: {
      type: Type.STRING,
      description: "Estimated standard cost in INR, e.g. '₹50,000 - ₹80,000'",
    },
    best_season: { type: Type.STRING, description: "Best period to visit, e.g. 'October - May'" },
    category: { type: Type.STRING, description: 'MUST be one of: beach, mountains, adventure, family' },
    travel_style: { type: Type.STRING, description: 'MUST be one of: luxury, adventure, budget' },
    climate: { type: Type.STRING, description: 'MUST be one of: tropical, alpine, moderate, desert' },
  },
  required: [
    'name', 'city', 'country', 'description', 'latitude', 'longitude',
    'budget_range', 'best_season', 'category', 'travel_style', 'climate',
  ],
};

/** Prompt for authentic destination details for an arbitrary place query. */
export function buildDiscoverPrompt(query: string): string {
  return `Identify and generate authentic, accurate travel details for the place: "${query}".
Provide realistic values, especially for the city, country, best season, coordinates, and atmosphere description.
The budget_range should be in Indian Rupees (INR) format (e.g. "₹45,000 - ₹65,000").
The category MUST be exactly one of: 'beach', 'mountains', 'adventure', 'family'. Choose the most fitting.
The travel_style MUST be exactly one of: 'luxury', 'adventure', 'budget'.
The climate MUST be exactly one of: 'tropical', 'alpine', 'moderate', 'desert'.`;
}

/** Scenic Unsplash imagery per destination category. */
const imagesByCategory: Record<string, string[]> = {
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
  ],
  mountains: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
  ],
  adventure: [
    'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=1200&q=80',
  ],
  family: [
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
  ],
};

/** Pick a scenic image for the generated category (adventure as default). */
export function pickCategoryImage(category: string): string {
  const list = imagesByCategory[(category || '').toLowerCase()] || imagesByCategory.adventure;
  return list[Math.floor(Math.random() * list.length)];
}

/** Shape a parsed Gemini payload into a full Destination record. */
export function buildDestinationFromAI(parsed: any) {
  return {
    name: parsed.name,
    description: parsed.description,
    country: parsed.country,
    city: parsed.city,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    image_url: pickCategoryImage(parsed.category),
    budget_range: parsed.budget_range,
    best_season: parsed.best_season,
    category: parsed.category.toLowerCase(),
    is_featured: false,
    travel_style: parsed.travel_style.toLowerCase(),
    climate: parsed.climate.toLowerCase(),
  };
}

/** Simulated destination used offline / when Gemini is unavailable. */
export function createSimulatedDestination(query: string) {
  return {
    name: query.charAt(0).toUpperCase() + query.slice(1),
    description: `A stunning global destination for "${query}", newly mapped and unlocked using real-time spatial travel nodes. Highly recommended for premium boutique sightseeing, immersive local dining, and seasonal adventure trails.`,
    country: 'International',
    city: query.charAt(0).toUpperCase() + query.slice(1),
    latitude: 48.8566,
    longitude: 2.3522,
    image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹60,000 - ' + (query.length % 2 === 0 ? '₹95,000' : '₹1,20,000'),
    best_season: 'September - May',
    category: 'adventure' as any,
    is_featured: false,
    travel_style: 'luxury',
    climate: 'moderate',
  };
}
