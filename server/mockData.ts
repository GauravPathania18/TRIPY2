import { Destination, TourPackage, Blog, Review, DestinationCategory, PackageDifficulty, BlogCategory, UserRole } from '../src/types';

export const mockDestinations: Destination[] = [
  {
    id: 'dest-goa',
    name: 'Goa',
    description: 'Goa is a vibrant state on India\'s southwestern coast, famous for its golden beaches, active nightlife, historic Portuguese architecture, and spiced seafood curries.',
    country: 'India',
    city: 'Panaji',
    latitude: 15.2993,
    longitude: 74.1240,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹15,000 - ₹25,000',
    best_season: 'October - March',
    category: DestinationCategory.BEACH,
    is_featured: true,
    travel_style: 'budget',
    climate: 'tropical',
    created_at: new Date().toISOString()
  },
  {
    id: 'dest-manali',
    name: 'Manali',
    description: 'A high-altitude Himalayan resort town in Himachal Pradesh, known for its cool climate, snow-capped peaks, skiing, trekking, and beautiful Solang Valley activities.',
    country: 'India',
    city: 'Manali',
    latitude: 32.2396,
    longitude: 77.1887,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹20,000 - ₹30,000',
    best_season: 'December - June',
    category: DestinationCategory.MOUNTAINS,
    is_featured: true,
    travel_style: 'adventure',
    climate: 'alpine',
    created_at: new Date().toISOString()
  },
  {
    id: 'dest-kasol',
    name: 'Kasol',
    description: 'A picturesque hamlet in the Parvati Valley, Kasol is a hub for trekkers, backpackers, and nature lovers seeking calm pine forests and roaring rivers.',
    country: 'India',
    city: 'Kasol',
    latitude: 32.0100,
    longitude: 77.3150,
    image_url: 'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹18,000 - ₹28,000',
    best_season: 'March - June',
    category: DestinationCategory.ADVENTURE,
    is_featured: false,
    travel_style: 'budget',
    climate: 'alpine',
    created_at: new Date().toISOString()
  },
  {
    id: 'dest-rajasthan',
    name: 'Rajasthan',
    description: 'The Land of Kings, Rajasthan boasts grand palaces, historic hill forts, camel treks in the golden Thar Desert, and vibrant local folk arts and culture.',
    country: 'India',
    city: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    image_url: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹25,000 - ₹40,000',
    best_season: 'November - February',
    category: DestinationCategory.FAMILY,
    is_featured: true,
    travel_style: 'luxury',
    climate: 'desert',
    created_at: new Date().toISOString()
  },
  {
    id: 'dest-tokyo',
    name: 'Tokyo',
    description: 'Japan\'s bustling capital mixes ultra-modern neon skyscrapers with historic Shinto shrines, exceptional culinary experiences, anime culture, and pristine public parks.',
    country: 'Japan',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹80,000 - ₹1,50,000',
    best_season: 'March - May & Oct - Nov',
    category: DestinationCategory.ADVENTURE,
    is_featured: true,
    travel_style: 'luxury',
    climate: 'moderate',
    created_at: new Date().toISOString()
  },
  {
    id: 'dest-swiss',
    name: 'Swiss Alps',
    description: 'The Swiss Alps offer legendary snow resort skiing, high-altitude alpine lake hikes, breathtaking cogwheel trains, and charming wood chalets framed by the iconic Matterhorn.',
    country: 'Switzerland',
    city: 'Zermatt',
    latitude: 46.0207,
    longitude: 7.7491,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹1,50,000 - ₹2,50,000',
    best_season: 'December - April & June - Sep',
    category: DestinationCategory.MOUNTAINS,
    is_featured: true,
    travel_style: 'luxury',
    climate: 'alpine',
    created_at: new Date().toISOString()
  },
  {
    id: 'dest-bali',
    name: 'Bali',
    description: 'An Indonesian paradise known for its forested volcanic mountains, iconic rice paddies, sandy beaches, coral reefs, and rich spiritual Hindu temples and meditation retreats.',
    country: 'Indonesia',
    city: 'Ubud',
    latitude: -8.4095,
    longitude: 115.1889,
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    budget_range: '₹40,000 - ₹70,000',
    best_season: 'April - October',
    category: DestinationCategory.BEACH,
    is_featured: true,
    travel_style: 'adventure',
    climate: 'tropical',
    created_at: new Date().toISOString()
  }
];

export const mockPackages: TourPackage[] = [
  {
    id: 'pkg-himalayan-trek',
    name: 'Himalayan Adventure Trek',
    description: 'An exhilarating high-altitude trek through pristine pine trails, glacier crossings, and majestic alpine lakes in Solang and Parvati Valley.',
    destination_id: 'dest-manali',
    price: 28000,
    duration: 7,
    difficulty: PackageDifficulty.HARD,
    inclusions: ['Professional trekking guides', 'All meal plans (vegetarian)', 'High-altitude camping gear', 'Permits and entry fees', 'Local ground transport'],
    exclusions: ['Personal trekking clothing', 'Travel insurance', 'Tips for support staff', 'Mineral water and extra snacks'],
    itinerary: [
      { day: 1, title: 'Arrival in Manali & Base Camp Setup', activities: ['Meet at base camp', 'Gear check and briefing', 'Acclimatization walk around Manali town'] },
      { day: 2, title: 'Trek to Solang Valley alpine meadows', activities: ['4-hour trek through dense cedar forests', 'Camping under starry skies in Solang'] },
      { day: 3, title: 'Ascent to Beas Kund Glacier base', activities: ['Steep climb with dramatic waterfall views', 'Set up high-altitude tents near glacier stream'] },
      { day: 4, title: 'Summit Day: Beas Kund Glacier Crossing', activities: ['Challenging glacier walk with full guides', 'Enjoy panoramic views of Hanuman Tibba peak'] },
      { day: 5, title: 'Descent to Solang Meadows', activities: ['Relaxed descent back to warmer base camps', 'Bonfire and local Himachali dinner celebration'] },
      { day: 6, title: 'Paragliding & Local Cultural Tour', activities: ['Adventure sports in Solang', 'Visit old Manu Temple and hot springs'] },
      { day: 7, title: 'Departure with Certificate', activities: ['Closing ceremony', 'Certificate of completion', 'Drop-off at Manali bus terminal'] }
    ],
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'pkg-goa-beach-escape',
    name: 'Luxury Beach Escape to Goa',
    description: 'A premium, relaxing escape featuring private beach cottages, guided sunset yacht tours, spiced organic plantation lunches, and candle-lit seafood dinners.',
    destination_id: 'dest-goa',
    price: 22000,
    duration: 5,
    difficulty: PackageDifficulty.EASY,
    inclusions: ['4-star heritage resort stay', 'Buffet breakfast & dinner', 'Private AC sedan airport transfers', 'Premium yacht sunset tour', 'Full-day South Goa sightseeing tour'],
    exclusions: ['Lunch meals', 'Water sports activity tickets', 'Alcoholic beverages'],
    itinerary: [
      { day: 1, title: 'Welcome to Tropical Goa', activities: ['Airport pickup and luxury hotel check-in', 'Evening leisure walk on private sands', 'Sunset cocktails at beachfront shack'] },
      { day: 2, title: 'South Goa Heritage & Spice Plantations', activities: ['Visit Basilica of Bom Jesus and Se Cathedral', 'Guided organic spice farm tour with traditional lunch', 'Explore colorful Latin Quarter of Fontainhas'] },
      { day: 3, title: 'Sunset Private Yacht Cruise', activities: ['Leisurely morning', 'Afternoon boarding on luxury yacht', 'Dolphin watching and Champagne sunset toast'] },
      { day: 4, title: 'Water Sports & Beachfront Cabana Dinner', activities: ['Parasailing and jet ski rides (optional)', 'Relaxing couple\'s massage at resort spa', 'Private 4-course dinner by the sea waves'] },
      { day: 5, title: 'Farewell Goa', activities: ['Morning ocean swim', 'Souvenir shopping at local markets', 'Departure transfer to Goa Airport'] }
    ],
    image_url: 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'pkg-rajasthan-heritage',
    name: 'Royal Heritage Tour of Rajasthan',
    description: 'Immerse yourself in imperial history with private palace stays, desert safaris, local artisan workshops, and exquisite Mewari cuisine.',
    destination_id: 'dest-rajasthan',
    price: 35000,
    duration: 10,
    difficulty: PackageDifficulty.MODERATE,
    inclusions: ['Heritage Haveli palace hotel stays', 'Chauffeur-driven private sedan for 10 days', 'Thar Desert camel safari and luxury camping', 'Local guide fees and entry tickets', 'Traditional Rajasthani folk dance show'],
    exclusions: ['Personal shopping', 'Camera and video fees at monuments', 'International/domestic flights'],
    itinerary: [
      { day: 1, title: 'Arrival in Jaipur - The Pink City', activities: ['Meet private chauffeur', 'Check-in at luxury haveli', 'Evening shopping at Johari Bazaar'] },
      { day: 2, title: 'Amber Fort Elephant ride & City Palace', activities: ['Explore hilltop Amber Fort', 'Guided visit to Hawa Mahal & City Palace', 'Dinner at Chokhi Dhani ethnic village'] },
      { day: 3, title: 'Jaipur to Jodhpur (Blue City)', activities: ['Drive through scenic countryside', 'Visit Mehrangarh Fort towering over the blue streets'] },
      { day: 4, title: 'Desert Safari in Osian Oasis', activities: ['4x4 dunes exploration', 'Sunset camel ride', 'Traditional live music and tent stay under stars'] }
    ],
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    created_at: new Date().toISOString()
  }
];

export const mockBlogs: Blog[] = [
  {
    id: 'blog-pack-light',
    title: 'How to Pack Like a Pro for a Multi-Season Himalayan Adventure',
    content: `Packing for the Himalayas can be a daunting task. One moment you are in warm foothills, and the next you are facing biting sub-zero winds on a mountain pass. The key is smart layering and technical gear selection. Here is our ultimate checklist:

### 1. The Power of Three Layers
Avoid heavy single jackets. Instead, pack:
*   **Base Layer:** Moisture-wicking merino wool or thermal synthetics. This keeps sweat away from your skin.
*   **Mid Layer:** A high-loft fleece jacket or a lightweight down jacket. This traps heat close to your core.
*   **Outer Shell:** Waterproof and windproof breathable jacket (Gore-Tex or similar). This shields you from snow, rain, and freezing drafts.

### 2. Footwear is Your Foundation
Blisters can ruin a beautiful trek. Invest in high-top waterproof hiking boots with a deep vibram tread. Make sure to wear them in at least two weeks before your actual trip. Pair them with thick moisture-wicking wool hiking socks (never cotton!).

### 3. Smart Gadgets & Safety
Bring high-quality UV-blocking sunglasses, a headlamp with spare batteries, and a rugged 20,000mAh power bank (cold temperatures drain phone batteries twice as fast). Always carry a reusable water purification bottle to protect the mountain streams from plastic waste.`,
    author_id: 'admin-1',
    author_name: 'Liam Thorne',
    category: BlogCategory.TIPS,
    image_url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    created_at: new Date().toISOString(),
    source_url: 'https://www.reddit.com/r/onebag/comments/119sh7q/the_ultimate_packing_guide/'
  },
  {
    id: 'blog-why-travel',
    title: 'The Science of Wandering: Why Travelling is Vital for Personal Growth',
    content: `We often treat travel as a luxury or a temporary escape from our daily routine. But scientific research and countless global stories show that traveling is far more than just leisure—it's an essential element of mental resilience, creativity, and self-discovery.

### 1. Neuroplasticity and Cognitive Flexibility
When you step into a completely unfamiliar environment, your brain is forced to process an array of new sensory inputs. Navigating a bustling market in Tokyo or learning to communicate through gestures in a remote Indian village builds new neural pathways. Psychologists refer to this as cognitive flexibility—the ability to adapt to new situations and think outside of standard boxes.

### 2. Empathy and Intercultural Harmony
Reading about a country in a textbook or watching a documentary cannot compare to sitting at a local dinner table. Breaking bread with people whose lives and values differ from yours shatters stereotypes. In a world increasingly divided by bubbles, travel serves as the ultimate empathy machine.

### 3. Embracing the Unknown
Life is unpredictable. Travel simulates this unpredictability in a safe, manageable way. When a flight is delayed, a map is misread, or plans change due to a sudden monsoon, you learn to trust yourself. You realize that you can handle unexpected situations. This builds a robust, quiet self-confidence that stays with you long after you unpack your bags.`,
    author_id: 'admin-1',
    author_name: 'Sophia Loren',
    category: BlogCategory.TRAVEL_GUIDES,
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    created_at: new Date().toISOString(),
    source_url: 'https://www.quora.com/Why-is-traveling-so-important'
  },
  {
    id: 'blog-goan-food',
    title: 'Beyond the Shack: Exploring the True Culinary Heritage of Goa',
    content: `Goa is universally loved for its sand and sea, but its real treasure lies in its kitchens. Goan cuisine is a fascinating, centuries-old fusion of traditional Hindu Saraswat recipes and Portuguese colonial influences. Let's delve into the authentic flavors:

### 1. The Holy Trinity: Coconut, Fish, and Rice
Authentic Goan homes cook daily with freshly ground coconut pastes, fiery red Kashmiri chillies, and sharp toddy vinegar. The local 'Xacuti' curry utilizes heavily roasted grated coconut and spices to achieve an incredibly rich, complex flavor.

### 2. The Portuguese Heritage
Colonial rule introduced vindaloo, cafreal, and the beloved bebinca dessert. True 'Vindaloo' is not just about heat; it uses garlic, ginger, and a strong splash of palm vinegar to preserve pork or fish, giving it its classic tangy, spicy profile.

### 3. Where to Eat Locally
Ditch the commercial beach clubs and look for small family-run 'tavernas' in Panaji or Mapusa. Order local poi bread with spicy Goan sausage or fresh rawa-fried kingfish.`,
    author_id: 'admin-1',
    author_name: 'Sarah Jenkins',
    category: BlogCategory.LOCAL_CULTURE,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    created_at: new Date().toISOString(),
    source_url: 'https://www.reddit.com/r/IndianFood/comments/p0pwyv/lets_talk_about_goan_food/'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    user_id: 'user-mock-1',
    user_name: 'Aditya Sharma',
    user_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    destination_id: 'dest-goa',
    rating: 5,
    comment: 'TripWise made planning our anniversary trip to Goa so smooth. The AI recommended a private sunset yacht in South Goa which became our absolute favorite memory! Highly recommended!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
  },
  {
    id: 'rev-2',
    user_id: 'user-mock-2',
    user_name: 'Pooja Nair',
    user_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    destination_id: 'dest-manali',
    package_id: 'pkg-himalayan-trek',
    rating: 5,
    comment: 'Our trekking guide was incredibly professional. High-altitude gear was top-notch, and the food prepared at camping bases was delicious and hygienic. The AI budget estimate was incredibly precise too!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() // 14 days ago
  }
];
