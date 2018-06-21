import DataBaseService from './dbService';

class ForumService extends DataBaseService {

    constructor() {
        super();
    }

    async create(forum) {
        const user = await this.dataBase.oneOrNone(
            `SELECT * FROM users WHERE LOWER(users.nickname) = LOWER('${forum.user}');`
        );

        if (!user) {
            return [404, {message: 'User not found'}];
        }

        const conflict = await this.dataBase.oneOrNone(
            `SELECT * from forum WHERE LOWER(slug) = LOWER('${forum.slug}');`
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
            `SELECT * FROM forum WHERE LOWER(slug) = LOWER('${slug}');`
        );
        console.log(forum);
        if (!forum) {
            return [404, {message: 'No user found'}];
        }

        forum.user = forum.author;
        return [200, forum];
    }

    async createThread(slug, thread) {
        const user = await this.dataBase.oneOrNone(
            `SELECT * FROM users WHERE LOWER(users.nickname) = LOWER('${thread.author}');`
        );
        const forum = await this.dataBase.oneOrNone(
            `SELECT * FROM forum WHERE LOWER(slug) = LOWER('${slug}');`
        );

        if (!forum || !user) {
            return [404, {message: 'No forum found'}];
        }

        await this.dataBase.oneOrNone(
            `INSERT INTO usersForums (author, forum) 
             SELECT '{author}', '{forum}' 
             WHERE NOT EXISTS 
             (SELECT forum FROM usersForums
             WHERE LOWER(author) = LOWER('${thread.author}') AND forum = '${slug}')`
        );

        let isSlug = '';
        let threadSlug = null;

        if (thread.slug) {
            isSlug = ', slug';
            threadSlug = thread.slug;
            const thread = await this.dataBase.oneOrNone(this.checkThread);
            if (thread) {
                return [409, thread];
            }
        }

        const newThread = await this.dataBase.one(
            `INSERT INTO thread (created, message, title, author, forum${isSlug})
             VALUES ('${thread.created}', '${thread.message}', '${thread.title}',
             '${user.nickname}', '${slug}'${threadSlug}) RETURNING *;`
        );

        return [201, newThread];

    }
}

const forumService = new ForumService();
export default forumService;