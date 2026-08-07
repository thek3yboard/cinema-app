"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { fetchPage } from '@/app/[locale]/utils';
import { createClient } from '@/lib/supabase/client';

export type CustomListMovie = {
  media_id: number;
  title: string | null;
  poster_path: string | null;
  added_at: string;
};

type DisplayMovie = CustomListMovie & {
  isLoading: boolean;
};

type Props = {
  initialItems: CustomListMovie[];
  listId: string;
  canEdit: boolean;
};

export default function MovieListItems({ initialItems, listId, canEdit }: Props) {
  const locale = useLocale();
  const t = useTranslations('CustomLists');
  const router = useRouter();
  const [items, setItems] = useState<DisplayMovie[]>(() => initialItems.map((item) => ({ ...item, title: null, isLoading: true })));
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let nextIndex = 0;
    const workerCount = Math.min(4, initialItems.length);

    setItems(initialItems.map((item) => ({ ...item, title: null, isLoading: true })));

    const localizeNext = async () => {
      while (active && nextIndex < initialItems.length) {
        const item = initialItems[nextIndex++];
        const details = await fetchPage(`https://api.themoviedb.org/3/movie/${item.media_id}?language=${locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
        if (!active) return;

        setItems((current) => current.map((currentItem) => currentItem.media_id === item.media_id
          ? {
              ...currentItem,
              title: details?.title ?? null,
              poster_path: details?.poster_path ?? currentItem.poster_path,
              isLoading: false
            }
          : currentItem
        ));
      }
    };

    Promise.all(Array.from({ length: workerCount }, () => localizeNext()));
    return () => { active = false; };
  }, [initialItems, locale]);

  const removeMovie = async (movie: DisplayMovie) => {
    setRemovingId(movie.media_id);
    const { error } = await createClient().from('custom_list_items')
      .delete()
      .eq('list_id', listId)
      .eq('media_id', movie.media_id);
    setRemovingId(null);

    if (error) return toast.error(t('removeMovieError'));
    setItems((current) => current.filter((item) => item.media_id !== movie.media_id));
    toast.success(t('movieRemoved'));
  };

  if (!items.length) return <p className="mt-6 text-slate-300">{t('emptyCustomList')}</p>;

  return (
    <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((movie) => (
        <li key={movie.media_id} className="relative min-w-0 overflow-hidden rounded-lg bg-slate-700 text-white">
          <button type="button" onClick={() => router.push(`/${locale}/movies/${movie.media_id}`)} className="block w-full text-left">
            <Image
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : '/fallback-portrait.svg'}
              alt={movie.title ?? t('posterAlt')}
              width={228}
              height={342}
              className="aspect-[2/3] w-full object-cover"
            />
            <span className="block truncate p-3 font-bold">
              {movie.isLoading ? t('loadingTitle') : movie.title ?? t('titleUnavailable')}
            </span>
          </button>
          {canEdit && (
            <button
              type="button"
              disabled={removingId === movie.media_id}
              onClick={() => removeMovie(movie)}
              aria-label={t('removeMovie', { title: movie.title ?? t('titleUnavailable') })}
              className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-2 text-red-300 hover:bg-slate-950 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
