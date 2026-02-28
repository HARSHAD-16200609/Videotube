import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import {Video} from "../models/video.model.js"
import { API_Error } from "../utils/Api_error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/async-handler.js";

const toggleVideoLike = async_handler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) throw new API_Error(400, "Enter an valid VideoId");

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });
    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new Api_Response(200, {}, "Unliked the Video Successfully"));
    } else {
        const existingVideo = await Video.findById(videoId)
        if(!existingVideo){
            throw new API_Error(404, "Video not found");
        }
        const like = await Like.create({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: userId,
        });
        if (!like) throw new API_Error(500, "Failed to like the video");

        return res
            .status(200)
            .json(new Api_Response(200, like, "Liked the Video Successfully"));
    }
});

const toggleCommentLike = async_handler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment

    const userId = req.user._id;
    //TODO: toggle like on video
    if (!isValidObjectId) throw new API_Error(400, "Enter an valid commentId");

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });
    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new Api_Response(200, {}, "Unliked the Video Successfully"));
    } else {
        const like = await Like.create({
            comment: commentId,
            likedBy: userId,
        });
        if (!like) throw new API_Error(500, "Failed to like the comment");
        return res
            .status(200)
            .json(
                new Api_Response(200, like, "Liked the comment Successfully")
            );
    }
});

const toggleTweetLike = async_handler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet

    const userId = req.user._id;
    //TODO: toggle like on video
    if (!isValidObjectId) throw new API_Error(400, "Enter an valid tweetId");

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId,
    });
    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new Api_Response(200, {}, "Unliked the tweet Successfully"));
    } else {
        const like = await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });
        if (!like) throw new API_Error(500, "Failed to like the tweet");
        return res
            .status(200)
            .json(new Api_Response(200, like, "Liked the tweet Successfully"));
    }
});

const getLikedVideos = async_handler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;

    const LikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                comment: null,
                tweet: null,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "LikedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "Owner",
                            pipeline: [
                                {
                                    $project: {
                                        avatar: 1,
                                        username: 1,
                                    },
                                },
                            ],
                        },
                    },
                    { $unwind: "$Owner" },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            Owner: 1,
                            createdAt:1
                        },
                    },
                ],
            },
        },
        { $unwind: "$LikedVideo" },{$replaceRoot:{newRoot:"$LikedVideo"}}
    ]);
    if (!LikedVideos)
        throw new API_Error(500, "Failed to fetch the Liked Videos");
    return res
        .status(200)
        .json(new Api_Response(200, LikedVideos, "Videos Fetched Suceesfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
