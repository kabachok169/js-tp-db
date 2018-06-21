import userService from '../services/userService';

class UserController {

    async create(ctx) {
        const user = ctx.request.body;
        const nickname = ctx.params['nickname'];

        const [newUser, conflictUsers] = await userService.create(nickname, user);

        // console.log(newUser, conflictUsers);

        if (newUser === null) {
            ctx.body = conflictUsers;
            ctx.status = 409;
            return;
        }

        ctx.body = newUser;
        ctx.status = 201;
    }

    async update(ctx) {
        const user = ctx.request.body;
        const nickname = ctx.params['nickname'];

        const [status, updatedUser] = await userService.update(nickname, user);

        ctx.body = updatedUser;
        ctx.status = status;
    }

    async get(ctx) {
        const nickname = ctx.params['nickname'];

        const [status, result] = await userService.get(nickname);

        ctx.body = result;
        ctx.status = status;
    }
}

const userController = new UserController();
export default userController;