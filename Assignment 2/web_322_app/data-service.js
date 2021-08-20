var fs = require("fs");
var employees = [];
var departments = [];
module.exports.initializer = function () {
  let initialize_promise = new Promise(function (resolve, reject) {
    fs.readFile("./data/employees.json", "utf-8", (err, data) => {
      if (err) {
        reject("unable to read file");
      } else {
        employees = JSON.parse(data);
        console.log("Done parsing employees data into the array.");
        fs.readFile("./data/departments.json", "utf-8", (err, data) => {
          if (err) {
            reject("unable to read file");
          } else {
            departments = JSON.parse(data);
            console.log("Done parsing the departments data into the array");
          }
        });
      }
    });
    resolve("Success!");
  });
  return initialize_promise;
};
module.exports.getAllEmployees = function () {
  let Allemployee = new Promise((resolve, reject) => {
    if (employees.length > 0) {
      resolve(employees);
    } else {
      reject("no results returned");
    }
  });
  return Allemployee;
};
module.exports.getManager = function () {
  var manager = [];
  let emp_manager = new Promise((resolve, reject) => {
    for (let i = 0; i < employees.length; i++) {
      if (employees[i].isManager) {
        manager.push(employees[i]);
      }
      if (manager.length > 0) {
        resolve(manager);
      } else {
        reject("no results returned");
      }
    }
  });
  return emp_manager;
};
module.exports.getDepartment = function () {
  let dept = new Promise((resolve, reject) => {
    if (departments.length > 0) {
      resolve(departments);
    } else {
      reject("no results returned");
    }
  });
  return dept;
};
