import { GlobalSearchResponse, GlobalSearchResult } from '@/types/search';

const supportedMediaTypes = new Set(['movie', 'tv', 'person']);

export async function searchAll(
  query: string,
  locale: string,
  page = 1,
  signal?: AbortSignal
): Promise<GlobalSearchResponse> {
  const params = new URLSearchParams({
    query: query.trim(),
    language: locale,
    page: String(page),
    include_adult: 'false'
  });

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (apiKey) params.set('api_key', apiKey);

  const bearerToken = process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN;
  const response = await fetch(`https://api.themoviedb.org/3/search/multi?${params.toString()}`, {
    method: 'GET',
    headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
    signal
  });

  if (!response.ok) throw new Error(`TMDB global search failed with status ${response.status}`);

  const data = await response.json() as GlobalSearchResponse;
  return {
    ...data,
    results: (data.results ?? []).filter(
      (result): result is GlobalSearchResult => supportedMediaTypes.has(result.media_type)
    )
  };
}
