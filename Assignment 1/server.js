/*********************************************************************************
 *  WEB322 – Assignment 1
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: Armin Sharifiyan     Student ID: 130891203    Date: May 27, 2021
 *
 *  Online (Heroku) URL: https://intense-everglades-40056.herokuapp.com/
 *
 ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

app.get("/", (req, res) => {
  res.send("Armin Sharifiyan, 130891203");
});
app.listen(HTTP_PORT);
