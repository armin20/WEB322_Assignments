/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Armin Sharifiyan Student ID: 130891203 Date: August 12, 2021
 *
 *  Online (Heroku) Link: https://boiling-cove-50111.herokuapp.com/
 *
 ********************************************************************************/
var data_service = require("./data-service");
var dataServiceAuth = require("./data-service-auth");
var express = require("express");
var app = express();
var path = require("path");
var multer = require("multer");
var fs = require("fs");
var bodyparser = require("body-parser");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
var HTTP_PORT = process.env.PORT || 8080;
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
app.use(bodyparser.urlencoded({ extended: true }));

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static("public"));

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute
            ? ' class="active _style" '
            : ' class=" _style" ') +
          '><a href="' +
          url +
          '" ' +
          ' style="color: black;" >' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3) {
          throw new Error("Handlebars Helper equal needs 2 parameters");
        }
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");
app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_assign_session",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

//Function for checking the user is login or not.
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.get("/", function (req, res) {
  res.render("home", { title: "Home" });
});

app.get("/about", function (req, res) {
  res.render("about", { title: "About" });
});

// app.get("/managers", function (req, res) {
//   data_service
//     .getManager()
//     .then((emp) => {
//       res.json(emp);
//     })
//     .catch((error) => {
//       res.json({ "Message:": error });
//     });
// });

app.get("/departments", ensureLogin, function (req, res) {
  // ensureLogin(req, res);
  data_service
    .getDepartment()
    .then((emp) => {
      if (emp.length > 0) {
        res.render("departments", { departments: emp, title: "Department" });
      } else {
        res.render("departments", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render({ message: "no results" });
    });
});

app.get("/employees", ensureLogin, function (req, res) {
  if (req.query.status) {
    data_service
      .getEmployeesByStatus(req.query.status)
      .then((empstatus) => {
        res.render("employees", { employees: empstatus });
      })
      .catch((error) => {
        res.render({ message: "no results" });
      });
  } else if (req.query.department) {
    data_service
      .getEmployeesByDepartment(req.query.department)
      .then((deptStatus) => {
        res.render("employees", { employees: deptStatus });
      })
      .catch((error) => {
        res.render({ message: "no results" });
      });
  } else if (req.query.manager) {
    data_service
      .getEmployeesByManager(req.query.manager)
      .then((managerStatus) => {
        res.render("employees", { employees: managerStatus });
      })
      .catch((error) => {
        res.render({ message: "no results" });
      });
  } else {
    data_service
      .getAllEmployees()
      .then((emp) => {
        if (emp.length > 0) {
          res.render("employees", { employees: emp, title: "Employees" });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((error) => {
        res.render({ message: "no results" });
      });
  }
});

//Route for adding employee
app.get("/employees/add", ensureLogin, (req, res) => {
  data_service
    .getDepartment()
    .then((data) => {
      res.render("addEmployee", {
        departments: data,
        // title: "Add Employee",
      });
    })
    .catch(() => {
      res.render("addEmployee", { departments: [], title: "Add Employee" });
    });
});

app.post("/employees/add", ensureLogin, (req, res) => {
  data_service
    .addEmployee(req.body)
    .then(res.redirect("/employees"))
    .catch((error) => {
      res.json({ "Message: ": error });
    });
});

//Route for getting employee by employeeNum
app.get("/employee/:value", ensureLogin, (req, res) => {
  let viewData = {};
  data_service
    .getEmployeeByNum(req.params.value)
    .then((data) => {
      if (data) {
        viewData.employee = data;
      } else {
        viewData.employee = null;
      }
      // res.render("employee", { employee: empvalue });
    })
    .catch(() => {
      viewData.employee = null;
      // res.render("employee", { message: "no result" });
    })
    .then(data_service.getDepartment)
    .then((data) => {
      viewData.departments = data;
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = [];
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData });
      }
    });
});

//get route to employee.hbs to show the employee data and have a feature to update
app.post("/employee/update", ensureLogin, (req, res) => {
  console.log(req.body);
  data_service
    .updateEmployee(req.body)
    .then((data) => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.json({ "Message: ": err });
    });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
  data_service
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});
//------------------------------------------------------------------------------------------
//Route for uploading image
app.get("/images/add", ensureLogin, (req, res) => {
  res.render("addImage", { title: "Add Image" });
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", ensureLogin, (req, res) => {
  fs.readdir("./public/images/uploaded", "utf-8", (err, data) => {
    if (err) {
      console.log("Error cannot read the file");
    } else {
      res.render("images", { images: data, title: "Images" });
    }
  });
});

//-------------------------------rout for adding department---------------------------------
app.get("/departments/add", ensureLogin, (req, res) => {
  res.render("addDepartment", { title: "Add Department" });
});
app.post("/departments/add", ensureLogin, (req, res) => {
  data_service
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.json({ "Message: ": err });
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
  data_service
    .updateDepartment(req.body)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.json({ Message: err });
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
  data_service
    .getDepartmentById(req.params.departmentId)
    .then((data) => {
      if (data == undefined) {
        res.status(404).send("Department Not Found");
      }
      res.render("department", { depts: data });
    })
    .catch(() => {
      res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
  data_service
    .deleteDepartmentById(req.params.departmentId)
    .then((data) => {
      if (data == undefined) {
        res.status(404).send("Department Not Found");
      } else {
        res.redirect("/departments");
      }
    })
    .catch(() => {
      res
        .status(404)
        .send("Unable to Remove Department / Department not found");
    });
});
app.use((req, res, next) => {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

//----------------------------route for login user-----------------------------
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  dataServiceAuth
    .registerUser(req.body)
    .then((data) => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  dataServiceAuth
    .checkUser(req.body)
    .then((user) => {
      console.log("---------------------------------------");
      console.log(user);
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };

      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, user: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory"); //add the ensurelogin
});

//The line below check if the route that the user asks is not defined, it shows the 404 Not Found page.
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/404.html"));
});

data_service
  .initializer()
  .then(dataServiceAuth.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart());
  })
  .catch((err) => {
    console.log("unable to start server: " + err);
  });

//----------------------------------------------
// data_service
//   .initializer()
//   .then((message) => {
//     console.log(message);
//     app.listen(HTTP_PORT, onHttpStart());
//   })
//   .catch(function (err) {
//     console.log(err);
//   });
