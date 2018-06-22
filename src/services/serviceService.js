import DataBaseService from './dbService';

class ServiceService extends DataBaseService {

    constructor() {
        super();
    }

    async clear() {
        await this.dataBase.none('TRUNCATE TABLE users, forum, threads, posts, votes, usersForums');
    }

    async get() {
        const result = {};

        const user = await this.dataBase.one('SELECT COUNT(*) FROM users;');
        result.user = +user.count;

        const forum = await this.dataBase.one('SELECT COUNT(*) FROM forum;');
        result.forum = +forum.count;

        const thread = await this.dataBase.one('SELECT COUNT(*) FROM threads;');
        result.thread = +thread.count;

        const post = await this.dataBase.one('SELECT COUNT(*) FROM posts;');
        result.post = +post.count;

        console.log(result);
        return result;
    }
}



const serviceService = new ServiceService();
export default serviceService;