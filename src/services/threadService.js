import DataBaseService from './dbService';

class ThreadService extends DataBaseService {

    constructor() {
        super();

        this.queries = {
            find_by_id: "SELECT * FROM threads WHERE id = $1;",
            find_by_slug: "SELECT * FROM threads WHERE lower(slug) = lower($1);",
        }

        this.isID = val => +val;        
    }

    async getByIdOrSlug(slugOrId) {

        let query = this.queries.find_by_slug;
        if (this.isID(slugOrId)) {
            query = this.queries.find_by_id;
        }

        const thread = await this.dataBase.oneOrNone(query, slugOrId);

        console.log(thread);

        if (!thread) {
            return [404, {message: 'No thread found'}];
        }

        [thread.id, thread.votes] = [+thread.id, +thread.votes];

        return [200, thread];
    }

    async updateByIdOrSlug(slugOrId, updates) {

        let [status, thread] = await this.getByIdOrSlug(slugOrId)

        if (status === 404) {
            return [status, thread];
        }

        if (!Object.keys(updates).length) {
            return [200, thread];
        }

        let request = `UPDATE threads SET 
                            ${updates.message ? `message='${updates.message}',` : ''} 
                            ${updates.title ? `title='${updates.title}',` : ''}`;

      
        request = request.substr(0, request.lastIndexOf(',')) + ` WHERE id = ${thread.id} RETURNING *;`;

       
        const updatedThread = await this.dataBase.oneOrNone(request);
        [updatedThread.id, updatedThread.votes] = [+updatedThread.id, +updatedThread.votes];
        console.log(thread);
        console.log(updatedThread);

        return [200, updatedThread];
    }


}


const threadService = new ThreadService();
export default threadService;