export interface CountryData {
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

export const allFamousCountries: CountryData[] = [
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
