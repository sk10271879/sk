"use strict";
module.exports = {
  showHome:(req,res)=>{
    res.render("index")
  },
  showCourses:(req,res)=>{
    res.render("courses",{
      offeredCourses:courses
    });
  },
  showSignUp:(req,res)=>{
    res.render("contact");
  },
  postSignUpForm:(req,res)=>{
    res.render("thanks");
  },
  chat:(req,res)=>{
    res.render("chat");
  }
};
