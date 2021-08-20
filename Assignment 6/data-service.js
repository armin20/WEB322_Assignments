const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "dbnd9m5thgbl6h",
  "smgpctsrfbyhbd",
  "c2ad6bf9f63230f21aa07f39b55fe02b6deb83f3f3ed700c3f99c1094680e6b7",
  {
    host: "ec2-52-0-67-144.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

sequelize
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

var employees = sequelize.define(
  "Employee",
  {
    employeeNum: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING,
  },
  {
    createAt: false,
    updatedAt: false,
  }
);

var departments = sequelize.define(
  "Department",
  {
    departmentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    departmentName: Sequelize.STRING,
  },
  {
    createAt: false,
    updatedAt: false,
  }
);
departments.hasMany(employees, { foreignKey: "department" });

module.exports.initializer = function () {
  let initialize_promise = new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve("Success!");
      })
      .catch((err) => {
        reject("unable to sync the database");
      });
  });
  return initialize_promise;
};

module.exports.getAllEmployees = function () {
  let Allemployee = new Promise((resolve, reject) => {
    employees
      .findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
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
    departments
      .findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
  return dept;
};

module.exports.addEmployee = function (employeeData) {
  employeeData.isManager = employeeData.isManager ? true : false;
  for (let i in employeeData) {
    if (employeeData[i] == "") {
      employeeData[i] = null;
    }
  }
  let addEmp = new Promise((resolve, reject) => {
    employees.findAll().then(() => {
      employees
        .create({
          employeeNum: employeeData.employeeNum,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          SSN: employeeData.SSN,
          addressStreet: employeeData.addressStreet,
          addressCity: employeeData.addressCity,
          addressState: employeeData.addressState,
          addressPostal: employeeData.addressPostal,
          maritalStatus: employeeData.maritalStatus,
          isManager: employeeData.isManager,
          employeeManagerNum: employeeData.employeeManagerNum,
          status: employeeData.status,
          department: employeeData.department,
          hireDate: employeeData.hireDate,
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject("unable to create employee");
        });
    });
  });
  return addEmp;
};

module.exports.getEmployeesByStatus = function (status) {
  let empWithStatus = new Promise((resolve, reject) => {
    employees
      .findAll({ where: { status: status } })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });

  return empWithStatus;
};

module.exports.getEmployeesByDepartment = function (department) {
  let employee = new Promise((resolve, reject) => {
    employees
      .findAll({ where: { department: department } })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
  return employee;
};

module.exports.getEmployeesByManager = function (manager) {
  let employeeWithManagerNum = new Promise((resolve, reject) => {
    employees
      .findAll({ where: { employeeManagerNum: manager } })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
  return employeeWithManagerNum;
};
module.exports.getEmployeeByNum = function (num) {
  let returnEmp = new Promise((resolve, reject) => {
    employees
      .findAll({ where: { employeeNum: num } })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
  return returnEmp;
};

module.exports.updateEmployee = function (employeeData) {
  employeeData.isManager = employeeData.isManager ? true : false;
  for (let i in employeeData) {
    if (employeeData[i] == "") {
      employeeData[i] = null;
    }
  }
  let promise = new Promise((resolve, reject) => {
    employees.findAll().then(() => {
      employees
        .update(
          {
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate,
          },
          { where: { employeeNum: employeeData.employeeNum } }
        )
        .then(() => {
          resolve("Update is done");
        })
        .catch(() => {
          reject("unable to update employee");
        });
    });
  });
  return promise;
};

//function for adding department
module.exports.addDepartment = function (departmentData) {
  for (let i in departmentData) {
    if (departmentData[i] == "") {
      departmentData[i] = null;
    }
  }
  let addDept = new Promise((resolve, reject) => {
    departments
      .findAll({
        attributes: ["departmentId", "departmentName"],
      })
      .then(() => {
        departments
          .create({
            departmentName: departmentData.departmentName,
          })
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject("unable to create department");
          });
      });
  });
  return addDept;
};

//adding function for updating department
module.exports.updateDepartment = function (departmentData) {
  for (let i in departmentData) {
    if (departmentData[i] == "") {
      departmentData[i] = null;
    }
  }
  let updateDept = new Promise((resolve, reject) => {
    departments.findAll().then(() => {
      departments
        .update(
          {
            departmentName: departmentData.departmentName,
          },
          { where: { departmentId: departmentData.departmentId } }
        )
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject("unable to update department");
        });
    });
  });
  return updateDept;
};

module.exports.getDepartmentById = function (id) {
  let deptbyID = new Promise((resolve, reject) => {
    departments
      .findAll({ where: { departmentId: id } })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
  return deptbyID;
};

//delete department function
module.exports.deleteDepartmentById = function (id) {
  let promise = new Promise((resolve, reject) => {
    departments.findAll().then(() => {
      departments
        .destroy({
          where: { departmentId: id },
        })
        .then(() => {
          resolve("destroyed");
        })
        .catch(() => {
          reject("cannot delete department");
        });
    });
  });
  return promise;
};

//delete employee function
module.exports.deleteEmployeeByNum = function (empNum) {
  let promise = new Promise((resolve, reject) => {
    employees.findAll().then(() => {
      employees
        .destroy({
          where: { employeeNum: empNum },
        })
        .then(() => {
          resolve("destroyed");
        })
        .catch((err) => {
          reject("cannot delete employee");
        });
    });
  });
  return promise;
};
