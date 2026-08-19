"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { MediaContext, initialPage, initialCurrentApiPages, initialSort, initialLanguage } from "../(logged)/MediaContext";
import { SortType, Movie, Show, Person } from '@/types/types';
import { CatalogType, getOrderOptions, getSortByOptions } from '@/assets/filtersData';
import { usePathname, useRouter } from 'next/navigation';
import { Sliders } from 'lucide-react'
import { Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, 
    Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarContent, NavbarItem, Link, useDisclosure,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import LanguageSelect, { languageOptions } from '../components/ui/LanguageSelect';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Image from "next/image";
import logo from '@/assets/cinema.png';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import GlobalSearchInput from '@/app/[locale]/components/GlobalSearchInput';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { isEmailAuthEnabled } from '@/lib/supabase/config';
import { cinemaModalClassNames } from '@/components/ui/modalStyles';

type NavbarItems = {
    key: string,
    value: string
}

type PaginationSection = CatalogType | 'people';

type PaginationState = Record<PaginationSection, {
    page: number;
    apiPages: number[];
}>;

const initialPaginationState = (): PaginationState => ({
    movies: { page: initialPage, apiPages: [...initialCurrentApiPages] },
    shows: { page: initialPage, apiPages: [...initialCurrentApiPages] },
    people: { page: initialPage, apiPages: [...initialCurrentApiPages] },
});

const persistLanguagePreference = (key: string, label: string) => {
    localStorage.setItem('language_key', key);
    localStorage.setItem('language_label', label);
    document.cookie = `NEXT_LOCALE=${encodeURIComponent(key)}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const t = useTranslations('LoggedLayout');
    const tAuth = useTranslations('Auth');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const activeCatalogType: CatalogType = pathname.includes('/shows') ? 'shows' : 'movies';
    const activePaginationSection: PaginationSection = pathname.includes('/shows')
        ? 'shows'
        : pathname.includes('/people')
            ? 'people'
            : 'movies';
    const isCatalogPath = pathname === `/${locale}/${activeCatalogType}`;
    const [pagination, setPagination] = useState<PaginationState>(initialPaginationState);
    const { page, apiPages: currentApiPages } = pagination[activePaginationSection];
    const [movies, setMovies] = useState<Movie[]>([]);
    const [shows, setShows] = useState<Show[]>([]);
    const [people, setPeople] = useState<Person[]>([]); 
    const [sortByType, setSortByType] = useState<Record<CatalogType, SortType>>({
        movies: {
            key: initialSort.key,
            label: t(`${initialSort.label}`),
            order_key: initialSort.order_key,
            order_label: t(`${initialSort.order_label}`),
        },
        shows: {
            key: initialSort.key,
            label: t(`${initialSort.label}`),
            order_key: initialSort.order_key,
            order_label: t(`${initialSort.order_label}`),
        },
    });
    const sort = sortByType[activeCatalogType];
    const availableSortOptions = getSortByOptions(activeCatalogType);
    const [language, setLanguage] = useState(initialLanguage);
    const [loading, setLoading] = useState<boolean>(true);
    const [draftSortKey, setDraftSortKey] = useState(sort.key);
    const [draftOrderKey, setDraftOrderKey] = useState(sort.order_key);
    const availableOrderOptions = getOrderOptions(activeCatalogType, draftSortKey);
    const screenRef = useRef<HTMLDivElement>(null);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const globalSearch = useGlobalSearch(() => setIsMenuOpen(false));
    const { user, profile, isLoading: isAuthLoading, signOut } = useAuth();
    const profileName = profile?.username || user?.user_metadata?.full_name || user?.email || t('defaultUser');

    useEffect(() => {
        const selectedLanguage = languageOptions.find((option) => option.key === locale) ?? languageOptions[0];
        setLanguage({ key: selectedLanguage.key, label: selectedLanguage.label });
        persistLanguagePreference(selectedLanguage.key, selectedLanguage.label);

        setLoading(false);
    }, [locale]);

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
            key: 'onScreenTogether',
            value: `${t('onScreenTogether')}`
        }
    ];

    const handleClickPrevPage = () => {
        if(currentApiPages[0] === 1) {
            return;
        }

        if (activePaginationSection === 'shows') setShows([]);
        else setMovies([]);

        setPagination((current) => ({
            ...current,
            [activePaginationSection]: {
                page: current[activePaginationSection].page - 1,
                apiPages: current[activePaginationSection].apiPages.map((apiPage) => apiPage - 2),
            },
        }));
    }

    const handleClickNextPage = () => {
        if (activePaginationSection === 'shows') setShows([]);
        else setMovies([]);

        setPagination((current) => ({
            ...current,
            [activePaginationSection]: {
                page: current[activePaginationSection].page + 1,
                apiPages: current[activePaginationSection].apiPages.map((apiPage) => apiPage + 2),
            },
        }));
    }

    const handleChangeLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = languageOptions.find(language => language.key === e.target.value)
        if (!newLanguage || newLanguage.key === locale) return;

        setLanguage({ key: newLanguage!.key, label: newLanguage!.label })
        persistLanguagePreference(newLanguage.key, newLanguage.label)

        const parts = pathname.split("/");
        const localizedPathname = `/${newLanguage.key}/${parts.slice(2).join("/")}`;
        router.push(localizedPathname);

        setIsMenuOpen(false);
    }

    const handleChangeSort = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextSortKey = e.target.value;
        const nextOrderOptions = getOrderOptions(activeCatalogType, nextSortKey);
        setDraftSortKey(nextSortKey);

        if (!nextOrderOptions.some((option) => option.key === draftOrderKey)) {
            setDraftOrderKey(nextOrderOptions[0].key);
        }
    }

    const handleChangeOrder = (e: ChangeEvent<HTMLSelectElement>) => {
        setDraftOrderKey(e.target.value);
    }

    const handleSetFilters = () => {
        setIsMenuOpen(false);

        const selectedOrder = availableOrderOptions.find((option) => option.key === draftOrderKey);
        const selectedSort = availableSortOptions.find((option) => option.key === draftSortKey);
        if (!selectedOrder || !selectedSort) return;

        setSortByType((current) => ({
            ...current,
            [activeCatalogType]: {
                key: selectedSort.key,
                label: t(`${selectedSort.label}`),
                order_key: selectedOrder.key,
                order_label: t(`${selectedOrder.label}`),
            },
        }));
        setPagination((current) => ({
            ...current,
            [activeCatalogType]: {
                page: initialPage,
                apiPages: [...initialCurrentApiPages],
            },
        }));
        onClose();

        if(activeCatalogType === 'movies') {
            setMovies([]);
        } else {
            setShows([]);
        }
    }

    const handleOpen = () => {
        setDraftSortKey(sort.key);
        setDraftOrderKey(sort.order_key);
        onOpen();
    }

    const handleClickChildren = () => {
        setIsMenuOpen(false);
        globalSearch.close();
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
        <MediaContext.Provider value={{ page, currentApiPages, handleClickPrevPage, handleClickNextPage, sort, movies, setMovies, shows, setShows, people, setPeople, language, setLanguage }}>
        <>
            <div ref={screenRef} className="h-screen flex flex-col overflow-y-auto bg-gradient-to-r from-[#192a49] from-1% via-[#3f577c] via-50% to-[#192a49] to-99%">
                <div className="z-20 sticky top-0 border-b-2 border-slate-700">
                    <Navbar maxWidth="full" isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className="h-auto bg-gradient-to-r from-aero-blue to-blueish-gray">
                        <NavbarContent className="xl:hidden" justify="start">
                            <NavbarBrand>
                                <Image className='min-w-32 mb-2' src={logo} alt="Logo" width={128} />
                            </NavbarBrand>
                        </NavbarContent>
                        <NavbarContent className="xl:hidden" justify="end">
                            <NavbarMenuToggle
                                aria-label={isMenuOpen ? t('closeNavigationMenu') : t('openNavigationMenu')}
                                className={`h-11 w-11 rounded-md transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                    isMenuOpen ? 'bg-slate-200 text-[#192a49]' : 'text-inherit'
                                }`}
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
                        <NavbarMenu
                            className="mt-[1.5px] gap-3 p-5"
                            motionProps={{
                                variants: {
                                    enter: {
                                        height: 'calc(100vh - var(--navbar-height))',
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            duration: 0.24,
                                            ease: 'easeOut'
                                        }
                                    },
                                    exit: {
                                        height: 0,
                                        opacity: 0,
                                        y: -6,
                                        transition: {
                                            duration: 0.18,
                                            ease: 'easeIn'
                                        }
                                    }
                                }
                            }}
                        >
                            <NavbarMenuItem>
                                <div className='flex w-full min-w-0 gap-2 xl:hidden'>
                                    <GlobalSearchInput controller={globalSearch} className="min-w-0 flex-1" />
                                    <Button
                                        isIconOnly
                                        disabled={!isCatalogPath}
                                        className="h-10 w-10 min-w-10 shrink-0 rounded-sm bg-lapis-lazuli disabled:opacity-50"
                                        key="full"
                                        onPress={handleOpen}
                                    >
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
                            {!isAuthLoading && user && (
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
                            {!isAuthLoading && !user && (
                                <NavbarMenuItem className="mt-2 border-t border-slate-500 pt-4">
                                    <div className={`grid gap-3 ${isEmailAuthEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        <Link
                                            className="flex h-11 items-center justify-center rounded-md border border-nyanza/70 px-4 font-semibold text-nyanza"
                                            href={`/${locale}/signin`}
                                            onPress={() => setIsMenuOpen(false)}
                                        >
                                            {tAuth('signIn')}
                                        </Link>
                                        {isEmailAuthEnabled && (
                                            <Link
                                                className="flex h-11 items-center justify-center rounded-md bg-orange-400 px-4 font-bold text-slate-950"
                                                href={`/${locale}/signup`}
                                                onPress={() => setIsMenuOpen(false)}
                                            >
                                                {tAuth('createAccount')}
                                            </Link>
                                        )}
                                    </div>
                                </NavbarMenuItem>
                            )}
                        </NavbarMenu>
                        <NavbarContent className="hidden xl:flex flex-none gap-2" justify="end">
                            <NavbarItem className="w-64 shrink-0 2xl:w-72">
                                <GlobalSearchInput controller={globalSearch} className="w-full" />
                            </NavbarItem>
                            <NavbarItem>
                                <button
                                    type="button"
                                    aria-label={t('filter')}
                                    disabled={!isCatalogPath}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-nyanza hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    onClick={handleOpen}
                                >
                                    <Sliders className="h-5 w-5" />
                                </button>
                            </NavbarItem>
                            <NavbarItem className="w-32 shrink-0">
                                {!loading ? <LanguageSelect handleChangeLanguage={handleChangeLanguage} smallDevice={false} /> : <div className="h-10 w-32" />}
                            </NavbarItem>
                            {!isAuthLoading && user && (
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
                            {!isAuthLoading && !user && (
                                <NavbarItem>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            className="rounded-md px-3 py-2 text-sm font-semibold text-nyanza transition hover:bg-white/10"
                                            href={`/${locale}/signin`}
                                        >
                                            {tAuth('signIn')}
                                        </Link>
                                        {isEmailAuthEnabled && (
                                            <Link
                                                className="rounded-md bg-orange-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-orange-300"
                                                href={`/${locale}/signup`}
                                            >
                                                {tAuth('createAccount')}
                                            </Link>
                                        )}
                                    </div>
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
            <Modal size="md" isOpen={isOpen} onClose={onClose} classNames={cinemaModalClassNames}>
                <ModalContent>
                {(closeModal) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <span className="text-xl font-bold text-white">{t('filter')}</span>
                            <span className="text-sm font-normal text-slate-400">{t('filterDescription')}</span>
                        </ModalHeader>
                        <ModalBody className="gap-4">
                            <Select key="sort" variant="bordered" label={t('sortBy')} selectedKeys={[draftSortKey]} className="w-full" onChange={handleChangeSort}>
                                {availableSortOptions.map((option) => <SelectItem key={option.key}>{t(`${option.label}`)}</SelectItem>)}
                            </Select>
                            <Select key="order" variant="bordered" label={t('orderBy')} selectedKeys={[draftOrderKey]} isDisabled={availableOrderOptions.length === 1} className="w-full" onChange={handleChangeOrder}>
                                {availableOrderOptions.map((option) => <SelectItem key={option.key}>{t(`${option.label}`)}</SelectItem>)}
                            </Select>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={closeModal} className="font-semibold text-slate-300">{t('close')}</Button>
                            <Button onPress={handleSetFilters} className="bg-aero-blue font-bold text-white">{t('apply')}</Button>
                        </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
        </>
        </MediaContext.Provider>
    );
}
