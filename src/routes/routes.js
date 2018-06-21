import Router from 'koa-router';
import userController from '../controllers/UserController';
import forumController from '../controllers/ForumController';

const router = new Router();

router.post('/api/user/:nickname/create', userController.create);
router.post('/api/user/:nickname/profile', userController.update);
router.get('/api/user/:nickname/profile', userController.get);

router.post('/api/forum/create', forumController.create);
router.get('/api/forum/:slug/details', forumController.get);

router.post('/api/forum/:slug/create', forumController.createThread);
router.get('/api/forum/:slug/threads', forumController.getThreads);
// userRouter.get('/api/user/:nickname/profile', userController.get);
// userRouter.post('/api/user/:nickname/profile', userController.update);

export default router;