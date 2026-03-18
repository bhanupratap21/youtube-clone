import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getVideoComments } from '../controllers/comments.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/:videoId').get(getVideoComments);

export default router;