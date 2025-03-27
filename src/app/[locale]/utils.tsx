import { Movie, Show, Person } from "@/types/types";

export const fetchPage = async (APIURL: string) => {
    try {
        let res = await fetch(APIURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
            }
        });
        
        const data = await res.json();
        
        return data;
    } catch (error) {
        console.error(error)
    }
}

export const fetchBoth = async (
    type: string,
    firstAPIURL: string,
    secondAPIURL: string,
    setMovies: React.Dispatch<React.SetStateAction<Movie[]>>,
    setShows: React.Dispatch<React.SetStateAction<Show[]>>,
    setPeople: React.Dispatch<React.SetStateAction<Person[]>>
) => {
    const firstBatchMedia = await fetchPage(firstAPIURL);
    const secondBatchMedia = await fetchPage(secondAPIURL);
    const allMediaPage = [...firstBatchMedia.results, ...secondBatchMedia.results];

    switch(type) {
        case 'movies':
            setMovies(allMediaPage);
            break;
        case 'shows':
            setShows(allMediaPage);
            break;
        case 'people':
            const peopleWithPicture = allMediaPage.filter((person) => person.profile_path !== null);
            const finalPeople = peopleWithPicture.slice(0, 30);
            setPeople(finalPeople);
            break;
        default:
            break;
    }
};