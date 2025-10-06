"use client"

import { ChangeEvent, useState, useContext, useEffect, useRef } from "react";
import { MediaContext } from "../MediaContext";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { PersonData } from "@/types/types";
import { fetchPage } from "../../utils";
import { Check, X as Cross } from "lucide-react";
import Media from "../../components/Media";
import { useTranslations } from 'next-intl';

export default function OnScreenTogether() {
    const { language } = useContext(MediaContext);
    const t = useTranslations('OnScreenTogether');
    const [searchLeft, setSearchLeft] = useState('');
    const [searchRight, setSearchRight] = useState('');
    const [leftImageLoaded, setLeftImageLoaded] = useState(false);
    const [rightImageLoaded, setRightImageLoaded] = useState(false);
    const [leftResult, setLeftResult] = useState<PersonData>();
    const [rightResult, setRightResult] = useState<PersonData>();
    const [workedTogether, setWorkedTogether] = useState<boolean | null>(null);
    const [leftSuggestions, setLeftSuggestions] = useState<PersonData[]>([]);
    const [rightSuggestions, setRightSuggestions] = useState<PersonData[]>([]);
    const [highlightedLeftIndex, setHighlightedLeftIndex] = useState<number>(-1);
    const [highlightedRightIndex, setHighlightedRightIndex] = useState<number>(-1);
    const [isLeftFocused, setIsLeftFocused] = useState(false);
    const [isRightFocused, setIsRightFocused] = useState(false);
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);
    const [sharedMovies, setSharedMovies] = useState<any[]>([]);

    useEffect(() => {
        async function processPair() {
            if (leftResult?.id && rightResult?.id) {
                setSharedMovies([]);
                setWorkedTogether(null);

                const shared = await fetchAndCompareMovies(leftResult.id, rightResult.id, language.key);
                setSharedMovies(shared);
                setWorkedTogether(shared.length > 0);
            }
        }

        processPair();
    }, [leftResult, rightResult, language.key]);

    useEffect(() => {
        if (!searchLeft) {
            setLeftSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            const data = await fetchPage(
            `https://api.themoviedb.org/3/search/person?query=${searchLeft}&language=${language.key}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            const knownSuggestions = data.results.filter((obj: any) => obj.profile_path !== null);
            setLeftSuggestions(knownSuggestions.slice(0, 5)); // top 5
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
            const knownSuggestions = data.results.filter((obj: any) => obj.profile_path !== null);
            setRightSuggestions(knownSuggestions.slice(0, 5)); // top 5
        }, 100);

        return () => clearTimeout(timer);
    }, [searchRight, language.key]);

    const handleChangeSearchLeft = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchLeft(e.target.value);
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

    function handleLeftKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!leftSuggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedLeftIndex((prev) =>
            prev < leftSuggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedLeftIndex((prev) =>
            prev > 0 ? prev - 1 : leftSuggestions.length - 1
            );
        } else if (e.key === "Enter" && highlightedLeftIndex >= 0) {
            e.preventDefault();
            const selected = leftSuggestions[highlightedLeftIndex];
            setLeftResult(selected);
            setSearchLeft(selected.name);
            setLeftSuggestions([]);
            setHighlightedLeftIndex(-1);
            setIsLeftFocused(false);
        }
    }

    function handleRightKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!rightSuggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedRightIndex((prev) =>
            prev < rightSuggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedRightIndex((prev) =>
            prev > 0 ? prev - 1 : rightSuggestions.length - 1
            );
        } else if (e.key === "Enter" && highlightedRightIndex >= 0) {
            e.preventDefault();
            const selected = rightSuggestions[highlightedRightIndex];
            setRightResult(selected);
            setSearchRight(selected.name);
            setRightSuggestions([]);
            setHighlightedRightIndex(-1);
            setIsRightFocused(false);
        }
    }

    async function fetchAndCompareMovies(leftId: number, rightId: number, language: string) {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

        const [leftCredits, rightCredits] = await Promise.all([
            fetchPage(`https://api.themoviedb.org/3/person/${leftId}/movie_credits?api_key=${apiKey}&language=${language}`),
            fetchPage(`https://api.themoviedb.org/3/person/${rightId}/movie_credits?api_key=${apiKey}&language=${language}`)
        ]);

        function extractCleanMovies(credits: any) {
            const cleanCast = credits.cast.filter((c: any) => {
                const ch = c.character?.toLowerCase() ?? "";
                const isSelf = ch.includes("self") || ch.includes("archive") || ch.includes("uncredited");
                const isDoc = (c.genre_ids ?? []).includes(99);
                return !isSelf && !isDoc;
            });

            const cleanCrew = credits.crew.filter((c: any) => {
                const job = c.job?.toLowerCase() ?? "";
                const isDoc = (c.genre_ids ?? []).includes(99);
                const badJob = job.includes("thanks") || job.includes("in memory") || job.includes("archive");
                return !badJob && !isDoc;
            });

            return [...cleanCast, ...cleanCrew];
        }

        const leftMovies = extractCleanMovies(leftCredits);
        const rightMovies = extractCleanMovies(rightCredits);

        const leftMap = new Map(leftMovies.map((m: any) => [m.id, m]));
        const shared = rightMovies.filter((m: any) => leftMap.has(m.id));

        const sortedSharedMovies = shared
            ?.slice()
            .sort((a, b) => a.release_date?.localeCompare(b.release_date));

        const normalized = sortedSharedMovies.map((m: any) => ({
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
            genre_ids: m.genre_ids ?? [],
            adult: false,
            video: false,
            original_language: m.original_language
        }));

        const unique = Array.from(new Map(normalized.map((m) => [m.id, m])).values());

        return unique;
    }

    return (
        <div className="h-full flex flex-col p-6 md:p-16">
            <h1 className="text-4xl md:text-5xl text-center mb-10">{`${t('didTheyWorkTogether')}`}</h1>

            {/* Search section */}
            <div className="flex flex-col gap-6 items-center md:flex-row md:justify-center w-full max-w-5xl mx-auto">
                {/* Left search box */}
                <div className="relative w-full md:w-1/2 max-w-sm">
                    <input
                        type="text"
                        value={searchLeft}
                        onChange={handleChangeSearchLeft}
                        onKeyDown={handleLeftKeyDown}
                        ref={leftInputRef}
                        onFocus={() => setIsLeftFocused(true)}
                        onBlur={() => setTimeout(() => setIsLeftFocused(false), 200)}
                        className="w-full pl-3 pr-10 h-10 rounded-md bg-blueish-gray text-white placeholder:text-gray-400"
                    />
                    {searchLeft && (
                        <button
                            onClick={() => setSearchLeft('')}
                            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={handleClickSearchLeft} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Search className="w-5 h-5 text-white" />
                    </button>

                    {isLeftFocused && leftSuggestions.length > 0 && (
                        <ul className="absolute w-full mt-1 bg-blueish-gray text-white border border-slate-600 rounded shadow-md z-10 max-h-60 overflow-auto">
                            {leftSuggestions.map((person, index) => (
                                <li
                                    key={person.id}
                                    onMouseDown={() => {
                                        setLeftResult(person);
                                        setSearchLeft(person.name);
                                        setLeftSuggestions([]);
                                        setHighlightedLeftIndex(-1);
                                        setIsLeftFocused(false);
                                    }}
                                    className={`flex items-center px-3 py-2 cursor-pointer ${
                                        highlightedLeftIndex === index ? "bg-slate-800" : "hover:bg-slate-700"
                                    }`}
                                >
                                    <Image
                                        src={person.profile_path ? `https://image.tmdb.org/t/p/w45${person.profile_path}` : "/fallback-portrait.svg"}
                                        alt={person.name}
                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                        width={32}
                                        height={32}
                                    />
                                    {person.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Right search box */}
                <div className="relative w-full md:w-1/2 max-w-sm">
                    <input
                        type="text"
                        value={searchRight}
                        onChange={handleChangeSearchRight}
                        onKeyDown={handleRightKeyDown}
                        ref={rightInputRef}
                        onFocus={() => setIsRightFocused(true)}
                        onBlur={() => setTimeout(() => setIsRightFocused(false), 200)}
                        className="w-full pl-3 pr-10 h-10 rounded-md bg-blueish-gray text-white placeholder:text-gray-400"
                    />
                    {searchRight && (
                        <button
                            onClick={() => setSearchRight('')}
                            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={handleClickSearchRight} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Search className="w-5 h-5 text-white" />
                    </button>

                    {isRightFocused && rightSuggestions.length > 0 && (
                        <ul className="absolute w-full mt-1 bg-blueish-gray text-white border border-slate-600 rounded shadow-md z-10 max-h-60 overflow-auto">
                            {rightSuggestions.map((person, index) => (
                                <li
                                    key={person.id}
                                    onMouseDown={() => {
                                        setRightResult(person);
                                        setSearchRight(person.name);
                                        setRightSuggestions([]);
                                        setHighlightedRightIndex(-1);
                                        setIsRightFocused(false);
                                    }}
                                    className={`flex items-center px-3 py-2 cursor-pointer ${
                                        highlightedRightIndex === index ? "bg-slate-800" : "hover:bg-slate-700"
                                    }`}
                                >
                                    <Image
                                        src={person.profile_path ? `https://image.tmdb.org/t/p/w45${person.profile_path}` : "/fallback-portrait.svg"}
                                        alt={person.name}
                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                        width={32}
                                        height={32}
                                    />
                                    {person.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Avatars & checkmark */}
            <div className="flex max-md:flex-col max-md:gap-4 max-md:mt-6 gap-12 mt-10 justify-center items-center flex-wrap">
                <div className="flex flex-col items-center w-[200px] max-md:w-[150px]">
                    <Image
                        src={leftResult?.profile_path ? `https://image.tmdb.org/t/p/w300${leftResult.profile_path}` : "/fallback-portrait.svg"}
                        alt={leftResult?.name ?? "Left Person"}
                        width={200}
                        height={300}
                        className="rounded-xl border border-gray-300 object-cover aspect-[2/3]"
                    />
                </div>
                <div className="flex items-center justify-center w-12 h-12">
                    {leftResult && rightResult && (
                        workedTogether === null ? (
                            <span className="text-white text-xl">Loading...</span>
                        ) : workedTogether ? (
                            <Check className="text-green-500 w-12 h-12" />
                        ) : (
                            <Cross className="text-red-500 w-12 h-12" />
                        )
                    )}
                </div>
                <div className="flex flex-col items-center w-[200px] max-md:w-[150px]">
                    <Image
                        src={rightResult?.profile_path ? `https://image.tmdb.org/t/p/w300${rightResult.profile_path}` : "/fallback-portrait.svg"}
                        alt={rightResult?.name ?? "Right Person"}
                        width={200}
                        height={300}
                        className="rounded-xl border border-gray-300 object-cover aspect-[2/3]"
                    />
                </div>
            </div>

            {/* Shared Movies */}
            {sharedMovies.length > 0 && (
                <div className="mt-12 px-6 md:px-32 overflow-x-auto">
                    <Media
                        type={'movies'}
                        preloadedMovies={sharedMovies}
                        preloadedShows={[]}
                        preloadedPeople={[]}
                    />
                </div>
            )}
        </div>
    );

}