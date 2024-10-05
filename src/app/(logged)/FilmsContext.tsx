import { createContext } from "react";
import { SortType } from "@/types/types";

type FilmsContextType = {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    currentApiPages: number[];
    setCurrentApiPages: React.Dispatch<React.SetStateAction<number[]>>
    handleClickPrevPage: () => void
    handleClickNextPage: () => void
    sort: SortType
};

export const initialPage = 1, initialCurrentApiPages = [1,2];

export const initialSort = {
    key: "upcoming",
    label: "Upcoming"
};

export const FilmsContext = createContext<FilmsContextType>({
    page: initialPage,
    setPage: () => void {},
    currentApiPages: initialCurrentApiPages,
    setCurrentApiPages: () => void {},
    handleClickPrevPage: () => void {},
    handleClickNextPage: () => void {},
    sort: initialSort
});