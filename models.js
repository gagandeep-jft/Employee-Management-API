import { Sequelize, Model, DataTypes } from "sequelize";
import { randomBytes } from "crypto";
import mysql from "mysql";
import dotenv from "dotenv";
import { connect } from "http2";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);
const Employees = sequelize.define(
  "Employees",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    job: DataTypes.STRING,
    salary: DataTypes.NUMBER,
  },
  {
    timestamps: false,
  }
);

sequelize
  .authenticate()
  .then(async () => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

export class EmployeesHandler {
  constructor(id, name, job, salary) {
    this.id = id;
    this.name = name;
    this.job = job;
    this.salary = salary;
  }
  toString = () => {
    return JSON.stringify(this.toObject());
  };

  toObject = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  getData = async () => {
    return this.toObject(
      await Employees.findAll()
    );
  };

  findById = async (id) => {
    if (id == undefined || id == null) return undefined;
    // console.log(id);
    let result = await this.toObject(await Employees.findOne({ where: { id } }));
    if (result) {
      return result;
    }
  };

  // alias for getData()
  findAll = async (empInfo) => {
    // let data = await this.getData();
    if (empInfo) {
      delete empInfo.id;
      // console.log(empInfo);
      let result = this.toObject(
        await Employees.findOne({
          where: empInfo,
        })
      );
      if (result != null) {
        return result;
      }
      return {};
    }
    return this.getData();
  };

  addEmployee = async (employee) => {
    if (employee.id) {
      return {};
    }
    employee.id = randomBytes(10).toString("hex");
    let result = await Employees.create(employee);
    if (result.id == employee.id) {
      return employee;
    }
    return {};
  };

  updateEmployee = async (employee) => {
    if (employee.id == undefined || employee.id == null) {
      return {};
    }

    return (await Employees.update(employee, { where: { id: employee.id } }))[0] == 1;
  };

  removeEmployee = async (id) => {
    return (await Employees.destroy({ where: { id } })) == 1;
  };
}

/*
// console.log(
  //   "Adding employee=>",
//   await emp.addEmployee({
  //     name: "Garima",
  //     job: "SDE",
  //     salary: 50000,
  //   })
  // );
  let obj = {};
  
  console.log("Adding employee=>", obj = await emp.addEmployee({
    "name": "Vishal Puri",
    "job": "SDE",
    "salary": 50000
  }));
  
  // obj.id = "ef8a76fb35ffa3c03d87";
  
  console.log(
    "Updating employee=>",
    await emp.updateEmployee({
      name: "Vishal",
      job: "SDE",
      salary: 50000,
      id: obj.id,
    })
    );

console.log(
  "Find Employee by fields =>",
  await emp.findAll({
    name: obj.name,
    job: obj.job,
    salary: obj.salary,
  })
);


// console.log("Find By ID=>", await emp.findById("0d0aa63c763562da965a"));
console.log("Removing employee=>", await emp.removeEmployee(obj.id));
console.log(await emp.getData());
// connection.end();
// */
// const emp = new EmployeesHandler();
// console.log(await emp.getData());