import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { EmployeesHandler } from "./employees.js";
import dotenv from "dotenv";

const empHandler = new EmployeesHandler();
const authUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null || token == undefined) return res.sendStatus(401); // unauthorized
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // forbidden
    req.user = user;
    console.log("user is legit");
    next();
  });
};

const isUser = async (userInfo) => {
  if (userInfo.email && userInfo.password) {
    // console.log(userInfo);
    return true;
  }
  console.log("Not user:", userInfo);
  return false;
};

const app = express();
const port = 6969;

dotenv.config();

app.use(cors());
app.use(express.json());

app.listen(port, () => console.log(`Listening to port ${port}`));

app.post("/auth", async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    rememberMe: req.body.rememberMe,
  };
  if (await isUser(user)) {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    console.log("sent token");
    res.json({ accessToken });
  } else {
    console.log("sent 401");
    res.sendStatus(401);
  }
});

app.post("/unauth", authUser, async (req, res) => {
  console.log("logged out");
  res.sendStatus(200);
});

app.get("/data", authUser, async (req, res) => {
  res.json(await empHandler.findAll());
});

app.get("/data/:id", authUser, async (req, res) => {
  let userID = req.params.id;
  console.log(userID);
  let user = await empHandler.findById(userID);
  // console.log(userID);
  if (user) {
    console.log("user found and sent to the client");
    res.send(user);
  } else {
    res.status(404).send({ error: "User not found in GET!" });
  }
});

app.post("/data", authUser, async (req, res) => {
  let result = await empHandler.addEmployee(req.body);
  if (Object.keys(result).length == 0) {
    res.sendStatus(400);
  }
  res.json(result);
});

app.put("/data/:id", authUser, async (req, res) => {
  let user = await empHandler.findById(req.params.id);
  if (user) {
    let data = req.body;
    if (data.id == req.params.id) {
      let result = await empHandler.updateEmployee(data);
      console.log("user found and updated");
      res.json(result);
    } else {
      res.status(404).json({ error: "user not found in PUT!" });
    }
  } else {
    res.status(404).json({ error: "invalid id in PUT!" });
  }
});

app.delete("/data/:id", authUser, async (req, res) => {
  let user = await empHandler.findById(req.params.id);
  if (user && user.id == req.params.id) {
    let result = await empHandler.removeEmployee(user.id);
    if (result) {
      console.log("user found and deleted!");
      res.json({ success: result });
    } else {
      res.status(404).json({ error: "user not found" });
    }
  } else {
    res.status(404).json({ error: "invalid user id" });
  }
});
