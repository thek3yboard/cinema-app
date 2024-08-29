"use client";

import { useState, createContext } from 'react';
import Image from "next/image";
import logo from '@/assets/cinema.png';

export type FilmsContextType = {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  currentApiPages: number[];
  setCurrentApiPages: React.Dispatch<React.SetStateAction<number[]>>
};

const initalPage = 1, initalCurrentApiPages = [1,2];

export const FilmsContext = createContext<FilmsContextType>({
  page: initalPage,
  setPage: () => void {},
  currentApiPages: initalCurrentApiPages,
  setCurrentApiPages: () => void {}
});

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [page, setPage] = useState(initalPage);
    const [currentApiPages, setCurrentApiPages] = useState(initalCurrentApiPages);

    return (
      <FilmsContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages }}>
        <div className="h-screen grid-rows-3 overflow-y-auto">
          <nav className="z-10 sticky top-0 p-[6px] h-11 bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700">
            <Image className="ml-1" src={logo} alt="Logo" width={125} />
          </nav>
          <div className="min-h-[calc(100%-4.25rem)] bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray">
            {children}
          </div>
          <div className="h-6 flex justify-center items-end bg-blueish-gray">
            <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
          </div>
        </div>
      </FilmsContext.Provider>
    );
  }
  