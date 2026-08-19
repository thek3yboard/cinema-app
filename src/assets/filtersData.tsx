export type CatalogType = 'movies' | 'shows';
export type OrderKey = 'desc' | 'asc';

export type SortOption = {
    key: string;
    label: string;
    allowedOrders: OrderKey[];
};

const commonSortByOptions: SortOption[] = [
    {
        key: 'popularity', label: 'popularity', allowedOrders: ['desc', 'asc']
    },
    {
        key: 'vote_average', label: 'rating', allowedOrders: ['desc', 'asc']
    },
];

export const sortByOptions: SortOption[] = [
    ...commonSortByOptions,
    { key: 'now_playing', label: 'nowPlaying', allowedOrders: ['desc'] },
    { key: 'revenue', label: 'revenue', allowedOrders: ['desc'] },
];

const showSortByOptions: SortOption[] = [
    ...commonSortByOptions,
    { key: 'on_the_air', label: 'onTheAir', allowedOrders: ['desc'] },
];

export const getSortByOptions = (type: CatalogType) =>
    type === 'shows' ? showSortByOptions : sortByOptions;

export const orderOptions: { key: OrderKey; label: string }[] = [
    {
        key: 'desc', label: 'descending'
    },
    {
        key: 'asc', label: 'ascending'
    }
];

export const getOrderOptions = (type: CatalogType, sortKey: string) => {
    const sortOption = getSortByOptions(type).find((option) => option.key === sortKey)
        ?? getSortByOptions(type)[0];

    return orderOptions.filter((option) => sortOption.allowedOrders.includes(option.key));
};
