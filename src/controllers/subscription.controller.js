import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/users.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Api_Response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/async-handler.js";
import { API_Error } from "../utils/Api_error.js";

const toggleSubscription = async_handler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription
    const subscriberId = req.user?._id;
    if (!isValidObjectId(subscriberId))
        throw new API_Error(401, "Uauthorized Request : Please Login First");
    if (!isValidObjectId(channelId))
        throw new API_Error(400, "Please provide channel id");

    try {
        const subscription = await Subscription.create({
            subscriber: subscriberId,
            channel: channelId,
        });

        return res
            .status(201)
            .json(
                new Api_Response(201, subscription, "Subscribed successfully")
            );
    } catch (error) {
        if (error.code === 11000) {
            await Subscription.findOneAndDelete({
                subscriber: subscriberId,
                channel: channelId,
            });

            return res
                .status(200)
                .json(new Api_Response(200, null, "Unsubscribed successfully"));
        }
        throw error;
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = async_handler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(channelId))
        throw new API_Error(400, "Invalid ChannelId");
    if (!isValidObjectId(userId)) throw new API_Error(400, "Invalid UserId");

    const channelObjectId = new mongoose.Types.ObjectId(channelId);
    const userOjectId = new mongoose.Types.ObjectId(req.user._id);

    const channel = await Subscription.find({ channel: channelId });

    if (!channel) {
        throw new API_Error(404, "Channel not found");
    }

    if (userOjectId.equals(channelObjectId)) {
        const subscribers = await Subscription.find({ channel: channelId });
        if (!subscribers) throw new API_Error(404, "NO Subscriptions Found");
        return res
            .status(200)
            .json(
                new Api_Response(
                    200,
                    subscribers,
                    subscribers.length
                        ? "Subscribers fetched successfully"
                        : "No subscribers"
                )
            );
    } else {
        throw new API_Error(401, "Unauthorized access");
    }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = async_handler(async (req, res) => {
    const subscriberId = req.user?._id;

    if (!isValidObjectId(subscriberId))
        throw new API_Error(400, "Invalid UserId");

    const subscribedChannels = await Subscription.aggregate([
        { $match: { subscriber: subscriberId } },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "Channels",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                        },
                    },
                ],
            },
        }, { $unwind: "$Channels" }, // unwind here changes every elemnt of channels to an object 
  {
    $replaceRoot: {
      newRoot: "$Channels", 
      // replaces the root so that data starts from channels array but because of unwind all channels are
      // in obj form easy to use 
    },
  },
    ]);

    return res
        .status(200)
        .json(new Api_Response(200, subscribedChannels, "Channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
