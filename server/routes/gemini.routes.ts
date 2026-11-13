/**
 * Gemini AI routes:
 *   POST /generate-trip        — day-by-day itinerary generation
 *   POST /chat                 — travel concierge chat (Google Search grounding)
 *   POST /discover-destination — dynamic destination creation
 *   POST /recommendations      — 5-destination recommendation list
 *
 * Every endpoint degrades gracefully: without GEMINI_API_KEY (or when the
 * selected model is `simulated-cognitive-node`) it returns structured
 * simulated data instead of an error.
 */
import { Router } from 'express';
import { db } from '../db.js';
import { env } from '../config/env.js';
import { generateContentWithFallback, sendChatWithFallback } from '../lib/gemini.js';
import {
  buildDestinationFromAI,
  buildDiscoverPrompt,
  createSimulatedDestination,
  DISCOVER_SCHEMA,
} from '../services/destination.service.js';
import {
  buildRecommendationsPrompt,
  createFallbackRecommendations,
} from '../services/recommendations.service.js';
import {
  buildTripPrompt,
  createFallbackTrip,
  normalizeTripResponse,
} from '../services/trip.service.js';

const router = Router();

const DEFAULT_MODEL = 'gemini-3.5-flash';
const SIMULATED_MODEL = 'simulated-cognitive-node';

// ==========================================
// AI Trip Planner
// ==========================================
router.post('/generate-trip', async (req, res) => {
  const { destination, budget, days, travelers, interests, specialRequirements, model } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  const selectedModel = model || DEFAULT_MODEL;

  if (selectedModel === SIMULATED_MODEL) {
    return res.json(createFallbackTrip(destination, days || 5, 'Simulated Offline Mode'));
  }

  const params = { destination, budget, days, travelers, interests, specialRequirements };
  const prompt = buildTripPrompt(params);

  try {
    if (!env.geminiApiKey) {
      // Fallback if API key is not configured yet
      return res.json(createFallbackTrip(destination, days || 5));
    }

    const response = await generateContentWithFallback(selectedModel, prompt, 'application/json');
    const text = response.text || '';
    const parsed = JSON.parse(text.trim());

    // Support BOTH frontend and backend formats seamlessly
    res.json(normalizeTripResponse(parsed, params));
  } catch (err: any) {
    console.error('Gemini generateContent error:', err);
    // Provide structured fallback trip
    res.json(createFallbackTrip(destination, days || 5, err.message));
  }
});

// ==========================================
// AI Travel Chatbot (with Google Search grounding)
// ==========================================
router.post('/chat', async (req, res) => {
  const { messages, userMessage, model } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const selectedModel = model || DEFAULT_MODEL;

  if (selectedModel === SIMULATED_MODEL) {
    return res.json({
      text: `Hello! I am your AI Travel Assistant. (Note: Simulated Offline Mode is active. Here is a simulated response to your question: "${userMessage}"). You can explore our pre-populated premium tour packages and save trips to your dashboard!`,
    });
  }

  try {
    if (!env.geminiApiKey) {
      return res.json({
        text: `Hello! I am your AI Travel Assistant. (Note: Gemini API key is currently offline. Here is a simulated response to your question: "${userMessage}"). You can explore our pre-populated premium tour packages and save trips to your dashboard!`,
      });
    }

    // Map incoming conversation history to the Content format required by @google/genai
    const history = (messages || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || msg.content || '' }],
    }));

    const result = await sendChatWithFallback(selectedModel, history, userMessage);
    res.json(result);
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    // Provide a premium private concierge styled fallback instead of 500 error page
    res.json({
      text: `Hello! I am Trippy, your luxury AI Travel Concierge. I am currently running on our backup simulated channel because our main network is experiencing extremely high demand.

To address your query regarding "${userMessage}": I highly recommend exploring our pre-populated premium tour packages in the Packages section. They are curated with top-tier accommodations, private guided tours, and custom-tailored local itineraries! Let me know if you would like me to help with anything else.`,
    });
  }
});

// ==========================================
// Dynamic AI Destination Discovery
// ==========================================
router.post('/discover-destination', async (req, res) => {
  const { query, model } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const selectedModel = model || DEFAULT_MODEL;

  // Check if a destination with this name or city already exists (case insensitive)
  const existing = db
    .getDestinations()
    .find(
      (d) =>
        d.name.toLowerCase() === query.toLowerCase() ||
        d.city.toLowerCase() === query.toLowerCase()
    );
  if (existing) {
    return res.json(existing);
  }

  try {
    if (selectedModel === SIMULATED_MODEL || !env.geminiApiKey) {
      // Fallback: Generate a simulated destination so it works offline
      const mockResult = createSimulatedDestination(query);
      const saved = db.createDestination(mockResult);
      return res.json(saved);
    }

    const response = await generateContentWithFallback(
      selectedModel,
      buildDiscoverPrompt(query),
      'application/json',
      DISCOVER_SCHEMA
    );

    const parsed = JSON.parse((response.text || '').trim());
    const saved = db.createDestination(buildDestinationFromAI(parsed));
    res.json(saved);
  } catch (err: any) {
    console.error('Discover destination error:', err);
    // Fallback simulated destination on error
    const mockResult = createSimulatedDestination(query);
    const saved = db.createDestination(mockResult);
    res.json(saved);
  }
});

// ==========================================
// AI Destination Recommender
// ==========================================
router.post('/recommendations', async (req, res) => {
  const { budget, days, interests, model } = req.body;

  const selectedModel = model || DEFAULT_MODEL;

  if (selectedModel === SIMULATED_MODEL || !env.geminiApiKey) {
    return res.json(createFallbackRecommendations());
  }

  try {
    const response = await generateContentWithFallback(
      selectedModel,
      buildRecommendationsPrompt({ budget, days, interests }),
      'application/json'
    );
    const parsed = JSON.parse((response.text || '').trim());
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini recommendations error:', err);
    res.json(createFallbackRecommendations());
  }
});

export default router;
