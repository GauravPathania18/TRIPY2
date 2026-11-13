import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface BulletinsListProps {
  notifications: any[];
  user: any;
}

export default function BulletinsList({ notifications, user }: BulletinsListProps) {
  const [items, setItems] = useState<any[]>(notifications);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  // Task D: clicking a bulletin marks it read server-side, then dims it locally.
  const handleMarkRead = async (notif: any) => {
    if (notif.is_read) return;
    try {
      const res = await fetch(`/api/notifications/${notif.id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.id}:user` }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      if (res.ok) {
        setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
      }
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm">
      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <Bell className="w-4 h-4 text-amber-500" />
        <span>Workspace Bulletins</span>
      </h3>

      <div className="space-y-3 max-h-[220px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-4">No new system updates.</p>
        ) : (
          items.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleMarkRead(notif)}
              title={notif.is_read ? 'Read' : 'Click to mark as read'}
              className={`w-full text-left p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-gray-100 dark:border-white/5 text-[11px] font-mono leading-relaxed text-slate-500 dark:text-slate-300 transition ${notif.is_read ? 'opacity-60' : ''}`}
            >
              <p className="text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                {notif.is_read ? (
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full shrink-0"></span>
                ) : (
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                )}
                {notif.title}
              </p>
              <p className="font-light">{notif.message}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
