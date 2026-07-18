import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, MapPin, Users, Calendar, ArrowRight, Shield, RefreshCw, Star, Heart, FileText, CheckCircle2 } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import GlobeSection from './components/GlobeSection';
import Login from './components/Login';
import Destinations from './components/Destinations';
import Packages from './components/Packages';
import Blogs from './components/Blogs';
import AIPlanner from './components/AIPlanner';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import AnimatedCounter from './components/AnimatedCounter';
import ChatAssistant from './components/ChatAssistant';

interface ScrollRevealProps {
  children: React.ReactNode;
}

function ScrollReveal({ children }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [currentTab, setTab] = useState('home');
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Quick Home Planner inputs
  const [homeDest, setHomeDest] = useState('Goa');
  const [homeBudget, setHomeBudget] = useState('50000');
  const [homeDays, setHomeDays] = useState(5);

  useEffect(() => {
    // Check if user session exists in local storage
    const savedUser = localStorage.getItem('trippy_user');
    const savedToken = localStorage.getItem('trippy_token');
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);

        // Verify token with backend
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${parsedUser.id}:user` }
        }).then(res => {
          if (!res.ok) {
            handleLogout();
          }
        }).catch(() => {});
      } catch (e) {
        handleLogout();
      }
    }

    const handleSessionExpired = () => {
      handleLogout();
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Smooth scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${user.id}:user` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (authUser: any, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('trippy_user', JSON.stringify(authUser));
    localStorage.setItem('trippy_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trippy_user');
    localStorage.removeItem('trippy_token');
    setTab('home');
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('trippy_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased overflow-x-hidden selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* Frosted glass header bar */}
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        user={user}
        logout={handleLogout}
        notificationsCount={notifications.length}
        openNotifications={() => setShowNotificationDrawer(true)}
      />

      {/* Main viewport area */}
      <main className="relative">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* HERO SECTION */}
              <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 bg-[#050714] overflow-hidden text-left" id="home-hero">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full filter blur-[140px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-900/30 to-transparent rounded-full filter blur-[120px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
                  
                  {/* Left Hero content */}
                  <div className="lg:col-span-7 space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/35 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono tracking-wider uppercase shadow-[0_2px_10px_rgba(245,158,11,0.08)]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>The Future of Bespoke Travel</span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl sm:text-6xl font-display font-medium tracking-tight text-white leading-none"
                    >
                      Plan Smarter.<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 font-bold">
                        Travel Better.
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-slate-400 max-w-xl text-base sm:text-lg leading-relaxed font-light"
                    >
                      Escape the clutter of cookie-cutter packages. Tell us where you want to go, and let our cognitive AI map out personalized routes, estimated budgets, and climate predictions in real-time.
                    </motion.p>

                    {/* CTA row */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-4 pt-2"
                    >
                      <button
                        onClick={() => setTab('ai-planner')}
                        className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Consult AI Planner</span>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                      </button>
                      <button
                        onClick={() => setTab('destinations')}
                        className="px-6 py-3.5 rounded-2xl border border-white/10 text-slate-200 font-medium text-sm hover:bg-white/5 transition"
                      >
                        Explore Masterpieces
                      </button>
                    </motion.div>
                  </div>

                  {/* Right Hero: Floating AI Planner Quick Card */}
                  <div className="lg:col-span-5" id="hero-floating-card">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="p-6 sm:p-8 rounded-3xl bg-[#0b0e20]/80 border border-white/5 backdrop-blur-xl shadow-2xl relative"
                    >
                      {/* Abstract glass card decorations */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full filter blur-xl pointer-events-none"></div>

                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">
                          Quick Draft Console
                        </span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>

                      <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Where to?</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={homeDest}
                              onChange={(e) => setHomeDest(e.target.value)}
                              placeholder="e.g. Goa, Tokyo, Switzerland..."
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Est. Budget</label>
                            <input
                              type="text"
                              value={homeBudget}
                              onChange={(e) => setHomeBudget(e.target.value)}
                              placeholder="e.g. 50000"
                              className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Duration</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <select
                                value={homeDays}
                                onChange={(e) => setHomeDays(Number(e.target.value))}
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                              >
                                <option value={3}>3 Days</option>
                                <option value={5}>5 Days</option>
                                <option value={7}>7 Days</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Route directly to planner
                            setTab('ai-planner');
                          }}
                          className="w-full py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                        >
                          <span>Draft Private Travel Plan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  </div>

                </div>
              </section>

              {/* TRUSTED BRANDS MARQUEE (Infinite scrolling marquee) */}
              <ScrollReveal>
                <section className="py-8 bg-slate-100 dark:bg-slate-900 border-y border-gray-200/50 dark:border-white/5 relative overflow-hidden" id="marquee-section">
                  <div className="flex gap-16 items-center whitespace-nowrap animate-[marquee_25s_linear_infinite] opacity-60 dark:opacity-40 select-none">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400">
                      <Compass className="w-4 h-4" /> GOOGLE TRAVEL
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400">
                      <Compass className="w-4 h-4" /> AIRBNB
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400">
                      <Compass className="w-4 h-4" /> BOOKING.COM
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400">
                      <Compass className="w-4 h-4" /> TRIPADVISOR
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400">
                      <Compass className="w-4 h-4" /> AMAZON WEB SERVICES
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400">
                      <Compass className="w-4 h-4" /> GOOGLE MAPS
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* AI FEATURES SECTION (Bento styled grid) */}
              <ScrollReveal>
                <section className="py-12 md:py-16 bg-white dark:bg-slate-950 text-left" id="features-grid">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-3 text-slate-900 dark:text-white">
                        Supercharged Travel Intel
                      </h2>
                      <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-light">
                        Forget spreadsheets. Our integrated modular suites solve every step of your travel timeline.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      
                      {/* Feature 1 */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition duration-300">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit text-amber-500 mb-6">
                          <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-2">Cognitive AI Routing</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">
                          Predicts optimal day-by-day sightseeing timelines, transport systems, and cost parameters using Gemini models.
                        </p>
                      </div>

                      {/* Feature 2 */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition duration-300">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit text-amber-500 mb-6">
                          <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-2">Climate Intelligence</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">
                          Cross-checks seasonal forecasts, packing requirements, and optimal visiting windows instantly.
                        </p>
                      </div>

                      {/* Feature 3 */}
                      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition duration-300">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit text-amber-500 mb-6">
                          <RefreshCw className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-2">Cloud Synced Workspace</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">
                          Save favorite travel plans, retrieve boarding passes offline, and update visitor checklists instantly.
                        </p>
                      </div>

                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* INTERACTIVE 3D GLOBE CENTERPIECE */}
              <ScrollReveal>
                <GlobeSection />
              </ScrollReveal>

              {/* LIVE METRIC COUNTERS SECTION */}
              <ScrollReveal>
                <section className="py-12 md:py-16 bg-white dark:bg-slate-950 border-t border-gray-200/30 dark:border-white/5">
                  <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center space-y-2">
                      <span className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white block font-mono">
                        <AnimatedCounter value={20} suffix="K+" />
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-mono">Trips Synced</span>
                    </div>
                    <div className="text-center space-y-2">
                      <span className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white block font-mono">
                        <AnimatedCounter value={150} suffix="+" />
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-mono">Countries Sourced</span>
                    </div>
                    <div className="text-center space-y-2">
                      <span className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white block font-mono">
                        <AnimatedCounter value={98} suffix="%" />
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-mono">Satisfaction</span>
                    </div>
                    <div className="text-center space-y-2">
                      <span className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white block font-mono">
                        <AnimatedCounter value={5} suffix="M+" />
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-mono">AI recommendations</span>
                    </div>
                  </div>
                  <p className="text-center text-[11px] font-mono tracking-wider text-amber-600 dark:text-amber-400 mt-10 max-w-xl mx-auto px-4 bg-amber-500/5 dark:bg-amber-500/10 py-2 border border-amber-500/20 rounded-xl">
                    ⚠️ Demo Disclaimer: These impact statistics and traveler metrics represent simulated illustrative benchmarks for demonstration purposes.
                  </p>
                </section>
              </ScrollReveal>

              {/* CONTINUOUS SCROLLING SECTIONS */}
              <ScrollReveal>
                <div id="home-destinations" className="border-t border-gray-200/30 dark:border-white/5">
                  <Destinations setTab={setTab} user={user} isHome={true} />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div id="home-packages" className="border-t border-gray-200/30 dark:border-white/5">
                  <Packages setTab={setTab} user={user} isHome={true} />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div id="home-blogs" className="border-t border-gray-200/30 dark:border-white/5">
                  <Blogs setTab={setTab} user={user} isHome={true} />
                </div>
              </ScrollReveal>

              {/* TESTIMONIAL FEED */}
              <ScrollReveal>
                <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 text-left overflow-hidden border-t border-gray-200/30 dark:border-white/5">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-10">
                      <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold px-3 py-1 bg-amber-500/5 rounded-full">
                        Real Journeys, Real Stories
                      </span>
                      <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mt-4 mb-3 text-slate-900 dark:text-white">
                        Verified Traveler Experience Logs
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-light">
                        Real experiences shared by active members who navigated the world using our curated travel packages.
                      </p>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Testimonial 1 */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <span className="text-xs font-mono px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-semibold uppercase tracking-wider">
                            Rajasthan Tour
                          </span>
                        </div>
                        <div className="text-amber-500 font-mono text-xs">★★★★★</div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                          "Just returned from the 10-day Royal Heritage Tour of Rajasthan. Staying in actual haveli palace hotels felt like stepping back in time! The private chauffeur took all the stress out of transit. Waking up to the sunrise safari in Jaisalmer was breathtaking. Highly recommend planning through here."
                        </p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                            alt="Aditya Sharma"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Aditya Sharma</p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">@aditya_travels</p>
                          </div>
                        </div>
                        <a
                          href="https://www.reddit.com/r/travel/comments/17q8j9w/just_returned_from_10_days_in_rajasthan_our/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-amber-500 hover:text-amber-500 transition text-[10px] font-mono font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex-shrink-0 whitespace-nowrap"
                        >
                          View Thread
                        </a>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <span className="text-xs font-mono px-2.5 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg font-semibold uppercase tracking-wider">
                            Himalayan Trek
                          </span>
                        </div>
                        <div className="text-amber-500 font-mono text-xs">★★★★★</div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                          "The High Altitude Himalayan Trek in Manali was an absolute dream. Our guides were certified rescue professionals who checked our oxygen levels daily. Waking up to the snow-capped views at the Solang base camp is a memory I will cherish forever. Worth every single penny!"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                            alt="Pooja Nair"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Pooja Nair</p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">@pooja_trekking</p>
                          </div>
                        </div>
                        <a
                          href="https://www.reddit.com/r/backpacking/comments/119sh7q/trekking_in_the_himalayas_lessons_learned/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-amber-500 hover:text-amber-500 transition text-[10px] font-mono font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex-shrink-0 whitespace-nowrap"
                        >
                          View Thread
                        </a>
                      </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <span className="text-xs font-mono px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold uppercase tracking-wider">
                            Swiss Rail Tour
                          </span>
                        </div>
                        <div className="text-amber-500 font-mono text-xs">★★★★★</div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                          "I used the Swiss Rail travel plan from this app last winter. Traversing the alpine slopes through panoramic trains was magical. The platform mapped out all connections, ticket validation steps, and sightseeing lookouts perfectly. It’s like having a local transit guide in your pocket."
                        </p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                            alt="Marcus Vance"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Marcus Vance</p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">@marcus_explorer</p>
                          </div>
                        </div>
                        <a
                          href="https://www.reddit.com/r/travel/comments/15k6p8u/scenic_trains_in_switzerland_which_are_the_best/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-amber-500 hover:text-amber-500 transition text-[10px] font-mono font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex-shrink-0 whitespace-nowrap"
                        >
                          View Thread
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </ScrollReveal>

              {/* FOOTER */}
              <Footer setTab={setTab} />
            </motion.div>
          )}

          {currentTab === 'destinations' && (
            <motion.div
              key="destinations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Destinations setTab={setTab} user={user} />
              <Footer setTab={setTab} />
            </motion.div>
          )}

          {currentTab === 'packages' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Packages setTab={setTab} user={user} />
              <Footer setTab={setTab} />
            </motion.div>
          )}

          {currentTab === 'ai-planner' && (
            <motion.div
              key="ai-planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <AIPlanner setTab={setTab} user={user} />
              <Footer setTab={setTab} />
            </motion.div>
          )}

          {currentTab === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Blogs setTab={setTab} user={user} />
              <Footer setTab={setTab} />
            </motion.div>
          )}

          {currentTab === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Login onAuthSuccess={handleAuthSuccess} setTab={setTab} />
            </motion.div>
          )}

          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Dashboard setTab={setTab} user={user} onProfileUpdate={handleProfileUpdate} />
              <Footer setTab={setTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notifications Drawer Overlay */}
      <AnimatePresence>
        {showNotificationDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 h-full p-6 text-left shadow-2xl relative overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Workspace Bulletins ({notifications.length})
                </span>
                <button
                  onClick={() => setShowNotificationDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold text-xs"
                >
                  Dismiss
                </button>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 font-mono">No new bulletins listed.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-white/5 text-xs text-slate-500 leading-relaxed font-mono">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                        {notif.title}
                      </p>
                      <p className="font-light">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Concierge Assistant */}
      <ChatAssistant user={user} />

      <SpeedInsights />
    </div>
  );
}
