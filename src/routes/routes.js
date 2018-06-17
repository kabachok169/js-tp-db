import Router from 'koa-router';
import userController from '../controllers/userController';

const userRouter = new Router();

userRouter.post('/api/user/:nickname/create', userController.create);
// userRouter.get('/api/user/:nickname/profile', userController.get);
// userRouter.post('/api/user/:nickname/profile', userController.update);

export default userRouter;