import { createServer } from "http";
const httpServer = createServer();

httpServer.on("request", (req, res)=>{
	console.log("received request");
	res.setHeader('Content-Type', 'application/json');
	res.write(JSON.stringify({
	  "text": "Hello from the other side!!",
	  "data":   {
		        "name": "Gagan",
		        "age": 69
	            },
		})
	);
	res.end();
	console.log("Data sent!");
}
)

httpServer.on("connection", (req, res)=>{
	console.log("connection established");
	}
)



httpServer.listen(8081, ()=> console.log("listening to port 8080"));

