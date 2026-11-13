import { motion, AnimatePresence } from 'motion/react';
import { XCircle, CheckCircle2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { TourPackage } from '../../types';

interface ItineraryModalProps {
  pkg: TourPackage;
  expandedDay: number | null;
  onToggleDay: (day: number | null) => void;
  onClose: () => void;
  onProceed: () => void;
}

export default function ItineraryModal({ pkg, expandedDay, onToggleDay, onClose, onProceed }: ItineraryModalProps) {
  return (
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
            <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase block mb-1">
              Detailed Expedition Timeline
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 dark:text-white truncate">
              {pkg.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Package Quick Description banner */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
            {pkg.description}
          </div>

          {/* Dual columns for inclusions/exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Included In Package</span>
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                {(pkg.inclusions || []).map((inc) => (
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
                {(pkg.exclusions || []).map((exc) => (
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
            {(pkg.itinerary || []).map((day) => {
              const isExpanded = expandedDay === day.day;
              return (
                <div
                  key={day.day}
                  className="border border-gray-200/50 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => onToggleDay(isExpanded ? null : day.day)}
                    className="w-full p-4 flex justify-between items-center bg-gray-50/60 dark:bg-slate-950/40 text-left cursor-pointer"
                  >
                    <div className="flex gap-4 items-center">
                      <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-mono font-bold text-xs">
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
                              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
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
            <p className="text-xl font-bold text-slate-900 dark:text-white">₹{pkg.price.toLocaleString()} / guest</p>
          </div>
          <button
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Secure Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
