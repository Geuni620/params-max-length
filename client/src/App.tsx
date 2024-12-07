import { useEffect } from "react";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import "./App.css";

function App() {
  const parseQueryString = (queryString: string) => {
    const params = new URLSearchParams(queryString);
    return Array.from(params.getAll("companySeq")).map(Number);
  };

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
      { length: 3000 },
      () => Math.floor(Math.random() * 999) + 1
    );

    const queryString = randomNumbers
      .map((num) => `companySeq=${num}`)
      .join("&");

    try {
      const compressedQuery = compressToEncodedURIComponent(queryString);
      console.log("압축 전 길이:", queryString.length);
      console.log("압축 후 길이:", compressedQuery.length);

      window.history.pushState({}, "", `?q=${compressedQuery}`);
      await sendRequest(queryString);
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  // URL에서 현재 데이터 가져오기
  const getCurrentData = () => {
    const params = new URLSearchParams(window.location.search);
    const compressedData = params.get("q");

    if (compressedData) {
      try {
        const originalQuery = decompressFromEncodedURIComponent(compressedData);
        if (originalQuery) {
          return parseQueryString(originalQuery);
        }
      } catch (error) {
        console.error("데이터 파싱 중 에러:", error);
      }
    }
    return [];
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressedData = params.get("q");

    if (compressedData) {
      try {
        const originalQuery = decompressFromEncodedURIComponent(compressedData);
        if (originalQuery) {
          console.log("복원된 데이터 길이:", originalQuery.length);
          sendRequest(originalQuery);
        }
      } catch (error) {
        console.error("데이터 복원 중 에러:", error);
      }
    }
  }, []);

  const currentData = getCurrentData();

  return (
    <div>
      <button onClick={onClick}>Call</button>

      {currentData.length > 0 && (
        <div>
          <h2>Company Sequences ({currentData.length}개)</h2>
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginTop: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f8f9fa",
                }}
              >
                <tr>
                  <th
                    style={{ padding: "12px", borderBottom: "2px solid #ddd" }}
                  >
                    번호
                  </th>
                  <th
                    style={{ padding: "12px", borderBottom: "2px solid #ddd" }}
                  >
                    Company Sequence
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((seq, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      {seq}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
