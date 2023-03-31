const express = require('express')
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const mongooseEncryption = require("mongoose-encryption");
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
const secret = "Thisisourlittlesecrets"
UserSchema.plugin(mongooseEncryption, { secret: secret, encryptedFields: ["password"] });
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

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password,
    })
    newUser.save();
    res.render("secrets")
})
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).then(function (element) {
        if (element) {
            if (element.password === password) {
                res.render("secrets")
            }
            else {
                res.render("login")
            }
        }
    })
})



app.listen(3000, function () {
    console.log("Server is running in 3000")
})