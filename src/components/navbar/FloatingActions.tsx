import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface FloatingActionsProps {
  isVisible: boolean;
  isScrolled: boolean;
  currentTab: string;
  setTab: (tab: string) => void;
  onOpenMenu: () => void;
}

/**
 * Floating "Back" + "MENU" pill buttons shown while the navbar is
 * auto-hidden (scrolled down state).
 */
export default function FloatingActions({
  isVisible,
  isScrolled,
  currentTab,
  setTab,
  onOpenMenu,
}: FloatingActionsProps) {
  return (
    <AnimatePresence>
      {!isVisible && isScrolled && (
        <>
          {currentTab !== 'home' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              onClick={() => setTab('home')}
              className="fixed top-4 left-6 z-50 p-3 rounded-full bg-slate-950/95 text-amber-400 backdrop-blur-md shadow-xl border border-amber-500/35 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center"
              id="navbar-back-button"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            onClick={onOpenMenu}
            className="fixed top-4 right-6 z-50 p-3 px-5 rounded-full bg-slate-950/95 text-amber-400 backdrop-blur-md shadow-xl border border-amber-500/35 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1 group"
            id="navbar-expand-button"
            title="Show Navigation Bar"
          >
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400">MENU</span>
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
