// App.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [quizList, setQuizList] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("ALL");
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);

  // 파일 업로드 및 파싱
  function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const header = data[0];
      const rows = data.slice(1).filter((r) => r.length >= 4);
      // 단원, 문제, 정답, 해설 추출
      const quizzes = rows.map(([unit, question, answer, explanation]) => ({
        unit,
        question,
        answer: answer.toUpperCase(),
        explanation,
      }));
      setQuizList(quizzes);
      // 단원 목록 만들기
      const uniqueUnits = [
        ...new Set(quizzes.map((q) => q.unit).filter((v) => !!v)),
      ];
      setUnits(uniqueUnits);
      setSelectedUnit("ALL");
      setStarted(false);
      setIdx(0);
    };
    reader.readAsBinaryString(file);
  }

  // 퀴즈 시작
  function startQuiz(unit) {
    setSelectedUnit(unit);
    setStarted(true);
    setIdx(0);
    setShowAnswer(false);
    setUserAnswer(null);
  }

  // 단원별/랜덤 문제 필터
  const filteredQuiz =
    selectedUnit === "ALL"
      ? quizList
      : quizList.filter((q) => q.unit === selectedUnit);

  const current = filteredQuiz[idx];

  function submit(ans) {
    setUserAnswer(ans);
    setShowAnswer(true);
  }

  function next() {
    setShowAnswer(false);
    setUserAnswer(null);
    setIdx(idx + 1);
  }

  if (!quizList.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">OX 퀴즈 엑셀 업로드</h1>
        <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
        <p className="mt-4 text-gray-600">엑셀 파일 형식: 단원 | 문제 | 정답(O/X) | 해설</p>
      </div>
    );

  if (!started)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-lg mb-2">단원을 선택하거나, 랜덤 전체 출제</h2>
        <button
          className="p-2 bg-blue-500 rounded text-white m-2"
          onClick={() => startQuiz("ALL")}
        >
          전체 랜덤
        </button>
        {units.map((u) => (
          <button
            key={u}
            className="p-2 bg-green-400 rounded text-white m-2"
            onClick={() => startQuiz(u)}
          >
            {u}
          </button>
        ))}
      </div>
    );

  // 퀴즈 끝!
  if (idx >= filteredQuiz.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">퀴즈 끝!</h2>
        <button
          className="p-2 bg-blue-500 rounded text-white m-2"
          onClick={() => setStarted(false)}
        >
          다시 단원 고르기
        </button>
        <button
          className="p-2 bg-gray-500 rounded text-white m-2"
          onClick={() => setIdx(0)}
        >
          다시 풀기
        </button>
      </div>
    );

  // 메인 퀴즈 화면
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <div className="mb-2 text-sm text-gray-400">[{current.unit}]</div>
        <div className="text-xl font-semibold mb-8">{current.question}</div>
        {!showAnswer ? (
          <div className="flex gap-8 justify-center">
            <button
              className="text-3xl bg-green-300 rounded-full w-20 h-20"
              onClick={() => submit("O")}
            >
              O
            </button>
            <button
              className="text-3xl bg-red-300 rounded-full w-20 h-20"
              onClick={() => submit("X")}
            >
              X
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div
              className={`text-2xl font-bold mb-2 ${
                userAnswer === current.answer
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {userAnswer === current.answer ? "정답!" : "오답!"}
            </div>
            <div className="mb-2">
              <span className="font-bold">정답:</span> {current.answer}
            </div>
            <div className="mb-4">
              <span className="font-bold">해설:</span> {current.explanation}
            </div>
            <button
              className="p-2 bg-blue-400 text-white rounded"
              onClick={next}
            >
              다음 문제
            </button>
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">
          {idx + 1} / {filteredQuiz.length}
        </div>
      </div>
    </div>
  );
}

export default App;