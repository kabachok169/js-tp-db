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

        // console.log(thread);

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
        // console.log(thread);
        // console.log(updatedThread);

        return [200, updatedThread];
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

    async vote(slugOrId, vote) {
        let query = this.queries.find_by_slug;
        if (this.isID(slugOrId)) {
            query = this.queries.find_by_id;
        }

        const thread = await this.dataBase.oneOrNone(query, slugOrId);
        thread.id = +thread.id;

        console.log('got thread');

        if (!thread) {
            return [404, {message: 'No thread found'}];
        }

        const oldVote = await this.dataBase.oneOrNone(
            `SELECT * FROM votes
             WHERE votes.thread=${thread.id} AND votes.nickname='${vote.nickname}' LIMIT 1;`
        );

        if (!oldVote) {
            await this.dataBase.none(
                `INSERT INTO votes (voice, nickname, thread) VALUES (${vote.voice}, '${vote.nickname}', ${thread.id})`
            );

            const newThread = await this.updateVoteThread(thread.id, vote.voice);
            return [200, newThread];
        }

        const sum = oldVote.voice + vote.voice;

        console.log('check votes...');

        if (sum === 2 || sum === -2) {
            return [200, thread];
        } else if (!sum) {
            await this.dataBase.none(
                `UPDATE votes SET voice=${vote.voice} 
                 WHERE votes.thread=${thread.id} AND votes.nickname='${vote.nickname}';`
            );
            const newThread = await this.updateVoteThread(thread.id, 2 * vote.voice);
            return [200, newThread];
        } else {
            await this.dataBase.none(
                `UPDATE votes SET voice=${vote.voice} 
                 WHERE votes.thread=${thread.id} AND votes.nickname='${vote.nickname}';`
            );
            const newThread = await this.updateVoteThread(thread.id, -vote.voice);
            return [200, newThread];
        }
    }

    async updateVoteThread(threadId, vote) {
        const newThread = await this.dataBase.one(
            `UPDATE threads SET votes=votes+${vote} WHERE threads.id=${threadId} RETURNING *;`
        );

        newThread.id = +newThread.id;
        newThread.votes = +newThread.votes;
        return newThread;
    }
}

const threadService = new ThreadService();
export default threadService;