import { Tweet } from "../models/tweet.model.js";
import { API_Error } from "../utils/Api_error.js";
import {async_handler}  from "../utils/async-handler.js"
import {Api_Response} from "../utils/Api_Response.js"
import mongoose, { isValidObjectId } from "mongoose"

const createTweet = async_handler(async (req, res) => {
    //TODO: create tweet
   
    
   const content = req.body.content;
   const userId  = req.user?._id;
   if(!userId) throw new API_Error(401,"Unauthorized Access")
   if(!content || content.trim().length===0) throw new API_Error(400,"Please enter some content tweet can't be empty!!!")
            
    const tweetResponse = await Tweet.create({
        content:content,
        owner:userId
    })
 
    if(!tweetResponse) return res.status(500).json(new API_Error(500,"Internal Server Error: Failed to generate the Tweet"))

    return res.status(201).json(new Api_Response (201,tweetResponse,"Tweet generated suceesfully"))

})

const getUserTweets = async_handler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params;
if (!userId || userId.trim().length ===0) {
    throw new API_Error(400, "User ID is required");
  }
  if (!isValidObjectId(userId)) {
    throw new API_Error(400, "Invalid User ID is required");
  }
  

  const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 });

  if (!tweets.length) {
    throw new API_Error(404, "No tweets found for this user");
  }

  return res.status(200).json(
    new Api_Response(200, tweets, "Tweets fetched successfully"))

})

const updateTweet = async_handler(async (req, res) => {
    //TODO: update tweet

    const {updatedContent} = req.body
    const{tweetId} = req.params
    if(!updatedContent || updatedContent.trim().length === 0) throw new API_Error(400,"Please enter some content")
        if(!isValidObjectId(tweetId)) throw new API_Error(400,"Please enter an Tweet ID")

         const updatedTweet  =    await Tweet.findByIdAndUpdate(tweetId,{
                content:updatedContent
            },{
                new:true
            })
            if(!updateTweet) throw new API_Error(500,"Failed To Update the Tweet")
    
             return res.status(200).json(new Api_Response(200,updatedTweet,"Tweet updated Sucessfully!!!"))
})

const deleteTweet = async_handler(async (req, res) => {
    //TODO: delete tweet
    const{tweetId} = req.params

        if(!isValidObjectId(tweetId)) throw new API_Error(400,"Please enter an Tweet ID")
 const deletedTweet =await Tweet.findByIdAndDelete(tweetId)

 if(!deletedTweet) throw new API_Error(404,"Tweet not found")

         return res.status(200).json(new Api_Response(200,{},"Tweet Deleted SucessFully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}