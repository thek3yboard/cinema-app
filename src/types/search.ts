export type SearchMediaType = 'movie' | 'tv' | 'person' | 'user';

export type GlobalSearchResult = {
  id: number | string;
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
  username?: string;
  avatar_url?: string | null;
};

export type GlobalSearchResponse = {
  page: number;
  results: GlobalSearchResult[];
  total_pages: number;
  total_results: number;
};

export const getSearchResultTitle = (result: GlobalSearchResult) =>
  result.media_type === 'movie'
    ? result.title ?? ''
    : result.media_type === 'user'
      ? result.username ? `@${result.username}` : ''
      : result.name ?? '';

export const getSearchResultImage = (result: GlobalSearchResult) =>
  result.media_type === 'user'
    ? result.avatar_url
    : result.media_type === 'person'
      ? result.profile_path
      : result.poster_path;

export const getSearchResultHref = (locale: string, result: GlobalSearchResult) => {
  if (result.media_type === 'user') {
    return `/${locale}/users/${encodeURIComponent(result.username ?? '')}`;
  }

  const segment = result.media_type === 'movie'
    ? 'movies'
    : result.media_type === 'tv'
      ? 'shows'
      : 'people';

  return `/${locale}/${segment}/${result.id}`;
};
