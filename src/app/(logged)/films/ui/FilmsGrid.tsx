import { Fragment, useState, useRef } from "react";
import Image from "next/image";
import Loading from "@/app/ui/loading";
import { Movie } from "@/types/types";

type Props = {
    movies: Movie[],
    handleClickMovieImage: (movie: Movie) => void,
    imagesLoaded: boolean,
    setImagesLoaded: React.Dispatch<React.SetStateAction<boolean>>,
    countLoadedImages: React.MutableRefObject<number>
}

export default function FilmsGrid({ movies, handleClickMovieImage, imagesLoaded, setImagesLoaded, countLoadedImages }: Props) {
    const handleSumLoadedImages = () => {
        setTimeout(() => {
            console.log(movies[countLoadedImages.current]);
            countLoadedImages.current++;
            console.log(countLoadedImages.current);
            
            if(countLoadedImages.current === 10) {
                setImagesLoaded(true);
            }
        }, 2000);
    }

    return (
        <>
            {movies.map((m) => {
                return (
                    <Fragment key={m.id}>
                        <div className='flex items-center' onClick={() => handleClickMovieImage(m)}>
                            <Image onLoad={() => handleSumLoadedImages()} className={`h-[190px] border-2 border-blueish-gray hover:border-[3px] hover:border-green-500 ${imagesLoaded === false && `hidden` }`} priority={true} src={`${m.poster_path !== null ? `https://image.tmdb.org/t/p/original${m.poster_path}` : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg' }`} alt="Movie Poster" height={190} width={130} />
                        </div>
                    </Fragment>
                )
            })}
            { !imagesLoaded && <Loading /> }
        </>
    )
}