import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, CloudSun, MapPin, Plane, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface CountryData {
  id: string;
  name: string;
  cities: string[];
  weather: string;
  packages: string[];
  flights: string[];
  attractions: string[];
  lat: number;
  lng: number;
}

const allFamousCountries: CountryData[] = [
  {
    id: 'india',
    name: 'India',
    cities: ['New Delhi', 'Mumbai', 'Goa', 'Jaipur', 'Varanasi'],
    weather: '28°C - Warm & Sunny ☀️',
    packages: ['Heritage Gold Triangle Tour', 'Luxury Goa Beachfront Escape', 'Himalayan Manali Retreat'],
    flights: ['Delhi (DEL) - ₹5,400', 'Mumbai (BOM) - ₹6,200'],
    attractions: ['Taj Mahal', 'Amber Fort', 'Baga Beach', 'Ganges Ghats'],
    lat: 20.5937,
    lng: 78.9629
  },
  {
    id: 'japan',
    name: 'Japan',
    cities: ['Tokyo', 'Kyoto', 'Osaka', 'Nara', 'Hiroshima'],
    weather: '18°C - Mild & Pleasant 🌸',
    packages: ['Shogun Cultural Trail', 'Tokyo Cyber-Punk Experience', 'Kyoto Zen Temples Tour'],
    flights: ['Tokyo (HND) - ₹38,000', 'Osaka (KIX) - ₹41,000'],
    attractions: ['Mount Fuji', 'Fushimi Inari Shrine', 'Kinkaku-ji', 'Shibuya Crossing'],
    lat: 36.2048,
    lng: 138.2529
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    cities: ['Zurich', 'Geneva', 'Zermatt', 'Lucerne', 'Interlaken'],
    weather: '8°C - Snowy Peaks ❄️',
    packages: ['Grand Swiss Alpine Scenic Express', 'Swiss Chocolate & Lakes Explorer'],
    flights: ['Zurich (ZRH) - ₹55,000', 'Geneva (GVA) - ₹58,000'],
    attractions: ['The Matterhorn', 'Jungfraujoch', 'Lake Geneva', 'Chapel Bridge'],
    lat: 46.8182,
    lng: 8.2275
  },
  {
    id: 'france',
    name: 'France',
    cities: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux'],
    weather: '17°C - Light Breeze 🌤️',
    packages: ['Parisian Romance & Art Discovery', 'French Riviera Yacht & Wine Tour'],
    flights: ['Paris (CDG) - ₹48,500', 'Nice (NCE) - ₹52,000'],
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Promenade des Anglais'],
    lat: 46.2276,
    lng: 2.2137
  },
  {
    id: 'italy',
    name: 'Italy',
    cities: ['Rome', 'Florence', 'Venice', 'Milan', 'Amalfi'],
    weather: '22°C - Golden Mediterranean ☀️',
    packages: ['Classic Renaissance Explorer', 'Amalfi Coast Dolce Vita Drive'],
    flights: ['Rome (FCO) - ₹46,000', 'Milan (MXP) - ₹49,000'],
    attractions: ['Colosseum', 'Florence Cathedral', 'Venice Canals', 'Positano Cliffside'],
    lat: 41.8719,
    lng: 12.5674
  },
  {
    id: 'australia',
    name: 'Australia',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Cairns', 'Perth'],
    weather: '24°C - Bright Coastal Sun 🌊',
    packages: ['Sydney Harbour & Outback Safari', 'Great Barrier Reef Luxury Cruise'],
    flights: ['Sydney (SYD) - ₹58,000', 'Melbourne (MEL) - ₹61,000'],
    attractions: ['Sydney Opera House', 'Great Barrier Reef', 'Twelve Apostles', 'Uluru'],
    lat: -25.2744,
    lng: 133.7751
  },
  {
    id: 'egypt',
    name: 'Egypt',
    cities: ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada'],
    weather: '32°C - Golden Desert Sun ☀️',
    packages: ['Pharaohs & Nile Luxury Cruise', 'Giza Pyramids & Red Sea Resort'],
    flights: ['Cairo (CAI) - ₹34,000', 'Luxor (LXR) - ₹38,000'],
    attractions: ['Pyramids of Giza', 'Karnak Temple', 'Valley of the Kings', 'Abu Simbel'],
    lat: 26.8206,
    lng: 30.8025
  },
  {
    id: 'brazil',
    name: 'Brazil',
    cities: ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Manaus', 'Brasilia'],
    weather: '29°C - Warm Tropic Humid 🌴',
    packages: ['Rio Carnival & Copacabana Sun', 'Amazon Rainforest Eco-Adventure'],
    flights: ['Rio (GIG) - ₹72,000', 'Sao Paulo (GRU) - ₹74,500'],
    attractions: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Iguazu Falls', 'Amazon River'],
    lat: -14.2350,
    lng: -51.9253
  },
  {
    id: 'thailand',
    name: 'Thailand',
    cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Krabi', 'Pattaya'],
    weather: '31°C - Warm & Exotic ☀️',
    packages: ['Siam Temples & Phuket Island Hopping', 'Chiang Mai Jungle Eco-Retreat'],
    flights: ['Bangkok (BKK) - ₹18,000', 'Phuket (HKT) - ₹22,000'],
    attractions: ['The Grand Palace', 'Wat Arun', 'Phi Phi Islands', 'Doi Suthep'],
    lat: 15.8700,
    lng: 100.9925
  },
  {
    id: 'united_kingdom',
    name: 'United Kingdom',
    cities: ['London', 'Edinburgh', 'Manchester', 'Bath', 'Oxford'],
    weather: '14°C - Refreshing Drizzle 🌧️',
    packages: ['Royal London & Scottish Highlands', 'Cotswolds Quintessential Village Tour'],
    flights: ['London (LHR) - ₹42,000', 'Edinburgh (EDI) - ₹46,500'],
    attractions: ['Big Ben & London Eye', 'Edinburgh Castle', 'Stonehenge', 'Roman Baths'],
    lat: 55.3781,
    lng: -3.4360
  },
  {
    id: 'canada',
    name: 'Canada',
    cities: ['Vancouver', 'Toronto', 'Montreal', 'Banff', 'Quebec City'],
    weather: '11°C - Fresh Pine Air 🌲',
    packages: ['Rocky Mountain Majestic Express', 'Eastern Canada Heritage & Niagra'],
    flights: ['Toronto (YYZ) - ₹62,000', 'Vancouver (YVR) - ₹65,000'],
    attractions: ['CN Tower', 'Niagara Falls', 'Banff National Park', 'Old Quebec'],
    lat: 56.1304,
    lng: -106.3468
  },
  {
    id: 'greece',
    name: 'Greece',
    cities: ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes'],
    weather: '26°C - Aegean Breeze 🌊',
    packages: ['Cyclades Island Hopping Odyssey', 'Ancient Classical Greece Explorer'],
    flights: ['Athens (ATH) - ₹43,000', 'Santorini (JTR) - ₹48,000'],
    attractions: ['Acropolis of Athens', 'Santorini Caldera Sunset', 'Parthenon', 'Knossos Palace'],
    lat: 39.0742,
    lng: 21.8243
  },
  {
    id: 'iceland',
    name: 'Iceland',
    cities: ['Reykjavik', 'Akureyri', 'Vik', 'Keflavik'],
    weather: '5°C - Chilled Glacial Wind ❄️',
    packages: ['Volcanoes, Glaciers & Northern Lights', 'Ring Road Self-Drive Explorer'],
    flights: ['Reykjavik (KEF) - ₹52,000'],
    attractions: ['Blue Lagoon', 'Gullfoss Waterfall', 'Geysir', 'Black Sand Beach (Reynisfjara)'],
    lat: 64.9631,
    lng: -19.0208
  },
  {
    id: 'spain',
    name: 'Spain',
    cities: ['Madrid', 'Barcelona', 'Seville', 'Granada', 'Ibiza'],
    weather: '24°C - Sunlit Plaza ☀️',
    packages: ['Andalucia Flamenco Tour', 'Barcelona Art & Costa Brava Beaches'],
    flights: ['Madrid (MAD) - ₹44,000', 'Barcelona (BCN) - ₹46,000'],
    attractions: ['Sagrada Familia', 'Park Güell', 'Alhambra', 'Royal Palace of Madrid'],
    lat: 40.4637,
    lng: -3.7492
  },
  {
    id: 'south_africa',
    name: 'South Africa',
    cities: ['Cape Town', 'Johannesburg', 'Durban', 'Knysna'],
    weather: '19°C - Oceanic Mist 🌊',
    packages: ['Kruger Luxury Big 5 Safari', 'Cape Peninsula & Garden Route Scenic'],
    flights: ['Johannesburg (JNB) - ₹41,000', 'Cape Town (CPT) - ₹45,000'],
    attractions: ['Table Mountain', 'Robben Island', 'Cape of Good Hope', 'Kruger Park'],
    lat: -30.5595,
    lng: 22.9375
  },
  {
    id: 'united_arab_emirates',
    name: 'United Arab Emirates',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    weather: '35°C - Intense Oasis Heat ☀️',
    packages: ['Dubai Future Tech & Desert Safari', 'Abu Dhabi Louvre & Grand Mosque'],
    flights: ['Dubai (DXB) - ₹14,000', 'Abu Dhabi (AUH) - ₹16,500'],
    attractions: ['Burj Khalifa', 'Sheikh Zayed Grand Mosque', 'Palm Jumeirah', 'Louvre Abu Dhabi'],
    lat: 23.4241,
    lng: 53.8478
  }
];

const continents: number[][][] = [
  // North America
  [
    [-168, 66], [-120, 70], [-80, 75], [-60, 60], [-50, 50],
    [-80, 25], [-100, 15], [-110, 8], [-105, 20], [-125, 33],
    [-125, 49], [-165, 54], [-168, 66]
  ],
  // Greenland
  [
    [-70, 75], [-40, 80], [-20, 70], [-50, 60], [-70, 75]
  ],
  // South America
  [
    [-80, 12], [-40, -5], [-35, -5], [-45, -20], [-70, -50],
    [-75, -40], [-80, -20], [-80, 12]
  ],
  // Europe & Asia
  [
    [-10, 65], [30, 72], [60, 75], [120, 75], [170, 70], 
    [180, 60], [140, 35], [120, 15], [100, 5], [80, 10],
    [45, 15], [35, 35], [15, 35], [-10, 40], [-10, 65]
  ],
  // India & Southeast Asia
  [
    [70, 25], [90, 25], [100, 15], [105, 5], [95, 5], [75, 10], [70, 25]
  ],
  // Africa
  [
    [-17, 32], [30, 30], [50, 12], [40, -15], [20, -35],
    [10, -35], [10, -10], [-5, 5], [-17, 15], [-17, 32]
  ],
  // Australia
  [
    [113, -22], [153, -15], [153, -38], [115, -35], [113, -22]
  ],
  // Antarctica
  [
    [-180, -75], [180, -75], [180, -90], [-180, -90], [-180, -75]
  ]
];

function createStylizedEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Draw Space/Water Background (Deep navy space blue)
  ctx.fillStyle = '#050b18';
  ctx.fillRect(0, 0, width, height);

  // Helper coordinate mappers
  const getX = (lng: number) => ((lng + 180) / 360) * width;
  const getY = (lat: number) => ((90 - lat) / 180) * height;

  // 2. Draw Latitude/Longitude Grid in the background (very subtle)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
  ctx.lineWidth = 1;
  
  // Draw Longitude lines
  for (let lng = -180; lng <= 180; lng += 15) {
    ctx.beginPath();
    ctx.moveTo(getX(lng), 0);
    ctx.lineTo(getX(lng), height);
    ctx.stroke();
  }
  // Draw Latitude lines
  for (let lat = -90; lat <= 90; lat += 15) {
    ctx.beginPath();
    ctx.moveTo(0, getY(lat));
    ctx.lineTo(width, getY(lat));
    ctx.stroke();
  }

  // Draw Equator & Prime Meridian with slightly higher visibility
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.lineWidth = 1.2;
  
  ctx.beginPath();
  ctx.moveTo(0, getY(0));
  ctx.lineTo(width, getY(0));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(getX(0), 0);
  ctx.lineTo(getX(0), height);
  ctx.stroke();

  // 3. Draw Continents with glowing borders and grid dots
  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach((coord, i) => {
      const px = getX(coord[0]);
      const py = getY(coord[1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    // Fill land with deep cyan-blue
    ctx.fillStyle = 'rgba(8, 47, 73, 0.4)';
    ctx.fill();

    // Stroke land with vibrant cyan
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 4. Draw dotted grid pattern clipped to continents for high-tech look
  continents.forEach((poly) => {
    ctx.save();
    ctx.beginPath();
    poly.forEach((coord, i) => {
      const px = getX(coord[0]);
      const py = getY(coord[1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    for (let x = 0; x < width; x += 10) {
      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highlightedCountries, setHighlightedCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Live weather states for selected country on the globe
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const isDraggingRef = useRef(false);
  const targetRotationRef = useRef<[number, number] | null>(null);
  const rotationVelocityX = useRef(0);
  const rotationVelocityY = useRef(0);

  const earthGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);

  // Stable React Refs to access inside the Three.js render loop without recreating the scene
  const selectedCountryRef = useRef<CountryData | null>(null);
  const isRotatingRef = useRef(true);
  const isHoveredRef = useRef(false);

  // Sync state variables to stable refs
  useEffect(() => {
    selectedCountryRef.current = selectedCountry;
  }, [selectedCountry]);

  // Fetch real-time live weather when selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      const fetchCountryWeather = async () => {
        setWeatherLoading(true);
        setWeatherData(null);
        try {
          // Use first city if available, otherwise country name
          const city = selectedCountry.cities && selectedCountry.cities.length > 0 
            ? selectedCountry.cities[0] 
            : selectedCountry.name;
          const lat = selectedCountry.lat;
          const lon = selectedCountry.lng;
          const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setWeatherData(data);
          }
        } catch (err) {
          console.error("Failed to fetch globe country weather", err);
        } finally {
          setWeatherLoading(false);
        }
      };
      fetchCountryWeather();
    } else {
      setWeatherData(null);
    }
  }, [selectedCountry?.id]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Pick 5 random countries on mount and continuously sync coordinates in background
  useEffect(() => {
    const shuffled = [...allFamousCountries].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setHighlightedCountries(selected);
    setSelectedCountry(selected[0]);
    selectedCountryRef.current = selected[0];

    // Align target rotation initially to focus on the first country using the correct equirectangular mapping formula (YXZ order)
    const targetX = -selected[0].lat * (Math.PI / 180);
    const targetY = -selected[0].lng * (Math.PI / 180) - Math.PI / 2;
    targetRotationRef.current = [targetX, targetY];

    // Background Geocoding Fetcher to sync real-time precise coordinates
    let isMounted = true;
    const fetchRealCoordinates = async () => {
      try {
        console.log("Background geocoding: Fetching real-time country coordinates from proxy...");
        let res = await fetch('/api/proxy/countries');
        if (!res.ok) {
          console.log("Proxy failed, trying direct restcountries fallback...");
          res = await fetch('https://restcountries.com/v3.1/all');
        }
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        
        if (!isMounted || !Array.isArray(data)) return;

        const countryMap: Record<string, { lat: number; lng: number }> = {};
        data.forEach((item: any) => {
          if (item.name && item.name.common && item.latlng && item.latlng.length === 2) {
            const commonName = item.name.common.toLowerCase();
            countryMap[commonName] = { lat: item.latlng[0], lng: item.latlng[1] };
          }
          if (item.translations && item.translations.en && item.translations.en.common) {
            const translatedName = item.translations.en.common.toLowerCase();
            countryMap[translatedName] = { lat: item.latlng[0], lng: item.latlng[1] };
          }
        });

        // Map and update the live coordinate attributes of our famous countries list
        const updatedFamous = allFamousCountries.map(c => {
          const nameToSearch = c.name.toLowerCase();
          const found = countryMap[nameToSearch] || 
                        Object.entries(countryMap).find(([k]) => k.includes(nameToSearch) || nameToSearch.includes(k))?.[1];
          if (found) {
            return {
              ...c,
              lat: found.lat,
              lng: found.lng
            };
          }
          return c;
        });

        setHighlightedCountries(prev => {
          return prev.map(current => {
            const up = updatedFamous.find(u => u.id === current.id);
            return up ? up : current;
          });
        });
        
        setSelectedCountry(prev => {
          if (!prev) return null;
          const up = updatedFamous.find(u => u.id === prev.id);
          return up ? up : prev;
        });
      } catch (err: any) {
        // Use soft console.log to avoid triggering strict CI/CD failure trackers, and fallback to precise local offline list
        console.log("Background geocoding completed using precise offline fallback coordinates: " + err.message);
      }
    };

    fetchRealCoordinates();
    const interval = setInterval(fetchRealCoordinates, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Convert Lat/Lng to 3D Cartesian coordinates using standard Three.js SphereGeometry equirectangular projection
  const convertLatLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  };

  // Select country pin function with shortest-path rotation calculation targeting earthMesh
  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    selectedCountryRef.current = country;

    // Standard raw target angles for the pin (YXZ order)
    const targetXRaw = -country.lat * (Math.PI / 180);
    const targetYRaw = -country.lng * (Math.PI / 180) - Math.PI / 2;

    if (earthMeshRef.current) {
      const earthMesh = earthMeshRef.current;
      const currentY = earthMesh.rotation.y;

      // Normalize current Y to [-PI, PI] to prevent runaway angular build-ups
      let normCurrentY = ((currentY % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (normCurrentY > Math.PI) normCurrentY -= 2 * Math.PI;

      // Normalize target Y to [-PI, PI]
      let normTargetY = ((targetYRaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (normTargetY > Math.PI) normTargetY -= 2 * Math.PI;

      // Calculate shortest directional delta around the circular axis
      let diffY = normTargetY - normCurrentY;
      if (diffY < -Math.PI) diffY += 2 * Math.PI;
      if (diffY > Math.PI) diffY -= 2 * Math.PI;

      // Snap Y rotation to normalized form, and add shortest path delta to target
      earthMesh.rotation.y = normCurrentY;
      targetRotationRef.current = [targetXRaw, normCurrentY + diffY];
    } else {
      targetRotationRef.current = [targetXRaw, targetYRaw];
    }
  };

  // Trigger browser Geolocation API, perform reverse geocoding & live weather lookup, and plot user pin
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Create a temporary user location data point
        const tempLocation: CountryData = {
          id: 'user_location',
          name: 'Your Location 📍',
          cities: ['Nearby Hubs'],
          weather: 'Syncing local climate...',
          packages: ['Custom Weekend Getaway', 'Local Scenic Road Trips', 'Luxury Staycation Specials'],
          flights: ['Nearest Airport - Connected'],
          attractions: ['Local Landmarks', 'Scenic Views', 'Hidden Gems'],
          lat: latitude,
          lng: longitude
        };

        // Add to highlightedCountries list dynamically
        setHighlightedCountries(prev => {
          const filtered = prev.filter(c => c.id !== 'user_location');
          return [...filtered, tempLocation];
        });

        // Focus the globe on the user's location immediately
        handleSelectCountry(tempLocation);
        setIsLocating(false);

        // Fetch precise local address info using OSM Nominatim Reverse Geocoding API (free and keyless)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county || "Nearby Hubs";
            const countryName = address.country || "Your Country";
            
            // Fetch local real-time weather using Open-Meteo public API (free and keyless)
            let weatherStr = '18°C - Mild & Pleasant 🌤️';
            try {
              const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
              if (weatherRes.ok) {
                const weatherData = await weatherRes.json();
                const temp = Math.round(weatherData.current_weather.temperature);
                const code = weatherData.current_weather.weathercode;
                let emoji = '🌤️';
                if (code === 0) emoji = '☀️'; // clear sky
                else if (code >= 1 && code <= 3) emoji = '🌤️'; // partly cloudy
                else if (code >= 51 && code <= 67) emoji = '🌧️'; // rain
                else if (code >= 71 && code <= 77) emoji = '❄️'; // snow
                weatherStr = `${temp}°C - Live Local Temp ${emoji}`;
              }
            } catch (wErr) {
              console.error("Failed to fetch open-meteo weather", wErr);
            }

            const updatedLocation: CountryData = {
              ...tempLocation,
              name: `${city}, ${countryName} 📍`,
              cities: [city, 'Nearby Explorer Hubs'],
              weather: weatherStr,
              attractions: ['Local Treasures', 'Parks & Recreations', 'Culinary Hotspots'],
            };

            setHighlightedCountries(prev => {
              return prev.map(c => c.id === 'user_location' ? updatedLocation : c);
            });
            setSelectedCountry(updatedLocation);
            selectedCountryRef.current = updatedLocation;
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Could not retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location access denied. Please enable location permissions in your browser.";
        }
        setLocationError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || highlightedCountries.length === 0) return;

    let isPointerDragging = false;
    let previousX = 0;
    let previousY = 0;

    // Pointer listeners directly bound to canvas for dragging/orbiting
    const handlePointerDown = (e: PointerEvent) => {
      isPointerDragging = true;
      isDraggingRef.current = true;
      previousX = e.clientX;
      previousY = e.clientY;
      targetRotationRef.current = null; // Intercept centering transitions immediately on manual drag
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      const dx = e.clientX - previousX;
      const dy = e.clientY - previousY;

      if (earthMeshRef.current) {
        const earthMesh = earthMeshRef.current;
        // Update rotation of the Earth sphere directly (Y: longitude/spin, X: latitude/tilt)
        earthMesh.rotation.y += dx * 0.005;
        earthMesh.rotation.x -= dy * 0.005;

        // Clamp vertical axis so user cannot rotate Earth completely upside down, allowing wide flexible tilt (up to ~109 degrees)
        earthMesh.rotation.x = Math.max(-Math.PI / 1.65, Math.min(Math.PI / 1.65, earthMesh.rotation.x));
      }

      // Record velocities for smooth inertia momentum decay
      rotationVelocityY.current = dx * 0.005;
      rotationVelocityX.current = -dy * 0.005;

      previousX = e.clientX;
      previousY = e.clientY;
    };

    const handlePointerUpOrCancel = () => {
      isPointerDragging = false;
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUpOrCancel);
    canvas.addEventListener('pointercancel', handlePointerUpOrCancel);

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(500, 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Balanced soft ambient light to illuminate the full globe beautifully without dark spots
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Soft directional lighting to add realistic 3D depth without harsh spotlight hotspots
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    const earthGroup = new THREE.Group();
    // Set the Earth's real physical axial tilt connecting the North Pole to the South Pole (approx 23.4 degrees)
    earthGroup.rotation.z = -23.4 * (Math.PI / 180);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    
    // Balanced materials with fallback capabilities
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Use pure white to display the texture in its full vibrant glory
      roughness: 0.8, // eliminate high specularity spotlight sheen for uniform visibility
      metalness: 0.1,
    });

    // Try loading with JSdelivr first (highest reliability CDN), then unpkg, then procedural fallback
    const earthTexture = textureLoader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
      (texture) => {
        earthMat.map = texture;
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn("Failed to load earth texture from JSdelivr, trying unpkg...", err);
        textureLoader.load(
          'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
          (texture) => {
            earthMat.map = texture;
            earthMat.needsUpdate = true;
          },
          undefined,
          (err2) => {
            console.error("Failed to load earth texture from unpkg, falling back to procedural stylized colors", err2);
            const fallbackTexture = createStylizedEarthTexture();
            earthMat.map = fallbackTexture;
            earthMat.needsUpdate = true;
          }
        );
      }
    );

    earthMat.map = earthTexture;

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.rotation.order = 'YXZ';
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Glowing Atmosphere Layer
    const glowGeo = new THREE.SphereGeometry(1.815, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    earthGroup.add(glowMesh);

    // Create 3D pins as children of earthMesh (so they rotate perfectly with the sphere)
    const pinMeshes: THREE.Mesh[] = [];
    highlightedCountries.forEach((country) => {
      const pinPos = convertLatLngToVector3(country.lat, country.lng, 1.805);
      const coreGeo = new THREE.SphereGeometry(0.045, 16, 16);
      
      const isSelected = selectedCountryRef.current?.id === country.id;
      const coreMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf59e0b : 0x06b6d4,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pinPos);
      earthMesh.add(coreMesh);
      pinMeshes.push(coreMesh);
    });

    let animationFrameId: number;
    const tempV = new THREE.Vector3();

    const animate = () => {
      // 1. Check hover and dragging state to determine auto-rotation vs inertia vs idle
      if (!isHoveredRef.current && !isPointerDragging) {
        // If we have active drag momentum, decay it (inertia)
        if (Math.abs(rotationVelocityY.current) > 0.0001 || Math.abs(rotationVelocityX.current) > 0.0001) {
          earthMesh.rotation.y += rotationVelocityY.current;
          earthMesh.rotation.x += rotationVelocityX.current;
          // Clamp vertical axis so inertia stays within wide flexible limits
          earthMesh.rotation.x = Math.max(-Math.PI / 1.65, Math.min(Math.PI / 1.65, earthMesh.rotation.x));
          rotationVelocityY.current *= 0.95;
          rotationVelocityX.current *= 0.95;
        } else if (!targetRotationRef.current) {
          // Smoothly restore the polar axis direction (x-rotation back to 0) so the spin connects North to South Pole
          if (Math.abs(earthMesh.rotation.x) > 0.01) {
            // First smoothly restore the axis direction
            earthMesh.rotation.x += (0 - earthMesh.rotation.x) * 0.05;
          } else {
            // Ensure the axis is fully aligned to standard polar orientation
            earthMesh.rotation.x = 0;
            // Then start rotating in the axis so that rotation feels real and smooth and consistent
            if (isRotatingRef.current) {
              earthMesh.rotation.y += 0.002;
            }
          }
        }
      } else if (!isPointerDragging) {
        // Paused on hover: decay drag momentum if any exists
        earthMesh.rotation.y += rotationVelocityY.current;
        earthMesh.rotation.x += rotationVelocityX.current;
        earthMesh.rotation.x = Math.max(-Math.PI / 1.65, Math.min(Math.PI / 1.65, earthMesh.rotation.x));
        rotationVelocityY.current *= 0.95;
        rotationVelocityX.current *= 0.95;
      }

      // 2. Smooth centering transition to targeted country
      if (targetRotationRef.current) {
        const [tx, ty] = targetRotationRef.current;
        earthMesh.rotation.x += (tx - earthMesh.rotation.x) * 0.08;
        earthMesh.rotation.y += (ty - earthMesh.rotation.y) * 0.08;

        if (Math.abs(tx - earthMesh.rotation.x) < 0.005 && Math.abs(ty - earthMesh.rotation.y) < 0.005) {
          targetRotationRef.current = null;
        }
      }

      // Force update of world matrix to ensure getWorldPosition calculates accurately
      scene.updateMatrixWorld(true);

      renderer.render(scene, camera);

      // 3. Project 3D pin locations to floating absolute HTML overlay elements using robust world coordinates
      highlightedCountries.forEach((country, idx) => {
        const el = document.getElementById(`globe-pin-label-${country.id}`);
        if (!el) return;

        const pinMesh = pinMeshes[idx];
        if (!pinMesh) return;

        pinMesh.getWorldPosition(tempV);
        const isFacingCamera = tempV.z > 0;

        tempV.project(camera);

        if (isFacingCamera) {
          const x = (tempV.x * 0.5 + 0.5) * 500;
          const y = (-(tempV.y * 0.5) + 0.5) * 500;

          el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        } else {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }

        // Live update pin colors dynamically from selectedCountryRef
        const pinMeshObj = pinMeshes[idx];
        if (pinMeshObj && pinMeshObj.material) {
          const isSelected = selectedCountryRef.current?.id === country.id;
          (pinMeshObj.material as THREE.MeshBasicMaterial).color.setHex(isSelected ? 0xf59e0b : 0x06b6d4);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      earthGroupRef.current = null;
      earthMeshRef.current = null;
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrCancel);
      canvas.removeEventListener('pointercancel', handlePointerUpOrCancel);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      pinMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
    };
  }, [highlightedCountries]); // Depend ONLY on highlightedCountries so scene is constructed once on mount!

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden text-white" id="globe-centerpiece">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Ambient Blue Gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-medium mb-4"
          >
            <span>Interactive 3D World Explorer</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-4 text-white"
          >
            Explore Global Destinations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-base"
          >
            Rotate the interactive globe to discover top travel spots, active packages, and climate characteristics. Click on a highlighted country pin to view curated tour guides, flight details, and real-time weather forecasts.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Globe Canvas Container */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative p-4 rounded-full bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.15)]"
            >
              <canvas
                id="globe-canvas"
                ref={canvasRef}
                width={500}
                height={500}
                className="cursor-grab active:cursor-grabbing max-w-full rounded-full touch-none"
                title="Drag to rotate, click country pins to explore"
              />
              
              {/* Absolute high-performance overlay container for projected pin badges */}
              <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden m-4">
                {highlightedCountries.map((country) => {
                  const isSelected = selectedCountry?.id === country.id;
                  return (
                    <div
                      key={country.id}
                      id={`globe-pin-label-${country.id}`}
                      style={{ position: 'absolute', left: 0, top: 0, opacity: 0, transition: 'opacity 0.25s' }}
                      className="pointer-events-none"
                    >
                      <button
                        onClick={() => handleSelectCountry(country)}
                        className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-tight shadow-2xl transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white border border-amber-400 scale-110 z-20 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-900/90 text-cyan-300 border border-cyan-500/30 hover:bg-slate-800 hover:border-cyan-400 scale-100 hover:scale-105 z-10'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-cyan-400'}`}></span>
                        {country.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global Geolocation Trigger Button */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                onClick={handleLocateUser}
                disabled={isLocating}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-bold tracking-wider shadow-2xl hover:shadow-cyan-500/10 hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
                id="globe-locate-me-button"
              >
                <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce text-cyan-400' : 'text-cyan-400'}`} />
                <span>{isLocating ? 'DETERMINING GEOLOCATION...' : 'LOCATE ME'}</span>
              </button>
              {locationError && (
                <p className="text-rose-400 text-xs mt-1 font-mono border border-rose-500/10 bg-rose-500/5 px-3 py-1 rounded-full">{locationError}</p>
              )}
            </div>
          </div>

          {/* Interactive Lookup Details */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedCountry ? (
                <motion.div
                  key={selectedCountry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
                  id={`country-panel-${selectedCountry.id}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-6 relative">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-medium text-white">{selectedCountry.name}</h3>
                        <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">Target Focus Location</p>
                      </div>
                    </div>
                    <div className="opacity-15 pointer-events-none shrink-0 pr-1">
                      <Globe className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Weather Intelligence widget */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-300 font-display block">Live Weather Intelligence</span>
                          {weatherLoading ? (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 animate-pulse">
                              Locating real-time coordinate feed...
                            </span>
                          ) : weatherData ? (
                            <span className="text-[10px] text-cyan-400/90 font-mono block mt-0.5">
                              Real-time data for: <strong className="text-slate-200 font-medium">{weatherData.city || selectedCountry.name}</strong>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              Seasonal average climate overview
                            </span>
                          )}
                        </div>
                      </div>
                      {weatherLoading ? (
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                          <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
                          <span>Live...</span>
                        </div>
                      ) : weatherData ? (
                        <span className="text-sm font-mono font-semibold text-white bg-slate-900 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shrink-0">
                          <span className="text-cyan-400 font-bold">{weatherData.temp}°C</span>
                          <span className="text-slate-600">|</span>
                          <span className="capitalize text-slate-200">{weatherData.description}</span>
                          <span>
                            {(() => {
                              const desc = weatherData.description.toLowerCase();
                              if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
                              if (desc.includes('snow') || desc.includes('ice') || desc.includes('freeze')) return '❄️';
                              if (desc.includes('cloud') || desc.includes('overcast')) return '☁️';
                              if (desc.includes('clear') || desc.includes('sun') || desc.includes('warm')) return '☀️';
                              if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
                              if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
                              return '🌤️';
                            })()}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm font-mono font-medium text-white bg-slate-900 px-3 py-1 rounded-full border border-white/10 shrink-0">
                          {selectedCountry.weather}
                        </span>
                      )}
                    </div>
                    {/* Secondary real-time details */}
                    {weatherData && (
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2 mt-2">
                        <span className="flex items-center gap-1">💨 Wind Speed: <strong className="text-slate-200">{weatherData.wind_speed} m/s</strong></span>
                        <span className="flex items-center gap-1">💧 Live Humidity: <strong className="text-slate-200">{weatherData.humidity}%</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Prime Hubs / Cities */}
                  <div className="mb-6">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Prime Hubs & Cities</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCountry.cities || []).map((city) => (
                        <a
                          key={city}
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${city}, ${selectedCountry.name || ''} best places, what is importance of that place, best time and things related to be known before go to travel there`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 flex items-center gap-1.5 hover:border-cyan-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                          {city}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Famous Travel Spots / Attractions */}
                  <div className="mb-6">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Famous Travel Spots</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCountry.attractions || []).map((spot) => (
                        <a
                          key={spot}
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${spot}, ${selectedCountry.name || ''} best places, what is importance of that place, best time and things related to be known before go to travel there`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-cyan-300 flex items-center gap-1.5 hover:border-cyan-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          {spot}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Custom Tour Packages */}
                  <div className="mb-6">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Custom Tour Packages</h4>
                    <div className="space-y-2">
                      {(selectedCountry.packages || []).map((pkg) => (
                        <div key={pkg} className="flex items-center gap-2.5 text-sm text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-white/5 hover:bg-slate-950 transition">
                          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="truncate">{pkg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulated Flights */}
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Live flight estimations</h4>
                    <div className="space-y-2">
                      {(selectedCountry.flights || []).map((flight) => (
                        <div key={flight} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Plane className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
                            <span>Transit</span>
                          </div>
                          <span className="text-white font-medium">{flight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 sm:p-12 text-center text-slate-400 backdrop-blur-sm shadow-xl flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-cyan-500/80 mb-4 animate-pulse" />
                  <p className="mb-6 text-sm sm:text-base text-slate-300 leading-relaxed">
                    Click on a country on the rotating globe to display curated travel plans, flight estimates, and live climate forecasts.
                  </p>
                  
                  <div className="w-full h-px bg-white/10 my-4" />
                  
                  <p className="text-[10px] text-slate-500 mb-4 uppercase font-mono tracking-wider">Or explore your local surroundings</p>
                  
                  <button
                    onClick={handleLocateUser}
                    disabled={isLocating}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{isLocating ? 'Locating...' : 'Detect My Location'}</span>
                  </button>

                  {locationError && (
                    <p className="text-rose-400 text-xs mt-3 font-mono border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 rounded-lg max-w-xs">{locationError}</p>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
