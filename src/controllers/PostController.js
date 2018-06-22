import postService from '../services/postService';
import forumService from "../services/forumService";

class PostController {

    async update(ctx) {
        const id = ctx.params['id'];
        const postData = ctx.request.body;

        const [status, result] = await postService.update(id, postData);

        ctx.body = result;
        ctx.status = status;
    }

    async get(ctx) {
        const id = ctx.params['id'];
        const related = ctx.query['related'];

        const [status, result] = await postService.get(id, related);

        ctx.body = result;
        ctx.status = status;
    }
}

const postController = new PostController();
export default postController;