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
        <div style={{textAlign: 'center'}}>
            <h1>Update Page</h1>
            <p>Word: {router.query.word}</p>
            <input value={meaning} onChange={(e) => setMeaning(e.target.value)}/>
            <button onClick={handleUpdate}>Update</button>
        </div>
    )
}