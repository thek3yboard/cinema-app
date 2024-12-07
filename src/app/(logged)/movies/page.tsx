"use client"

import { useContext } from "react";
import Media from "@/app/components/Media";
import { MediaContext } from "../MediaContext";

export default function Movies() {
    const { movies } = useContext(MediaContext);

    return (
        <Media type={'movies'} preloadedMovies={movies} preloadedShows={[]} />
    );
}