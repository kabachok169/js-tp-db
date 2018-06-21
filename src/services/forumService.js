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
             VALUES ('${forum.slug}', '${forum.title}', '${forum.user}') 
             RETURNING *`
        ).catch(reason => console.log(reason));

        newForum.user = newForum.author;

        return [201, newForum]
    }

    async get(nickname) {
        const user = await this.dataBase.oneOrNone(
            `SELECT * FROM users WHERE LOWER(users.nickname) = LOWER('${nickname}');`
        );
        console.log(user);
        if (!user) {
            return [404, {message: 'No user found'}];
        }

        return [200, user];
    }

    async update(nickname, userData) {
        const user = await this.dataBase.one(
            `SELECT * from users WHERE LOWER(nickname) = LOWER('${nickname}');`
        ).catch(() => {return [404, {message:'User not found'}]});

        if (!Object.keys(userData).length) {
            return [200, user];
        }

        if (userData.email) {
            const conflictUser = await this.dataBase.oneOrNone(
                `SELECT * from users WHERE LOWER(email) = LOWER('${userData.email}');`
            );

            if (conflictUser) {
                return [409, {message: 'User with this email exists'}]
            }
        }

        const updatedUser = await this.dataBase.one(this.createUpdateRequest(nickname, userData))

        return [200, updatedUser];
    }

    createUpdateRequest(nickname, user) {
        console.log(user);
        let request = 'UPDATE users SET ';
        if (user.about) {
            request += `about='${user.about}', `;
        }
        if (user.email) {
            request += `email='${user.email}', `;
        }
        if (user.about) {
            request += `fullname='${user.fullname}',`;
        }
        request = request.substr(0, request.length - 1);
        request += ` WHERE LOWER(users.nickname) = LOWER('${nickname}') RETURNING *;`;
        console.log(request);
        return request;
    }
}

const forumService = new ForumService();
export default forumService;