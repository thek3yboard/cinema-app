"use client";

import { useState } from 'react';
import { FilmsContext, initalPage, initalCurrentApiPages } from "@/app/(logged)/FilmsContext";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import logo from '@/assets/cinema.png';

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [page, setPage] = useState(initalPage);
    const [currentApiPages, setCurrentApiPages] = useState(initalCurrentApiPages);
    const pathname = usePathname();

    const handleClickPrevPage = () => {
      setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
      setPage(p => p - 1);
    }

    const handleClickNextPage = () => {
        setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
        setPage(p => p + 1);
    }

    return (
      <FilmsContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage }}>
        <div className="h-screen grid overflow-y-auto bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray">
          <nav className="z-10 sticky top-0 p-[6px] h-11 bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700">
            <Image className="ml-1" src={logo} alt="Logo" width={125} />
          </nav>
          <div className="h-full">
            {children}
          </div>
          { pathname === "/films" ?
            <div className="self-end">
              <div className="flex my-2 justify-center items-center">
                <button disabled={currentApiPages[0] === 1} onClick={handleClickPrevPage} className="disabled:opacity-25 active:translate-y-[2px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-arrow-left" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="#e4fde1" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18" />
                        <path d="M8 12l4 4" />
                        <path d="M8 12h8" />
                        <path d="M12 8l-4 4" />
                    </svg>
                </button>
                <p className="text-white mx-2">Page {page}</p>
                <button onClick={handleClickNextPage} className="active:translate-y-[2px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-arrow-right" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="#e4fde1" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" />
                        <path d="M16 12l-4 -4" />
                        <path d="M16 12h-8" />
                        <path d="M12 16l4 -4" />
                    </svg>
                </button>
              </div>
              <div className="h-6 flex justify-center">
                <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
              </div>
            </div>
          :
            <div className="grid self-end h-6 justify-center">
              <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
            </div> 
          }
        </div>
      </FilmsContext.Provider>
    );
  }
  