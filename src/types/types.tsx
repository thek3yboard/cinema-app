export type Movie = {
    id: number,
    title: string,
    overview: string,
    poster_path: string
}

export type MovieData = {
    id: number,
    title: string,
    overview: string,
    original_title: string,
    backdrop_path: string,
    release_date: string,
    vote_average: number
    production_companies: Array<ProductionCompanies>
}

export type ProductionCompanies = {
    id: number,
    logo_path: string,
    name: string,
    origin: string
}

export type SortType = {
    key: string,
    label: string
}