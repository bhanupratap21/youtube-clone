import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comments.controller.js";
import { checkValidObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route("/:videoId")
    .get(checkValidObjectId(['videoId']), getVideoComments)
    .post(checkValidObjectId(['videoId']), addComment);

router
  .route("/:videoId/:commentId")
  .delete(checkValidObjectId(["commentId"]), deleteComment)
  .patch(checkValidObjectId(["videoId","commentId"]), updateComment);

export default router;