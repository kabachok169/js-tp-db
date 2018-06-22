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
        result.user = await this.dataBase.one('SELECT COUNT(*) FROM users;');
        result.forum = await this.dataBase.one('SELECT COUNT(*) FROM forum;');
        result.thread = await this.dataBase.one('SELECT COUNT(*) FROM threads;');
        result.post = await this.dataBase.one('SELECT COUNT(*) FROM posts;');

        return result;
    }
}



const serviceService = new ServiceService();
export default serviceService;