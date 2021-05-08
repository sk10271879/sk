"use strict";
const router=require("express").Router();
const homeController=require("../controllers/homeController");

router.get("/",homeController.showHome);
router.get("/chat",homeController.chat);

module.exports=router;