import Router from 'koa-router';
import userController from '../controllers/UserController';
import forumController from '../controllers/ForumController';
import threadController from '../controllers/ThreadController';
import serviceController from '../controllers/ServiceController';
import postController from '../controllers/PostController';

const router = new Router();

router.post('/api/user/:nickname/create', userController.create);
router.post('/api/user/:nickname/profile', userController.update);
router.get('/api/user/:nickname/profile', userController.get);

router.post('/api/forum/create', forumController.create);
router.get('/api/forum/:slug/details', forumController.get);

router.post('/api/forum/:slug/create', forumController.createThread);
router.get('/api/forum/:slug/threads', forumController.getThreads);
router.get('/api/forum/:slug/users', forumController.getUsers);
// userRouter.get('/api/user/:nickname/profile', userController.get);
// userRouter.post('/api/user/:nickname/profile', userController.update);

router.get('/api/thread/:slug_or_id/details', threadController.threadDetails);
router.post('/api/thread/:slug_or_id/details', threadController.threadUpdate);

router.get('/api/post/:id/details', postController.get);
router.post('/api/post/:id/details', postController.update);

router.post('/api/service/clear', serviceController.clear);
router.get('/api/service/status', serviceController.getInfo);

router.get('/api/thread/:slug_or_id/posts', postController.getPosts);

router.post('/api/thread/:slug_or_id/create', postController.create);

export default router;