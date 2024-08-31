import { createContext } from "react";

type FilmsContextType = {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    currentApiPages: number[];
    setCurrentApiPages: React.Dispatch<React.SetStateAction<number[]>>
    handleClickPrevPage: () => void
    handleClickNextPage: () => void
};

export const initialPage = 1, initialCurrentApiPages = [1,2];

export const FilmsContext = createContext<FilmsContextType>({
    page: initialPage,
    setPage: () => void {},
    currentApiPages: initialCurrentApiPages,
    setCurrentApiPages: () => void {},
    handleClickPrevPage: () => void {},
    handleClickNextPage: () => void {}
});

