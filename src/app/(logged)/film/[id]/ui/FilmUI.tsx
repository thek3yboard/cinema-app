import { Fragment, useState, useEffect } from 'react';
import Image from "next/image";
import Loading from "@/app/ui/loading";
import StarRating from "@/app/ui/StarRating";
import { MovieData, ProductionCompanies } from "@/types/types";
import LiteYouTubeEmbed from "react-lite-youtube-embed"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"
import { Heart, List, Eye, Star } from 'lucide-react';

type Props = {
    movieData: MovieData
}

export default function FilmUI({ movieData }: Props) {
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [inWatchlist, setInWatchlist] = useState(false)
    const [isWatched, setIsWatched] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [userRating, setUserRating] = useState(0)

    useEffect(() => {
        const storedWatchlist = localStorage.getItem(`watchlist_${movieData?.id}`)
        const storedWatched = localStorage.getItem(`watched_${movieData?.id}`)
        const storedFavorite = localStorage.getItem(`favorite_${movieData?.id}`)
        const storedRating = localStorage.getItem(`rating_${movieData?.id}`)

        setInWatchlist(storedWatchlist === 'true')
        setIsWatched(storedWatched === 'true')
        setIsFavorite(storedFavorite === 'true')
        setUserRating(storedRating ? parseInt(storedRating) : 0)
    }, [movieData?.id])

    const toggleWatchlist = () => {
        const newState = !inWatchlist
        setInWatchlist(newState)
        localStorage.setItem(`watchlist_${movieData?.id}`, newState.toString())
    }

    const toggleWatched = () => {
        const newState = !isWatched
        setIsWatched(newState)
        localStorage.setItem(`watched_${movieData?.id}`, newState.toString())
    }

    const toggleFavorite = () => {
        const newState = !isFavorite
        setIsFavorite(newState)
        localStorage.setItem(`favorite_${movieData?.id}`, newState.toString())
    }

    const handleRating = (rating: number) => {
        setUserRating(rating)
        localStorage.setItem(`rating_${movieData?.id}`, rating.toString())
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-row justify-center'>
                <div className="flex flex-col items-center">
                    <div className="relative w-[100vw] h-[215px] sm:h-[360px] md:h-[450px] lg:h-[575px] xl:w-[1000px] xl:h-[560px] 2xl:w-[1300px] 2xl:h-[731px]">
                        <Image 
                            onLoad={() => setIsImageLoaded(true)}
                            className={`z-0 movie-img ${isImageLoaded === false && `hidden` }`}
                            priority={true}
                            src={`${movieData?.backdrop_path !== null ? `https://image.tmdb.org/t/p/original${movieData?.backdrop_path}` : `https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg`}`}
                            alt="Backdrop Image"
                            layout="fill" 
                        />
                    </div>
                    { isImageLoaded ? 
                        <>
                            <h1 className="mt-[-2rem] md:mt-[-3rem] xl:mt-[-5rem] xl:w-[1000px] 2xl:w-[1250px] z-10 px-3 xl:pl-8 text-white text-3xl sm:text-5xl 2xl:text-6xl font-bold">{movieData?.title && `${movieData?.title} (${movieData?.release_date.substring(0,4)})`} {/* <StarRating rating={movieData?.vote_average} maxRating={10} /> */}</h1>
                            <div className="w-screen xl:w-[1000px] 2xl:w-[1250px] px-3 xl:pl-8">
                                <div className='mt-4 flex justify-between items-center'>
                                    <StarRating rating={movieData?.vote_average} maxRating={10} />
                                    <div className="flex items-center justify-end gap-4">
                                        <div className='w-fit flex items-center gap-4 bg-slate-500 p-2 rounded-md'>
                                            <p className="text-sm font-medium text-white">Your Rating:</p>
                                            <StarRating rating={userRating} maxRating={10} onChange={handleRating} />
                                            <div className="relative group">
                                                <button 
                                                className={`p-2 rounded-full ${inWatchlist ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                onClick={toggleWatchlist}
                                                aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                                                >
                                                <List className="w-5 h-5" />
                                                </button>
                                                <span className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                                                </span>
                                            </div>
                                            <div className="relative group">
                                                <button 
                                                className={`p-2 rounded-full ${isWatched ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                onClick={toggleWatched}
                                                aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
                                                >
                                                <Eye className="w-5 h-5" />
                                                </button>
                                                <span className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {isWatched ? "Mark as unwatched" : "Mark as watched"}
                                                </span>
                                            </div>
                                            <div className="relative group">
                                                <button 
                                                className={`p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                onClick={toggleFavorite}
                                                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                                                </button>
                                                <span className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-white mt-2 sm:text-lg">{movieData!.overview}</p>
                            </div>
                            <div className='w-full p-5 flex justify-evenly'>
                                <div className='w-3/4'>
                                    <div className='border-3 border-blueish-gray'>
                                        <LiteYouTubeEmbed
                                            aspectHeight={9}
                                            aspectWidth={16}
                                            id={movieData?.video_id ?? ''}
                                            title="Trailer"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center w-fit">
                                    {movieData?.production_companies.map((pc: ProductionCompanies) => {
                                        return (
                                            pc.logo_path !== null && 
                                            <Fragment key={pc.id}>
                                                <Image className="m-4 inline-block" priority={true} src={`https://image.tmdb.org/t/p/original${pc.logo_path}`} alt="Production Company" width={90} height={90} />
                                            </Fragment>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    :
                        <Loading />
                    }
                </div>
            </div>
        </div>
    )
}