"use client"

import { useContext } from "react";
import Media from "../../components/Media";
import { MediaContext } from "../MediaContext";

export default function Shows() {
    const { shows } = useContext(MediaContext);

    return (
        <Media type={'shows'} preloadedMovies={[]} preloadedShows={shows} preloadedPeople={[]} />
    );
}