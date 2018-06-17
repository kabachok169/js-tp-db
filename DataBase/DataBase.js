const pgp = require('pg-promise');

export default class DataBase {
    constructor(options, connection) {
        this._dataBaseController = pgp(connection);
    }

    get controller() {
        return this._dataBaseController;
    }
}