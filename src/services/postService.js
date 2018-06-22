import DataBaseService from './dbService';

class PostService extends DataBaseService {

    constructor() {
        super();
    }

    async get(id, related) {
        const result = {};
        const post = await this.dataBase.oneOrNone(`SELECT * FROM messages WHERE id = ${id}`);
        if (!post) {
            return [404, {message: 'No thread found'}];
        }
        post.isEdited = post.isedited;
        result.post = post;
        if (!related) {
            return [200, result];
        }

        if (related.user) {
            const user = await this.dataBase.one(this.checkUser(post.author));
            result.user = user;
        }
        if (related.forum) {
            const forum = await this.dataBase.one(this.checkForum(post.forum));
            forum.user = forum.author;
            result.forum = forum;
        }
        if (related.thread) {
            const thread = await this.dataBase.one(`SELECT * FROM threads WHERE id = ${post.thread};`);
            thread.id = +thread.id;
            thread.votes = +thread.votes;
            result.thread = thread;
        }

        return [200, result];
    }

    async update(id, postData) {
        const post = await this.dataBase.oneOrNone(`SELECT * FROM messages WHERE id = ${id}`);

        if (!post) {
            return [404, {message: 'No thread found'}];
        }

        if (!postData.message || postData.message === post.message) {
            post.isEdited = post.isedited;
            return [200, post];
        }

        const newPost = await this.dataBase.one(
            `UPDATE messages SET isEdited=TRUE, message='${postData.message}' WHERE id = ${id} RETURNING *;`
        );

        newPost.isEdited = newPost.isedited;

        return [200, newPost];
    }
}

const postService = new PostService();
export default postService;