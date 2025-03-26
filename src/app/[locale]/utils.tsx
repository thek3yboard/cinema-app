import { Movie, Show, Person } from "@/types/types";

export const fetchFirstPage = async (firstAPIURL: string) => {
    try {
        let res = await fetch(firstAPIURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
            }
        });
        
        const data = await res.json();
        
        return data.results;
    } catch (error) {
        console.error(error)
    }
}

export const fetchSecondPage = async (secondAPIURL: string) => {
    try {
        let res = await fetch(secondAPIURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN}`
            }
        });
        
        const data = await res.json();
        
        return data.results;
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
    const firstBatchMedia = await fetchFirstPage(firstAPIURL);
    const secondBatchMedia = await fetchSecondPage(secondAPIURL);
    const allMediaPage = [...firstBatchMedia, ...secondBatchMedia];

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