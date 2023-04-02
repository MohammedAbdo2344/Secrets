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
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate")
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
    googleId:String,
    facebookId:String
});
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);
//Model
const User = mongoose.model('User', UserSchema);
passport.use(User.createStrategy())
passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done){
    User.findById(id);
});
//Google
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//facebook
// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

app.get("/", function (req, res) {
    res.render("home");
})
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
});
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