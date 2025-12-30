import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/users.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { API_Error } from "../utils/Api_error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/async-handler.js";

const getChannelStats = async_handler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id;

    const stats = await User.aggregate([
        {
            $match: { _id: userId },
        },

        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes",
                        },
                    },
                    {
                        $addFields: {
                            likesCount: { $size: "$likes" },
                        },
                    },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            isPublished: 1,
                            likesCount: 1,
                        },
                    },
                ],
            },
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },

        {
            $addFields: {
                stats: {
                    totalVideos: { $size: "$videos" },
                    totalSubscribers: { $size: "$subscribers" },
                    totalViews: { $sum: "$videos.views" },
                    totalLikes: { $sum: "$videos.likesCount" },
                },
            },
        },

        {
            $project: {
                username: 1,
                avatar: 1,
                videos: 1,
                stats: 1,
            },
        },
    ]);


 

    if (!stats)
        throw new API_Error(
            500,
            "INTERNAL SERVER ERROR can't load the stats at tha moment !!!"
        );

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
            stats,
                "Stats Fetched Sucessfully!!"
            )
        );
});

const getChannelVideos = async_handler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;

    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: userId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "Owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                Owner: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
            },
        },
        { $unwind: "$Owner" },
    ]);
    if (!totalVideos)
        throw new API_Error(500, "Failed to fetch all videos try again !!");

    return res.status(200).json(totalVideos);
});

export { getChannelStats, getChannelVideos };
