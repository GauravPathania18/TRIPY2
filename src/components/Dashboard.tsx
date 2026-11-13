import React, { useState, useEffect } from 'react';
import { Compass, Calendar } from 'lucide-react';
import { Booking } from '../types';
import BookingPassCard from './dashboard/BookingPassCard';
import BudgetChart from './dashboard/BudgetChart';
import FavoritesList from './dashboard/FavoritesList';
import BulletinsList from './dashboard/BulletinsList';
import ProfileForm from './dashboard/ProfileForm';
import AdminPanel from './dashboard/AdminPanel';

interface DashboardProps {
  setTab: (tab: string) => void;
  user: any | null;
  onProfileUpdate: (updatedUser: any) => void;
}

export default function Dashboard({ setTab, user, onProfileUpdate }: DashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Active expanded booking ticket
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${user.id}:user` };

      // Parallel fetches for speed
      const [resBookings, resFavorites, resTrips, resNotifs] = await Promise.all([
        fetch('/api/bookings', { headers }),
        fetch('/api/favorites', { headers }),
        fetch('/api/trips', { headers }),
        fetch('/api/notifications', { headers })
      ]);

      if (resBookings.status === 401 || resFavorites.status === 401 || resTrips.status === 401 || resNotifs.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }

      const dataBookings = resBookings.ok ? await resBookings.json() : [];
      const dataFavorites = resFavorites.ok ? await resFavorites.json() : [];
      const dataTrips = resTrips.ok ? await resTrips.json() : [];
      const dataNotifs = resNotifs.ok ? await resNotifs.json() : [];

      setBookings(Array.isArray(dataBookings) ? dataBookings : []);
      setFavorites(Array.isArray(dataFavorites) ? dataFavorites : []);
      setSavedTrips(Array.isArray(dataTrips) ? dataTrips : []);
      setNotifications(Array.isArray(dataNotifs) ? dataNotifs : []);
    } catch (err) {
      console.error('Failed to load dashboard workspace data', err);
    }
  };

  const handleRemoveFavorite = async (favId: string) => {
    try {
      const res = await fetch(`/api/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ destinationId: favId })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-24 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100" id="user-dashboard-workspace">
      <div className="max-w-7xl mx-auto px-6">

        {/* Workspace banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden mb-12 text-left">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
            <Compass className="w-56 h-56 animate-spin text-white" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium mb-4">
              <span>Workspace Control Board</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight mb-2">
              Welcome, {user?.name || 'Explorer'}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl font-light">
              This is your central workspace. Track active reservations, review budget charts, sync saved AI travel plans, and edit personal account options.
            </p>
          </div>
        </div>

        {/* Quick statistics widgets row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Active Reservations</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{bookings.length}</span></div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Saved AI Travel Plans</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{savedTrips.length}</span></div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Bookmarked Locations</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{favorites.length}</span></div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">System Alerts</span>
            <span className="text-2xl font-bold text-amber-500">{notifications.length}</span></div>
        </div>

        {/* Dashboard workspace columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT Column: Active Booking board & Recharts budget */}
          <div className="lg:col-span-8 space-y-8">

            {/* Active Bookings list with Boarding Pass aesthetic inside */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl text-left">
              <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>Active Boarding Tickets</span>
              </h2>

              {bookings.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 text-slate-400 text-sm">
                  <p className="mb-4">You have no active luxury package reservations yet.</p>
                  <button onClick={() => setTab('packages')} className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition">
                    Explore Curated Tours
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((book) => (
                    <BookingPassCard
                      key={book.id}
                      booking={book}
                      user={user}
                      isExpanded={activeTicketId === book.id}
                      onToggle={() => setActiveTicketId(activeTicketId === book.id ? null : book.id)}
                      onRefresh={fetchDashboardData}
                    />
                  ))}
                </div>
              )}
            </div>

            <BudgetChart bookings={bookings} savedTrips={savedTrips} />

          </div>

          {/* RIGHT Column: Bookmarked locations, Alert notifications ticker, and profile options */}
          <div className="lg:col-span-4 space-y-8 text-left">
            <FavoritesList favorites={favorites} onRemove={handleRemoveFavorite} />
            <BulletinsList notifications={notifications} user={user} />
            <ProfileForm user={user} onProfileUpdate={onProfileUpdate} />
          </div>

          {/* Admin Control Deck — full-width, only for admins */}
          {user?.role === 'admin' && (
            <div className="lg:col-span-12">
              <AdminPanel user={user} bookings={bookings} onRefresh={fetchDashboardData} />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
