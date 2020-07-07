const express = require('express');
const router = express.Router();
const Register = require('../models/register');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const flash = require('connect-flash');

router.use(cookieparser('secret'));
router.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))
router.use(passport.initialize());
router.use(passport.session());



router.use(flash());


router.use(function(req,res,next){
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
     next();

})

const checkAuthentication = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('cache-control','no-cache , private , no-store ,must-revalidate,post-check=0,pre-check=0');
    return next()
    }else{
      res.redirect('/login');
    }
}

//register user GET
router.get('/',(req,res)=>{
    res.render('index.ejs');
})

router.get('/register',(req,res)=>{
    res.render('index.ejs')
})
//POST register
router.post('/register', (req, res) => {
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
        Register.findOne({ email: email }, function (err, data) {
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
                        Register({
                            email,
                            username,
                            password,
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('success_message', "Registered Successfully.. Login To Continue..");
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});



//authantication strategy 

var localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
    Register.findOne({ email: email }, (err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message: "User Doesn't Exists.." });
        }
        bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            }
            if (!match) {
                return done(null, false, { message: "Password Doesn't Match" });
            }
            if (match) {
                return done(null, data);
            }
        });
    });
}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    Register.findById(id, function(err, user) {
      done(err, user);
    });
  });


//login get
router.get('/login',(req,res)=>{
    res.render('login.ejs');
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/success',
        failureFlash:true
    })(req,res,next);
})



//dashboard

router.get('/success',checkAuthentication,(req,res)=>{
    res.render('success.ejs',{
        'user':req.user
    });
})



//logout

router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
})





module.exports= router