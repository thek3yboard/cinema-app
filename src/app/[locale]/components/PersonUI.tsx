import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import NextImage from "next/image";
import { PersonData, Movie } from "@/types/types";
import Media from "../components/Media";
import Loading from "../components/ui/Loading";
import ExpandableText from '../components/ui/ExpandableText';

type Props = {
    personData: PersonData
    personWork: Movie[]
}

export default function PersonUI({ personData, personWork }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [initialHeight, setInitialHeight] = useState(0);
    const biographyDivRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (biographyDivRef.current) {
            setInitialHeight(biographyDivRef.current.offsetHeight);
        }
    });

    useEffect(() => {
        console.log(personData);
        console.log(personWork)
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <>{isLoading ?
            <Loading />
        :
            <div className='flex md:flex-row flex-col h-full max-md:gap-4 pt-4 pl-4 max-md:pr-4 max-md:pb-4'>
                <div className="flex flex-col items-start p-6 rounded-md md:w-[15%] w-full h-full gap-3 bg-slate-800">
                    <label className='text-white text-2xl font-bold'>{personData.name}</label>
                    <NextImage 
                    priority={true}
                    className="md:w-fit border-1.5 border-blueish-gray hover:border-gray-300"
                    src={`${personData?.profile_path !== null ? `https://image.tmdb.org/t/p/original${personData?.profile_path}` : `https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg`}`}
                    alt="Profile Image"
                    height={171}
                    width={136}
                    />
                    <div className='grow' ref={biographyDivRef}>
                        <ExpandableText text={personData!.biography} maxLength={400} initialParentHeight={initialHeight} />
                    </div>
                </div>
                <div className='flex w-full justify-center items-center px-2'>
                    { personWork.length === 0 ?
                        <label className='text-2xl font-bold'>No filmography data registered.</label> //TO-DO - Add message to locales
                    :
                        <Media type={'movies'} preloadedMovies={personWork} preloadedShows={[]} preloadedPeople={[]} />
                    }
                </div>
            </div>
        }</>
    );
}