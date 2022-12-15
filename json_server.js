import express from "express";
import cors from "cors";
import { EmployeesHandler } from "./employees.js";

const app = express();
const port = 6969;

const empHandler = new EmployeesHandler();

app.use(cors());
app.use(express.json());

app.listen(port, () => console.log(`Listening to port ${port}`));

app.get("/data", async (req, res) => {
  res.json(await empHandler.findAll());
});

app.get("/data/:id", async (req, res) => {
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

app.post("/data", async (req, res) => {
  res.json(await empHandler.addEmployee(req.body));
});

app.put("/data/:id", async (req, res) => {
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

app.delete("/data/:id", async (req, res) => {
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