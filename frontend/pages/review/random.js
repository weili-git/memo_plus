import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function RandomDisplay() {
    const [source, setSource] = useState([]);
    const [target, setTarget] = useState([]);
    const [meaningDisplay, setMeaningDisplay] = useState(false);

    const fetchRandomRecords = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/records/random/5')
            const data = await res.json()
            if (data.success) {
                setSource(data.data);
            } else {
                console.log(data.error)
            }
        } catch (error) {
            console.log("Failed to fetch data: " + error)
        }
    };

    useEffect(() => {
        fetchRandomRecords();
    }, [])

    function handleDragEnd(result) {
        if (!result.destination) return
        if (result.source.droppableId === 'source' && result.destination.droppableId === 'target') {
            const item = source.find((item) => item.word === result.draggableId);
            const newTarget = Array.from(target);
            newTarget.splice(result.destination.index, 0, item);
            setTarget(newTarget);
            setSource((prevItems) => prevItems.filter((i) => i.word !== item.word));
        } else if (result.source.droppableId === 'target' && result.destination.droppableId === 'source') {
            const item = target.find((item) => item.word === result.draggableId);
            const newItems = Array.from(source);
            newItems.splice(result.destination.index, 0, item);
            setSource(newItems);
            setTarget((prevBasket) => prevBasket.filter((i) => i.word !== item.word));
        } else if (result.source.droppableId === 'source' && result.destination.droppableId === 'source') {
            const reorderedItems = Array.from(source);
            const [removed] = reorderedItems.splice(result.source.index, 1);
            reorderedItems.splice(result.destination.index, 0, removed);
            setSource(reorderedItems);
        } else if (result.source.droppableId === 'target' && result.destination.droppableId === 'target') {
            const reorderedBasket = Array.from(target);
            const [removed] = reorderedBasket.splice(result.source.index, 1);
            reorderedBasket.splice(result.destination.index, 0, removed);
            setTarget(reorderedBasket);
        }
    }

    async function handleReview() {
        const targetWords = target.map((item) => item.word);
        const res = await fetch('http://localhost:8080/api/records/review', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({words: targetWords})
        })
        const data = await res.json();
        if (data.success) {
            alert('提交复习成功')
            setTarget([])
        } else {
            alert('提交复习失败')
        }
    }

    function switchMeaningDisplay() {
        setMeaningDisplay(!meaningDisplay)
    }

    function nextBatch() {
        fetchRandomRecords();
    }

    function handleRightClick(e, word) {
        e.preventDefault();
        const res = source.find((item) => item.word === word);
        if (res) {
            const newSource = source.filter((item) => item.word !== word);
            setSource(newSource);
            const newTarget = [...target, res];
            setTarget(newTarget);
        } else {
            const newTarget = target.filter((item) => item.word !== word);
            setTarget(newTarget);
            const res = target.find((item) => item.word === word);
            const newSource = [...source, res];
            setSource(newSource);

        }

    }

    return (
        <div style={{textAlign: "center"}}>
            <h1>Random Display</h1>
            <button onClick={handleReview}>Review</button>
            <button onClick={switchMeaningDisplay}>Switch</button>
            <button onClick={nextBatch}>Next</button>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Droppable droppableId="source">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} style={{ background: '#f0f0f0', width: 300 }}>
                                <h3 style={{ margin: "5px 10px" }}>To Review</h3>
                                {source.map((item, index) => (
                                    <Draggable key={item.word} draggableId={item.word} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ background: 'white', margin: '10px', padding: 10, ...provided.draggableProps.style }}
                                                onContextMenu={(e) => handleRightClick(e, item.word)}
                                            >
                                                <div>
                                                    <strong>{item.word}</strong>
                                                </div>
                                                <div>
                                                    {meaningDisplay && item.meaning}
                                                </div>
                                                <div>
                                                    Review times: {item.reviewCount}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <Droppable droppableId="target">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} style={{ background: '#f0f0f0', width: 300 }}>
                                <h3 style={{ margin: "5px 10px" }}>Reviewed</h3>
                                {target.map((item, index) => (
                                    <Draggable key={item.word} draggableId={item.word} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ background: 'white', margin: '10px', padding: 10, ...provided.draggableProps.style }}
                                                onContextMenu={(e) => handleRightClick(e, item.word)}
                                            >
                                                <div>
                                                    <strong>{item.word}</strong>
                                                </div>
                                                <div>
                                                    {meaningDisplay && item.meaning}
                                                </div>
                                                <div>
                                                    {item.reviewCount}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>
        </div>
    )
}