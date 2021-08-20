/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Armin Sharifiyan Student ID: 130891203 Date: June 8, 2021
 *
 *  Online (Heroku) Link: https://obscure-dusk-72269.herokuapp.com/
 *
 ********************************************************************************/

var data_service = require("./data-service");
var express = require("express");
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});
app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});
app.get("/employees", function (req, res) {
  data_service
    .getAllEmployees()
    .then((emp) => {
      res.json(emp);
    })
    .catch((error) => {
      res.json({ "Message: ": error });
    });
});
app.get("/managers", function (req, res) {
  data_service
    .getManager()
    .then((emp) => {
      res.json(emp);
    })
    .catch((error) => {
      res.json({ "Message:": error });
    });
});
app.get("/departments", function (req, res) {
  data_service
    .getDepartment()
    .then((emp) => {
      res.json(emp);
    })
    .catch((error) => {
      res.json({ "Message:": error });
    });
});
//The line below check if the route that the user asks is not defined, it shows the 404 Not Found page.
app.get("*", function (req, res) {
  res.redirect("https://i.redd.it/l051i0y03e761.png"); //This line is redirect the user to 404 Not Found.
});
data_service
  .initializer()
  .then((message) => {
    console.log(message);
    app.listen(HTTP_PORT, onHttpStart());
  })
  .catch(function (err) {
    console.log(err);
  });
