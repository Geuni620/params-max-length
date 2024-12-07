import { useState, useEffect } from "react";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { strToU8, strFromU8, compress, decompress } from "fflate";

interface CompressionResult {
  original: number;
  lzString: number;
  fflate: number;
  selectedMethod: "lzString" | "fflate";
}

function App() {
  const [compressionStats, setCompressionStats] =
    useState<CompressionResult | null>(null);
  const [currentData, setCurrentData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fflate 압축
  const compressWithFflate = (data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const uint8 = strToU8(data);
        compress(uint8, (error, compressed) => {
          if (error) reject(error);
          else {
            const base64 = btoa(
              String.fromCharCode.apply(null, Array.from(compressed))
            );
            resolve(base64);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  // Fflate 압축 해제
  const decompressWithFflate = (compressed: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const uint8 = new Uint8Array(
          atob(compressed)
            .split("")
            .map((c) => c.charCodeAt(0))
        );
        decompress(uint8, (error, decompressed) => {
          if (error) reject(error);
          else {
            resolve(strFromU8(decompressed));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const parseQueryString = (queryString: string) => {
    const params = new URLSearchParams(queryString);
    return Array.from(params.getAll("companySeq")).map(Number);
  };

  const onClick = async () => {
    setIsLoading(true);
    try {
      const randomNumbers = Array.from(
        { length: 1000 },
        () => Math.floor(Math.random() * 999) + 1
      );

      const queryString = randomNumbers
        .map((num) => `companySeq=${num}`)
        .join("&");

      // 각 방식으로 압축
      const lzStringCompressed = compressToEncodedURIComponent(queryString);
      const fflateCompressed = await compressWithFflate(queryString);

      // 가장 효율적인 방법 선택
      const compressionSizes = {
        lzString: lzStringCompressed.length,
        fflate: fflateCompressed.length,
      };

      const selectedMethod = Object.entries(compressionSizes).reduce((a, b) =>
        a[1] < b[1] ? a : b
      )[0] as "lzString" | "fflate";

      setCompressionStats({
        original: queryString.length,
        lzString: lzStringCompressed.length,
        fflate: fflateCompressed.length,
        selectedMethod,
      });

      const compressedData =
        selectedMethod === "lzString" ? lzStringCompressed : fflateCompressed;
      window.history.pushState(
        {},
        "",
        `?q=${encodeURIComponent(compressedData)}&method=${selectedMethod}`
      );

      setCurrentData(randomNumbers);
    } catch (error) {
      console.error("에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressedData = params.get("q");
    const method = params.get("method") as "lzString" | "fflate" | null;

    if (compressedData && method) {
      (async () => {
        try {
          let decompressedData = "";

          if (method === "lzString") {
            decompressedData =
              decompressFromEncodedURIComponent(compressedData) || "";
          } else if (method === "fflate") {
            decompressedData = await decompressWithFflate(
              decodeURIComponent(compressedData)
            );
          }

          if (decompressedData) {
            const numbers = parseQueryString(decompressedData);
            setCurrentData(numbers);
          }
        } catch (error) {
          console.error("데이터 복원 중 에러:", error);
        }
      })();
    }
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <button
        onClick={onClick}
        disabled={isLoading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: isLoading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {isLoading ? "처리 중..." : "압축 테스트"}
      </button>

      {compressionStats && (
        <div style={{ marginTop: "30px" }}>
          <h2
            style={{
              marginBottom: "20px",
              color: "#333",
              borderBottom: "2px solid #007bff",
              paddingBottom: "10px",
            }}
          >
            압축 결과 비교
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              maxWidth: "1200px",
            }}
          >
            {Object.entries(compressionStats)
              .filter(([key]) => key !== "selectedMethod")
              .map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    padding: "20px",
                    backgroundColor:
                      key === compressionStats.selectedMethod
                        ? "#e3f2fd"
                        : "#f8f9fa",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border:
                      key === compressionStats.selectedMethod
                        ? "2px solid #007bff"
                        : "none",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px 0", color: "#343a40" }}>
                    {key === "original"
                      ? "원본 크기"
                      : key === "lzString"
                      ? "LZ-String"
                      : "Fflate"}
                  </h3>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#007bff",
                    }}
                  >
                    {value.toLocaleString()} bytes
                  </div>
                  {key !== "original" && (
                    <div
                      style={{
                        color: "#6c757d",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    >
                      압축률:{" "}
                      {((1 - value / compressionStats.original) * 100).toFixed(
                        1
                      )}
                      %
                      {key === compressionStats.selectedMethod && (
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "#28a745",
                            fontWeight: "bold",
                          }}
                        >
                          ✓ 최적
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {currentData.length > 0 && (
        <div style={{ marginTop: "30px" }}>
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
