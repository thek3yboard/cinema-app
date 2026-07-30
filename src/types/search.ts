export type SearchMediaType = 'movie' | 'tv' | 'person';

export type GlobalSearchResult = {
  id: number;
  media_type: SearchMediaType;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  known_for_department?: string;
  overview?: string;
  popularity?: number;
};

export type GlobalSearchResponse = {
  page: number;
  results: GlobalSearchResult[];
  total_pages: number;
  total_results: number;
};

export const getSearchResultTitle = (result: GlobalSearchResult) =>
  result.media_type === 'movie' ? result.title ?? '' : result.name ?? '';

export const getSearchResultImage = (result: GlobalSearchResult) =>
  result.media_type === 'person' ? result.profile_path : result.poster_path;

export const getSearchResultHref = (locale: string, result: GlobalSearchResult) => {
  const segment = result.media_type === 'movie'
    ? 'movies'
    : result.media_type === 'tv'
      ? 'shows'
      : 'people';

  return `/${locale}/${segment}/${result.id}`;
};
