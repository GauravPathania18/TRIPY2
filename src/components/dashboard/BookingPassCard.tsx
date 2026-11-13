import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface BookingPassCardProps {
  // React list key from the orchestrator's map. Declared because this project
  // ships without @types/react, so JSX has no IntrinsicAttributes to absorb `key`.
  key?: any;
  booking: any;
  user: any;
  isExpanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

export default function BookingPassCard({ booking, user, isExpanded, onToggle, onRefresh }: BookingPassCardProps) {
  const [cancelError, setCancelError] = useState('');

  // PUT /api/bookings/:id/status — the old POST /cancel endpoint 404'd.
  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setCancelError('');
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      if (res.ok) {
        onRefresh();
        return;
      }
      // Non-OK (403/404/etc): surface the failure instead of failing silently.
      let message = `Could not cancel this reservation (HTTP ${res.status}).`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch { /* non-JSON error body */ }
      setCancelError(message);
    } catch (err) {
      console.error(err);
      setCancelError('Could not cancel this reservation. Please check your connection and try again.');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">

      {/* Summary Header row */}
      <div className="p-4 bg-gray-50/70 dark:bg-slate-950/40 flex justify-between items-center flex-wrap gap-4 text-xs">
        <div>
          <span className="font-mono text-[9px] text-slate-400 block">DESTINATION ROUTE</span>
          <span className="font-semibold text-slate-900 dark:text-white">{booking.package_name}</span>
        </div>
        <div>
          <span className="font-mono text-[9px] text-slate-400 block">TOTAL PAID</span>
          <span className="font-bold text-amber-400">₹{booking.total_cost?.toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800 text-[10px] font-semibold transition"
          >
            {isExpanded ? 'Hide Ticket' : 'Reveal Pass'}
          </button>
          <button
            onClick={handleCancelBooking}
            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
            title="Cancel booking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline cancel failure notice (403/404/network) */}
      {cancelError && (
        <div className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-[11px] font-mono text-red-600 dark:text-red-400">{cancelError}</p>
          <button
            onClick={() => setCancelError('')}
            className="text-[10px] font-mono text-red-400 hover:text-red-300 underline shrink-0"
          >
            dismiss
          </button>
        </div>
      )}

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
                  <span className="text-slate-200 font-medium text-xs">{user?.name}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">START DATE</span>
                  <span className="text-slate-200 font-medium text-xs">{booking.start_date}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">VISITOR COUNT</span>
                  <span className="text-slate-200 font-medium text-xs">{booking.travelers} Guests</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">RETURN DATE</span>
                  <span className="text-slate-200 font-medium text-xs">{booking.end_date}</span>
                </div>
              </div>

              {/* Barcode widget */}
              <div className="flex flex-col items-center justify-center border-l border-white/5 pl-4">
                <div className="w-full h-12 bg-[repeating-linear-gradient(90deg,#fff,#fff_1px,#000_1px,#000_3px,#fff_3px,#fff_4px)] opacity-80"></div>
                <span className="text-[8px] text-slate-500 mt-2">RESERVATION: {booking.id?.toUpperCase()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
