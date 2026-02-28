import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/users.model.js";
import { API_Error } from "../utils/Api_error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/async-handler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = async_handler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    const loggedUserId = req.user?._id || "";
    const safeQuery = query ?? "";

    const matchStage = {
        title: { $regex: safeQuery, $options: "i" },
    };

    if (loggedUserId === "") {
        // guest user
        matchStage.isPublished = true;
    } else {
        // logged-in user
        matchStage.$or = [{ isPublished: true }, { owner: loggedUserId }];
    }
    const videos = await Video.aggregate([
        { $match: matchStage },
        {
            $sort: {
                [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1, // (createdat) fallback if sortby undefined
            },
        },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
            },
        },
    ]);
    if (videos.length === 0) {
        return res
            .status(404)
            .json(new Api_Response(404, [], "No such videos Found!!!"));
    }

    return res
        .status(200)
        .json(new Api_Response(200, videos, "Videos Fetched Successfully"));
});

const publishAVideo = async_handler(async (req, res) => {
    const { title, description } = req.body;

    // TODO: get video, upload to cloudinary, create video

    if (!req.files) throw new API_Error(400, "PLEASE UPLOAD AN FILE");
    if (!req.user._id) throw new API_Error(400, "Invalid credentials");
    const videoLocalPath = req.files.video[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    const video_Url = await uploadOnCloudinary(videoLocalPath);
    const thumbnail_Url = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video_Url || !thumbnail_Url)
        throw new API_Error(500, "INTERNAL SERVER ERROR Failed to upload");

    const video_secUrl = video_Url.secure_url;
    const video_pubIId = video_Url.public_id;
    const vid_dur = Number(video_Url.duration.toFixed(2));
    const thumbnail_secUrl = thumbnail_Url.secure_url;
    const thumbnail_pubId = thumbnail_Url.public_id;

    const video = await Video.create({
        title: title,
        description: description,
        videoFilePubId: video_pubIId,
        videoFile: video_secUrl,
        duration: vid_dur,
        thumbnail: thumbnail_secUrl,
        thumbnailPubId: thumbnail_pubId,
        owner: req.user._id,
    });

    if (!video) throw new API_Error(500, "FAILED TO UPLOAD VIDEO");

    return res
        .status(200)
        .json(new Api_Response(200, video, "Video Uploaded SUcessflly"));
});

const getVideoById = async_handler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { videoId } = req.params;
    if (!videoId) throw new API_Error(404, "Video Not Found!!");
    //TODO: get video by id

    await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    );

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
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
                            avatar: 1,
                            username: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$Owner",
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                avatar: "$Owner.avatar",
                username: "$Owner.username",
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "Comments",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "Commentor",
                        },
                    },
                    { $unwind: "$Commentor" },
                    {
                        $project: {
                            content: 1,
                            channelAvatar: "$Commentor.avatar",
                            channelName: "$Commentor.username",
                        },
                    },
                ],
            },
        },
        { $unwind: "$Comments" },
    ]);

    if (!video) throw new API_Error(404, "Video not found");

    await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: { watchHistory: videoId },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(new Api_Response(200, video, "Video Fetched Sucessfully !!!!"));
});

const updateVideo = async_handler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) throw new API_Error(404, "Video Not Found!!");
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const thumbnail_localPath = req.file.path;

    if (!title === "" || !description === "")
        throw new API_Error(400, "Please enter title and description both");
    if (!thumbnail_localPath) throw new API_Error(400, "Please Upload an file");

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id,
    }).select("title description thumbnail thumbnailPubId");

    if (!video) throw new API_Error(404, "Video not found");
    const thumbnail = await uploadOnCloudinary(thumbnail_localPath);
    const oldThumbnail = video.thumbnailPubId;
    video.title = title;
    video.description = description;
    video.thumbnail = thumbnail.secure_url;
    video.thumbnailPubId = thumbnail.public_id;
    video.save();

    cloudinary.uploader.destroy(oldThumbnail);
    return res
        .status(200)
        .json(new Api_Response(200, video, "Video Fetched Sucessfully !!!!"));
});

const deleteVideo = async_handler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    if (!videoId) throw new API_Error(404, "Video Not Found!!");
    const video = await Video.findOne({ _id: videoId, owner: req.user._id });

    await deleteFromCloudinary(video.videoFilePubId, "video");
    await deleteFromCloudinary(video.thumbnailPubId);

    // Delete from database
    await video.deleteOne();

    return res
        .status(200)
        .json(new Api_Response(200, {}, "Video Deleted Successfully"));
});

const togglePublishStatus = async_handler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) throw new API_Error(404, "Video Not Found!!");
    const video = await Video.findByIdAndUpdate(
        videoId,
        [{ $set: { isPublished: { $not: "$isPublished" } } }],
        {
            new: true,
            updatePipeline: true,
        }
    );

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
                video,
                "Video Status Updated Sucessfully !!!!"
            )
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
