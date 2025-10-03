"use client"

import { ChangeEvent, useState, useContext, useEffect, useRef } from "react";
import { MediaContext } from "../MediaContext";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { PersonData } from "@/types/types";
import { fetchPage } from "../../utils";
import { Check, X as Cross } from "lucide-react";
import Media from "../../components/Media";

export default function OnScreenTogether() {
    const { language } = useContext(MediaContext);
    const [searchLeft, setSearchLeft] = useState('');
    const [searchRight, setSearchRight] = useState('');
    const [leftImageLoaded, setLeftImageLoaded] = useState(false);
    const [rightImageLoaded, setRightImageLoaded] = useState(false);
    const [leftResult, setLeftResult] = useState<PersonData>();
    const [rightResult, setRightResult] = useState<PersonData>();
    const [workedTogether, setWorkedTogether] = useState<boolean | null>(null);
    const [leftSuggestions, setLeftSuggestions] = useState<PersonData[]>([]);
    const [rightSuggestions, setRightSuggestions] = useState<PersonData[]>([]);
    const [isLeftFocused, setIsLeftFocused] = useState(false);
    const [isRightFocused, setIsRightFocused] = useState(false);
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);
    const [sharedMovies, setSharedMovies] = useState<any[]>([]);

   useEffect(() => {
        if (leftResult?.id && rightResult?.id) {
            setSharedMovies([]);
            setWorkedTogether(null);
            didTheyWorkTogether(leftResult.id, rightResult.id).then(setWorkedTogether);
        }
    }, [leftResult, rightResult, language.key]);

    useEffect(() => {
        async function loadShared() {
            if(workedTogether) {
                if (leftResult?.id && rightResult?.id) {
                    const movies = await getSharedMovies(leftResult.id, rightResult.id, language.key);
                    setSharedMovies(movies);
                }
            }
        }

        loadShared();
    }, [workedTogether]);

    useEffect(() => {
        if (!searchLeft) {
            setLeftSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            const data = await fetchPage(
            `https://api.themoviedb.org/3/search/person?query=${searchLeft}&language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            setLeftSuggestions(data.results.slice(0, 5)); // top 5
        }, 100);

        return () => clearTimeout(timer);
    }, [searchLeft, language.key]);

    useEffect(() => {
        if (!searchRight) {
            setRightSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            const data = await fetchPage(
            `https://api.themoviedb.org/3/search/person?query=${searchRight}&language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            setRightSuggestions(data.results.slice(0, 5)); // top 5
        }, 100);

        return () => clearTimeout(timer);
    }, [searchRight, language.key]);

    const handleKeydownSearchleft = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            handleClickSearchLeft();
        } 
    }
    
    const handleChangeSearchLeft = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchLeft(e.target.value);
    }

    const handleKeydownSearchRight = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            handleClickSearchRight();
        } 
    }
        
    const handleChangeSearchRight = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchRight(e.target.value);
    }

    const handleClickSearchLeft = async () => {
        try {
            const data = await fetchPage(`https://api.themoviedb.org/3/search/person?&include_adult=false&query=${searchLeft}&language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
            setLeftResult(data.results[0]);
        } catch (error) {
            console.error(error);
        }
    }

    const handleClickSearchRight = async () => {
        try {
            const data = await fetchPage(`https://api.themoviedb.org/3/search/person?&include_adult=false&query=${searchRight}&language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
            setRightResult(data.results[0]);
        } catch (error) {
            console.error(error);
        }
    }

    async function didTheyWorkTogether(leftId: number, rightId: number) {
        const [leftCredits, rightCredits] = await Promise.all([
            fetchPage(`https://api.themoviedb.org/3/person/${leftId}/movie_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`),
            fetchPage(`https://api.themoviedb.org/3/person/${rightId}/movie_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
        ]);

        // helper: clean credits (cast + crew) → movie IDs
        function extractCleanMovieIds(credits: any) {
            const cleanCast = credits.cast.filter(
            (c: any) =>
                !c.character?.toLowerCase().includes("archive") &&
                !c.character?.toLowerCase().includes("uncredited")
            );

            const cleanCrew = credits.crew.filter(
            (c: any) =>
                !["thanks", "in memory of"].includes(c.job?.toLowerCase())
            );

            return [
            ...cleanCast.map((m: any) => m.id),
            ...cleanCrew.map((m: any) => m.id),
            ];
        }

        const leftMovies = new Set(extractCleanMovieIds(leftCredits));
        const rightMovies = extractCleanMovieIds(rightCredits);

        return rightMovies.some((id: number) => leftMovies.has(id));
    }

    async function getSharedMovies(leftId: number, rightId: number, language: string) {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

        const [leftCredits, rightCredits] = await Promise.all([
            fetchPage(`https://api.themoviedb.org/3/person/${leftId}/movie_credits?api_key=${apiKey}&language=${language}`),
            fetchPage(`https://api.themoviedb.org/3/person/${rightId}/movie_credits?api_key=${apiKey}&language=${language}`)
        ]);

        function extractCleanMovies(credits: any) {
            const cleanCast = credits.cast.filter(
            (c: any) =>
                !c.character?.toLowerCase().includes("archive") &&
                !c.character?.toLowerCase().includes("uncredited")
            );

            const cleanCrew = credits.crew.filter(
            (c: any) =>
                !["thanks", "in memory of"].includes(c.job?.toLowerCase())
            );

            return [...cleanCast, ...cleanCrew];
        }

        const leftMovies = extractCleanMovies(leftCredits);
        const rightMovies = extractCleanMovies(rightCredits);

        const leftMap = new Map(leftMovies.map((m: any) => [m.id, m]));
        const shared = rightMovies.filter((m: any) => leftMap.has(m.id));

        // 🔥 normalize to match search/movie results
        return shared.map((m: any) => ({
            id: m.id,
            title: m.title,
            original_title: m.original_title,
            overview: m.overview,
            release_date: m.release_date,
            poster_path: m.poster_path,
            backdrop_path: m.backdrop_path,
            vote_average: m.vote_average,
            vote_count: m.vote_count,
            popularity: m.popularity,
            genre_ids: m.genre_ids ?? [], // credits may not always return this
            adult: false,
            video: false,
            original_language: m.original_language
        }));
    }

    return (
        <div className="h-full flex flex-col p-16">
            <h1 className="text-5xl m-auto">Did they work together?</h1>
            <div className="grow flex flex-col pt-5 w-1/2 m-auto">
                <div className="flex justify-between">
                    <span className="max-md:hidden flex items-center w-1/3 h-10 bg-blueish-gray rounded-[3px] relative">
                        <input 
                            type='text' 
                            value={searchLeft}
                            onChange={(e) => handleChangeSearchLeft(e)} 
                            onKeyDown={(e) => handleKeydownSearchleft(e)} 
                            className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray'
                            ref={leftInputRef}
                            onFocus={() => setIsLeftFocused(true)}
                            onBlur={() => setTimeout(() => setIsLeftFocused(false), 200)} // little delay so clicks on suggestions work
                        />
                        {isLeftFocused && leftSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 w-full bg-blueish-gray text-white border rounded shadow-md z-10">
                            {leftSuggestions.map((person) => (
                            <li
                                key={person.id}
                                onClick={() => {
                                    setLeftResult(person);
                                    setLeftSuggestions([]);
                                    setSearchLeft(person.name);
                                }}
                                className="cursor-pointer hover:bg-slate-800 text-white p-2 flex items-center"
                            >
                                <img
                                src={
                                    person.profile_path
                                    ? `https://image.tmdb.org/t/p/w45${person.profile_path}`
                                    : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
                                }
                                alt={person.name}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                                {person.name}
                            </li>
                            ))}
                        </ul>
                        )}
                        {searchLeft && (
                            <button 
                                onClick={() => setSearchLeft('')}
                                className='absolute right-11 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1'
                                type="button"
                            >
                                <X className='w-4 h-4' />
                            </button>
                        )}
                        <button onClick={handleClickSearchLeft}>
                            <Search className='mx-2 max-h-6' />
                        </button>
                    </span>
                    <span className="max-md:hidden flex items-center w-1/3 h-10 bg-blueish-gray rounded-[3px] relative">
                        <input 
                            type='text' 
                            value={searchRight} 
                            onChange={(e) => handleChangeSearchRight(e)} 
                            onKeyDown={(e) => handleKeydownSearchRight(e)} 
                            className='w-[calc(100%-30px)] pl-2 ml-[2px] h-full bg-blueish-gray'
                            ref={rightInputRef}
                            onFocus={() => setIsRightFocused(true)}
                            onBlur={() => setTimeout(() => setIsRightFocused(false), 200)} // little delay so clicks on suggestions work
                        />
                        {isRightFocused && rightSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 w-full bg-blueish-gray text-white border rounded shadow-md z-10">
                            {rightSuggestions.map((person) => (
                            <li
                                key={person.id}
                                onClick={() => {
                                    setRightResult(person);
                                    setRightSuggestions([]);
                                    setSearchRight(person.name);
                                }}
                                className="cursor-pointer hover:bg-slate-800 text-white p-2 flex items-center"
                            >
                                <img
                                src={
                                    person.profile_path
                                    ? `https://image.tmdb.org/t/p/w45${person.profile_path}`
                                    : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
                                }
                                alt={person.name}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                                {person.name}
                            </li>
                            ))}
                        </ul>
                        )}
                        {searchRight && (
                            <button 
                                onClick={() => setSearchRight('')}
                                className='absolute right-11 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1'
                                type="button"
                            >
                                <X className='w-4 h-4' />
                            </button>
                        )}
                        <button onClick={handleClickSearchRight}>
                            <Search className='mx-2 max-h-6' />
                        </button>
                    </span>
                </div>
                <div className="grow flex mt-5 mb-10">
                    <div className="w-1/3 flex justify-center items-center h-[300px]">
                        <Image
                            onLoad={() => setLeftImageLoaded(true)}
                            src={
                                leftResult?.profile_path
                                ? `https://image.tmdb.org/t/p/w300${leftResult.profile_path}`
                                : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
                            }
                            alt={leftResult?.name ?? "Poster"}
                            width={200}
                            height={300}
                            className="rounded-xl border border-gray-300 object-cover"
                        />
                    </div>
                    <div className="w-1/3 flex justify-center items-center h-[300px]">
                    {leftResult && rightResult && (
                        workedTogether === null ? (
                        <span>Loading...</span>
                        ) : workedTogether ? (
                        <Check className="text-green-500 w-12 h-12" />
                        ) : (
                        <Cross className="text-red-500 w-12 h-12" />
                        )
                    )}
                    </div>
                    <div className="w-1/3 flex justify-center items-center h-[300px]">
                        <Image
                            onLoad={() => setRightImageLoaded(true)}
                            src={
                                rightResult?.profile_path
                                ? `https://image.tmdb.org/t/p/w300${rightResult.profile_path}`
                                : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
                            }
                            alt={rightResult?.name ?? "Poster"}
                            width={200}
                            height={300}
                            className="rounded-xl border border-gray-300 object-cover"
                        />
                    </div>
                </div>
            </div>
            <div className="grow">
            {sharedMovies.length > 0 &&
                <Media type={'movies'} preloadedMovies={sharedMovies} preloadedShows={[]} preloadedPeople={[]} />
            }
            </div>
        </div>
    );
}