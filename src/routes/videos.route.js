import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import  {getAllVideos,publishAVideo,getVideoById,updateVideo, deleteVideo,togglePublishStatus}  from "../controllers/video.controller.js";
import upload from "../middlewares/multer.middleware.js";

const videoRouter= Router();

videoRouter.use(verifyJWT)

videoRouter.route("/getAllVideos").get(getAllVideos);
videoRouter.route("/publishVideo").post(upload.fields([{
    name:"video",
    maxCount:1,
    
},{
    name:"thumbnail",
    maxCount:1
}]),publishAVideo)
videoRouter.route("/:videoId")
.get(getVideoById)
.patch(upload.single("thumbnail"),updateVideo)
.delete(deleteVideo)
videoRouter.route("/togglePublishStatus/:videoId").get(togglePublishStatus)



export default videoRouter;