import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/video/toggle/:videoId").post(toggleVideoLike);
router.route("/comment/toggle/:commentId").post(toggleCommentLike);
router.route("/tweet/toggle/:tweetId").post(toggleTweetLike);
router.route("/likedVideos").get(getLikedVideos);

export default router;
