"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import Loading from '../../../components/ui/Loading';
import { ShowData } from "@/types/types";
import { useTranslations } from 'next-intl';
const MediaUI = lazy(() => import('../../../components/MediaUI'));

export default function Show({ params }: { params: { id: number, locale: string  } }) {
    const t = useTranslations('MediaDetails');
    const [showData, setShowData] = useState<ShowData>();
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailsResponse, videosResponse] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/tv/${params.id}?language=${params.locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, { method: "GET", headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}` } }),
                    fetch(`https://api.themoviedb.org/3/tv/${params.id}/videos?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, { method: "GET", headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}` } })
                ]);
                if (!detailsResponse.ok || !videosResponse.ok) throw new Error('TMDB request failed');

                const data = await detailsResponse.json();
                const video = await videosResponse.json();
                const preferredVideo = (video.results ?? []).find((item: { type: string }) => item.type === 'Trailer') ?? video.results?.[0];

                setShowData({ ...data, video_id: preferredVideo?.key ?? '' });
            } catch (error) {
                console.error(error)
                setError(true);
            }
        }

        fetchData();
    }, [params.id, params.locale]);

    if (error) return <p className="p-8 text-center text-white">{t('showLoadError')}</p>;
    if (!showData) return <Loading />;

    return (
        <Suspense key={params.locale} fallback={<Loading/>}>
            <MediaUI mediaData={showData} />
        </Suspense>
    );
}
