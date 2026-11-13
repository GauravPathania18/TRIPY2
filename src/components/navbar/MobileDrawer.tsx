import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Sparkles, ChevronRight } from 'lucide-react';
import { navLinks } from './NavLinks';

// Motion variants for mobile menu stagger
const containerVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
      duration: 0.25,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: 0.15
    }
  }
};

interface MobileDrawerProps {
  open: boolean;
  currentTab: string;
  setTab: (tab: string) => void;
  user: any | null;
  logout: () => void;
  onClose: () => void;
}

/** Stagger-animated mobile menu drawer, anchored below the navbar. */
export default function MobileDrawer({
  open,
  currentTab,
  setTab,
  user,
  logout,
  onClose,
}: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-gray-200/80 dark:border-white/10 absolute top-[calc(100%+8px)] left-0 right-0 p-5 rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-90px)] overflow-y-auto space-y-6"
        >
          {/* Navigation Items */}
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              const Icon = link.icon;
              return (
                <motion.button
                  variants={itemVariants}
                  key={link.id}
                  onClick={() => {
                    setTab(link.id);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {link.id === 'ai-planner' && (
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
                    <span className={link.id === 'ai-planner' ? '' : 'pl-1'}>{link.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[8px] tracking-wider font-mono bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 rounded-full font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                        {link.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 opacity-40 transition-transform ${isActive ? 'translate-x-0.5 text-amber-600 dark:text-amber-400' : ''}`} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Bottom Actions Section */}
          <div className="pt-5 border-t border-gray-200/60 dark:border-white/10">
            {user ? (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-white/5">
                  <div className="relative">
                    <img
                      src={user.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-amber-500/20 object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</h4>
                    <p className="text-xs text-slate-400 truncate font-mono">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setTab('dashboard');
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/10 dark:border-amber-400/10 transition-all active:scale-95"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setTab('login');
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-gray-200/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-center transition-all active:scale-95"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setTab('login');
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 hover:opacity-95 text-center shadow-lg shadow-amber-500/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Get Started</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
