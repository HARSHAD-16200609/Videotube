import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/users.model.js"
import { Subscription } from "../models/subscription.model.js"
import {Api_Response} from "../utils/Api_Response.js"
import {async_handler} from "../utils/async-handler.js"
import { API_Error } from "../utils/Api_error.js"


const toggleSubscription = async_handler(async (req, res) => {

    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriberId = req.user?._id
    if(!isValidObjectId(subscriberId)) throw new API_Error(401,"Uauthorized Request : Please Login First")
    if(!isValidObjectId(channelId)) throw new API_Error(400,"Please provide channel id")

   try {
   const subscription = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  return res.status(201).json(
    new Api_Response(201, subscription, "Subscribed successfully")
  );
} catch (error) {
  if (error.code === 11000) {
     await Subscription.findOneAndDelete({
        subscriber: subscriberId,
        channel: channelId,
      });

      return res.status(200).json(
        new Api_Response(200, null, "Unsubscribed successfully")
      );
  }
  throw error;
}
 
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = async_handler(async (req, res) => {
    const {channelId} = req.params


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = async_handler(async (req, res) => {
    const { subscriberId } = req.params


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}