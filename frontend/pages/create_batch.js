import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function createBatch() {
    const [text, setText] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        const delimiter = new RegExp(`---\\s*`, 'g'); // 全局匹配“---”及多余空格
        const blocks = text.split(delimiter);
        const parsedData = blocks.map((block) => {
            // 删除空行
            const lines = block.split("\n").filter(line => line.trim() !== '');
            return {
                word: lines[0] || '', // 处理空数组情况
                meaning: lines.slice(1).join("\n") // 空数组 -> ''
            };
        }).filter(item => item.word.trim() !== '');
        console.log(parsedData);
        try {
            fetch('http://localhost:8080/api/records/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedData),
            }).then(async (res) => {
                if (res.status === 201) { // created
                    const msg = await res.json();
                    alert('Success: ' + msg.success + ' repeated: ' + msg.repeated);
                    const repeated_data = parsedData.filter((item) => msg.repeated_words.includes(item.word));
                    setText(repeated_data.map((item) => item.word + "\n" + item.meaning).join("\n---\n"));
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

    return (
        <div className='text-center w-[800px] mx-auto bg-gray-100 p-4'>
            <h1 className='text-4xl'>Create Batch</h1>
            <form onSubmit={handleSubmit}>
                <div className='mt-4'>
                    <textarea
                        className='w-full p-2 border border-gray-300 rounded-md'
                        value={text}
                        rows={10}
                        cols={100}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={`word 1
meaning 1
---
word 2
meaning 2
---
...`}
                    />
                </div>
                <button className='bg-green-500 text-white px-4 py-2 rounded-md' type='submit'>Enter</button>
            </form>
        </div>
    )
}