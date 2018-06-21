import dataBase from '../config';

export default class DataBaseService {
  constructor() {
    this._query = '';
    this._dataBase = dataBase.controller;
    this._pgp = dataBase.pgp;
  }

  checkUser(nickname) {
    return `SELECT * FROM users WHERE LOWER(users.nickname) = LOWER('${nickname}');`;
  }

  checkForum(slug) {
    return `SELECT * FROM forum WHERE LOWER(slug) = LOWER('${slug}');`;
  }

  checkThread(slug) {
    return `'SELECT * FROM thread WHERE LOWER(thread.slug) = LOWER('${slug}');`;
  }

  get pgp() {
    return this._pgp;
  }

  get task() {
    return this.dataBase.task;
  }

  get transaction() {
    return this.dataBase.tx;
  }

  get dataBase() {
    return this._dataBase;
  }

  get query() {
    return this._query;
  }

  set query(string) {
    this._query = string;
  }
}