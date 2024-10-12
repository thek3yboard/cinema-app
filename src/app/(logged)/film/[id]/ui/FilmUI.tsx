import { Fragment, useState, useEffect } from 'react';
import Image from "next/image";
import Loading from "@/app/ui/loading";
import { MovieData, ProductionCompanies } from "@/types/types";
import LiteYouTubeEmbed from "react-lite-youtube-embed"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"

type Props = {
    movieData: MovieData
}

export default function FilmUI({ movieData }: Props) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <div className='flex'>
            <div className='flex flex-row'>
                <div className="flex flex-col items-start">
                    <div className="relative w-[100vw] h-[215px] sm:h-[360px] md:h-[450px] lg:h-[575px] xl:w-[1000px] xl:h-[560px] 2xl:w-[1300px] 2xl:h-[731px]">
                        <Image onLoad={() => setIsImageLoaded(true)} className={`z-0 movie-img ${isImageLoaded === false && `hidden` }`} priority={true} src={`${movieData?.backdrop_path !== null ? `https://image.tmdb.org/t/p/original${movieData?.backdrop_path}` : `https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg`}`} alt="Backdrop Image" layout="fill" />
                    </div>
                    { isImageLoaded ? 
                        <>
                            <h1 className="mt-[-2rem] md:mt-[-3rem] xl:mt-[-5rem] xl:w-[1000px] 2xl:w-[1250px] z-10 px-3 xl:pl-8 text-white text-3xl sm:text-5xl 2xl:text-6xl font-bold">{movieData?.title && `${movieData?.title} (${movieData?.release_date.substring(0,4)})`}</h1>
                            <div className="w-screen xl:w-[1000px] 2xl:w-[1250px] px-3 xl:pl-8">
                                <p className="text-white mt-4 sm:text-lg">{movieData!.overview}</p>
                            </div>
                            <div className='w-full p-5 lg:hidden md:w-2/3'>
                                <div className='border-3 border-blueish-gray'>
                                    <LiteYouTubeEmbed
                                        aspectHeight={9}
                                        aspectWidth={16}
                                        id={`${movieData?.video_id}`}
                                        title="Trailer"
                                    />
                                </div>
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
            <div className='flex-auto m-6 max-xl:hidden'>
                { isImageLoaded &&
                    <div className='border-5 border-blueish-gray'>
                        <LiteYouTubeEmbed
                            aspectHeight={9}
                            aspectWidth={16}
                            id={`${movieData?.video_id}`}
                            title="Trailer"
                        />
                    </div>
                }
            </div>
        </div>
    )
}