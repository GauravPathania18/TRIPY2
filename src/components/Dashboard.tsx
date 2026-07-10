import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Calendar, CreditCard, ShieldCheck, User, MapPin, Heart, BookOpen, Trash2, Bell, Sparkles, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Booking, Destination, TourPackage } from '../types';

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
  
  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Active expanded booking ticket
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      fetchDashboardData();
    }
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.id}:user` }
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ name, email })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json();
      if (res.ok && data.user) {
        onProfileUpdate(data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Recharts Chart budget totals estimation
  const getBudgetChartData = () => {
    const data: any[] = [];
    bookings.forEach((b) => {
      data.push({
        name: b.package_name?.substr(0, 15) || 'Tour session',
        Cost: b.total_cost,
        Travelers: b.travelers * 10000 // scaling for visual comparison
      });
    });
    savedTrips.forEach((t) => {
      data.push({
        name: t.destination?.substr(0, 15),
        Cost: t.budget,
        Travelers: 20000
      });
    });
    
    // Fallback default chart if empty so UI looks breathtaking
    if (data.length === 0) {
      return [
        { name: 'Goa Signature', Cost: 60000, Travelers: 20000 },
        { name: 'Himalayan Trek', Cost: 48000, Travelers: 15000 },
        { name: 'Tokyo Custom', Cost: 140000, Travelers: 30000 }
      ];
    }
    return data;
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
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{bookings.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Saved AI Travel Plans</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{savedTrips.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Bookmarked Locations</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{favorites.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">System Alerts</span>
            <span className="text-2xl font-bold text-amber-500">{notifications.length}</span>
          </div>
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
                  {bookings.map((book) => {
                    const isExpanded = activeTicketId === book.id;
                    return (
                      <div key={book.id} className="border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* Summary Header row */}
                        <div className="p-4 bg-gray-50/70 dark:bg-slate-950/40 flex justify-between items-center flex-wrap gap-4 text-xs">
                          <div>
                            <span className="font-mono text-[9px] text-slate-400 block">DESTINATION ROUTE</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{book.package_name}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] text-slate-400 block">TOTAL PAID</span>
                            <span className="font-bold text-amber-400">₹{book.total_cost?.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveTicketId(isExpanded ? null : book.id)}
                              className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800 text-[10px] font-semibold transition"
                            >
                              {isExpanded ? 'Hide Ticket' : 'Reveal Pass'}
                            </button>
                            <button
                              onClick={() => handleCancelBooking(book.id)}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
                              title="Cancel booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Physical Ticket layout */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-100 dark:border-white/5 p-5 bg-slate-950 text-white font-mono text-xs relative"
                            >
                              {/* Left & Right Circular ticket cuts */}
                              <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-white/10"></div>
                              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-white/10"></div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 px-4">
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[8px] text-slate-500 block uppercase">PASSENGER NAME</span>
                                    <span className="text-slate-200 font-medium text-xs">{user.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 block uppercase">START DATE</span>
                                    <span className="text-slate-200 font-medium text-xs">{book.start_date}</span>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[8px] text-slate-500 block uppercase">VISITOR COUNT</span>
                                    <span className="text-slate-200 font-medium text-xs">{book.travelers} Guests</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 block uppercase">RETURN DATE</span>
                                    <span className="text-slate-200 font-medium text-xs">{book.end_date}</span>
                                  </div>
                                </div>

                                {/* Barcode widget */}
                                <div className="flex flex-col items-center justify-center border-l border-white/5 pl-4">
                                  <div className="w-full h-12 bg-[repeating-linear-gradient(90deg,#fff,#fff_1px,#000_1px,#000_3px,#fff_3px,#fff_4px)] opacity-80"></div>
                                  <span className="text-[8px] text-slate-500 mt-2">RESERVATION: {book.id?.toUpperCase()}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Budget charts Recharts */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
              <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span>Financial Budget Analytics</span>
              </h2>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getBudgetChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontClass="font-mono" />
                    <YAxis stroke="#94a3b8" fontSize={10} fontClass="font-mono" />
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    <Bar dataKey="Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* RIGHT Column: Bookmarked locations, Alert notifications ticker, and profile options */}
          <div className="lg:col-span-4 space-y-8 text-left">
            
            {/* Bookmarked Favorites short cut */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>Bookmarked Locations</span>
              </h3>

              {favorites.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono py-4">No bookmarked destinations yet.</p>
              ) : (
                <div className="space-y-3">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200/20 dark:border-white/5 rounded-xl">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{fav.destination_name}</span>
                      <button
                        onClick={() => handleRemoveFavorite(fav.destination_id)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification logs ticker */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Workspace Bulletins</span>
              </h3>

              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono py-4">No new system updates.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-gray-100 dark:border-white/5 text-[11px] font-mono leading-relaxed text-slate-500 dark:text-slate-300">
                      <p className="text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                        {notif.title}
                      </p>
                      <p className="font-light">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Profile editor */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500" />
                <span>Update Account Info</span>
              </h3>

              {profileSuccess && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 text-[11px] text-emerald-600 font-medium">
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950 text-xs rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950 text-xs rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
                >
                  {profileLoading ? 'Saving Info...' : 'Update Settings'}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
