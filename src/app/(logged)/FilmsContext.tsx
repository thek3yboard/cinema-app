import { createContext } from "react";

type FilmsContextType = {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    currentApiPages: number[];
    setCurrentApiPages: React.Dispatch<React.SetStateAction<number[]>>
    handleClickPrevPage: () => void
    handleClickNextPage: () => void
};

export const initalPage = 1, initalCurrentApiPages = [1,2];

export const FilmsContext = createContext<FilmsContextType>({
    page: initalPage,
    setPage: () => void {},
    currentApiPages: initalCurrentApiPages,
    setCurrentApiPages: () => void {},
    handleClickPrevPage: () => void {},
    handleClickNextPage: () => void {}
});

