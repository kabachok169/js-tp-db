import threadService from '../services/threadService';
import { isNull } from 'util';

class ThreadController {

    async threadDetails(ctx) {
        const slugOrId = ctx.params['slug_or_id'];

        const thread = await threadService.getByIdOrSlug(slugOrId);

        if (isNull(thread)) {
            ctx.body = {message: 'No thread found'};
            ctx.status = 404; 
        } else {
            ctx.body = thread;
            ctx.status = 200;
        }
    }
}

const threadController = new ThreadController();
export default threadController;