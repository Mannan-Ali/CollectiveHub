import { Router } from 'express';
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/addComment/:videoId").post(addComment);
router.route("/update/:commentId").post(updateComment);
router.route("/delete/:commentId").post(deleteComment);
export default router