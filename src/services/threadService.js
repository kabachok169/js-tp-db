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

        // let [status, thread] = this.getByIdOrSlug(slugOrId)

        // if (status === 404) {
        //     return [status, thread]
        // }

        // let request = `UPDATE threads SET 
        //                     ${user.about ? `about='${user.about}',` : ''} 
        //                     ${user.email ? `email='${user.email}',` : ''}
        //                     ${user.fullname ? `fullname='${user.fullname}',` : ''}`;

        // // console.log(request)
        // // console.log(request.lastIndexOf(','))
        // request = request.substr(0, request.lastIndexOf(','));
        // // console.log(request)
        // request += ` WHERE id = ${} RETURNING *;`;
        // // console.log(request);
        // return request;


        return [200, thread];
    }

    async createPosts(slugOrId, posts, date) {
        let query = this.queries.find_by_slug;
        if (this.isID(slugOrId)) {
            query = this.queries.find_by_id;
        }

        const thread = await this.dataBase.oneOrNone(query, slugOrId);

        if (!thread) {
            return [404, {message: 'No thread found'}];
        }

        posts.forEach((item) => {
            if (item.parent === undefined) {
                item.parent = 0;
                item.path = [];
            }
            item.created = date;
        })

        
    }
}


const threadService = new ThreadService();
export default threadService;