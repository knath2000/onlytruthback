import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/health", () => ({ status: "ok" }))
  .listen(3001);

console.log(`🦊 OnlyTruth backend running at http://localhost:${app.server?.port}`); 