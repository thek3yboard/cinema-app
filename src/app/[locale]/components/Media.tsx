"use client";

import { useState, useEffect, useContext, useRef, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MediaContext } from "../(logged)/MediaContext";
import { Movie, Show, Person } from "@/types/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
const MediaGrid = lazy(() => import('../components/MediaGrid'));

type Media = {
    type: string,
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

        let firstAPIURL = '', secondAPIURL = '';

        if(language.key === localStorage.getItem('language_key')) {
            if(type !== 'people') {
                switch(sort.key) {
                    case 'vote_average':
                        if(type === 'shows') {
                            firstAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=${language.key}&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                            secondAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=${language.key}&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                        } else {
                            firstAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                            secondAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        }
                        break;
                    case 'now_playing':
                        const endDate = new Date();
                        let startDate = new Date();
                        startDate.setDate(endDate.getDate() - 21);
                        if(type === 'shows') {
                            firstAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=${language.key}&page=${currentApiPages[0]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                            secondAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=${language.key}&page=${currentApiPages[1]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                        } else {
                            firstAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                            secondAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[1]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        }
                        break;
                    default:
                        if(type === 'shows') {
                            firstAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=${language.key}&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                            secondAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=${language.key}&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                        } else {
                            firstAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                            secondAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${language.key}&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                        }
                        break;
                }
            } else {
                firstAPIURL = `https://api.themoviedb.org/3/trending/person/week?language=${language.key}&page=${currentApiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                secondAPIURL = `https://api.themoviedb.org/3/trending/person/week?language=${language.key}&page=${currentApiPages[1]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
            }
    
            const fetchFirstPage = async () => {
                try {
                    let res = await fetch(firstAPIURL, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                        }
                    });
                    
                    const data = await res.json();
                    
                    return data.results;
                } catch (error) {
                    console.error(error)
                }
            }
    
            const fetchSecondPage = async () => {
                try {
                    let res = await fetch(secondAPIURL, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                        }
                    });
                    
                    const data = await res.json();
                    
                    return data.results;
                } catch (error) {
                    console.error(error)
                }
            }
            
            const fetchBoth = async () => {
                const firstBatchMedia = await fetchFirstPage();
                const secondBatchMedia = await fetchSecondPage();
                const allMediaPage = [...firstBatchMedia, ...secondBatchMedia];
    
                switch(type) {
                    case 'movies':
                        setMovies(allMediaPage);
                        break;
                    case 'shows':
                        setShows(allMediaPage);
                        break;
                    case 'people':
                        const peopleWithPicture = allMediaPage.filter((person) => person.profile_path !== null);
                        const finalPeople = peopleWithPicture.slice(0, 30);
                        setPeople(finalPeople);
                        break;
                    default:
                        break;
                }
            };
            
            fetchBoth();
        }
    }, [currentApiPages, sort, type, language]);

    const handleClickMediaImage = (media: Movie | Show | Person) => {
        if(pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}`) {
            router.push(`/${pathname.split('/')[1]}/movies/${media.id}`);
        } else if(pathname === `/${pathname.split('/')[1]}/shows`) {
            router.push(`/${pathname.split('/')[1]}/shows/${media.id}`);
        } else if(pathname === `/${pathname.split('/')[1]}/people`) {
            router.push(`/${pathname.split('/')[1]}/people/${media.id}`);
        }
    }

    function PrevPageButton() {
        return (
            <button className='flex items-center' disabled={page === 1}>
                <FontAwesomeIcon onClick={handleClickPrevPage} icon={faChevronLeft} color='white' size='4x' opacity='60%' className={`${currentApiPages[0] === 1 ? `opacity-25` : `hover:opacity-100`}`} />
                <label>{(page > 1) && page - 1}</label>
            </button>
        );
    }

    function NextPageButton() {
        return (
            <button className='flex items-center' disabled={movies.length !== 40}>
                <label>{(movies.length === 40) && page + 1}</label>
                <FontAwesomeIcon onClick={handleClickNextPage} icon={faChevronRight} color='white' size='4x' opacity='60%' className={`${movies.length !== 40 ? `opacity-25` : `hover:opacity-100`}`} />
            </button>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div>
                <div className='flex flex-row'>
                    <div className='max-xl:hidden content-center'>
                        { pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}` ?
                            (imagesLoaded) && <PrevPageButton />
                        : pathname === `/${pathname.split('/')[1]}/shows` &&
                            (imagesLoaded && shows.length === 40) && <PrevPageButton />
                        }
                    </div>
                    { pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}` ?
                        <div className={`mx-4 grid ${movies.length !== 1 ? `media-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`}>
                            <MediaGrid media={movies} handleClickMediaImage={handleClickMediaImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} countLoadedImages={countLoadedImages} />
                        </div>
                    : pathname === `/${pathname.split('/')[1]}/shows` ?
                        <div className={`mx-4 grid ${shows.length !== 1 ? `media-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`}>
                            <MediaGrid media={shows} handleClickMediaImage={handleClickMediaImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} countLoadedImages={countLoadedImages} />
                        </div>
                    : pathname === `/${pathname.split('/')[1]}/people` &&
                        <div className={`mx-4 grid ${shows.length !== 1 ? `media-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`}>
                            <MediaGrid media={people} handleClickMediaImage={handleClickMediaImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} countLoadedImages={countLoadedImages} />
                        </div>
                    }
                    <div className='max-xl:hidden content-center'>
                        { pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}` ?
                            (imagesLoaded) && <NextPageButton />
                        : pathname === `/${pathname.split('/')[1]}/shows` &&
                            (imagesLoaded && shows.length === 40) && <NextPageButton />
                        }
                    </div>
                </div>
                <div className='flex xl:hidden mt-4 justify-center'>
                    { pathname === `/${pathname.split('/')[1]}/movies` || pathname === `/${pathname.split('/')[1]}/people/${pathname.split('/')[3]}` ?
                        (imagesLoaded) && 
                        <>
                            <div className='w-full flex items-center mx-8'>
                                <PrevPageButton />
                            </div>
                            <div className='w-full flex items-center justify-end mx-8'>
                                <NextPageButton />
                            </div>
                        </>   
                    : pathname === `/${pathname.split('/')[1]}/shows` &&
                        (imagesLoaded && shows.length === 40) && 
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