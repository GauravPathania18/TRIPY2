import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Sparkles, User, LogOut } from 'lucide-react';

interface UserMenuProps {
  user: any | null;
  setTab: (tab: string) => void;
  logout: () => void;
  notificationsCount: number;
  openNotifications: () => void;
}

/** Desktop action area: notification bell, avatar dropdown, or guest CTAs. */
export default function UserMenu({
  user,
  setTab,
  logout,
  notificationsCount,
  openNotifications,
}: UserMenuProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <div className="hidden lg:flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <button
            id="bell-button"
            onClick={openNotifications}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-900 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition relative text-slate-600 dark:text-slate-300"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-mono font-bold flex items-center justify-center border border-white">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* User Dropdown Profile */}
          <div className="relative">
            <button
              id="user-profile-button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-400 transition"
            >
              <img
                src={user.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium pr-2 max-w-[100px] truncate text-slate-700 dark:text-slate-300">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl p-2 shadow-xl z-50 text-left"
                >
                  <div className="p-3 border-b border-gray-100 dark:border-white/5">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                  </div>
                  <div className="p-1 space-y-1 mt-1">
                    <button
                      onClick={() => {
                        setTab('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Workspace</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            id="btn-login-tab"
            onClick={() => setTab('login')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition"
          >
            Sign In
          </button>
          <button
            id="btn-get-started"
            onClick={() => setTab('login')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-1.5 group"
          >
            <span>Get Started</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
