import { createContext } from "react";

type FilmsContextType = {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    currentApiPages: number[];
    setCurrentApiPages: React.Dispatch<React.SetStateAction<number[]>>
};

export const initalPage = 1, initalCurrentApiPages = [1,2];

export const FilmsContext = createContext<FilmsContextType>({
    page: initalPage,
    setPage: () => void {},
    currentApiPages: initalCurrentApiPages,
    setCurrentApiPages: () => void {}
});

