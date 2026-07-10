export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  role: UserRole;
  created_at: string;
}

export enum DestinationCategory {
  ADVENTURE = 'adventure',
  FAMILY = 'family',
  BEACH = 'beach',
  MOUNTAINS = 'mountains',
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  image_url: string;
  budget_range: string;
  best_season: string;
  category: DestinationCategory;
  is_featured: boolean;
  travel_style?: string;
  climate?: string;
  created_at: string;
}

export enum PackageDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
}

export interface TourPackage {
  id: string;
  name: string;
  description: string;
  destination_id: string;
  price: number;
  duration: number; // in days
  difficulty: PackageDifficulty;
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; activities: string[] }[];
  image_url: string;
  is_featured: boolean;
  created_at: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Booking {
  id: string;
  user_id: string;
  package_id: string;
  status: BookingStatus;
  travelers: number;
  total_cost: number;
  booking_date: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_image?: string;
  destination_id?: string;
  package_id?: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export enum BlogCategory {
  TRAVEL_GUIDES = 'travel_guides',
  TIPS = 'tips',
  LOCAL_CULTURE = 'local_culture',
  SAFETY_ADVICE = 'safety_advice',
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  category: BlogCategory;
  image_url: string;
  status: 'draft' | 'published';
  created_at: string;
  source_url?: string;
}

export interface BlogComment {
  id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface SavedTrip {
  id: string;
  user_id: string;
  name: string;
  destination_id?: string;
  itinerary: any; // JSON representation of the generated itinerary
  budget: number;
  start_date?: string;
  end_date?: string;
  status: 'planned' | 'upcoming' | 'completed';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  destination_id: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
