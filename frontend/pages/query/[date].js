import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import Cardlist from "@/components/CardList";

export default function QueryByDate() {
    const router = useRouter();
    const {date} = router.query; // params
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/records/date/${date}`)
                const data = await res.json()
                if (data.success) {
                    setRecords(data.records)
                } else {
                    console.log("Api fail: " + data.error)
                }
            } catch (error) {
                console.log("Failed to fetch data: " + error)
            }
        };

        fetchData();
    }, [date]);

    return (
        <div style={{textAlign: "center"}}>
            <h1>{date}</h1>
            {records.length === 0 && <p>No records found for this date.</p>}
            <Cardlist data={records} />
        </div>
    )
}