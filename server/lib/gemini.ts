/**
 * Gemini AI client and model-fallback helpers.
 *
 * All Gemini traffic flows through here so the model retry chain
 * (selected model -> reliable free models) lives in exactly one place.
 */
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

/** Shared Gemini client (no-op until GEMINI_API_KEY is configured). */
export const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/** Models tried in order when the preferred one is unavailable (e.g. 503). */
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];

function isStaticError(err: any): boolean {
  const status = err?.status || err?.error?.code;
  return status === 400 || status === 401 || status === 403;
}

/**
 * Generate content with automatic fallback across models.
 * Stops immediately on static errors (400/401/403) where retrying won't help.
 */
export async function generateContentWithFallback(
  model: string,
  prompt: string,
  mimeType?: string,
  responseSchema?: any
) {
  const modelsToTry = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];

  let lastError: any = null;
  for (const currentModel of modelsToTry) {
    try {
      console.log(`[Gemini API] Attempting generateContent with model: ${currentModel}`);
      const config: any = {};
      if (mimeType) config.responseMimeType = mimeType;
      if (responseSchema) config.responseSchema = responseSchema;

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: config,
      });
      console.log(`[Gemini API] Success using model: ${currentModel}`);
      return response;
    } catch (err: any) {
      console.warn(`[Gemini API] Failed with ${currentModel}:`, err.message || err);
      lastError = err;
      if (isStaticError(err)) throw err;
    }
  }
  throw lastError || new Error('All models failed');
}

export interface ChatSource {
  title: string;
  uri: string;
}

/**
 * Send a chat message with Google Search grounding, falling back across
 * models on transient failures. Resolves to `{ text, sources }`.
 */
export async function sendChatWithFallback(
  model: string,
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string
): Promise<{ text: string; sources: ChatSource[] }> {
  const modelsToTry = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];

  let lastError: any = null;
  for (const currentModel of modelsToTry) {
    try {
      const chat = ai.chats.create({
        model: currentModel,
        history: history as any,
        config: {
          systemInstruction:
            'You are Trippy, an elite, luxury AI Travel Concierge. Speak with sophistication, warmth, and high professional composure. Help users with smart, curated recommendations on food, hotels, packing lists, visa guides, local cultural rules, and hidden treasures. Avoid dry developer talk; sound like a premium private concierge.',
          tools: [{ googleSearch: {} }], // Enable Google Search Grounding
        },
      });

      const response = await chat.sendMessage({ message: userMessage });

      // Extract Google Search grounding sources if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources: ChatSource[] = chunks
        ? chunks
            .map((chunk: any) => ({
              title: chunk.web?.title || 'Google Search Source',
              uri: chunk.web?.uri || '',
            }))
            .filter((src: ChatSource) => src.uri)
        : [];

      return { text: response.text || '', sources };
    } catch (err: any) {
      console.warn(`[Gemini Chat] Failed with model ${currentModel}:`, err.message || err);
      lastError = err;
      if (isStaticError(err)) throw err;
    }
  }
  throw lastError || new Error('All chat models failed');
}
