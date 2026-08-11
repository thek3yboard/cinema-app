export type Movie = {
    id: number,
    title: string,
    overview: string,
    poster_path: string,
    vote_count: number,
    profile_path: string,
    media_type: string
}

export type MovieData = {
    id: number,
    title: string,
    overview: string,
    original_title: string,
    backdrop_path: string,
    poster_path: string | null,
    release_date: string,
    vote_average: number,
    popularity: number,
    production_companies: Array<ProductionCompanies>,
    video_id: string
}

export type Show = {
    id: number,
    title: string,
    overview: string,
    poster_path: string,
    vote_count: number,
    profile_path: string,
    media_type: string
}

export type ShowData = {
    id: number,
    name: string,
    overview: string,
    backdrop_path: string,
    poster_path: string | null,
    first_air_date: string,
    vote_average: number,
    popularity: number,
    production_companies: Array<ProductionCompanies>,
    video_id: string
}

export type Person = {
    id: number,
    name: string,
    profile_path: string,
    poster_path: string
    media_type: string
}

export type PersonData = {
    id: number,
    name: string,
    biography: string,
    birthday: string | null,
    deathday: string | null,
    gender: number,
    known_for_department: string,
    place_of_birth: string | null,
    profile_path: string | null
}

export type PersonCredit = {
    id: number,
    media_type: 'movie' | 'tv',
    title?: string,
    name?: string,
    overview?: string,
    poster_path: string | null,
    vote_count: number,
    vote_average?: number,
    popularity?: number,
    episode_count?: number,
    genre_ids?: number[],
    character?: string,
    job?: string,
    department?: string,
    release_date?: string,
    first_air_date?: string
}

export type ProductionCompanies = {
    id: number,
    logo_path: string,
    name: string,
    origin: string
}

export type SortType = {
    key: string,
    label: string,
    order_key: string,
    order_label: string
}

export type LanguageType = {
    key: string,
    label: string
}
