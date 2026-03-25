import { Router } from "express";
import { createTweet,getUserTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); 

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweet);

export default router;
