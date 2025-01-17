import { Router } from "express";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); //now this will be used in all the routes without declaring it
router.route("/:channelId").post(toggleSubscription);
router.route("/:channelId").get(getUserChannelSubscribers);
router.route("/channel/:subscriberId").get(getSubscribedChannels);

export default router;
