import DataBase from '../DataBase/DataBase';

class UserController {
    async create(ctx, next) {
        const dataBase = new DataBase({},
            {
            user: 'anton',
            database: 'anton',
            password: '12345',
            host: '127.0.0.1',
            port: 5432
        });
        const result = await dataBase.controller.one(`INSERT INTO users (nickname, email, fullname, about) 
                                 VALUES('kabachok1', 'kabachok1@mail.ru', 'kab', 'about') RETURNING *`);
        console.log(result);
        ctx.body = result;
        ctx.status = 200;
    }

    // async get(ctx, next) {
    //     const user = await userService.getUserByNickname(ctx.params.nickname);
    //
    //     ctx.body = user;
    //     ctx.status = user ? 200 : 404;
    // }
    //
    // async update(ctx, next) {
    //     const body = ctx.request.body;
    //     body.nickname = ctx.params.nickname;
    //
    //     await userService.task(async (task) => {
    //         const errors = await userService.checkErrors(body.nickname, body.email, task);
    //
    //         if (errors.notfound) {
    //             ctx.body = null;
    //             ctx.status = 404;
    //
    //             return;
    //         } else if (errors.conflict) {
    //             ctx.body = null;
    //             ctx.status = 409;
    //
    //             return;
    //         }
    //
    //         ctx.body = await userService.update(body, task);
    //         ctx.status = 200;
    //     });
    // }
}

const userController = new UserController();
export default userController;