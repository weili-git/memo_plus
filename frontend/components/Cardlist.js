import { useRouter } from "next/router";
import { useEffect } from "react";

const Cardlist = ({ data }) => {
    const router = useRouter();

    const renderLocalTime = (utc) => {
        const d = new Date(utc + "Z");
        return d.toLocaleString();
    }

    function showDetail(e, record) {
        e.preventDefault();
        router.push(`/update?word=${record.word}&meaning=${record.meaning}`);
    }

    function getBrightColor() {
        return "hsl(" + 360 * Math.random() + ',' +
            (25 + 70 * Math.random()) + '%,' +
            (85 + 10 * Math.random()) + '%)'
    }

    useEffect(() => {

    })

    return (
        // className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl"
        // className="w-[300px] shadow-[2px_2px_2px_gray] border"
        <div className="flex items-center justify-center">
            <div className="columns-1 sm:columns-2 md:columns-3 gap-6 max-w-5xl"> 
                {data.map((item) => (
                    <div
                        key={item.id}
                        onContextMenu={(e) => showDetail(e, item)}
                        className="mb-6 inline-block w-full break-inside-avoid shadow-[2px_2px_2px_gray] border rounded-xl p-4 transition hover:scale-[1.02]"
                        style={{ backgroundColor: getBrightColor() }}
                    >
                        <h3 className="text-lg font-bold">{item.word}</h3>
                        <p>{item.meaning}</p>

                        <hr className="border-t border-gray-300 my-2" />

                        <p>{renderLocalTime(item.createTime)}</p>
                        <p>Review: {item.reviewCount}</p>
                    </div>
                ))}
            </div>
        </div>

    );
}

export default Cardlist;