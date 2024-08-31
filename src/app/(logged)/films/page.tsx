"use client";

import { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { FilmsContext } from "@/app/(logged)/FilmsContext";
import Loading from "@/app/ui/loading";
import { Movie } from "@/types/types";
const FilmsGrid = lazy(() => import('@/app/(logged)/films/ui/FilmsGrid'));

export default function Films() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const { currentApiPages } = useContext(FilmsContext);
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

    return (
        <div>
            <div className="lg:px-8 pt-4 grid films-grid-columns gap-5 xl:gap-3 justify-items-center justify-center">
                <Suspense key={currentApiPages[0]} fallback={<Loading />}>
                    <FilmsGrid movies={movies} handleClickMovieImage={handleClickMovieImage} />
                </Suspense>
            </div>
        </div>
    );
}