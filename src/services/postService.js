import DataBaseService from './dbService';
import threadService from './threadService';

class PostService extends DataBaseService {

    constructor() {
        super();
    }

    async get(id, related) {
        const result = {};
        const post = await this.dataBase.oneOrNone(`SELECT * FROM posts WHERE id = ${id}`);
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
        const post = await this.dataBase.oneOrNone(`SELECT * FROM posts WHERE id = ${id}`);

        if (!post) {
            return [404, {message: 'No thread found'}];
        }

        if (!postData.message || postData.message === post.message) {
            post.isEdited = post.isedited;
            return [200, post];
        }

        const newPost = await this.dataBase.one(
            `UPDATE posts SET isEdited=TRUE, message='${postData.message}' WHERE id = ${id} RETURNING *;`
        );

        newPost.isEdited = newPost.isedited;

        return [200, newPost];
    }

    async createPosts(posts, threadSlugOrId, created) {

        if (posts.length === 0) {
            return [201, posts];
        }

        const [status, thread] = await threadService.getByIdOrSlug(threadSlugOrId);
        if (status === 404) {
            return [status, thread];
        }

        const authors = this.selectAuthors(posts);
        if (authors.length) {
            const nicksLine = authors.map(nick => `LOWER('${nick}')`).join(', ');
            // console.log(nicksLine);
            const query = `SELECT lower(nickname) FROM users WHERE lower(nickname) = ANY(ARRAY[${nicksLine}]);`;
            // console.log(query);
            const foundAuthors = await this.dataBase.manyOrNone(query).catch(reason => console.log(reason));
            
            if (foundAuthors.length < authors.length) {
                return [409, {message: 'Some users are wrong'}];
            }
        }

        const parents = this.selectParents(posts);
        if (parents.length) {
            const idLine = parents.join(', ');
            const foundParents = await this.dataBase.manyOrNone(
                `SELECT id FROM posts WHERE thread = ${thread.id} AND id = ANY(ARRAY[${idLine}]::BIGINT[]);`
            ).catch(reason => console.log(reason));
            
            if (foundParents.length < parents.length) {
                return [409, {message: 'Some parents are wrong'}];
            }
        }

        const forumSlug = thread.forum;
        const threadID = thread.id;

        let added = [];

        const values = posts.map(
            p => `(${p.parent ? p.parent : 0} , '${p.author}','${forumSlug}', ${threadID},'${created.toISOString()}', '${p.message}')`
        ).join(", ")

        // cconsole.log(values);

        // for (let post of posts) {
        //     const result = await this.dataBase.oneOrNone(
        //         `insert into posts (parent, author, forum, thread, created, message) 
        //             values (${post.parent ? post.parent : 0} , '${post.author}','${forumSlug}', ${threadID}, '${created.toISOString()}', '${post.message}') returning *;`                
        //     ).catch(reason => console.log(reason));

        //     [result.id, result.parent] = [+result.id, +result.parent];
        //     delete result.path;
        //     // console.log(result);

        //     added.push(result);
        // }

        console.log('LEN: ', added.length);


        const result = await this.dataBase.manyOrNone(
                    `insert into posts (parent, author, forum, thread, created, message) values ${values} returning *;`                
                ).catch(reason => console.log(reason));

        result.forEach(post => {
            [post.id, post.parent] = [+post.id, +post.parent];
            delete post.path;
            added.push(post);
        });

        // console.log(added)        

        this.dataBase.query(
            `update forum set posts = posts + ${added.length} where lower(slug) = lower($1);`,
            forumSlug
        ).catch(reason => console.log(reason));

        return [201, added];
    }

    selectParents(posts) {

        let candidates = new Set();

        posts.forEach(post => post.parent && candidates.add(post.parent));

        return [...candidates];
    }

    selectAuthors(posts) {
        let candidates = new Set();
        posts.forEach(post => candidates.add(post.author));
        return [...candidates];
    }

    async getPosts(slugOrId, limit, since, sort, desc) {

        const [status, thread] = await threadService.getByIdOrSlug(slugOrId);
        if (status === 404) {
            return [status, thread];
        }

        if (sort === 'tree') {
            let request = `SELECT * FROM posts where thread = ${thread.id} 
                        ${desc === 'true' ? (since ? `AND path < (SELECT path FROM posts WHERE id = ${since})` : '') 
                            : (since ? `AND path > (SELECT path FROM posts WHERE id = ${since})` : '')}
                        ORDER BY path ${desc === 'true' ? 'DESC' : 'ASC'}, id ${desc === 'true'  ? 'DESC' : 'ASC'} ${limit ? `LIMIT ${limit}` : ''}`;
            
            const result = await this.dataBase.manyOrNone(request);

            result.forEach(post => {post.id = +post.id; post.parent = +post.parent; delete post.path; console.log(post)});
            return [200, result];
        }
        if (sort === 'flat') {
            let request = `SELECT * FROM posts where thread = ${thread.id} 
                        ${desc === 'true' ? (since ? `AND id < ${since}` : '') : (since ? `AND id > ${since}` : '')}
                        ORDER BY created ${desc === 'true' ? 'DESC' : 'ASC'}, id ${desc === 'true' ? 'DESC' : 'ASC'} ${limit ? `LIMIT ${limit}` : ''}`;
            
            const result = await this.dataBase.manyOrNone(request);

            result.forEach(post => {post.id = +post.id; post.parent = +post.parent; delete post.path; console.log(post)});
            return [200, result];
        }
        if (sort === 'parent_tree') {
            const parents = await this.dataBase.manyOrNone(
                this.getParents(thread.id, since, desc, limit)
            ).catch(reason => console.log(reason));

            let posts = [];
            for (let parentID of parents) {
                let request = `SELECT * FROM posts where thread = ${thread.id} AND path[1] = ${parentID.id}
                        ${desc === 'true' ? (since ? `AND path[1] < (SELECT path[1] FROM posts WHERE id = ${since})` : '')
                    : (since ? ` AND path[1] > (SELECT path[1] FROM posts WHERE id = ${since})` : '')}
                        ORDER BY path, id`;
                
                const result = await this.dataBase.manyOrNone(request);
                posts = posts.concat(result);
            }
            posts.forEach(post => {post.id = +post.id; post.parent = +post.parent; delete post.path; console.log(post)});
            return [200, posts];
        }
    }

    getParents(threadId, since, desc, limit) {
        const request =
            `SELECT id FROM posts WHERE thread = ${threadId} AND parent = 0${desc === 'true' ? 
                (since ? ` AND path[1] < (SELECT path[1] FROM posts WHERE id = ${since})` : '') :
                (since ? ` AND path[1] > (SELECT path[1] FROM posts WHERE id = ${since})` : '')}
            ORDER BY id ${desc === 'true' ? 'DESC' : 'ASC'} ${limit ? `LIMIT ${limit};` : ''}`;
        

        return request;
    }
}

const postService = new PostService();
export default postService;