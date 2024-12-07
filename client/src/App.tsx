import { useEffect } from "react";
import "./App.css";

function App() {
  const sendRequest = async (queryString: string) => {
    try {
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

  const onClick = async () => {
    const randomNumbers = Array.from(
      { length: 2000 },
      () => Math.floor(Math.random() * 999) + 1
    );

    const queryString = randomNumbers
      .map((num) => `companySeq=${num}`)
      .join("&");

    try {
      window.history.pushState({}, "", `?${queryString}`);
      await sendRequest(queryString);
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  useEffect(() => {
    const currentQueryString = window.location.search.slice(1);

    if (currentQueryString) {
      // URL 상태는 유지하되 POST 요청으로 처리
      sendRequest(currentQueryString);
    }
  }, []);

  return (
    <div>
      <button onClick={onClick}>Call</button>
    </div>
  );
}

export default App;
