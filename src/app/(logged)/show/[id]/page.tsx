"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import Loading from '@/app/components/ui/Loading';
import { ShowData } from "@/types/types";
const MediaUI = lazy(() => import('@/app/components/MediaUI'));

export default function Show({ params }: { params: { id: number } }) {
    const [showData, setShowData] = useState<ShowData>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/tv/${params.id}language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let data = await res.json();

                res = await fetch(`https://api.themoviedb.org/3/tv/${params.id}/videos?language=en-US&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                const video = await res.json();

                for (const v of video.results) {
                    if(v.type === 'Trailer') {
                        data = { ...data, video_id: v.key };
                        break;
                    }
                }

                if(data.video_id === undefined) {
                    data = { ...data, video_id: video.results[0].key }
                }

                setShowData(data);
            } catch (error) {
                console.error(error)
            }
        }

        fetchData();
    }, [params.id]);

    return (
        <Suspense key={params!.id} fallback={<Loading/>}>
            <MediaUI mediaData={showData!} />
        </Suspense>
    );
}