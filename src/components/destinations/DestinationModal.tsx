import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Star, ArrowLeft, Utensils, Compass, CloudSun, Calendar, CreditCard
} from 'lucide-react';
import { Destination, Review } from '../../types';
import { fetchWithRetry } from '../../utils/api';

interface DestinationModalProps {
  /** Destination picked from the list (used as fallback while fetching fresh data). */
  destination: Destination;
  user: any | null;
  setTab: (tab: string) => void;
  onMapPin: (destination: Destination) => void;
  onClose: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value || '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Destination detail overlay content: hero, overview, attractions, cuisine,
 * live weather sidebar, reviews (read + write) and the packages / map actions.
 *
 * The AnimatePresence wrapper lives in the orchestrator; this component only
 * renders the scrollable panel body.
 */
export default function DestinationModal({
  destination,
  user,
  setTab,
  onMapPin,
  onClose,
}: DestinationModalProps) {
  // Prefer a fresh server record, fall back silently to the list data.
  const [detail, setDetail] = useState<Destination>(destination);

  // Real-time weather for the open modal
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const currentUser = useMemo(() => {
    if (user) return user;
    try {
      const raw = localStorage.getItem('trippy_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [user]);

  // Detail fetch: GET /api/destinations/:id — prefer the fresh record, keep list data on failure.
  useEffect(() => {
    setDetail(destination);
    let stale = false;
    const loadDetail = async () => {
      try {
        const res = await fetchWithRetry(`/api/destinations/${destination.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!stale && data && data.id) setDetail(data);
      } catch {
        /* silent: keep list data */
      }
    };
    loadDetail();
    return () => {
      stale = true;
    };
  }, [destination]);

  // Live weather while the modal is open
  useEffect(() => {
    let stale = false;
    setWeatherLoading(true);
    setWeatherData(null);
    const loadWeather = async () => {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(destination.city || destination.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (!stale) setWeatherData(data);
        }
      } catch (err) {
        console.error('Failed to fetch live weather', err);
      } finally {
        if (!stale) setWeatherLoading(false);
      }
    };
    loadWeather();
    return () => {
      stale = true;
    };
  }, [destination]);

  // Reviews fetch: GET /api/reviews?destination_id=<id>
  useEffect(() => {
    let stale = false;
    setReviewsLoading(true);
    setReviews([]);
    setRating(5);
    setComment('');
    setReviewError('');
    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?destination_id=${encodeURIComponent(destination.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!stale && Array.isArray(data)) setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        if (!stale) setReviewsLoading(false);
      }
    };
    loadReviews();
    return () => {
      stale = true;
    };
  }, [destination.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const trimmed = comment.trim();
    setReviewError('');
    if (!trimmed) {
      setReviewError('Please write a comment before posting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}:user`
        },
        body: JSON.stringify({ rating, comment: trimmed, destination_id: destination.id })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setReviewError((data && data.error) || 'Failed to post your review.');
        return;
      }
      if (data) {
        setReviews(prev => [data, ...prev]);
      }
      setComment('');
      setRating(5);
    } catch (err: any) {
      console.error('Review submit failed', err);
      setReviewError(err.message || 'Failed to post your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const dest = detail;

  return (
    <div className="overflow-y-auto p-0">
      {/* Hero banner inside modal */}
      <div className="relative h-64 sm:h-96 w-full">
        <img
          src={dest.image_url}
          alt={dest.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/60 border border-white/20 text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Detail title inside banner */}
        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono mb-1">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{dest.city}, {dest.country}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">{dest.name}</h2>
        </div>
      </div>

      {/* Information Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        <div className="md:col-span-8 space-y-6">

          {/* Description */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Atmosphere & Overview</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              {dest.description}
            </p>
          </div>

          {/* Attractions (Mocked) */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Principal Attractions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {dest.id === 'dest-goa' ? (
                <>
                  <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                    <span className="font-semibold block text-slate-900 dark:text-white mb-1">Baga Beach</span>
                    <span className="text-xs text-slate-400">Famous for active ocean parasailing, seafood cabanas & night bazars.</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                    <span className="font-semibold block text-slate-900 dark:text-white mb-1">Basilica of Bom Jesus</span>
                    <span className="text-xs text-slate-400">Unesco heritage site containing beautiful Portuguese architecture.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                    <span className="font-semibold block text-slate-900 dark:text-white mb-1">Scenic Valley Sightseeing</span>
                    <span className="text-xs text-slate-400">Pristine pine forests, snow resort valleys and rushing rivers.</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-xl">
                    <span className="font-semibold block text-slate-900 dark:text-white mb-1">Historic Town Monasteries</span>
                    <span className="text-xs text-slate-400">Quiet spiritual paths, local hand-woven artifacts and hot springs.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Local Cuisine (Mocked) */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              <span>Local Gastronomy Selection</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Goan Spiced Fish Curry', 'Todd Vinegar Pork Vindaloo', 'Feni & Cashew Drinks', 'Sweet Bebinca Cake', 'Steaming hot local Momos', 'Rawa Fried Pomfret'].map((food) => (
                <span key={food} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-semibold text-amber-500">
                  {food}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Details Sidebar widget */}
        <div className="md:col-span-4 space-y-4">

          {/* Weather widget */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase mb-1">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span>Real-Time Weather</span>
            </div>
            {weatherLoading ? (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching live weather...</span>
              </div>
            ) : weatherData ? (
              <div className="space-y-1 mt-1 text-slate-800 dark:text-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono text-amber-500">{weatherData.temp}°C</span>
                  <span className="text-xs font-mono font-medium capitalize px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                    {weatherData.description}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                  <span>💨 Wind: {weatherData.wind_speed} m/s</span>
                  <span>💧 Humid: {weatherData.humidity}%</span>
                </div>
              </div>
            ) : (
              <span className="text-base font-semibold text-slate-800 dark:text-white block mt-1">
                {dest.best_season.includes('October') ? '28°C - Sunny Coast' : '15°C - Misty Mountain'} ☀️
              </span>
            )}
          </div>

          {/* Best Season */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Recommended Period</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white block">{dest.best_season}</span>
          </div>

          {/* Travel Style Widget */}
          {dest.travel_style && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Travel Style</span>
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white block capitalize">{dest.travel_style}</span>
            </div>
          )}

          {/* Climate Widget */}
          {dest.climate && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                <CloudSun className="w-4 h-4 text-orange-500" />
                <span>Climate Zone</span>
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white block capitalize">{dest.climate}</span>
            </div>
          )}

          {/* Budget */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Estimated Cost Bracket</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white block">{dest.budget_range}</span>
          </div>

          {/* Pin on Map Action in Modal */}
          <button
            onClick={() => onMapPin(dest)}
            className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-gray-200 dark:border-white/5 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Pin on Map</span>
          </button>

          {/* Travel Action */}
          <button
            onClick={() => {
              onClose();
              setTab('packages');
            }}
            className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-sm transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 animate-spin" />
            <span>Explore Curated Tours</span>
          </button>

        </div>

        {/* ==========================================
            Traveler Reviews (GET/POST /api/reviews)
            ========================================== */}
        <div className="md:col-span-12 border-t border-gray-200 dark:border-white/5 pt-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Traveler Reviews</span>
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Write form */}
          {currentUser ? (
            <form
              onSubmit={handleSubmitReview}
              className="mb-6 p-5 rounded-2xl bg-[#0b1329] border border-slate-800/80 text-white space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest w-28 flex-shrink-0">Your Rating</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      className="transition active:scale-90 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 hover:text-amber-500/60'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-mono text-amber-400 font-bold">{rating}/5</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest w-28 flex-shrink-0 pt-3">Comment</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share what made this trip memorable..."
                  className="flex-1 resize-none rounded-xl bg-[#030712] border border-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />
              </div>

              {reviewError && (
                <p className="text-xs font-mono text-red-400">{reviewError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post Review</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#0b1329] border border-dashed border-slate-700 text-white">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white block sm:inline">Share your experience.</span>{' '}
                <span className="text-slate-400 block sm:inline">Reviews are open to signed-in travelers.</span>
              </p>
              <button
                onClick={() => setTab('login')}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition shadow-md active:scale-95 cursor-pointer self-start md:self-auto"
              >
                Sign in to review
              </button>
            </div>
          )}

          {/* Review list */}
          {reviewsLoading ? (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 py-4">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              No reviews yet — be the first to rate this destination.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-white/5 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    {review.user_image ? (
                      <img
                        src={review.user_image}
                        alt={review.user_name}
                        className="w-9 h-9 rounded-full object-cover border border-amber-500/30 bg-slate-800"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-500 font-mono">
                        {(review.user_name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {review.user_name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
