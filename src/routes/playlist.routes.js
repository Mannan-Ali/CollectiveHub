import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getUserPlaylists, removeVideoFromPlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT); 

router.route("/createPlaylist").post(createPlaylist);
router.route("/users/:userId").get(getUserPlaylists);
//note one thing in postman the query paramaters is req.query not req.params
router.route("/addToPlaylist/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/removeFromPlaylist/:videoId/:playlistId").delete(removeVideoFromPlaylist);

export default router;