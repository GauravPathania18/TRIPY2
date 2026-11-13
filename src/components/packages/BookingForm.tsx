import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, XCircle, ShieldCheck, Calendar, User, CreditCard } from 'lucide-react';
import { TourPackage } from '../../types';

interface BookingFormProps {
  pkg: TourPackage;
  user: any | null;
  setTab: (tab: string) => void;
  startDate: string;
  endDate: string;
  travelers: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onTravelersChange: (value: number) => void;
  onDismiss: () => void;
  onComplete: () => void;
}

export default function BookingForm({
  pkg,
  user,
  setTab,
  startDate,
  endDate,
  travelers,
  onStartDateChange,
  onEndDateChange,
  onTravelersChange,
  onDismiss,
  onComplete,
}: BookingFormProps) {
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setTab('login');
      return;
    }
    if (!pkg) return;

    setBookingLoading(true);
    const totalCost = pkg.price * travelers;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({
          packageId: pkg.id,
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
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <span className="font-display font-medium text-lg">Secure Session Booking</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {!bookingSuccess ? (
          /* Form input */
          <form onSubmit={handleBooking} className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 items-start text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>This is a simulated secure transaction channel. Real-time notifications will be synchronized with your workspace dashboard on booking.</span>
            </div>

            {/* Selected package badge */}
            <div className="flex justify-between items-center text-sm font-medium border-b border-gray-100 dark:border-white/5 pb-4">
              <span className="text-slate-500">Selected Route</span>
              <span className="text-slate-900 dark:text-white text-right max-w-[200px] truncate">{pkg.name}</span>
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
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
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
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
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
                  onChange={(e) => onTravelersChange(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
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
                <span>₹{pkg.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MULTIPLIER</span>
                <span>x {travelers} Guests</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-white/5 pt-3 font-semibold text-sm text-slate-900 dark:text-white">
                <span>TOTAL PAYABLE</span>
                <span className="text-amber-400 font-bold">₹{(pkg.price * travelers).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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
                  <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                    Trippy boarding ticket
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-[8px] font-mono font-bold text-slate-950 uppercase">
                    Confirmed
                  </span>
                </div>
                <h4 className="text-lg font-display font-medium tracking-tight truncate mb-1">
                  {pkg.name}
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
                    <span className="text-base font-bold text-amber-400">₹{bookingSuccess.total_cost?.toLocaleString()}</span>
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
                setBookingSuccess(null);
                onComplete();
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
  );
}
