import userService from '../services/userService';

class UserController {

    async create(ctx, next) {
        const user = ctx.request.body;
        const nickname = ctx.params['nickname'];

        let [newUser, conflictUsers] = await userService.create(nickname, user);

        console.log(newUser, conflictUsers);

        if (newUser === null) {
            ctx.body = conflictUsers;
            ctx.status = 409;
            return;
        }


        ctx.body = newUser;
        ctx.status = 201;
    }


}

const userController = new UserController();
export default userController;