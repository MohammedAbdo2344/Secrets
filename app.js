require('dotenv').config();
const express = require('express')
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const mongooseEncryption = require("mongoose-encryption");
const md5 = require("md5")
const bcrypt = require("bcrypt")
const saltRounds = 10;
const _ = require("lodash");
const app = express()

app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"))


mongoose.connect("mongodb://127.0.0.1/userDB", { useNewUrlParser: true });
// Schema
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
});
//Model
const User = mongoose.model('User', UserSchema);

app.get("/", function (req, res) {
    res.render("home");
})
app.get("/register", function (req, res) {
    res.render("register");
})
app.get("/login", function (req, res) {
    res.render("login");
})
app.get("/logout", function (req, res) {
    res.render("home");
})


app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash,
        })
        newUser.save();
        res.render("secrets")
    });

})
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).then(function (element) {
        if (element) {
            bcrypt.compare(password, element.password, function (req, result) {
                if (result === true) {
                    res.render("secrets")
                }
            })
        }
    })
})



app.listen(3000, function () {
    console.log("Server is running in 3000")
})