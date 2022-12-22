import mongoose from "mongoose";
import { randomBytes } from "crypto";
import dotenv from "dotenv";
const { Schema } = mongoose;

dotenv.config();
await mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`);

const employeesSchema = new Schema(
  {
    id: Schema.ObjectId,
    name: String,
    job: String,
    salary: Number,
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

const Employees = mongoose.model("Employees", employeesSchema);
export class EmployeesHandler {
  constructor(_id, name, job, salary) {
    this._id = _id;
    this.name = name;
    this.job = job;
    this.salary = salary;
  }
  toString = () => {
    return JSON.stringify(this.toObject());
  };

  toObject = (obj) => {
    if (!(obj && obj._id)) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  };

  getData = async () => {
    return this.toObject(await Employees.find());
  };

  findById = async (_id) => {
    if (_id == undefined || _id == null) return undefined;
    // console.log(_id);
    let result = await this.toObject(await Employees.findOne({ _id }));
    return result || undefined;
  };

  // alias for getData()
  findAll = async (empInfo) => {
    // let data = await this.getData();
    if (empInfo) {
      delete empInfo.id;
      // console.log(empInfo);
      let result = this.toObject(await Employees.find(empInfo));
      if (result != null) {
        return result;
      }
      return {};
    }
    return (await this.getData()).map((emp) => this.toObject(emp));
  };

  addEmployee = async (employee) => {
    if (employee.id) {
      return {};
    }
    let result = await Employees.create(employee);
    return result ? result : {};
  };

  updateEmployee = async (employee) => {
    if (employee._id == undefined || employee._id == null) {
      return false;
    }
    let result = await Employees.findOneAndUpdate(
      { _id: employee._id },
      employee,
      {
        new: true,
      }
    );
    console.log(result);
    return result;
  };

  removeEmployee = async (_id) => {
    return await Employees.deleteOne({ _id });
  };
}
