import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist, getUserPlaylists } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT); 

router.route("/createPlaylist").post(createPlaylist);
router.route("/:userId").get(getUserPlaylists);

export default router;