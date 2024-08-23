"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/(logged)/loading';
import { Movie } from "@/types/types";
const FilmsGrid = lazy(() => import('@/app/(logged)/films/ui/FilmsGrid'));

export default function Films() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
            }
        })
        .then(res => { 
            return res.json(); 
        })
        .then(data => { 
            setMovies(data.results);
        })
        .catch(err => console.error(err));
    }, []);

    const handleClickMovieImage = (movie: Movie): void => {
        router.push(`/film/${movie.id}`);
    }

    return (
        <div className="min-h-full">
            <div className="p-16 grid grid-cols-12 gap-4 justify-items-center">
                <Suspense fallback={<Loading />}>
                    <FilmsGrid movies={movies} handleClickMovieImage={handleClickMovieImage} />
                </Suspense>
            </div>
        </div>
    );
}