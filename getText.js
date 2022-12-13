import { createServer } from "http";
const httpServer = createServer();

httpServer.on("request", (req, res)=>{
	console.log("received request");
	res.write("Text sent to the client");
	res.end();
}
)

httpServer.on("connection", (req, res)=>{
	console.log("connection established");
	}
)



httpServer.listen(8080, ()=> console.log("listening to port 8080"));

