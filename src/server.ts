import { http } from "./http";
import "./websocket/client";
import "./websocket/admin";
import "dotenv/config";

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "0.0.0.0";

http.listen(PORT, HOST, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`)
);
