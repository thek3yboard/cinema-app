"use client";

import { useState, useRef, createRef, ChangeEvent, ChangeEventHandler } from 'react';
import { FilmsContext, initialPage, initialCurrentApiPages, initialSort } from "@/app/(logged)/FilmsContext";
import { SortType, Movie } from '@/types/types';
import { orderOptions, sortByOptions } from '@/assets/filtersData';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import Image from "next/image";
import logo from '@/assets/cinema.png';

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [page, setPage] = useState(initialPage);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentApiPages, setCurrentApiPages] = useState(initialCurrentApiPages);
    const [sort, setSort] = useState<SortType>(initialSort);
    const [search, setSearch] = useState<string>('');
    const sortRef = useRef(sort.key);
    const orderRef = useRef(sort.order_key);
    const screenRef = createRef<HTMLDivElement>();
    const pathname = usePathname();
    const {isOpen, onOpen, onClose} = useDisclosure();

    const handleClickPrevPage = () => {
      if(currentApiPages[0] === 1) {
        return;
      }
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

    const handleChangeSort = (e: ChangeEvent<HTMLSelectElement>) => {
        sortRef.current = e.target.value;
    }

    const handleChangeOrder = (e: ChangeEvent<HTMLSelectElement>) => {
        orderRef.current = e.target.value;
    }

    const handleSetFilters = () => {
        const selectedOrder = orderOptions.find((option) => option.key === orderRef.current)!;
        const selectedSort = sortByOptions.find((option) => option.key === sortRef.current)!;
        setSort({ ...sort, key: selectedSort.key, label: selectedSort.label,
            order_key: selectedOrder.key, order_label: selectedOrder.label
        });
        setCurrentApiPages(initialCurrentApiPages);
        setPage(initialPage);
        onClose();
    }

    const handleOpen = () => {
        onOpen();
    }

    const handleKeydownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            handleClickSearch();
        } 
    }

    const handleChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }

    const handleClickSearch = async () => {
        try {
            let response = await fetch(`https://api.themoviedb.org/3/search/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                }
            });
            
            const data = await response.json();

            const movies = data.results;

            let filteredMovies = movies.filter((movie: Movie) => movie.vote_count > 1000);

            filteredMovies = filteredMovies.sort((a: any, b: any) => a.release_date.substring(0, 4) - b.release_date.substring(0, 4));
            
            setMovies(filteredMovies);
        } catch (error) {
            console.error(error)
        }
    }

    return (
      <FilmsContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage, sort, movies, setMovies }}>
        <>
        <div ref={screenRef} className="h-screen flex flex-col overflow-y-auto bg-gradient-to-r from-[#192a49] from-1% via-[#3f577c] via-50% to-[#192a49] to-99%">
          <div className="z-20 sticky top-0">
            <nav className="p-[6px] h-auto bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700">
              <Image className="ml-1" src={logo} alt="Logo" width={125} />
            </nav>
            { pathname === "/films" && 
                <div className='w-full flex items-start'>
                    <span className="flex items-center w-2/3 h-10 bg-blueish-gray">
                        <input type='text' onChange={(e) => handleChangeSearch(e)} onKeyDown={(e) => handleKeydownSearch(e)} className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray' />
                        <button onClick={handleClickSearch}>
                            <FontAwesomeIcon className='mx-2 max-h-6' icon={faSearch} size="xl" color="white" />
                        </button>
                    </span>
                    <Button className="w-1/3 bg-lapis-lazuli border-l-1 border-b-2 border-blueish-gray rounded-none" key="full" onClick={handleOpen}>
                        <FontAwesomeIcon className='max-h-6' icon={faSliders} size="xl" color="white" />
                    </Button>
                </div>
            }
          </div>
          { pathname === "/films" ?
            <>
              <div className="grow content-center my-4 2xl:overflow-hidden">
                {children}
              </div>
              <div className="h-6 flex justify-center">
                <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
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
        <Modal 
          size="full"
          isOpen={isOpen} 
          onClose={onClose}
          className="bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Filter</ModalHeader>
                <ModalBody>
                  <Select
                    key="sort"
                    color="default"
                    label="Sort by"
                    placeholder={sort.label}
                    className="sm:w-1/12"
                    onChange={handleChangeSort}
                  >
                    {sortByOptions.map((option) => (
                      <SelectItem key={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    key="order"
                    color="default"
                    label="Order by"
                    placeholder={sort.order_label}
                    className="sm:w-1/12"
                    onChange={handleChangeOrder}
                  >
                    {orderOptions.map((option) => (
                      <SelectItem key={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="success" onPress={handleSetFilters}>
                    Apply
                  </Button>
                  <Button color="danger" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        </>
      </FilmsContext.Provider>
    );
  }
  