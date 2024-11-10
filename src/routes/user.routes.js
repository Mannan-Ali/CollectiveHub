/*
Check user controller before this 
*/

import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassowrd, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
//when the user will come here using .../user then guide them to register if typed next it can be anything else also 
router.route("/register").post(
    //just before post using middleware
    //name and number of image or file you want 
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);
//register user is in controller user 
//what is happening is when user hits localhost:8000/api/v1/users we come here than 
//from here we can have lot of things after users like rigester , login etc. so doing this we can 
//create many routes withot duplicates
router.route("/LogIn").post(loginUser)
router.route("/LogOut").post(verifyJWT, logOutUser)
router.route("/RefreshAccessToken").post(refreshAccessToken)
router.route("/ChangePassowrd").post(verifyJWT, changeCurrentPassowrd)
router.route("/profile").get(verifyJWT, getCurrentUser)
router.route("/UpdateDetails").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar")
    , updateUserAvatar
)
router.route("/coverImage").patch(
    verifyJWT,
    upload.single("coverImage")
    , updateUserCoverImage
)
//as we have defined user name in getUserChannel so it has to be same 
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
    
//now we can access req.user in controller in logOut
export { router }

//basic defination in app.js and user controller