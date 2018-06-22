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

    async getPosts(ctx) {
        const theadSlugOrId = ctx.params['slug_or_id'];
        const limit = ctx.query['limit'];
        const since = ctx.query['since'];
        const sort = ctx.query['sort'];
        const desc = ctx.query['desc'];

        const [status, result] = await threadService.getPosts(theadSlugOrId, limit, since, sort);

        ctx.body = result;
        ctx.status = status;

    }
}

const postController = new PostController();
export default postController;