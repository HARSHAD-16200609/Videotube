import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
      },
    ],
    username: {
      type: String,
      required: true,
      distinct: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      distinct: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true, // cloudinary url
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
    },
    refreshToken: {
      type: String,
      default:""
    },
  },
  { timestamps: true }
);

userSchema.plugin(mongooseAggregatePaginate);

// mongoose hook like event listener in js dom
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return 

  this.password =await bcrypt.hash(this.password, 10);
  // we dont use next() in mongoose async prehooks
  // next();
});



userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = async function () {
  // this was  causing error when generate token func used in controllers 
  // if (!isPasswordCorrect(this.password)) return;

  //also wrong way as this.isPassword returns an prommise and promise are truthy always
  //therefore net below condition in if is always false so acess token is generated 
  // if (!this.isPasswordCorrect(this.password)) return;

 // pass check logic req here

  return jwt.sign(
    { _id: this._id,},
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
};
userSchema.methods.generateRefreshToken = async function () {
  if (!this.isPasswordCorrect(this.password)) return;

  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);

export {User}