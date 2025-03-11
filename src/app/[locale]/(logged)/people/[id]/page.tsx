"use client";

import { useState, useEffect, Suspense, lazy, useContext } from 'react';
import Loading from '../../../components/ui/Loading';
import { PersonData } from "@/types/types";
import { MediaContext } from "../../../(logged)/MediaContext";
const PersonUI = lazy(() => import('../../../components/PersonUI'));

export default function Movie({ params }: { params: { id: number } }) {
    const { language } = useContext(MediaContext);
    const [personData, setPersonData] = useState<PersonData>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res = await fetch(`https://api.themoviedb.org/3/person/${params.id}?language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
                    }
                });
                
                let data = await res.json();

                setPersonData(data);
            } catch (error) {
                console.error(error)
            }
        }

        fetchData();
    }, [params.id]);

    return (
        <Suspense key={params!.id} fallback={<Loading/>}>
            <PersonUI personData={personData!} />
        </Suspense>
    );
}