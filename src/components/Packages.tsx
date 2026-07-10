import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, Compass, CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, Sparkles, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { TourPackage, BookingStatus } from '../types';

interface PackagesProps {
  setTab: (tab: string) => void;
  user: any | null;
}

export default function Packages({ setTab, user }: PackagesProps) {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<TourPackage | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      console.error('Failed to fetch packages', err);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setTab('login');
      return;
    }
    if (!selectedPkg) return;

    setBookingLoading(true);
    const totalCost = selectedPkg.price * travelers;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          travelers,
          totalCost,
          startDate,
          endDate
        })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking request failed');
      }
      setBookingSuccess(data);
    } catch (err) {
      console.error('Booking error', err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="py-24 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100" id="packages-module">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Module Title */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-medium mb-4"
          >
            <span>Curated Signature Expeditions</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4 text-slate-900 dark:text-white"
          >
            Custom Signature Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto text-base font-light"
          >
            Discover exclusive signature travel plans managed by hand-selected concierges. Complete with fully private transport, luxury resort stays, and local dining experiences.
          </motion.p>
        </div>

        {/* Horizontal Packages List Grid */}
        <div className="space-y-8" id="packages-listing">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/5 dark:shadow-none hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              {/* Image with Gradient Banner */}
              <div className="relative h-64 sm:h-80 md:h-[400px] w-full">
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold bg-white text-slate-950 shadow-md">
                    {pkg.difficulty}
                  </span>
                </div>
              </div>

              {/* Package details below image */}
              <div className="p-6 sm:p-8 flex flex-col justify-between text-left">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      Signature Experience
                    </span>
                    <span>{pkg.duration} DAYS / {pkg.duration - 1} NIGHTS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 dark:text-white tracking-tight mb-4">
                    {pkg.name}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed font-light mb-6">
                    {pkg.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-white/5">
                      <span className="text-xs text-slate-400 block font-mono">VALUED STARTING RATE</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white mt-1">₹{pkg.price.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">PER VISITOR</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-white/5">
                      <span className="text-xs text-slate-400 block font-mono font-medium">DIFFICULTY CODES</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block mt-2 capitalize">{pkg.difficulty} Path</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setExpandedDay(1);
                      setBookingSuccess(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 text-sm font-medium transition cursor-pointer"
                  >
                    View Daily Travel Plan
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setBookingOpen(true);
                      setBookingSuccess(null);
                      // Default Dates
                      const today = new Date();
                      const nextWeek = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 7);
                      const returnWeek = new Date(nextWeek.getTime() + 1000 * 60 * 60 * 24 * pkg.duration);
                      setStartDate(nextWeek.toISOString().split('T')[0]);
                      setEndDate(returnWeek.toISOString().split('T')[0]);
                    }}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/15 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book Private Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal: Detailed Timeline Itinerary Overlay */}
        <AnimatePresence>
          {selectedPkg && !bookingOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-left"
              >
                {/* Header bar */}
                <div className="p-6 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-cyan-400 font-bold uppercase block mb-1">
                      Detailed Expedition Timeline
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 dark:text-white truncate">
                      {selectedPkg.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedPkg(null)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
                  
                  {/* Package Quick Description banner */}
                  <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                    {selectedPkg.description}
                  </div>

                  {/* Dual columns for inclusions/exclusions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5">
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Included In Package</span>
                      </h3>
                      <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                        {(selectedPkg.inclusions || []).map((inc) => (
                          <li key={inc} className="flex gap-2.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5">
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Excluded From package</span>
                      </h3>
                      <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                        {(selectedPkg.exclusions || []).map((exc) => (
                          <li key={exc} className="flex gap-2.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Day-by-day Accordion timeline */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Day-by-Day Experience Schedule</h3>
                    {(selectedPkg.itinerary || []).map((day) => {
                      const isExpanded = expandedDay === day.day;
                      return (
                        <div
                          key={day.day}
                          className="border border-gray-200/50 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                        >
                          <button
                            onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                            className="w-full p-4 flex justify-between items-center bg-gray-50/60 dark:bg-slate-950/40 text-left cursor-pointer"
                          >
                            <div className="flex gap-4 items-center">
                              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                                D{day.day}
                              </span>
                              <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                {day.title}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100 dark:border-white/5 p-5 space-y-3 bg-white dark:bg-slate-900"
                              >
                                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Scheduled Activities</h4>
                                <ul className="space-y-2">
                                  {(day.activities || []).map((act) => (
                                    <li key={act} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                      <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Footer book trigger inside timeline modal */}
                <div className="p-6 border-t border-gray-200/50 dark:border-white/5 bg-gray-50 dark:bg-slate-950 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Valued at</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">₹{selectedPkg.price.toLocaleString()} / guest</p>
                  </div>
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Secure Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding Drawer: Secure Booking Drawer */}
        <AnimatePresence>
          {selectedPkg && bookingOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative text-left"
              >
                
                {/* Header */}
                <div className="p-6 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <span className="font-display font-medium text-lg">Secure Session Booking</span>
                  </div>
                  <button
                    onClick={() => {
                      setBookingOpen(false);
                      setBookingSuccess(null);
                    }}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {!bookingSuccess ? (
                  /* Form input */
                  <form onSubmit={handleBooking} className="p-6 space-y-6">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-start text-xs text-slate-500">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>This is a simulated secure transaction channel. Real-time notifications will be synchronized with your workspace dashboard on booking.</span>
                    </div>

                    {/* Selected package badge */}
                    <div className="flex justify-between items-center text-sm font-medium border-b border-gray-100 dark:border-white/5 pb-4">
                      <span className="text-slate-500">Selected Route</span>
                      <span className="text-slate-900 dark:text-white text-right max-w-[200px] truncate">{selectedPkg.name}</span>
                    </div>

                    {/* Dates picking */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Departure Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Return Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Traveler Count */}
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Number of Visitors</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={travelers}
                          onChange={(e) => setTravelers(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 text-slate-900 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Adult visitor' : 'Adult visitors'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Bill estimation */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 space-y-3 font-mono text-xs">
                      <div className="flex justify-between">
                        <span>PRICE PER VISITOR</span>
                        <span>₹{selectedPkg.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>MULTIPLIER</span>
                        <span>x {travelers} Guests</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-white/5 pt-3 font-semibold text-sm text-slate-900 dark:text-white">
                        <span>TOTAL PAYABLE</span>
                        <span className="text-blue-600 dark:text-cyan-400">₹{(selectedPkg.price * travelers).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/15 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{bookingLoading ? 'Processing Securely...' : 'Complete Secure Reservation'}</span>
                    </button>
                  </form>
                ) : (
                  /* Booking Boarding Pass Aesthetic Confirmation Slip */
                  <div className="p-6">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl"
                    >
                      {/* Boarding Ticket Header */}
                      <div className="bg-slate-900 text-white p-5 border-b border-dashed border-gray-200 dark:border-slate-800 relative">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                            TripWise boarding ticket
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500 text-[8px] font-mono font-bold text-slate-950 uppercase">
                            Confirmed
                          </span>
                        </div>
                        <h4 className="text-lg font-display font-medium tracking-tight truncate mb-1">
                          {selectedPkg.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">RESERVATION CODE: {bookingSuccess.id?.toUpperCase()}</p>

                        {/* Dashed edge circular cuts */}
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-white/10"></div>
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-white/10"></div>
                      </div>

                      {/* Ticket Body */}
                      <div className="bg-slate-950 text-white p-5 space-y-4 font-mono text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Passenger Email</span>
                            <span className="text-slate-200 font-medium truncate block">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Traveler Count</span>
                            <span className="text-slate-200 font-medium block">{bookingSuccess.travelers} Guests</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Departure Date</span>
                            <span className="text-slate-200 font-medium block">{bookingSuccess.start_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Return Date</span>
                            <span className="text-slate-200 font-medium block">{bookingSuccess.end_date}</span>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                          <div>
                            <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Total Amount Paid</span>
                            <span className="text-base font-bold text-cyan-400">₹{bookingSuccess.total_cost?.toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Security Check</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" /> Checked
                            </span>
                          </div>
                        </div>

                        {/* Barcode widget */}
                        <div className="border-t border-white/5 pt-4 flex flex-col items-center justify-center gap-1">
                          <div className="w-full h-8 bg-[repeating-linear-gradient(90deg,#000,#000_1px,#fff_1px,#fff_3px,#000_3px,#000_4px)] dark:bg-[repeating-linear-gradient(90deg,#fff,#fff_1px,#000_1px,#000_3px,#fff_3px,#fff_4px)] opacity-80"></div>
                          <span className="text-[9px] text-slate-500 font-mono tracking-widest">{bookingSuccess.id?.substr(5, 12).toUpperCase()}</span>
                        </div>
                      </div>

                    </motion.div>

                    <button
                      onClick={() => {
                        setSelectedPkg(null);
                        setBookingOpen(false);
                        setBookingSuccess(null);
                        setTab('dashboard'); // take them to workspace directly to check bookings!
                      }}
                      className="w-full mt-6 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90 text-sm font-semibold transition"
                    >
                      Close and Go to My Workspace
                    </button>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
