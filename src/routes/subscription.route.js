import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

subscriptionRouter
    .route("/me")
    .get(getSubscribedChannels)

subscriptionRouter
    .route("/channel/:channelId").post(toggleSubscription);

subscriptionRouter.route("/subscribers/:channelId").get(getUserChannelSubscribers);

export default subscriptionRouter