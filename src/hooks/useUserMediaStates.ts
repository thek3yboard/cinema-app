"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

export type MediaQuickActionItem = {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  popularity: number;
  voteAverage: number;
};

export type UserMediaState = {
  in_watchlist: boolean;
  is_watched: boolean;
  is_favorite: boolean;
  rating: number;
};

export type UserMediaToggleField = 'in_watchlist' | 'is_watched' | 'is_favorite';

type UserMediaRow = UserMediaState & {
  media_id: number;
  media_type: 'movie' | 'tv';
};

const emptyState: UserMediaState = {
  in_watchlist: false,
  is_watched: false,
  is_favorite: false,
  rating: 0
};

const getItemKey = (item: Pick<MediaQuickActionItem, 'mediaId' | 'mediaType'>) =>
  `${item.mediaType}:${item.mediaId}`;

export function useUserMediaStates(items: MediaQuickActionItem[]) {
  const t = useTranslations('MediaUI');
  const { user } = useAuth();
  const [states, setStates] = useState<Record<string, UserMediaState>>({});
  const statesRef = useRef<Record<string, UserMediaState>>({});
  const [pendingItemKeys, setPendingItemKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const itemSignature = items.map(getItemKey).join('|');
  const uniqueItems = useMemo(
    () => Array.from(new Map(items.map((item) => [getItemKey(item), item])).values()),
    // The key signature is stable even when a parent recreates equivalent item objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemSignature]
  );

  useEffect(() => {
    if (!user || !uniqueItems.length) {
      statesRef.current = {};
      setStates({});
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    const mediaIds = Array.from(new Set(uniqueItems.map((item) => item.mediaId)));

    const loadStates = async () => {
      const { data, error } = await createClient().from('user_media')
        .select('media_type, media_id, in_watchlist, is_watched, is_favorite, rating')
        .eq('user_id', user.id)
        .in('media_id', mediaIds);
      if (!active) return;

      const nextStates: Record<string, UserMediaState> = {};
      uniqueItems.forEach((item) => { nextStates[getItemKey(item)] = { ...emptyState }; });

      if (!error) {
        (data as UserMediaRow[] | null)?.forEach((row) => {
          const key = `${row.media_type}:${row.media_id}`;
          if (!(key in nextStates)) return;
          nextStates[key] = {
            in_watchlist: row.in_watchlist,
            is_watched: row.is_watched,
            is_favorite: row.is_favorite,
            rating: Number(row.rating ?? 0)
          };
        });
      }

      statesRef.current = nextStates;
      setStates(nextStates);
      setIsLoading(false);
    };

    void loadStates();

    return () => { active = false; };
  }, [uniqueItems, user]);

  const toggle = useCallback(async (item: MediaQuickActionItem, field: UserMediaToggleField) => {
    if (!user) return;
    const key = getItemKey(item);
    if (pendingItemKeys.has(key)) return;

    const previousState = statesRef.current[key] ?? emptyState;
    const nextState = { ...previousState, [field]: !previousState[field] };
    const optimisticStates = { ...statesRef.current, [key]: nextState };
    statesRef.current = optimisticStates;
    setStates(optimisticStates);
    setPendingItemKeys((current) => new Set(current).add(key));

    const { error } = await createClient().from('user_media').upsert({
      user_id: user.id,
      media_type: item.mediaType,
      media_id: item.mediaId,
      ...nextState,
      title: item.title,
      poster_path: item.posterPath
    }, { onConflict: 'user_id,media_type,media_id' });

    setPendingItemKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });

    if (!error) return;
    const revertedStates = { ...statesRef.current, [key]: previousState };
    statesRef.current = revertedStates;
    setStates(revertedStates);
    toast.error(t('saveError'));
  }, [pendingItemKeys, t, user]);

  return {
    user,
    isLoading,
    getState: (item: MediaQuickActionItem) => states[getItemKey(item)] ?? emptyState,
    isPending: (item: MediaQuickActionItem) => pendingItemKeys.has(getItemKey(item)),
    toggle
  };
}
