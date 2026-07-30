"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Loading from '../../../components/ui/Loading';
import PersonUI from '../../../components/PersonUI';
import { PersonCredit, PersonData } from '@/types/types';

type CombinedCredits = {
    cast: PersonCredit[];
    crew: PersonCredit[];
};

const excludedRole = (credit: PersonCredit) => {
    const role = `${credit.character ?? ''} ${credit.job ?? ''}`.toLowerCase();
    return role.includes('self') || role.includes('archive footage') || role.includes('uncredited');
};

const normalizeCredits = (person: PersonData, credits: CombinedCredits) => {
    const department = person.known_for_department;
    const source = department === 'Acting'
        ? credits.cast
        : credits.crew.filter((credit) => !credit.department || credit.department === department);
    const fallbackSource = source.length ? source : [...credits.cast, ...credits.crew];
    const excludedGenres = new Set([99, 10763, 10764, 10767]);

    const filtered = fallbackSource.filter((credit) =>
        (credit.media_type === 'movie' || credit.media_type === 'tv')
        && Boolean(credit.poster_path)
        && credit.vote_count >= 20
        && !excludedRole(credit)
        && !credit.genre_ids?.some((genre) => excludedGenres.has(genre))
    );

    return Array.from(
        new Map(filtered.map((credit) => [`${credit.media_type}-${credit.id}`, credit])).values()
    ).sort((first, second) =>
        (second.popularity ?? 0) - (first.popularity ?? 0)
        || (second.vote_count ?? 0) - (first.vote_count ?? 0)
    );
};

export default function Person({ params }: { params: { id: number; locale: string } }) {
    const t = useTranslations('PersonDetails');
    const [personData, setPersonData] = useState<PersonData>();
    const [personWork, setPersonWork] = useState<PersonCredit[]>([]);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setHasError(false);

            try {
                const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const bearerToken = process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN;
                const headers = bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined;

                const [detailsResponse, creditsResponse] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/person/${params.id}?language=${params.locale}&api_key=${apiKey}`, {
                        headers,
                        signal: controller.signal
                    }),
                    fetch(`https://api.themoviedb.org/3/person/${params.id}/combined_credits?language=${params.locale}&api_key=${apiKey}`, {
                        headers,
                        signal: controller.signal
                    })
                ]);

                if (!detailsResponse.ok || !creditsResponse.ok) throw new Error('TMDB person request failed');

                const details = await detailsResponse.json() as PersonData;
                const credits = await creditsResponse.json() as CombinedCredits;

                setPersonData(details);
                setPersonWork(normalizeCredits(details, credits));
            } catch (error) {
                if ((error as Error).name !== 'AbortError') setHasError(true);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [params.id, params.locale]);

    if (hasError) {
        return (
            <div className="mx-auto mt-12 max-w-xl rounded-xl bg-red-950/50 p-6 text-center text-red-100">
                {t('loadError')}
            </div>
        );
    }

    if (!personData) return <Loading />;
    return <PersonUI personData={personData} personWork={personWork} />;
}
