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

    function calculateColumns() {
        const containerWidth = document.getElementById('masonry').offsetWidth;
        const itemWidth = 300; // 每个卡片的宽度
        const gap = 10; // 卡片之间的间距
        const columns = Math.floor((containerWidth + gap) / (itemWidth + gap));
        return columns;
    }

    useEffect(() => {
        
    })
    
    return (
        <div id="masonry" className="column-3 gap-4">
            {data.map((item) => (
                <div 
                    key={item.id}
                    onContextMenu={(e) => showDetail(e, item)}
                    style={{width: '300px', boxShadow: '2px 2px 2px gray', border: 'solid 1px'}}
                >
                    <h3>{item.word}</h3>
                    <p>{item.meaning}</p>
                    <p>{renderLocalTime(item.createTime)}</p>
                    <p>Review: {item.reviewCount}</p>
                </div>
            ))}
        </div>
    );
}

export default Cardlist;