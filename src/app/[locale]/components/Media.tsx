"use client";

import { useState, useEffect, useContext, useRef, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MediaContext } from "../(logged)/MediaContext";
import { Movie, Show, Person } from "@/types/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { fetchBoth } from '@/app/[locale]/utils';
import { buildDiscoverUrl } from '@/lib/tmdb/discover';
const MediaGrid = lazy(() => import('../components/MediaGrid'));

type Media = {
    type: 'movies' | 'shows' | 'people',
    preloadedMovies: Movie[] | [],
    preloadedShows: Show[] | [],
    preloadedPeople: Person[] | []
}

export default function Media({ type, preloadedMovies = [], preloadedShows = [], preloadedPeople = [] }: Media) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const countLoadedImages = useRef(0);
    const { page, currentApiPages, sort, handleClickPrevPage, handleClickNextPage, movies, setMovies,
    shows, setShows, people, setPeople, language, setLanguage } = useContext(MediaContext);
    const router = useRouter();
    const pathname = usePathname();
    const isCarousel = pathname.includes('/onscreentogether');

    useEffect(() => {
        const storedLanguageKey = localStorage.getItem('language_key');
        const storedLanguageLabel = localStorage.getItem('language_label');

        if (storedLanguageKey && storedLanguageLabel) {
            setLanguage({ key: storedLanguageKey, label: storedLanguageLabel });
        }
    }, [])

    useEffect(() => {
        setImagesLoaded(false);
        countLoadedImages.current = 0;

        if(preloadedMovies.length !== 0) {
            if(pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}`) {
                let chunkSize = 40;
                let startIndex = (page - 1) * chunkSize;
                let endIndex = startIndex + chunkSize;
            
                setMovies(preloadedMovies.slice(startIndex, endIndex));
                return;
            } else {
                setMovies(preloadedMovies);
                return;
            }
        }

        if(preloadedShows.length !== 0) {
            setShows(preloadedShows);
            return;
        }

        if(preloadedPeople.length !== 0) {
            setPeople(preloadedPeople);
            return;
        }

        if(language.key === localStorage.getItem('language_key')) {
            let firstAPIURL = '';
            let secondAPIURL = '';

            if(type !== 'people') {
                firstAPIURL = buildDiscoverUrl({ type, language: language.key, page: currentApiPages[0], sort });
                secondAPIURL = buildDiscoverUrl({ type, language: language.key, page: currentApiPages[1], sort });
            } else {
                firstAPIURL = `https://api.themoviedb.org/3/trending/person/week?language=${language.key}&page=${currentApiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                secondAPIURL = `https://api.themoviedb.org/3/trending/person/week?language=${language.key}&page=${currentApiPages[1]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
            }

            fetchBoth(type, firstAPIURL, secondAPIURL, setMovies, setShows, setPeople);
        }
    }, [currentApiPages, sort, type, language]);

    const isMoviesPage = pathname === `/${pathname.split('/')[1]}/movies`;
    const isShowsPage = pathname === `/${pathname.split('/')[1]}/shows`;
    const isPersonCreditsPage = pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}`;
    const isPaginatedPage = isMoviesPage || isShowsPage || isPersonCreditsPage;
    const visibleMediaCount = isShowsPage ? shows.length : movies.length;
    const hasNextPage = visibleMediaCount === 40;

    const handleClickMediaImage = (media: Movie | Show | Person) => {
        switch(pathname) {
            case `/${pathname.split('/')[1]}/movies`:
                router.push(`/${pathname.split('/')[1]}/movies/${media.id}`);
                break;
            case `/${pathname.split('/')[1]}/onscreentogether`:
                router.push(`/${pathname.split('/')[1]}/movies/${media.id}`);
                break;
            case `/${pathname.split('/')[1]}/shows`:
                router.push(`/${pathname.split('/')[1]}/shows/${media.id}`);
                break;
            case `/${pathname.split('/')[1]}/people`:
                router.push(`/${pathname.split('/')[1]}/people/${media.id}`);
                break;
            case `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}`:
                if(media.hasOwnProperty('media_type')) { 
                    if(media.media_type === 'tv') {
                        router.push(`/${pathname.split('/')[1]}/shows/${media.id}`); 
                    } else {
                        router.push(`/${pathname.split('/')[1]}/movies/${media.id}`);
                    }
                } else {
                    router.push(`/${pathname.split('/')[1]}/movies/${media.id}`);
                }
                break;
            default:
                break;
        }
    }

    function PrevPageButton() {
        return (
            <button type="button" className='flex items-center' disabled={page === 1} onClick={handleClickPrevPage}>
                <FontAwesomeIcon icon={faChevronLeft} color='white' size='4x' opacity='60%' className={`${page === 1 ? `opacity-25` : `hover:opacity-100`}`} />
                <span>{page > 1 ? page - 1 : null}</span>
            </button>
        );
    }

    function NextPageButton() {
        return (
            <button type="button" className='flex items-center' disabled={!hasNextPage} onClick={handleClickNextPage}>
                <span>{hasNextPage ? page + 1 : null}</span>
                <FontAwesomeIcon icon={faChevronRight} color='white' size='4x' opacity='60%' className={`${!hasNextPage ? `opacity-25` : `hover:opacity-100`}`} />
            </button>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div>
                <div className='flex flex-row'>
                    <div className='max-xl:hidden content-center'>
                        {imagesLoaded && isPaginatedPage && <PrevPageButton />}
                    </div>
                    { pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}` || pathname === `/${pathname.split('/')[1]}/onscreentogether` ?
                        <div
                            className={
                                isCarousel
                                ? 'flex overflow-x-auto gap-4 px-4 py-2 w-full scrollbar-thin scrollbar-thumb-gray-400 flex-nowrap'
                                : `mx-4 grid ${movies.length !== 1 ? `media-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`
                            }
                        >
                            <MediaGrid
                                media={movies}
                                handleClickMediaImage={handleClickMediaImage}
                                imagesLoaded={imagesLoaded}
                                setImagesLoaded={setImagesLoaded}
                                countLoadedImages={countLoadedImages}
                                isCarousel={isCarousel}
                            />
                        </div>
                    : pathname === `/${pathname.split('/')[1]}/shows` ?
                        <div className={`mx-4 grid ${shows.length !== 1 ? `media-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`}>
                            <MediaGrid media={shows} handleClickMediaImage={handleClickMediaImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} countLoadedImages={countLoadedImages} />
                        </div>
                    : pathname === `/${pathname.split('/')[1]}/people` &&
                        <div className={`mx-4 grid ${people.length !== 1 ? `media-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`}>
                            <MediaGrid media={people} handleClickMediaImage={handleClickMediaImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} countLoadedImages={countLoadedImages} />
                        </div>
                    }
                    <div className='max-xl:hidden content-center'>
                        {imagesLoaded && isPaginatedPage && <NextPageButton />}
                    </div>
                </div>
                <div className='flex xl:hidden mt-4 justify-center'>
                    {imagesLoaded && isPaginatedPage &&
                        <>
                            <div className='w-full flex items-center mx-8'>
                                <PrevPageButton />
                            </div>
                            <div className='w-full flex items-center justify-end mx-8'>
                                <NextPageButton />
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}
