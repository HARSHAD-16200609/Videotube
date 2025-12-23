import { async_handler } from "../utils/async-handler.js";
import { API_Error } from "../utils/Api_error.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";
import { Api_Response } from "../utils/Api_Response.js";
import jwt from "jsonwebtoken"


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
    [username, email, fullName, password].some((field) => field.trim() === "")
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

  const avatar_url = await uploadOnCloudinary(avatar_local_path);
  const coverImage_url = await uploadOnCloudinary(coverImage_local_path);
  console.log(avatar_url);
  console.log(coverImage_url);

  if (!(avatar_url && coverImage_url)) {
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
    avatar: avatar_url,
    coverImage: coverImage_url,
  });
  // IMP for futher reference new syntax
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new API_Error(500, "Something went wrong while registering the user");
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

  if (!email && !username) throw new API_Error(401, "Enter username or email");

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

  res
    .status(200)
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
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new API_Error(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new API_Error(401, "Invalid refresh token")
        }
    
        const isValid = await bcrypt.compare(incomingRefreshToken,user.refreshToken)
         
        // if (incomingRefreshToken !== user?.refreshToken) {
        //     throw new API_Error(401, "Refresh token is expired or used")
            
        // }
        if (!isValid) {
            throw new API_Error(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateRefreshTokenandAccessToken(user)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new Api_Response(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new API_Error(401, error?.message || "Invalid refresh token")
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
