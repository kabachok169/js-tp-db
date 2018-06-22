import threadService from '../services/threadService';

class ThreadController {

    async threadDetails(ctx) {
        const slugOrId = ctx.params['slug_or_id'];

        const [status, thread] = await threadService.getByIdOrSlug(slugOrId);

        ctx.status = status;
        ctx.body = thread;
    }

    async threadUpdate(ctx) {
        const slugOrId = ctx.params['slug_or_id'];
        const updates = ctx.request.body;

        const [status, thread] = await threadService.updateByIdOrSlug(slugOrId, updates);

        ctx.status = status;
        ctx.body = thread;
    }

    async createPosts(ctx) {
        const created = new Date();

        const slugOrId = ctx.params['slug_or_id'];
        const posts = ctx.request.body;

        const [status, posts] = await threadService.createPosts(slugOrId, posts, created);

        ctx.status = status;
        ctx.body = posts;
    }

    async vote(ctx) {
        const slugOrId = ctx.params['slug_or_id'];
        const vote = ctx.request.body;

        const [status, updatedThread] = await threadService.vote(slugOrId, vote);

        ctx.status = status;
        ctx.body = updatedThread;
    }
}

const threadController = new ThreadController();
export default threadController;