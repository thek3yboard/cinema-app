"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { fetchPage } from '@/app/[locale]/utils';
import PosterCard from '@/components/media/PosterCard';
import { createClient } from '@/lib/supabase/client';

export type CustomListMovie = {
  media_id: number;
  title: string | null;
  poster_path: string | null;
  added_at: string;
};

type DisplayMovie = CustomListMovie & {
  isLoading: boolean;
  releaseYear: string | null;
};

type Props = {
  initialItems: CustomListMovie[];
  listId: string;
  canEdit: boolean;
};

export default function MovieListItems({ initialItems, listId, canEdit }: Props) {
  const locale = useLocale();
  const t = useTranslations('CustomLists');
  const tSearch = useTranslations('GlobalSearch');
  const router = useRouter();
  const [items, setItems] = useState<DisplayMovie[]>(() => initialItems.map((item) => ({ ...item, title: null, releaseYear: null, isLoading: true })));
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let nextIndex = 0;
    const workerCount = Math.min(4, initialItems.length);

    setItems(initialItems.map((item) => ({ ...item, title: null, releaseYear: null, isLoading: true })));

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
              releaseYear: details?.release_date?.slice(0, 4) ?? null,
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
      {items.map((movie) => {
        const title = movie.isLoading ? t('loadingTitle') : movie.title ?? t('titleUnavailable');
        const metadata = movie.isLoading
          ? tSearch('movie')
          : `${tSearch('movie')} · ${movie.releaseYear ?? tSearch('unknownYear')}`;

        return (
          <li key={movie.media_id} className="min-w-0">
            <PosterCard
              title={title}
              imageSrc={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : '/fallback-portrait.svg'}
              metadata={metadata}
              onClick={() => router.push(`/${locale}/movies/${movie.media_id}`)}
              action={canEdit ? (
                <button
                  type="button"
                  disabled={removingId === movie.media_id}
                  onClick={() => removeMovie(movie)}
                  aria-label={t('removeMovie', { title: movie.title ?? t('titleUnavailable') })}
                  className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-2 text-red-300 transition hover:bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-nyanza disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : undefined}
            />
          </li>
        );
      })}
    </ul>
  );
}
