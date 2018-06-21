import Router from 'koa-router';
import userController from '../controllers/UserController';
import forumController from '../controllers/ForumController';
import threadController from '../controllers/ThreadController';

const router = new Router();

router.post('/api/user/:nickname/create', userController.create);
router.post('/api/user/:nickname/profile', userController.update);
router.get('/api/user/:nickname/profile', userController.get);

router.post('/api/forum/create', forumController.create);
router.get('/api/forum/:slug/details', forumController.get);

router.post('/api/forum/:slug/create', forumController.createThread);
// userRouter.get('/api/user/:nickname/profile', userController.get);
// userRouter.post('/api/user/:nickname/profile', userController.update);

router.get('/api/thread/:slug_or_id/details', threadController.threadDetails);
// router.post('/api/thread/:slug_or_id/details', threadController.threadUpdate);

export default router;