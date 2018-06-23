import DataBaseService from './dbService';

class ForumService extends DataBaseService {

    constructor() {
        super();
    }

    async create(forum) {
        const user = await this.dataBase.oneOrNone(
            this.checkUser(forum.user)
        ).catch(reason => console.log(reason));

        if (!user) {
            return [404, {message: 'User not found'}];
        }

        const conflict = await this.dataBase.oneOrNone(
            `SELECT * FROM forum WHERE LOWER(slug) = LOWER('${forum.slug}');`
        ).catch(reason => console.log(reason));

        if (conflict) {
            conflict.user = conflict.author;
            return [409, conflict]
        }

        const newForum = await this.dataBase.one(
            `INSERT INTO forum (slug, title, author)
             VALUES ('${forum.slug}', '${forum.title}', '${user.nickname}') 
             RETURNING *`
        ).catch(reason => console.log(reason));

        newForum.user = newForum.author;

        return [201, newForum]
    }

    async get(slug) {
        const forum = await this.dataBase.oneOrNone(
            this.checkForum(slug)
        ).catch(reason => console.log(reason));
        // console.log(forum);
        if (!forum) {
            return [404, {message: 'No user found'}];
        }

        forum.user = forum.author;
        forum.posts = +forum.posts;
        forum.threads = +forum.threads;
        return [200, forum];
    }

    async createThread(slug, thread) {
        // console.log(1);
        const user = await this.dataBase.oneOrNone(
            this.checkUser(thread.author)
        ).catch(reason => console.log(reason));
        const forum = await this.dataBase.oneOrNone(
            this.checkForum(slug)
        ).catch(reason => console.log(reason));

        if (!forum || !user) {
            return [404, {message: 'No forum found'}];
        }

        // console.log(2);

        if (thread.slug) {
            const oldThread = await this.dataBase.oneOrNone(this.checkThread(thread.slug)).catch(reason => console.log(reason));

            if (oldThread) {
                oldThread.id = +oldThread.id;
                oldThread.votes = + oldThread.votes;
                return [409, oldThread];
            }
        }

        await this.dataBase.oneOrNone(
            `UPDATE forum SET threads = threads + 1 WHERE id = ${forum.id}`
        ).catch(reason => console.log(reason));

        await this.dataBase.oneOrNone(
            `INSERT INTO usersForums (author, forum) values ('${user.nickname}', '${forum.slug}') ON CONFLICT DO NOTHING;`
        ).catch(reason => console.log(reason));


        // console.log(3);

        const request = `INSERT INTO threads
        (message${thread.created ? ', created' : ''}, title, author, forum${thread.slug ? ', slug' : ''})
             VALUES ('${thread.message}'
             ${thread.created ? `, '${thread.created}'` : ''} ,
             '${thread.title}',
             '${user.nickname}',
             '${forum.slug}'${thread.slug ? `, '${thread.slug}'` : ''})
              RETURNING *;`;
        // console.log(request);

        const newThread = await this.dataBase.one(
            request
        ).catch(reason => console.log(reason));

        newThread.id = +newThread.id;
        newThread.votes = +newThread.votes;

        return [201, newThread];

    }

    async getThreads(slug, since, limit, desc) {
        const forum = await this.dataBase.oneOrNone(
            this.checkForum(slug)
        ).catch(reason => console.log(reason));

        if (!forum) {
            return [404, {message: 'No forum found'}];
        }

        const threads = await this.dataBase.manyOrNone(
            `SELECT * FROM threads WHERE LOWER(threads.forum) = LOWER('${slug}') 
            ${desc === 'true' ?
                since ? ` AND threads.created <= '${since}'` : '' 
                :
                since ? ` AND threads.created >= '${since}'` : ''
            }
             ORDER BY threads.created ${desc ==='true' ? 'DESC' : 'ASC'} 
             ${limit ? ` LIMIT ${limit}` : ''}`
        ).catch(reason => console.log(reason));

        threads.forEach((item) => {
            item.id = +item.id;
            item.votes = +item.votes;
        });

        return [200, threads];
    }

    async getUsers(slug, since, limit, desc) {
        const forum = await this.dataBase.oneOrNone(
            this.checkForum(slug)
        ).catch(reason => console.log(reason));

        if (!forum) {
            return [404, {message: 'No forum found'}];
        }

        const users = await this.dataBase.manyOrNone(
            `SELECT nickname, fullname, about, email FROM users u
             JOIN usersForums t ON LOWER(u.nickname) = LOWER(t.author)
             WHERE LOWER(t.forum) = LOWER('${slug}') 
            ${desc === 'true' ?
                since ? ` AND LOWER(u.nickname) < LOWER('${since}')` : ''
                :
                since ? ` AND LOWER(u.nickname) > LOWER('${since}')` : ''
                }
             ORDER BY LOWER(u.nickname) ${desc ==='true' ? 'DESC' : 'ASC'} 
             ${limit ? ` LIMIT ${limit}` : ''}`
        ).catch(reason => console.log(reason));

        return [200, users];
    }
}



const forumService = new ForumService();
export default forumService;
