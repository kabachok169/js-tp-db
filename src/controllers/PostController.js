import postService from '../services/postService';

class PostController {

    async update(ctx) {
        const id = ctx.params['id'];
        const postData = ctx.request.body;

        const [status, result] = await postService.update(id, postData);
    }

    async create(ctx) {
        const posts = ctx.request.body;
        const theadSlugOrId = ctx.params['slug_or_id'];

        const created = new Date();

        const [status, result] = await postService.createPosts(posts, theadSlugOrId, created);
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

    async getPosts(ctx) {
        const theadSlugOrId = ctx.params['slug_or_id'];
        const limit = ctx.query['limit'];
        const since = ctx.query['since'];
        const sort = ctx.query['sort'];
        const desc = ctx.query['desc'];

        const [status, result] = await postService.getPosts(theadSlugOrId, limit, since, sort, desc);

        ctx.body = result;
        ctx.status = status;
    }
}

const postController = new PostController();
export default postController;