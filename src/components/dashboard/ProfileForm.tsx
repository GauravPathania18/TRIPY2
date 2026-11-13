import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface ProfileFormProps {
  user: any;
  onProfileUpdate: (updatedUser: any) => void;
}

export default function ProfileForm({ user, onProfileUpdate }: ProfileFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ name, email })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json();
      if (res.ok && data.user) {
        onProfileUpdate(data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <User className="w-4 h-4 text-amber-500" />
        <span>Update Account Info</span>
      </h3>

      {profileSuccess && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 text-[11px] text-emerald-600 font-medium">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950 text-xs rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950 text-xs rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={profileLoading}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
        >
          {profileLoading ? 'Saving Info...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );
}
