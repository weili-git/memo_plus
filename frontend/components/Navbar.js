import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Dropdown from './Dropdown';


const Navbar = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?query=${searchQuery}`);
        }
    };

    return (
        <div className="navbar">
            <ul>
                <li className={router.pathname === "/" ? "active" : ""}>
                    <Link href="/" style={{color: 'white', textDecoration: 'none' }}>Home</Link>
                </li>
                <li className={router.pathname.startsWith("/data") ? "active" : ""}>
                    <Dropdown title="Data">
                        <Link href="/data/upload">upload</Link>
                        <Link href="/data/download">download</Link>
                    </Dropdown>
                </li>
                <li className={router.pathname.startsWith("/review") ? "active" : ""}>
                    <Dropdown title="Review">
                        <Link href="/review/random">random</Link>
                        <Link href="/review/oldest">oldest</Link>
                        <Link href="review/test">test</Link>
                    </Dropdown>
                </li>
                <li className={router.pathname === "/create" ? "active" : ""}>
                {/* <Link href="/create" style={{color: 'white', textDecoration: 'none' }}>Create</Link> */}
                    <Dropdown title="Create">
                        <Link href="/create">Single</Link>
                        <Link href="/create_batch">Batch</Link>
                    </Dropdown>
                </li>
            </ul>
            <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Keyword..."
                />
                <button type="submit">Search</button>
            </form>
            <style jsx>{`
                .navbar {
                    background-image: url('/images/background.jpg');
                    background-size: cover;
                    background-position: center;
                    padding: 1rem;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 250px;
                }
                ul {
                    list-style: none;
                    display: flex;
                    gap: 1rem;
                }
                li {
                    padding: 0.5rem;
                }
                li.active {
                    font-weight: bold;
                    border-bottom: 2px solid white;
                }
                a {
                    color: white;
                    text-decoration: none;
                }
                a:visited {
                    color: white;
                }
                a:hover {
                    color: #ddd;
                }
                form {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-right: 2rem;
                }
                input {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                    border-radius: 4px;
                }
                button:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
};

export default Navbar;
