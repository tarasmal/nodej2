import http from "http";
import Router from "./classes/Router/Router.js";
import process from 'node:process';
import gracefulShutdown from "./utils/gracefulShutdown.js";

const router = new Router();

router.get("/example", (req, res, payload) => {
  console.log(payload);
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("GET request to /example");
});

router.post("/example/:id", async (req, res, payload) => {
  console.log(payload);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "POST request to /example", payload }));
});

router.get('/user', (req, res, payload) => {
  console.log(payload);
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("GET request to /user");
})

router.put('/user', (req, res, payload) => {
  console.log(payload)
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "PUT request to /user", payload }));
})
console.log(router);

const server = http.createServer((req, res) => router.handleRequest(req, res));

const PORT = 3001;

server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
process.on('SIGINT',  () => {
  gracefulShutdown(server);
});


