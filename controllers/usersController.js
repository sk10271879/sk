"use strict";
const { render } = require("ejs");
const e = require("express");
const passport = require("passport");
const jsonWebToken=require("jsonwebtoken");
const User = require("../models/user"),
  getUserParams = body => {
    return {
      name: {
        first: body.first,
        last: body.last
      },
      email: body.email,
      password: body.password
    };
  };
module.exports = {
  index: (req, res, next) => {
    User.find()
      .then(users => {
        res.locals.users=users;
        next();
      })
      .catch(error => {
        console.log(`Error fetching users: ${error.message}`);
        next(error);
      });
  },
  indexView: (req, res) => {
    res.render("users/index",{
      flashMessage:{success:"Loaded all users!"}
    });
  },
  new: (req, res) => {
    res.render("users/new");
  },
  validate:(req,res,next)=>{
    req.sanitizeBody("email").normalizeEmail({
      all_lowercase:true
    }).trim();
    req.check("email","Email is invalid").isEmail();
    req.check("password","Password cannot be empty").notEmpty();
    req.getValidationResult().then((err)=>{
      if(!err.isEmpty()){
        let messages=err.array().map(e=>e.msg);
        req.skip=true;
        req.flash("error",messages.join(" and "));
        res.locals.redirect="/users/new";
        next();
      }else{
        next();
      }
    });
  },
  create:(req,res,next)=>{
    if(req.skip) next();
    let newUser=new User(getUserParams(req.body));
    User.register(newUser,req.body.password,(err,user)=>{
      if(user){
        req.flash("success", `${user.fullName}'s account created successfully!`);
        res.locals.redirect = "/users";
        console.log("kore");
        next();
      }else{
        console.log(`Error saving user: ${err.message}`);
        req.flash("error", `Failed to create user account because: ${error.message}.`);
        res.locals.redirect = "/users/new";
        next();
      }
    });
  },
  redirectView:(req,res,next)=>{
    let redirectPath=res.locals.redirect;
    if(redirectPath) res.redirect(redirectPath);
    else next();
  },
  show:(req,res,next)=>{
    let userId=req.params.id;
    User.findById(userId)
      .then(user=>{
        res.locals.user=user;
        next();
      })
      .catch(err=>{
        console.log(`Error fetching user by ID:${err.message}`);
        next(err);
      });
  },
  showView:(req,res)=>{
    res.render("users/show");
  },
  edit:(req,res,next)=>{
    let userId=req.params.id;
    User.findById(userId)
      .then(user=>{
        res.render("users/edit",{
          user:user
        });
      })
      .catch(err=>{
        console.log(`Error fetching user by ID:${err.message}`);
        next(err);
      });
  },
  update:(req,res,next)=>{
    let userId=req.params.id;
    let userParams={
      name:{
        first:req.body.first,
        last:req.body.last
      },
      password:req.body.password,
      email:req.body.email
    };
    User.findByIdAndUpdate(userId,{
      $set:userParams
    })
      .then(user=>{
        res.locals.redirect=`/users/${userId}`;
        res.locals.user=user;
        next();
      })
      .catch(err=>{
        console.log(`Error uodating user by ID:${err.message}`);
        next(err);
      });
  },
  delete:(req,res,next)=>{
    let userId=req.params.id;
    User.findByIdAndDelete(userId)
      .then(()=>{
        res.locals.redirect="/users";
        next();
      })
      .catch(err=>{
        console.log(`Error deleting user by ID:${err.message}`);
        next();
      })
  },
  login:(req,res)=>{
    res.render("users/login");
  },
  authenticate: passport.authenticate("local",{
    failureRedirect:"/users/login",
    failureFlash:"Failed to login",
    successRedirect:"/",
    successFlash:"Logged in!!"
  }),
  logout:(req,res,next)=>{
    req.logout();
    req.flash("success","You have been logged out!");
    req.locals.redirect="/";
    next();
  },
  apiAuthenticate:(req,res,next)=>{
    passport.authenticate("local",(errors,user)=>{
      if(user){
        let signedToken=jsonWebToken.sign(
          {
            data:user._id,
            exp: new Date().setDate(new Date().getDate()+1)
          },
          "secret_encoding_passphrase"
        );
        res.json({
          success:true,
          token:signedToken
        });
      }else
        res.json({
          success:false,
          token:"Could not authenticate user."
        });
    })(req,res,next);
  },
  verifyToken: (req, res, next) => {
    let token = req.query.apiToken;
    if (token) {
      User.findOne({ apiToken: token })
        .then(user => {
          if (user) next();
          else next(new Error("Invalid API token."));
        })
        .catch(error => {
          next(new Error(error.message));
        });
    } else {
      next(new Error("Invalid API token."));
    }
  },
  verifyJWT:(req,res,next)=>{
    let token=req.headers.token;
    if(token){
      jsonWebToken.verify(
        token,
        "secret_encoding_passphrase",
        (errors,payload)=>{
          if(payload){
            User.findById(payload.data).then(user=>{
              if(user){
                next();
              }else{
                res.status(httpStatus.FORBIDDEN).json({
                  error:true,
                  message:"No User account found."
                });
              }
            });
          }else{
            res.status(httpStatus.UNAUTHORIZED).json({
              error:true,
              message:"Cannot verify API token."
            });
            next();
          }
        }
      );

    }else{
      res.status(httpStatus.UNAUTHORIZED).json({
        error:true,
        message:"Provide Token."
      });
    }
  }
};