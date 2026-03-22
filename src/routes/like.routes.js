import { Router } from "express";
import {
  toggleVideoLike,
  toogleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkValidObjectId } from "../middlewares/validateObjectId.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(checkValidObjectId(['videoId']),toggleVideoLike);
router.route("/toggle/c/:commentId").post(toogleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;
