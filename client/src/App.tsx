import { useEffect } from "react";
import "./App.css";

function App() {
  const onClick = async () => {
    const randomNumbers = Array.from(
      { length: 2000 },
      () => Math.floor(Math.random() * 999) + 1
    );

    // URL 쿼리 문자열 직접 생성
    const queryString = randomNumbers
      .map((num) => `companySeq=${num}`)
      .join("&");

    try {
      window.history.pushState({}, "", `?${queryString}`);

      const response = await fetch(`http://localhost:8000/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companySeqs: queryString,
        }),
      });

      const data = await response.text();
      console.log("서버 응답:", data);
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, []);

  return (
    <div>
      <button onClick={onClick}>Call</button>
    </div>
  );
}

export default App;
