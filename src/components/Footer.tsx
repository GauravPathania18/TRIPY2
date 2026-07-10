import { Compass, Sparkles, Send } from 'lucide-react';
import { TrippyLogo } from './TrippyLogo';

interface FooterProps {
  setTab: (tab: string) => void;
}

export default function Footer({ setTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white border-t border-white/5 py-16 relative overflow-hidden text-left" id="main-footer">
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Logo Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <TrippyLogo className="w-10 h-10" />
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-xl tracking-tight text-white">Tripy</span>
                <span className="text-[9px] font-mono tracking-widest text-amber-500/80 uppercase font-bold mt-0.5">
                  Premium Guide
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-light leading-relaxed max-w-sm">
              Crafting premium travel experiences using predictive climate intelligence and advanced AI routing.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] uppercase tracking-widest font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                Premium Design System
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-light">
              <li>
                <button onClick={() => setTab('home')} className="hover:text-amber-400 transition cursor-pointer">
                  Landing
                </button>
              </li>
              <li>
                <button onClick={() => setTab('destinations')} className="hover:text-amber-400 transition cursor-pointer">
                  Destinations
                </button>
              </li>
              <li>
                <button onClick={() => setTab('packages')} className="hover:text-amber-400 transition cursor-pointer">
                  Packages
                </button>
              </li>
            </ul>
          </div>

          {/* Technology Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-light">
              <li>
                <button onClick={() => setTab('ai-planner')} className="hover:text-amber-400 transition cursor-pointer">
                  AI Trip Generator
                </button>
              </li>
              <li>
                <button onClick={() => setTab('blog')} className="hover:text-amber-400 transition cursor-pointer">
                  Travel Blogs
                </button>
              </li>
              <li>
                <button onClick={() => setTab('dashboard')} className="hover:text-amber-400 transition cursor-pointer">
                  My Workspace
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">Weekly Bulletins</h4>
            <p className="text-xs text-slate-400 font-light">
              Join our exclusive club of adventurers for seasonal destination releases.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="enter your email..."
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 transition flex items-center justify-center text-slate-950 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
          <span>&copy; {currentYear} TRIPY INT. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">PRIVACY</a>
            <a href="#" className="hover:text-slate-300">TERMS</a>
            <a href="#" className="hover:text-slate-300">SECURITY</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
