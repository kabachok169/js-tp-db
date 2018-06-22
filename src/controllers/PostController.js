import postService from '../services/postService';

class PostController {

    async create(ctx) {
        const posts = ctx.request.body;
        const theadSlugOrId = ctx.params['slug_or_id'];

        const created = new Date();

        const [status, result] = await postService.createPosts(posts, theadSlugOrId, created);

        ctx.body = result;
        ctx.status = status;
    }
}

const postController = new PostController();
export default postController;