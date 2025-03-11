"use client"

import { useContext } from "react";
import Media from "../../components/Media";
import { MediaContext } from "../MediaContext";

export default function People() {
    const { people } = useContext(MediaContext);

    return (
        <Media type={'people'} preloadedMovies={[]} preloadedShows={[]} preloadedPeople={people} />
    );
}