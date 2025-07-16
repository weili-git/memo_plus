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
        <div style={{textAlign: "center"}}>
            <h1>Create A Word</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <input value={word} onChange={(e) => setWord(e.target.value)} placeholder='Word' />
                </div>
                <div>
                    <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder='Meaning' />
                </div>
                <button type='submit'>Enter</button>
                <button type='reset' onClick={handleClear}>clear</button>
            </form>
        </div>
    );

}