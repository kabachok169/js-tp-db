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
        const slug = ctx.params['slug'];

        const [status, result] = await forumService.get(slug);

        ctx.body = result;
        ctx.status = status;
    }

    async createThread(ctx) {
        const slug = ctx.params['slug'];
        const thread = ctx.request.body;

        const [status, result] = await forumService.createThread(slug, thread);

        ctx.body = result;
        ctx.status = status;
    }
}

const forumController = new ForumController();
export default forumController;