"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { Clapperboard, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Loading from '../components/ui/Loading';
import { Movie, Show, Person } from '@/types/types';

type MediaItem = Movie | Show | Person;
type MediaKind = 'movie' | 'show' | 'person';

type Props = {
    media: Movie[] | Show[] | Person[];
    handleClickMediaImage: (media: MediaItem) => void;
    imagesLoaded: boolean;
    setImagesLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    countLoadedImages: React.MutableRefObject<number>;
    isCarousel?: boolean;
};

const getMediaKind = (item: MediaItem, pathname: string): MediaKind => {
    if (item.media_type === 'person' || /\/people\/?$/.test(pathname)) return 'person';
    if (item.media_type === 'tv' || pathname.includes('/shows')) return 'show';
    return 'movie';
};

const getTitle = (item: MediaItem) => {
    if ('title' in item && item.title) return item.title;
    if ('name' in item && item.name) return item.name;
    return '';
};

const getYear = (item: MediaItem, kind: MediaKind) => {
    if (kind === 'movie' && 'release_date' in item) return item.release_date?.slice(0, 4);
    if (kind === 'show' && 'first_air_date' in item) return item.first_air_date?.slice(0, 4);
    return undefined;
};

const getImagePaths = (item: MediaItem, kind: MediaKind) => {
    if (kind === 'person') {
        return {
            primaryPath: 'profile_path' in item ? item.profile_path : null,
            backdropPath: null,
        };
    }

    return {
        primaryPath: 'poster_path' in item ? item.poster_path : null,
        backdropPath: 'backdrop_path' in item ? item.backdrop_path : null,
    };
};

export default function MediaGrid({
    media,
    handleClickMediaImage,
    imagesLoaded,
    setImagesLoaded,
    countLoadedImages,
}: Props) {
    const pathname = usePathname();
    const t = useTranslations('MediaGrid');
    const imageCount = media.reduce((count, item) => {
        const kind = getMediaKind(item, pathname);
        const { primaryPath, backdropPath } = getImagePaths(item, kind);
        return count + (primaryPath || backdropPath ? 1 : 0);
    }, 0);
    const loadTarget = Math.min(imageCount, 10);

    useEffect(() => {
        if (media.length > 0 && loadTarget === 0) setImagesLoaded(true);
    }, [loadTarget, media.length, setImagesLoaded]);

    const handleImageSettled = () => {
        if (imagesLoaded || loadTarget === 0) return;

        countLoadedImages.current += 1;
        if (countLoadedImages.current >= loadTarget) setImagesLoaded(true);
    };

    return (
        <>
            {media.map((item, index) => {
                const kind = getMediaKind(item, pathname);
                const title = getTitle(item) || t('untitled');
                const year = getYear(item, kind);
                const yearLabel = year || t('unknownYear');
                const kindLabel = t(kind);
                const { primaryPath, backdropPath } = getImagePaths(item, kind);
                const imagePath = primaryPath || backdropPath;
                const usesBackdrop = !primaryPath && Boolean(backdropPath);
                const hasImage = Boolean(imagePath);

                return (
                    <button
                        key={item.id}
                        type="button"
                        title={`${title} · ${yearLabel}`}
                        aria-label={`${title}, ${yearLabel}, ${kindLabel}`}
                        onClick={() => handleClickMediaImage(item)}
                        className={`group relative h-[190px] w-[130px] flex-shrink-0 overflow-hidden rounded-sm border-2 border-blueish-gray bg-slate-800 text-left shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-green-500 focus-visible:-translate-y-0.5 focus-visible:border-nyanza focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nyanza ${
                            imagesLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
                        }`}
                    >
                        {hasImage ? (
                            <Image
                                fill
                                priority={index < 10}
                                sizes="130px"
                                src={`https://image.tmdb.org/t/p/${usesBackdrop ? 'w780' : 'w342'}${imagePath}`}
                                alt=""
                                onLoad={handleImageSettled}
                                onError={handleImageSettled}
                                className="object-cover transition duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                            />
                        ) : (
                            <span aria-hidden="true" className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-700 via-[#263b5d] to-slate-950">
                                <span className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-aero-blue/30 blur-xl" />
                                <span className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-lapis-lazuli/30 blur-xl" />
                                <span className="absolute inset-x-0 top-9 flex justify-center text-nyanza/80">
                                    {kind === 'person' ? <UserRound className="h-14 w-14" /> : <Clapperboard className="h-14 w-14" />}
                                </span>
                            </span>
                        )}

                        {(usesBackdrop || !hasImage) && (
                            <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                        )}

                        <span
                            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-2.5 pb-2.5 pt-8 text-white transition-opacity duration-200 ${
                                usesBackdrop || !hasImage
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                            }`}
                        >
                            <span className="block line-clamp-2 text-sm font-bold leading-4">{title}</span>
                            <span className="mt-1 block text-[11px] font-medium text-slate-300">
                                {yearLabel}{kind !== 'person' ? ` · ${kindLabel}` : ''}
                            </span>
                        </span>
                    </button>
                );
            })}

            {!imagesLoaded && <Loading />}
        </>
    );
}
