import mysql from 'mysql';
import * as util from 'util';

// setting up directly to .env
require('dotenv').config();

const configDb = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
}

const connection = ()=>{
    const pool = mysql.createPool(configDb);
    pool.query = util.promisify(pool.query);
    return pool;
}

const testConnect = async() => {
    const status = await connection().query('SELECT 1 + 1 AS solution')
    .then(() => 'Database connected')
    .catch(() => 'Database disconnected');
    return status;
}

const query = async(text) => {
const rows = await connection()
    .query(text)
    .catch(err => console.log(err));
    return rows;
}

const insertRow = async(tableField, tableValue, response) => {
    try{
        const baseSql = `INSERT INTO ${tableField} SET ?`
        const rows = await connection().query(baseSql, tableValue);
        return rows;
    }catch(err){
        return response.status(500).send(err);
    }
}

const updateRow = async(tableField, tableValue, condition, response) => {
    try{
        const baseSql = `UPDATE ${tableField} SET ? WHERE ?`
        const rows = await connection().query(baseSql, [tableValue, condition]);
        return rows;
    }catch(err){
        return response.status(500).send(err);
    }
}

export { connection, testConnect, query, insertRow, updateRow };
