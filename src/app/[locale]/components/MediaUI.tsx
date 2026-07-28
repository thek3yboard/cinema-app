import { Fragment, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NextImage from "next/image";
import Loading from "../components/ui/Loading";
import StarRating from "../components/ui/StarRating";
import { MovieData, ShowData, ProductionCompanies } from "@/types/types";
import LiteYouTubeEmbed from "react-lite-youtube-embed"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"
import { Heart, List, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

type Props = {
    mediaData?: MovieData | ShowData
}

type UserMediaState = {
    in_watchlist: boolean;
    is_watched: boolean;
    is_favorite: boolean;
    rating: number;
};

export default function MediaUI({ mediaData }: Props) {
    const t = useTranslations('MediaUI');
    const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false)
    const [inWatchlist, setInWatchlist] = useState<boolean>(false)
    const [isWatched, setIsWatched] = useState<boolean>(false)
    const [isFavorite, setIsFavorite] = useState<boolean>(false)
    const [userRating, setUserRating] = useState<number>(0)
    const pathname = usePathname();
    const [thumbnailHeight, setThumbnailHeight] = useState<number>(0);
    const { user } = useAuth();
    const mediaType = pathname.includes('/movies') ? 'movie' : 'tv';

    const checkThumbnail = async () => {
        const img = new Image();
        img.src = `https://img.youtube.com/vi/${mediaData?.video_id}/maxresdefault.jpg`;
    
        img.onload = () => {
            setThumbnailHeight(img.height);
        };
    };

    useEffect(() => {
        if (!mediaData?.video_id) return;
        checkThumbnail();
    }, [mediaData?.video_id]);

    useEffect(() => {
        if (!user || !mediaData?.id) {
            setInWatchlist(false);
            setIsWatched(false);
            setIsFavorite(false);
            setUserRating(0);
            return;
        }

        let active = true;
        createClient().from('user_media')
            .select('in_watchlist, is_watched, is_favorite, rating')
            .eq('user_id', user.id)
            .eq('media_type', mediaType)
            .eq('media_id', mediaData.id)
            .maybeSingle()
            .then(({ data, error }: { data: UserMediaState | null; error: { message: string } | null }) => {
                if (!active || error) return;
                setInWatchlist(data?.in_watchlist ?? false);
                setIsWatched(data?.is_watched ?? false);
                setIsFavorite(data?.is_favorite ?? false);
                setUserRating(Number(data?.rating ?? 0));
            });

        return () => { active = false; };
    }, [mediaData?.id, mediaType, user]);

    const persistUserMedia = async (changes: Record<string, boolean | number>) => {
        if (!user || !mediaData?.id) return;
        const title = 'title' in mediaData ? mediaData.title : mediaData.name;
        const { error } = await createClient().from('user_media').upsert({
            user_id: user.id,
            media_type: mediaType,
            media_id: mediaData.id,
            in_watchlist: inWatchlist,
            is_watched: isWatched,
            is_favorite: isFavorite,
            rating: userRating,
            title,
            poster_path: mediaData.poster_path,
            ...changes
        }, { onConflict: 'user_id,media_type,media_id' });

        if (error) toast.error(t('saveError'));
    };

    const toggleWatchlist = () => {
        const newState = !inWatchlist
        setInWatchlist(newState)
        persistUserMedia({ in_watchlist: newState });
    }

    const toggleWatched = () => {
        const newState = !isWatched
        setIsWatched(newState)
        persistUserMedia({ is_watched: newState });
    }

    const toggleFavorite = () => {
        const newState = !isFavorite
        setIsFavorite(newState)
        persistUserMedia({ is_favorite: newState });
    }

    const handleRating = (rating: number) => {
        setUserRating(rating)
        persistUserMedia({ rating });
    }

    if (!mediaData) return <Loading />;

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-row justify-center'>
                <div className="flex flex-col lg:items-center">
                    <div className="relative w-[100vw] h-[215px] sm:h-[360px] md:h-[450px] lg:h-[575px] xl:w-[1000px] xl:h-[560px] 2xl:w-[1300px] 2xl:h-[731px]">
                        <NextImage 
                            onLoad={() => setIsImageLoaded(true)}
                            className={`z-0 media-img ${isImageLoaded === false && `hidden` }`}
                            priority={true}
                            src={`${mediaData?.backdrop_path !== null ? `https://image.tmdb.org/t/p/original${mediaData?.backdrop_path}` : `https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg`}`}
                            alt="Backdrop Image"
                            layout="fill" 
                        />
                    </div>
                    { isImageLoaded ? 
                        <>
                            { pathname.includes('/movies') && ('title' in mediaData && 'release_date' in mediaData) ?
                                <h1 className="mt-[-2rem] md:mt-[-3rem] xl:mt-[-5rem] xl:w-[1000px] 2xl:w-[1250px] z-10 px-3 xl:pl-8 text-white text-3xl sm:text-5xl 2xl:text-6xl font-bold">{mediaData?.title && `${mediaData?.title} (${mediaData?.release_date.substring(0,4)})`}</h1>
                            : pathname.includes('/shows') && ('name' in mediaData && 'first_air_date' in mediaData) &&
                                <h1 className="mt-[-2rem] md:mt-[-3rem] xl:mt-[-5rem] xl:w-[1000px] 2xl:w-[1250px] z-10 px-3 xl:pl-8 text-white text-3xl sm:text-5xl 2xl:text-6xl font-bold">{mediaData?.name && `${mediaData?.name} (${mediaData?.first_air_date.substring(0,4)})`}</h1>
                            }
                            <div className="w-screen xl:w-[1000px] 2xl:w-[1250px] px-3 xl:pl-8">
                                <div className='mt-4 flex max-md:flex-col md:justify-between md:items-center'>
                                    <StarRating rating={mediaData?.vote_average} maxRating={10} />
                                    {user && <div className="flex items-center justify-end max-md:justify-start md:gap-4 max-md:w-full">
                                        <div className='w-fit flex items-center md:gap-4 bg-slate-500 p-2 rounded-md max-md:mt-4'>
                                            <p className="text-sm w-min max-md:hidden font-medium text-white">{t('yourRating')}:</p>
                                            <StarRating rating={userRating} maxRating={10} onChange={handleRating} />
                                            <div className="relative group max-md:ml-2 max-md:mr-2">
                                                <button 
                                                className={`p-2 rounded-full ${inWatchlist ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                onClick={toggleWatchlist}
                                                aria-label={inWatchlist ? `${t('removeFromWatchlist')}` : `${t('addToWatchlist')}`}
                                                >
                                                <List className="w-5 h-5" />
                                                </button>
                                                <span className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {inWatchlist ? `${t('removeFromWatchlist')}` : `${t('addToWatchlist')}`}
                                                </span>
                                            </div>
                                            <div className="relative group max-md:mr-2">
                                                <button 
                                                className={`p-2 rounded-full ${isWatched ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                onClick={toggleWatched}
                                                aria-label={isWatched ? `${t('markAsUnwatched')}` : `${t('markAsWatched')}`}
                                                >
                                                <Eye className="w-5 h-5" />
                                                </button>
                                                <span className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {isWatched ? `${t('markAsUnwatched')}` : `${t('markAsWatched')}`}
                                                </span>
                                            </div>
                                            <div className="relative group max-md:mr-2">
                                                <button 
                                                className={`p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                onClick={toggleFavorite}
                                                aria-label={isFavorite ? `${t('removeFromFavorites')}` : `${t('addToFavorites')}`}
                                                >
                                                <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                                                </button>
                                                <span className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {isFavorite ? `${t('removeFromFavorites')}` : `${t('addToFavorites')}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>}
                                </div>
                                <p className="text-white mt-2 max-md:mt-4 sm:text-lg">{mediaData!.overview}</p>
                            </div>
                            <div className='w-full p-5 flex justify-evenly'>
                                    <div className='w-3/4 max-md:w-full'>
                                    {mediaData.video_id ? <div className='border-3 border-blueish-gray'>
                                        <LiteYouTubeEmbed
                                            aspectHeight={9}
                                            aspectWidth={16}
                                            id={mediaData?.video_id ?? ''}
                                            title="Trailer"
                                            poster={thumbnailHeight <= 90 ? 'hqdefault' : 'maxresdefault'}
                                        />
                                    </div> : <p className="rounded-md bg-slate-700 p-5 text-center text-white">{t('trailerUnavailable')}</p>}
                                </div>
                                <div className="flex flex-col max-md:hidden justify-center w-fit">
                                    {mediaData?.production_companies.map((pc: ProductionCompanies) => {
                                        return (
                                            pc.logo_path !== null && 
                                            <Fragment key={pc.id}>
                                                <NextImage className="m-4 inline-block" priority={true} src={`https://image.tmdb.org/t/p/original${pc.logo_path}`} alt="Production Company" width={90} height={90} />
                                            </Fragment>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="md:hidden px-5 flex flex-wrap justify-center items-center">
                                {mediaData?.production_companies.map((pc: ProductionCompanies) => {
                                    return (
                                        pc.logo_path !== null && 
                                        <Fragment key={pc.id}>
                                            <NextImage className="m-4 inline-block h-fit" priority={true} src={`https://image.tmdb.org/t/p/original${pc.logo_path}`} alt="Production Company" width={70} height={70} />
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
        </div>
    )
}
