import { Router } from "express";
import {registerUser,loginUser, logoutUser,refreshAccessToken} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";



const Userrouter = Router()


Userrouter.route("/register").post(upload.fields([{

    name:"avatar",
    maxCount:1
},
{
    name:"coverImage",
    maxCount:1
}

]),registerUser)

Userrouter.route("/login").post(loginUser)

Userrouter.route("/logout").post(verifyJWT,logoutUser)
Userrouter.route("/refaccessToken").post(refreshAccessToken)

export default Userrouter;

