import { Router } from "express";
import {registerUser,loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,userAvatarUpdate, getCurrentUser,coverImgUpdate,updateAccountDetails} from "../controllers/user.controller.js";
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
Userrouter.route("/changePassword").post(verifyJWT,changeCurrentPassword)
Userrouter.route("/avatarUpdate").post(verifyJWT,upload.single("avatar"),userAvatarUpdate)
Userrouter.route("/coverImgUpdate").post(verifyJWT,upload.single("coverImg"),coverImgUpdate)
Userrouter.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
Userrouter.route("/changeUserDetails").post(verifyJWT,updateAccountDetails)




export default Userrouter;

