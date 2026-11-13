/**
 * Weather service.
 *
 * Provider chain (first success wins):
 *   1. OpenWeatherMap (when OPENWEATHER_API_KEY is configured)
 *   2. Open-Meteo (keyless) — direct when coordinates are known,
 *      via Open-Meteo geocoding when only a city name is given
 *   3. Static fallbacks so the UI always receives a well-formed payload
 *
 * This consolidates the previously duplicated lat/lon and city branches.
 */
import { env } from '../config/env';

export interface WeatherResult {
  temp: number;
  description: string;
  humidity: number;
  wind_speed: number;
  condition: string;
  city: string;
  country: string;
  source: string;
}

export interface WeatherQuery {
  city?: string;
  lat?: number;
  lon?: number;
}

/** Map an Open-Meteo weather code to friendly description + condition. */
function mapWeatherCode(code: number): { description: string; condition: string } {
  if (code === 0) return { description: 'Sunny & Clear', condition: 'Clear' };
  if (code >= 1 && code <= 3) return { description: 'Partly Cloudy', condition: 'Cloudy' };
  if (code >= 45 && code <= 48) return { description: 'Foggy', condition: 'Fog' };
  if (code >= 51 && code <= 67) return { description: 'Light Drizzle / Rain', condition: 'Rain' };
  if (code >= 71 && code <= 77) return { description: 'Snowy', condition: 'Snow' };
  if (code >= 80 && code <= 82) return { description: 'Rain Showers', condition: 'Rain' };
  if (code >= 95 && code <= 99) return { description: 'Thunderstorms', condition: 'Thunderstorm' };
  return { description: 'Clear', condition: 'Clear' };
}

function humidityForCode(code: number, fallback: number): number {
  return code >= 51 && code <= 82 ? 85 : fallback;
}

/** OpenWeatherMap lookup by coordinates. Returns null when unavailable. */
async function fetchOpenWeatherByCoords(lat: number, lon: number): Promise<WeatherResult | null> {
  if (!env.openWeatherApiKey) return null;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${env.openWeatherApiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    temp: Math.round(data.main.temp),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    condition: data.weather[0].main,
    city: data.name,
    country: data.sys.country,
    source: 'openweathermap',
  };
}

/** OpenWeatherMap lookup by city name. Returns null when unavailable. */
async function fetchOpenWeatherByCity(city: string): Promise<WeatherResult | null> {
  if (!env.openWeatherApiKey) return null;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${env.openWeatherApiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    temp: Math.round(data.main.temp),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    condition: data.weather[0].main,
    city: data.name,
    country: data.sys.country,
    source: 'openweathermap',
  };
}

/** Open-Meteo forecast by coordinates (keyless). Returns null when unavailable. */
async function fetchOpenMeteoByCoords(
  lat: number,
  lon: number,
  fallbackCity?: string
): Promise<WeatherResult | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  const temp = data.current
    ? Math.round(data.current.temperature_2m)
    : data.current_weather
      ? Math.round(data.current_weather.temperature)
      : 20;

  const code = data.current
    ? data.current.weather_code
    : data.current_weather
      ? data.current_weather.weathercode
      : 0;

  const humidity =
    data.current && data.current.relative_humidity_2m !== undefined
      ? data.current.relative_humidity_2m
      : humidityForCode(code, 55);

  const wind_speed =
    data.current && data.current.wind_speed_10m !== undefined
      ? Math.round(data.current.wind_speed_10m)
      : data.current_weather
        ? Math.round(data.current_weather.windspeed)
        : 8;

  const { description, condition } = mapWeatherCode(code);

  return {
    temp,
    description,
    humidity,
    wind_speed,
    condition,
    city: fallbackCity || 'Local Center',
    country: '',
    source: 'open-meteo',
  };
}

/** Resolve a city name to coordinates via Open-Meteo geocoding. */
async function geocodeCity(
  city: string
): Promise<{ latitude: number; longitude: number; name: string; country: string } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const first = data.results[0];
  return {
    latitude: first.latitude,
    longitude: first.longitude,
    name: first.name,
    country: first.country,
  };
}

/** Resolve a weather query through the provider chain. Never throws. */
export async function getWeather(query: WeatherQuery): Promise<WeatherResult> {
  const { city, lat, lon } = query;

  try {
    // 1. Explicit coordinates
    if (lat !== undefined && lon !== undefined) {
      const owm = await fetchOpenWeatherByCoords(lat, lon);
      if (owm) return owm;

      const meteo = await fetchOpenMeteoByCoords(lat, lon, city);
      if (meteo) return meteo;
    }

    // 2. City name (geocode -> forecast when OpenWeatherMap is unavailable)
    if (city) {
      const owm = await fetchOpenWeatherByCity(city);
      if (owm) return owm;

      const geo = await geocodeCity(city);
      if (geo) {
        const meteo = await fetchOpenMeteoByCoords(geo.latitude, geo.longitude, geo.name);
        if (meteo) {
          return { ...meteo, country: geo.country };
        }
      }
    }

    // 3. Static fallback
    return {
      temp: 22,
      description: 'Mild & Scenic',
      humidity: 55,
      wind_speed: 10,
      condition: 'Clear',
      city: city || 'Unknown',
      country: '',
      source: 'fallback',
    };
  } catch (err: any) {
    console.error('Weather fetching error:', err);
    return {
      temp: 20,
      description: 'Pleasant Breeze',
      humidity: 60,
      wind_speed: 12,
      condition: 'Clouds',
      city: city || 'Destination',
      country: '',
      source: 'error-fallback',
    };
  }
}
