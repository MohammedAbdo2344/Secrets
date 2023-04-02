require('dotenv').config();
const express = require('express')
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const mongooseEncryption = require("mongoose-encryption");
const md5 = require("md5")
const bcrypt = require("bcrypt")
const saltRounds = 10;
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const app = express()

app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session())

mongoose.connect("mongodb://127.0.0.1/userDB", { useNewUrlParser: true });
// Schema
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
});
UserSchema.plugin(passportLocalMongoose);
//Model
const User = mongoose.model('User', UserSchema);
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
})
app.get("/secrets", function (req, res) {
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.post("/register", function (req, res) {
    User.register({ username: req.body.username },req.body.password).then(function(element){
        passport.authenticate("local")(req,res,function(){
            // here user registerd
            res.redirect("/secrets");
        })
    }).catch(function(err){
        console.log(err);
        res.redirect("/register")
    })

})
app.post("/login", function (req, res) {
    const user=new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                // here user login
                res.redirect("/secrets");
            })
        }
    })
})



app.listen(3000, function () {
    console.log("Server is running in 3000")
})