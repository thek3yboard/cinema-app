"use client";

import { useState, useEffect, Suspense, lazy } from 'react'; 
import Loading from '@/app/(logged)/loading';
const FilmUI = lazy(() => import('@/app/(logged)/film/[id]/ui/FilmUI'));

type MovieData = {
    id: number,
    title: string,
    overview: string,
    original_title: string,
    backdrop_path: string,
    release_date: string,
    vote_average: number
    production_companies: Array<ProductionCompanies>
}

type ProductionCompanies = {
    id: number,
    logo_path: string,
    name: string,
    origin: string
}

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