import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UpdatePage() {
    const router = useRouter();
    const [meaning, setMeaning] = useState('');

    useEffect(() => {
        setMeaning(router.query.meaning);
    }, [router.query.meaning]);

    async function handleUpdate() {
        try{
            const res = await fetch("http://localhost:8080/api/records/update", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    word: router.query.word,
                    meaning: meaning
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Succeed to update.');
                router.push('/');
            } else {
                alert('Fail to update.');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='text-center w-[800px] mx-auto bg-gray-100 p-4'>
            <h1 className='text-4xl'>Update Page</h1>
            <p className='text-xl'>Word: {router.query.word}</p>
            <input className='w-full p-2 border border-gray-300 rounded-md' value={meaning} onChange={(e) => setMeaning(e.target.value)}/>
            <button className='bg-green-500 text-white px-4 py-2 rounded-md' onClick={handleUpdate}>Update</button>
        </div>
    )
}