import DataBase from './DataBase/DataBase';

const dataBase = new DataBase(
    {}, 
    {
        user: process.env.DB_USER || 'docker',
        database: process.env.DB_NAME || 'forum_db',
        password:  process.env.DB_PASSWORD || 'docker',
        host: '127.0.0.1',
        port: 5432
    }
);

export default dataBase;