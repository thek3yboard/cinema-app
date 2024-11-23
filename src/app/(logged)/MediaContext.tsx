import { createContext } from "react";
import { SortType, Movie, Show } from "@/types/types";
import { sortByOptions, orderOptions } from "@/assets/filtersData";

type MediaContextType = {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    currentApiPages: number[];
    setCurrentApiPages: React.Dispatch<React.SetStateAction<number[]>>
    handleClickPrevPage: () => void
    handleClickNextPage: () => void
    sort: SortType,
    movies: Movie[],
    setMovies: React.Dispatch<React.SetStateAction<Movie[]>>,
    shows: Show[],
    setShows: React.Dispatch<React.SetStateAction<Show[]>>,
};

export const initialPage = 1, initialCurrentApiPages = [1,2];

export const initialSort = {
    key: sortByOptions[1].key,
    label: sortByOptions[1].label,
    order_key: orderOptions[0].key,
    order_label: orderOptions[0].label
};

export const MediaContext = createContext<MediaContextType>({
    page: initialPage,
    setPage: () => void {},
    currentApiPages: initialCurrentApiPages,
    setCurrentApiPages: () => void {},
    handleClickPrevPage: () => void {},
    handleClickNextPage: () => void {},
    sort: initialSort,
    movies: [],
    setMovies: () => void {},
    shows: [],
    setShows: () => void {}
});