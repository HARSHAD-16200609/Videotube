import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const dashBoardRouter = Router();

dashBoardRouter.use(verifyJWT); 

dashBoardRouter.route("/stats").get(getChannelStats);
dashBoardRouter.route("/videos").get(getChannelVideos);

export default dashBoardRouter