import { motion } from 'motion/react';
import { Compass, Globe, Briefcase, Sparkles, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavLink {
  id: string;
  label: string;
  badge?: string;
  icon: LucideIcon;
}

export const navLinks: NavLink[] = [
  { id: 'home', label: 'Explore', icon: Compass },
  { id: 'destinations', label: 'Destinations', icon: Globe },
  { id: 'packages', label: 'Packages', icon: Briefcase },
  { id: 'ai-planner', label: 'AI Planner', badge: 'AI', icon: Sparkles },
  { id: 'blog', label: 'Blogs', icon: BookOpen },
];

interface NavLinksProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

/** Desktop navigation row with the motion layoutId active underline. */
export default function NavLinks({ currentTab, setTab }: NavLinksProps) {
  return (
    <div className="hidden lg:flex items-center gap-1">
      {navLinks.map((link) => {
        const isActive = currentTab === link.id;
        return (
          <button
            key={link.id}
            id={`nav-${link.id}`}
            onClick={() => setTab(link.id)}
            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-500/10'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {link.label}
              {link.badge && (
                <span className="px-1.5 text-[8px] tracking-wider font-mono bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 rounded-full flex items-center justify-center font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  {link.badge}
                </span>
              )}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-1 left-4 right-4 h-0.5 bg-amber-500 dark:bg-amber-400 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
