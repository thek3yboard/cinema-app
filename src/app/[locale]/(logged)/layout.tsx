"use client";

import { useState, useRef, createRef, ChangeEvent, useEffect } from 'react';
import { MediaContext, initialPage, initialCurrentApiPages, initialSort, initialLanguage } from "../(logged)/MediaContext";
import { SortType, Movie, Show, Person } from '@/types/types';
import { orderOptions, sortByOptions } from '@/assets/filtersData';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sliders, AlignJustify } from 'lucide-react'
import { Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, 
    Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarContent, NavbarItem, Link, useDisclosure } from "@nextui-org/react";
import LanguageSelect, { languageOptions } from '../components/ui/LanguageSelect';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Image from "next/image";
import logo from '@/assets/cinema.png';
import { toast } from 'sonner';
import { fetchPage } from '@/app/[locale]/utils';

type NavbarItems = {
    key: string,
    value: string
}

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const t = useTranslations('LoggedLayout');
    const locale = useLocale();
    const [page, setPage] = useState(initialPage);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [shows, setShows] = useState<Show[]>([]);
    const [people, setPeople] = useState<Person[]>([]); 
    const [currentApiPages, setCurrentApiPages] = useState(initialCurrentApiPages);
    const [sort, setSort] = useState<SortType>({
        key: initialSort.key,
        label: t(`${initialSort.label}`),
        order_key: initialSort.order_key,
        order_label: t(`${initialSort.order_label}`)
    });
    const [language, setLanguage] = useState(initialLanguage);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const sortRef = useRef(sort.key);
    const orderRef = useRef(sort.order_key);
    const screenRef = createRef<HTMLDivElement>();
    const router = useRouter();
    const pathname = usePathname();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        if(locale !== localStorage.getItem('language_key')) {
            localStorage.setItem('language_key', locale)
            switch(locale) {
                case 'en-US':
                    localStorage.setItem('language_label', 'English')
                    break
                default: 
                    localStorage.setItem('language_label', 'Spanish')
            }
        }
        const storedLanguageKey = localStorage.getItem('language_key');
        const storedLanguageLabel = localStorage.getItem('language_label');

        if (storedLanguageKey && storedLanguageLabel) {
            setLanguage({ key: storedLanguageKey, label: storedLanguageLabel });
        }

        setLoading(false);
    }, []);

    const navbarItems: NavbarItems[] = [
        {
            key: 'movies',
            value: `${t('movies')}`
        },
        {
            key: 'shows',
            value: `${t('shows')}`
        },
        {
            key: 'people',
            value: `${t('people')}`
        }
    ];

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const handleClickPrevPage = () => {
        setMovies([]);
        setShows([]);
        setSearch('');
        if(currentApiPages[0] === 1) {
            return;
        }
        setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
        setPage(p => p - 1);
    }

    const handleClickNextPage = () => {
        setMovies([]);
        setShows([]);
        setSearch('');
        setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
        setPage(p => p + 1);
    }

    const handleChangeLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = languageOptions.find(language => language.key === e.target.value)
        setLanguage({ key: newLanguage!.key, label: newLanguage!.label })
        localStorage.setItem('language_key', newLanguage!.key)
        localStorage.setItem('language_label', newLanguage!.label)

        let newPathname = `/${newLanguage!.key}`;
        
        if(pathname.includes('/movies')) {
            setMovies([]);
            newPathname = `${newPathname}/movies`;
            router.push(`${newPathname}`);
        } else {
            setShows([]);
            newPathname = `${newPathname}/shows`;
            router.push(`${newPathname}`);
        }

        setSearch('');
        setIsMenuOpen(false);
    }

    const handleChangeSort = (e: ChangeEvent<HTMLSelectElement>) => {
        sortRef.current = e.target.value;
    }

    const handleChangeOrder = (e: ChangeEvent<HTMLSelectElement>) => {
        orderRef.current = e.target.value;
    }

    const handleSetFilters = () => {
        setIsMenuOpen(false);
        setSearch('');

        const selectedOrder = orderOptions.find((option) => option.key === orderRef.current)!;
        const selectedSort = sortByOptions.find((option) => option.key === sortRef.current)!;
        setSort({ ...sort, key: selectedSort.key, label: t(`${selectedSort.label}`),
            order_key: selectedOrder.key, order_label: t(`${selectedOrder.label}`)
        });
        setCurrentApiPages(initialCurrentApiPages);
        setPage(initialPage);
        onClose();

        if(pathname.includes('/movies')) {
            setMovies([]);
            router.push(`/${pathname.split('/')[1]}/movies`);
        } else {
            setShows([]);
            router.push(`/${pathname.split('/')[1]}/shows`);
        }
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

            let firstAPIURL = '', secondAPIURL = '';

            switch(pathname) {
                case '/movies':
                    firstAPIURL = `https://api.themoviedb.org/3/search/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                case '/shows':
                    firstAPIURL = `https://api.themoviedb.org/3/search/tv?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                case '/people':
                    firstAPIURL = `https://api.themoviedb.org/3/search/person?&include_adult=false&query=${search}&language=${language.key}&page=${currentApiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    break;
                default:
                    if(pathname.includes('/movies')) {
                        firstAPIURL = `https://api.themoviedb.org/3/search/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        break;
                    } else if(pathname.includes('/shows')) {
                        firstAPIURL = `https://api.themoviedb.org/3/search/tv?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&query=${search}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        break;
                    } else if(pathname.includes('/people')) {
                        firstAPIURL = `https://api.themoviedb.org/3/search/person?&include_adult=false&query=${search}&language=${language.key}&page=${currentApiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        secondAPIURL = `https://api.themoviedb.org/3/search/person?&include_adult=false&query=${search}&language=${language.key}&page=${currentApiPages[1]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        break;
                    }
            }

            let allMediaPage = [];

            if(secondAPIURL !== '') {
                let page = 1;

                const data = await fetchPage(firstAPIURL);
                const data2 = await fetchPage(secondAPIURL);
                allMediaPage = [...data.results, ...data2.results];

                let apiPages = [currentApiPages[0], currentApiPages[1]];
                page++;

                while(page < data.total_pages) {
                    apiPages[0]+=2;
                    apiPages[1]+=2;

                    firstAPIURL = `https://api.themoviedb.org/3/search/person?&include_adult=false&query=${search}&language=${language.key}&page=${apiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    secondAPIURL = `https://api.themoviedb.org/3/search/person?&include_adult=false&query=${search}&language=${language.key}&page=${apiPages[1]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

                    const data = await fetchPage(firstAPIURL);
                    const data2 = await fetchPage(secondAPIURL);

                    allMediaPage.push(...data.results);
                    allMediaPage.push(...data2.results);

                    if(allMediaPage.length > 100) {
                        toast.error('There are too many results. Please narrow your search criteria.') //TO-DO - Add message to locales
                        return;
                    }

                    page++;
                }

                allMediaPage = allMediaPage.filter((person) => person.profile_path !== null);

                allMediaPage = allMediaPage.filter((person) => person.popularity > 1);
            } else {
                const data = await fetchPage(firstAPIURL);

                allMediaPage = [...data.results];
            }

            if(allMediaPage.length === 0) {
                toast.info('No results found.') //TO-DO - Add message to locales
                return;
            }

            if(pathname.includes('/movies')) {
                const movies = allMediaPage;

                let filteredMovies = movies.filter((movie: Movie) => movie.vote_count > 1000);

                filteredMovies = filteredMovies.sort((a: any, b: any) => a.release_date.substring(0, 4) - b.release_date.substring(0, 4));
                
                setMovies(filteredMovies);

                router.push(`/${pathname.split('/')[1]}/movies`);
            } else if(pathname.includes('/shows')) {
                const shows = allMediaPage;

                let filteredShows = shows.filter((show: Show) => show.vote_count > 1000);

                filteredShows = filteredShows.sort((a: any, b: any) => a.first_air_date.substring(0, 4) - b.first_air_date.substring(0, 4));
                
                setShows(filteredShows);

                router.push(`/${pathname.split('/')[1]}/shows`);
            } else if(pathname.includes('/people')) {
                const people = allMediaPage;
                
                setPeople(people);
                
                router.push(`/${pathname.split('/')[1]}/people`);
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleClickChildren = () => {
        setIsMenuOpen(false);
    }

    return (
        <MediaContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage, sort, movies, setMovies, shows, setShows, people, setPeople, language, setLanguage }}>
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
                                isselected={isMenuOpen}
                                icon={isMenuOpen ? 
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
                                <NavbarItem key={`${item.key}-${index}`}>
                                    {pathname.includes(item.key.toLowerCase()) ?
                                        <Link
                                            className="text-orange-400 text-xl font-semibold"
                                            href={`/${pathname.split('/')[1]}/${item.key.toLowerCase()}`}
                                        >
                                            {item.value}
                                        </Link>
                                        :
                                        <Link
                                            className="text-nyanza text-xl font-semibold"
                                            href={`/${pathname.split('/')[1]}/${item.key.toLowerCase()}`}
                                        >
                                            {item.value}
                                        </Link>
                                    }
                                </NavbarItem>
                            ))}
                        </NavbarContent>
                        <NavbarMenu className='max-h-fit mt-[1.5px] gap-3 p-5'>
                            <NavbarMenuItem>
                                <div className='md:hidden w-full flex justify-between'>
                                    <span className="flex items-center rounded-l-sm w-full h-10 bg-blueish-gray">
                                        <input type='text' value={search} onChange={(e) => handleChangeSearch(e)} onKeyDown={(e) => handleKeydownSearch(e)} className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray' />
                                        <button className='bg-lapis-lazuli ml-[1px] h-full rounded-r-sm' onClick={handleClickSearch}>
                                            <Search className='mx-2 max-h-6' />
                                        </button>
                                    </span>
                                    <Button disabled={pathname.includes('/shows') === true} className={`max-w-fit bg-lapis-lazuli ml-2 rounded-sm ${pathname.includes('/shows') && 'opacity-50'}`} key="full" onClick={handleOpen}>
                                        <Sliders />
                                    </Button>
                                </div>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <LanguageSelect handleChangeLanguage={handleChangeLanguage} smallDevice={true} />
                            </NavbarMenuItem>
                            {navbarItems.map((item, index) => (
                                <NavbarMenuItem key={`${item}-${index}`}>
                                    {pathname.includes(item.key.toLowerCase()) ?
                                        <Link
                                            className="text-orange-400 text-xl font-semibold"
                                            href={`/${pathname.split('/')[1]}/${item.key.toLowerCase()}`}
                                        >
                                            {item.value}
                                        </Link>
                                        :
                                        <Link
                                            className="text-nyanza text-xl font-semibold"
                                            href={`/${pathname.split('/')[1]}/${item.key.toLowerCase()}`}
                                        >
                                            {item.value}
                                        </Link>
                                    }
                                </NavbarMenuItem>
                            ))}
                        </NavbarMenu>
                        <span className="max-md:hidden flex items-center w-2/3 h-10 bg-blueish-gray rounded-[3px]">
                            <input type='text' value={search} onChange={(e) => handleChangeSearch(e)} onKeyDown={(e) => handleKeydownSearch(e)} className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray' />
                            <button onClick={handleClickSearch}>
                                <Search className='mx-2 max-h-6' />
                            </button>
                        </span>
                        <button className='max-md:hidden' key="full" onClick={handleOpen}>
                            <Sliders className='max-h-6' />
                        </button>
                        { !loading ? <LanguageSelect handleChangeLanguage={handleChangeLanguage} smallDevice={false} /> : <div className='max-md:hidden w-48'></div> }
                    </Navbar>
                </div>
                { (pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/shows` || pathname === `/${pathname.split('/')[1]}/people`) ?
                    <>
                        <div onClick={handleClickChildren} className="grow content-center my-4 2xl:overflow-hidden">
                            {children}
                        </div>
                        <div className="h-6 flex justify-center">
                            <footer className="h-6 text-nyanza">Copyright © {new Date().getFullYear()} Juan Ignacio Leiva</footer>
                        </div>
                    </>
                :
                    <>
                        <div className="grow">
                            {children}
                        </div>
                        <div className="flex h-6 justify-center">
                            <footer className="h-6 text-nyanza">Copyright © {new Date().getFullYear()} Juan Ignacio Leiva</footer>
                        </div> 
                    </>
                }
            </div>
            {(typeof window !== "undefined") && 
                window.innerWidth >= 640 ?
                    <Modal 
                        size="md"
                        isOpen={isOpen} 
                        onClose={onClose}
                        closeButton={
                            <button style={{ right: '-100px' }} className='hidden'></button>
                        }
                        className="bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray overflow-x-hidden"
                    >
                        <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1 text-xl">{t('filter')}</ModalHeader>
                                <ModalBody>
                                    <Select
                                        key="sort"
                                        color="default"
                                        label={t('sortBy')}
                                        placeholder={sort.label}
                                        className="w-full"
                                        onChange={handleChangeSort}
                                    >
                                        {sortByOptions.map((option) => (
                                        <SelectItem key={option.key}>
                                            {t(`${option.label}`)}
                                        </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        key="order"
                                        color="default"
                                        label={t('orderBy')}
                                        placeholder={sort.order_label}
                                        className="w-full"
                                        onChange={handleChangeOrder}
                                    >
                                        {orderOptions.map((option) => (
                                        <SelectItem key={option.key}>
                                            {t(`${option.label}`)}
                                        </SelectItem>
                                        ))}
                                    </Select>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="success" onPress={handleSetFilters}>
                                        {t('apply')}
                                    </Button>
                                    <Button color="danger" onPress={onClose}>
                                        {t('close')}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                        </ModalContent>
                    </Modal>
                :
                    <Modal 
                        size="md"
                        isOpen={isOpen} 
                        onClose={onClose}
                        placement="top-center"
                        closeButton={
                            <button style={{ right: '-100px' }} className='hidden'></button>
                        }
                        className="bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray overflow-x-hidden"
                    >
                        <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1 text-xl">{t('filter')}</ModalHeader>
                                <ModalBody>
                                    <Select
                                        key="sort"
                                        color="default"
                                        label={t('sortBy')}
                                        placeholder={sort.label}
                                        className="sm:w-1/12"
                                        onChange={handleChangeSort}
                                    >
                                        {sortByOptions.map((option) => (
                                        <SelectItem key={option.key}>
                                            {t(`${option.label}`)}
                                        </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        key="order"
                                        color="default"
                                        label={t('orderBy')}
                                        placeholder={sort.order_label}
                                        className="sm:w-1/12"
                                        onChange={handleChangeOrder}
                                    >
                                        {orderOptions.map((option) => (
                                        <SelectItem key={option.key}>
                                            {t(`${option.label}`)}
                                        </SelectItem>
                                        ))}
                                    </Select>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="success" onPress={handleSetFilters}>
                                        {t('apply')}
                                    </Button>
                                    <Button color="danger" onPress={onClose}>
                                        {t('close')}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                        </ModalContent>
                    </Modal>
            }
        </>
        </MediaContext.Provider>
    );
}