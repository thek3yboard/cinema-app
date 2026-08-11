"use client";

import { DragEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CircleCheck, GripVertical, Info, Trash2 } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { fetchPage } from '@/app/[locale]/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import PosterCard from '@/components/media/PosterCard';
import { createClient } from '@/lib/supabase/client';

export type CustomListMovie = {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string | null;
  poster_path: string | null;
  added_at: string;
  position: number;
  release_year: number | null;
  popularity: number | null;
  vote_average: number | null;
};

type DisplayItem = CustomListMovie & {
  isLoading: boolean;
  isWatched: boolean;
};

type SortOption = 'custom' | 'popularity' | 'rating' | 'year_desc' | 'year_asc';
type PopularityFilter = 'all' | 'top50' | 'top25';

type Props = {
  initialItems: CustomListMovie[];
  listId: string;
  canEdit: boolean;
};

const getItemKey = (item: Pick<CustomListMovie, 'media_id' | 'media_type'>) => `${item.media_type}:${item.media_id}`;

export default function MovieListItems({ initialItems, listId, canEdit }: Props) {
  const locale = useLocale();
  const t = useTranslations('CustomLists');
  const tSearch = useTranslations('GlobalSearch');
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<DisplayItem[]>(() => initialItems.map((item) => ({ ...item, isLoading: true, isWatched: false })));
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [yearFilter, setYearFilter] = useState('all');
  const [minimumRating, setMinimumRating] = useState(0);
  const [popularityFilter, setPopularityFilter] = useState<PopularityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('custom');

  useEffect(() => {
    let active = true;
    let nextIndex = 0;
    const workerCount = Math.min(4, initialItems.length);

    setItems(initialItems.map((item) => ({ ...item, isLoading: true, isWatched: false })));

    const localizeNext = async () => {
      while (active && nextIndex < initialItems.length) {
        const item = initialItems[nextIndex++];
        const details = await fetchPage(`https://api.themoviedb.org/3/${item.media_type}/${item.media_id}?language=${locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
        if (!active) return;

        setItems((current) => current.map((currentItem) => getItemKey(currentItem) === getItemKey(item)
          ? {
              ...currentItem,
              title: item.media_type === 'movie' ? details?.title ?? currentItem.title : details?.name ?? currentItem.title,
              poster_path: details?.poster_path ?? currentItem.poster_path,
              release_year: Number((item.media_type === 'movie' ? details?.release_date : details?.first_air_date)?.slice(0, 4)) || currentItem.release_year,
              popularity: Number(details?.popularity ?? currentItem.popularity),
              vote_average: Number(details?.vote_average ?? currentItem.vote_average),
              isLoading: false
            }
          : currentItem
        ));
      }
    };

    void Promise.all(Array.from({ length: workerCount }, () => localizeNext()));
    return () => { active = false; };
  }, [initialItems, locale]);

  useEffect(() => {
    if (!user || !initialItems.length) return;
    let active = true;
    const mediaIds = Array.from(new Set(initialItems.map((item) => item.media_id)));

    const loadWatchedItems = async () => {
      const { data, error } = await createClient().from('user_media')
        .select('media_type, media_id')
        .eq('user_id', user.id)
        .eq('is_watched', true)
        .in('media_id', mediaIds);

      if (!active || error) return;
      const watchedKeys = new Set((data ?? []).map((item: { media_type: string; media_id: number }) => `${item.media_type}:${item.media_id}`));
      setItems((current) => current.map((item) => ({ ...item, isWatched: watchedKeys.has(getItemKey(item)) })));
    };

    void loadWatchedItems();

    return () => { active = false; };
  }, [initialItems, user]);

  const availableYears = useMemo(() => Array.from(new Set(items
    .map((item) => item.release_year)
    .filter((year): year is number => year !== null)))
    .sort((first, second) => second - first), [items]);

  const popularItemKeys = useMemo(() => {
    if (popularityFilter === 'all') return null;
    const fraction = popularityFilter === 'top25' ? 0.25 : 0.5;
    const rankedItems = [...items].sort((first, second) => (second.popularity ?? -1) - (first.popularity ?? -1));
    return new Set(rankedItems.slice(0, Math.max(1, Math.ceil(rankedItems.length * fraction))).map(getItemKey));
  }, [items, popularityFilter]);

  const visibleItems = useMemo(() => {
    const filteredItems = items.filter((item) => {
      const matchesYear = yearFilter === 'all' || item.release_year === Number(yearFilter);
      const matchesRating = minimumRating === 0 || (item.vote_average ?? 0) >= minimumRating;
      const matchesPopularity = popularItemKeys === null || popularItemKeys.has(getItemKey(item));
      return matchesYear && matchesRating && matchesPopularity;
    });

    if (sortBy === 'custom') return filteredItems;
    return [...filteredItems].sort((first, second) => {
      if (sortBy === 'popularity') return (second.popularity ?? -1) - (first.popularity ?? -1);
      if (sortBy === 'rating') return (second.vote_average ?? -1) - (first.vote_average ?? -1);
      if (sortBy === 'year_asc') return (first.release_year ?? Number.MAX_SAFE_INTEGER) - (second.release_year ?? Number.MAX_SAFE_INTEGER);
      return (second.release_year ?? -1) - (first.release_year ?? -1);
    });
  }, [items, minimumRating, popularItemKeys, sortBy, yearFilter]);

  const averageRating = useMemo(() => {
    const ratedItems = items.filter((item) => item.vote_average !== null);
    if (!ratedItems.length) return null;
    return ratedItems.reduce((total, item) => total + Number(item.vote_average), 0) / ratedItems.length;
  }, [items]);

  const watchedCount = items.filter((item) => item.isWatched).length;
  const canReorder = canEdit && sortBy === 'custom' && yearFilter === 'all' && minimumRating === 0 && popularityFilter === 'all';

  const persistOrder = async (nextItems: DisplayItem[], previousItems: DisplayItem[]) => {
    setIsReordering(true);
    const { error } = await createClient().rpc('reorder_custom_list_items', {
      target_list_id: listId,
      ordered_items: nextItems.map((item, position) => ({
        media_type: item.media_type,
        media_id: item.media_id,
        position
      }))
    });
    setIsReordering(false);

    if (error) {
      setItems(previousItems);
      toast.error(t('reorderError'));
    }
  };

  const reorder = (sourceKey: string, targetKey: string) => {
    if (!canReorder || sourceKey === targetKey || isReordering) return;
    const sourceIndex = items.findIndex((item) => getItemKey(item) === sourceKey);
    const targetIndex = items.findIndex((item) => getItemKey(item) === targetKey);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const previousItems = items;
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, movedItem);
    const normalizedItems = nextItems.map((item, position) => ({ ...item, position }));
    setItems(normalizedItems);
    void persistOrder(normalizedItems, previousItems);
  };

  const moveByOne = (itemKey: string, direction: -1 | 1) => {
    const currentIndex = items.findIndex((item) => getItemKey(item) === itemKey);
    const target = items[currentIndex + direction];
    if (target) reorder(itemKey, getItemKey(target));
  };

  const removeItem = async (item: DisplayItem) => {
    const itemKey = getItemKey(item);
    setRemovingKey(itemKey);
    const { error } = await createClient().from('custom_list_items')
      .delete()
      .eq('list_id', listId)
      .eq('media_type', item.media_type)
      .eq('media_id', item.media_id);
    setRemovingKey(null);

    if (error) return toast.error(t('removeMovieError'));
    setItems((current) => current.filter((currentItem) => getItemKey(currentItem) !== itemKey));
    toast.success(t('movieRemoved'));
  };

  const startDragging = (event: DragEvent<HTMLLIElement>, itemKey: string) => {
    if ((event.target as HTMLElement).closest('[data-no-drag="true"]')) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', itemKey);
    setDraggedKey(itemKey);
  };

  if (!items.length) return <p className="mt-6 text-slate-300">{t('emptyCustomList')}</p>;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-700 px-3 py-1.5 text-sm text-slate-100">{t('watchedProgress', { watched: watchedCount, total: items.length })}</span>
        {averageRating !== null && <span className="rounded-full bg-slate-700 px-3 py-1.5 text-sm text-slate-100">{t('averageRating', { rating: averageRating.toFixed(1) })}</span>}
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-600 bg-slate-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-slate-200">
          {t('yearFilter')}
          <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-500 bg-slate-800 px-3 text-white">
            <option value="all">{t('allYears')}</option>
            {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('minimumRating')}
          <select value={minimumRating} onChange={(event) => setMinimumRating(Number(event.target.value))} className="mt-1 h-10 w-full rounded-md border border-slate-500 bg-slate-800 px-3 text-white">
            <option value={0}>{t('anyRating')}</option>
            {[5, 6, 7, 8, 9].map((rating) => <option key={rating} value={rating}>{t('ratingOrMore', { rating })}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-200">
          <span className="flex items-center gap-1.5">
            {t('popularityFilter')}
            <Tooltip content={t('popularityHelp')} className="max-w-64 bg-slate-950 text-slate-100">
              <button type="button" aria-label={t('popularityHelp')} className="rounded-full text-slate-400 hover:text-white"><Info className="h-3.5 w-3.5" /></button>
            </Tooltip>
          </span>
          <select value={popularityFilter} onChange={(event) => setPopularityFilter(event.target.value as PopularityFilter)} className="mt-1 h-10 w-full rounded-md border border-slate-500 bg-slate-800 px-3 text-white">
            <option value="all">{t('allPopularity')}</option>
            <option value="top50">{t('topHalfPopular')}</option>
            <option value="top25">{t('topQuarterPopular')}</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('sortBy')}
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="mt-1 h-10 w-full rounded-md border border-slate-500 bg-slate-800 px-3 text-white">
            <option value="custom">{t('customOrder')}</option>
            <option value="popularity">{t('mostPopular')}</option>
            <option value="rating">{t('bestRated')}</option>
            <option value="year_desc">{t('newestFirst')}</option>
            <option value="year_asc">{t('oldestFirst')}</option>
          </select>
        </label>
      </div>

      {canEdit && !canReorder && <p className="mt-3 text-xs text-slate-400">{t('reorderUnavailable')}</p>}
      {!visibleItems.length ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-600 p-6 text-center text-slate-300">{t('noFilterResults')}</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleItems.map((item) => {
            const itemKey = getItemKey(item);
            const title = item.isLoading ? t('loadingTitle') : item.title ?? t('titleUnavailable');
            const metadataParts = [
              item.media_type === 'movie' ? tSearch('movie') : tSearch('show'),
              item.release_year ?? tSearch('unknownYear'),
              item.vote_average !== null ? `★ ${item.vote_average.toFixed(1)}` : null
            ].filter(Boolean);

            return (
              <li
                key={itemKey}
                draggable={canReorder && !isReordering}
                onDragStart={(event) => startDragging(event, itemKey)}
                onDragEnd={() => { setDraggedKey(null); setDropTargetKey(null); }}
                onDragOver={(event) => { if (canReorder) { event.preventDefault(); setDropTargetKey(itemKey); } }}
                onDragLeave={() => setDropTargetKey((current) => current === itemKey ? null : current)}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceKey = draggedKey ?? event.dataTransfer.getData('text/plain');
                  setDraggedKey(null);
                  setDropTargetKey(null);
                  if (sourceKey) reorder(sourceKey, itemKey);
                }}
                className={`min-w-0 rounded-xl transition ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''} ${dropTargetKey === itemKey && draggedKey !== itemKey ? 'ring-2 ring-nyanza ring-offset-2 ring-offset-slate-800' : ''} ${draggedKey === itemKey ? 'opacity-50' : ''}`}
              >
                <PosterCard
                  title={title}
                  imageSrc={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '/fallback-portrait.svg'}
                  metadata={metadataParts.join(' · ')}
                  onClick={() => router.push(`/${locale}/${item.media_type === 'movie' ? 'movies' : 'shows'}/${item.media_id}`)}
                  action={(
                    <>
                      {item.isWatched && (
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white shadow-lg" title={t('watched')}>
                          <CircleCheck className="h-3.5 w-3.5" />
                          {t('watched')}
                        </span>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          data-no-drag="true"
                          disabled={removingKey === itemKey}
                          onClick={() => removeItem(item)}
                          aria-label={t('removeMovie', { title: item.title ?? t('titleUnavailable') })}
                          className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-2 text-red-300 transition hover:bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-nyanza disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                  footer={canReorder ? (
                    <div className="flex h-9 items-center justify-center gap-1 rounded-lg border border-white/5 bg-slate-900/55 text-slate-300">
                      <button data-no-drag="true" type="button" disabled={items[0] === item || isReordering} onClick={() => moveByOne(itemKey, -1)} aria-label={t('moveEarlier', { title })} className="rounded p-1.5 hover:bg-slate-700 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button>
                      <span title={t('dragItem', { title })} className="flex items-center gap-1 px-2 text-xs text-slate-400"><GripVertical className="h-5 w-5" />{t('drag')}</span>
                      <button data-no-drag="true" type="button" disabled={items[items.length - 1] === item || isReordering} onClick={() => moveByOne(itemKey, 1)} aria-label={t('moveLater', { title })} className="rounded p-1.5 hover:bg-slate-700 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button>
                    </div>
                  ) : undefined}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
