import DataBaseService from './dbService';

class UserService extends DataBaseService {

    constructor() {
        super();
    }
  
    async create(nickname, user) {

        const conflicts = await this.dataBase.manyOrNone(
            `SELECT * from users WHERE LOWER(nickname) = LOWER('${nickname}') OR LOWER(email) = LOWER('${user.email}');`
        ).catch(reason => console.log(reason));

        if (conflicts.length !== 0) {
            if (conflicts.length === 2 && conflicts[0].nickname === conflicts[1].nickname) {
                conflicts.pop();
            }

            return [null, conflicts]
        }
        console.log(1);

        const newUser = await this.dataBase.one(
            `INSERT INTO users (nickname, email, fullname, about)
             VALUES ('${nickname}', '${user.email}', '${user.fullname}', '${user.about}') 
             RETURNING *`
        ).catch(reason => console.log(reason));

        return [newUser, null]
    }
}

const userService = new UserService();
export default userService;