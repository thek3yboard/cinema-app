"use client";

import { useState, useEffect, Suspense, lazy, useContext } from 'react';
import Loading from '../../../components/ui/Loading';
import { Movie, PersonData } from "@/types/types";
import { MediaContext } from "../../../(logged)/MediaContext";
const PersonUI = lazy(() => import('../../../components/PersonUI'));

export default function Person({ params }: { params: { id: number } }) {
    const { language } = useContext(MediaContext);
    const [personData, setPersonData] = useState<PersonData>();
    const [personWork, setPersonWork] = useState<Movie[]>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let personResponse = await fetch(`https://api.themoviedb.org/3/person/${params.id}?language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let personResponseData = await personResponse.json();

                let personWorkResponse = await fetch(`https://api.themoviedb.org/3/person/${params.id}/combined_credits?language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let personWorkData = await personWorkResponse.json();

                let cast = personWorkData.cast.filter((m) => (m.poster_path !== null && m.vote_count >= 100));

                cast = cast.sort((a: any, b: any) => {
                    const getDate = (item: any) => {
                        if (item.media_type === 'movie') {
                            return new Date(item.release_date).getTime();
                        }
                        return new Date(item.first_air_date).getTime();
                    };
                
                    const aDate = getDate(a);
                    const bDate = getDate(b);
                
                    return aDate - bDate;
                });

                personWorkData.cast = cast;

                setPersonData(personResponseData);
                setPersonWork(personWorkData.cast);
            } catch (error) {
                console.error(error)
            }
        }

        fetchData();
    }, [params.id]);

    return (
        <Suspense key={params!.id} fallback={<Loading/>}>
            <PersonUI personData={personData!} personWork={personWork!} />
        </Suspense>
    );
}