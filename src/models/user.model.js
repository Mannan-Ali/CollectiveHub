import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "UserName  is required "],
      lowercase: true,
      unique: [true, "Enter Unique name "],
      trim: true,
      index: true, // makes it easy to search like if you know this data will be used
      // for searching then do index true
    },
    email: {
      type: String,
      required: [true, "email is required "],
      lowercase: true,
      unique: [true, "Enter Unique name "],
      trim: true, // using this we can remove whitespace
    },
    fullName: {
      type: String,
      required: [true, "fullName is required "],
      trim: true,
    },
    avatar: {
      type: String, // using cloudniary url
      required: true,
    },
    coverImage: {
      type: String, // using cloudniary url
    },
    watchHistory: [
      //this is array as we will keep adding this value
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    //challenge : how we will encrypt the password as in database there  should be encryption and
    // real password to match
    password: {
      type: String,
      required: [true, "Password is required "],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // without this the code will even encrypt when basics like avatar or name for everytime
  //is changed hence it is important
  if (!this.isModified("password")) return next();
  //bcrypt.hash(this.password, 10) 10 is the total rounds
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //one is password passed by user and other is encrypted one
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);

//REFREHS TOKEN AND ACCESS TOKEN
// when the users accesstoken expire he can go to an endpoint if refresh token not expired then give new access token
/* 
What Are Access Tokens and Refresh Tokens?
Access Token: This is like a short-term pass that lets the user access the app. It contains basic user info, like ID and email, and has a short expiration time (often minutes or hours). It’s used to make requests to the server without logging in every time.

Refresh Token: This is like a longer-term pass that is only used to get a new access token when the current one expires. It contains minimal information, just enough to identify the user (like the user ID).
*/