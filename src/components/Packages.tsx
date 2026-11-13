import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TourPackage } from '../types';
import PackageCard from './packages/PackageCard';
import ItineraryModal from './packages/ItineraryModal';
import BookingForm from './packages/BookingForm';

interface PackagesProps {
  setTab: (tab: string) => void;
  user: any | null;
  isHome?: boolean;
}

export default function Packages({ setTab, user, isHome = false }: PackagesProps) {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<TourPackage | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const detailRequestIdRef = useRef(0);

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

  // Refresh the selected package from GET /api/packages/:id whenever a modal opens.
  // Any failure silently keeps the list data; stale responses are guarded by request id.
  const fetchPackageDetail = async (pkg: TourPackage) => {
    const requestId = ++detailRequestIdRef.current;
    try {
      const res = await fetch(`/api/packages/${pkg.id}`);
      if (!res.ok) return;
      const fresh = await res.json();
      if (detailRequestIdRef.current !== requestId) return; // user switched packages meanwhile
      if (!fresh || fresh.id !== pkg.id) return;
      setSelectedPkg((current) => (current && current.id === pkg.id ? (fresh as TourPackage) : current));
    } catch {
      // Silently keep the list data on any failure (no visible error / layout change)
    }
  };

  const openItinerary = (pkg: TourPackage) => {
    setSelectedPkg(pkg);
    setExpandedDay(1);
    fetchPackageDetail(pkg);
  };

  const openBooking = (pkg: TourPackage) => {
    setSelectedPkg(pkg);
    setBookingOpen(true);
    // Default Dates
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 7);
    const returnWeek = new Date(nextWeek.getTime() + 1000 * 60 * 60 * 24 * pkg.duration);
    setStartDate(nextWeek.toISOString().split('T')[0]);
    setEndDate(returnWeek.toISOString().split('T')[0]);
    fetchPackageDetail(pkg);
  };

  return (
    <div className={`${isHome ? 'py-12 md:py-16' : 'py-24 min-h-screen'} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100`} id="packages-module">
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
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={idx}
              onViewItinerary={openItinerary}
              onBook={openBooking}
            />
          ))}
        </div>

        {/* Modal: Detailed Timeline Itinerary Overlay */}
        <AnimatePresence>
          {selectedPkg && !bookingOpen && (
            <ItineraryModal
              pkg={selectedPkg}
              expandedDay={expandedDay}
              onToggleDay={setExpandedDay}
              onClose={() => setSelectedPkg(null)}
              onProceed={() => {
                setBookingOpen(true);
                fetchPackageDetail(selectedPkg);
              }}
            />
          )}
        </AnimatePresence>

        {/* Sliding Drawer: Secure Booking Drawer */}
        <AnimatePresence>
          {selectedPkg && bookingOpen && (
            <BookingForm
              pkg={selectedPkg}
              user={user}
              setTab={setTab}
              startDate={startDate}
              endDate={endDate}
              travelers={travelers}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onTravelersChange={setTravelers}
              onDismiss={() => setBookingOpen(false)}
              onComplete={() => {
                setSelectedPkg(null);
                setBookingOpen(false);
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
