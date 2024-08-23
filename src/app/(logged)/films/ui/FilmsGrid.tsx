import { Fragment } from "react";
import Image from "next/image";
import { Movie } from "@/types/types";

type Props = {
    movies: Movie[],
    handleClickMovieImage: (movie: Movie) => void;
}

export default function FilmsGrid({ movies, handleClickMovieImage }: Props) {
    return (
        <>
            {movies.map((m) => {
                return (
                    <Fragment key={m.id}>
                        <div onClick={() => handleClickMovieImage(m)}>
                            <Image className="border-2 border-blueish-gray hover:border-[3px] hover:border-green-500" src={`https://image.tmdb.org/t/p/original${m.poster_path}`} alt="Logo" height={100} width={200} />
                        </div>
                    </Fragment>
                )
            })}
        </>
    )
}