import { Fragment, useState } from 'react';
import Image from "next/image";
import Loading from "@/app/ui/loading";
import { MovieData, ProductionCompanies } from "@/types/types";

type Props = {
    movieData: MovieData
}

export default function FilmUI({ movieData }: Props) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <div>
            <div className="flex flex-col items-start">
                <div className="relative w-[100vw] h-[35vh] xl:w-[1300px] xl:h-[731px]">
                    <Image onLoad={() => setIsImageLoaded(true)} className="z-0 movie-img" priority={true} src={`https://image.tmdb.org/t/p/original${movieData?.backdrop_path}`} alt="Backdrop Path Image" layout="fill" />
                </div>
                { isImageLoaded ? 
                    <>
                        <h1 className="xl:mt-[-5rem] xl:w-[1250px] z-10 px-3 xl:pl-8 text-white text-3xl xl:text-6xl font-bold">{movieData?.title && `${movieData?.title} (${movieData?.release_date.substring(0,4)})`}</h1>
                        <div className="w-screen xl:w-2/4 px-3 xl:pl-8">
                            <p className="text-white mt-4 xl:text-lg">{movieData?.overview}</p>
                        </div>
                        <div className="xl:w-full xl:pl-8">
                            {movieData?.production_companies.map((pc: ProductionCompanies) => {
                                return (
                                    pc.logo_path !== null && 
                                    <Fragment key={pc.id}>
                                        <Image className="m-4 inline-block" priority={true} src={`https://image.tmdb.org/t/p/original${pc.logo_path}`} alt="Production Company" width={90} height={90} />
                                    </Fragment>
                                )
                            })}
                        </div>
                    </>
                :
                    <Loading />
                }
            </div>  
        </div>
    )
}