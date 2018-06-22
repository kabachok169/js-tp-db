import DataBaseService from './dbService';
import threadService from './threadService';

class PostService extends DataBaseService {

    constructor() {
        super();       
    }

    async createPosts(posts, theadSlugOrId, created) {

        if (!posts.lenth) {
            return [201, posts];
        }

        const [status, thread] = await threadService.getByIdOrSlug(theadSlugOrId);
        if (status === 404) {
            return [status, thread];
        }

        const parents = this.selectParents(posts);

        if (parents.lenth) {
            const idLine = parents.join(', ');
            console.log(idLine);
            const foundParents = this.dataBase.manyOrNone(
                `SELECT id FROM posts WHERE thread = ${thread.id}} AND id = ANY(ARRAY[${idLine}]::BIGINT[]);`);
            
            if (foundParents.length < parents.lenth) {
                return [409, {message: 'Some parents are wrong'}];
            }
        }

        const forumSlug = thread.forum;
        const threadID = thread.id;

        const added = posts.map(post => {
            const result = this.dataBase.oneOrNone(
                `insert into posts (parent, author, forum, thread, created, message) values ($1, $2, $3, $4, $5, $6) returning *;`,
                post.parent, post.author, forumSlug, threadID, created, post.message
            );
            console.log(result);
            return result;
        });

        await threadService.dataBase.oneOrNone(
            `update forum set posts = posts + ${added.length} where lower('slug') = lower($1);`,
            forumSlug
        );

        return [200, added];
    }

    selectParents(posts) {

        let candidates = new Set();

        posts.forEach(post => candidates.add(post.parent));

        const parents = posts.map(post => post.id).filter(id => !candidates.has(id));

        return parents;
    }
}


const postService = new PostService();
export default postService;