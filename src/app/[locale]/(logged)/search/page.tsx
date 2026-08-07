"use client";

import { Suspense, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import PosterCard from '@/components/media/PosterCard';
import { searchAll } from '@/lib/tmdb/search';
import { searchProfiles } from '@/lib/supabase/search';
import {
  getSearchResultHref,
  getSearchResultImage,
  getSearchResultTitle,
  GlobalSearchResult
} from '@/types/search';

function SearchResults() {
  const locale = useLocale();
  const t = useTranslations('GlobalSearch');
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.trim() ?? '';
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setCurrentPage(1);
      setTotalPages(0);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);
    setCurrentPage(1);

    Promise.allSettled([
      searchAll(query, locale, 1, controller.signal),
      searchProfiles(query)
    ])
      .then(([mediaResult, profileResult]) => {
        if (controller.signal.aborted) return;
        if (mediaResult.status === 'rejected' && profileResult.status === 'rejected') throw mediaResult.reason;

        const media = mediaResult.status === 'fulfilled' ? mediaResult.value : null;
        const profiles = profileResult.status === 'fulfilled' ? profileResult.value : [];
        setResults([...profiles, ...(media?.results ?? [])]);
        setTotalPages(media?.total_pages ?? 0);
      })
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') {
          setResults([]);
          setHasError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [locale, query]);

  const loadMore = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    setIsLoadingMore(true);
    setHasError(false);
    try {
      const nextPage = currentPage + 1;
      const data = await searchAll(query, locale, nextPage);
      setResults((currentResults) => {
        const uniqueResults = new Map(
          [...currentResults, ...data.results].map((result) => [
            `${result.media_type}-${result.id}`,
            result
          ])
        );
        return Array.from(uniqueResults.values());
      });
      setCurrentPage(nextPage);
      setTotalPages(data.total_pages);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getTypeLabel = (result: GlobalSearchResult) => {
    if (result.media_type === 'movie') return t('movie');
    if (result.media_type === 'tv') return t('show');
    if (result.media_type === 'user') return t('user');
    return t('person');
  };

  const getMetadata = (result: GlobalSearchResult) => {
    if (result.media_type === 'user') return null;
    if (result.media_type === 'person') return result.known_for_department || t('person');
    const date = result.media_type === 'movie' ? result.release_date : result.first_air_date;
    return date?.slice(0, 4) || t('unknownYear');
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
      <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
      {query.length >= 2 ? (
        <p className="mt-2 text-slate-200">{t('resultsFor', { query })}</p>
      ) : (
        <p className="mt-2 text-slate-200">{t('emptyPrompt')}</p>
      )}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-nyanza/30 border-t-nyanza" aria-label={t('searching')} />
        </div>
      ) : hasError && !results.length ? (
        <p className="mt-10 rounded-lg bg-red-950/50 p-5 text-red-100">{t('loadError')}</p>
      ) : results.length ? (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((result) => {
              const title = getSearchResultTitle(result);
              const imagePath = getSearchResultImage(result);
              const metadata = getMetadata(result);

              return (
                <li className="min-w-0" key={`${result.media_type}-${result.id}`}>
                  <PosterCard
                    title={title}
                    imageSrc={imagePath ? (result.media_type === 'user' ? imagePath : `https://image.tmdb.org/t/p/w342${imagePath}`) : '/fallback-portrait.svg'}
                    metadata={`${getTypeLabel(result)}${metadata ? ` · ${metadata}` : ''}`}
                    onClick={() => router.push(getSearchResultHref(locale, result))}
                  />
                </li>
              );
            })}
          </ul>

          {currentPage < totalPages && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={loadMore}
                className="rounded-md bg-lapis-lazuli px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {isLoadingMore ? t('loadingMore') : t('loadMore')}
              </button>
            </div>
          )}

          {hasError && <p className="mt-5 text-center text-red-200">{t('loadMoreError')}</p>}
        </>
      ) : query.length >= 2 ? (
        <p className="mt-10 rounded-lg bg-slate-800/70 p-5 text-slate-200">{t('noResults')}</p>
      ) : null}
    </main>
  );
}

export default function SearchPage() {
  const t = useTranslations('GlobalSearch');

  return (
    <Suspense fallback={<div className="p-10 text-center text-white">{t('searching')}</div>}>
      <SearchResults />
    </Suspense>
  );
}
