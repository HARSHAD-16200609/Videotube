import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { API_Error } from "../utils/Api_error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/async-handler.js";

const getVideoComments = async_handler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;

    const { page = 1, limit = 10 } = req.query;
    if (!isValidObjectId(videoId))
        throw new API_Error(400, "Enter an valid VideoId");

    const Comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "Commenter",
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
        { $unwind: "$Commenter" },
        {
            $project: {
                content: 1,
                createdAt: 1,
                Commenter: {
                    _id: "$Commenter._id",
                    username: "$Commenter.username",
                    avatar: "$Commenter.avatar",
                },
            },
        },

        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
    ]);
    if (!Comments) throw new API_Error(500, "Failed To load the Comments");

    return res
        .status(200)
        .json(new Api_Response(200, Comments, "Comments fetched successfully"));
});

const addComment = async_handler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (content.trim() === "")
        throw new API_Error(400, "Comment can't be Empty");

    const userId = req.user._id;
    if (!isValidObjectId(userId))
        throw new API_Error(400, "To comment, You need to login First ");

    if (!isValidObjectId(videoId))
        throw new API_Error(400, "Enter an valid VideoId");

    const comment = await Comment.create({
        content: content,
        owner: userId,
        video: videoId,
    });
    if (!comment) throw new API_Error(500, "Failed to create an Comment");

    return res
        .status(200)
        .json(
            new Api_Response(200, comment, "Comment created successfully !!!")
        );
});

const updateComment = async_handler(async (req, res) => {
    // TODO: update a comment

    const { updatedContent } = req.body;
    const { commentId } = req.params;
    if (!updatedContent || updatedContent.trim().length === 0)
        throw new API_Error(400, "Please enter some content");
    if (!isValidObjectId(commentId))
        throw new API_Error(400, "Please enter an comment ID");

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: updatedContent,
        },
        {
            new: true,
        }
    );
    if (!updatedComment)
        throw new API_Error(500, "Failed To Update the Comment");

    return res
        .status(200)
        .json(
            new Api_Response(
                200,
                updatedComment,
                "Comment updated Sucessfully!!!"
            )
        );
});

const deleteComment = async_handler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId))
        throw new API_Error(400, "Please enter an comment ID");

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment)
        throw new API_Error(500, "Failed To Delete the Comment");

    return res
        .status(200)
        .json(new Api_Response(200, {}, "Comment deleted Sucessfully!!!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
