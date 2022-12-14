import http from "http";
import { promises as fs } from "fs";

http
  .createServer(async (req, res) => {
    switch (req.url) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(await fs.readFile("index.html"));
        res.end();
        break;
      case "/text":
        res.setHeader("Content-Type", "text");
        res.write(await fs.readFile("plainText.txt"));
        res.end();
        break;
      case "/json":
        let jsonData = await fs.readFile("./data.json");
        // console.log(JSON.parse(jsonData));
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(JSON.parse(jsonData)));
        break;

      case "/html":
        res.writeHead(301, {
          Location: "/",
        });
        res.end();
        break;
      case "/404":
      default:
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write("<h1>404, Not Found!</h1>");
        res.end();
    }
  })
  .listen(8080, () => console.log("Listening to port 8080"));
