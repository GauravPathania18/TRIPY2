import { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Bell, ArrowLeft } from 'lucide-react';
import { TrippyLogo } from './TrippyLogo';
import NavLinks from './navbar/NavLinks';
import UserMenu from './navbar/UserMenu';
import MobileDrawer from './navbar/MobileDrawer';
import FloatingActions from './navbar/FloatingActions';
import useAutoHideHeader from './navbar/useAutoHideHeader';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: any | null;
  logout: () => void;
  notificationsCount: number;
  openNotifications: () => void;
}

export default function Navbar({
  currentTab,
  setTab,
  user,
  logout,
  notificationsCount,
  openNotifications,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isScrolled, isVisible, setIsVisible } = useAutoHideHeader(mobileMenuOpen);

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed left-0 right-0 z-50 transition-all duration-500 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          isScrolled
            ? 'top-3 max-w-6xl mx-auto px-4 sm:px-6'
            : 'top-0 w-full px-4 sm:px-8'
        }`}
      >
        <div
          className={`mx-auto transition-all duration-500 ${
            isScrolled
              ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-none py-3 px-5 sm:px-6 rounded-2xl'
              : 'bg-transparent py-6 border-b border-transparent'
          } flex items-center justify-between`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            {currentTab !== 'home' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => setTab('home')}
                className="p-2.5 rounded-xl bg-slate-950 text-amber-400 hover:text-amber-300 border border-amber-500/35 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            )}
            <button
              id="logo-button"
              onClick={() => { setTab('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
            >
              <TrippyLogo />
              <div className="flex flex-col text-left leading-none">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Trippy
                </span>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-amber-500/80 uppercase font-bold mt-0.5">
                  Premium Guide
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <NavLinks currentTab={currentTab} setTab={setTab} />

          {/* Action Buttons */}
          <UserMenu
            user={user} setTab={setTab} logout={logout}
            notificationsCount={notificationsCount} openNotifications={openNotifications}
          />

          {/* Mobile Menu Trigger & Notifications */}
          <div className="flex items-center gap-2.5 lg:hidden">
            {user && (
              <button
                onClick={openNotifications}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-900 relative text-slate-600 dark:text-slate-300 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition"
              >
                <Bell className="w-4 h-4" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-mono font-bold flex items-center justify-center border border-white">
                    {notificationsCount}
                  </span>
                )}
              </button>
            )}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-900 text-slate-800 dark:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <MobileDrawer
          open={mobileMenuOpen} currentTab={currentTab} setTab={setTab}
          user={user} logout={logout} onClose={() => setMobileMenuOpen(false)}
        />
      </nav>

      {/* Floating expand button when navbar is collapsed */}
      <FloatingActions
        isVisible={isVisible} isScrolled={isScrolled} currentTab={currentTab} setTab={setTab}
        onOpenMenu={() => { setIsVisible(true); setMobileMenuOpen(true); }}
      />
    </>
  );
}
