const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const user = require('../models/usermodel');
const connectid = require('../models/connectid');

const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const e = require('express');
const io = require('socket.io');
//const mongourl = require('../config/mongokey');
require('./passport')(passport);


// using Bodyparser for getting form data
routes.use(bodyparser.urlencoded({ extended: true }));
// using cookie-parser and session 
routes.use(cookieParser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));
// using passport for authentications 
routes.use(passport.initialize());
routes.use(passport.session());
// using flash for flash messages 
routes.use(flash());

// MIDDLEWARES
// Global variable
routes.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

const checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/login');
    }
}

// Connecting To Database






mongoose.connect(  "mongodb+srv://samiullah:RYoDjxFbVBCMJl79@cluster0.945nh.mongodb.net/md?retryWrites=true&w=majority" ,{
    useNewUrlParser: true , 
    useUnifiedTopology: true
}).then(()=>{
    console.warn("connection done");
})

// using Mongo Atlas as database
//mongoose.connect(mongourl ,{
 //   useNewUrlParser: true, useUnifiedTopology: true,
//}).then(() => console.log("Database Connected")
//);


// ALL THE ROUTES 
routes.get('/', async  (req, res) => {
    const user1= await user.find()
    res.render('navbar/home',{user: user1});
})


routes.get('/chat', checkAuthenticated, async (req, res) => {
    const user1= await user.find()

    res.render('navbar/chat' , {user: user1});

})

routes.get('/register', (req, res) => {
    res.render('index');
})

routes.post('/register', (req, res) => {
    var { email, username, password, confirmpassword } = req.body;
    var err;
    if (!email || !username || !password || !confirmpassword) {
        err = "Please Fill All The Fields...";
        res.render('index', { 'err': err });
    }
    if (password != confirmpassword) {
        err = "Passwords Don't Match";
        res.render('index', { 'err': err, 'email': email, 'username': username });
    }
    if (typeof err == 'undefined') {
        user.findOne({ email: email }, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("User Exists");
                err = "User Already Exists With This Email...";
                res.render('index', { 'err': err, 'email': email, 'username': username });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                            email,
                            username,
                            password,
                        }).save((err, data) => {
                            console.warn('data: ' , data)
                            if (err) throw err;
                            req.flash('success_message', "Registered Successfully.. Login To Continue..");
                            return res.redirect('/login');
                            
                        });
                    });
                });
            }
        });
    }
});


// Authentication Strategy
// ---------------
var localstrategy = require('passport-local').Strategy;
passport.use(new localstrategy({ usernameField : 'email'},(email, password, done)=>{
    user.findOne({email: email} , (err, data )=>{
        if(err) throw err;
        if(!data){
            console.log("AAAAAAA");
            return done(null , false);
        }
        bcrypt.compare(password, data.password, (err , match)=>{
            if(err){
                console.log("AAAAbbb");
                return done(null , false)
            }
            if(!match){
                console.log("AAAccccc");
                return done(null , false)
            }
            if(match){
                console.log("AAAAsss");
               // return res.redirect('/login');
                return done(null, data);
            }
        })
    })
}))

passport.serializeUser(function(use , cb){
    cb(null , user.id);
})
passport.deserializeUser(function(user ,cb){
    user.findById(id, function(err , user){
        cb(err , user);
    })
})
// end of authentication stategy







routes.get('/login', (req, res) => {
    res.render('login');
});

routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/chatconnect',
        failureFlash: true,
    })(req, res, next);

   
});

/*
routes.get('/success', checkAuthenticated, (req, res) => {
    res.render('success', { user: req.user });
   // res.render('success');
});*/

routes.get('/chatconnect', checkAuthenticated,  async (req, res) => {
   const user1= await user.find()
    res.render('navbar/chatconnect', { user: user1 });

});

routes.post('/chatconnect', checkAuthenticated,   (req, res) => {
   
    email = req.body
    console.warn(req.body);
    const item= new connectid (
    {
       email

    
    });

    item.save()
    return res.redirect('/chat');


 });






routes.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

routes.post('/addmsg', checkAuthenticated, (req , res)=>{
    user.findOneAndUpdate(
        { email : req.user.email},
        {$push : {
            messages : req.body['msg']
        }},(err , suc)=>{
            if(err) throw err;
            if(suc){
    
            } 
        });
         res.redirect('/success');
})

module.exports = routes;