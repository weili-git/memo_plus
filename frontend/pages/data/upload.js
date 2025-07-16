import { useState } from 'react'
import pako from 'pako';

const MAX_LINE = 3;

export default function Upload() {
    const [filePreview, setFilePreview] = useState('')
    const [fullContent, setFullContent] = useState('')

    const handleFileChange = async (event) => {
        const file = event.target.files[0]
        if (file) {
            const content_gz = await readFileContent(file)
            const content = pako.inflate(content_gz, { to: 'string' })
            setFullContent(content)
            const lines = content.split('\n')
            let preview = lines.slice(0, MAX_LINE).join('\n')
            if (lines.length > MAX_LINE) {
                preview += '\n...'
            }
            setFilePreview(preview)
        }
    }

    const readFileContent = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (event) => resolve(new Uint8Array(event.target.result))
            reader.readAsArrayBuffer(file)
        })
    }

    const handleClear = () => {
        setFilePreview('')
        setFullContent('')
        alert('Succeed to clear')
    }

    const handleSubmit = async () => {
        if (!filePreview) {
            alert('Please select a file first')
            return
        }
        try {
            const res = await fetch('http://localhost:8080/api/records/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: fullContent }),
            })

            const data = await res.json()
            if (data.success) {
                alert('Succeed to import')

            } else {
                alert('Fail to import' + data.error)
            }
        } catch (error) {
            alert('Fail to request: ' + error.message)
        }
    }
    return (
        <div style={{textAlign: 'center'}}>
            <div>
                <h1>Import Data</h1>
                <form onSubmit={handleSubmit}>
                    <input type="file" onChange={handleFileChange} />
                    {filePreview && (
                        <div>
                            <h2>File Content:</h2>
                            <pre>{filePreview}</pre>
                        </div>
                    )}
                    <div>
                        <button type='submit'>Enter</button>
                        <button type='reset' onClick={handleClear}>Clear</button>
                    </div>
                </form>
            </div>
        </div>
    );
}