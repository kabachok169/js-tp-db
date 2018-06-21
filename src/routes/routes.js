import Router from 'koa-router';
import userController from '../controllers/UserController';

const router = new Router();

router.post('/api/user/:nickname/create', userController.create);
router.post('/api/user/:nickname/profile', userController.update);
router.get('/api/user/:nickname/profile', userController.update);
// userRouter.get('/api/user/:nickname/profile', userController.get);
// userRouter.post('/api/user/:nickname/profile', userController.update);

export default router;