import threadService from '../services/threadService';

class ThreadController {

    async threadDetails(ctx) {
        const slugOrId = ctx.params['slug_or_id'];

        const [status, thread] = await threadService.getByIdOrSlug(slugOrId);

        ctx.status = status;
        ctx.body = thread;
    }
}

const threadController = new ThreadController();
export default threadController;