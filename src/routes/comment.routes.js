import { Router } from 'express';
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);


export default router