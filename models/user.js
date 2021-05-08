"use strict";
const Subscriber=require("./subscriber");
const passportLocalMongoose = require("passport-local-mongoose");
const randToken=require("rand-token");

const mongoose = require("mongoose"),
  { Schema } = mongoose,
  userSchema = new Schema(
    {
      name: {
        first: {
          type: String,
          trim: true
        },
        last: {
          type: String,
          trim: true
        }
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
      },
      apiToken: {
        type: String
      },
      password: {
        type: String,
        required: true
      },
      courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
      subscribedAccount: {
        type: Schema.Types.ObjectId,
        ref: "Subscriber"
      }
    },{
      timestamps: true
    }
  );

userSchema.virtual("fullName").get(function() {
  return `${this.name.first} ${this.name.last}`;
});
userSchema.virtual("fullNameWords").get(function() {
  return `${this.fullName.length}`;
});

userSchema.pre("save",function(next){
  let user=this;
  if(user.subscribedAccount == undefined){
    Subscriber.findOne({
      email:user.email
    })
      .then(subscriber=>{
        user.subscribedAccount=subscriber;
        next();
      })
      .catch(err=>{
        console.log(`Error in connecting subscriber: ${err.message}`);
        next(err);
      });
  } else {
    next();
  }
});

userSchema.pre("save",function(next){
  let user=this;
  console.log("kore");
  if(!user.apiToken)user.apiToken=randToken.generate(16);
  console.log(user.apiToken);
  next();
});

userSchema.plugin(passportLocalMongoose,{
  usernameField:"email"
});
module.exports = mongoose.model("User", userSchema);