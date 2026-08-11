"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';
import { PersonCredit, PersonData } from '@/types/types';
import MediaQuickActions from '@/components/media/MediaQuickActions';
import { MediaQuickActionItem, useUserMediaStates } from '@/hooks/useUserMediaStates';

type Props = {
    personData: PersonData;
    personWork: PersonCredit[];
};

type MediaFilter = 'all' | 'movie' | 'tv';
type SortMode = 'popular' | 'recent';

const initialVisibleCredits = 18;

const getCreditTitle = (credit: PersonCredit) =>
    credit.media_type === 'movie' ? credit.title ?? '' : credit.name ?? '';

const getCreditDate = (credit: PersonCredit) =>
    credit.media_type === 'movie' ? credit.release_date : credit.first_air_date;

const getPopularityScore = (credit: PersonCredit) => {
    const baseScore = credit.vote_count + (credit.popularity ?? 0) * 10;
    if (credit.media_type === 'tv' && (credit.episode_count ?? 0) <= 1) return baseScore * 0.2;
    return baseScore;
};

const getCreditActionItem = (credit: PersonCredit): MediaQuickActionItem => ({
    mediaId: credit.id,
    mediaType: credit.media_type,
    title: getCreditTitle(credit),
    posterPath: credit.poster_path,
    releaseYear: Number(getCreditDate(credit)?.slice(0, 4)) || null,
    popularity: Number(credit.popularity ?? 0),
    voteAverage: Number(credit.vote_average ?? 0)
});

const calculateAge = (birthday: string, deathday: string | null) => {
    const birthDate = new Date(`${birthday}T00:00:00`);
    const endDate = deathday ? new Date(`${deathday}T00:00:00`) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = endDate.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && endDate.getDate() < birthDate.getDate())) age--;
    return age;
};

export default function PersonUI({ personData, personWork }: Props) {
    const locale = useLocale();
    const t = useTranslations('PersonDetails');
    const router = useRouter();
    const [isBiographyExpanded, setIsBiographyExpanded] = useState(false);
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
    const [sortMode, setSortMode] = useState<SortMode>('popular');
    const [visibleCredits, setVisibleCredits] = useState(initialVisibleCredits);

    const dateFormatter = useMemo(
        () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
        [locale]
    );

    const formatDate = (date?: string | null) => {
        if (!date) return null;
        const parsedDate = new Date(`${date}T00:00:00`);
        return Number.isNaN(parsedDate.getTime()) ? null : dateFormatter.format(parsedDate);
    };

    const movieCount = personWork.filter((credit) => credit.media_type === 'movie').length;
    const showCount = personWork.filter((credit) => credit.media_type === 'tv').length;
    const age = personData.birthday ? calculateAge(personData.birthday, personData.deathday) : null;

    const departmentLabel = (() => {
        switch (personData.known_for_department) {
            case 'Acting': return t('departments.acting');
            case 'Directing': return t('departments.directing');
            case 'Writing': return t('departments.writing');
            case 'Production': return t('departments.production');
            default: return personData.known_for_department;
        }
    })();

    const filteredCredits = useMemo(() => {
        const filtered = mediaFilter === 'all'
            ? personWork
            : personWork.filter((credit) => credit.media_type === mediaFilter);

        return [...filtered].sort((first, second) => {
            if (sortMode === 'recent') {
                const firstDate = new Date(getCreditDate(first) ?? 0).getTime();
                const secondDate = new Date(getCreditDate(second) ?? 0).getTime();
                return secondDate - firstDate;
            }

            return getPopularityScore(second) - getPopularityScore(first);
        });
    }, [mediaFilter, personWork, sortMode]);
    const displayedCredits = useMemo(
        () => filteredCredits.slice(0, visibleCredits),
        [filteredCredits, visibleCredits]
    );
    const actionItems = useMemo(
        () => displayedCredits.map(getCreditActionItem),
        [displayedCredits]
    );
    const userMedia = useUserMediaStates(actionItems);

    useEffect(() => setVisibleCredits(initialVisibleCredits), [mediaFilter, sortMode]);

    return (
        <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl md:p-8">
                <div className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full bg-lapis-lazuli/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-aero-blue/20 blur-3xl" />

                <div className="relative grid gap-7 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:gap-10">
                    <div className="mx-auto w-full max-w-[280px] md:mx-0">
                        <Image
                            priority
                            src={personData.profile_path ? `https://image.tmdb.org/t/p/w500${personData.profile_path}` : '/fallback-portrait.svg'}
                            alt={personData.name}
                            width={500}
                            height={750}
                            className="aspect-[2/3] w-full rounded-2xl object-cover shadow-xl ring-1 ring-white/10"
                        />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center">
                        <span className="w-fit rounded-full border border-nyanza/20 bg-nyanza/10 px-3 py-1 text-sm font-semibold text-nyanza">
                            {t('knownFor', { department: departmentLabel })}
                        </span>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                            {personData.name}
                        </h1>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
                            {personData.birthday && (
                                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                                    <CalendarDays className="h-4 w-4 text-nyanza" />
                                    {t('born')} {formatDate(personData.birthday)}
                                </span>
                            )}
                            {personData.deathday && (
                                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                                    <CalendarDays className="h-4 w-4 text-slate-300" />
                                    {t('died')} {formatDate(personData.deathday)}
                                </span>
                            )}
                            {personData.place_of_birth && (
                                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                                    <MapPin className="h-4 w-4 text-nyanza" />
                                    {personData.place_of_birth}
                                </span>
                            )}
                            {age !== null && (
                                <span className="rounded-full bg-white/5 px-3 py-2">{t('age', { age })}</span>
                            )}
                        </div>

                        <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
                            {[
                                [personWork.length, t('works')],
                                [movieCount, t('movies')],
                                [showCount, t('shows')]
                            ].map(([value, label]) => (
                                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                                    <strong className="block text-2xl font-black text-white">{value}</strong>
                                    <span className="text-xs text-slate-300 sm:text-sm">{label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 max-w-3xl">
                            <h2 className="text-xl font-bold text-white">{t('biography')}</h2>
                            {personData.biography ? (
                                <>
                                    <p className={`mt-3 whitespace-pre-line text-pretty leading-7 text-slate-200 ${isBiographyExpanded ? '' : 'line-clamp-5'}`}>
                                        {personData.biography.replace(/\u00A0/g, ' ')}
                                    </p>
                                    {personData.biography.length > 500 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsBiographyExpanded((expanded) => !expanded)}
                                            className="mt-3 flex items-center gap-1 font-semibold text-nyanza hover:underline"
                                        >
                                            {isBiographyExpanded ? t('showLessBiography') : t('showMoreBiography')}
                                            {isBiographyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="mt-3 text-slate-300">{t('noBiography')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-10">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white">{t('filmography')}</h2>
                        <p className="mt-1 text-slate-300">{t('creditsCount', { count: filteredCredits.length })}</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex rounded-lg bg-slate-800/80 p-1" aria-label={t('filterAria')}>
                            {([
                                ['all', t('all')],
                                ['movie', t('movies')],
                                ['tv', t('shows')]
                            ] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setMediaFilter(key)}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                        mediaFilter === key ? 'bg-lapis-lazuli text-white' : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            {t('sortBy')}
                            <select
                                value={sortMode}
                                onChange={(event) => setSortMode(event.target.value as SortMode)}
                                className="h-10 rounded-md border border-slate-600 bg-slate-800 px-3 text-white outline-none focus:border-nyanza"
                            >
                                <option value="popular">{t('mostPopular')}</option>
                                <option value="recent">{t('newest')}</option>
                            </select>
                        </label>
                    </div>
                </div>

                {filteredCredits.length ? (
                    <>
                        <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {displayedCredits.map((credit) => {
                                const title = getCreditTitle(credit);
                                const date = getCreditDate(credit);
                                const role = credit.character || credit.job;
                                const actionItem = getCreditActionItem(credit);

                                return (
                                    <li className="group relative min-w-0" key={`${credit.media_type}-${credit.id}`}>
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/${locale}/${credit.media_type === 'movie' ? 'movies' : 'shows'}/${credit.id}`)}
                                            className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl bg-slate-800/90 text-left text-white shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-nyanza"
                                        >
                                            <span className="relative block w-full overflow-hidden">
                                                <Image
                                                    src={credit.poster_path ? `https://image.tmdb.org/t/p/w342${credit.poster_path}` : '/fallback-portrait.svg'}
                                                    alt={title}
                                                    width={228}
                                                    height={342}
                                                    className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                />
                                                <span className="absolute left-2 top-2 rounded-full bg-slate-950/85 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-nyanza">
                                                    {credit.media_type === 'movie' ? t('movie') : t('show')}
                                                </span>
                                                {Boolean(credit.vote_average) && (
                                                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-slate-950/85 px-2 py-1 text-xs font-bold">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        {credit.vote_average?.toFixed(1)}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="flex min-w-0 flex-1 flex-col p-3">
                                                <span className="line-clamp-2 font-bold leading-5">{title}</span>
                                                <span className="mt-1 text-xs text-slate-300">{date?.slice(0, 4) || t('unknownYear')}</span>
                                                {role && <span className="mt-auto line-clamp-2 pt-2 text-xs text-slate-400">{role}</span>}
                                            </span>
                                        </button>
                                        {userMedia.user && (
                                            <MediaQuickActions
                                                item={actionItem}
                                                state={userMedia.getState(actionItem)}
                                                userId={userMedia.user.id}
                                                disabled={userMedia.isLoading || userMedia.isPending(actionItem)}
                                                onToggle={(field) => userMedia.toggle(actionItem, field)}
                                            />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        {visibleCredits < filteredCredits.length && (
                            <div className="mt-9 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setVisibleCredits((visible) => visible + initialVisibleCredits)}
                                    className="rounded-md bg-lapis-lazuli px-6 py-3 font-bold text-white transition hover:opacity-90"
                                >
                                    {t('showMore')}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="mt-7 rounded-xl bg-slate-800/70 p-6 text-slate-300">{t('noFilmography')}</p>
                )}
            </section>
        </main>
    );
}
