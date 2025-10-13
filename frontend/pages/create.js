import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CreateWord() {
    const router = useRouter();
    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');

    useEffect(() => {
        if (router.query.word) {
            setWord(router.query.word);
        }
    }, [router.query.word])

    function handleSubmit(e) {
        e.preventDefault();
        try {
            fetch('http://localhost:8080/api/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, meaning }),
            }).then(async (res) => {
                if (res.status === 201) { // created
                    alert('Succeed to create');
                    setWord('');
                    setMeaning('');
                } else if (res.status === 409) { // exist
                    const msg = await res.text();
                    console.log(msg);
                    alert('Word alread exists.');
                } else {
                    alert('Failed to create.');
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    function handleClear() {
        setWord('');
        setMeaning('');
    }
    return (
        <div className='text-center w-[800px] mx-auto bg-gray-100 p-4'>
            <h1 className='text-4xl'>Create A Word</h1>
            <form onSubmit={handleSubmit}>
                <div className='mt-4'>
                    <input className='w-full p-2 border border-gray-300 rounded-md' value={word} onChange={(e) => setWord(e.target.value)} placeholder='Word' />
                </div>
                <div>
                    <input className='w-full p-2 border border-gray-300 rounded-md' value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder='Meaning' />
                </div>
                <button className='bg-green-500 text-white px-4 py-2 rounded-md' type='submit'>Enter</button>
                <button className='bg-red-500 text-white px-4 py-2 rounded-md' type='reset' onClick={handleClear}>clear</button>
            </form>
        </div>
    );

}