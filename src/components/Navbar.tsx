import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, User, LogOut, Menu, X, Bell, Sparkles, ChevronRight, Globe, Briefcase, BookOpen, ArrowLeft } from 'lucide-react';
import { TrippyLogo } from './TrippyLogo';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 40) {
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        setIsScrolled(true);
        // Scroll down: collapse navbar. Scroll up: optionally expand or keep collapsed.
        // But do not collapse if mobile menu is open
        if (currentScrollY > lastScrollY && currentScrollY > 100 && !mobileMenuOpen) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY && Math.abs(currentScrollY - lastScrollY) > 10) {
          // If scrolling up significantly, auto-reveal for friendly UX
          setIsVisible(true);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  const navLinks = [
    { id: 'home', label: 'Explore', icon: Compass },
    { id: 'destinations', label: 'Destinations', icon: Globe },
    { id: 'packages', label: 'Packages', icon: Briefcase },
    { id: 'ai-planner', label: 'AI Planner', badge: 'AI', icon: Sparkles },
    { id: 'blog', label: 'Blogs', icon: BookOpen },
  ];

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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setTab('home')}
                className="p-2.5 rounded-xl bg-slate-950 text-amber-400 hover:text-amber-300 border border-amber-500/35 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            )}
            <button
              id="logo-button"
              onClick={() => {
                setTab('home');
                setMobileMenuOpen(false);
              }}
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

          {/* Action Buttons */}
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
        <AnimatePresence>
          {mobileMenuOpen && (
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
                        setMobileMenuOpen(false);
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
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/10 dark:border-amber-400/10 transition-all active:scale-95"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Workspace</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
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
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-gray-200/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-center transition-all active:scale-95"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setTab('login');
                        setMobileMenuOpen(false);
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
      </nav>
      
      {/* Floating expand button when navbar is collapsed */}
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
              onClick={() => {
                setIsVisible(true);
                setMobileMenuOpen(true);
              }}
              className="fixed top-4 right-6 z-50 p-3 px-5 rounded-full bg-slate-950/95 text-amber-400 backdrop-blur-md shadow-xl border border-amber-500/35 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1 group"
              id="navbar-expand-button"
              title="Show Navigation Bar"
            >
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400">MENU</span>
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
