import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscriber,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); 

router.route("/c/:channelId").post(toggleSubscription)
                             .get(getUserChannelSubscriber);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
