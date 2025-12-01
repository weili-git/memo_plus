"use client";
import { useEffect, useState, useRef } from "react";
import RadarResult from "../../components/RadarResult";

// 生成亮色 HSL
function getBrightColor() {
  return `hsl(${360 * Math.random()}, ${60 + 20 * Math.random()}%, ${70 + 10 * Math.random()}%)`;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ReviewTest() {
  // 初始化：为每个元素生成固定颜色
  const basePairs = [
    { id: 1, word: "apple", meaning: "苹果", reviewCount: 5 },
    { id: 2, word: "book", meaning: "书", reviewCount: 3 },
    { id: 3, word: "dog", meaning: "狗", reviewCount: 5 }
  ];

  // ⭐ 为每个 word 和 meaning 生成不同的随机颜色
  const wordsInit = basePairs.map(item => ({
    ...item,
    color: getBrightColor(),
  }));

  const meaningsInit = basePairs.map(item => ({
    ...item,
    color: getBrightColor(),
  }));

  // 状态
  const [words, setWords] = useState(wordsInit);
  const [meanings, setMeanings] = useState(meaningsInit);
  const [draggingId, setDraggingId] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);

  // 每题答题记录
  const [answers, setAnswers] = useState([]);
  const hintTimer = useRef(null);

  // 计时相关
  const [startTime, setStartTime] = useState(Date.now());
  const [timeRecords, setTimeRecords] = useState([]);

  /* ---------- 拖拽事件 ---------- */
  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, meaningObj) => {
    e.preventDefault();

    const wordObj = words.find(w => w.id === draggingId);
    if (!wordObj) return;

    if (wordObj.meaning === meaningObj.meaning) {
      setMatchedIds(prev => [...prev, meaningObj.id]);

      /* ------ 1. 复习次数越少，奖励越高 ------ */
      const reward = Math.max(5, 10 - wordObj.reviewCount ?? 0);

      /* ------ 2. 答题时间越短，奖励越高 ------ */
      let timeBonus = 0;
      const deltaSec = (Date.now() - startTime) / 1000;
      if (deltaSec <= 5) timeBonus = 3;
      else if (deltaSec <= 10) timeBonus = 1;

      setScore(prev => prev + reward + timeBonus);
      setTimeRecords(prev => [...prev, deltaSec]);

      setTimeout(() => {
        setWords(prev => prev.filter(w => w.id !== draggingId));
        setMeanings(prev => prev.filter(m => m.id !== meaningObj.id));
        setProgress(prev => prev + 1);
        setAnswers(prev => [...prev, {
          wordId: wordObj.id,
          correct: true,
          reward,
          time: deltaSec
        }]);
        setStartTime(Date.now());
      }, 300);
    } else {
      // 错误匹配
      setScore(prev => prev - 1);
      setAnswers(prev => [...prev, {
        wordId: wordObj.id,
        correct: false,
        reward: 0,
      }]);
    }

    setDraggingId(null);
  };

  /* ---------- 初始化打乱，重置计时器 ---------- */
  useEffect(() => {
    setWords(shuffle(wordsInit));
    setMeanings(shuffle(meaningsInit));
    setStartTime(Date.now());
  }, []);

  /* ---------- 自动提示：15秒无操作提示 ---------- */
  useEffect(() => {
    if (words.length === 0) return;
    clearTimeout(hintTimer.current);

    hintTimer.current = setTimeout(() => {
      // 随机选一个未匹配的单词提示
      const remainingWords = words.filter(w => !matchedIds.includes(w.id));
      if (remainingWords.length > 0) {
        const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        const targetMeaning = meanings.find(m => m.meaning === randomWord.meaning);
        if (targetMeaning) {
          // 简单提示效果：闪烁
          const wordEl = document.getElementById(`word-${targetMeaning.id}`);
          if (wordEl) {
            wordEl.classList.add("shake-once");
            setTimeout(() => wordEl.classList.remove("shake-once"), 1000);
          }
          const meaningEl = document.getElementById(`meaning-${targetMeaning.id}`);
          if (meaningEl) {
            meaningEl.classList.add("shake-once");
            setTimeout(() => meaningEl.classList.remove("shake-once"), 1000);
          }
        }
      }
    }, 5000);

    return () => clearTimeout(hintTimer.current);
  }, [words, meanings, matchedIds]);

  function calcRadarData() {
    if (answers.length === 0) {
      return [
        { metric: "速度", value: 0 },
        { metric: "准确度", value: 0 },
        { metric: "难度", value: 0 },
        { metric: "稳定性", value: 0 },
        { metric: "记忆力", value: 0 },
        { metric: "坚持度", value: 0 },
      ];
    }

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const scale = (v, min, max) => (v - min) / (max - min);

    const speed = timeRecords.reduce((acc, cur) => acc + 1 / clamp(cur, 0.5, 20), 0) / timeRecords.length;
    const accuracy = answers.filter(a => a.correct).length / answers.length;
    const difficulty = basePairs.reduce((acc, cur) => acc + 1 / clamp(cur.reviewCount + 1, 1, 10), 0) / basePairs.length;
    const stability = timeRecords.reduce((acc, cur) => acc + clamp((cur - speed) ** 2, 0, 20), 0) / timeRecords.length;
    // todo
    // const memory = progress / basePairs.length;
    // const persistence = score / basePairs.length;

    console.log([
      { metric: "速度", value: scale(speed, 0.5, 20) },
      { metric: "准确度", value: accuracy },
      { metric: "难度", value: scale(difficulty, 0.1, 1) },
      { metric: "稳定性", value: scale(stability, 0, 20) },
      // { metric: "记忆力", value: memory },
      // { metric: "坚持度", value: persistence },
    ]);

    return [
      { metric: "速度", value: speed * 100 },
      { metric: "准确度", value: accuracy * 100 },
      { metric: "难度", value: difficulty * 100 },
      { metric: "稳定性", value: stability * 100 },
      // { metric: "记忆力", value: memory },
      // { metric: "坚持度", value: persistence },
    ];
  }

  /* ---------- 答题结束 ---------- */
  const isFinished = words.length === 0;

  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold mb-10">Review Test</h1>
      <div className="mb-6">
        <span className="mr-4 font-semibold">Score: {score}</span>
        <span className="font-semibold">Progress: {progress}/{basePairs.length}</span>
      </div>

      <div className="flex justify-center gap-20">

        {/* Words */}
        <div>
          <h2 className="text-xl mb-4 font-semibold">Words</h2>
          <div className="flex flex-col items-center gap-4">
            {words.map(w => (
              <div
                key={w.id}
                id={`word-${w.id}`}
                draggable
                onDragStart={(e) => onDragStart(e, w.id)}
                className="px-6 py-3 rounded-xl shadow cursor-grab text-lg font-medium
                           transition-transform active:scale-95"
                style={{ background: w.color }}
              >
                {w.word}
              </div>
            ))}
          </div>
        </div>

        {/* Meanings */}
        <div>
          <h2 className="text-xl mb-4 font-semibold">Meanings</h2>
          <div className="flex flex-col items-center gap-4">
            {meanings.map(m => (
              <div
                key={m.id}
                id={`meaning-${m.id}`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, m)}
                className={`
                  px-6 py-3 rounded-xl shadow text-lg font-medium border-2 border-dashed
                  transition-all
                  ${matchedIds.includes(m.id)
                    ? "animate-[match_0.5s_ease-out] border-green-500 bg-green-300"
                    : "border-gray-400"
                  }
                `}
                style={!matchedIds.includes(m.id) ? { background: m.color } : {}}
              >
                {m.meaning}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Result Summary</h2>
          <p className="mb-2">Total Score: {score}</p>
          <p className="mb-2">Accuracy: {Math.round((answers.filter(a => a.correct).length / answers.length) * 100)}%</p>
          <p className="mb-2">Total Questions: {answers.length}</p>
          <RadarResult data={calcRadarData()}></RadarResult>
        </div>
      )}

      <style>{`
        @keyframes match {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15) rotate(2deg); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }

        .shake-once {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

    </div>
  );
}
