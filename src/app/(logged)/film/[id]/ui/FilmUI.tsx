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
        <div className="min-h-full">
            <div className="flex flex-col items-start">
                <Image onLoad={() => setIsImageLoaded(true)} className="z-0 movie-img" src={`https://image.tmdb.org/t/p/original${movieData?.backdrop_path}`} alt="Backdrop Path Image" width={1300} height={800} />
                { isImageLoaded ? 
                    <>
                        <h1 className="mt-[-5rem] w-[1250px] z-20 pl-8 text-white text-6xl font-bold">{movieData?.title && `${movieData?.title} (${movieData?.release_date.substring(0,4)})`}</h1>
                        <div className="w-2/4 pl-8">
                            <p className="text-white mt-4 text-lg">{movieData?.overview}</p>
                        </div>
                        <div className="w-full pl-8">
                            {movieData?.production_companies.map((pc: ProductionCompanies) => {
                                return (
                                    pc.logo_path !== null && 
                                    <Fragment key={pc.id}>
                                        <Image className="m-4 inline-block" src={`https://image.tmdb.org/t/p/original${pc.logo_path}`} alt="Production Company" width={90} height={90} />
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