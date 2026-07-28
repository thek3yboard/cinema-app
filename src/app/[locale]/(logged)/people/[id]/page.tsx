"use client";

import { useState, useEffect, Suspense, lazy, useContext } from 'react';
import Loading from '../../../components/ui/Loading';
import { Movie, PersonData } from "@/types/types";
import { MediaContext } from "../../../(logged)/MediaContext";
const PersonUI = lazy(() => import('../../../components/PersonUI'));

type PersonWork = Movie & {
    name?: string;
    character?: string;
    release_date?: string;
    first_air_date?: string;
};

export default function Person({ params }: { params: { id: number, locale: string } }) {
    const { language } = useContext(MediaContext);
    const [personData, setPersonData] = useState<PersonData>();
    const [personWork, setPersonWork] = useState<PersonWork[]>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let personDataResponse = await fetch(`https://api.themoviedb.org/3/person/${params.id}?language=${params.locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let personDetailsData = await personDataResponse.json();

                let personWorkResponse = await fetch(`https://api.themoviedb.org/3/person/${params.id}/combined_credits?language=${params.locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let personWorkData = await personWorkResponse.json();

                const credits = personWorkData as { crew: PersonWork[]; cast: PersonWork[] };
                let work: PersonWork[] = [];

                if(personDetailsData.known_for_department === 'Directing') {
                    work = credits.crew.filter((m) => m.poster_path !== null && m.vote_count >= 100);

                    work = work.filter(obra => 
                        !((obra.name ?? '').includes('Show') || (obra.name ?? '').includes('Live'))
                        && !(obra.media_type === "tv" && (obra.character ?? '').includes("Self"))
                        /* || (obra.media_type === "movie" && obra.character.includes("Self")) */
                    );
                } else {
                    work = credits.cast.filter((m) => m.poster_path !== null && m.vote_count >= 100);

                    work = work.filter(obra => 
                        !((obra.name ?? '').includes('Show') || (obra.name ?? '').includes('Live'))
                        && !(obra.media_type === "tv" && (obra.character ?? '').includes("Self"))
                        /* || (obra.media_type === "movie" && obra.character.includes("Self")) */
                    );
                }

                work = Array.from(new Map(work.map(item => [item.id, item])).values());
            
                work = work.sort((a, b) => {
                    const getDate = (item: PersonWork) => {
                        if (item.media_type === 'movie') {
                            return new Date(item.release_date ?? 0).getTime();
                        }
                        return new Date(item.first_air_date ?? 0).getTime();
                    };
                
                    const aDate = getDate(a);
                    const bDate = getDate(b);
                
                    return aDate - bDate;
                });

                //personWorkData.cast = work;

                setPersonData(personDetailsData);
                setPersonWork(work);
            } catch (error) {
                console.error(error)
            }
        }

        fetchData();
    }, [params.id, params.locale]);

    return (
        <Suspense key={params.locale} fallback={<Loading/>}>
            {personData && personWork ? <PersonUI personData={personData} personWork={personWork} /> : <Loading />}
        </Suspense>
    );
}
