import { Fragment, useState, useRef } from "react";
import Image from "next/image";
import Loading from "@/app/ui/loading";
import { Movie } from "@/types/types";

type Props = {
    movies: Movie[],
    handleClickMovieImage: (movie: Movie) => void;
}

export default function FilmsGrid({ movies, handleClickMovieImage }: Props) {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const countLoadedImages = useRef(0);

    const handleSumLoadedImages = () => {
        setTimeout(() => {
            countLoadedImages.current ++;

            if(countLoadedImages.current === 40) {
                setImagesLoaded(true);
            }
        }, 800);
    }

    return (
        <>
            {movies.map((m) => {
                return (
                    <Fragment key={m.id}>
                        <div onClick={() => handleClickMovieImage(m)}>
                            <Image onLoad={() => handleSumLoadedImages()} className={`border-2 border-blueish-gray hover:border-[3px] hover:border-green-500 ${imagesLoaded === false && `hidden` }`} priority={true} src={`https://image.tmdb.org/t/p/original${m.poster_path}`} alt="Logo" height={200} width={130} />
                        </div>
                    </Fragment>
                )
            })}
            { !imagesLoaded && <Loading /> }
        </>
    )
}