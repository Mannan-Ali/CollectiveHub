import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getVideoById, publishAVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
//when the user will come here using .../user then guide them to register if typed next it can be anything else also 
router.route("/uploadVideos").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
);

router.route("/:videoId").get(getVideoById)
export default router;