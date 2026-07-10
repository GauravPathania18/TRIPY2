import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginProps {
  onAuthSuccess: (user: any, token: string) => void;
  setTab: (tab: string) => void;
}

export default function Login({ onAuthSuccess, setTab }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onAuthSuccess(data.user, data.token);
      setTab('dashboard'); // Direct entry to dashboard Workspace
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser || !googleUser.email) {
        throw new Error('Could not retrieve email from Google Account.');
      }
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.displayName,
          email: googleUser.email,
          photoURL: googleUser.photoURL
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google sign-in failed on the server.');
      }
      onAuthSuccess(data.user, data.token);
      setTab('dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.message?.includes('popup')) {
        setError('Popup blocked or closed. In this preview iframe, please use the standard login with "Demo admin?" credentials or open the app in a new tab.');
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex" id="login-split-page">
      {/* Left Column: Stunning Cinematic Travel Landscape */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Cinematic background photo with cool grading */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80")' }}
        />
        {/* Blue/Teal Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-cyan-500/10 mix-blend-multiply"></div>

        {/* Floating grid patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]"></div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-lg p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="p-3 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Trippy</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-tight mb-6"
          >
            The future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">
              travel planning
            </span>{' '}
            is here.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg leading-relaxed mb-8 font-light"
          >
            "Instead of simply selling trips, we build customized experiences that resonate with your inner explorer."
          </motion.p>

          {/* Testimonial widget inside Left side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <div className="flex gap-1 mb-2 text-amber-400">
              {'★'.repeat(5)}
            </div>
            <p className="text-sm text-slate-200 italic mb-3">
              "The AI recommended a private sunset yacht in South Goa which became our absolute favorite memory!"
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-cyan-400">Aditya Sharma</span>
              <span className="text-[10px] text-slate-400">— Saved 5 Trips</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Glassmorphic Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Animated ambient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-medium text-slate-900 dark:text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isLogin ? 'Enter your details to access your dashboard' : 'Begin crafting your customized travel plans'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm mb-6 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.12.57 4.29 1.69l3.19-3.19C17.5 1.7 14.97 1 12 1 7.28 1 3.32 3.73 1.5 7.72l3.77 2.92C6.18 7.33 8.87 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.92c2.2-2.03 3.67-5.01 3.67-8.65z" />
              <path fill="#FBBC05" d="M5.27 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.5 6.8C.54 8.71 0 10.8 0 13s.54 4.29 1.5 6.2l3.77-2.92z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.76-2.92c-1.1.74-2.52 1.18-4.2 1.18-3.13 0-5.82-2.29-6.73-5.6l-3.77 2.92C3.32 20.27 7.28 23 12 23z" />
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-6 flex items-center justify-center">
            <span className="absolute left-0 right-0 border-b border-gray-200 dark:border-white/5"></span>
            <span className="relative z-10 px-3 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 font-mono tracking-widest uppercase">
              Or Use Email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white text-sm transition focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/5"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white text-sm transition focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/5"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('pathaniagaurav1818@gmail.com');
                      setPassword('admin123');
                    }}
                    className="text-xs text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Demo admin?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white text-sm transition focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-white/10 text-blue-600 focus:ring-blue-500" />
                  <span>Remember Me</span>
                </label>
                <button type="button" className="hover:underline">Forgot Password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-blue-600 dark:text-cyan-400 font-semibold ml-1.5 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
