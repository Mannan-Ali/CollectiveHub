import { Router } from "express";
import {
  createTweets,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); //now this will be used in all the routes without declaring it
router.route("/createTweet").post(createTweets);
router.route("/users/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet);
router.route("/:tweetId").delete(deleteTweet);

export default router;
