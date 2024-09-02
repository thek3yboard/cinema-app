"use client";

import { useState, createRef } from 'react';
import { FilmsContext, initialPage, initialCurrentApiPages } from "@/app/(logged)/FilmsContext";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import logo from '@/assets/cinema.png';

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [page, setPage] = useState(initialPage);
    const [currentApiPages, setCurrentApiPages] = useState(initialCurrentApiPages);
    const screenRef = createRef<HTMLDivElement>();
    const pathname = usePathname();

    const handleClickPrevPage = () => {
      screenRef.current!.scroll({
        top: 0,
        behavior: "smooth"
      });
      if(screenRef.current!.scrollTop !== 0) {
        setTimeout(() => {
          setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
          setPage(p => p - 1);
        }, 1000);
      } else {
        setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
        setPage(p => p - 1);
      }
    }

    const handleClickNextPage = () => {
      screenRef.current!.scroll({
        top: 0,
        behavior: "smooth"
      });
      if(screenRef.current!.scrollTop !== 0) {
        setTimeout(() => {
          setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
          setPage(p => p + 1);
        }, 1000);
      } else {
        setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
        setPage(p => p + 1);
      }
    }

    return (
      <FilmsContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage }}>
        <div ref={screenRef} className="h-screen flex flex-col overflow-y-auto bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray">
          <nav className="z-20 sticky top-0 p-[6px] h-11 bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700">
            <Image className="ml-1" src={logo} alt="Logo" width={125} />
          </nav>
          { pathname === "/films" ?
            <>
              <div className="grow 2xl:overflow-hidden">
                {children}
              </div>
              <div>
                <div className="flex my-2 justify-center items-center">
                  <button disabled={currentApiPages[0] === 1} onClick={handleClickPrevPage} className="disabled:opacity-25 active:translate-y-[2px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-arrow-left" width="36" height="36" viewBox="0 0 24 24" strokeWidth="2" stroke="#e4fde1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18" />
                          <path d="M8 12l4 4" />
                          <path d="M8 12h8" />
                          <path d="M12 8l-4 4" />
                      </svg>
                  </button>
                  <p className="text-white mx-2">Page {page}</p>
                  <button onClick={handleClickNextPage} className="active:translate-y-[2px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-arrow-right" width="36" height="36" viewBox="0 0 24 24" strokeWidth="2" stroke="#e4fde1" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
            </>
          :
            <>
              <div className="grow">
                {children}
              </div>
              <div className="flex h-6 justify-center">
                <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
              </div> 
            </>
          }
        </div>
      </FilmsContext.Provider>
    );
  }
  