"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/(logged)/loading';
import { Movie } from "@/types/types";
const FilmsGrid = lazy(() => import('@/app/(logged)/films/ui/FilmsGrid'));

export default function Films() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentApiPages, setCurrentApiPages] = useState([1,2]);
    const [page, setPage] = useState(1);
    const router = useRouter();

    useEffect(() => {
        const fetchFirstPage = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${currentApiPages[0]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
                let res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${currentApiPages[1]}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
    }, [currentApiPages]);

    const handleClickMovieImage = (movie: Movie): void => {
        router.push(`/film/${movie.id}`);
    }

    const handleClickPrevPage = () => {
        setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
        setPage(p => p - 1);
    }

    const handleClickNextPage = () => {
        setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
        setPage(p => p + 1);
    }

    return (
        <div className="min-h-full">
            <div className=" px-8 pt-4 grid grid-columns-10-135px gap-3 justify-items-center justify-center">
                <Suspense key={currentApiPages[0]} fallback={<Loading />}>
                    <FilmsGrid movies={movies} handleClickMovieImage={handleClickMovieImage} />
                </Suspense>
            </div>
            <div className="absolute bottom-8 left-1/2 translate-x-[-4em] flex mt-2 justify-center items-center">
                <button disabled={currentApiPages[0] === 1} onClick={handleClickPrevPage} className="disabled:opacity-25 active:translate-y-[2px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-arrow-left" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="#e4fde1" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18" />
                        <path d="M8 12l4 4" />
                        <path d="M8 12h8" />
                        <path d="M12 8l-4 4" />
                    </svg>
                </button>
                <p className="text-white mx-2">Page {page}</p>
                <button onClick={handleClickNextPage} className="active:translate-y-[2px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-arrow-right" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="#e4fde1" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" />
                        <path d="M16 12l-4 -4" />
                        <path d="M16 12h-8" />
                        <path d="M12 16l4 -4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}