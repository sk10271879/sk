"use strict";
const port=3000,
      express=require("express"),
      app=express(),
      layouts = require('express-ejs-layouts');
const router=require("./routes/index");
const methodOverride=require("method-override");
const expressSession=require("express-session"),
      cookieParser=require("cookie-parser"),
      connectFlash=require("connect-flash");
const expressValidator=require("express-validator");
const passport=require("passport");

// 暗号化・復号化の処理
const User=require("./models/user");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// appの設定
app.use(methodOverride("_method",{
  methods:["POST","GET"]
}));
app.use(cookieParser("secret_passcode"));
app.use(expressSession({
  secret:"secret_passcode",
  cookie:{
    maxAge:3600000
  },
  resave:false,
  saveUninitialized:false
}));
app.use(connectFlash());
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.set("port",process.env.PORT || port);
app.set("view engine", "ejs");
app.use(layouts);
app.use(express.static("public"));
app.set("token",process.env.TOKEN || "recipeTOk3n");

// データベースの設定
const mongoose=require("mongoose");
const { indexView } = require("./controllers/usersController");
mongoose.connect(process.env.MONGOOSE_URI || "mongodb://localhost:27017/recipe_db",{useUnifiedTopology : true,useNewUrlParser: true});
mongoose.Promise=global.Promise;

// 常時動く奴ら
app.use((req,res,next)=>{
  res.locals.flashMessages=req.flash();
  // ログイン情報の設定
  res.locals.loggedIn=req.isAuthenticated();
  res.locals.currentUser=req.user;
  next();
});

app.use("/", router);

const server=app.listen(app.get("port"),()=>{
        console.log(`The server has started and is listening on port number : ${app.get("port")}`);
      }),
      io=require("socket.io")(server);
require("./controllers/chatController")(io);
