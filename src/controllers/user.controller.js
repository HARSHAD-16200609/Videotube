import { async_handler } from "../utils/async-handler.js";
import { API_Error } from "../utils/Api_error.js";
import { User } from "../models/users.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import bcrypt from "bcrypt";
import { Api_Response } from "../utils/Api_Response.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"
const registerUser = async_handler(async (req, res) => {
    //algorithm
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullName, password } = req.body;

    if (
        [username, email, fullName, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new API_Error(400, "All fields are required");
    }

    const existing_user = await User.findOne({
        $or: [{ username: username }, { email: email }],
    });

    if (existing_user) {
        throw new API_Error(409, "User already registered");
    }

    const avatar_local_path = req.files?.avatar[0]?.path;
    let coverImage_local_path;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImage_local_path = req.files?.coverImage[0]?.path;
    }

    const avatar = await uploadOnCloudinary(avatar_local_path);
    const coverImage = await uploadOnCloudinary(coverImage_local_path);
    console.log(avatar.secure_url);
    console.log(coverImage.secure_url);

    if (!(avatar && coverImage)) {
        throw new API_Error(
            500,
            "Internal server Error : Files failed to upload try again !!!"
        );
    }

    const user = await User.create({
        fullName: fullName,
        email: email,
        username: username.toLowerCase(),
        password: password,
        avatar: avatar.secure_url,
        avatarPubId: avatar.public_id,
        coverImage: coverImage.secure_url,
        coverPubId: coverImage.public_id,
    });
    // IMP for futher reference new syntax
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new API_Error(
            500,
            "Something went wrong while registering the user"
        );
    }

    res.status(201).json(createdUser);
});

const generateRefreshTokenandAccessToken = async (user) => {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const loginUser = async_handler(async (req, res) => {
    // alogorithm
    // take username/email and pass from user (req.body)
    // validate them (if any field empty)
    // check entered pass with the saved pass in db
    // generate acess token and refresh token
    // save the refresh token in db and send the acess token to the front end (using cookie)

    const { username, email, password } = req.body;

    if (!email && !username)
        throw new API_Error(401, "Enter username or email");

    const user = await User.findOne({
        $or: [{ email: email }, { username: username }],
    });

    if (!user) throw new API_Error(401, "Invalid Credentials");

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid)
        throw new API_Error(401, "Unauthoorized acess : Incorrect Password");

    const { accessToken, refreshToken } =
        await generateRefreshTokenandAccessToken(user);

    const logged_info = {
        message: accessToken,
    };
    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new Api_Response(200, logged_info, "logged in sucessfully"));
});

const logoutUser = async_handler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, // this removes the field from document
            },
        },
        {
            new: true,
        }
    );
    // according to claude code
    // Postman:
    // More lenient with cookie handling
    // May ignore or override the secure flag in some cases
    // Often works with secure: true even on HTTP for testing
    // Requestly:
    // Stricter cookie handling
    // Enforces the secure flag more strictly
    // Won't send cookies with secure: true over HTTP

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new Api_Response(200, {}, "User logged Out"));
});

const refreshAccessToken = async_handler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new API_Error(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new API_Error(401, "Invalid refresh token");
        }

        const isValid = await bcrypt.compare(
            incomingRefreshToken,
            user.refreshToken
        );

        // if (incomingRefreshToken !== user?.refreshToken) {
        //     throw new API_Error(401, "Refresh token is expired or used")

        // }
        if (!isValid) {
            throw new API_Error(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateRefreshTokenandAccessToken(user);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new Api_Response(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new API_Error(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = async_handler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    console.log(oldPassword);

    const user = await User.findById(req.user?._id);

    const isValid = await user.isPasswordCorrect(oldPassword);

    if (!isValid) throw new API_Error(400, "Invalid Credentials");

    // save used instead of findbyidandupdate as we want
    // the pre hook to run the pre hook dosent runs using findbyidandupdate

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(201).json(
        new Api_Response(201, {}, "Password Reset Succesfully")
    );
});

const getCurrentUser = async_handler(async (req, res) => {
    return res
        .status(200)
        .json(new Api_Response(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = async_handler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new API_Error(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new Api_Response(200, user, "Account details updated successfully")
        );
});

const userAvatarUpdate = async_handler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath)
        throw new API_Error(400, "Please attach an Image file (Avatar Img");

    const newAvatarPath = await uploadOnCloudinary(avatarLocalPath);

    if (!newAvatarPath)
        throw new API_Error(500, "File Failed to Upload (avatar img)");
    const newUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: newAvatarPath.secure_url,
                avatarPubId: newAvatarPath.public_id,
            },
        },
        { new: true }
    ).select("-refreshToken -watchHistory -password -email");

    deleteFromCloudinary(req.user.avatarPubId);

    res.status(201).json(
        new Api_Response(200, newUser, "Avatar changed sucessfully")
    );
});

const coverImgUpdate = async_handler(async (req, res) => {
    const coverImgLocalPath = req.file?.path;

    if (!coverImgLocalPath)
        throw new API_Error(400, "Please attach an Image file(Cover Img)");

    const newcoverImgPath = await uploadOnCloudinary(coverImgLocalPath);

    if (!newcoverImgPath)
        throw new API_Error(500, "File Failed to Upload (cover img)");
    const newUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: newcoverImgPath.secure_url,
                coverPubId: newcoverImgPath.public_id,
            },
        },
        { new: true }
    ).select("-refreshToken -watchHistory -password -email");

    deleteFromCloudinary(req.user.coverPubId);

    res.status(201).json(
        new Api_Response(200, newUser, "cover img changed sucessfully")
    );
});

const getChannelProfile = async_handler(async (req, res) => {
    const { username } = req.params;
    const userId = req.user?._id
        ? new mongoose.Types.ObjectId(req.user._id)
        : null;
    const channel = await User.aggregate([
        {
            $match: { username: username.trim().toLowerCase() },
            /**
             * $match
             * Filters documents (like SQL WHERE)
             * Only user with matching username passes to next stage
             */
        },
        /**
         * $lookup (JOIN)
         * Fetches all subscriptions where:
         * channel === current user's _id
         * These are the SUBSCRIBERS of this channel
         */
        {
            $lookup: {
                from: "subscriptions", // collection to join
                localField: "_id", // User._id
                foreignField: "channel", // subscriptions.channel
                as: "subscribers", // output array field
            },
        },
        /**
         * $lookup (JOIN)
         * Fetches all subscriptions where:
         * subscriber === current user's _id
         * These are channels THIS user subscribed to
         */
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriptions",
            },
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscriptionsCount: {
                    $size: "$subscriptions",
                },
                /**
                 * $in
                 * Checks if logged-in userId exists
                 * inside subscribers.subscriber array
                 * Returns true / false
                 */
                isSubscribed: {
                    $in: [userId, "$subscribers.subscriber"],
                },
            },
        },
        /**
         * $project
         * Selects which fields to return (like SELECT in SQL)
         * 1 = include field
         * 0 = exclude field
         */
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscriptionsCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    // aggregate() ALWAYS returns an array
    // If array is empty → no user found
    if (!channel?.length) throw new API_Error(404, "User not Found");

    // Return the single channel profile (first element)
    res.status(200).json(
        new Api_Response(200, channel[0], "Channel Found Sucessfully")
    );
});

const getWatchHistory = async_handler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req?.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        avatar: 1,
                                        username: 1,
                                    },
                                },
                            ],
                        },
                        
                    },
                    { $addFields: {
                owner: {
                    $first: "$owner",
                },
            }},
                ],
            },
        },
       
    ]);

    if(!user.length) throw new API_Error(404,"User dosent Exist")

      res.status(200).json(new Api_Response(200,user[0].watchHistory,"Watch History Fetched Successfully !!!"))
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    userAvatarUpdate,
    coverImgUpdate,
    getChannelProfile,
    getWatchHistory
};
