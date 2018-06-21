import forumService from '../services/forumService';

class ForumController {

    async create(ctx) {
        const forum = ctx.request.body;

        const [status, result] = await forumService.create(forum);

        ctx.body = result;
        ctx.status = status;
    }

    async update(ctx) {
        const user = ctx.request.body;
        const nickname = ctx.params['nickname'];

        const [status, updatedUser] = await forumService.update(nickname, user);

        ctx.body = updatedUser;
        ctx.status = status;
    }

    async get(ctx) {
        const nickname = ctx.params['nickname'];

        const [status, result] = await forumService.get(nickname);

        ctx.body = result;
        ctx.status = status;
    }
}

const forumController = new ForumController();
export default forumController;