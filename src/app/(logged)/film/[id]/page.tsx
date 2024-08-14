"use client";

import { useState, useEffect } from 'react'; 
import Image from "next/image";

export default function Film({ params }: { params: { id: number } }) {
    const [movieData, setMovieData] = useState([]);

    const fetchMovieData = () => {
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
    }

    useEffect(() => {
        fetchMovieData();
    }, [fetchMovieData]);

    return (
        <div className="h-full bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray">
            <div className="flex flex-col items-start ">
                <Image className="z-0 movie-img" src={`https://image.tmdb.org/t/p/original${movieData.backdrop_path}`} alt="Backdrop Path Image" width={1300} height={800} />
                <h1 className="mt-[-5rem] z-20 pl-8 text-white text-6xl font-bold">{movieData.title}</h1>

            </div>
        </div>
    );
}