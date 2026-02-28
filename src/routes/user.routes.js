import { Router } from "express";
import {registerUser,loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,userAvatarUpdate, getCurrentUser,coverImgUpdate,updateAccountDetails,getWatchHistory, getChannelProfile} from "../controllers/user.controller.js";
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
Userrouter.route("/avatarUpdate").patch(verifyJWT,upload.single("avatar"),userAvatarUpdate)
Userrouter.route("/coverImgUpdate").patch(verifyJWT,upload.single("coverImg"),coverImgUpdate)
Userrouter.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
Userrouter.route("/changeUserDetails").patch(verifyJWT,updateAccountDetails)
Userrouter.route("/getWatchHistory").get(verifyJWT,getWatchHistory)
Userrouter.route("/c/:username").get(verifyJWT,getChannelProfile)




export default Userrouter;

