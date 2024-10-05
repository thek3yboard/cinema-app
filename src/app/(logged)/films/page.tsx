"use client";

import { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { FilmsContext } from "@/app/(logged)/FilmsContext";
import Loading from "@/app/ui/loading";
import { Movie } from "@/types/types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
const FilmsGrid = lazy(() => import('@/app/(logged)/films/ui/FilmsGrid'));

export default function Films() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { page, currentApiPages, sort, handleClickPrevPage, handleClickNextPage } = useContext(FilmsContext);
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);

        const fetchFirstPage = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/movie/${sort.key}?language=en-US&page=${currentApiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
                let res = await fetch(`https://api.themoviedb.org/3/movie/${sort.key}?language=en-US&page=${currentApiPages[1]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
            setIsLoading(false);
        };
        
        fetchBoth();
    }, [currentApiPages, sort]);

    const handleClickMovieImage = (movie: Movie): void => {
        router.push(`/film/${movie.id}`);
    }

    return (
        <div className="flex items-center justify-center">
            { isLoading ?
                <Loading />
            :
                <>
                    <div className='hidden md:flex md:grow md:justify-end md:items-center'>
                        <FontAwesomeIcon onClick={handleClickPrevPage} icon={faChevronLeft} color='white' size='4x' opacity='60%' className={`${currentApiPages[0] === 1 ? `opacity-25` : `hover:opacity-100`}`} />
                        <label>{(page > 1) && page - 1}</label>
                    </div>
                    <div className="lg:px-8 pt-8 grid films-grid-columns gap-5 xl:gap-3 justify-items-center justify-center">
                        <FilmsGrid movies={movies} handleClickMovieImage={handleClickMovieImage} />
                        <div className='md:hidden mb-5 flex items-center'>
                            <FontAwesomeIcon onClick={handleClickPrevPage} icon={faChevronLeft} color='white' size='4x' opacity='60%' className={`${currentApiPages[0] === 1 ? `opacity-25` : `hover:opacity-100`}`} />
                            <label>{(page > 1) && page - 1}</label>
                        </div>
                        <div className='md:hidden mb-5 flex items-center'>
                            <label>{page + 1}</label>
                            <FontAwesomeIcon onClick={handleClickNextPage} icon={faChevronRight} color='white' size='4x' opacity='60%' className='hover:opacity-100' />
                        </div>
                    </div>
                    <div className='hidden md:flex md:grow md:justify-start md:items-center'>
                        <label>{page + 1}</label>
                        <FontAwesomeIcon onClick={handleClickNextPage} icon={faChevronRight} color='white' size='4x' opacity='60%' className='hover:opacity-100' />
                    </div>
                </>
            }
        </div>
    );
}