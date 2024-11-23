"use client";

import { useState, useEffect, useContext, useRef, Suspense, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FilmsContext } from "@/app/(logged)/FilmsContext";
import Loading from "@/app/ui/loading";
import { Movie } from "@/types/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
const FilmsGrid = lazy(() => import('@/app/(logged)/films/ui/FilmsGrid'));

export default function Films({ shows = false }) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const countLoadedImages = useRef(0);
    const { page, currentApiPages, sort, handleClickPrevPage, handleClickNextPage, movies, setMovies } = useContext(FilmsContext);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setImagesLoaded(false);
        countLoadedImages.current = 0;

        let firstAPIURL = '', secondAPIURL = '';

        switch(sort.key) {
            case 'vote_average':
                if(shows) {
                    firstAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                    secondAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                } else {
                    firstAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    secondAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&without_genres=99,10755&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                }
                break;
            case 'now_playing':
                const endDate = new Date();
                let startDate = new Date();
                startDate.setDate(endDate.getDate() - 21);
                if(shows) {
                    firstAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentApiPages[0]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                    secondAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentApiPages[1]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                } else {
                    firstAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    secondAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[1]}&sort_by=popularity.${sort.order_key}&with_release_type=2|3&release_date.gte=${startDate}&release_date.lte=${endDate}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                }
                break;
            default:
                if(shows) {
                    firstAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                    secondAPIURL = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                } else {
                    firstAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                    secondAPIURL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&vote_count.gte=200&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
                }
                break;
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
            const firstBatchMovies = await fetchFirstPage();
            const secondBatchMovies = await fetchSecondPage();
            const allMoviesPage = [...firstBatchMovies, ...secondBatchMovies];
            setMovies(allMoviesPage);
        };
        
        fetchBoth();
    }, [currentApiPages, sort]);

    const handleClickMovieImage = (movie: Movie): void => {
        if(pathname === '/films') {
            router.push(`/film/${movie.id}`);
        } else {
            router.push(`/show/${movie.id}`);
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
                        { (imagesLoaded && movies.length === 40) && <PrevPageButton /> }
                    </div>
                    <div className={`mx-4 grid ${movies.length !== 1 ? `films-grid-columns` : `grid-cols-1`} gap-5 xl:gap-3 justify-items-center justify-center`}>
                        <FilmsGrid movies={movies} handleClickMovieImage={handleClickMovieImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} 
                        countLoadedImages={countLoadedImages} />
                    </div>
                    <div className='max-xl:hidden content-center'>
                        { (imagesLoaded && movies.length === 40) && <NextPageButton /> }
                    </div>
                </div>
                <div className='flex xl:hidden mt-4 justify-center'>
                    { (imagesLoaded && movies.length === 40) && 
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