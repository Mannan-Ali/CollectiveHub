//this middleware only checks if user is Logined or not
//if yes then we can do specific opeation on on the specific user logedin

import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
export const verifyJWT = asynHandler(async (req, res, next) => {
    try {
        //remeber the appbewery where we set  AUthencation for level4 as bearear token this req.header is same thing we are checking if someone sends using Authentication
        //Authorization : bearber token
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized Request from Auth file")
        }
        //verfiy can be done only if secret is avaibale
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //now here we accessed the id of the user using accessToken and aslo verified that user exits
        //problem in logout solved
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 
        //as accessToken was created with lot of information like _id,username etc

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        //instead of returning we are adding new object in req, like there is req.body , req.files(multer)
        //as this is our own middleware we can do that : added user object to req
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token")
    }
})

//we will use this in routes in users in route logOut

//why did we made this file 
/*
 Logout Implementation
For logging out, the middleware allows you to check if a user is already logged in (i.e., has a valid token) and to invalidate that token (e.g., by removing the token from cookies or adding it to a blacklist).
With verifyJWT handling token verification and user lookup, the logout logic in the controller becomes simpler, as it only needs to clear the relevant cookies or token storage. The controller doesn

Logout Is Only About Clearing Tokens
Logging out is primarily about invalidating or clearing the access and refresh tokens. You don’t need to re-validate or retrieve the user's full data to log them out.
The purpose of logout is to end the session, which means removing the tokens stored on the client and server, not fetching or confirming user data.

Why Use verifyJWT Middleware for Logout?
For logout, the middleware approach helps by ensuring that the access token is valid before proceeding to remove or invalidate it, making the logout process more secure. This way, only authenticated users can log out, and it standardizes how tokens are verified before invalidation.

In summary, using verifyJWT as middleware ensures clean, modular, and reusable code that simplifies route protection and promotes secure, consistent authentication checks across the application.
*/