import { Router } from "express";
import { createTweets,deleteTweet,getUserTweets,updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT) //now this will be used in all the routes without declaring it
router.route("/createTweet").post(createTweets);
router.route("/:userId").get(getUserTweets);


export default router;