import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cardlist from '../components/CardList';

export default function Search() {
    const router = useRouter();
    const { query } = router.query;
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/records/find/" + query)
                const data = await res.json()
                if (data.success) {
                    setSearchResults(data.data)
                } else {
                    console.log(data.error || "No results found.")
                }
            } catch (error) {
                console.log("Failed to fetch data: " + error)
            }
        }

        fetchSearchResults();
    }, [query])

    return (
        <div>
            <h1>搜索结果</h1>
            {searchResults.length === 0 ? (
                <div>
                    <p>No results found.</p>
                    <a href={`/create?word=${query}`}>go create {query}</a>
                </div>
            ) : (
                <Cardlist data={searchResults} />
            )}
        </div>
    );
}