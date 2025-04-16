"use client";

import { useState, useEffect, Suspense, lazy, useContext } from 'react';
import Loading from '../../../components/ui/Loading';
import { ShowData } from "@/types/types";
import { MediaContext } from "../../../(logged)/MediaContext";
const MediaUI = lazy(() => import('../../../components/MediaUI'));

export default function Show({ params }: { params: { id: number, locale: string  } }) {
    const { language } = useContext(MediaContext);
    const [showData, setShowData] = useState<ShowData>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/tv/${params.id}?language=${params.locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
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
    }, [params.locale]);

    return (
        <Suspense key={params.locale} fallback={<Loading/>}>
            <MediaUI mediaData={showData!} />
        </Suspense>
    );
}