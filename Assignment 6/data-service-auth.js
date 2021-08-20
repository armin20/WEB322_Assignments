const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});
let User;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection("mongodb+srv://dbuser1:dbuser@webdatabase.z3hwg.mongodb.net/web322_app?retryWrites=true&w=majority", { useNewUrlParser: true });
    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  let promise = new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords does not match");
      return;
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(userData.password, salt, (err, hash) => {
        if (err) {
          reject("There was an error while encrypting the pass");
          return;
        } else {
          userData.password = hash;
          let newUser = new User(userData);
          newUser.save((err) => {
            if (err) {
              if (err.code === 11000) {
                reject("User Name already taken");
                return;
              }
              reject("There was an error creating the user:" + err);
              return;
            }
            resolve();
          });
        }
      });
    });
  });
  return promise;
};

module.exports.checkUser = function (userData) {
  let promise = new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      // .exec()
      .then((data) => {
        if (data.length === 0) {
          reject("Unable to find user: " + userData.userName);
          return;
        }
        bcrypt.compare(userData.password, data[0].password).then((res) => {
          if (!res) {
            console.log(data[0].password);
            reject("Incorrect Password for user: " + userData.userName);
            return;
          } else {
            data[0].loginHistory.push({
              dateTime: new Date(),
              userAgent: userData.userAgent,
            });

            User.update(
              {
                userName: data[0].userName,
              },
              {
                $set: { loginHistory: data[0].loginHistory },
              }
            )
              .exec()
              .then(() => {
                console.log(data[0]);
                resolve(data[0]);
              })
              .catch((err) => {
                reject("There was an error while verofying the user data" + err);
                return;
              });
          }
        });
      });
  });
  return promise;
};
