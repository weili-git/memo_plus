
export default function Download() {
    async function handleExport() {
        try{
            const res = await fetch('http://localhost:8080/api/records/download')
            const data = await res.json()
            if (data.success) {
                // const blob = new Blob([data.data], { type: 'application/json' })
                // const url = URL.createObjectURL(blob)
                // const link = document.createElement('a')
                // link.href = url
                // link.download = 'data.json'
                // document.body.appendChild(link)
                // link.click()
                console.log("ok")
            } else {
                console.log(data.error);
            }
        } catch (error) {
            console.log("fetch error: " + error);
        }
    }

    return (
        <div style={{textAlign: "center"}}>
            <div>
                <h1>Export Data</h1>
                <button onClick={handleExport}>download</button>
            </div>

        </div>
    )
}