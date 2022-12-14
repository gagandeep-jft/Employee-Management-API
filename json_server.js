import http from "http";
import { EmployeesHandler } from "./employees.js";

const empHandler = new EmployeesHandler();
const port = 6969;

const getIdFromURL = async (res, url) => {
  let parts = url.split("/");
  let id = parts[parts.length - 1];
  // test if path is alphanumeric
  if (!/^[a-z0-9]+$/i.test(id)) {
    await sendData(res, { error: "Not Found!" }, 404);
  }
  return id;
};

const sendData = async (res, jsonData, statusCode = 200) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(await jsonData));
};

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
    }
    switch (req.url) {
      case "/data":
        switch (req.method) {
          case "GET":
            handleGET(res);
            break;
          case "POST":
            handlePOST(req, res);
            break;
          default:
            res.writeHead(301, { Location: "/404" });
            break;
        }
        break;
      case "/404":
      default:
        if (req.url.includes("/data")) {
          switch (req.method) {
            case "GET":
              handleGETbyID(req, res);
              break;
            case "PUT":
              handlePUTbyID(req, res);
              break;
            case "DELETE":
              handleDELETEbyID(req, res);
              break;
            default:
              res.writeHead(400, "Bad Request");
          }
          break;
        }
        sendData(res, { error: "Not Found!" }, 404);
    }
  })
  .listen(port, () => console.log(`Listening to port ${port}`));

const getDatafromRequest = async (req) => {
  let chunks = [];
  let data = await new Promise((resolve, reject) => {
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
  // console.log(data.toString());
  return JSON.parse(data.toString());
};

const handleGET = async (res) => {
  await sendData(res, await empHandler.findAll());
};

const handlePOST = async (req, res) => {
  let data = await getDatafromRequest(req);
  let user = await empHandler.addEmployee(data);
  await sendData(res, user);
};

const handleGETbyID = async (req, res) => {
  let userID = await getIdFromURL(res, req.url);
  let user = await empHandler.findById(userID);
  // console.log(userID);
  if (user) {
    console.log("user found and sent to the client");
    sendData(res, user);
  } else {
    sendData(res, { error: "user not found in GET!" }, 404);
  }
};

const handlePUTbyID = async (req, res) => {
  let userID = await getIdFromURL(res, req.url);
  let user = await empHandler.findById(userID);
  if (user) {
    let data = await getDatafromRequest(req);
    if (data.id == userID) {
      let result = await empHandler.updateEmployee(data);
      console.log("user found and updated");
      sendData(res, result);
    } else {
      sendData(res, { error: "user not found in PUT!" }, 404);
    }
  } else {
    sendData(res, { error: "invalid id in PUT!" }, 404);
  }
};

const handleDELETEbyID = async (req, res) => {
  let userID = await getIdFromURL(res, req.url);
  let user = await empHandler.findById(userID);
  if (user && user.id == userID) {
    let result = await empHandler.removeEmployee(user.id);
    if (result) {
      console.log("user found and deleted!");
      await sendData(res, { success: result }, 200);
    } else {
      await sendData(res, { error: "user not found" }, 404);
    }
  } else {
    await sendData(res, { error: "invalid user id" }, 404);
  }
};
