"use client";

import { useState, useEffect, Fragment } from 'react';
import Image from "next/image";

type Movie = {
    id: number,
    title: string,
    overview: string,
    poster_path: string
}

export default function Films() {
    const [movies, setMovies] = useState<Movie[]>([]);

    const fetchMovies = () => {
        fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&api_key=${process.env.REACT_APP_TMDB_API_KEY}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${process.env.REACT_APP_TMDB_BEARER_TOKEN}`
            }
        })
        .then(res => { 
            return res.json(); 
        })
        .then(data => { 
            setMovies(data.results);
        })
        .catch(err => console.error(err));
    }

    useEffect(() => {
        fetchMovies();
    }, []);

    return (
        <div className="min-h-full bg-gradient-to-b from-aero-blue to-blueish-gray">
            <div className="p-16 grid grid-cols-6 gap-4 justify-items-center">
                {movies.map((m) => {
                    return (
                        <Fragment key={m.id}>
                            <Image className="border-2 border-blueish-gray" src={`https://image.tmdb.org/t/p/original${m.poster_path}`} alt="Logo" height={100} width={200} />
                        </Fragment>
                    )
                })}
            </div>
        </div>
    );
}