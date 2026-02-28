import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { API_Error } from "../utils/Api_error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/async-handler.js";

const createPlaylist = async_handler(async (req, res) => {
    const { name, description } = req.body;
    //TODO: create playlist
    const userId = req.user?._id;
    const videos = req.body.videos;

    if (!isValidObjectId(userId)) throw new API_Error(400, "Invalid UserId");
    try {
        const playlistResponse = await Playlist.create({
            name: name,
            description: description,
            videos: [...videos],
            owner: userId,
        });

        if (!Playlist) throw new API_Error(500, "Failed to create an Playist");
        return res
            .status(200)
            .json(
                new Api_Response(
                    200,
                    playlistResponse,
                    "Playlist Created Sucessfully"
                )
            );
    } catch (error) {
        // errCode 11000
        if (error.code === 11000) {
            res.status(200).send("Playlist Already Exists");
        }
    }
});

const getUserPlaylists = async_handler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get user playlists
    if (!isValidObjectId(userId))
        throw new API_Error(400, "Please Enter an valid userId");

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
            },
        },
        {
            $addFields: {
                videosCount: { $size: "$videos" },
            },
        },
    ]);

    if (!playlists) throw new API_Error(404, "No Playlist Found!!!");

    return res
        .status(200)
        .json(
            new Api_Response(200, playlists, "PLaylists Fetched Suceesfully")
        );
});

const getPlaylistById = async_handler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId))
        throw new API_Error(400, "Please Enter an valid playlistId");

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "Videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ChannelOwner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        _id: 0,
                                        views: 1,
                                    },
                                },
                            ],
                        },
                    },
                    { $unwind: "$ChannelOwner" },

                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            ChannelOwner: 1,
                            duration: 1,
                            views: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: "$Videos" },
        { $replaceRoot: { newRoot: "$Videos" } },
    ]);

    if (!playlist)
        throw new API_Error(
            500,
            "Internal Server Error : couldn't Find the Video"
        );

    return res
        .status(200)
        .json(new Api_Response(200, playlist, "Playlist Fetched Successfully"));
});

const addVideoToPlaylist = async_handler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(videoId))
        throw new API_Error(400, "please enter an valid VideoId");
    if (!isValidObjectId(playlistId))
        throw new API_Error(400, "please enter an valid playlistId");

    const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistId },
        {
            // addtoset adds only unique value to an array therefore push not used as it pushes duplicate also
            $addToSet: {
                videos: videoId,
            },
        }
    );

    if (!updatedPlaylist) throw new API_Error(500, "Failed to update Playlist");

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
                updatedPlaylist,
                "Playlist Updated Successfully !!!!"
            )
        );
});

const removeVideoFromPlaylist = async_handler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(videoId))
        throw new API_Error(400, "please enter an valid VideoId");
    if (!isValidObjectId(playlistId))
        throw new API_Error(400, "please enter an valid playlistId");

    const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistId },
        {
            // use to delete an element from an array
            $pull: {
                videos: videoId,
            },
        }
    );

    if (!updatedPlaylist) throw new API_Error(500, "Failed to update Playlist");

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
                updatedPlaylist,
                "Playlist Updated Successfully !!!!"
            )
        );
});

const deletePlaylist = async_handler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
    if (!isValidObjectId(playlistId))
        throw new API_Error(400, "please enter an valid playlistId");

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletePlaylist) throw new API_Error(500, "Failed to delete Playlist");

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
                deletePlaylist,
                "Playlist deleted Successfully !!!!"
            )
        );
});

const updatePlaylist = async_handler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist
    if (!isValidObjectId(playlistId))
        throw new API_Error(400, "please enter an valid playlistId");

    if (!name || !description)
        throw new API_Error(400, "Please Enter Name and Description");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        { _id: playlistId },
        {
            $set: {
                name: name,
                description: description,
            },
        },
        {
            $new: true,
        }
    );

    if (!updatedPlaylist) throw new API_Error(500, "Failed to update Playlist");

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
                updatedPlaylist,
                "Playlist Updated Successfully !!!!"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
