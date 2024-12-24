export type Movie = {
    id: number,
    title: string,
    overview: string,
    poster_path: string,
    vote_count: number
}

export type MovieData = {
    id: number,
    title: string,
    overview: string,
    original_title: string,
    backdrop_path: string,
    release_date: string,
    vote_average: number,
    production_companies: Array<ProductionCompanies>,
    video_id: string
}

export type Show = {
    id: number,
    title: string,
    overview: string,
    poster_path: string,
    vote_count: number
}

export type ShowData = {
    id: number,
    name: string,
    overview: string,
    backdrop_path: string,
    first_air_date: string,
    vote_average: number,
    production_companies: Array<ProductionCompanies>,
    video_id: string
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