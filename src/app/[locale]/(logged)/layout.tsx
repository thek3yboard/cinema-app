"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { MediaContext, initialPage, initialCurrentApiPages, initialSort, initialLanguage } from "../(logged)/MediaContext";
import { SortType, Movie, Show, Person } from '@/types/types';
import { orderOptions, sortByOptions } from '@/assets/filtersData';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sliders, AlignJustify, X } from 'lucide-react'
import { Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, 
    Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarContent, NavbarItem, Link, useDisclosure,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import LanguageSelect, { languageOptions } from '../components/ui/LanguageSelect';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Image from "next/image";
import logo from '@/assets/cinema.png';
import { toast } from 'sonner';
import { fetchPage } from '@/app/[locale]/utils';
import { useAuth } from '@/components/auth/AuthProvider';

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
    const screenRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const { user, profile, signOut } = useAuth();
    const profileName = profile?.display_name || profile?.username || user?.user_metadata?.full_name || user?.email || t('defaultUser');

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
        },
        {
            key: 'onScreenTogether',
            value: `${t('onScreenTogether')}`
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
        const parts = pathname.split("/");
        const secondPart = "/" + parts.slice(2).join("/");

        newPathname = `${newPathname}${secondPart}/`;
        router.push(`${newPathname}`);

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

                filteredMovies = filteredMovies.sort((a: any, b: any) => a.release_date?.localeCompare(b.release_date));
                
                setMovies(filteredMovies);

                router.push(`/${pathname.split('/')[1]}/movies`);
            } else if(pathname.includes('/shows')) {
                const shows = allMediaPage;

                let filteredShows = shows.filter((show: Show) => show.vote_count > 1000);

                filteredShows = filteredShows.sort((a: any, b: any) => a.first_air_date?.localeCompare(b.first_air_date));
                
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

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsMenuOpen(false);
            router.replace(`/${locale}/signin`);
            router.refresh();
        } catch {
            toast.error(t('signOutError'));
        }
    }

    return (
        <MediaContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage, sort, movies, setMovies, shows, setShows, people, setPeople, language, setLanguage }}>
        <>
            <div ref={screenRef} className="h-screen flex flex-col overflow-y-auto bg-gradient-to-r from-[#192a49] from-1% via-[#3f577c] via-50% to-[#192a49] to-99%">
                <div className="z-20 sticky top-0 border-b-2 border-slate-700">
                    <Navbar maxWidth="full" disableAnimation={true} isMenuOpen={isMenuOpen} onMenuOpenChange={handleMenuToggle} className="h-auto bg-gradient-to-r from-aero-blue to-blueish-gray">
                        <NavbarContent className="xl:hidden" justify="start">
                            <NavbarBrand>
                                <Image className='min-w-32 mb-2' src={logo} alt="Logo" width={128} />
                            </NavbarBrand>
                        </NavbarContent>
                        <NavbarContent className="xl:hidden" justify="end">
                            <NavbarMenuToggle 
                                isSelected={isMenuOpen}
                                icon={isMenuOpen ? 
                                    <button style={{ color: '#192a49' }} className='p-2 rounded-md bg-slate-200'><AlignJustify /></button> 
                                    : 
                                    <AlignJustify />
                                }
                            />
                        </NavbarContent>
                        <NavbarContent className="hidden xl:flex flex-1 gap-4 2xl:gap-6" justify="start">
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
                                            {item.key === 'onScreenTogether' ? <><span className="2xl:hidden">{t('onScreenTogetherShort')}</span><span className="hidden 2xl:inline">{item.value}</span></> : item.value}
                                        </Link>
                                        :
                                        <Link
                                            className="text-nyanza text-xl font-semibold"
                                            href={`/${pathname.split('/')[1]}/${item.key.toLowerCase()}`}
                                        >
                                            {item.key === 'onScreenTogether' ? <><span className="2xl:hidden">{t('onScreenTogetherShort')}</span><span className="hidden 2xl:inline">{item.value}</span></> : item.value}
                                        </Link>
                                    }
                                </NavbarItem>
                            ))}
                        </NavbarContent>
                        <NavbarMenu className='max-h-fit mt-[1.5px] gap-3 p-5'>
                            <NavbarMenuItem>
                                <div className='xl:hidden w-full flex justify-between'>
                                    <span className="flex items-center rounded-l-sm w-full h-10 bg-blueish-gray relative">
                                        <input 
                                            type='text' 
                                            value={search} 
                                            onChange={(e) => handleChangeSearch(e)} 
                                            onKeyDown={(e) => handleKeydownSearch(e)} 
                                            placeholder={t('searchPlaceholder')}
                                            aria-label={t('searchPlaceholder')}
                                            className='w-[calc(100%-30px)] pl-2 pr-8 ml-[2px] h-full bg-blueish-gray' 
                                        />
                                        {search && (
                                            <button 
                                                onClick={() => setSearch('')}
                                                className='absolute right-11 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1'
                                                type="button"
                                            >
                                                <X className='w-4 h-4' />
                                            </button>
                                        )}
                                        <button aria-label={t('searchPlaceholder')} className='bg-lapis-lazuli ml-[1px] h-full rounded-r-sm' onClick={handleClickSearch}>
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
                            {user && (
                                <>
                                    <NavbarMenuItem className="mt-2 border-t border-slate-500 pt-4">
                                        <div className="flex items-center gap-3 text-nyanza">
                                            <Avatar key={profile?.avatar_url ?? profileName} isBordered size="sm" name={profileName} src={profile?.avatar_url ?? undefined} />
                                            <span className="min-w-0">
                                                <span className="block truncate font-semibold">{profileName}</span>
                                                <span className="block truncate text-xs opacity-75">{user.email}</span>
                                            </span>
                                        </div>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link className="text-lg font-semibold text-nyanza" href={`/${locale}/profile`} onPress={() => setIsMenuOpen(false)}>{t('profile')}</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link className="text-lg font-semibold text-nyanza" href={`/${locale}/profile#lists`} onPress={() => setIsMenuOpen(false)}>{t('myLists')}</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <button type="button" className="text-lg font-semibold text-red-300" onClick={handleSignOut}>{t('signOut')}</button>
                                    </NavbarMenuItem>
                                </>
                            )}
                        </NavbarMenu>
                        <NavbarContent className="hidden xl:flex flex-none gap-2" justify="end">
                            <NavbarItem>
                                <span className="relative flex h-10 w-56 shrink-0 items-center rounded-[3px] bg-blueish-gray 2xl:w-72">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleChangeSearch}
                                        onKeyDown={handleKeydownSearch}
                                        placeholder={t('searchPlaceholder')}
                                        aria-label={t('searchPlaceholder')}
                                        className="h-full min-w-0 flex-1 bg-blueish-gray pl-3 pr-9 outline-none"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200"
                                            type="button"
                                            aria-label={t('clearSearch')}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        aria-label={t('searchPlaceholder')}
                                        className="flex h-full w-10 shrink-0 items-center justify-center rounded-r-[3px] bg-lapis-lazuli"
                                        onClick={handleClickSearch}
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                </span>
                            </NavbarItem>
                            <NavbarItem>
                                <button
                                    type="button"
                                    aria-label={t('filter')}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-nyanza hover:bg-white/10"
                                    onClick={handleOpen}
                                >
                                    <Sliders className="h-5 w-5" />
                                </button>
                            </NavbarItem>
                            <NavbarItem className="w-32 shrink-0">
                                {!loading ? <LanguageSelect handleChangeLanguage={handleChangeLanguage} smallDevice={false} /> : <div className="h-10 w-32" />}
                            </NavbarItem>
                            {user && (
                                <NavbarItem>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <button type="button" className="flex max-w-40 items-center gap-2 rounded-md p-1 text-nyanza hover:bg-white/10" aria-label={t('openUserMenu')}>
                                                <Avatar key={profile?.avatar_url ?? profileName} isBordered size="sm" name={profileName} src={profile?.avatar_url ?? undefined} classNames={{ base: 'border-nyanza/70 bg-slate-600', name: 'font-bold text-nyanza' }} />
                                                <span className="max-w-24 truncate text-sm font-semibold">{profileName}</span>
                                            </button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label={t('userMenu')}>
                                            <DropdownItem key="identity" isReadOnly className="h-12 gap-2 opacity-100">
                                                <p className="font-semibold">{profileName}</p>
                                                <p className="text-xs text-default-500">{user.email}</p>
                                            </DropdownItem>
                                            <DropdownItem key="profile" onPress={() => router.push(`/${locale}/profile`)}>{t('profile')}</DropdownItem>
                                            <DropdownItem key="lists" onPress={() => router.push(`/${locale}/profile#lists`)}>{t('myLists')}</DropdownItem>
                                            <DropdownItem key="logout" className="text-danger" color="danger" onPress={handleSignOut}>{t('signOut')}</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </NavbarItem>
                            )}
                        </NavbarContent>
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
