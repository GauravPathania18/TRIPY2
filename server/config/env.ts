/**
 * Centralized environment configuration.
 *
 * dotenv is loaded here (first import in the entrypoint) so every other
 * module can read validated values through the `env` object instead of
 * touching process.env directly.
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  /** Google Gemini API key — powers all /api/gemini/* endpoints. */
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  /** Firebase web API key — injected into the client config endpoint. */
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  /** OpenWeatherMap key — optional; weather falls back to Open-Meteo without it. */
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  /** Server port (Vercel/host injects PORT; defaults to 3000 locally). */
  port: Number(process.env.PORT) || 3000,
  /** Whether we are running the production build. */
  isProduction: process.env.NODE_ENV === 'production',
};
