"use client";

import { useState, useEffect, Suspense, lazy, useContext } from 'react';
import Loading from '../../../components/ui/Loading';
import { Movie, PersonData } from "@/types/types";
import { MediaContext } from "../../../(logged)/MediaContext";
const PersonUI = lazy(() => import('../../../components/PersonUI'));

export default function Person({ params }: { params: { id: number, locale: string } }) {
    const { language } = useContext(MediaContext);
    const [personData, setPersonData] = useState<PersonData>();
    const [personWork, setPersonWork] = useState<Movie[]>();

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

                let work = null;

                if(personDetailsData.known_for_department === 'Directing') {
                    work = personWorkData.crew.filter((m) => m.poster_path !== null && m.vote_count >= 100);

                    work = work.filter(obra => 
                        !(obra.hasOwnProperty('name') && (obra.name.includes('Show') || obra.name.includes('Live'))) 
                        && !(obra.media_type === "tv" && obra.hasOwnProperty('character') && obra.character.includes("Self"))
                        /* || (obra.media_type === "movie" && obra.character.includes("Self")) */
                    );
                } else {
                    work = personWorkData.cast.filter((m) => m.poster_path !== null && m.vote_count >= 100);

                    work = work.filter(obra => 
                        !(obra.hasOwnProperty('name') && (obra.name.includes('Show') || obra.name.includes('Live'))) 
                        && !(obra.media_type === "tv" && obra.hasOwnProperty('character') && obra.character.includes("Self"))
                        /* || (obra.media_type === "movie" && obra.character.includes("Self")) */
                    );
                }

                work = Array.from(new Set(work.map(item => item.id)))
                .map(id => work.find(item => item.id === id));
            
                work = work.sort((a: any, b: any) => {
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

                //personWorkData.cast = work;

                setPersonData(personDetailsData);
                setPersonWork(work);
            } catch (error) {
                console.error(error)
            }
        }

        fetchData();
    }, [params.locale]);

    return (
        <Suspense key={params.locale} fallback={<Loading/>}>
            <PersonUI personData={personData!} personWork={personWork!} />
        </Suspense>
    );
}