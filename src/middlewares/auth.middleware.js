//this middleware only checks if user is Logined or not
//if yes then we can do specific opeation on on the specific user login

import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asynHandler(async (req, res, next) => {
  try {
    //Authorization : bearber token
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized Request from Auth file");
    }
    //verfiy can be done only if secret is avaibale
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //now here we accessed the id of the user using accessToken and aslo verified that user exits
    //problem in logout solved
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    //as accessToken was created with lot of information like _id,username etc

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    //instead of returning we are adding new object in req, like there is req.body , req.files(multer)
    //as this is our own middleware we can do that : added user object to req
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access Token");
  }
});

//we will use this in routes in users in route logOut

