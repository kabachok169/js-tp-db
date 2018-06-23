import DataBaseService from './dbService';

class ThreadService extends DataBaseService {

    constructor() {
        super();

        this.queries = {
            find_by_id: "SELECT * FROM threads WHERE id = $1;",
            find_by_slug: "SELECT * FROM threads WHERE lower(slug) = lower($1);",
        };

        this.isID = val => +val;        
    }

    async getByIdOrSlug(slugOrId) {

        let query = this.queries.find_by_slug;
        if (this.isID(slugOrId)) {
            query = this.queries.find_by_id;
        }

        const thread = await this.dataBase.oneOrNone(query, slugOrId).catch(reason => console.log(reason));

        if (!thread) {
            return [404, {message: 'No thread found'}];
        }

        [thread.id, thread.votes] = [+thread.id, +thread.votes];

        return [200, thread];
    }

    async updateByIdOrSlug(slugOrId, updates) {

        let [status, thread] = await this.getByIdOrSlug(slugOrId);

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

       
        const updatedThread = await this.dataBase.oneOrNone(request).catch(reason => console.log(reason));
        [updatedThread.id, updatedThread.votes] = [+updatedThread.id, +updatedThread.votes];
        // console.log(thread);
        // console.log(updatedThread);

        return [200, updatedThread];
    }

    async vote(slugOrId, vote) {
        let query = this.queries.find_by_slug;
        if (this.isID(slugOrId)) {
            query = this.queries.find_by_id;
        }

        const author = await this.dataBase.oneOrNone(
            `SELECT nickname FROM users WHERE LOWER(nickname) = LOWER('${vote.nickname}')`
        ).catch(reason => console.log(reason));
        
        if (!author) {
            return [404, {message: 'No author found'}];
        }

        const thread = await this.dataBase.oneOrNone(query, slugOrId).catch(reason => console.log(reason));
        if (!thread) {
            return [404, {message: 'No thread found'}];
        }
               
        thread.id = +thread.id;

        const oldVote = await this.dataBase.oneOrNone(
            `SELECT * FROM votes WHERE votes.thread = ${thread.id} AND LOWER(votes.nickname) = LOWER('${author.nickname}') LIMIT 1;` 
        ).catch(reason => console.log(reason));

        if (!oldVote) {
            await this.dataBase.none(
                `INSERT INTO votes (voice, nickname, thread) VALUES (${vote.voice}, '${vote.nickname}', ${thread.id})`
            ).catch(reason => console.log(reason));

            const newThread = await this.updateVoteThread(thread.id, vote.voice);
            return [200, newThread];
        }

        const sum = oldVote.voice + vote.voice;

        // console.log('check votes...');

        if (sum === 2 || sum === -2) {
            thread.votes = +thread.votes; 
            return [200, thread];
        } else if (!sum) {
            await this.dataBase.none(
                `UPDATE votes SET voice=${vote.voice} 
                 WHERE votes.thread=${thread.id} AND LOWER(votes.nickname)=LOWER('${vote.nickname}');`
            ).catch(reason => console.log(reason));
            const newThread = await this.updateVoteThread(thread.id, 2 * vote.voice);
            return [200, newThread];
        } else {
            await this.dataBase.none(
                `UPDATE votes SET voice=${vote.voice} 
                 WHERE votes.thread=${thread.id} AND LOWER(votes.nickname)=LOWER('${vote.nickname}');`
            ).catch(reason => console.log(reason));
            const newThread = await this.updateVoteThread(thread.id, -vote.voice);
            return [200, newThread];
        }
    }

    async updateVoteThread(threadId, vote) {
        const newThread = await this.dataBase.one(
            `UPDATE threads SET votes=votes+${vote} WHERE threads.id=${threadId} RETURNING *;`
        ).catch(reason => console.log(reason));

        newThread.id = +newThread.id;
        newThread.votes = +newThread.votes;
        return newThread;
    }
}

const threadService = new ThreadService();
export default threadService;