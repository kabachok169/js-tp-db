import DataBaseService from './dbService';
import threadService from './threadService';

class PostService extends DataBaseService {

    constructor() {
        super();       
    }

    async createPosts(posts, theadSlugOrId, created) {

        console.log("Start");

        console.log(posts);

        if (posts.length === 0) {
            return [201, posts];
        }

        console.log("posts.length != 0");

        const [status, thread] = await threadService.getByIdOrSlug(theadSlugOrId);
        if (status === 404) {
            console.log("WARN: not fount thread: " + theadSlugOrId);
            return [status, thread];
        }

        console.log("thread found");

        const parents = this.selectParents(posts);

        if (parents.length) {
            const idLine = parents.join(', ');
            const foundParents = await this.dataBase.manyOrNone(
                `SELECT id FROM posts WHERE thread = ${thread.id}} AND id = ANY(ARRAY[${idLine}]::BIGINT[]);`);
            
            if (foundParents.length < parents.length) {
                return [409, {message: 'Some parents are wrong'}];
            }
        }

        const forumSlug = thread.forum;
        const threadID = thread.id;

        console.log(forumSlug, threadID);

        
        const added = posts.map(post => {
            console.log("try to add " + post);
            const result = await this.dataBase.oneOrNone(
                `insert into posts (parent, author, forum, thread, created, message) 
                    values (${ post.parent ? post.parent : 0} , '${post.author}', 
                    '${forumSlug}', ${threadID}, '${created.toISOString()}', '${post.message$}') returning *;`                
            ).catch(reason => console.log(reason));

            console.log(result);

            return result;
        });

        this.dataBase.query(
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