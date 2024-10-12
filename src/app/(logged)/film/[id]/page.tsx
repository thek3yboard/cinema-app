"use client";

import { useState, useEffect, Suspense, lazy } from 'react'; 
import Loading from '@/app/ui/Loading';
import { MovieData } from "@/types/types";
const FilmUI = lazy(() => import('@/app/(logged)/film/[id]/ui/FilmUI'));

export default function Film({ params }: { params: { id: number } }) {
    const [movieData, setMovieData] = useState<MovieData>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/movie/${params.id}language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let data = await res.json();

                res = await fetch(`https://api.themoviedb.org/3/movie/${params.id}/videos?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                const video = await res.json();

                for (const v of video.results) {
                    if(v.type === 'Trailer') {
                        data = { ...data, video_id: v.key };
                    }
                }

                setMovieData(data);
            } catch (error) {
                console.error(error)
            }
        }

        fetchData();
    }, [params.id]);

    return (
        <Suspense key={params!.id} fallback={<Loading/>}>
            <FilmUI movieData={movieData!} />
        </Suspense>
    );
}