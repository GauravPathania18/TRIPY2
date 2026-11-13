import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { TourPackage } from '../../types';

interface PackageCardProps {
  // React list key from the orchestrator's map. Declared because this project
  // ships without @types/react, so JSX has no IntrinsicAttributes to absorb
  // `key`; React passes it as the runtime key argument, never as a real prop.
  key?: any;
  pkg: TourPackage;
  index: number;
  onViewItinerary: (pkg: TourPackage) => void;
  onBook: (pkg: TourPackage) => void;
}

export default function PackageCard({ pkg, index, onViewItinerary, onBook }: PackageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
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
            onClick={() => onViewItinerary(pkg)}
            className="px-6 py-3 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-sm font-medium transition cursor-pointer"
          >
            View Daily Travel Plan
          </button>
          <button
            onClick={() => onBook(pkg)}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-amber-500/10 cursor-pointer flex items-center gap-1.5"
          >
            <span>Book Private Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
