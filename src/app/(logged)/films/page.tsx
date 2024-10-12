"use client";

import { useState, useEffect, useContext, useRef, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { FilmsContext } from "@/app/(logged)/FilmsContext";
import Loading from "@/app/ui/loading";
import { Movie } from "@/types/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
const FilmsGrid = lazy(() => import('@/app/(logged)/films/ui/FilmsGrid'));

export default function Films() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const countLoadedImages = useRef(0);
    const { page, currentApiPages, sort, handleClickPrevPage, handleClickNextPage } = useContext(FilmsContext);
    const router = useRouter();

    useEffect(() => {
        setImagesLoaded(false);
        countLoadedImages.current = 0;

        const fetchFirstPage = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[0]}&sort_by=${sort.key}.${sort.order_key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
                let res = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${currentApiPages[1]}&sort_by=${sort.key}.${sort.order_key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
        router.push(`/film/${movie.id}`);
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div>
                <div className='flex flex-row'>
                    <div className='max-xl:hidden flex items-center'>
                        { imagesLoaded && <><FontAwesomeIcon onClick={handleClickPrevPage} icon={faChevronLeft} color='white' size='4x' opacity='60%' className={`${currentApiPages[0] === 1 ? `opacity-25` : `hover:opacity-100`}`} />
                        <label>{(page > 1) && page - 1}</label></> }
                    </div>
                    <div className="mx-4 grid films-grid-columns gap-5 xl:gap-3 justify-items-center justify-center">
                        <FilmsGrid movies={movies} handleClickMovieImage={handleClickMovieImage} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded} 
                        countLoadedImages={countLoadedImages} />
                    </div>
                    <div className='max-xl:hidden flex items-center'>
                        { imagesLoaded && <><label>{page + 1}</label>
                        <FontAwesomeIcon onClick={handleClickNextPage} icon={faChevronRight} color='white' size='4x' opacity='60%' className='hover:opacity-100' /></> }
                    </div>
                </div>
                <div className='flex xl:hidden mt-4 justify-center'>
                    { imagesLoaded && 
                        <>
                            <div className='w-full flex items-center mx-8'>
                                <FontAwesomeIcon onClick={handleClickPrevPage} icon={faChevronLeft} color='white' size='4x' opacity='60%' className={`${currentApiPages[0] === 1 ? `opacity-25` : `hover:opacity-100`}`} />
                                <label>{(page > 1) && page - 1}</label>
                            </div>
                            <div className='w-full flex items-center justify-end mx-8'>
                                <label>{page + 1}</label>
                                <FontAwesomeIcon onClick={handleClickNextPage} icon={faChevronRight} color='white' size='4x' opacity='60%' className='hover:opacity-100' />
                            </div>
                        </>   
                    }
                </div>
            </div>
        </div>
    );
}