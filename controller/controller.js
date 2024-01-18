const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const md5 = require("md5");
const queries = require("../query/queries");
const { pool } = require("../model/dbConfig");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "some data...";
const sendmail = require("../sendmail");
const nodemailer = require("nodemailer");

const index = (req, res) => {
  res.render("index");
};

const login = (req, res) => {
  //   res
  //     .status(200)
  //     .json({ Message: "Login Page, Please Enter Your Email And Password" });

  res.render("login");
};
const signup = (req, res) => {
  console.log(req.body);
  //   res.status(200).json({
  //     Message:
  //       "SignUp Page, Please Enter Your Name,Email,Password And Conform Password",
  //   });

  res.render("signup");
};

const dashboard = (req, res) => {
  res.render("dashboard", { user: "Temp" });
};

const postsignup = (req, res) => {
  const { name, email, password, password1 } = req.body;
  //   console.log(name, email, password);
  //   res.send();
  pool.query(queries.dataFromEmail, [email], async (err, result) => {
    if (err) {
      throw err;
    }
    if (result.rows.length != 0) {
      res.status(200).json({ Message: "Email Already Register Please LogIn" });
    } else {
      if (password != password1) {
        res
          .status(200)
          .json({ Message: "Password and Conform Password Must Be Same" });
      } else {
        let hash = await bcrypt.hash(password, 10);
        let pas = md5(password);

        pool.query(queries.addData, [name, email, pas, hash], (err, result) => {
          if (err) {
            throw err;
          } else {
            res.render("dashboard", { user: name });
          }
        });
      }
    }
  });
};

const postlogin = async (req, res) => {
  let { email, password } = req.body;
  pool.query(queries.dataFromEmail, [email], (err, result) => {
    if (err) {
      throw err;
    } else {
      if (result.rows.length === 0) {
        res.status(200).json({ Message: "Email Not Register Please Sign Up" });
      } else {
        if (md5(password) === result.rows[0].password_md5) {
          let name = result.rows[0].name;
          res.render("dashboard", { user: name });
        } else {
          res.status(200).json({ Message: "Wrong Password" });
        }

        // console.log(result.rows[0].name);
      }
    }
  });
};

const forgetpass = (req, res) => {
  res.render("forgetpass");
};

const postforgetpass = async (req, res) => {
  const { email } = req.body;

  pool.query(queries.dataFromEmail, [email], (err, result) => {
    if (err) {
      throw err;
    } else {
      const secret = JWT_SECRET + result.rows[0].password;

      // console.log(result.rows[0].name);
      console.log(result.rows[0].id);

      const payload = {
        email: email,
        id: result.rows[0].id,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "15m" });
      const link = `http://localhost:3000/users/resetpass/${result.rows[0].id}/${token}`;
      console.log(link);

      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "stephan.runolfsson39@ethereal.email",
          pass: "DwE5EPYA9zEwzUkmbP",
        },
      });

      const info = transporter.sendMail({
        from: '"Neel Dave" <test@example.com>', // sender address
        to: `${email}`, // list of receivers
        subject: "Password Reset ", // Subject line
        text: `Please Click on the link to Reset the Password
            ${link}
          `, // plain text body
        html: `Please Click on the link to Reset the Password
            ${link}
          `, // html body
      });
      // res.send("Password reset link send");
      res.status(200).json({
        Message: "Reset Password Link is Provided to your Mail address ",
      });
    }
  });
};
const resetpass = (req, res) => {
  const { id, tokens } = req.params;
  pool.query(queries.dataFromId, [id], (err, result) => {
    if (err) {
      throw err;
    } else {
      const secret = JWT_SECRET + result.rows[0].password;
      try {
        const payload = jwt.verify(tokens, secret);
        res.render("resetpassword", { email: result.rows[0].email });
      } catch {}
    }
  });
};

const postresetpass = (req, res) => {
  const { id, token } = req.params;
  const { password, password1 } = req.body;

  pool.query(queries.dataFromId, [id], (err, result) => {
    if (err) {
      throw err;
    } else {
      const secret = JWT_SECRET + result.rows[0].password;
      if (password === password1) {
        result.rows[0].password = password;
        let pas = md5(password);
        pool.query(queries.updatePass, [pas, id], (err, result) => {
          if (err) {
            throw err;
          } else {
            res.status(200).json({ Message: "Password Updated " });
          }
        });
      } else {
        res
          .status(200)
          .json({ Message: "Password and Conform Password are not same " });
      }
    }
  });
};

module.exports = {
  index,
  login,
  signup,
  dashboard,
  postsignup,
  postlogin,
  forgetpass,
  postforgetpass,
  resetpass,
  postresetpass,
};
