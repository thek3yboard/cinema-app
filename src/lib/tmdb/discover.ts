import { CatalogType, getOrderOptions, getSortByOptions } from '@/assets/filtersData';
import { SortType } from '@/types/types';

type DiscoverUrlOptions = {
    type: CatalogType;
    language: string;
    page: number;
    sort: SortType;
    today?: Date;
};

const POPULARITY_MIN_VOTES = '25';
const ON_AIR_MIN_VOTES = '5';
const TOP_RATED_MIN_VOTES = '200';

const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const buildDiscoverUrl = ({
    type,
    language,
    page,
    sort,
    today = new Date(),
}: DiscoverUrlOptions) => {
    const mediaType = type === 'shows' ? 'tv' : 'movie';
    const params = new URLSearchParams({
        include_adult: 'false',
        language,
        page: String(page),
    });

    if (type === 'shows') {
        params.set('include_null_first_air_dates', 'false');
    } else {
        params.set('include_video', 'false');
    }

    const selectedSort = getSortByOptions(type).find((option) => option.key === sort.key)
        ?? getSortByOptions(type)[0];
    const sortKey = selectedSort.key;
    const allowedOrders = getOrderOptions(type, sortKey);
    const orderKey = allowedOrders.some((option) => option.key === sort.order_key)
        ? sort.order_key
        : allowedOrders[0].key;

    if (sortKey === 'now_playing') {
        const nowPlayingParams = new URLSearchParams({
            language,
            page: String(page),
        });
        const region = language.split('-')[1]?.toUpperCase();
        if (region) nowPlayingParams.set('region', region);

        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        if (apiKey) nowPlayingParams.set('api_key', apiKey);

        return `https://api.themoviedb.org/3/movie/now_playing?${nowPlayingParams.toString()}`;
    }

    if (sortKey === 'on_the_air') {
        const endDate = new Date(today);
        const startDate = new Date(today);

        endDate.setDate(endDate.getDate() + 7);
        params.set('air_date.gte', formatLocalDate(startDate));
        params.set('air_date.lte', formatLocalDate(endDate));
        params.set('vote_count.gte', ON_AIR_MIN_VOTES);

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone) params.set('timezone', timezone);

        params.set('sort_by', `popularity.${orderKey}`);
    } else {
        params.set('sort_by', `${sortKey}.${orderKey}`);

        if (sortKey === 'popularity') {
            // Avoid transient TMDB popularity spikes from titles with no audience signal.
            params.set('vote_count.gte', POPULARITY_MIN_VOTES);
        } else if (sortKey === 'vote_average') {
            params.set('vote_count.gte', TOP_RATED_MIN_VOTES);

            if (type === 'movies') {
                params.set('without_genres', '99,10755');
            }
        }
    }

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (apiKey) params.set('api_key', apiKey);

    return `https://api.themoviedb.org/3/discover/${mediaType}?${params.toString()}`;
};
