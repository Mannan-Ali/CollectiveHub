/*
Check user controller before this 
*/

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()
//when the user will come here using .../user then guide them to register if typed next it can be anything else also 
router.route("/register").post
    (
        //just before post using middleware
        upload.fields([
            {
                //name and number of image or file you want 
                name: "avatar",
                maxCount : 1
            },
            {
                name: "coverImage",
                maxCount : 1
            }
        ]),
    registerUser
    )
//register user is in controller user 
//what is happening is when user hits localhost:8000/api/v1/users we come here than 
//from here we can have lot of things after users like rigester , login etc. so doing this we can 
//create many routes withot duplicates

export { router }

//basic defination in app.js and user controller