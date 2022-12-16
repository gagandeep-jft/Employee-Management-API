import { promises as fs } from "fs";
import { randomBytes } from "crypto";

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

  toObject = () => {
    return {
      id: this.id,
      name: this.name,
      job: this.job,
      salary: this.salary,
    };
  };

  getData = async () => {
    try {
      return JSON.parse(await fs.readFile("./data.json"))["Employees"]
        ? JSON.parse(await fs.readFile("./data.json"))["Employees"]
        : [];
    } catch {
      return [];
    }
  };

  updateData = async (employees) => {
    await fs.writeFile("./data.json", JSON.stringify({ Employees: employees }));
    return employees;
  };

  findById = async (id) => {
    for (let obj of await this.getData()) {
      if (obj.id == id) {
        return obj;
      }
    }
  };
  // alias for getData()
  findAll = async (empInfo) => {
    let data = await this.getData();
    if (empInfo) {
      return data.filter(
        (emp) =>
          emp.name == empInfo.name &&
          emp.job == empInfo.job &&
          emp.salary == empInfo.salary
      );
    }
    return data;
  };

  addEmployee = async (employee) => {
    let employees = await this.getData();
    if (employee.id) {
      return {};
    }
    employee.id = randomBytes(7).toString("hex");
    employees.push(employee);
    console.log(employee);
    this.updateData(employees);
    return employee;
  };
  updateEmployee = async (employee) => {
    let employees = await this.getData();
    console.log(employees);
    for (let i = 0; i < employees.length; i++) {
      if (employee.id == employees[i].id) {
        employees[i] = employee;
        await this.updateData(employees);
        console.log("FOUND and REPLACED!!");
        return employee;
      }
    }
    return {};
  };

  removeEmployee = async (id) => {
    let employees = await this.getData();
    let size = employees.length;
    employees = employees.filter((employee) => id != employee.id);
    this.updateData(employees);
    return size !== employees.length;
  };
}
