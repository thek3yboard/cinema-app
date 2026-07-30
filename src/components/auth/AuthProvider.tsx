"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function migrateLegacyMedia(userId: string) {
  const migrationKey = `cinema:legacy-media-migrated:${userId}`;
  if (localStorage.getItem(migrationKey)) return;

  const records = new Map<string, Record<string, boolean | number | string>>();
  const keyPattern = /^(movie|show)_(watchlist|watched|favorite|rating)_(\d+)$/;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    const match = key?.match(keyPattern);
    if (!match) continue;

    const [, legacyType, field, mediaId] = match;
    const mediaType = legacyType === 'show' ? 'tv' : 'movie';
    const recordKey = `${mediaType}:${mediaId}`;
    const record = records.get(recordKey) ?? { user_id: userId, media_type: mediaType, media_id: Number(mediaId) };
    const rawValue = localStorage.getItem(key);

    if (field === 'rating') record.rating = Number(rawValue ?? 0);
    if (field === 'watchlist') record.in_watchlist = rawValue === 'true';
    if (field === 'watched') record.is_watched = rawValue === 'true';
    if (field === 'favorite') record.is_favorite = rawValue === 'true';
    records.set(recordKey, record);
  }

  const payload = Array.from(records.values()).filter((record) =>
    Boolean(record.in_watchlist || record.is_watched || record.is_favorite || record.rating)
  );

  const supabase = createClient();
  if (payload.length) {
    const { error } = await supabase.from('user_media').upsert(payload, { onConflict: 'user_id,media_type,media_id' });
    if (error) throw error;
  }

  localStorage.setItem(migrationKey, new Date().toISOString());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    setUser(currentUser);
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', currentUser.id)
      .single();

    if (error) throw error;
    setProfile(data);
    // Importing old local preferences is optional and must never invalidate
    // an otherwise healthy authentication session.
    try {
      await migrateLegacyMedia(currentUser.id);
    } catch {
      // Keep the migration pending so it can be retried on a future refresh.
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const supabase = createClient();

    refreshProfile()
      .catch(() => {
        if (mounted) {
          setProfile(null);
        }
      })
      .finally(() => mounted && setIsLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        return;
      }

      window.setTimeout(() => refreshProfile().catch(() => setProfile(null)), 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    isLoading,
    isConfigured: isSupabaseConfigured,
    refreshProfile,
    signOut: async () => {
      if (!isSupabaseConfigured) return;
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    }
  }), [isLoading, profile, refreshProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
