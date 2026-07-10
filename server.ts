import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db';
import { UserRole, BookingStatus } from './src/types';

// Load env variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to try multiple models in order in case of transient demand issues (e.g. 503 error)
async function generateContentWithFallback(model: string, prompt: string, mimeType?: string, responseSchema?: any) {
  // Try selected model first, then reliable free models with high capacity/low demand
  const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
  const modelsToTry = [model, ...fallbackModels.filter(m => m !== model)];
  
  let lastError = null;
  for (const currentModel of modelsToTry) {
    try {
      console.log(`[Gemini API] Attempting generateContent with model: ${currentModel}`);
      const config: any = {};
      if (mimeType) config.responseMimeType = mimeType;
      if (responseSchema) config.responseSchema = responseSchema;

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: config
      });
      console.log(`[Gemini API] Success using model: ${currentModel}`);
      return response;
    } catch (err: any) {
      console.warn(`[Gemini API] Failed with ${currentModel}:`, err.message || err);
      lastError = err;
      // If error is static (400, 401, 403), stop immediately as retry won't help
      const status = err.status || (err.error && err.error.code);
      if (status === 400 || status === 401 || status === 403) {
        throw err;
      }
    }
  }
  throw lastError || new Error("All models failed");
}

// Helper: Extract user ID from a mock Bearer token (simple Authorization header)
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  // Simple token format: "userId:role"
  const [userId, role] = token.split(':');
  const user = db.getUser(userId);
  if (!user) return null;
  return user;
}

// ==========================================
// API Endpoints: Auth
// ==========================================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const user = db.createUser(name, email, password);
    // Simple token: "userId:role"
    const token = `${user.id}:${user.role}`;
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = db.getUserByEmail(email);
  if (!user || !db.verifyPassword(user.id, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = `${user.id}:${user.role}`;
  res.json({ user, token });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { name, phone, profile_image } = req.body;
  try {
    const updated = db.updateProfile(user.id, { name, phone, profile_image });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Update failed' });
  }
});

// ==========================================
// API Endpoints: Destinations
// ==========================================

app.get('/api/destinations', (req, res) => {
  const destinations = db.getDestinations();
  res.json(destinations);
});

app.get('/api/destinations/:id', (req, res) => {
  const destination = db.getDestination(req.params.id);
  if (!destination) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  res.json(destination);
});

app.post('/api/destinations', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const newDest = db.createDestination(req.body);
    res.json(newDest);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create destination' });
  }
});

// ==========================================
// API Endpoints: Packages
// ==========================================

app.get('/api/packages', (req, res) => {
  const packages = db.getPackages();
  res.json(packages);
});

app.get('/api/packages/:id', (req, res) => {
  const pkg = db.getPackage(req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }
  res.json(pkg);
});

app.post('/api/packages', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const newPkg = db.createPackage(req.body);
    res.json(newPkg);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create package' });
  }
});

// ==========================================
// API Endpoints: Bookings
// ==========================================

app.get('/api/bookings', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (user.role === UserRole.ADMIN) {
    res.json(db.getBookings());
  } else {
    res.json(db.getBookingsByUser(user.id));
  }
});

app.post('/api/bookings', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { packageId, travelers, totalCost, startDate, endDate } = req.body;
  if (!packageId || !travelers || !totalCost) {
    return res.status(400).json({ error: 'Package ID, travelers, and total cost are required' });
  }
  try {
    const booking = db.createBooking(user.id, packageId, travelers, totalCost, startDate || '', endDate || '');
    db.createNotification(user.id, 'Booking Confirmed 🎉', `Your tour package has been booked successfully for ${startDate || 'the requested dates'}.`);
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Booking failed' });
  }
});

app.put('/api/bookings/:id/status', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { status } = req.body;
  try {
    const updated = db.updateBookingStatus(req.params.id, status);
    db.createNotification(updated.user_id, 'Booking Status Updated', `Your booking status has been updated to ${status}.`);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update status' });
  }
});

// ==========================================
// API Endpoints: Reviews
// ==========================================

app.get('/api/reviews', (req, res) => {
  const { destination_id, package_id } = req.query;
  let reviews = db.getReviews();
  if (destination_id) {
    reviews = reviews.filter(r => r.destination_id === destination_id);
  }
  if (package_id) {
    reviews = reviews.filter(r => r.package_id === package_id);
  }
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { rating, comment, destination_id, package_id } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }
  try {
    const review = db.createReview(user.id, user.name, Number(rating), comment, destination_id, package_id, user.profile_image);
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create review' });
  }
});

// ==========================================
// API Endpoints: Blogs
// ==========================================

app.get('/api/blogs', (req, res) => {
  const blogs = db.getBlogs();
  res.json(blogs);
});

app.get('/api/blogs/:id', (req, res) => {
  const blog = db.getBlog(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  res.json(blog);
});

app.post('/api/blogs', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const newBlog = db.createBlog({
      ...req.body,
      author_id: user.id,
      author_name: user.name,
    });
    res.json(newBlog);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create blog' });
  }
});

app.get('/api/blogs/:id/comments', (req, res) => {
  const comments = db.getCommentsByBlog(req.params.id);
  res.json(comments);
});

app.post('/api/blogs/:id/comments', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  try {
    const newComment = db.createComment(req.params.id, user.id, user.name, comment);
    res.json(newComment);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add comment' });
  }
});

// ==========================================
// API Endpoints: Saved Trips
// ==========================================

app.get('/api/trips', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(db.getSavedTripsByUser(user.id));
});

app.post('/api/trips', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { name, itinerary, budget, destination_id, start_date, end_date } = req.body;
  if (!name || !itinerary) {
    return res.status(400).json({ error: 'Trip name and itinerary are required' });
  }
  try {
    const trip = db.createSavedTrip(user.id, name, itinerary, Number(budget) || 0, destination_id, start_date, end_date);
    res.json(trip);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save trip' });
  }
});

app.delete('/api/trips/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const success = db.deleteSavedTrip(req.params.id, user.id);
  if (!success) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  res.json({ success: true });
});

// ==========================================
// API Endpoints: Favorites
// ==========================================

app.get('/api/favorites', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(db.getFavoritesByUser(user.id));
});

app.post('/api/favorites/toggle', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { destinationId } = req.body;
  if (!destinationId) {
    return res.status(400).json({ error: 'Destination ID is required' });
  }
  const isFavorited = db.toggleFavorite(user.id, destinationId);
  res.json({ favorited: isFavorited });
});

// ==========================================
// API Endpoints: Contact Inbox
// ==========================================

app.get('/api/contact', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  res.json(db.getContactMessages());
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All contact fields are required' });
  }
  const msg = db.createContactMessage(name, email, subject, message);
  res.json(msg);
});

// ==========================================
// API Endpoints: Notifications
// ==========================================

app.get('/api/notifications', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(db.getNotificationsByUser(user.id));
});

app.post('/api/notifications/:id/read', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// ==========================================
// API Endpoints: Geocoding Proxy
// ==========================================

app.get('/api/proxy/countries', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch('https://restcountries.com/v3.1/all', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.log('Geocoding server proxy fetch failed: ', err.message);
    res.status(502).json({ error: 'Failed to fetch countries from source API' });
  }
});

// ==========================================
// API Endpoints: AI Gemini Integrations
// ==========================================

// AI Trip Planner Endpoint
app.post('/api/gemini/generate-trip', async (req, res) => {
  const { destination, budget, days, travelers, interests, specialRequirements, model } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  const selectedModel = model || 'gemini-3.5-flash';

  if (selectedModel === 'simulated-cognitive-node') {
    return res.json(createFallbackTrip(destination, days || 5, 'Simulated Offline Mode'));
  }

  const prompt = `Create a fully tailored travel itinerary with the following parameters:
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

  try {
    if (!geminiApiKey) {
      // Fallback if API key is not configured yet
      return res.json(createFallbackTrip(destination, days || 5));
    }

    const response = await generateContentWithFallback(selectedModel, prompt, 'application/json');

    const text = response.text || '';
    const parsed = JSON.parse(text.trim());
    
    // Support BOTH frontend and backend formats seamlessly
    const formatted = {
      ...parsed,
      destination: parsed.destination || destination,
      duration: Number(parsed.duration || days || 5),
      travelers: Number(parsed.travelers || travelers || 2),
      budget: Number(parsed.budget || budget || 30000),
      
      // Map both schemas to ensure frontend rendering works perfectly:
      weather_tips: parsed.weather_tips || parsed.weatherIntelligence || "Pleasant local conditions. Layering recommended.",
      packing_list: parsed.packing_list || parsed.packingChecklist || ["Travel documents", "All-weather footwear"],
      itinerary: (parsed.itinerary || parsed.dayByDay || []).map((day: any) => ({
        day: Number(day.day),
        title: day.title || "Sightseeing & Exploration",
        activities: day.activities || []
      })),
      budget_breakdown: parsed.budget_breakdown || {
        flight_transit: Number((parsed.costBreakdown && parsed.costBreakdown.flights) || (budget ? Math.floor(budget * 0.35) : 10000)),
        lodging: Number((parsed.costBreakdown && parsed.costBreakdown.accommodation) || (budget ? Math.floor(budget * 0.30) : 9000)),
        food_dining: Number((parsed.costBreakdown && parsed.costBreakdown.food) || (budget ? Math.floor(budget * 0.20) : 6000)),
        sightseeing_shopping: Number((parsed.costBreakdown && parsed.costBreakdown.activities) || (budget ? Math.floor(budget * 0.15) : 5000))
      }
    };
    res.json(formatted);
  } catch (err: any) {
    console.error('Gemini generateContent error:', err);
    // Provide structured fallback trip
    res.json(createFallbackTrip(destination, days || 5, err.message));
  }
});

// AI Travel Chatbot Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, userMessage, model } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const selectedModel = model || 'gemini-3.5-flash';

  if (selectedModel === 'simulated-cognitive-node') {
    return res.json({ text: `Hello! I am your AI Travel Assistant. (Note: Simulated Offline Mode is active. Here is a simulated response to your question: "${userMessage}"). You can explore our pre-populated premium tour packages and save trips to your dashboard!` });
  }

  try {
    if (!geminiApiKey) {
      return res.json({ text: `Hello! I am your AI Travel Assistant. (Note: Gemini API key is currently offline. Here is a simulated response to your question: "${userMessage}"). You can explore our pre-populated premium tour packages and save trips to your dashboard!` });
    }

    let chat;
    let response;
    
    // Attempt with the selected model, then fall back to reliable free models automatically if experiencing 503 high demand
    const modelsToTry = [selectedModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'].filter((val, idx, self) => self.indexOf(val) === idx);
    let chatError = null;
    
    for (const currentModel of modelsToTry) {
      try {
        chat = ai.chats.create({
          model: currentModel,
          config: {
            systemInstruction: 'You are Trippy, an elite, luxury AI Travel Concierge. Speak with sophistication, warmth, and high professional composure. Help users with smart, curated recommendations on food, hotels, packing lists, visa guides, local cultural rules, and hidden treasures. Avoid dry developer talk; sound like a premium private concierge.',
          }
        });

        response = await chat.sendMessage({ message: userMessage });
        break; // Successfully sent!
      } catch (err: any) {
        console.warn(`[Gemini Chat] Failed with model ${currentModel}:`, err.message || err);
        chatError = err;
        const status = err.status || (err.error && err.error.code);
        if (status === 400 || status === 401 || status === 403) {
          throw err;
        }
      }
    }

    if (response) {
      res.json({ text: response.text });
    } else {
      throw chatError || new Error("All chat models failed");
    }
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    // Provide a premium private concierge styled fallback instead of 500 error page
    res.json({ 
      text: `Hello! I am Trippy, your luxury AI Travel Concierge. I am currently running on our backup simulated channel because our main network is experiencing extremely high demand.

To address your query regarding "${userMessage}": I highly recommend exploring our pre-populated premium tour packages in the Packages section. They are curated with top-tier accommodations, private guided tours, and custom-tailored local itineraries! Let me know if you would like me to help with anything else.` 
    });
  }
});

// ==========================================
// API Endpoints: Weather Integration
// ==========================================
app.get('/api/weather', async (req, res) => {
  const city = req.query.city as string;
  const latStr = req.query.lat as string;
  const lonStr = req.query.lon as string;

  if (!city && (!latStr || !lonStr)) {
    return res.status(400).json({ error: 'City name or coordinates (lat/lon) are required' });
  }

  try {
    // 1. If lat/lon are explicitly passed
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (process.env.OPENWEATHER_API_KEY) {
        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
        const owmRes = await fetch(owmUrl);
        if (owmRes.ok) {
          const data = await owmRes.json();
          return res.json({
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            condition: data.weather[0].main,
            city: data.name,
            country: data.sys.country,
            source: 'openweathermap'
          });
        }
      }

      // Fallback to Open-Meteo
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&current_weather=true`;
      const meteoRes = await fetch(openMeteoUrl);
      if (meteoRes.ok) {
        const data = await meteoRes.json();
        const temp = data.current 
          ? Math.round(data.current.temperature_2m) 
          : (data.current_weather ? Math.round(data.current_weather.temperature) : 20);
          
        const code = data.current 
          ? data.current.weather_code 
          : (data.current_weather ? data.current_weather.weathercode : 0);
          
        const humidity = data.current && data.current.relative_humidity_2m !== undefined
          ? data.current.relative_humidity_2m
          : (code >= 51 && code <= 82 ? 85 : 55);
          
        const wind_speed = data.current && data.current.wind_speed_10m !== undefined
          ? Math.round(data.current.wind_speed_10m)
          : (data.current_weather ? Math.round(data.current_weather.windspeed) : 8);
        
        let description = 'Clear';
        let condition = 'Clear';
        if (code === 0) { description = 'Sunny & Clear'; condition = 'Clear'; }
        else if (code >= 1 && code <= 3) { description = 'Partly Cloudy'; condition = 'Cloudy'; }
        else if (code >= 45 && code <= 48) { description = 'Foggy'; condition = 'Fog'; }
        else if (code >= 51 && code <= 67) { description = 'Light Drizzle / Rain'; condition = 'Rain'; }
        else if (code >= 71 && code <= 77) { description = 'Snowy'; condition = 'Snow'; }
        else if (code >= 80 && code <= 82) { description = 'Rain Showers'; condition = 'Rain'; }
        else if (code >= 95 && code <= 99) { description = 'Thunderstorms'; condition = 'Thunderstorm'; }

        return res.json({
          temp,
          description,
          humidity,
          wind_speed,
          condition,
          city: city || 'Local Center',
          country: '',
          source: 'open-meteo'
        });
      }
    }

    // 2. If city is passed
    if (city) {
      if (process.env.OPENWEATHER_API_KEY) {
        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
        const owmRes = await fetch(owmUrl);
        if (owmRes.ok) {
          const data = await owmRes.json();
          return res.json({
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            condition: data.weather[0].main,
            city: data.name,
            country: data.sys.country,
            source: 'openweathermap'
          });
        }
      }

      // Fallback via Geocoding + Open-Meteo
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, name: geoName, country } = geoData.results[0];
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&current_weather=true`;
          const weatherRes = await fetch(weatherUrl);
          if (weatherRes.ok) {
            const weatherData = await weatherRes.json();
            const temp = weatherData.current 
              ? Math.round(weatherData.current.temperature_2m) 
              : (weatherData.current_weather ? Math.round(weatherData.current_weather.temperature) : 20);
              
            const code = weatherData.current 
              ? weatherData.current.weather_code 
              : (weatherData.current_weather ? weatherData.current_weather.weathercode : 0);
              
            const humidity = weatherData.current && weatherData.current.relative_humidity_2m !== undefined
              ? weatherData.current.relative_humidity_2m
              : (code >= 51 && code <= 82 ? 85 : 55);
              
            const wind_speed = weatherData.current && weatherData.current.wind_speed_10m !== undefined
              ? Math.round(weatherData.current.wind_speed_10m)
              : (weatherData.current_weather ? Math.round(weatherData.current_weather.windspeed) : 8);
            
            let description = 'Clear';
            let condition = 'Clear';
            if (code === 0) { description = 'Sunny & Clear'; condition = 'Clear'; }
            else if (code >= 1 && code <= 3) { description = 'Partly Cloudy'; condition = 'Cloudy'; }
            else if (code >= 45 && code <= 48) { description = 'Foggy'; condition = 'Fog'; }
            else if (code >= 51 && code <= 67) { description = 'Light Drizzle / Rain'; condition = 'Rain'; }
            else if (code >= 71 && code <= 77) { description = 'Snowy'; condition = 'Snow'; }
            else if (code >= 80 && code <= 82) { description = 'Rain Showers'; condition = 'Rain'; }
            else if (code >= 95 && code <= 99) { description = 'Thunderstorms'; condition = 'Thunderstorm'; }

            return res.json({
              temp,
              description,
              humidity,
              wind_speed,
              condition,
              city: geoName,
              country,
              source: 'open-meteo'
            });
          }
        }
      }
    }

    // Default Fallback
    res.json({
      temp: 22,
      description: 'Mild & Scenic',
      humidity: 55,
      wind_speed: 10,
      condition: 'Clear',
      city: city || 'Unknown',
      country: '',
      source: 'fallback'
    });

  } catch (err: any) {
    console.error('Weather fetching error:', err);
    res.json({
      temp: 20,
      description: 'Pleasant Breeze',
      humidity: 60,
      wind_speed: 12,
      condition: 'Clouds',
      city: city || 'Destination',
      country: '',
      source: 'error-fallback'
    });
  }
});

// ==========================================
// API Endpoints: Dynamic AI Destination Discovery
// ==========================================
app.post('/api/gemini/discover-destination', async (req, res) => {
  const { query, model } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const selectedModel = model || 'gemini-3.5-flash';

  // Check if a destination with this name or city already exists (case insensitive)
  const existing = db.getDestinations().find(
    d => d.name.toLowerCase() === query.toLowerCase() || d.city.toLowerCase() === query.toLowerCase()
  );
  if (existing) {
    return res.json(existing);
  }

  try {
    if (selectedModel === 'simulated-cognitive-node' || !geminiApiKey) {
      // Fallback: Generate a simulated destination so it works offline
      const mockResult = createSimulatedDestination(query);
      const saved = db.createDestination(mockResult);
      return res.json(saved);
    }

    const prompt = `Identify and generate authentic, accurate travel details for the place: "${query}".
Provide realistic values, especially for the city, country, best season, coordinates, and atmosphere description.
The budget_range should be in Indian Rupees (INR) format (e.g. "₹45,000 - ₹65,000").
The category MUST be exactly one of: 'beach', 'mountains', 'adventure', 'family'. Choose the most fitting.
The travel_style MUST be exactly one of: 'luxury', 'adventure', 'budget'.
The climate MUST be exactly one of: 'tropical', 'alpine', 'moderate', 'desert'.`;

    const response = await generateContentWithFallback(selectedModel, prompt, 'application/json', {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Display name of the destination" },
        city: { type: Type.STRING, description: "Primary city or hub name" },
        country: { type: Type.STRING, description: "Country name" },
        description: { type: Type.STRING, description: "Atmospheric, premium description of the place (3-4 sentences)" },
        latitude: { type: Type.NUMBER, description: "Approximate latitude coordinate" },
        longitude: { type: Type.NUMBER, description: "Approximate longitude coordinate" },
        budget_range: { type: Type.STRING, description: "Estimated standard cost in INR, e.g. '₹50,000 - ₹80,000'" },
        best_season: { type: Type.STRING, description: "Best period to visit, e.g. 'October - May'" },
        category: { type: Type.STRING, description: "MUST be one of: beach, mountains, adventure, family" },
        travel_style: { type: Type.STRING, description: "MUST be one of: luxury, adventure, budget" },
        climate: { type: Type.STRING, description: "MUST be one of: tropical, alpine, moderate, desert" }
      },
      required: ["name", "city", "country", "description", "latitude", "longitude", "budget_range", "best_season", "category", "travel_style", "climate"]
    });

    const parsed = JSON.parse((response.text || '').trim());
    
    // Choose a scenic image based on the generated category
    const imagesByCategory: Record<string, string[]> = {
      beach: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80'
      ],
      mountains: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80'
      ],
      adventure: [
        'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=1200&q=80'
      ],
      family: [
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80'
      ]
    };

    const list = imagesByCategory[parsed.category.toLowerCase()] || imagesByCategory.adventure;
    const selectedImage = list[Math.floor(Math.random() * list.length)];

    const finalDest = {
      name: parsed.name,
      description: parsed.description,
      country: parsed.country,
      city: parsed.city,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      image_url: selectedImage,
      budget_range: parsed.budget_range,
      best_season: parsed.best_season,
      category: parsed.category.toLowerCase(),
      is_featured: false,
      travel_style: parsed.travel_style.toLowerCase(),
      climate: parsed.climate.toLowerCase()
    };

    const saved = db.createDestination(finalDest);
    res.json(saved);

  } catch (err: any) {
    console.error('Discover destination error:', err);
    // Fallback simulated destination on error
    const mockResult = createSimulatedDestination(query);
    const saved = db.createDestination(mockResult);
    res.json(saved);
  }
});

function createSimulatedDestination(query: string) {
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
    climate: 'moderate'
  };
}

// AI Destination Recommender Endpoint
app.post('/api/gemini/recommendations', async (req, res) => {
  const { budget, days, interests, model } = req.body;

  const selectedModel = model || 'gemini-3.5-flash';

  if (selectedModel === 'simulated-cognitive-node' || !geminiApiKey) {
    return res.json(createFallbackRecommendations());
  }

  const prompt = `Recommend exactly 5 exceptional travel destinations for a traveller with these preferences:
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

  try {
    const response = await generateContentWithFallback(selectedModel, prompt, 'application/json');

    const parsed = JSON.parse((response.text || '').trim());
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini recommendations error:', err);
    res.json(createFallbackRecommendations());
  }
});

// Mock Fallback generators
function createFallbackTrip(dest: string, days: number, errMsg = '') {
  const dayList = [];
  for (let i = 1; i <= days; i++) {
    dayList.push({
      day: i,
      title: `Explore beautiful ${dest} - Day ${i}`,
      activities: [
        `Start day with luxury local breakfast session`,
        `Explore iconic sightseeing spots and cultural landmarks in ${dest}`,
        `Evening fine dining curated experience and beach/mountain sunset observation`
      ],
      accommodation: `Premium 4-Star Resort in ${dest}`
    });
  }
  return {
    tripName: `Elite Curated Escape to ${dest}`,
    destination: dest,
    duration: days,
    estimatedCostRange: "₹25,000 - ₹35,000",
    costBreakdown: {
      accommodation: 10000,
      flights: 12000,
      food: 4000,
      activities: 3000,
      localTransport: 2000
    },
    dayByDay: dayList,
    packingChecklist: [
      "Comfortable high-quality walking shoes",
      "Local travel electrical adapter",
      "Essential documents and light jackets"
    ],
    visaGuidance: "Visa-on-arrival or easy eVisa application is recommended for tourists.",
    weatherIntelligence: "Pleasant local weather with clear, eye-safe sunny skies.",
    
    // Frontend compatibility keys:
    weather_tips: "Pleasant local weather with clear, eye-safe sunny skies.",
    packing_list: [
      "Comfortable high-quality walking shoes",
      "Local travel electrical adapter",
      "Essential documents and light jackets"
    ],
    itinerary: dayList,
    budget_breakdown: {
      flight_transit: 12000,
      lodging: 10000,
      food_dining: 4000,
      sightseeing_shopping: 5000
    },
    budget: 31000,
    travelers: 2,
    _fallback: true,
    _error: errMsg
  };
}

function createFallbackRecommendations() {
  return [
    { name: 'Gokarna', country: 'India', description: 'A peaceful, less-crowded alternative to northern beaches. Famous for high cliffs overlooking blue waters and clean, sandy shores.', vibe: 'Peaceful', climate: 'Tropical, 28°C', avgCost: '₹12,000' },
    { name: 'Leh Ladakh', country: 'India', description: 'A land of magnificent high mountain passes, emerald lakes, and rich Tibetan Buddhist monasteries.', vibe: 'Adventurous', climate: 'Cool alpine, 12°C', avgCost: '₹35,000' },
    { name: 'Kyoto', country: 'Japan', description: 'Immerse in ancient Japanese heritage with hundreds of pristine temples, bamboo groves, and traditional tea ceremonies.', vibe: 'Cultural', climate: 'Mild spring, 18°C', avgCost: '₹95,000' },
    { name: 'Srinagar', country: 'India', description: 'The Venice of the East, known for wooden houseboats floating on peaceful Dal Lake and royal Mughal flower gardens.', vibe: 'Romantic', climate: 'Cool mountain, 16°C', avgCost: '₹22,000' },
    { name: 'Ooty', country: 'India', description: 'A beautiful colonial-era hill station nestled in Nilgiri Hills, boasting endless rows of emerald-green tea plantations.', vibe: 'Relaxing', climate: 'Mist cool, 15°C', avgCost: '₹15,000' }
  ];
}


// ==========================================
// Vite Middleware setup for Asset Serving
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
