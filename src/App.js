import React, { useState } from "react";
import * as XLSX from "xlsx";

// Fisher-Yates shuffle (문제 순서 랜덤용)
function shuffle(arr) {
  const a = arr.slice(); // create a shallow copy to avoid mutating input
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function App() {
  const [quizList, setQuizList] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("ALL");
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [shuffledQuiz, setShuffledQuiz] = useState([]);
  const [score, setScore] = useState(0);

  function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const rows = data.slice(1).filter((r) => r.length >= 4);
      const quizzes = rows.map(([unit, question, answer, explanation]) => ({
        unit,
        question,
        answer: answer?.toString().trim().toUpperCase(),
        explanation,
      }));
      setQuizList(quizzes);
      const uniqueUnits = [
        ...new Set(quizzes.map((q) => q.unit).filter((v) => !!v)),
      ];
      setUnits(uniqueUnits);
      setSelectedUnit("ALL");
      setStarted(false);
      setIdx(0);
      setShuffledQuiz([]);
      setScore(0);
    };
    reader.readAsBinaryString(file);
  }

  function startQuiz(unit) {
    setSelectedUnit(unit);
    setStarted(true);
    setIdx(0);
    setShowAnswer(false);
    setUserAnswer(null);
    setScore(0);
    const filtered =
      unit === "ALL"
        ? quizList
        : quizList.filter((q) => q.unit === unit);
    console.log("Before shuffle:", filtered);
    const shuffled = shuffle(filtered);
    console.log("After shuffle:", shuffled);
    setShuffledQuiz(shuffled);
  }

  const current = shuffledQuiz[idx];

  function submit(ans) {
    setUserAnswer(ans);
    setShowAnswer(true);
    if (ans === current.answer) setScore((s) => s + 1);
  }

  function next() {
    setShowAnswer(false);
    setUserAnswer(null);
    setIdx(idx + 1);
  }

  // 전체 흰 바탕, 미니멀 스타일
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto my-8 bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
        {!quizList.length && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">OX 퀴즈 엑셀 업로드</h1>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFile}
              className="block w-full p-2 border rounded-lg bg-gray-50 mb-6"
            />
            <p className="text-xs text-gray-500 text-center">
              엑셀 파일: <span className="font-mono">단원 | 문제 | 정답(O/X) | 해설</span>
            </p>
          </>
        )}

        {quizList.length > 0 && !started && (
          <div className="flex flex-col items-center">
            <h2 className="text-lg mb-2 text-gray-700 font-semibold">단원 선택 or 전체 랜덤</h2>
            <button
              className="w-full py-3 my-2 bg-black rounded-xl text-lg font-bold text-white shadow-sm hover:bg-gray-900 transition"
              onClick={() => startQuiz("ALL")}
            >
              전체 랜덤
            </button>
            {units.map((u) => (
              <button
                key={u}
                className="w-full py-3 my-2 bg-gray-200 rounded-xl text-lg font-bold text-gray-800 shadow-sm hover:bg-gray-300 transition"
                onClick={() => startQuiz(u)}
              >
                {u}
              </button>
            ))}
          </div>
        )}

        {started && shuffledQuiz.length > 0 && idx < shuffledQuiz.length && (
          <div>
            <div className="mb-2 text-xs text-gray-400">단원: <span className="font-bold">{current.unit}</span></div>
            <div className="text-xl font-semibold mb-8 text-gray-900 text-center">{current.question}</div>
            {!showAnswer ? (
              <div className="flex justify-center gap-10 mb-6">
                <button
                  className="w-20 h-20 text-3xl bg-white border-2 border-green-400 hover:bg-green-100 rounded-full shadow transition-all"
                  onClick={() => submit("O")}
                >
                  O
                </button>
                <button
                  className="w-20 h-20 text-3xl bg-white border-2 border-red-400 hover:bg-red-100 rounded-full shadow transition-all"
                  onClick={() => submit("X")}
                >
                  X
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-4">
                <div className={`text-2xl font-bold mb-3 ${userAnswer === current.answer ? "text-green-600" : "text-red-600"}`}>
                  {userAnswer === current.answer ? "정답!" : "오답!"}
                </div>
                <div className="mb-1 text-base">
                  <span className="font-semibold">정답:</span> <span className="text-black">{current.answer}</span>
                </div>
                <div className="mb-2 text-sm bg-gray-50 border border-gray-200 rounded p-2 text-gray-700">
                  <span className="font-semibold">해설:</span> {current.explanation}
                </div>
                <button
                  className="mt-3 px-6 py-2 bg-black hover:bg-gray-900 text-white rounded-xl shadow transition"
                  onClick={next}
                >
                  다음 문제
                </button>
              </div>
            )}
            <div className="text-xs text-gray-400 mt-2 text-center">{idx + 1} / {shuffledQuiz.length}</div>
            <div className="text-xs text-right text-gray-400 mt-2">
              현재 점수: <b>{score}</b>
            </div>
          </div>
        )}

        {started && idx >= shuffledQuiz.length && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-3 text-black">퀴즈 끝!</h2>
            <div className="mb-3 text-lg text-gray-700">
              점수: <b>{score} / {shuffledQuiz.length}</b>
              <span className="ml-2 text-sm text-gray-400">({Math.round((score/shuffledQuiz.length)*100)}%)</span>
            </div>
            <button
              className="py-2 px-5 bg-black rounded-xl text-white font-semibold shadow my-2"
              onClick={() => setStarted(false)}
            >
              다시 단원 고르기
            </button>
            <button
              className="py-2 px-5 bg-gray-300 rounded-xl text-gray-800 font-semibold shadow my-2"
              onClick={() => { setIdx(0); setShowAnswer(false); setUserAnswer(null); setScore(0); }}
            >
              다시 풀기
            </button>
          </div>
        )}
      </div>
      <div className="mt-6 text-xs text-gray-400">made with 💻 by ChatGPT + 여래</div>
    </div>
  );
}

export default App;