import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // 클라이언트의 주소
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Requested-With"],
    maxAge: 86400,
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 8000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

app.get("/health", (c) => {
  return c.json({ message: "OK" });
});

/**
app.get("/test", (c) => {
  const companySeq = c.req.queries("companySeq");

  if (!companySeq) {
    return c.json({
      message: "companySeq 파라미터가 없습니다.",
    });
  }

  console.log("받은 companySeq 개수:", companySeq.length);
  console.log("companySeq 값들:", companySeq);

  return c.json({
    count: companySeq.length,
    companySeqs: companySeq,
    message: "요청이 성공적으로 처리되었습니다.",
  });
});
 */

app.post("/test", async (c) => {
  const body = await c.req.json();
  const queryString = body.companySeqs;

  // queryString을 파싱하여 companySeq 값들을 추출
  const params = new URLSearchParams(queryString);
  const companySeqs = Array.from(params.getAll("companySeq"));

  if (!companySeqs.length) {
    return c.json({
      message: "companySeq 파라미터가 없습니다.",
    });
  }

  console.log("받은 companySeq 개수:", companySeqs.length);
  console.log("companySeq 값들:", companySeqs.slice(0, 10), "..."); // 처음 10개만 로깅

  return c.json({
    count: companySeqs.length,
    companySeqs: companySeqs.slice(0, 10), // 응답에는 처음 10개만 포함
    message: "요청이 성공적으로 처리되었습니다.",
  });
});
