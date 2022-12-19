import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
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
    return await new Promise((resolve) => {
      connection.query(`SELECT * FROM Employees`, (err, result, fields) => {
        if (err) {
          console.log(err);
          throw err;
        }
        resolve(this.toObject(result));
      });
    });
  };

  findById = async (id) => {
    return await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM Employees WHERE id=?",
        [id],
        (err, result, fields) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          // console.log(this.toObject(employee));
          result = this.toObject(result);
          resolve(result.length > 0 ? result[0] : undefined);
        }
      );
    });
  };

  // alias for getData()
  findAll = async (empInfo) => {
    // let data = await this.getData();
    if (empInfo) {
      return await new Promise((resolve, reject) => {
        connection.query(
          "SELECT * FROM Employees WHERE name=? AND job=? AND salary=?",
          [empInfo.name, empInfo.job, empInfo.salary],
          (err, result, fields) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            // console.log(this.toObject(result));
            resolve(this.toObject(result));
          }
        );
      });
    }
    return await this.getData();
  };

  addEmployee = async (employee) => {
    if (employee.id) {
      return {};
    }

    return await new Promise((resolve, reject) => {
      employee.id = randomBytes(7).toString("hex");
      connection.query(
        "INSERT INTO Employees (id, name, job, salary) VALUES (?, ?, ?, ?)",
        [employee.id, employee.name, employee.job, employee.salary],
        (err, result, fields) => {
          if (err) {
            console.log(err);
            reject({});
            throw err;
          }
          resolve(this.toObject(employee));
        }
      );
    });
  };

  updateEmployee = async (employee) => {
    if (employee.id == undefined || employee.id == null) {
      return {};
    }

    return await new Promise((resolve, reject) => {
      connection.query(
        "UPDATE Employees SET name=?, job=?, salary=? WHERE id=?",
        [employee.name, employee.job, employee.salary, employee.id],
        (err, result, fields) => {
          if (err) {
            console.log(err);
            reject(err);
            throw err;
          }
          // console.log(this.toObject(result));
          if (result.changedRows == 0) {
            return resolve({});
          }
          resolve(employee);
        }
      );
    });
  };

  removeEmployee = async (id) => {
    return await new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM Employees WHERE id=?",
        id,
        (err, result, fields) => {
          if (err) {
            console.log(err);
            reject(false);
          }
          // console.log(this.toObject(result));
          resolve(this.toObject(result).affectedRows == 1);
        }
      );
    });
  };
}

// const emp = new EmployeesHandler();
// console.log(
//   "Adding employee=>",
//   await emp.addEmployee({
//     name: "Gagan Deep Singh",
//     job: "SDE",
//     salary: 50000,
//   })
// );

// console.log("Adding employee=>", await emp.addEmployee({
//   "name": "Vishal Puri",
//   "job": "SDE",
//   "salary": 50000
// }));

// console.log(
//   "Updating employee=>",
//   await emp.updateEmployee({
//     name: "Gagan Gulyani",
//     job: "SDE",
//     salary: 50000,
//     id: "f9bed5ad94942a",
//   })
// );

// console.log(
//   "Find Employee by fields =>", await emp.findAll({
//     name: "Gagan Gulyani",
//     job: "SDE",
//     salary: 500000,
//   })
// );

// console.log("Find By ID=>", await emp.findById(""));
// console.log("Removing employee=>", await emp.removeEmployee())
// console.log(await emp.getData());
// connection.end();
