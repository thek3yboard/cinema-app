"use client";

import { useState, useRef, createRef, ChangeEvent, ChangeEventHandler } from 'react';
import { FilmsContext, initialPage, initialCurrentApiPages, initialSort } from "@/app/(logged)/FilmsContext";
import { SortType, Movie } from '@/types/types';
import { orderOptions, sortByOptions } from '@/assets/filtersData';
import { usePathname } from 'next/navigation';
import { Search, Sliders, AlignJustify } from 'lucide-react'
import { Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, 
    Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarContent, NavbarItem, Link, useDisclosure } from "@nextui-org/react";
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

    const navbarItems = [
        "Films",
        "Shows",
    ];

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
            let URL = '';

            switch(pathname) {
                case '/films':
                    URL = `https://api.themoviedb.org/3/search/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                case '/shows':
                    URL = `https://api.themoviedb.org/3/search/tv?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                default:
                    break;
            }

            let response = await fetch(URL, {
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
                    <Navbar className="h-auto bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700">
                        <NavbarContent className="md:hidden" justify="start">
                            <NavbarBrand>
                                <Image className='min-w-32 mb-2' src={logo} alt="Logo" width={128} />
                            </NavbarBrand>
                        </NavbarContent>

                        <NavbarContent className="md:hidden" justify="end">
                            <NavbarMenuToggle icon={<AlignJustify />} />
                        </NavbarContent>

                        <NavbarContent className="hidden md:flex gap-6" justify="center">
                            <NavbarBrand>
                                <Image className='min-w-36 mb-2' src={logo} alt="Logo" width={144} />
                            </NavbarBrand>
                            {navbarItems.map((item, index) => (
                                <NavbarItem key={`${item}-${index}`}>
                                    <Link
                                        className={`/${item.toLowerCase()}` === pathname ? "text-orange-400 text-xl font-semibold" : "text-nyanza text-xl font-semibold"}
                                        href={`/${item.toLowerCase()}`}
                                    >
                                        {item}
                                    </Link>
                                </NavbarItem>
                            ))}
                        </NavbarContent>

                        <NavbarMenu className='p-5'>
                            {navbarItems.map((item, index) => (
                                <NavbarMenuItem key={`${item}-${index}`}>
                                    <Link
                                        className={`/${item.toLowerCase()}` === pathname ? "text-orange-400 w-full font-semibold" : "text-nyanza w-full font-semibold"}
                                        href={`/${item.toLowerCase()}`}
                                        size="lg"
                                    >
                                        {item}
                                    </Link>
                                </NavbarMenuItem>
                                
                            ))}
                        </NavbarMenu>
                        <span className="max-md:hidden flex items-center w-2/3 h-10 bg-blueish-gray rounded-[3px]">
                            <input type='text' onChange={(e) => handleChangeSearch(e)} onKeyDown={(e) => handleKeydownSearch(e)} className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray' />
                            <button onClick={handleClickSearch}>
                                <Search className='mx-2 max-h-6' />
                            </button>
                            
                        </span>
                        <button className='max-md:hidden' key="full" onClick={handleOpen}>
                            <Sliders className='max-h-6' />
                        </button>
                    </Navbar>
                { (pathname === "/films" || pathname === "/shows") && 
                    <div className='md:hidden w-full flex items-start'>
                        <span className="flex items-center w-2/3 h-10 bg-blueish-gray">
                            <input type='text' onChange={(e) => handleChangeSearch(e)} onKeyDown={(e) => handleKeydownSearch(e)} className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray' />
                            <button onClick={handleClickSearch}>
                                <Search className='mx-2 max-h-6' />
                            </button>
                        </span>
                        <Button className="w-1/3 bg-lapis-lazuli border-l-1 border-b-2 border-blueish-gray rounded-none" key="full" onClick={handleOpen}>
                            <Sliders className='max-h-6' />
                        </Button>
                    </div>
                }
            </div>
            { (pathname === "/films" || pathname === "/shows") ?
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