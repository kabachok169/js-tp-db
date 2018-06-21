import DataBaseService from './dbService';

class ThreadService extends DataBaseService {

    constructor() {
        super();

        this.queries = {
            find_by_id: "SELECT * FROM threads WHERE id = $1;",
            find_by_slug: "SELECT * FROM threads WHERE lower(slug) = lower($1);",
        }
    }

    async getByIdOrSlug(slugOrId) {

        if (isNumeric(slugOrId)) {
            query = this.queries.find_by_id;
        } else {
            query = this.queries.find_by_slug;
        }

        const thread = await this.dataBase.oneOrNone(query, slugOrId);

        console.log(thread);

        if (!thread) {
            return null;
        }

        return thread;
    }
}


const threadService = new ThreadService();
export default threadService;