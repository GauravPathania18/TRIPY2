import React, { useEffect, useState } from 'react';

/**
 * Favorites state + API wiring for the destination carousel:
 *  - loads the signed-in user's favorites (401 → session-expired event)
 *  - toggles a favorite optimistically per card, with per-id loading flags
 */
export function useFavorites(user: any | null, setTab: (tab: string) => void) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favLoading, setFavLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${user.id}:user` }
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFavorites(data.map((f: any) => f.destination_id));
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Failed to fetch favorites', err);
      setFavorites([]);
    }
  };

  const toggleFavorite = async (destId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setTab('login');
      return;
    }

    setFavLoading(prev => ({ ...prev, [destId]: true }));
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ destinationId: destId })
      });
      const data = await res.json();
      if (data.favorited) {
        setFavorites(prev => [...prev, destId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== destId));
      }
    } catch (err) {
      console.error('Favorite toggle failed', err);
    } finally {
      setFavLoading(prev => ({ ...prev, [destId]: false }));
    }
  };

  return { favorites, favLoading, toggleFavorite };
}
