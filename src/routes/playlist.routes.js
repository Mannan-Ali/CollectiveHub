import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/createPlaylist").post(createPlaylist);
router.route("/users/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId").patch(updatePlaylist);
router.route("/:playlistId").delete(deletePlaylist);
//note one thing in postman the query paramaters is req.query not req.params
router.route("/addToPlaylist/:videoId/:playlistId").patch(addVideoToPlaylist);
router
  .route("/removeFromPlaylist/:videoId/:playlistId")
  .delete(removeVideoFromPlaylist);

export default router;
