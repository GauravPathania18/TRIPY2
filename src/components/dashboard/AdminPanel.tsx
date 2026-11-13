import React, { useState, useEffect } from 'react';
import { ShieldCheck, Inbox, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Booking, ContactMessage, Destination } from '../../types';

interface AdminPanelProps {
  user: any;
  bookings: Booking[];
  onRefresh: () => void;
}

type ContentTab = 'destination' | 'package' | 'blog';

const inputCls = 'w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950 text-xs rounded-lg text-slate-900 dark:text-white';
const labelCls = 'block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1';

export default function AdminPanel({ user, bookings, onRefresh }: AdminPanelProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');

  // Booking management feedback
  const [statusFeedback, setStatusFeedback] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  // Content creation tabs + feedback
  const [activeTab, setActiveTab] = useState<ContentTab>('destination');
  const [createFeedback, setCreateFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [creating, setCreating] = useState(false);

  // Destination form
  const [destForm, setDestForm] = useState({
    name: '', description: '', country: '', city: '', image_url: '',
    budget_range: '', best_season: '', category: 'beach',
    travel_style: 'luxury', climate: 'tropical', latitude: 0, longitude: 0
  });

  // Package form
  const [pkgForm, setPkgForm] = useState({
    name: '', description: '', destination_id: '', price: 0, duration: 1,
    difficulty: 'easy', inclusions: '', exclusions: '', image_url: ''
  });

  // Blog form
  const [blogForm, setBlogForm] = useState({
    title: '', content: '', category: 'travel_guides', image_url: '', status: 'published'
  });

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.id}:admin`
  };

  // --- Section 2: contact inbox (admin-only), loaded on mount of the panel ---
  useEffect(() => {
    const loadInbox = async () => {
      setInboxLoading(true);
      setInboxError('');
      try {
        const res = await fetch('/api/contact', { headers: { 'Authorization': `Bearer ${user.id}:admin` } });
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('session-expired'));
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setInboxError('Failed to load contact inbox.');
      } finally {
        setInboxLoading(false);
      }
    };
    loadInbox();
  }, [user]);

  // Destinations feed the package form's destination select
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const res = await fetch('/api/destinations');
        if (res.ok) {
          const data = await res.json();
          setDestinations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load destinations for admin panel', err);
      }
    };
    loadDestinations();
  }, [user]);

  // --- Section 1: booking status management ---
  const handleStatusChange = async (bookingId: string, status: string) => {
    setStatusFeedback(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json().catch(() => ({} as any));
      if (res.ok) {
        setStatusFeedback({ id: bookingId, ok: true, msg: `Status updated to ${status}.` });
        onRefresh(); // pull fresh bookings + notifications
      } else {
        setStatusFeedback({ id: bookingId, ok: false, msg: data?.error || `Update failed (HTTP ${res.status}).` });
      }
    } catch (err) {
      setStatusFeedback({ id: bookingId, ok: false, msg: 'Update failed. Check your connection.' });
    }
  };

  // --- Section 3: content creation forms ---
  const postJson = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'POST', headers: adminHeaders, body: JSON.stringify(body) });
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('session-expired'));
      return null;
    }
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || `Request failed (HTTP ${res.status}).`);
    return data;
  };

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateFeedback(null);
    try {
      await postJson('/api/destinations', {
        ...destForm,
        latitude: Number(destForm.latitude) || 0,
        longitude: Number(destForm.longitude) || 0,
        is_featured: false
      });
      setCreateFeedback({ ok: true, msg: 'Destination created successfully!' });
      setDestForm({ name: '', description: '', country: '', city: '', image_url: '', budget_range: '', best_season: '', category: 'beach', travel_style: 'luxury', climate: 'tropical', latitude: 0, longitude: 0 });
      // Refresh destination select + dashboard lists
      const res = await fetch('/api/destinations');
      if (res.ok) {
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : []);
      }
      onRefresh();
    } catch (err: any) {
      setCreateFeedback({ ok: false, msg: err.message || 'Failed to create destination.' });
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateFeedback(null);
    try {
      await postJson('/api/packages', {
        name: pkgForm.name,
        description: pkgForm.description,
        destination_id: pkgForm.destination_id,
        price: Number(pkgForm.price) || 0,
        duration: Number(pkgForm.duration) || 0,
        difficulty: pkgForm.difficulty,
        inclusions: pkgForm.inclusions.split(',').map((s) => s.trim()).filter(Boolean),
        exclusions: pkgForm.exclusions.split(',').map((s) => s.trim()).filter(Boolean),
        image_url: pkgForm.image_url,
        itinerary: [],
        is_featured: false
      });
      setCreateFeedback({ ok: true, msg: 'Package created successfully!' });
      setPkgForm({ name: '', description: '', destination_id: '', price: 0, duration: 1, difficulty: 'easy', inclusions: '', exclusions: '', image_url: '' });
      onRefresh();
    } catch (err: any) {
      setCreateFeedback({ ok: false, msg: err.message || 'Failed to create package.' });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateFeedback(null);
    try {
      await postJson('/api/blogs', {
        title: blogForm.title,
        content: blogForm.content,
        category: blogForm.category,
        image_url: blogForm.image_url,
        status: blogForm.status
      });
      setCreateFeedback({ ok: true, msg: 'Blog post created successfully!' });
      setBlogForm({ title: '', content: '', category: 'travel_guides', image_url: '', status: 'published' });
      onRefresh();
    } catch (err: any) {
      setCreateFeedback({ ok: false, msg: err.message || 'Failed to create blog post.' });
    } finally {
      setCreating(false);
    }
  };

  const cardCls = 'bg-white dark:bg-slate-900 border border-amber-500/20 rounded-3xl p-6 shadow-xl text-left';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium w-fit">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin Control Deck</span>
      </div>

      {/* 1. Booking management */}
      <div className={cardCls}>
        <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-amber-500" />
          <span>Booking Management</span>
        </h2>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-5">
          {bookings.length} total booking{bookings.length === 1 ? '' : 's'} · change status inline
        </p>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-4">No bookings yet.</p>
        ) : (
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {bookings.map((book) => (
              <div key={book.id} className="p-3 bg-gray-50 dark:bg-slate-950/60 border border-gray-100 dark:border-white/5 rounded-xl text-xs">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] text-slate-400 block">{book.id?.toUpperCase()}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(book as any).package_name || book.package_id}
                    </span>
                    <span className="text-slate-400 font-mono ml-2">₹{book.total_cost?.toLocaleString()}</span>
                  </div>
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-[11px] font-mono rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
                {statusFeedback?.id === book.id && (
                  <p className={`mt-2 text-[10px] font-mono flex items-center gap-1 ${statusFeedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                    {statusFeedback.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {statusFeedback.msg}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Contact inbox */}
      <div className={cardCls}>
        <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-amber-500" />
          <span>Contact Inbox</span>
        </h2>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-5">
          {messages.length} message{messages.length === 1 ? '' : 's'} · loaded on panel mount
        </p>

        {inboxLoading ? (
          <p className="text-xs text-slate-400 font-mono py-4">Loading messages...</p>
        ) : inboxError ? (
          <p className="text-xs text-red-500 font-mono py-4">{inboxError}</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-4">No contact messages yet.</p>
        ) : (
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3 bg-gray-50 dark:bg-slate-950/60 border border-gray-100 dark:border-white/5 rounded-xl text-xs">
                <div className="flex justify-between items-start gap-3 mb-1.5">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{msg.subject}</span>
                    <span className="block font-mono text-[10px] text-slate-400">{msg.name} · {msg.email}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${msg.status === 'unread' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'}`}>
                    {msg.status}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-300 font-light leading-relaxed">{msg.message}</p>
                <span className="block mt-1.5 font-mono text-[9px] text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Create content — tabbed forms */}
      <div className={cardCls}>
        <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-500" />
          <span>Create Content</span>
        </h2>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-5">Publish new catalogue entries</p>

        <div className="flex gap-2 mb-5">
          {(['destination', 'package', 'blog'] as ContentTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCreateFeedback(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-gray-200 dark:border-white/10 text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {createFeedback && (
          <div className={`p-3 mb-4 rounded-lg text-[11px] font-medium flex items-center gap-2 ${
            createFeedback.ok
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 text-emerald-600'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-600'
          }`}>
            {createFeedback.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {createFeedback.msg}
          </div>
        )}

        {activeTab === 'destination' && (
          <form onSubmit={handleCreateDestination} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div><label className={labelCls}>Name</label><input required className={inputCls} value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value })} /></div>
            <div><label className={labelCls}>Country</label><input required className={inputCls} value={destForm.country} onChange={(e) => setDestForm({ ...destForm, country: e.target.value })} /></div>
            <div><label className={labelCls}>City</label><input required className={inputCls} value={destForm.city} onChange={(e) => setDestForm({ ...destForm, city: e.target.value })} /></div>
            <div><label className={labelCls}>Image URL</label><input className={inputCls} value={destForm.image_url} onChange={(e) => setDestForm({ ...destForm, image_url: e.target.value })} /></div>
            <div><label className={labelCls}>Budget Range</label><input className={inputCls} placeholder="₹40,000 – ₹1,20,000" value={destForm.budget_range} onChange={(e) => setDestForm({ ...destForm, budget_range: e.target.value })} /></div>
            <div><label className={labelCls}>Best Season</label><input className={inputCls} placeholder="Oct – Mar" value={destForm.best_season} onChange={(e) => setDestForm({ ...destForm, best_season: e.target.value })} /></div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={destForm.category} onChange={(e) => setDestForm({ ...destForm, category: e.target.value })}>
                <option value="beach">beach</option><option value="mountains">mountains</option>
                <option value="adventure">adventure</option><option value="family">family</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Travel Style</label>
              <select className={inputCls} value={destForm.travel_style} onChange={(e) => setDestForm({ ...destForm, travel_style: e.target.value })}>
                <option value="luxury">luxury</option><option value="adventure">adventure</option><option value="budget">budget</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Climate</label>
              <select className={inputCls} value={destForm.climate} onChange={(e) => setDestForm({ ...destForm, climate: e.target.value })}>
                <option value="tropical">tropical</option><option value="alpine">alpine</option>
                <option value="moderate">moderate</option><option value="desert">desert</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Latitude</label><input type="number" step="any" className={inputCls} value={destForm.latitude} onChange={(e) => setDestForm({ ...destForm, latitude: Number(e.target.value) })} /></div>
              <div><label className={labelCls}>Longitude</label><input type="number" step="any" className={inputCls} value={destForm.longitude} onChange={(e) => setDestForm({ ...destForm, longitude: Number(e.target.value) })} /></div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea required rows={3} className={inputCls} value={destForm.description} onChange={(e) => setDestForm({ ...destForm, description: e.target.value })} />
            </div>
            <button type="submit" disabled={creating} className="sm:col-span-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-60">
              {creating ? 'Creating...' : 'Create Destination'}
            </button>
          </form>
        )}

        {activeTab === 'package' && (
          <form onSubmit={handleCreatePackage} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div><label className={labelCls}>Name</label><input required className={inputCls} value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} /></div>
            <div>
              <label className={labelCls}>Destination</label>
              <select required className={inputCls} value={pkgForm.destination_id} onChange={(e) => setPkgForm({ ...pkgForm, destination_id: e.target.value })}>
                <option value="">Select destination...</option>
                {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Price (₹)</label><input type="number" min={0} required className={inputCls} value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>Duration (days)</label><input type="number" min={1} required className={inputCls} value={pkgForm.duration} onChange={(e) => setPkgForm({ ...pkgForm, duration: Number(e.target.value) })} /></div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select className={inputCls} value={pkgForm.difficulty} onChange={(e) => setPkgForm({ ...pkgForm, difficulty: e.target.value })}>
                <option value="easy">easy</option><option value="moderate">moderate</option><option value="hard">hard</option>
              </select>
            </div>
            <div><label className={labelCls}>Image URL</label><input className={inputCls} value={pkgForm.image_url} onChange={(e) => setPkgForm({ ...pkgForm, image_url: e.target.value })} /></div>
            <div><label className={labelCls}>Inclusions (comma-separated)</label><input className={inputCls} placeholder="Flights, Hotel, Breakfast" value={pkgForm.inclusions} onChange={(e) => setPkgForm({ ...pkgForm, inclusions: e.target.value })} /></div>
            <div><label className={labelCls}>Exclusions (comma-separated)</label><input className={inputCls} placeholder="Lunch, Travel insurance" value={pkgForm.exclusions} onChange={(e) => setPkgForm({ ...pkgForm, exclusions: e.target.value })} /></div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea required rows={3} className={inputCls} value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })} />
            </div>
            <button type="submit" disabled={creating} className="sm:col-span-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-60">
              {creating ? 'Creating...' : 'Create Package'}
            </button>
          </form>
        )}

        {activeTab === 'blog' && (
          <form onSubmit={handleCreateBlog} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2"><label className={labelCls}>Title</label><input required className={inputCls} value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} /></div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}>
                <option value="travel_guides">travel_guides</option><option value="tips">tips</option>
                <option value="local_culture">local_culture</option><option value="safety_advice">safety_advice</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={blogForm.status} onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}>
                <option value="published">published</option><option value="draft">draft</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Image URL</label><input className={inputCls} value={blogForm.image_url} onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })} /></div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Content</label>
              <textarea required rows={6} className={inputCls} value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} />
            </div>
            <button type="submit" disabled={creating} className="sm:col-span-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-60">
              {creating ? 'Creating...' : 'Create Blog Post'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
