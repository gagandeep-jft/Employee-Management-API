import express, { request } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Liquid } from "liquidjs";
import { EmployeesHandler } from "./models.js";

const app = express();
const port = 6969;

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const engine = new Liquid();
app.engine("liquid", engine.express());
app.set("views", "./views"); // specify the views directory
app.set("view engine", "liquid"); // set liquid to default

const empHandler = new EmployeesHandler();

const authUserUI = (req, res, next) => {
  const token = req.cookies.token;
  // console.log("Token", token);
  if (token == null || token == undefined) return res.redirect("/login"); // unauthorized
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.clearCookie("token");
      return res.status(403).redirect("/login");
    } // forbidden
    req.user = user;
    // console.log("user is legit");
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

app.get("/", authUserUI, async (req, res) => {
  let employee;
  let employees;

  if (req.cookies.searchResult) {
    employees = JSON.parse(JSON.stringify(req.cookies.searchResult));
    employee = req.cookies.searchResult[0];
  } else {
    employees = await empHandler.findAll();
    employee = await empHandler.findById(req.cookies.userID);
  }

  let err = req.cookies.err;

  res.clearCookie("userID");
  res.clearCookie("searchResult");
  res.clearCookie("err");

  // console.log(employees, employee);
  res.render("index", { title: "Dashboard", employees, employee, err });
});

app.get("/login", async (req, res) => {
  if (req.cookies && req.cookies.token) {
    return res.redirect("/");
  }
  res.render("login", { title: "Login" });
});

app.post("/auth", async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    rememberMe: req.body.rememberMe,
  };
  if (await isUser(user)) {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    console.log("sent token");
    res.cookie("token", accessToken);
    res.redirect("/");
  } else {
    console.log("sent 401");
    res.sendStatus(401);
  }
});

app.get("/logout", authUserUI, async (req, res) => {
  console.log("logged out");
  res.clearCookie("token");
  return res.redirect("/login");
});

// app.get("/data", authUserUI, async (req, res) => {
//   res.json(await empHandler.findAll());
// });

app.post("/data/search", authUserUI, async (req, res) => {
  let [name, job, salary] = [req.body.name, req.body.job, req.body.salary];
  if (!(name && job && salary)) {
    res.cookie("err", "Invalid Input! Try again!");
    return res.redirect("/");
  }
  let result = await empHandler.findAll({ name, job, salary });
  if (Object.keys(result).length == 0) res.cookie("err", "User not found!");
  else {
    res.cookie("searchResult", result);
  }
  return res.redirect("/");
});

// get employee by id
app.post("/data/get/:id", authUserUI, async (req, res) => {
  let userID = req.params.id;
  // console.log(userID);
  let user = await empHandler.findById(userID);
  // console.log(userID);
  if (user) {
    console.log("user found and sent to the client with id:", user._id);
    res.cookie("userID", user._id);
    return res.redirect("/");
  }
  res.sendStatus(404);
});

// add employee
app.post("/data", authUserUI, async (req, res) => {
  let result = await empHandler.addEmployee({
    name: req.body.name,
    job: req.body.job,
    salary: req.body.salary,
  });
  if (Object.keys(result).length == 0) {
    res.sendStatus(400);
  }
  res.redirect("/");
});

// update employee
app.post("/data/update", authUserUI, async (req, res) => {
  console.log("works!");
  let data = req.body;
  let user = await empHandler.findById(req.body.empID);
  if (user) {
    delete data.empID;
    data._id = user._id;
    let result = await empHandler.updateEmployee(data);
    if (!result) {
      res.cookie("err", "user not found!");
      return res.redirect("/");
    }
    console.log("user found and updated");
  } else {
    res.cookie("err", "user not found!");
  }
  return res.redirect("/");
});

app.post("/data/delete/:id", authUserUI, async (req, res) => {
  let user = await empHandler.findById(req.params.id);
  if (user && user._id == req.params.id) {
    let result = await empHandler.removeEmployee(user._id.toString());
    if (result) {
      console.log("user found and deleted!");
      return res.redirect("/");
    }
  }
  return res.status(404).redirect("/");
});

app.post("/data/sort/:field/:sortBy", authUserUI, async(req, res)=>{

});
app.listen(port, () => console.log(`Listening to port ${port}`));
