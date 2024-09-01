"use client";

import { useState, useEffect, Suspense, lazy } from 'react'; 
import Loading from '@/app/ui/loading';
import { MovieData } from "@/types/types";
const FilmUI = lazy(() => import('@/app/(logged)/film/[id]/ui/FilmUI'));

export default function Film({ params }: { params: { id: number } }) {
    const [movieData, setMovieData] = useState<MovieData>();

    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/movie/${params.id}language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
            }
        })
        .then(res => { 
            return res.json(); 
        })
        .then(data => { 
            setMovieData(data);
        })
        .catch(err => console.error(err));
    }, [params.id]);

    return (
        <Suspense key={params?.id} fallback={<Loading/>}>
            <FilmUI movieData={movieData!} />
        </Suspense>
    );
}