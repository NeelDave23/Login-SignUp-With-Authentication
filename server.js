const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const md5 = require("md5");
const queries = require("./query/queries");
const { pool } = require("./model/dbConfig");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "some data...";
const sendmail = require("./sendmail");
const controller = require("./controller/controller");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", controller.index);

app.get("/users/signup", controller.signup);

app.get("/users/login", controller.login);

app.get("/users/dashboard", controller.dashboard);

app.post("/users/signup", controller.postsignup);

app.post("/users/login", controller.postlogin);

app.get("/users/forgetpass", controller.forgetpass);

app.post("/users/forgetpass", controller.postforgetpass);

app.get("/sendmail", sendmail);

app.get("/users/resetpass/:id/:tokens", controller.resetpass);

app.post("/users/resetpass/:id/:token", controller.postresetpass);

app.listen(3000, () => {
  console.log("Listering on post 3000");
});
