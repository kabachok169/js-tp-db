const pgp = require('pg-promise');


export default class DataBase {

    constructor(options, connection) {
        this._pgp = pgp(options);
        this._controller = this._pgp(connection);
    }

    get controller() {
        return this._controller;
    }

    get pgp() {
        return this._pgp;
    }
}