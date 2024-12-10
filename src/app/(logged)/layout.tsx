"use client";

import { useState, useRef, createRef, ChangeEvent, ChangeEventHandler } from 'react';
import { MediaContext, initialPage, initialCurrentApiPages, initialSort } from "@/app/(logged)/MediaContext";
import { SortType, Movie, Show } from '@/types/types';
import { orderOptions, sortByOptions } from '@/assets/filtersData';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sliders, AlignJustify, ChevronDown, ChevronUp } from 'lucide-react'
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
    const [shows, setShows] = useState<Movie[]>([]);
    const [currentApiPages, setCurrentApiPages] = useState(initialCurrentApiPages);
    const [sort, setSort] = useState<SortType>(initialSort);
    const [search, setSearch] = useState<string>('');
    const sortRef = useRef(sort.key);
    const orderRef = useRef(sort.order_key);
    const screenRef = createRef<HTMLDivElement>();
    const router = useRouter();
    const pathname = usePathname();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isParametersMenuOpen, setIsParametersMenuOpen] = useState<boolean>(false);
    const [isPagesMenuOpen, setIsPagesMenuOpen] = useState<boolean>(false);

    const navbarItems = [
        "Movies",
        "Shows",
    ];

    const handleMenuToggle = (open: boolean) => {
        setIsMenuOpen(open);
    }

    const handleParametersMenuToggle = (open: boolean) => {
        setIsParametersMenuOpen(open);
    };

    const handlePagesMenuToggle = (open: boolean) => {
        setIsPagesMenuOpen(open);
    };

    const handleClickPrevPage = () => {
        setMovies([]);
        setShows([]);
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
        setMovies([]);
        setShows([]);
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
        setIsMenuOpen(false);
        handleParametersMenuToggle(false);

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
            setIsMenuOpen(false);
            handleParametersMenuToggle(false);

            let URL = '';

            switch(pathname) {
                case '/movies':
                    URL = `https://api.themoviedb.org/3/search/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                case '/shows':
                    URL = `https://api.themoviedb.org/3/search/tv?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                default:
                    if(pathname.includes('/movies')) {
                        URL = `https://api.themoviedb.org/3/search/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        break;
                    } else {
                        URL = `https://api.themoviedb.org/3/search/tv?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        break;
                    }
            }

            let response = await fetch(URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                }
            });
            
            const data = await response.json();

            if(pathname.includes('/movies')) {
                const movies = data.results;

                let filteredMovies = movies.filter((movie: Movie) => movie.vote_count > 1000);

                filteredMovies = filteredMovies.sort((a: any, b: any) => a.release_date.substring(0, 4) - b.release_date.substring(0, 4));
                
                setMovies(filteredMovies);

                router.push('/movies');
            } else {
                const shows = data.results;

                let filteredShows = shows.filter((show: Show) => show.vote_count > 1000);

                filteredShows = filteredShows.sort((a: any, b: any) => a.first_air_date.substring(0, 4) - b.first_air_date.substring(0, 4));
                
                setShows(filteredShows);

                router.push('/shows');
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <MediaContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage, sort, movies, setMovies, shows, setShows }}>
        <>
            <div ref={screenRef} className="h-screen flex flex-col overflow-y-auto bg-gradient-to-r from-[#192a49] from-1% via-[#3f577c] via-50% to-[#192a49] to-99%">
                <div className="z-20 sticky top-0 border-b-2 border-slate-700">
                    <Navbar disableAnimation={true} isMenuOpen={isMenuOpen} onMenuOpenChange={handleMenuToggle} className="h-auto bg-gradient-to-r from-aero-blue to-blueish-gray">
                        <NavbarContent className="md:hidden" justify="start">
                            <NavbarBrand>
                                <Image className='min-w-32 mb-2' src={logo} alt="Logo" width={128} />
                            </NavbarBrand>
                        </NavbarContent>
                        <NavbarContent className="md:hidden" justify="end">
                            <NavbarMenuToggle 
                                isDisabled={isPagesMenuOpen}
                                isSelected={isParametersMenuOpen}
                                onChange={handleParametersMenuToggle}
                                icon={isParametersMenuOpen ? 
                                    <button style={{ color: '#192a49' }} className='p-2 rounded-md bg-slate-200'><ChevronUp /></button> 
                                    : 
                                    <ChevronDown />
                                }
                            />
                            <NavbarMenuToggle 
                                isDisabled={isParametersMenuOpen}
                                isSelected={isPagesMenuOpen}
                                onChange={handlePagesMenuToggle}
                                icon={isPagesMenuOpen ? 
                                    <button style={{ color: '#192a49' }} className='p-2 rounded-md bg-slate-200'><AlignJustify /></button> 
                                    : 
                                    <AlignJustify />
                                }
                            />
                        </NavbarContent>
                        <NavbarContent className="hidden md:flex gap-6" justify="center">
                            <NavbarBrand>
                                <Image className='min-w-36 mb-2' src={logo} alt="Logo" width={144} />
                            </NavbarBrand>
                            {navbarItems.map((item, index) => (
                                <NavbarItem key={`${item}-${index}`}>
                                    {pathname.includes(item.toLowerCase()) ?
                                        <Link
                                            className="text-orange-400 text-xl font-semibold"
                                            href={`/${item.toLowerCase()}`}
                                        >
                                            {item}
                                        </Link>
                                        :
                                        <Link
                                            className="text-nyanza text-xl font-semibold"
                                            href={`/${item.toLowerCase()}`}
                                        >
                                            {item}
                                        </Link>
                                    }
                                </NavbarItem>
                            ))}
                        </NavbarContent>
                        <NavbarMenu className='max-h-fit mt-[2px] p-5'>
                            { isPagesMenuOpen ?
                                navbarItems.map((item, index) => (
                                    <NavbarMenuItem key={`${item}-${index}`}>
                                        {pathname.includes(item.toLowerCase()) ?
                                            <Link
                                                className="text-orange-400 text-xl font-semibold"
                                                href={`/${item.toLowerCase()}`}
                                            >
                                                {item}
                                            </Link>
                                            :
                                            <Link
                                                className="text-nyanza text-xl font-semibold"
                                                href={`/${item.toLowerCase()}`}
                                            >
                                                {item}
                                            </Link>
                                        }
                                    </NavbarMenuItem>
                                ))
                            : isParametersMenuOpen &&
                                <NavbarMenuItem>
                                    <div className='md:hidden w-full flex justify-between'>
                                        <span className="flex items-center rounded-l-sm w-full h-10 bg-blueish-gray">
                                            <input type='text' onChange={(e) => handleChangeSearch(e)} onKeyDown={(e) => handleKeydownSearch(e)} className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray' />
                                            <button className='bg-lapis-lazuli ml-[1px] h-full rounded-r-sm' onClick={handleClickSearch}>
                                                <Search className='mx-2 max-h-6' />
                                            </button>
                                        </span>
                                        <Button disabled={pathname.includes('/shows') === true} className={`max-w-fit bg-lapis-lazuli ml-2 rounded-sm ${pathname.includes('/shows') && 'opacity-50'}`} key="full" onClick={handleOpen}>
                                            <Sliders />
                                        </Button>
                                    </div>
                                </NavbarMenuItem>
                            }
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
                </div>
                { (pathname === "/movies" || pathname === "/shows") ?
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
        </MediaContext.Provider>
    );
}